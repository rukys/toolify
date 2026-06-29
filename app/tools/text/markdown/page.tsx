import { Metadata } from 'next'
import MarkdownWrapper from './markdown-wrapper'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Markdown Preview Free Online — Live MD Viewer | Toolify',
    description: 'Write, edit, and preview Markdown instantly in your browser. Live sanitised HTML rendering, word counts, copy HTML/Markdown, and HTML download support. 100% client-side.',
    keywords: [
      'markdown preview',
      'markdown editor',
      'md viewer',
      'live markdown renderer',
      'markdown to html converter',
      'online md editor',
      'free markdown utility'
    ],
  }
}

export default function MarkdownPreviewPage() {
  return <MarkdownWrapper />
}
