import { Metadata } from 'next'
import ASCIIArtClient from './ascii-art-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Retro ASCII Art & FIGlet Generator | Toolify',
    description: 'Generate styled terminal ASCII art text banners using the classic Slant font. Perfect for code comments, readme files, and system headers.',
    keywords: ['ascii art generator', 'figlet generator online', 'retro text banner maker', 'slant font ascii', 'text to ascii art', 'terminal art builder'],
  }
}

export default function ASCIIArtPage() {
  return <ASCIIArtClient />
}
