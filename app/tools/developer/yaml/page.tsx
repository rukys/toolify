import { Metadata } from 'next'
import YAMLClient from './yaml-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'JSON ⇄ YAML Converter — Free Online Converter | Toolify',
    description: 'Convert JSON to YAML and YAML to JSON instantly in your browser. Supports custom indentation, live formatting validation, copy to clipboard, and syntax highlighting. 100% private and client-side.',
    keywords: ['json to yaml', 'yaml to json', 'json to yml', 'yml to json', 'yaml parser', 'yaml formatter'],
  }
}

export default function YAMLPage() {
  return <YAMLClient />
}
