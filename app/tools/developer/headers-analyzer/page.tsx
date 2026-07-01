import { Metadata } from 'next'
import HeadersAnalyzerClient from './headers-analyzer-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'HTTP Response Headers Auditor — Security Header Check | Toolify',
    description: 'Audit server HTTP response headers (CSP, HSTS, CORS) for security vulnerabilities, calculate compliance scores, and get optimization advice.',
    keywords: ['http headers audit', 'security headers checker', 'csp policy analyzer', 'clickjacking checker', 'hsts verification', 'response headers check'],
  }
}

export default function HeadersAnalyzerPage() {
  return <HeadersAnalyzerClient />
}
