'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { OutputArea } from '@/components/tool/output-area'
import { Info } from 'lucide-react'

function encodeURL(input: string): string {
  return encodeURIComponent(input)
}

function decodeURL(input: string): string {
  try {
    return decodeURIComponent(input)
  } catch {
    throw new Error('Invalid URL-encoded string. Verify that percent symbols are followed by valid hexadecimal values (e.g., %20).')
  }
}

export default function URLClient() {
  const tool = getToolById('url-encode')!
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')

  // Compute output and error on the fly during render
  let output = ''
  let error = ''
  if (input) {
    try {
      if (activeTab === 'encode') {
        output = encodeURL(input)
      } else {
        output = decodeURL(input)
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
    }
  }

  const handleClear = () => {
    setInput('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as 'encode' | 'decode')
            handleClear()
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-[var(--color-surface-alt)]">
            <TabsTrigger value="encode" className="cursor-pointer">URL Encode</TabsTrigger>
            <TabsTrigger value="decode" className="cursor-pointer">URL Decode</TabsTrigger>
          </TabsList>

          {/* Encode Panel */}
          <TabsContent value="encode" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="encode-url-input" className="text-sm font-semibold">
                Text or URL parameters to Encode
              </Label>
              <textarea
                id="encode-url-input"
                rows={6}
                placeholder="Type or paste the plain text here... e.g., name=John Doe&city=New York"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          </TabsContent>

          {/* Decode Panel */}
          <TabsContent value="decode" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="decode-url-input" className="text-sm font-semibold">
                Percent-encoded URL parameters to Decode
              </Label>
              <textarea
                id="decode-url-input"
                rows={6}
                placeholder="Paste your percent-encoded URL query here... e.g., name=John%20Doe&city=New%20York"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] font-mono text-sm focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="font-mono">{error}</div>
          </div>
        )}

        {/* Output Area */}
        {output && (
          <div className="space-y-2">
            <OutputArea
              mode="text"
              content={output}
              label={activeTab === 'encode' ? 'Encoded URL String' : 'Decoded Plain Text'}
            />
          </div>
        )}

        {/* Clear Button */}
        {input && (
          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              onClick={handleClear}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] cursor-pointer text-xs"
            >
              Reset / Clear Inputs
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
