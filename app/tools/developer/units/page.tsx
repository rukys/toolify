import { Metadata } from 'next'
import UnitsConverterClient from './units-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Storage & Physical Units Converter | Toolify',
    description: 'Convert data storage sizes (MB, GiB, TB) and physical metrics (Length, Weight, Temperature) instantly. 100% offline client-side calculation.',
    keywords: ['unit converter', 'storage converter', 'data bytes conversion', 'length converter', 'weight conversion', 'temperature calculator'],
  }
}

export default function UnitsConverterPage() {
  return <UnitsConverterClient />
}
