import { Metadata } from 'next'
import BeautifierClient from './beautifier-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'HTML / CSS / JS Beautifier & Minifier | Toolify',
    description: 'Format and beautify messy HTML web pages, CSS style sheets, and JavaScript files, or minify them for production deployment instantly.',
    keywords: ['html beautifier', 'css minifier', 'js formatter', 'online code beautifier', 'minify javascript', 'clean web code'],
  }
}

export default function BeautifierPage() {
  return <BeautifierClient />
}
