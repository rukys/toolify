import { Metadata } from 'next'
import WatermarkClient from './watermark-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'PDF Watermark Creator — Text Watermarks Online | Toolify',
    description: 'Add customized text watermarks like CONFIDENTIAL or DRAFT to all pages of a PDF file securely. Adjust size, opacity, rotation, and colors offline.',
    keywords: ['add watermark pdf', 'draft stamp pdf online', 'confidential watermark pdf creator', 'protect pdf pages', 'text overlay pdf document'],
  }
}

export default function PDFWatermarkPage() {
  return <WatermarkClient />
}
