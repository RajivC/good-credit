import { useState } from 'react';
import { ethers } from 'ethers';

export function ConnectWallet() {
  const [address, setAddress] = useState<string | null>(null);

  async function connect() {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAddress(addr);
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
      {address ? (
        <p className="text-green-600 break-all">Connected: {address}</p>
      ) : (
        <button
          onClick={connect}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}