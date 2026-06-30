import { Metadata } from 'next'
import CiphersClient from './ciphers-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Classic Cipher Studio — Caesar, Vigenere, ROT13, & Morse | Toolify',
    description: 'Encode or decode secret text messages using traditional cryptographic ciphers: Caesar Shift, Vigenere Key, ROT13 rotation, and Morse Code translation. 100% private.',
    keywords: ['caesar cipher online', 'vigenere cipher decoder', 'rot13 encoder', 'morse code translator', 'classic cryptography sandbox', 'cipher studio online'],
  }
}

export default function CiphersPage() {
  return <CiphersClient />
}
