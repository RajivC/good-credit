import { useEffect, useState, useCallback } from 'react'
import { ethers } from 'ethers'
import DocumentRegistryArtifact from '../abis/DocumentRegistry.json'

interface Doc {
  cid: string
  name: string
  date: string
}

const ABI                = DocumentRegistryArtifact.abi
const CONTRACT_ADDRESS   = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
const IPFS_GATEWAYS      = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
]
const PINATA_API         = 'https://api.pinata.cloud/data/pinList?hashContains='

export function DocumentList({ refreshKey }: { refreshKey?: number }) {
  const [docs, setDocs]             = useState<Doc[]>([])
  const [error, setError]           = useState<string | null>(null)
  const [loading, setLoading]       = useState(false)
  const [activeCid, setActiveCid]   = useState<string | null>(null)
  const [encryptedJson, setEncryptedJson] = useState<string>('')
  const [readyToDecrypt, setReadyToDecrypt] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' })
      if (!accounts.length) throw new Error('Connect your wallet first')

      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const signer   = await provider.getSigner()
      const { chainId } = await provider.getNetwork()
      if (Number(chainId) !== 11155111) throw new Error('Switch MetaMask to Sepolia')

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
      const filter   = contract.filters.DocumentRegistered(accounts[0], null, null)
      const events   = await contract.queryFilter(filter)

      const out: Doc[] = await Promise.all(events.map(async ev => {
        const cid  = ev.args!.cid as string
        const ts   = Number(ev.args!.timestamp)
        const date = new Date(ts * 1000).toLocaleString()

        let name = cid.slice(0,8) + '…'
        try {
          const metaResp = await fetch(PINATA_API + cid, {
            headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}` },
          })
          const metaJson = await metaResp.json()
          name = metaJson.rows?.[0]?.metadata?.name || name
        } catch {
          /* ignore */
        }

        return { cid, name, date }
      }))

      setDocs(out)
    } catch (e: any) {
      console.error('DocumentList load error:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [refreshKey])

  useEffect(() => { load() }, [load])

  async function showPayload(cid: string) {
    setActiveCid(cid)
    setReadyToDecrypt(false)
    let base64 = ''
    for (const gw of IPFS_GATEWAYS) {
      try {
        const res = await fetch(`${gw}${cid}`)
        if (res.ok) {
          base64 = await res.text()
          break
        }
      } catch {}
    }
    if (!base64) {
      alert('Unable to fetch encrypted payload')
      return
    }
    setEncryptedJson(atob(base64))
  }

  function onScroll(e: React.UIEvent<HTMLTextAreaElement>) {
    const t = e.currentTarget
    if (t.scrollTop + t.clientHeight >= t.scrollHeight) {
      setReadyToDecrypt(true)
    }
  }

  async function decryptAndDownload(encodedFilename: string) {
    if (!activeCid) return

    try {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      console.log('[DocumentList] decrypting for account:', account)

      // re encode the JSON blob into hex
      const encoder    = new TextEncoder()
      const msgBytes   = encoder.encode(encryptedJson)
      const hexMessage = '0x' + Array.from(msgBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      console.log('[DocumentList] hexMessage (first 50 chars):', hexMessage.slice(0,50))

      // ask MetaMask to decrypt
      const decryptedStr: string = await window.ethereum.request({
        method: 'eth_decrypt',
        params: [hexMessage, account],
      })
      console.log('[DocumentList] decryptedStr starts:', decryptedStr.slice(0,10))

      const pdfBytes = new Uint8Array(decryptedStr.length)
      for (let i = 0; i < decryptedStr.length; i++) {
        pdfBytes[i] = decryptedStr.charCodeAt(i)
      }
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const downloadName = encodedFilename.replace(/\.enc$/i, '')
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = downloadName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setActiveCid(null)
    } catch (e: any) {
      console.error('Decrypt/download error:', e)
      alert(e.message || 'Failed to decrypt & download')
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto p-6 text-center">Loading…</div>
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-8 space-y-6">
      <h3 className="text-xl font-semibold">Your Documents</h3>
      {error && <p className="text-red-600">{error}</p>}
      {!error && docs.length === 0 && (
        <p className="text-gray-500">No documents uploaded yet.</p>
      )}

      {docs.map(({ cid, name, date }) => (
        <div key={cid} className="flex justify-between items-center">
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-gray-600">{date}</p>
          </div>
          <button
            onClick={() => showPayload(cid)}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Show Payload
          </button>
        </div>
      ))}

      {activeCid && (
        <div className="p-4 border rounded bg-gray-50 space-y-3">
          <p className="font-medium">Encrypted JSON for {activeCid}</p>
          <textarea
            className="w-full h-40 p-2 border rounded resize-none"
            value={encryptedJson}
            readOnly
            onScroll={onScroll}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setActiveCid(null)}
              className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              disabled={!readyToDecrypt}
              onClick={() => decryptAndDownload(
                docs.find(d => d.cid === activeCid)!.name
              )}
              className={`px-4 py-1 rounded text-white transition ${
                readyToDecrypt 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Decrypt & Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}