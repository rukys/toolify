import { Metadata } from 'next'
import CompressWrapper from './compress-wrapper'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Compress PDF Free Online — Optimize PDF Size | Toolify',
    description: 'Reduce PDF file size by stripping metadata and optimizing document structure locally. 100% browser-based, privacy-first, and secure.',
    keywords: ['compress pdf', 'reduce pdf size', 'optimize pdf', 'shrink pdf', 'free pdf compressor', 'online pdf optimizer'],
  }
}

export default function PDFCompressPage() {
  return <CompressWrapper />
}
