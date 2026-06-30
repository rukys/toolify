import { Metadata } from 'next'
import TailwindPaletteClient from './tailwind-palette-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tailwind CSS Palette Builder — Custom Shade Generator | Toolify',
    description: 'Generate complete, visually balanced Tailwind CSS color palettes from a single base color HEX code. Export configuration code in one click.',
    keywords: ['tailwind palette generator', 'color shade generator', 'tailwind color scales', 'tailwind theme builder', 'hex to hsl palette', 'custom tailwind colors'],
  }
}

export default function TailwindPalettePage() {
  return <TailwindPaletteClient />
}
