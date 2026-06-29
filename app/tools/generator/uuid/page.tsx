import { Metadata } from 'next'
import UUIDClient from './uuid-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'UUID & ULID Generator Free Online — ID Generator | Toolify',
    description: 'Generate UUID v4, UUID v7, and ULID identifiers instantly. Features bulk generation up to 100, uppercase formatting, and easy copying.',
    keywords: ['uuid generator', 'generate uuid', 'uuid v4', 'uuid v7', 'ulid generator', 'generate ulid', 'random guid', 'bulk uuid generator'],
  }
}

export default function UUIDPage() {
  return <UUIDClient />
}
