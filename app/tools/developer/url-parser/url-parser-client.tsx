'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, Copy, Check, AlertCircle } from 'lucide-react'
import { ulid } from 'ulid'

interface QueryParam {
  id: string
  key: string
  value: string
}

export default function URLParserClient() {
  const tool = getToolById('url-parser')!
  const [inputUrl, setInputUrl] = useState('')
  const [parsed, setParsed] = useState<{
    protocol: string
    host: string
    pathname: string
    hash: string
  } | null>(null)
  const [params, setParams] = useState<QueryParam[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleParse = () => {
    setError('')
    setParsed(null)
    setParams([])

    if (!inputUrl.trim()) return

    try {
      // Parse URL
      const url = new URL(inputUrl.trim())
      
      setParsed({
        protocol: url.protocol,
        host: url.host,
        pathname: url.pathname,
        hash: url.hash,
      })

      const extractedParams: QueryParam[] = []
      url.searchParams.forEach((value, key) => {
        extractedParams.push({
          id: ulid(),
          key,
          value,
        })
      })
      setParams(extractedParams)
    } catch (err) {
      setError('Invalid URL format. Please ensure you write a complete URL with its protocol (e.g., https://example.com).')
    }
  }

  const handleAddParam = () => {
    setParams((prev) => [...prev, { id: ulid(), key: '', value: '' }])
  }

  const handleParamChange = (id: string, field: 'key' | 'value', val: string) => {
    setParams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    )
  }

  const handleRemoveParam = (id: string) => {
    setParams((prev) => prev.filter((p) => p.id !== id))
  }

  const handleClear = () => {
    setInputUrl('')
    setParsed(null)
    setParams([])
    setError('')
  }

  // Compile URL from state
  const compiledUrl = (() => {
    if (!parsed) return ''
    try {
      const url = new URL(`${parsed.protocol}//${parsed.host}${parsed.pathname}`)
      params.forEach((p) => {
        if (p.key.trim()) {
          url.searchParams.append(p.key.trim(), p.value)
        }
      })
      url.hash = parsed.hash
      return url.toString()
    } catch (e) {
      return ''
    }
  })()

  const handleCopy = async () => {
    if (!compiledUrl) return
    await navigator.clipboard.writeText(compiledUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Input Field */}
        <div className="space-y-2">
          <Label htmlFor="url-input" className="text-sm font-semibold">
            Enter URL to parse
          </Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="url-input"
              type="text"
              placeholder="e.g. https://example.com/search?q=nextjs&category=code#top"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-(--color-surface-alt) border-(--color-border) focus-visible:ring-(--color-primary)"
            />
            <div className="flex gap-2">
              <Button onClick={handleParse} className="cursor-pointer bg-(--color-primary) text-white hover:bg-(--color-primary-dark)">
                Parse
              </Button>
              <Button variant="outline" onClick={handleClear} className="cursor-pointer border-(--color-border) hover:bg-(--color-surface-alt)">
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Breakdown Output */}
        {parsed && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-(--color-text-secondary)">
                Structure Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-(--color-border) bg-(--color-surface-alt)">
                  <p className="text-[10px] uppercase font-bold text-(--color-text-muted)">Protocol</p>
                  <p className="text-sm font-mono text-(--color-text-primary) mt-0.5">{parsed.protocol}</p>
                </div>
                <div className="p-3.5 rounded-lg border border-(--color-border) bg-(--color-surface-alt)">
                  <p className="text-[10px] uppercase font-bold text-(--color-text-muted)">Host Domain</p>
                  <p className="text-sm font-mono text-(--color-text-primary) mt-0.5">{parsed.host}</p>
                </div>
                <div className="p-3.5 rounded-lg border border-(--color-border) bg-(--color-surface-alt)">
                  <p className="text-[10px] uppercase font-bold text-(--color-text-muted)">Pathname</p>
                  <p className="text-sm font-mono text-(--color-text-primary) mt-0.5">{parsed.pathname}</p>
                </div>
                <div className="p-3.5 rounded-lg border border-(--color-border) bg-(--color-surface-alt)">
                  <p className="text-[10px] uppercase font-bold text-(--color-text-muted)">Hash Fragment</p>
                  <p className="text-sm font-mono text-(--color-text-primary) mt-0.5">{parsed.hash || '(none)'}</p>
                </div>
              </div>
            </div>

            {/* Editable query params */}
            <div className="space-y-4 pt-4 border-t border-(--color-border)">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-(--color-text-secondary)">
                  Query Parameters
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddParam}
                  className="flex items-center gap-1.5 text-xs border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Parameter</span>
                </Button>
              </div>

              {params.length > 0 ? (
                <div className="space-y-2">
                  {params.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Key"
                        value={p.key}
                        onChange={(e) => handleParamChange(p.id, 'key', e.target.value)}
                        className="flex-1 bg-(--color-surface-alt) border-(--color-border) font-mono text-xs focus-visible:ring-(--color-primary)"
                      />
                      <span className="text-(--color-text-muted) font-semibold">=</span>
                      <Input
                        type="text"
                        placeholder="Value"
                        value={p.value}
                        onChange={(e) => handleParamChange(p.id, 'value', e.target.value)}
                        className="flex-1 bg-(--color-surface-alt) border-(--color-border) font-mono text-xs focus-visible:ring-(--color-primary)"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveParam(p.id)}
                        className="w-9 h-9 rounded-lg hover:bg-(--color-surface-alt) hover:text-(--color-danger) cursor-pointer text-(--color-text-muted)"
                        aria-label="Remove parameter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-(--color-text-muted) text-center py-4 border border-dashed border-(--color-border) rounded-lg">
                  No query parameters parsed. Click Add Parameter to create one.
                </p>
              )}
            </div>

            {/* Compiled Output URL */}
            <div className="space-y-2 pt-6 border-t border-(--color-border)">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Compiled Output URL</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs text-(--color-text-primary) break-all">
                {compiledUrl || '(empty)'}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
