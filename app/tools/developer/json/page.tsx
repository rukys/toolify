import { Metadata } from 'next'
import JSONFormatterClient from './json-formatter-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'JSON Formatter — Format and Validate JSON Free Online | Toolify',
    description: 'Clean, format, validate, and minify your JSON strings instantly. Features sorting of object keys, error detection with line numbers, and syntax highlighting. 100% local, client-side processing.',
    keywords: ['json formatter', 'format json', 'minify json', 'json validator', 'beautify json', 'pretty print json', 'sort json keys'],
  }
}

export default function JSONFormatterPage() {
  return <JSONFormatterClient />
}
