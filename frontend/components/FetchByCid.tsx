// frontend/components/FetchByCid.tsx
'use client';

import { useState } from 'react';

export default function FetchByCid() {
  const [cid, setCid]     = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    if (!cid.trim()) {
      return alert('Please enter a CID');
    }
    setLoading(true);

    try {
      // 1) Fetch the raw bytes from IPFS gateway
      const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const blob = await res.blob();

      // 2) Trigger download in browser
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href    = url;
      // Use the CID as filename by default
      a.download = cid;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to fetch: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-lg font-semibold">Fetch Document by CID</h2>
      <input
        type="text"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
        placeholder="Enter IPFS CID (e.g. Qm…)"
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
      />
      <button
        onClick={handleFetch}
        disabled={loading}
        className={`w-full py-2 text-white rounded ${
          loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Downloading…' : 'Download Document'}
      </button>
    </div>
  );
}