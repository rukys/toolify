import { Metadata } from 'next'
import JSONtoTSClient from './json-to-ts-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'JSON to TypeScript Interface Generator | Toolify',
    description: 'Convert JSON payloads and objects into strongly-typed TypeScript interfaces instantly. Handles nested structures recursively. 100% client-side.',
    keywords: ['json to typescript', 'json to ts', 'typescript interface generator', 'convert json types', 'ts model builder', 'json type generator'],
  }
}

export default function JSONtoTSPage() {
  return <JSONtoTSClient />
}
