/**
 * Upload a browser File or Blob to Pinata’s IPFS API using a JWT.
 * Requires NEXT_PUBLIC_PINATA_JWT in .env.local.
 */
export async function uploadToPinata(file: File | Blob): Promise<string> {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
  const body = new FormData()
  // If it's a Blob, give it a filename so Pinata preserves content type
  if (file instanceof Blob && !(file instanceof File)) {
    body.append('file', file, 'encrypted.dat')
  } else {
    body.append('file', file)
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      // must be a Pinata‑scoped JWT (not API key/secret)
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
    },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Pinata error ${res.status}: ${text}`)
  }

  const { IpfsHash } = (await res.json()) as { IpfsHash: string }
  return IpfsHash
}