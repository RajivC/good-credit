import { useState } from 'react';
import { create } from 'ipfs-http-client';

const projectId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID!;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET!;
const auth =
  'Basic ' + Buffer.from(`${projectId}:${projectSecret}`).toString('base64');

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: { authorization: auth },
});

export function UploadFile() {
  const [cid, setCid] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) {
      alert('Please select a file first');
      return;
    }
    setLoading(true);
    try {
      const added = await ipfs.add(file);
      setCid(added.cid.toString());
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Upload & Store File</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-gray-500
                   file:py-2 file:px-4 file:rounded file:border-0
                   file:text-sm file:font-medium file:bg-blue-50
                   file:text-blue-700 hover:file:bg-blue-100 mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className={`w-full py-2 text-white font-medium rounded-md transition 
          ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {loading ? 'Uploading...' : 'Upload File'}
      </button>
      {cid && (
        <p className="mt-4 text-sm text-gray-600 break-all">
          <span className="font-semibold">IPFS CID:</span> {cid}
        </p>
      )}
    </div>
  );
}