// components/DocumentList.tsx
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import DocumentRegistryArtifact from '../abis/DocumentRegistry.json';

const ABI = DocumentRegistryArtifact.abi;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

export function DocumentList() {
  const [cids, setCids] = useState<string[]>([]);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        if (!window.ethereum) throw new Error('MetaMask not found');
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();

        const network = await provider.getNetwork();
        if (network.chainId !== BigInt(11155111))
          throw new Error('Switch MetaMask to Sepolia');

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        const list: string[] = await contract.getUsername();
        setCids(list);
      } catch (e: any) {
        console.error(e);
        setError(e.message);
      }
    }

    load();
    window.ethereum?.on('accountsChanged', load);
    window.ethereum?.on('chainChanged', load);
    return () => {
      window.ethereum?.removeListener('accountsChanged', load);
      window.ethereum?.removeListener('chainChanged', load);
    };
  }, []);

  async function handleView(cid: string) {
    
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-8">
      <h3 className="text-xl font-semibold mb-4">Your Documents</h3>
      {error && <p className="text-red-600">{error}</p>}
      {!error && cids.length === 0 && (
        <p className="text-gray-500">No documents uploaded yet.</p>
      )}
      {cids.length > 0 && (
        <ul className="list-disc list-inside">
          {cids.map((cid) => (
            <li key={cid} className="mb-2 flex items-center">
              <a
                href={IPFS_GATEWAY + cid}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline mr-4 flex-1"
              >
                {cid}
              </a>
              <button
                onClick={() => handleView(cid)}
                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Decrypt & View
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}