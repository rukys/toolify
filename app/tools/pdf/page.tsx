import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ToolGrid } from '@/components/tool/tool-grid'
import { getToolsByCategory } from '@/lib/tools-registry'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'PDF Utilities — Free Online Browser Tools | Toolify',
    description: '100% Free browser-based PDF utility tools including PDF Merge, PDF Split, PDF Compress, and Image to PDF. Privacy-first, local execution with zero uploads.',
    keywords: ['pdf tools', 'pdf merge', 'pdf split', 'pdf compress', 'image to pdf', 'pdf utilities', 'combine pdf', 'extract pdf pages'],
  }
}

export default function PdfToolsPage() {
  const pdfTools = getToolsByCategory('pdf')

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
          <span className="text-[var(--color-text-muted)] font-medium">PDF</span>
        </div>

        {/* Header Section */}
        <div className="space-y-2 border-b border-[var(--color-border)] pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">PDF Utilities</h1>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-2xl">
            Merge, split, compress, and convert your PDF files securely. All processing runs 100% client-side inside your browser—no files are uploaded to any server.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-[var(--color-text-muted)]">
            <span>
              Showing {pdfTools.length} {pdfTools.length === 1 ? 'utility' : 'utilities'}
            </span>
          </div>
          <ToolGrid tools={pdfTools} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
