import { Metadata } from 'next'
import ColorExtractorClient from './color-extractor-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Color Palette Extractor — Extract Dominant Colors from Images | Toolify',
    description: 'Instantly extract dominant color palettes from any photo or image (JPG, PNG, or WEBP) in your browser. Copy HEX and RGB values with a single click. 100% private.',
    keywords: ['color palette extractor', 'extract colors from image', 'image color picker', 'dominant color scheme', 'color palette builder', 'hex code generator', 'extract colors offline'],
  }
}

export default function ColorExtractorPage() {
  return <ColorExtractorClient />
}
