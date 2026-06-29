import { Metadata } from 'next'
import CaseConverterClient from './case-converter-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Case Converter Free Online — UPPER, lower, Title Case | Toolify',
    description: 'Convert text cases instantly. Supports UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case. Copies automatically.',
    keywords: ['case converter', 'convert text case', 'title case converter', 'uppercase converter', 'lowercase translator', 'camelcase maker', 'snakecase format'],
  }
}

export default function CaseConverterPage() {
  return <CaseConverterClient />
}
