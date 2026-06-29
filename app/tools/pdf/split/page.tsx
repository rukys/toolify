import { Metadata } from 'next'
import SplitWrapper from './split-wrapper'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Split PDF Free Online — Extract PDF Pages | Toolify',
    description: 'Split a PDF document into individual pages, specific page ranges, or every N pages instantly. 100% client-side, free, and secure.',
    keywords: ['split pdf', 'extract pdf pages', 'separate pdf pages', 'pdf splitter', 'free pdf extractor', 'online pdf separator'],
  }
}

export default function PDFSplitPage() {
  return <SplitWrapper />
}
