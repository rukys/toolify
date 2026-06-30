import { Metadata } from 'next'
import CSSGridClient from './css-grid-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CSS Grid Generator — Interactive Layout Creator | Toolify',
    description: 'Design custom CSS Grid layouts visually. Adjust columns, rows, and gaps in real-time, preview the layout, and copy CSS and HTML code snippets instantly.',
    keywords: ['css grid generator', 'visual grid creator', 'css grid builder', 'interactive grid code', 'grid template columns', 'responsive grid layout'],
  }
}

export default function CSSGridPage() {
  return <CSSGridClient />
}
