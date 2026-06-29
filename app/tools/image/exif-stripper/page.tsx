import { Metadata } from 'next'
import EXIFStripperClient from './exif-stripper-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'EXIF Metadata Stripper — Free Online Photo Cleaner | Toolify',
    description: 'Protect your privacy by stripping GPS locations, camera settings, timestamps, and device details from your images instantly. 100% browser-based canvas cleaning with zero server uploads.',
    keywords: ['remove exif metadata', 'strip image gps', 'exif cleaner', 'photo privacy', 'remove camera tags', 'clean photo details'],
  }
}

export default function EXIFStripperPage() {
  return <EXIFStripperClient />
}
