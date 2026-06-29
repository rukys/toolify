import { Metadata } from 'next'
import ImageToPDFWrapper from './image-to-pdf-wrapper'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Convert Image to PDF Free Online — JPG/PNG to PDF | Toolify',
    description: 'Convert JPG, PNG, WEBP, and GIF images to a PDF document locally in your browser. Drag to sort page order, customize page sizes, margins, and fitting options.',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert images to pdf', 'free image to pdf converter', 'online picture to pdf converter'],
  }
}

export default function ImageToPDFPage() {
  return <ImageToPDFWrapper />
}
