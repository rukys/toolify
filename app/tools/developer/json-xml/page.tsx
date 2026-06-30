import { Metadata } from 'next'
import JSONXMLClient from './json-xml-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'JSON ⇄ XML Converter — Free Online Data Converter | Toolify',
    description: 'Convert JSON data structures to XML documents or XML code markup to JSON objects instantly. Zero server uploads. 100% private.',
    keywords: ['json to xml', 'xml to json', 'convert json xml', 'xml parser online', 'web data format converter', 'xml to json attributes'],
  }
}

export default function JSONXMLPage() {
  return <JSONXMLClient />
}
