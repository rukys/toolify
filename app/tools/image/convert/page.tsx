import { Metadata } from 'next'
import ConvertWrapper from './convert-wrapper'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Convert Image Free Online — Convert PNG/JPG/WEBP/GIF | Toolify',
    description: 'Convert images to JPG, PNG, WEBP, GIF, and BMP formats instantly. 100% client-side, secure, and private. white background for JPEGs.',
    keywords: ['convert image format', 'png to jpg', 'webp to png', 'jpg to webp', 'free image converter', 'online photo converter'],
  }
}

export default function ImageConvertPage() {
  return <ConvertWrapper />
}
