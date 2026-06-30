import { Metadata } from 'next'
import MACFormatterClient from './mac-formatter-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'MAC Address Formatter & OUI Vendor Lookup | Toolify',
    description: 'Format MAC addresses using colons, hyphens, or dots, and lookup network card manufacturers using OUI prefixes locally in your browser.',
    keywords: ['mac address formatter', 'mac vendor lookup', 'mac oui lookup', 'format mac address', 'network card manufacturer', 'clean mac address'],
  }
}

export default function MACFormatterPage() {
  return <MACFormatterClient />
}
