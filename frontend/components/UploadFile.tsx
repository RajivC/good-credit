import { useState } from 'react'
import { ethers } from 'ethers'
import DocumentRegistryArtifact from '../abis/DocumentRegistry.json'
import { getPublicKey, encryptData } from '../lib/encryption'
import { uploadToPinata } from '../lib/pinata'

const ABI = DocumentRegistryArtifact.abi

export function UploadFile() {
  const [cid, setCid] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleUpload() {
    if (!file) {
      alert('Please select a file first')
      return
    }
    setLoading(true)

    try {
      // 1) Validate contract address
      const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
      if (!address) {
        throw new Error('Missing NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local')
      }

      // 2) Ensure Sepolia network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== '0xaa36a7') {
        throw new Error('Please switch MetaMask to Sepolia')
      }

      // 3) Fetch public key and encrypt file contents
      const publicKey = await getPublicKey()
      const rawBuffer = await file.arrayBuffer()
      const rawText = new TextDecoder().decode(rawBuffer)
      const encryptedPayload = encryptData(publicKey, rawText)

      // 4) Wrap payload in a Blob and upload via uploadToPinata
      const blob = new Blob([encryptedPayload], { type: 'application/octet-stream' })
      const encryptedFile = new File([blob], file.name + '.enc', {
        type: 'application/octet-stream',
      })
      const newCid = await uploadToPinata(encryptedFile)
      setCid(newCid)

      // 5) Register the CID on‑chain
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(address, ABI, signer)

      const tx = await contract.registerUsername(newCid)
      const receipt = await tx.wait()
      setTxHash(receipt.transactionHash)

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
          <strong>CID:</strong> {cid}
        </p>
      )}
      {txHash && (
        <p className="mt-2 break-all text-blue-600">
          <strong>TxHash:</strong> {txHash}
        </p>
      )}
    </div>
  )
}