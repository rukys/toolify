import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ToolGrid } from '@/components/tool/tool-grid'
import { getToolsByCategory } from '@/lib/tools-registry'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Developer Tools — Free Online Browser Utilities | Toolify',
    description: '100% Free browser-based developer utility tools including JSON Formatter, Base64 Encode/Decode, URL Encode/Decode, JWT Debugger, Regex Tester, and more. Privacy-first, local execution.',
    keywords: ['developer tools', 'json formatter', 'base64 encode', 'url decode', 'jwt debugger', 'regex tester', 'color converter', 'hash generator', 'timestamp'],
  }
}

export default function DeveloperToolsPage() {
  const developerTools = getToolsByCategory('developer')

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
          <span className="text-(--color-text-muted) font-medium">Developer</span>
        </div>

        {/* Header Section */}
        <div className="space-y-2 border-b border-(--color-border) pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Developer Tools</h1>
          <p className="text-sm text-(--color-text-secondary) max-w-2xl">
            Format, encode, decode, hash, debug, and test your code parameters instantly. All operations run 100% locally in your browser.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-(--color-text-muted)">
            <span>
              Showing {developerTools.length} {developerTools.length === 1 ? 'utility' : 'utilities'}
            </span>
          </div>
          <ToolGrid tools={developerTools} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
