'use client'

import dynamic from 'next/dynamic'

const MergeClient = dynamic(() => import('./merge-client'), { ssr: false })

export default function MergeWrapper() {
  return <MergeClient />
}
