import React from 'react';

export function Hero() {
  return (
    <section className="w-full max-w-3xl mx-auto bg-white text-gray-900 py-12 px-6 rounded-lg shadow-md">
      <h1
        className="text-4xl font-extrabold mb-4 text-center"
        style={{ animation: 'textColorCycle 8s ease-in-out infinite' }}
      >
        Secure Financial Statements Management
      </h1>
      <p className="text-lg mb-6 text-center">
        Quickly upload, encrypt, and verify your legal contracts and wills on-chain.
        We leverage MetaMask for identity, AES-GCM for encryption, and IPFS for storage.
      </p>
      <div className="flex justify-center">
        <a
          href="#upload"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
        >
          Get Started
        </a>
      </div>
    </section>
  );
}