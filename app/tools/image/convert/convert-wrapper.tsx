'use client'

import dynamic from 'next/dynamic'

const ConvertClient = dynamic(() => import('./convert-client'), { ssr: false })

export default function ConvertWrapper() {
  return <ConvertClient />
}
