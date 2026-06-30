'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, AlertCircle } from 'lucide-react'

export default function BaseConverterClient() {
  const tool = getToolById('base-converter')!
  const [val, setVal] = useState('42')
  const [fromBase, setFromBase] = useState(10)
  const [toBase, setToBase] = useState(16)

  const [converted, setConverted] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Standard computer science bases comparison
  const [comparisons, setComparisons] = useState({
    bin: '',
    oct: '',
    dec: '',
    hex: '',
  })

  const performConversion = () => {
    setError('')
    const input = val.trim()
    if (!input) {
      setConverted('')
      setComparisons({ bin: '', oct: '', dec: '', hex: '' })
      return
    }

    const parsed = parseInt(input, fromBase)
    if (isNaN(parsed)) {
      setError(`Invalid characters for a Base-${fromBase} number.`)
      setConverted('')
      setComparisons({ bin: '', oct: '', dec: '', hex: '' })
      return
    }

    // Convert to target base
    setConverted(parsed.toString(toBase).toUpperCase())

    // Convert to standard bases
    setComparisons({
      bin: parsed.toString(2).toUpperCase(),
      oct: parsed.toString(8).toUpperCase(),
      dec: parsed.toString(10).toUpperCase(),
      hex: parsed.toString(16).toUpperCase(),
    })
  }

  useEffect(() => {
    performConversion()
  }, [val, fromBase, toBase])

  const handleCopy = async () => {
    if (!converted) return
    await navigator.clipboard.writeText(converted)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setVal('')
    setConverted('')
    setError('')
    setComparisons({ bin: '', oct: '', dec: '', hex: '' })
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Numerical Input */}
          <div className="space-y-2">
            <Label htmlFor="num-input" className="text-sm font-semibold">Value to Convert</Label>
            <div className="flex gap-1.5">
              <Input
                id="num-input"
                type="text"
                placeholder="e.g. 42 or 101010"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="bg-(--color-surface-alt) border-(--color-border) font-mono text-sm focus-visible:ring-(--color-primary)"
              />
              <Button variant="outline" onClick={handleClear} className="border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer shrink-0">
                Clear
              </Button>
            </div>
          </div>

          {/* From Base */}
          <div className="space-y-2">
            <Label htmlFor="from-base" className="text-sm font-semibold">From Base</Label>
            <select
              id="from-base"
              value={fromBase}
              onChange={(e) => setFromBase(Number(e.target.value))}
              className="w-full h-9 rounded-md border border-(--color-border) bg-(--color-surface-alt) px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) text-(--color-text-primary)"
            >
              {Array.from({ length: 35 }, (_, i) => i + 2).map((b) => (
                <option key={b} value={b}>
                  Base {b} {b === 2 ? '(Binary)' : b === 8 ? '(Octal)' : b === 10 ? '(Decimal)' : b === 16 ? '(Hex)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* To Base */}
          <div className="space-y-2">
            <Label htmlFor="to-base" className="text-sm font-semibold">To Base</Label>
            <select
              id="to-base"
              value={toBase}
              onChange={(e) => setToBase(Number(e.target.value))}
              className="w-full h-9 rounded-md border border-(--color-border) bg-(--color-surface-alt) px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) text-(--color-text-primary)"
            >
              {Array.from({ length: 35 }, (_, i) => i + 2).map((b) => (
                <option key={b} value={b}>
                  Base {b} {b === 2 ? '(Binary)' : b === 8 ? '(Octal)' : b === 10 ? '(Decimal)' : b === 16 ? '(Hex)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Conversion Result */}
        {converted && (
          <div className="space-y-4 pt-4 border-t border-(--color-border) animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Base-{toBase} Converted Output</Label>
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
              <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-base font-bold text-(--color-text-primary) tracking-wide">
                {converted}
              </div>
            </div>

            {/* Standard comparison table cards */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-(--color-text-muted)">
                Common Bases Comparison
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-lg border border-(--color-border) bg-(--color-surface-alt)">
                  <span className="text-[9px] uppercase font-bold text-(--color-text-muted)">Binary (Base 2)</span>
                  <p className="text-xs font-mono font-bold text-(--color-text-primary) mt-1 break-all select-all">
                    {comparisons.bin}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-(--color-border) bg-(--color-surface-alt)">
                  <span className="text-[9px] uppercase font-bold text-(--color-text-muted)">Octal (Base 8)</span>
                  <p className="text-xs font-mono font-bold text-(--color-text-primary) mt-1 break-all select-all">
                    {comparisons.oct}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-(--color-border) bg-(--color-surface-alt)">
                  <span className="text-[9px] uppercase font-bold text-(--color-text-muted)">Decimal (Base 10)</span>
                  <p className="text-xs font-mono font-bold text-(--color-text-primary) mt-1 break-all select-all">
                    {comparisons.dec}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-(--color-border) bg-(--color-surface-alt)">
                  <span className="text-[9px] uppercase font-bold text-(--color-text-muted)">Hex (Base 16)</span>
                  <p className="text-xs font-mono font-bold text-(--color-text-primary) mt-1 break-all select-all">
                    {comparisons.hex}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
