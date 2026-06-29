import { Metadata } from 'next'
import JWTClient from './jwt-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'JWT Debugger — Decode and Inspect JSON Web Tokens | Toolify',
    description: 'Decode and inspect JWT header, payload claims, and signature parameters instantly. 100% local, browser-side decryption. Private and secure.',
    keywords: ['jwt debugger', 'decode jwt', 'jwt parser', 'inspect jwt', 'json web token', 'jwt claims decoder'],
  }
}

export default function JWTPage() {
  return <JWTClient />
}
