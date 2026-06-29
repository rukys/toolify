'use client'

import dynamic from 'next/dynamic'

const ImageToPDFClient = dynamic(() => import('./image-to-pdf-client'), { ssr: false })

export default function ImageToPDFWrapper() {
  return <ImageToPDFClient />
}
