// components/UploadFile.tsx
'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { uploadToPinata } from '../lib/pinata';
import { registerOnChain } from '../lib/registry';

export default function UploadFile() {
  const [file,    setFile]    = useState<File | null>(null);
  const [cid,     setCid]     = useState<string | null>(null);
  const [txHash,  setTxHash]  = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCid(null);
    setTxHash(null);
    setFile(e.target.files?.[0] ?? null);
  }

  async function onUpload() {
    if (!file) {
      alert('Please select a file first.');
      return;
    }
    if (!window.ethereum) {
      alert('MetaMask not detected. Please install it first.');
      return;
    }

    setLoading(true);
    try {
      // 1) Pin the file to IPFS via Pinata
      const newCid = await uploadToPinata(file);
      setCid(newCid);

      // 2) Get a signer from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer   = await provider.getSigner();

      // 3) Register on-chain
      const tx = await registerOnChain(signer, newCid);
      setTxHash(tx);
    } catch (err: any) {
      console.error(err);
      alert(`Upload/Register failed:\n${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-4">
      <h3 className="text-xl font-semibold">Upload & Register Document</h3>

      <input
        type="file"
        onChange={onFileChange}
        className="
          block w-full mb-2 text-gray-600
          file:py-2 file:px-4 file:rounded file:border-0
          file:text-sm file:font-medium
          file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100
        "
      />

      <button
        onClick={onUpload}
        disabled={!file || loading}
        className={`
          w-full py-2 text-white font-medium rounded-lg transition
          ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
        `}
      >
        {loading ? 'Processing…' : 'Upload & Register'}
      </button>

      {cid && (
        <p className="break-all text-sm text-gray-700">
          📌 IPFS CID: <code>{cid}</code>
        </p>
      )}
      {txHash && (
        <p className="break-all text-sm text-gray-700">
          🔗 Tx Hash: <code>{txHash}</code>
        </p>
      )}
    </div>
  );
}