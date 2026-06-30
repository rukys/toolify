'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { AlertCircle, Copy, Check } from 'lucide-react'

export default function JSONtoTSClient() {
  const tool = getToolById('json-to-ts')!
  const [jsonInput, setJsonInput] = useState(`{
  "id": 101,
  "title": "Clean Code Handbook",
  "author": {
    "name": "Robert C. Martin",
    "verified": true
  },
  "tags": ["software", "engineering", "quality"]
}`)
  const [rootName, setRootName] = useState('RootObject')
  const [tsOutput, setTsOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    setError('')
    setTsOutput('')

    const cleaned = jsonInput.trim()
    if (!cleaned) return

    try {
      const obj = JSON.parse(cleaned)
      const interfaces: string[] = []
      const processedObjects = new Set<string>()

      const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

      function generate(value: any, name: string): string {
        if (value === null) return 'any'
        if (Array.isArray(value)) {
          if (value.length === 0) return 'any[]'
          
          const types = new Set<string>()
          value.forEach(item => {
            types.add(generate(item, name + 'Item'))
          })
          const unionType = Array.from(types).join(' | ')
          return `(${unionType})[]`
        }

        if (typeof value === 'object') {
          const keys = Object.keys(value)
          const lines = keys.map(key => {
            const capitalizedKey = capitalize(key)
            const typeVal = generate(value[key], name + capitalizedKey)
            return `  ${key}: ${typeVal};`
          })

          const interfaceName = capitalize(name)
          const interfaceStr = `export interface ${interfaceName} {\n${lines.join('\n')}\n}`

          if (!processedObjects.has(interfaceName)) {
            processedObjects.add(interfaceName)
            interfaces.push(interfaceStr)
          }
          return interfaceName
        }

        return typeof value
      }

      generate(obj, rootName || 'RootObject')
      
      // Merge all generated interfaces
      setTsOutput(interfaces.reverse().join('\n\n'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON input format.')
    }
  }

  const handleCopy = async () => {
    if (!tsOutput) return
    await navigator.clipboard.writeText(tsOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setJsonInput('')
    setTsOutput('')
    setError('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Root name input */}
          <div className="sm:col-span-3 space-y-2">
            <Label htmlFor="root-name-input" className="text-sm font-semibold">Root Interface Name</Label>
            <Input
              id="root-name-input"
              type="text"
              placeholder="e.g. UserProfile"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              className="bg-(--color-surface-alt) border-(--color-border) focus-visible:ring-(--color-primary) font-mono text-sm max-w-[200px]"
            />
          </div>
        </div>

        {/* JSON input text area */}
        <div className="space-y-2">
          <Label htmlFor="json-input" className="text-sm font-semibold">JSON Input payload</Label>
          <textarea
            id="json-input"
            rows={8}
            placeholder="Paste JSON object here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted)"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleGenerate} className="flex-1 bg-(--color-primary) text-white hover:bg-(--color-primary-dark) cursor-pointer">
            Generate TypeScript
          </Button>
          <Button variant="outline" onClick={handleClear} className="border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer">
            Clear
          </Button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TS interfaces Output */}
        {tsOutput && (
          <div className="space-y-2 pt-4 border-t border-(--color-border) animate-fade-in">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Generated TypeScript Interfaces</Label>
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
                    <span>Copy TS Code</span>
                  </>
                )}
              </Button>
            </div>
            <textarea
              readOnly
              rows={10}
              value={tsOutput}
              className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none text-(--color-text-primary)"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
