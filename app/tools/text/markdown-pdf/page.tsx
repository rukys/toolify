import { Metadata } from 'next'
import MarkdownPDFClient from './markdown-pdf-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Markdown to Styled PDF / HTML Compiler | Toolify',
    description: 'Convert markdown text into styled, publication-ready PDF documents or HTML pages instantly. Features Github, Academic, and Modern theme styling.',
    keywords: ['markdown to pdf', 'convert markdown online', 'markdown printer', 'export markdown to pdf', 'styled markdown themes', 'academic markdown compiler'],
  }
}

export default function MarkdownPDFPage() {
  return <MarkdownPDFClient />
}
