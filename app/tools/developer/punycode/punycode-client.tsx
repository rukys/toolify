'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowRightLeft, Check, Copy } from 'lucide-react'
import { toPunycodeDomain, toUnicodeDomain } from '@/lib/utils/punycode-helper'

type PunycodeMode = 'encode' | 'decode'

export default function PunycodeClient() {
  const tool = getToolById('punycode')!
  const [mode, setMode] = useState<PunycodeMode>('encode')
  const [inputText, setInputText] = useState('münchen.de')
  const [outputText, setOutputText] = useState('')
  const [copied, setCopied] = useState(false)

  const handleConvert = () => {
    const raw = inputText.trim()
    if (!raw) {
      setOutputText('')
      return
    }

    if (mode === 'encode') {
      setOutputText(toPunycodeDomain(raw))
    } else {
      setOutputText(toUnicodeDomain(raw))
    }
  }

  useEffect(() => {
    handleConvert()
  }, [inputText, mode])

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
        
        {/* Toggle mode bar */}
        <div className="flex gap-1.5 p-1 rounded-lg bg-(--color-surface-alt) border border-(--color-border) max-w-md">
          {([
            { val: 'encode', label: 'Unicode ➔ Punycode' },
            { val: 'decode', label: 'Punycode ➔ Unicode' },
          ] as { val: PunycodeMode; label: string }[]).map((m) => (
            <button
              key={m.val}
              onClick={() => {
                setMode(m.val)
                setInputText(m.val === 'encode' ? 'münchen.de' : 'xn--mnchen-3ya.de')
              }}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all cursor-pointer ${
                mode === m.val
                  ? 'bg-(--color-primary) text-white'
                  : 'text-(--color-text-secondary) hover:bg-(--color-surface)'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Text areas split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input text */}
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="punycode-input" className="text-sm font-semibold">
              {mode === 'encode' ? 'Unicode Domain (IDN)' : 'ASCII Punycode Domain'}
            </Label>
            <textarea
              id="punycode-input"
              rows={6}
              placeholder={mode === 'encode' ? 'e.g. münchen.de' : 'e.g. xn--mnchen-3ya.de'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted) resize-y flex-1"
            />
          </div>

          {/* Output text */}
          <div className="space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="punycode-output" className="text-sm font-semibold">Converted Result</Label>
                {outputText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 text-xs text-(--color-text-secondary) cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className={copied ? 'text-green-500 font-semibold' : ''}>{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                )}
              </div>
              <textarea
                id="punycode-output"
                rows={6}
                readOnly
                value={outputText}
                className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs text-(--color-text-primary) focus:outline-none resize-y"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={handleClear}
              className="border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer h-9 text-xs mt-2 w-full"
            >
              Clear input
            </Button>
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
