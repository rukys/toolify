'use client'

import dynamic from 'next/dynamic'

const SplitClient = dynamic(() => import('./split-client'), { ssr: false })

export default function SplitWrapper() {
  return <SplitClient />
}
