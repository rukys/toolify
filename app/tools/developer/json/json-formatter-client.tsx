'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CodeHighlight } from '@/components/tool/code-highlight'
import { Copy, Check, Info } from 'lucide-react'

// Helper function to sort object keys alphabetically
function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys)
  if (obj !== null && typeof obj === 'object') {
    const sortedAcc: Record<string, unknown> = {}
    const keys = Object.keys(obj).sort()
    for (const key of keys) {
      sortedAcc[key] = sortObjectKeys((obj as Record<string, unknown>)[key])
    }
    return sortedAcc
  }
  return obj
}

export default function JSONFormatterClient() {
  const tool = getToolById('json-formatter')!
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indent, setIndent] = useState<'2' | '4' | 'tab'>('2')
  const [sortKeys, setSortKeys] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleFormat = () => {
    setError('')
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      const parsed = JSON.parse(input)
      const space = indent === 'tab' ? '\t' : Number(indent)
      const result = sortKeys
         ? JSON.stringify(sortObjectKeys(parsed), null, space)
         : JSON.stringify(parsed, null, space)
      setOutput(result)
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : 'Invalid JSON format')
    }
  }

  const handleMinify = () => {
    setError('')
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      const parsed = JSON.parse(input)
      const result = JSON.stringify(parsed)
      setOutput(result)
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : 'Invalid JSON format')
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Input Textarea */}
        <div className="space-y-2">
          <Label htmlFor="json-input" className="text-sm font-semibold">
            Raw JSON Input
          </Label>
          <textarea
            id="json-input"
            rows={8}
            placeholder='Paste your raw JSON here... e.g. {"name":"Toolify","active":true}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-sm focus:border-(--color-primary) focus:outline-none placeholder:text-(--color-text-muted)"
          />
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <Label htmlFor="indent-size" className="text-xs text-(--color-text-secondary)">
                Indent Size
              </Label>
              <select
                id="indent-size"
                value={indent}
                onChange={(e) => setIndent(e.target.value as '2' | '4' | 'tab')}
                className="block w-24 px-2 py-1.5 text-sm rounded-lg border border-(--color-border) bg-(--color-surface) focus:border-(--color-primary) focus:outline-none cursor-pointer"
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="tab">1 Tab</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="sort-keys"
                checked={sortKeys}
                onCheckedChange={(checked) => setSortKeys(!!checked)}
                className="cursor-pointer"
              />
              <Label htmlFor="sort-keys" className="text-xs text-(--color-text-secondary) cursor-pointer select-none">
                Sort Object Keys
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleFormat} className="cursor-pointer">
              Format
            </Button>
            <Button variant="secondary" onClick={handleMinify} className="cursor-pointer">
              Minify
            </Button>
            <Button variant="ghost" onClick={handleClear} className="text-(--color-text-secondary) hover:text-(--color-danger) cursor-pointer">
              Clear
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="font-mono whitespace-pre-wrap">{error}</div>
          </div>
        )}

        {/* Output Panel */}
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Formatted Output</Label>
              <Button variant="outline" size="sm" onClick={handleCopy} className="cursor-pointer text-xs">
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-(--color-success)" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Code
                  </>
                )}
              </Button>
            </div>
            <CodeHighlight code={output} language="json" />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
