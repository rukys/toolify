'use client'

import dynamic from 'next/dynamic'

const ResizeClient = dynamic(() => import('./resize-client'), { ssr: false })

export default function ResizeWrapper() {
  return <ResizeClient />
}
