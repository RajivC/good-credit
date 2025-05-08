// lib/encryption.ts

import { encrypt as ethEncrypt } from '@metamask/eth-sig-util';

/**
 * Fetch the user’s public encryption key via MetaMask
 */
export async function getPublicKey(): Promise<string> {
  const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return window.ethereum.request({
    method: 'eth_getEncryptionPublicKey',
    params: [address],
  });
}

/**
 * Encrypt UTF-8 string under the user’s public key.
 * Returns Base64‑encoded JSON payload.
 */
export function encryptData(publicKey: string, data: string): string {
  const encrypted = ethEncrypt({
    publicKey,
    data,
    version: 'x25519-xsalsa20-poly1305',
  });
  // Convert encrypted object to a JSON string, then Base64 encode it
  const json = JSON.stringify(encrypted);
  return window.btoa(json);
}