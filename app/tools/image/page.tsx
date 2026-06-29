import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ToolGrid } from '@/components/tool/tool-grid'
import { getToolsByCategory } from '@/lib/tools-registry'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Image Utilities — Free Online Browser Tools | Toolify',
    description: '100% Free browser-based image utility tools including Image Compress, Image Resize, Image Convert, and Image Crop. Privacy-first, local execution with zero server uploads.',
    keywords: ['image tools', 'image compress', 'image resize', 'image convert', 'image crop', 'image utilities', 'png to jpg', 'resize photos'],
  }
}

export default function ImageToolsPage() {
  const imageTools = getToolsByCategory('image')

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-[var(--color-primary)] transition-colors">
            Tools
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text-muted)] font-medium">Image</span>
        </div>

        {/* Header Section */}
        <div className="space-y-2 border-b border-[var(--color-border)] pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Image Utilities</h1>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-2xl">
            Compress, resize, convert, and crop your images securely. All processing runs 100% client-side inside your browser—no files are uploaded to any server.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-[var(--color-text-muted)]">
            <span>
              Showing {imageTools.length} {imageTools.length === 1 ? 'utility' : 'utilities'}
            </span>
          </div>
          <ToolGrid tools={imageTools} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
