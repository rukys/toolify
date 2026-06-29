import { Metadata } from 'next'
import DiffClient from './diff-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Text Diff Checker Free Online — Compare Text | Toolify',
    description: 'Compare two text passages or code snippets to find differences instantly. Supports line, word, and character level diffs with clean highlight rendering. 100% client-side.',
    keywords: [
      'diff checker',
      'compare text',
      'text comparison tool',
      'find differences',
      'online diff checker',
      'code difference tool',
      'free text utility'
    ],
  }
}

export default function DiffPage() {
  return <DiffClient />
}
