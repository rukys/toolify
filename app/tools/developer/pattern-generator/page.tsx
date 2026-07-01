import { Metadata } from 'next'
import PatternGeneratorClient from './pattern-generator-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'SVG Seamless Pattern Generator — Repeating Backgrounds | Toolify',
    description: 'Design repeated seamless SVG geometric patterns (dots, lines, grids, chevrons). Customize sizes, download SVG code, or copy inline CSS properties.',
    keywords: ['svg pattern generator', 'seamless background maker', 'repeating svg grid', 'inline css background image', 'chevron pattern editor'],
  }
}

export default function PatternGeneratorPage() {
  return <PatternGeneratorClient />
}
