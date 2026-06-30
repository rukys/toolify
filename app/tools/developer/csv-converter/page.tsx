import { Metadata } from 'next'
import CSVConverterClient from './csv-converter-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'JSON ⇄ CSV Converter — Free Online Table Formatter | Toolify',
    description: 'Convert JSON arrays of objects to CSV spreadsheets or CSV datasets to JSON formatting instantly. 100% secure client-side conversion.',
    keywords: ['json to csv', 'csv to json', 'convert json csv', 'spreadsheet to json', 'online table converter', 'bulk data converter'],
  }
}

export default function CSVConverterPage() {
  return <CSVConverterClient />
}
