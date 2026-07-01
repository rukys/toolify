import { Metadata } from 'next'
import MetadataClient from './metadata-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'PDF Metadata Editor — View & Change PDF Info | Toolify',
    description: 'View and edit title, author, subject, keywords, and creator properties of your PDF documents securely offline in the browser.',
    keywords: ['pdf metadata editor', 'change pdf title', 'pdf properties modifier online', 'edit pdf author name', 'remove creator tagging pdf'],
  }
}

export default function PDFMetadataPage() {
  return <MetadataClient />
}
