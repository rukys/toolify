import { Metadata } from 'next'
import CompressWrapper from './compress-wrapper'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Compress Image Free Online — Optimize Photos | Toolify',
    description: 'Compress JPG, PNG, and WEBP images locally in your browser. Maintain high visual quality while reducing file size. Privacy-first with zero uploads.',
    keywords: ['compress image', 'reduce image size', 'optimize photos', 'shrink jpg', 'free image compressor', 'online photo optimizer'],
  }
}

export default function ImageCompressPage() {
  return <CompressWrapper />
}
