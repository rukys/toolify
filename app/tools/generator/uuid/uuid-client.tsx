'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Copy, Check, RefreshCw, Clipboard } from 'lucide-react'
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid'
import { ulid } from 'ulid'

type IDVersion = 'v4' | 'v7' | 'ulid'

function generateIDs(version: IDVersion, count: number, uppercase: boolean): string[] {
  return Array.from({ length: Math.min(100, Math.max(1, count)) }, () => {
    let id = ''
    if (version === 'v4') {
      id = uuidv4()
    } else if (version === 'v7') {
      id = uuidv7()
    } else {
      id = ulid()
    }
    return uppercase ? id.toUpperCase() : id.toLowerCase()
  })
}

export default function UUIDClient() {
  const tool = getToolById('uuid-generator')!

  // Options
  const [version, setVersion] = useState<IDVersion>('v4')
  const [count, setCount] = useState(5)
  const [uppercase, setUppercase] = useState(false)

  // Outputs
  const [results, setResults] = useState<string[]>([])
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleGenerate = useCallback(() => {
    setCopiedIdx(null)
    const list = generateIDs(version, count, uppercase)
    setResults(list)
  }, [version, count, uppercase])

  // Generate on load
  useEffect(() => {
    const timer = setTimeout(() => {
      handleGenerate()
    }, 0)
    return () => clearTimeout(timer)
  }, [handleGenerate])

  const handleCopyAll = async () => {
    if (results.length === 0) return
    const text = results.join('\n')
    await navigator.clipboard.writeText(text)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const handleCopyOne = async (idx: number, val: string) => {
    await navigator.clipboard.writeText(val)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-2xl border border-(--color-border) bg-(--color-surface-alt) items-end">
          <div className="sm:col-span-4 space-y-1">
            <Label htmlFor="id-version" className="text-xs text-(--color-text-secondary) font-semibold">
              ID Version
            </Label>
            <select
              id="id-version"
              value={version}
              onChange={(e) => setVersion(e.target.value as IDVersion)}
              className="block w-full px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-surface) focus:border-(--color-primary) focus:outline-none cursor-pointer font-medium"
            >
              <option value="v4">UUID v4 (Random)</option>
              <option value="v7">UUID v7 (Time-ordered)</option>
              <option value="ulid">ULID (128-bit lexicographical)</option>
            </select>
          </div>

          <div className="sm:col-span-4 space-y-1">
            <div className="flex justify-between text-xs text-(--color-text-secondary) font-semibold">
              <Label htmlFor="id-count">Generate Count</Label>
              <span className="font-mono">{count}</span>
            </div>
            <input
              id="id-count"
              type="range"
              min="1"
              max="100"
              step="1"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-8 accent-(--color-primary) cursor-pointer"
            />
          </div>

          <div className="sm:col-span-4 flex items-center justify-between gap-4 h-9">
            <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer select-none font-medium">
              <Checkbox
                checked={uppercase}
                onCheckedChange={(checked) => setUppercase(!!checked)}
                className="cursor-pointer"
              />
              <span>Uppercase</span>
            </label>

            <Button onClick={handleGenerate} size="sm" className="cursor-pointer shrink-0">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Generate
            </Button>
          </div>
        </div>

        {/* Results List */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Generated {version.toUpperCase()} IDs ({results.length})
              </Label>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                className="cursor-pointer text-xs"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-(--color-success)" /> Copied All
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5 mr-1.5" /> Copy All IDs
                  </>
                )}
              </Button>
            </div>

            <div className="border border-(--color-border) rounded-xl overflow-hidden divide-y divide-(--color-border) max-h-[360px] overflow-y-auto">
              {results.map((id, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-(--color-surface-alt)/30 hover:bg-(--color-surface-alt)/65 transition-colors text-xs font-mono"
                >
                  <span className="text-(--color-text-muted) font-mono select-none pr-3 w-8">
                    {idx + 1}
                  </span>
                  <span className="flex-1 select-all break-all text-(--color-primary) font-semibold pr-4">
                    {id}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 cursor-pointer"
                    onClick={() => handleCopyOne(idx, id)}
                  >
                    {copiedIdx === idx ? (
                      <span className="text-(--color-success) flex items-center font-sans text-[10px]">
                        <Check className="w-3.5 h-3.5 mr-1" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center font-sans text-[10px]">
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                      </span>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
