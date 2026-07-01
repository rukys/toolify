import { Metadata } from 'next'
import GlassmorphismClient from './glassmorphism-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CSS Backdrop Blur Glassmorphism Studio | Toolify',
    description: 'Design beautiful, modern glassmorphic card elements with adjustable backdrop blur, opacity, border, and shadows. Copy generated clean CSS classes instantly.',
    keywords: ['glassmorphism css generator', 'backdrop blur studio', 'transparency styling card', 'glass background maker online', 'css copy snippets code'],
  }
}

export default function GlassmorphismPage() {
  return <GlassmorphismClient />
}
