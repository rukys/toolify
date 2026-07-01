import { Metadata } from 'next'
import DocxToPdfClient from './docx-to-pdf-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'DOCX to PDF Converter — Convert Word to PDF | Toolify',
    description: 'Convert DOCX Microsoft Word files to PDF offline. Customize fonts, print sizes, and layouts using the native browser print engine.',
    keywords: ['docx to pdf converter', 'word to pdf online', 'convert docx to pdf offline', 'client side docx converter', 'print word file as pdf'],
  }
}

export default function DocxToPdfPage() {
  return <DocxToPdfClient />
}
