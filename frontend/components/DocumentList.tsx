// components/DocumentList.tsx
import { useEffect, useState, useCallback } from 'react'
import { ethers } from 'ethers'
import DocumentRegistryArtifact from '../abis/DocumentRegistry.json'

interface Doc {
  cid: string
  name: string
  date: string
}

const ABI = DocumentRegistryArtifact.abi
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
const IPFS_GATEWAY     = 'https://gateway.pinata.cloud/ipfs/'
const PINATA_API       = 'https://api.pinata.cloud/data/pinList?hashContains='

export function DocumentList({ refreshKey }: { refreshKey?: number }) {
  const [docs, setDocs]       = useState<Doc[]>([])
  const [error, setError]     = useState<string|null>(null)
  const [loading, setLoading] = useState(false)

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

      const out: Doc[] = await Promise.all(events.map(async (ev) => {
        const cid = ev.args!.cid as string
        const ts  = Number(ev.args!.timestamp)
        const date = new Date(ts * 1000).toLocaleString()

        let name = cid.slice(0,8) + '…'
        try {
          const metaResp = await fetch(PINATA_API + cid, {
            headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}` }
          })
          const metaJson = await metaResp.json()
          name = metaJson.rows?.[0]?.metadata?.name || name
        } catch {}

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

  // decrypt & trigger download
  async function handleDownload(cid: string, filename: string) {
    try {
      // 1) Fetch encrypted Base64 JSON from IPFS
      const res    = await fetch(`${IPFS_GATEWAY}${cid}`)
      const base64 = await res.text()
      const encryptedJson = atob(base64)

      // 2) Prompt decrypt via MetaMask
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const decryptedBase64: string = await window.ethereum.request({
        method: 'eth_decrypt',
        params: [encryptedJson, account],
      })

      // 3) Rebuild PDF Blob
      const binary = atob(decryptedBase64)
      const bytes  = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'application/pdf' })

      // 4) Programmatic download
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (e: any) {
      console.error('Download error:', e)
      alert(e.message || 'Failed to decrypt & download')
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto p-6 text-center">Loading…</div>
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-8">
      <h3 className="text-xl font-semibold mb-4">Your Documents</h3>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {docs.length === 0 && !error ? (
        <p className="text-gray-500">No documents uploaded yet.</p>
      ) : (
        <ul className="space-y-3">
          {docs.map(({ cid, name, date }) => (
            <li key={cid} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-gray-600">{date}</p>
              </div>
              <button
                onClick={() => handleDownload(cid, name)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}