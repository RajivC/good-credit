import type { NextPage } from 'next';
import Head from 'next/head';
import { ConnectWallet } from '../components/ConnectWallet';
import { UploadFile } from '../components/UploadFile';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50">
      <Head>
        <title>Legal Document DApp</title>
      </Head>
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-3xl mx-auto py-4 px-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Legal Document Management
          </h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto py-10 space-y-10">
        <ConnectWallet />
        <UploadFile />
      </main>

      <footer className="w-full py-4 bg-white text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Blockchain Legal DApp
      </footer>
    </div>
  );
};

export default Home;