'use client'

import { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { diffWords, diffLines, diffChars } from 'diff'
import { Trash2, Sparkles, ArrowRightLeft, Layers, Columns, AlignLeft } from 'lucide-react'

const SAMPLE_ORIGINAL = `Toolify is an offline-first suite of browser utilities.
It runs on Next.js 14 and React.
All calculations are done client-side to ensure privacy.
Currently supporting text utilities like word counter.`

const SAMPLE_MODIFIED = `Toolify is a 100% offline-first suite of browser utilities.
It runs on Next.js 16 and React 19.
All calculations are processed client-side to guarantee user privacy.
Currently supporting text utilities like case converter and diff checker.`

type DiffMode = 'words' | 'lines' | 'chars'

export default function DiffClient() {
  const tool = getToolById('diff-checker')!
  const [original, setOriginal] = useState('')
  const [modified, setModified] = useState('')
  const [mode, setMode] = useState<DiffMode>('words')

  // Run diff logic in render
  const diffResults = useMemo(() => {
    if (!original && !modified) return []
    try {
      if (mode === 'lines') {
        return diffLines(original, modified)
      } else if (mode === 'chars') {
        return diffChars(original, modified)
      } else {
        return diffWords(original, modified)
      }
    } catch (e) {
      console.error(e)
      return []
    }
  }, [original, modified, mode])

  // Count additions and deletions
  const stats = useMemo(() => {
    let additions = 0
    let deletions = 0

    diffResults.forEach((change) => {
      if (change.added) {
        if (mode === 'lines') {
          additions += change.value.split('\n').filter((l) => l !== '').length
        } else if (mode === 'words') {
          additions += change.value.trim().split(/\s+/).filter(Boolean).length
        } else {
          additions += change.value.length
        }
      } else if (change.removed) {
        if (mode === 'lines') {
          deletions += change.value.split('\n').filter((l) => l !== '').length
        } else if (mode === 'words') {
          deletions += change.value.trim().split(/\s+/).filter(Boolean).length
        } else {
          deletions += change.value.length
        }
      }
    })

    return { additions, deletions }
  }, [diffResults, mode])

  const handleClear = () => {
    setOriginal('')
    setModified('')
    toast.success('Cleared inputs')
  }

  const handleSwap = () => {
    setOriginal(modified)
    setModified(original)
    toast.success('Swapped inputs')
  }

  const handleLoadSample = () => {
    setOriginal(SAMPLE_ORIGINAL)
    setModified(SAMPLE_MODIFIED)
    toast.success('Sample texts loaded')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Action controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-surface-alt)] p-3 rounded-xl border border-[var(--color-border)]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)] mr-1">Mode:</span>
            <Button
              variant={mode === 'words' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('words')}
              className="text-xs h-8 cursor-pointer gap-1"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              Words
            </Button>
            <Button
              variant={mode === 'lines' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('lines')}
              className="text-xs h-8 cursor-pointer gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              Lines
            </Button>
            <Button
              variant={mode === 'chars' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('chars')}
              className="text-xs h-8 cursor-pointer gap-1"
            >
              <Columns className="w-3.5 h-3.5" />
              Characters
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              className="text-xs h-8 cursor-pointer gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              Load Sample
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwap}
              disabled={!original && !modified}
              className="text-xs h-8 cursor-pointer gap-1"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Swap
            </Button>
            {(original || modified) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs h-8 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] cursor-pointer gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Inputs panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="original-text" className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Original Text (Left / Old)
            </Label>
            <textarea
              id="original-text"
              rows={8}
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Paste the original version of your text here..."
              className="w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)] resize-none font-mono leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modified-text" className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Modified Text (Right / New)
            </Label>
            <textarea
              id="modified-text"
              rows={8}
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              placeholder="Paste the modified or updated version of your text here..."
              className="w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)] resize-none font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Diff Result area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Comparison Output
            </Label>

            {(original || modified) && (
              <div className="flex gap-3 text-xs font-mono">
                <span className="text-[var(--color-success)] font-semibold">
                  +{stats.additions} {mode === 'lines' ? 'lines' : mode === 'words' ? 'words' : 'chars'}
                </span>
                <span className="text-[var(--color-danger)] font-semibold">
                  -{stats.deletions} {mode === 'lines' ? 'lines' : mode === 'words' ? 'words' : 'chars'}
                </span>
              </div>
            )}
          </div>

          <div className="w-full p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] overflow-x-auto min-h-[180px]">
            {!original && !modified ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] text-center py-8">
                <ArrowRightLeft className="w-8 h-8 mb-2 opacity-40 text-[var(--color-primary)]" />
                <p className="text-xs">No differences to show.</p>
                <p className="text-[11px] mt-1">Enter text above or click &quot;Load Sample&quot; to see highlights.</p>
              </div>
            ) : (
              <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {mode === 'lines' ? (
                  <div className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] rounded-lg overflow-hidden">
                    {diffResults.map((change, index) => {
                      const lines = change.value.split('\n')
                      // Handle trailing empty line from splits
                      if (lines.length > 1 && lines[lines.length - 1] === '') {
                        lines.pop()
                      }

                      return lines.map((line, lIdx) => {
                        let rowClass = 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                        let prefix = ' '
                        if (change.added) {
                          rowClass = 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold'
                          prefix = '+'
                        } else if (change.removed) {
                          rowClass = 'bg-rose-500/10 text-rose-800 dark:text-rose-300 line-through'
                          prefix = '-'
                        }

                        return (
                          <div
                            key={`${index}-${lIdx}`}
                            className={`flex items-start py-1 px-3 ${rowClass}`}
                          >
                            <span className="w-6 select-none opacity-40 font-bold">{prefix}</span>
                            <span className="flex-1 break-all">{line}</span>
                          </div>
                        )
                      })
                    })}
                  </div>
                ) : (
                  <p className="p-1 break-words">
                    {diffResults.map((change, index) => {
                      if (change.added) {
                        return (
                          <span
                            key={index}
                            className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1 py-0.5 rounded font-semibold break-words"
                          >
                            {change.value}
                          </span>
                        )
                      }
                      if (change.removed) {
                        return (
                          <span
                            key={index}
                            className="bg-rose-500/20 text-rose-800 dark:text-rose-300 line-through px-1 py-0.5 rounded break-words"
                          >
                            {change.value}
                          </span>
                        )
                      }
                      return (
                        <span key={index} className="text-[var(--color-text-primary)]">
                          {change.value}
                        </span>
                      )
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
