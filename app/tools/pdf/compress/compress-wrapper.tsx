'use client'

import dynamic from 'next/dynamic'

const CompressClient = dynamic(() => import('./compress-client'), { ssr: false })

export default function CompressWrapper() {
  return <CompressClient />
}
