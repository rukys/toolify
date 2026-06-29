import { Metadata } from 'next'
import ColorClient from './color-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Color Picker & Converter Free Online — HEX, RGB, HSL | Toolify',
    description: 'Pick colors and convert between HEX, RGB, HSL, and CMYK formats. Features tint and shade generators, WCAG contrast checkers, and CSS variable builders. 100% browser-based.',
    keywords: ['color picker', 'color converter', 'hex to rgb', 'rgb to hsl', 'contrast ratio checker', 'color palette generator', 'cmyk converter'],
  }
}

export default function ColorPage() {
  return <ColorClient />
}
