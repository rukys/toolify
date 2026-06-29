import { Metadata } from 'next'
import URLParserClient from './url-parser-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'URL Parser & Parameter Editor — Free Online URL Debugger | Toolify',
    description: 'Break down complex URLs into protocol, host, paths, and query params instantly. Edit, delete, and add new query parameter pairs in an interactive table and compile URLs back. 100% private and client-side.',
    keywords: ['url parser', 'query parameter editor', 'url decoder', 'url query breakdown', 'api url builder', 'percent decoding'],
  }
}

export default function URLParserPage() {
  return <URLParserClient />
}
