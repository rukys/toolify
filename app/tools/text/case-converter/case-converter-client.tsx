'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { OutputArea } from '@/components/tool/output-area'
import { toast } from 'sonner'
import {
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toSentenceCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
} from '@/lib/utils/string-cases'

type CaseType =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'

export default function CaseConverterClient() {
  const tool = getToolById('case-converter')!
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [activeCase, setActiveCase] = useState<CaseType | null>(null)

  const handleConvert = async (type: CaseType) => {
    if (!input.trim()) {
      toast.error('Please enter some text to convert')
      return
    }

    let result = ''
    let label = ''

    switch (type) {
      case 'upper':
        result = toUpperCase(input)
        label = 'UPPERCASE'
        break
      case 'lower':
        result = toLowerCase(input)
        label = 'lowercase'
        break
      case 'title':
        result = toTitleCase(input)
        label = 'Title Case'
        break
      case 'sentence':
        result = toSentenceCase(input)
        label = 'Sentence case'
        break
      case 'camel':
        result = toCamelCase(input)
        label = 'camelCase'
        break
      case 'pascal':
        result = toPascalCase(input)
        label = 'PascalCase'
        break
      case 'snake':
        result = toSnakeCase(input)
        label = 'snake_case'
        break
      case 'kebab':
        result = toKebabCase(input)
        label = 'kebab-case'
        break
    }

    setOutput(result)
    setActiveCase(type)

    try {
      await navigator.clipboard.writeText(result)
      toast.success(`Converted & Copied: ${label}`)
    } catch {
      toast.warning(`Converted to ${label} (Clipboard access denied)`)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setActiveCase(null)
  }

  const getCaseName = (type: CaseType): string => {
    return {
      upper: 'UPPERCASE',
      lower: 'lowercase',
      title: 'Title Case',
      sentence: 'Sentence case',
      camel: 'camelCase',
      pascal: 'PascalCase',
      snake: 'snake_case',
      kebab: 'kebab-case',
    }[type]
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Input area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="case-input" className="text-sm font-semibold">
              Input Text
            </Label>
            {input && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] cursor-pointer h-8 px-2"
              >
                Clear
              </Button>
            )}
          </div>
          <textarea
            id="case-input"
            rows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here to convert..."
            className="w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)] leading-relaxed"
          />
        </div>

        {/* Buttons Grid */}
        <div className="space-y-3">
          <Label className="text-xs text-[var(--color-text-secondary)] font-semibold">
            Convert & Auto-Copy Options
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['upper', 'lower', 'title', 'sentence', 'camel', 'pascal', 'snake', 'kebab'] as CaseType[]).map((type) => (
              <Button
                key={type}
                variant={activeCase === type ? 'default' : 'outline'}
                onClick={() => handleConvert(type)}
                className="cursor-pointer text-xs py-2 h-9"
              >
                {getCaseName(type)}
              </Button>
            ))}
          </div>
        </div>

        {/* Output Area */}
        {output && (
          <div className="space-y-2 pt-2">
            <OutputArea
              mode="text"
              content={output}
              label={activeCase ? `Converted Result (${getCaseName(activeCase)})` : 'Output'}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
