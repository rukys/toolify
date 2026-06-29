import { Metadata } from 'next'
import LoremClient from './lorem-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Lorem Ipsum Generator Free Online — Placeholder Text | Toolify',
    description: 'Generate customizable Lorem Ipsum placeholder text for designs, templates, and layouts. Choose between words, sentences, or paragraphs.',
    keywords: ['lorem ipsum generator', 'placeholder text', 'generate lorem ipsum', 'dummy text generator', 'lorem ipsum paragraphs', 'dummy copy creator'],
  }
}

export default function LoremPage() {
  return <LoremClient />
}
