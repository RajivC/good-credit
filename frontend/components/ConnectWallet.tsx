import { useState } from 'react';
import { ethers } from 'ethers';

export function ConnectWallet() {
  const [address, setAddress] = useState<string | null>(null);
  async function connect() {
    if (!window.ethereum) return alert('Install MetaMask');
    const prov = new ethers.BrowserProvider(window.ethereum as any);
    await prov.send('eth_requestAccounts', []);
    const signer = await prov.getSigner();
    setAddress(await signer.getAddress());
  }
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Connect Your Wallet
      </h2>
      <button
        onClick={connect}
        className="w-full py-2 bg-blue-600 text-white rounded"
      >
        {address ? `Connected: ${address}` : 'Connect MetaMask'}
      </button>
    </div>
  );
}