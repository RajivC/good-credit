// components/UploadFile.tsx
import { useState } from 'react'
import { ethers } from 'ethers'
import DocumentRegistryArtifact from '../abis/DocumentRegistry.json'
import { getPublicKey, encryptData } from '../lib/encryption'
import { uploadToPinata } from '../lib/pinata'

const ABI = DocumentRegistryArtifact.abi

export function UploadFile({
  onSuccess,
}: {
  onSuccess?: () => void
}) {
  const [cid, setCid]       = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [file, setFile]     = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleUpload() {
    if (!file) {
      alert('Please select a file first')
      return
    }
    setLoading(true)

    try {
      // 1) Contract address
      const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
      if (!address) throw new Error('Missing CONTRACT_ADDRESS')

      // 2) Network check
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== '0xaa36a7') {
        throw new Error('Switch MetaMask to Sepolia')
      }

      // 3) Encrypt payload
      const publicKey = await getPublicKey()
      const rawText   = new TextDecoder().decode(await file.arrayBuffer())
      const payload   = encryptData(publicKey, rawText)

      // 4) Pin to IPFS
      const encryptedFile = new File(
        [new Blob([payload], { type: 'application/octet-stream' })],
        `${file.name}`,
        { type: 'application/octet-stream' }
      )
      const newCid = await uploadToPinata(encryptedFile)
      console.log('[UploadFile] new CID:', newCid)
      setCid(newCid)
      localStorage.setItem(newCid, encryptedFile.name)

      // 5) Write on-chain
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const signer   = await provider.getSigner()
      const contract = new ethers.Contract(address, ABI, signer)

      const tx = await contract.registerUsername(newCid)
      console.log('[UploadFile] tx response:', tx)
      setTxHash(tx.hash)

      const receipt = await tx.wait()
      console.log('[UploadFile] tx receipt:', receipt)

      onSuccess?.()
    } catch (err: any) {
      console.error('UploadFile error:', err)
      alert(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="upload" className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Encrypt & Register File
      </h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full mb-4"
      />
      <button
        disabled={loading}
        onClick={handleUpload}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Processing…' : 'Encrypt & Register'}
      </button>
      {cid && (
        <p className="mt-4 break-all">
          <strong>📌 Pinned! CID Created</strong>
        </p>
      )}
      {txHash && (
        <p className="mt-2 break-all text-blue-600">
          <strong>TxHash:</strong>{' '}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {txHash}
          </a>
        </p>
      )}
    </div>
  )
}