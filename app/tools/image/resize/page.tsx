import { Metadata } from 'next'
import ResizeWrapper from './resize-wrapper'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Resize Image Free Online — Change Picture Dimensions | Toolify',
    description: 'Resize JPG, PNG, and WEBP images locally by custom pixel dimensions, percentage, or social media presets. Keep original aspect ratio. 100% client-side.',
    keywords: ['resize image', 'resize photos', 'image size dimensions', 'change image scale', 'instagram image resizer', 'free online photo resizer'],
  }
}

export default function ImageResizePage() {
  return <ResizeWrapper />
}
