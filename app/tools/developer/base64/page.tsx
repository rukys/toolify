import { Metadata } from 'next'
import Base64Client from './base64-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Base64 Encode / Decode Free Online — Text & Files | Toolify',
    description: 'Encode or decode text and files to Base64 instantly. Supports file conversions up to 10MB. 100% browser-side processing, private and secure.',
    keywords: ['base64 encode', 'base64 decode', 'file to base64', 'base64 converter', 'text to base64', 'base64 translator'],
  }
}

export default function Base64Page() {
  return <Base64Client />
}
