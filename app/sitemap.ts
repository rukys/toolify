import { MetadataRoute } from 'next'
import { tools } from '@/lib/tools-registry'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://toolify.app'

  const toolUrls = tools.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...toolUrls,
  ]
}
export const dynamic = 'force-static'
