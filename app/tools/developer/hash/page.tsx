import { Metadata } from 'next'
import HashClient from './hash-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'MD5, SHA-1, SHA-256, SHA-512 Hash Generator Online | Toolify',
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes simultaneously for text or files. 100% client-side calculation in your browser. Private and secure.',
    keywords: ['hash generator', 'generate hash', 'sha256 generator', 'md5 generator', 'sha1 generator', 'sha512 generator', 'checksum finder', 'file checksum'],
  }
}

export default function HashPage() {
  return <HashClient />
}
