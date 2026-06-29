'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles } from 'lucide-react'
import { tools } from '@/lib/tools-registry'
import { LucideIcon } from '@/components/ui/lucide-icon'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Listen for global Cmd+K / Ctrl+K and escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => {
          const next = !prev
          if (next) {
            setSearchQuery('')
            setSelectedIndex(0)
          }
          return next
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Listen for custom trigger event
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
      setSearchQuery('')
      setSelectedIndex(0)
    }
    window.addEventListener('open-command-palette', handleOpen)
    return () => window.removeEventListener('open-command-palette', handleOpen)
  }, [])

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Filter tools based on query
  const query = searchQuery.trim().toLowerCase()
  const filteredTools = query
    ? tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          tool.category.toLowerCase().includes(query)
      )
    : tools.slice(0, 8) // Show first 8 tools if empty query

  // Handle keyboard navigation inside the list
  useEffect(() => {
    if (!isOpen) return

    const handleNavigation = (e: KeyboardEvent) => {
      if (filteredTools.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredTools.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredTools[selectedIndex]) {
          router.push(filteredTools[selectedIndex].href)
          setIsOpen(false)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleNavigation)
    return () => window.removeEventListener('keydown', handleNavigation)
  }, [isOpen, filteredTools, selectedIndex, router])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) setIsOpen(false)
      }}
      className="fixed inset-0 z-100 flex items-start justify-center pt-24 px-4 bg-black/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl rounded-xl border border-(--color-border) bg-(--color-surface) shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-(--color-border)">
          <Search className="w-5 h-5 text-(--color-text-muted) shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search utilities... (Esc to close)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="w-full text-sm font-medium bg-transparent focus:outline-none placeholder:text-(--color-text-muted) text-(--color-text-primary)"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-sm border border-(--color-border) bg-(--color-surface-alt) text-[10px] font-medium text-(--color-text-muted)">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-0.5 scrollbar-none">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    router.push(tool.href)
                    setIsOpen(false)
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-(--color-primary-light) text-(--color-primary)'
                      : 'text-(--color-text-secondary) hover:bg-(--color-surface-alt)'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-(--color-primary) text-white'
                        : 'bg-(--color-surface-alt) text-(--color-text-secondary)'
                    }`}
                  >
                    <LucideIcon name={tool.icon} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-(--color-primary)' : 'text-(--color-text-primary)'}`}>
                      {tool.name}
                    </p>
                    <p className="text-[10px] text-(--color-text-muted) truncate mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-(--color-text-muted) px-2 py-0.5 rounded-sm bg-(--color-surface-alt) border border-(--color-border)">
                    {tool.category}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="py-12 text-center text-(--color-text-muted)">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-(--color-text-muted)/60" />
              <p className="text-xs">No matching utilities found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
