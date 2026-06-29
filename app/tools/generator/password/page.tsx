import { Metadata } from 'next'
import PasswordClient from './password-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Password Generator Free Online — Strong & Random Passwords | Toolify',
    description: 'Generate strong, random, and cryptographically secure passwords instantly. Customize length, character sets, and exclude ambiguous characters.',
    keywords: ['password generator', 'random password', 'secure password', 'password maker', 'strong password creator', 'bulk password generator', 'cryptographic password'],
  }
}

export default function PasswordPage() {
  return <PasswordClient />
}
