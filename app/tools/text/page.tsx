import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ToolGrid } from '@/components/tool/tool-grid'
import { getToolsByCategory } from '@/lib/tools-registry'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Text Utilities — Free Online Browser Tools | Toolify',
    description: '100% Free browser-based text utility tools including Word Counter, Case Converter, Markdown Preview, and Diff Checker. Privacy-first, local execution.',
    keywords: ['text tools', 'word counter', 'case converter', 'markdown preview', 'diff checker', 'text utilities', 'compare text'],
  }
}

export default function TextToolsPage() {
  const textTools = getToolsByCategory('text')

  return (
    <div className="flex flex-col min-h-screen bg-(--color-surface) text-(--color-text-primary)">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-(--color-text-secondary)">
          <Link href="/" className="hover:text-(--color-primary) transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-(--color-primary) transition-colors">
            Tools
          </Link>
          <span>/</span>
          <span className="text-(--color-text-muted) font-medium">Text</span>
        </div>

        {/* Header Section */}
        <div className="space-y-2 border-b border-(--color-border) pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Text Utilities</h1>
          <p className="text-sm text-(--color-text-secondary) max-w-2xl">
            Analyze, convert, compare, and render your text content instantly. All utilities run completely locally in your browser.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-(--color-text-muted)">
            <span>
              Showing {textTools.length} {textTools.length === 1 ? 'utility' : 'utilities'}
            </span>
          </div>
          <ToolGrid tools={textTools} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
