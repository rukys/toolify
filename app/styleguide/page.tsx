import { Metadata } from 'next'
import StyleguideClient from './styleguide-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Design System & Component Styleguide | Toolify',
    description: 'Explore the design tokens, color palette, typography scaling, and reusable client-side UI components of Toolify.',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function StyleguidePage() {
  return <StyleguideClient />
}
