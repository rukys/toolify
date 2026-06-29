'use client'

import React from 'react'
import Link from 'next/link'
import { ToolMeta } from '@/types/tools'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LucideIcon } from '@/components/ui/lucide-icon'
import { getRelatedTools } from '@/lib/tools-registry'
import { ShieldCheck, ServerOff } from 'lucide-react'
import { RelatedTools } from './related-tools'
import { useToolHistory } from '@/hooks/use-tool-history'

interface ToolLayoutProps {
  tool: ToolMeta
  children: React.ReactNode
  relatedTools?: ToolMeta[]
}

export function ToolLayout({ tool, children, relatedTools }: ToolLayoutProps) {
  const displayRelated = relatedTools ?? getRelatedTools(tool.id)
  const { addToHistory } = useToolHistory()

  // Track page view in tool history
  React.useEffect(() => {
    addToHistory(tool.id)
  }, [tool.id, addToHistory])

  return (
    <div className="flex flex-col min-h-screen bg-(--color-surface) text-(--color-text-primary)">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-(--color-text-secondary) mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-(--color-primary) transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-(--color-primary) transition-colors">
            Tools
          </Link>
          <span>/</span>
          <Link
            href={`/tools/${tool.category}`}
            className="hover:text-(--color-primary) transition-colors capitalize"
          >
            {tool.category}
          </Link>
          <span>/</span>
          <span className="text-(--color-text-muted) font-medium">{tool.name}</span>
        </div>

        {/* Tool Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 mb-8 border-b border-(--color-border)">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-(--color-primary-light) text-(--color-primary) flex items-center justify-center">
                <LucideIcon name={tool.icon} className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{tool.name}</h1>
                <p className="text-sm text-(--color-text-secondary) mt-1">{tool.description}</p>
              </div>
            </div>
          </div>

          {/* Core Trust Flags */}
          <div className="flex flex-wrap md:flex-col gap-3 md:items-end justify-start">
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-900/30">
               <ServerOff className="w-3.5 h-3.5" />
              <span>100% Client-Side</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Private & Secure</span>
            </div>
          </div>
        </div>

        {/* Main Tool Area */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="p-6 md:p-8 rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-sm">
            {children}
          </div>
        </div>

        {/* Related Tools */}
        <RelatedTools tools={displayRelated} />
      </main>

      <Footer />
    </div>
  )
}
