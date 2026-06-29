import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ToolGrid } from '@/components/tool/tool-grid'
import { getToolsByCategory } from '@/lib/tools-registry'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Generator Tools — Free Online Browser Utilities | Toolify',
    description: '100% Free browser-based text, password, QR code, and ID generator utility tools. Privacy-first, local execution in your browser.',
    keywords: ['generator tools', 'qr code generator', 'password generator', 'uuid generator', 'lorem ipsum generator', 'ulid generator', 'random string'],
  }
}

export default function GeneratorToolsPage() {
  const generatorTools = getToolsByCategory('generator')

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
          <span className="text-[var(--color-text-muted)] font-medium">Generator</span>
        </div>

        {/* Header Section */}
        <div className="space-y-2 border-b border-[var(--color-border)] pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Generator Tools</h1>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-2xl">
            Generate strong random passwords, customizable QR codes, unique UUID/ULIDs, and lorem ipsum placeholder text instantly. All operations run 100% locally.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-[var(--color-text-muted)]">
            <span>
              Showing {generatorTools.length} {generatorTools.length === 1 ? 'utility' : 'utilities'}
            </span>
          </div>
          <ToolGrid tools={generatorTools} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
