import { Metadata } from 'next'
import WordCounterClient from './word-counter-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Word Counter Free Online — Count Words & Chars | Toolify',
    description: 'Count words, characters, paragraphs, and sentences instantly. View reading time and speaking time analytics. 100% client-side, private and secure.',
    keywords: ['word counter', 'character counter', 'reading time calculator', 'sentence counter', 'text analyzer', 'speaking time calculator'],
  }
}

export default function WordCounterPage() {
  return <WordCounterClient />
}
