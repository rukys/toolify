'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { tools } from '@/lib/tools-registry'
import { ToolGrid } from '@/components/tool/tool-grid'
import { ToolCategory } from '@/types/tools'
import { Search } from 'lucide-react'

const CATEGORIES: { value: ToolCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'developer', label: 'Developer Tools' },
  { value: 'generator', label: 'Generators' },
  { value: 'text', label: 'Text Utilities' },
  { value: 'pdf', label: 'PDF Utilities' },
  { value: 'image', label: 'Image Utilities' },
]

export default function ToolsCatalogClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all')

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(query))

      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Tools Catalog</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Explore our collection of 100% browser-based utility tools.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-alt)] shadow-sm">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)]"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.value
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-[var(--color-text-muted)]">
            <span>
              Showing {filteredTools.length} {filteredTools.length === 1 ? 'utility' : 'utilities'}
            </span>
          </div>

          <ToolGrid tools={filteredTools} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
