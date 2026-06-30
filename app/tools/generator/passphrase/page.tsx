import { Metadata } from 'next'
import PassphraseClient from './passphrase-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Diceware Passphrase Generator — Free Online Password Maker | Toolify',
    description: 'Generate secure, cryptographic, and highly memorable passphrases in your browser using the Diceware random wordlist method. 100% private.',
    keywords: ['passphrase generator', 'diceware generator', 'memorable password maker', 'secure pass phrase', 'diceware wordlist online', 'offline password generator'],
  }
}

export default function PassphrasePage() {
  return <PassphraseClient />
}
