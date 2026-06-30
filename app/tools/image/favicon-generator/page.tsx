import { Metadata } from 'next'
import FaviconGeneratorClient from './favicon-generator-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Favicon Generator — Free Online Favicon & App Icon Maker | Toolify',
    description: 'Convert any image (PNG, JPG, or WEBP) into standard favicon (.ico) and app icon package sizes for iOS, Android, and web. 100% client-side compression.',
    keywords: ['favicon generator', 'favicon converter', 'app icon maker', 'ios icon generator', 'apple touch icon', 'web icon package', 'generate favicon zip'],
  }
}

export default function FaviconGeneratorPage() {
  return <FaviconGeneratorClient />
}
