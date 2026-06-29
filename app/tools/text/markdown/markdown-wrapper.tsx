'use client'

import dynamic from 'next/dynamic'

const MarkdownClient = dynamic(() => import('./markdown-client'), { ssr: false })

export default function MarkdownWrapper() {
  return <MarkdownClient />
}
