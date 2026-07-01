import { Metadata } from 'next'
import GzipClient from './gzip-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Native Browser Gzip File Compressor | Toolify',
    description: 'Compress and decompress files using the browser native CompressionStream API. Fast, 100% offline, and secure client-side file packaging.',
    keywords: ['gzip compressor online', 'decompress gz files', 'gzip file creator', 'unzip gz browser', 'client side gzip compression', 'compression streams api'],
  }
}

export default function GzipPage() {
  return <GzipClient />
}
