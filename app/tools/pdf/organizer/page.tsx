import { Metadata } from 'next'
import OrganizerClient from './organizer-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'PDF Page Rotator & Organizer — Reorder & Rotate | Toolify',
    description: 'Rotate PDF pages clockwise or counter-clockwise, delete unwanted pages, and reorder document page sequences offline inside your browser.',
    keywords: ['rotate pdf pages', 'pdf organizer online', 'delete pages pdf', 'reorder pdf files', 'change page sequence pdf', 'client side pdf editor'],
  }
}

export default function PDFOrganizerPage() {
  return <OrganizerClient />
}
