'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AlertCircle, ArrowLeftRight, Copy, Check, Download } from 'lucide-react'
import { jsonToCsv, csvToJson } from '@/lib/utils/csv-helper'

type Mode = 'json-to-csv' | 'csv-to-json'

export default function CSVConverterClient() {
  const tool = getToolById('csv-converter')!
  const [mode, setMode] = useState<Mode>('json-to-csv')
  const [input, setInput] = useState(`[
  {
    "id": 1,
    "name": "Alex",
    "role": "Developer",
    "active": true
  },
  {
    "id": 2,
    "name": "Sarah",
    "role": "Designer",
    "active": false
  }
]`)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleConvert = () => {
    setError('')
    setOutput('')

    if (!input.trim()) return

    try {
      if (mode === 'json-to-csv') {
        const csv = jsonToCsv(input)
        setOutput(csv)
      } else {
        const json = csvToJson(input)
        setOutput(json)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed. Please verify syntax.')
    }
  }

  const handleToggleMode = () => {
    const nextMode = mode === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv'
    setMode(nextMode)
    setError('')
    setOutput('')
    
    // Set some demo text based on the new mode
    if (nextMode === 'csv-to-json') {
      setInput(`id,name,role,active\n1,Alex,Developer,true\n2,Sarah,Designer,false`)
    } else {
      setInput(`[\n  {\n    "id": 1,\n    "name": "Alex",\n    "role": "Developer",\n    "active": true\n  }\n]`)
    }
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!output) return
    const fileExtension = mode === 'json-to-csv' ? 'csv' : 'json'
    const mimeType = mode === 'json-to-csv' ? 'text/csv' : 'application/json'
    const blob = new Blob([output], { type: `${mimeType};charset=utf-8;` })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `converted_data.${fileExtension}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Toggle Mode Button */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          <div className="text-sm font-semibold">
            Mode:{' '}
            <span className="text-(--color-primary) font-bold">
              {mode === 'json-to-csv' ? 'JSON to CSV' : 'CSV to JSON'}
            </span>
          </div>
          <Button
            onClick={handleToggleMode}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-xs border-(--color-border) hover:bg-(--color-surface) cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap Directions</span>
          </Button>
        </div>

        {/* Input Text Area */}
        <div className="space-y-2">
          <Label htmlFor="csv-converter-input" className="text-sm font-semibold">
            {mode === 'json-to-csv' ? 'JSON Input (Array of Objects)' : 'CSV Input'}
          </Label>
          <textarea
            id="csv-converter-input"
            rows={8}
            placeholder={
              mode === 'json-to-csv'
                ? '[\n  { "name": "John", "age": 30 },\n  { "name": "Jane", "age": 25 }\n]'
                : 'name,age\nJohn,30\nJane,25'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted)"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1 bg-(--color-primary) text-white hover:bg-(--color-primary-dark) cursor-pointer">
            Convert
          </Button>
          <Button variant="outline" onClick={handleClear} className="border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer">
            Clear
          </Button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Output Area */}
        {output && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                {mode === 'json-to-csv' ? 'CSV Output' : 'JSON Output'}
              </Label>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-1 text-xs text-(--color-text-secondary) cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-(--color-text-secondary) cursor-pointer"
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
            </div>
            <textarea
              readOnly
              rows={8}
              value={output}
              className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none text-(--color-text-primary)"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
