// pages/index.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { Hero } from '../components/Hero';
import { ConnectWallet } from '../components/ConnectWallet';
import { UploadFile } from '../components/UploadFile';
import { DocumentList } from '../components/DocumentList';
import { Contact } from '../components/Contact';

const Home: NextPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-10">
      <Head>
        <title>Financial Statements DApp</title>
      </Head>

      {/* Header or Navbar */}
      <header className="w-full max-w-3xl mx-auto mb-8">
        {/* Optional branding / nav goes here */}
      </header>

      {/* Hero section with bottom margin */}
      <div className="w-full max-w-3xl mx-auto mb-12">
        <Hero />
      </div>

      {/* Main actions section */}
      <main className="w-full max-w-3xl mx-auto space-y-10">
        <ConnectWallet />
        <UploadFile onSuccess={() => setRefreshKey((k) => k + 1)} />
        <DocumentList refreshKey={refreshKey} />
        <Contact />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Blockchain Financial Statements DApp (Developed By: Rajiv Chatterjee, Wei Zhu, Yu Chen, Sky Evans, Ritvik Yeduru)
      </footer>
    </div>
  );
};

export default Home;