import { Metadata } from 'next'
import MergeWrapper from './merge-wrapper'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Merge PDF Free Online — Combine PDF Files | Toolify',
    description: 'Combine multiple PDF files into a single document easily. Drag and drop to sort files in custom order. 100% client-side, free, and secure.',
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'concatenate pdf', 'free pdf merger', 'online pdf compiler'],
  }
}

export default function PDFMergePage() {
  return <MergeWrapper />
}
