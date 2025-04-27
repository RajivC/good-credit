// frontend/lib/pinata.ts

/**
 * Upload a browser File directly to Pinata’s IPFS API using a JWT.
 * Make sure you have NEXT_PUBLIC_PINATA_JWT in your .env.local.
 */
export async function uploadToPinata(file: File): Promise<string> {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
    const body = new FormData()
    body.append('file', file)
  
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        // must be a Pinata-scoped JWT (not the API key/secret!)
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body,
    })
  
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Pinata error ${res.status}: ${text}`)
    }
  
    const { IpfsHash } = await res.json() as { IpfsHash: string }
    return IpfsHash
  }