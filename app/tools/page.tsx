import { Metadata } from 'next'
import ToolsCatalogClient from './tools-catalog-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'All Utilities — Free Online Browser Tools Catalog | Toolify',
    description: 'Browse all 24+ free browser-based web tools for developers, content writers, creators, and daily operations. Privacy-first, zero uploads.',
    keywords: ['browser tools', 'online tools catalog', 'free utilities', 'developer toolbox', 'pdf utilities', 'text converters'],
  }
}

export default function ToolsCatalogPage() {
  return <ToolsCatalogClient />
}
