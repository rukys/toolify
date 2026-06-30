import { Metadata } from 'next'
import ListSorterClient from './list-sorter-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Line Text Sorter & Deduplicator | Toolify',
    description: 'Sort lists alphabetically, numerically, or randomly. Easily deduplicate repeating rows, adjust formatting delimiters, and trim whitespace instantly.',
    keywords: ['line text sorter', 'deduplicate list lines', 'sort list online', 'remove duplicate rows', 'alphabetize list text', 'list cleaning tool'],
  }
}

export default function ListSorterPage() {
  return <ListSorterClient />
}
