// components/DocumentList.tsx
import { useEffect, useState, useCallback } from 'react'
import { ethers } from 'ethers'
import DocumentRegistryArtifact from '../abis/DocumentRegistry.json'

const ABI = DocumentRegistryArtifact.abi
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
const IPFS_GATEWAY    = 'https://gateway.pinata.cloud/ipfs/'

export function DocumentList({ refreshKey }: { refreshKey?: number }) {
  const [cids, setCids]       = useState<string[]>([])
  const [error, setError]     = useState<string|null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not detected')
      }

      // Don’t prompt again—just check if already connected
      const accounts: string[] = await window.ethereum.request({
        method: 'eth_accounts',
      })
      if (accounts.length === 0) {
        throw new Error('Please connect your wallet first')
      }

      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const signer   = await provider.getSigner()
      const { chainId } = await provider.getNetwork()

      // Provider returns BigInt, cast to number
      if (Number(chainId) !== 11155111) {
        throw new Error('Please switch MetaMask to Sepolia')
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
      const list: string[] = await contract.getUsername()
      console.log('[DocumentList] on‑chain CIDs:', list)
      setCids(list)
    } catch (e: any) {
      console.error('[DocumentList] load error:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [refreshKey])

  useEffect(() => {
    load()
  }, [load])

  async function handleView(cid: string) {
    try {
      // 1) Fetch the encrypted payload (Base64 JSON)
      const res = await fetch(IPFS_GATEWAY + cid)
      const text = await res.text()

      // 2) atob → JSON object
      const encryptedJson = JSON.stringify(JSON.parse(atob(text)))

      // 3) decrypt without extra prompt
      const [account] = await window.ethereum.request({
        method: 'eth_accounts',
      })
      const decryptedBase64: string = await window.ethereum.request({
        method: 'eth_decrypt',
        params: [encryptedJson, account],
      })

      // 4) atob → Uint8Array → PDF Blob
      const binary = atob(decryptedBase64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'application/pdf' })
      window.open(URL.createObjectURL(blob), '_blank')
    } catch (err: any) {
      console.error('[DocumentList] decrypt error:', err)
      alert(err.message || 'Failed to decrypt & view')
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        Loading…
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-8">
      <h3 className="text-xl font-semibold mb-4">Your Documents</h3>

      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      {!error && cids.length === 0 ? (
        <p className="text-gray-500">No documents uploaded yet.</p>
      ) : (
        <ul className="list-disc list-inside">
          {cids.map((cid) => (
            <li key={cid} className="mb-4 flex items-center">
              <a
                href={IPFS_GATEWAY + cid}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex-1"
              >
                {cid}
              </a>
              <button
                onClick={() => handleView(cid)}
                className="ml-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Decrypt & View
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}