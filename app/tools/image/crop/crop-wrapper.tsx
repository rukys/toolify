'use client'

import dynamic from 'next/dynamic'

const CropClient = dynamic(() => import('./crop-client'), { ssr: false })

export default function CropWrapper() {
  return <CropClient />
}
