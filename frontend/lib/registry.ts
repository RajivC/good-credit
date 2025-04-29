import { ethers } from "ethers";
import DocumentRegistryABI from './DocumentRegistry.json';

const address = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS!;
export function getRegistryContract(signer: ethers.Signer) {
  return new ethers.Contract(address, DocumentRegistryABI.abi, signer);
}

export async function registerOnChain(signer: ethers.Signer, cid: string) {
  const contract = getRegistryContract(signer);
  const tx = await contract.registerDocument(cid);
  await tx.wait();
  return tx.hash;
}