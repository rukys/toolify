import { Metadata } from 'next'
import URLClient from './url-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'URL Encode / Decode Free Online — URL Escaper | Toolify',
    description: 'Encode or decode URL query strings and percent-encoded parameters instantly. Safe, secure, and runs 100% locally in your browser.',
    keywords: ['url encode', 'url decode', 'percent encoding', 'url escaper', 'url parameters', 'decode url parameters'],
  }
}

export default function URLPage() {
  return <URLClient />
}
