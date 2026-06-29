'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CodeHighlight } from '@/components/tool/code-highlight'
import { Copy, Check } from 'lucide-react'
import YAML from 'yaml'

export default function YAMLClient() {
  const tool = getToolById('json-yaml-converter')!
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'json-to-yaml' | 'yaml-to-json'>('json-to-yaml')
  const [indent, setIndent] = useState<'2' | '4'>('2')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleConvert = () => {
    setError('')
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      const indentSize = Number(indent)
      if (mode === 'json-to-yaml') {
        const parsed = JSON.parse(input)
        const result = YAML.stringify(parsed, { indent: indentSize })
        setOutput(result)
      } else {
        const parsed = YAML.parse(input)
        if (parsed === null || parsed === undefined) {
          throw new Error('YAML input parsed to empty/null value')
        }
        const result = JSON.stringify(parsed, null, indentSize)
        setOutput(result)
      }
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : 'Conversion failed. Please verify input syntax.')
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
        {/* Conversion Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mode-select" className="text-sm font-semibold">
              Conversion Mode
            </Label>
            <Select
              value={mode}
              onValueChange={(val) => {
                setMode(val as 'json-to-yaml' | 'yaml-to-json')
                setInput('')
                setOutput('')
                setError('')
              }}
            >
              <SelectTrigger id="mode-select" className="w-full bg-(--color-surface-alt) border-(--color-border) cursor-pointer">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json-to-yaml">JSON to YAML</SelectItem>
                <SelectItem value="yaml-to-json">YAML to JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="indent-select" className="text-sm font-semibold">
              Indentation (Spaces)
            </Label>
            <Select value={indent} onValueChange={(val) => setIndent(val as '2' | '4')}>
              <SelectTrigger id="indent-select" className="w-full bg-(--color-surface-alt) border-(--color-border) cursor-pointer">
                <SelectValue placeholder="Select spaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Spaces</SelectItem>
                <SelectItem value="4">4 Spaces</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Input Textarea */}
        <div className="space-y-2">
          <Label htmlFor="yaml-input" className="text-sm font-semibold">
            {mode === 'json-to-yaml' ? 'Raw JSON Input' : 'Raw YAML Input'}
          </Label>
          <textarea
            id="yaml-input"
            rows={8}
            placeholder={
              mode === 'json-to-yaml'
                ? 'Paste raw JSON here... e.g. {"name": "Toolify", "tags": ["converter"]}'
                : 'Paste raw YAML here... e.g.\nname: Toolify\ntags:\n  - converter'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-sm focus:border-(--color-primary) focus:outline-none placeholder:text-(--color-text-muted)"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleConvert} className="cursor-pointer bg-(--color-primary) text-white hover:bg-(--color-primary-dark)">
            Convert
          </Button>
          <Button variant="outline" onClick={handleClear} className="cursor-pointer border-(--color-border) hover:bg-(--color-surface-alt)">
            Clear
          </Button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium">
            ❌ {error}
          </div>
        )}

        {/* Output Block */}
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Formatted Output</Label>
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
            <div className="rounded-xl overflow-hidden border border-(--color-border)">
              <CodeHighlight
                code={output}
                language={mode === 'json-to-yaml' ? 'yaml' : 'json'}
              />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
