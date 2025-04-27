import { useState } from 'react';
import { uploadToPinata } from '../lib/pinata';

/**
 * UploadFile component:
 * - Allows user to select a File
 * - Posts it to Pinata via uploadToPinata()
 * - Displays resulting CID or error
 */
export function UploadFile() {
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCid(null);
    setFile(e.target.files?.[0] ?? null);
  };

  const onUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }
    setLoading(true);
    try {
      const newCid = await uploadToPinata(file);
      setCid(newCid);
    } catch (err: any) {
      console.error('Pinata upload error:', err);
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow space-y-4">
      <h3 className="text-lg font-medium">Upload & Pin Document</h3>

      <input
        type="file"
        onChange={onFileChange}
        className="block w-full mb-2 text-gray-700
                   file:py-2 file:px-4 file:rounded file:border-0
                   file:text-sm file:font-semibold
                   file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
      />

      <button
        onClick={onUpload}
        disabled={!file || loading}
        className={`w-full py-2 text-white font-semibold rounded-lg transition
          ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        {loading ? 'Pinning to IPFS…' : 'Pin to IPFS via Pinata'}
      </button>

      {cid && (
        <p className="break-all text-sm text-gray-700">
          📌 Pinned! CID: <code>{cid}</code>
        </p>
      )}
    </div>
  );
}
