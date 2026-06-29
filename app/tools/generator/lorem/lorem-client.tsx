'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { generateLorem } from '@/lib/generators/lorem'
import { Copy, Check, FileText } from 'lucide-react'

type LoremUnit = 'paragraphs' | 'sentences' | 'words'

export default function LoremClient() {
  const tool = getToolById('lorem-ipsum')!

  // Options
  const [unit, setUnit] = useState<LoremUnit>('paragraphs')
  const [count, setCount] = useState(5)
  const [startWithLorem, setStartWithLorem] = useState(true)

  // Outputs
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = useCallback(() => {
    const text = generateLorem(unit, count, startWithLorem)
    setOutput(text)
  }, [unit, count, startWithLorem])

  // Generate on load
  useEffect(() => {
    const timer = setTimeout(() => {
      handleGenerate()
    }, 0)
    return () => clearTimeout(timer)
  }, [handleGenerate])

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate statistics
  const wordCount = output ? output.trim().split(/\s+/).length : 0
  const charCount = output ? output.length : 0
  const paragraphCount = output ? output.split('\n\n').filter(Boolean).length : 0

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-2xl border border-(--color-border) bg-(--color-surface-alt) items-end">
          {/* Unit Selector */}
          <div className="sm:col-span-4 space-y-1">
            <Label htmlFor="lorem-unit" className="text-xs text-(--color-text-secondary) font-semibold">
              Generate Unit
            </Label>
            <select
              id="lorem-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as LoremUnit)}
              className="block w-full px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-surface) focus:border-(--color-primary) focus:outline-none cursor-pointer font-medium"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>

          {/* Count Input */}
          <div className="sm:col-span-3 space-y-1">
            <Label htmlFor="lorem-count" className="text-xs text-(--color-text-secondary) font-semibold">
              Count
            </Label>
            <input
              id="lorem-count"
              type="number"
              min="1"
              max="200"
              value={count}
              onChange={(e) => setCount(Math.min(200, Math.max(1, Number(e.target.value) || 1)))}
              className="block w-full px-3 py-1.5 text-sm rounded-lg border border-(--color-border) bg-(--color-surface) focus:border-(--color-primary) focus:outline-none"
            />
          </div>

          {/* Start with Lorem checkbox */}
          <div className="sm:col-span-5 flex items-center justify-between gap-4 h-9">
            <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer select-none font-medium">
              <Checkbox
                checked={startWithLorem}
                onCheckedChange={(checked) => setStartWithLorem(!!checked)}
                className="cursor-pointer"
              />
              <span>Start with &quot;Lorem ipsum...&quot;</span>
            </label>

            <Button onClick={handleGenerate} size="sm" className="cursor-pointer shrink-0">
              <FileText className="w-3.5 h-3.5 mr-1" /> Generate
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        {output && (
          <div className="flex gap-4 text-xs font-mono text-(--color-text-secondary) px-1">
            <span><strong>Words:</strong> {wordCount}</span>
            <span>|</span>
            <span><strong>Characters:</strong> {charCount}</span>
            <span>|</span>
            <span><strong>Paragraphs:</strong> {paragraphCount}</span>
          </div>
        )}

        {/* Output Panel */}
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Generated Placeholder Text</Label>
              <Button variant="outline" size="sm" onClick={handleCopy} className="cursor-pointer text-xs">
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-(--color-success)" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Text
                  </>
                )}
              </Button>
            </div>
            
            <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface) max-h-[360px] overflow-auto select-all leading-relaxed whitespace-pre-wrap text-sm text-(--color-text-primary)">
              {output}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
