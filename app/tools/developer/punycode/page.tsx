import { Metadata } from 'next'
import PunycodeClient from './punycode-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Punycode Domain Name Converter — IDN to ASCII | Toolify',
    description: 'Convert Internationalized Domain Names (IDNs) with Unicode symbols to/from ASCII Punycode (xn--) strings offline.',
    keywords: ['punycode converter online', 'idn ascii domain', 'xn-- domain decoder', 'unicode to punycode creator', 'dns domain compiler'],
  }
}

export default function PunycodePage() {
  return <PunycodeClient />
}
