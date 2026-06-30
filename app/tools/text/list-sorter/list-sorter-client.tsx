'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Copy, Check } from 'lucide-react'

type SortMethod = 'alphabetical' | 'reverse' | 'numeric' | 'numeric-reverse' | 'shuffle'
type Delimiter = 'newline' | 'comma' | 'semicolon' | 'space'

export default function ListSorterClient() {
  const tool = getToolById('list-sorter')!
  const [inputText, setInputText] = useState('Banana\nApple\n10\n2\nCherry\nApple\n1')
  const [method, setMethod] = useState<SortMethod>('alphabetical')
  const [deduplicate, setDeduplicate] = useState(true)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [delimiter, setDelimiter] = useState<Delimiter>('newline')
  
  const [outputText, setOutputText] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSort = () => {
    let lines = inputText.split('\n').map(line => line.trim()).filter(line => line !== '')
    if (lines.length === 0) return

    // Deduplicate
    if (deduplicate) {
      if (caseSensitive) {
        lines = Array.from(new Set(lines))
      } else {
        // Case-insensitive deduplication (keep the first occurrence)
        const seen = new Set<string>()
        lines = lines.filter(line => {
          const lower = line.toLowerCase()
          if (seen.has(lower)) return false
          seen.add(lower)
          return true
        })
      }
    }

    // Sort operations
    if (method === 'alphabetical') {
      lines.sort((a, b) => {
        return caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase())
      })
    } else if (method === 'reverse') {
      lines.sort((a, b) => {
        return caseSensitive ? b.localeCompare(a) : b.toLowerCase().localeCompare(a.toLowerCase())
      })
    } else if (method === 'numeric') {
      lines.sort((a, b) => {
        const numA = parseFloat(a)
        const numB = parseFloat(b)
        if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b)
        if (isNaN(numA)) return 1
        if (isNaN(numB)) return -1
        return numA - numB
      })
    } else if (method === 'numeric-reverse') {
      lines.sort((a, b) => {
        const numA = parseFloat(a)
        const numB = parseFloat(b)
        if (isNaN(numA) && isNaN(numB)) return b.localeCompare(a)
        if (isNaN(numA)) return 1
        if (isNaN(numB)) return -1
        return numB - numA
      })
    } else if (method === 'shuffle') {
      // Fisher-Yates Shuffle
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = lines[i]
        lines[i] = lines[j]
        lines[j] = temp
      }
    }

    // Join
    let joinStr = '\n'
    if (delimiter === 'comma') joinStr = ', '
    if (delimiter === 'semicolon') joinStr = '; '
    if (delimiter === 'space') joinStr = ' '

    setOutputText(lines.join(joinStr))
  }

  const handleCopy = async () => {
    if (!outputText) return
    await navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Configurations grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          {/* Method selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Sorting Method</Label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as SortMethod)}
              className="w-full h-9 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) text-(--color-text-primary)"
            >
              <option value="alphabetical">Alphabetical (A - Z)</option>
              <option value="reverse">Reverse Alphabetical (Z - A)</option>
              <option value="numeric">Numerical Ascending (1 - 9)</option>
              <option value="numeric-reverse">Numerical Descending (9 - 1)</option>
              <option value="shuffle">Random Shuffle</option>
            </select>
          </div>

          {/* Delimiter selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Output Delimiter</Label>
            <div className="flex gap-1.5">
              {([
                { val: 'newline', label: 'Newline' },
                { val: 'comma', label: 'Comma' },
                { val: 'semicolon', label: 'Semicolon' },
              ] as { val: Delimiter; label: string }[]).map((delim) => (
                <button
                  key={delim.val}
                  onClick={() => setDelimiter(delim.val)}
                  className={`flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg border transition-colors cursor-pointer ${
                    delimiter === delim.val
                      ? 'bg-(--color-primary) text-white border-transparent'
                      : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                  }`}
                >
                  {delim.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtering options */}
          <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2 border-t border-(--color-border)/50">
            <label className="flex items-center gap-2 text-xs font-semibold text-(--color-text-secondary) cursor-pointer select-none">
              <input
                type="checkbox"
                checked={deduplicate}
                onChange={(e) => setDeduplicate(e.target.checked)}
                className="w-4 h-4 rounded border-(--color-border) text-(--color-primary) focus:ring-(--color-primary) cursor-pointer"
              />
              <span>Deduplicate Unique Lines</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-(--color-text-secondary) cursor-pointer select-none">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="w-4 h-4 rounded border-(--color-border) text-(--color-primary) focus:ring-(--color-primary) cursor-pointer"
              />
              <span>Case Sensitive Match</span>
            </label>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Label htmlFor="list-input" className="text-sm font-semibold">List Items (One per line)</Label>
          <textarea
            id="list-input"
            rows={6}
            placeholder="Enter lines to sort..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted)"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSort} className="flex-1 bg-(--color-primary) text-white hover:bg-(--color-primary-dark) cursor-pointer">
            Sort List
          </Button>
          <Button variant="outline" onClick={handleClear} className="border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer">
            Clear
          </Button>
        </div>

        {/* Output */}
        {outputText && (
          <div className="space-y-2 pt-4 border-t border-(--color-border) animate-fade-in">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Sorted Output Result</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
            <textarea
              readOnly
              rows={6}
              value={outputText}
              className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none text-(--color-text-primary)"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
