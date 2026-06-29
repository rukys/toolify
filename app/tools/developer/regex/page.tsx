import { Metadata } from 'next'
import RegexClient from './regex-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Regex Tester — Test Regular Expressions Online | Toolify',
    description: 'Test and debug your regular expressions in real-time. Features live syntax match highlighting, match lists, capturing group offsets, and regex flag selection. 100% browser-based.',
    keywords: ['regex tester', 'regex debugger', 'regular expression', 'test regex', 'regex match finder', 'regex checker'],
  }
}

export default function RegexPage() {
  return <RegexClient />
}
