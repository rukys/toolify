'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { tools } from '@/lib/tools-registry'
import { ToolGrid } from '@/components/tool/tool-grid'
import { ToolCategory, ToolMeta } from '@/types/tools'
import { Search, CircleCheck, Zap } from 'lucide-react'
import { useToolHistory } from '@/hooks/use-tool-history'

const CATEGORIES: { value: ToolCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Utilities' },
  { value: 'developer', label: 'Developer' },
  { value: 'generator', label: 'Generators' },
  { value: 'text', label: 'Text' },
  { value: 'pdf', label: 'PDF Tools' },
  { value: 'image', label: 'Image Tools' },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all')
  const { recentIds } = useToolHistory()

  // Filter tools
  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Map history IDs to ToolMeta objects
  const recentTools = recentIds
    .map((id) => tools.find((t) => t.id === id))
    .filter((t): t is ToolMeta => !!t)

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <Header />

      {/* Hero Section with Grid Pattern */}
      <section className="relative overflow-hidden py-20 px-4 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,var(--color-primary-light),transparent)] opacity-70 dark:opacity-30 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-blue-200 dark:border-blue-900/30">
            <Zap className="w-3.5 h-3.5" />
            <span>100% Client-Side — No Server Uploads</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Free Browser-Based{' '}
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
              Utility Toolkit
            </span>
          </h1>

          <p className="text-base md:text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Privacy-first web utilities that run entirely in your browser. No registration, no limits, and no files ever leave your device.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search all 24+ utilities... (e.g., PDF merge, JSON, QR code)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] focus:outline-none transition-all placeholder:text-[var(--color-text-muted)] text-sm"
            />
          </div>
        </div>
      </section>

      {/* Trust & Architecture Banner */}
      <section className="max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-[var(--color-border)]">
        <div className="flex items-start gap-3 p-4">
          <CircleCheck className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold">100% Privacy by Default</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Your files and text are processed locally inside your browser sandboxed environment.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <CircleCheck className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold">Zero Server Uploads</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              No server storage, no database. Zero threat of data leakage or exposure.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <CircleCheck className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold">No Paywall, No Limits</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Convert, format, and generate as much as you want for free without signups.
            </p>
          </div>
        </div>
      </section>

      {/* Recently Used Section */}
      {recentTools.length > 0 && (
        <section className="max-w-6xl w-full mx-auto px-4 pt-10 animate-fade-in">
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Recently Used Utilities
            </h2>
            <ToolGrid tools={recentTools} />
          </div>
        </section>
      )}

      {/* Main Toolkit Listing */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 space-y-10">
        {/* Category Selection Tab List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--color-border)]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">
              {selectedCategory === 'all'
                ? 'All Utilities'
                : `${CATEGORIES.find((c) => c.value === selectedCategory)?.label}`}
            </h2>
            <span className="text-xs text-[var(--color-text-muted)] font-medium">
              Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
            </span>
          </div>

          <ToolGrid tools={filteredTools} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
