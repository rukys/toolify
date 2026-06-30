'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Copy, Check, ArrowLeftRight } from 'lucide-react'
import { caesarCipher, vigenereCipher, rot13, morseCode } from '@/lib/utils/cipher-helper'

type CipherType = 'caesar' | 'vigenere' | 'rot13' | 'morse'
type Direction = 'encode' | 'decode'

export default function CiphersClient() {
  const tool = getToolById('ciphers')!
  const [cipherType, setCipherType] = useState<CipherType>('caesar')
  const [direction, setDirection] = useState<Direction>('encode')
  const [caesarShift, setCaesarShift] = useState(3)
  const [vigenereKey, setVigenereKey] = useState('KEY')
  const [input, setInput] = useState('Hello World')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleProcess = () => {
    const cleanedInput = input.trim()
    if (!cleanedInput) {
      setOutput('')
      return
    }

    try {
      if (cipherType === 'caesar') {
        setOutput(caesarCipher(input, caesarShift, direction))
      } else if (cipherType === 'vigenere') {
        setOutput(vigenereCipher(input, vigenereKey, direction))
      } else if (cipherType === 'rot13') {
        setOutput(rot13(input))
      } else if (cipherType === 'morse') {
        setOutput(morseCode(input, direction))
      }
    } catch {
      setOutput('Error processing text. Check input syntax.')
    }
  }

  useEffect(() => {
    handleProcess()
  }, [input, cipherType, direction, caesarShift, vigenereKey])

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleDirection = () => {
    setDirection((prev) => (prev === 'encode' ? 'decode' : 'encode'))
    // Swap input and output to simplify reverse translation
    if (output) {
      setInput(output)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Cipher Type selector buttons */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-(--color-text-muted)">Select Cipher Engine</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {([
              { value: 'caesar', label: 'Caesar Shift' },
              { value: 'vigenere', label: 'Vigenère Key' },
              { value: 'rot13', label: 'ROT13' },
              { value: 'morse', label: 'Morse Code' },
            ] as { value: CipherType; label: string }[]).map((c) => (
              <button
                key={c.value}
                onClick={() => setCipherType(c.value)}
                className={`text-xs font-semibold py-2 px-3 rounded-lg border transition-colors cursor-pointer ${
                  cipherType === c.value
                    ? 'bg-(--color-primary) text-white border-transparent'
                    : 'border-(--color-border) bg-(--color-surface-alt) hover:bg-(--color-surface) text-(--color-text-secondary)'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Direction & Parameters Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          {/* Action Direction */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Action Direction</Label>
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold capitalize text-(--color-text-primary)">
                {cipherType === 'rot13' ? 'Symmetric (ROT13)' : direction}
              </div>
              {cipherType !== 'rot13' && (
                <Button
                  onClick={handleToggleDirection}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 text-[10px] h-7 border-(--color-border) hover:bg-(--color-surface) cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Swap</span>
                </Button>
              )}
            </div>
          </div>

          {/* Conditional Params (Caesar or Vigenere) */}
          {cipherType === 'caesar' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <Label htmlFor="shift-slider">Shift Offset</Label>
                <span className="text-(--color-primary) font-bold">Shift: {caesarShift}</span>
              </div>
              <input
                id="shift-slider"
                type="range"
                min={1}
                max={25}
                value={caesarShift}
                onChange={(e) => setCaesarShift(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
              />
            </div>
          )}

          {cipherType === 'vigenere' && (
            <div className="space-y-1.5">
              <Label htmlFor="vigenere-key" className="text-xs font-semibold text-(--color-text-muted)">
                Secret Key Phrase
              </Label>
              <Input
                id="vigenere-key"
                type="text"
                placeholder="e.g. KEY"
                value={vigenereKey}
                onChange={(e) => setVigenereKey(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                className="h-8 max-w-[150px] bg-(--color-surface) border-(--color-border) font-mono text-xs focus-visible:ring-(--color-primary)"
              />
            </div>
          )}
        </div>

        {/* Text Input area */}
        <div className="space-y-2">
          <Label htmlFor="cipher-input" className="text-sm font-semibold">Input Text</Label>
          <textarea
            id="cipher-input"
            rows={5}
            placeholder={
              direction === 'encode'
                ? 'Type message to encrypt...'
                : 'Type message to decrypt...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted)"
          />
        </div>

        {/* Output Area */}
        <div className="space-y-2 pt-4 border-t border-(--color-border) animate-fade-in">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Output result</Label>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!output}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs text-(--color-text-secondary) hover:text-(--color-danger) cursor-pointer font-medium"
              >
                Clear
              </Button>
            </div>
          </div>
          <textarea
            readOnly
            rows={5}
            value={output}
            placeholder="Result will display here..."
            className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none text-(--color-text-primary) placeholder:text-(--color-text-muted)"
          />
        </div>
      </div>
    </ToolLayout>
  )
}
