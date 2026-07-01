import { Metadata } from 'next'
import PageNumbererClient from './page-numberer-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'PDF Page Numberer — Add Page Numbers Online | Toolify',
    description: 'Add clean page numbers to your PDF documents automatically. Customize alignments, sizes, styles, margins, and colors offline.',
    keywords: ['add page numbers pdf', 'pdf page numberer online', 'header footer numbering pdf', 'insert page counts pdf', 'secure offline pdf compiler'],
  }
}

export default function PDFPageNumbererPage() {
  return <PageNumbererClient />
}
