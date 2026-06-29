'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Copy, Check, RefreshCw, Layers } from 'lucide-react'

const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: 'Il1O0',
}

interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

function generatePassword(options: PasswordOptions): string {
  let charset = ''
  if (options.uppercase) charset += CHARS.uppercase
  if (options.lowercase) charset += CHARS.lowercase
  if (options.numbers) charset += CHARS.numbers
  if (options.symbols) charset += CHARS.symbols
  
  if (options.excludeAmbiguous) {
    charset = charset.split('').filter(c => !CHARS.ambiguous.includes(c)).join('')
  }

  if (!charset) throw new Error('Select at least one character type')

  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)
  
  return Array.from(array, n => charset[n % charset.length]).join('')
}

function getPasswordStrength(password: string): 'weak' | 'fair' | 'strong' | 'very-strong' {
  if (!password) return 'weak'
  let score = 0
  if (password.length >= 10) score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  if (score <= 2) return 'weak'
  if (score <= 3) return 'fair'
  if (score <= 5) return 'strong'
  return 'very-strong'
}

export default function PasswordClient() {
  const tool = getToolById('password-generator')!

  // Password Options States
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)

  // Outputs
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([])
  const [bulkCopiedIdx, setBulkCopiedIdx] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleGenerate = useCallback(() => {
    setError('')
    try {
      const pass = generatePassword({
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
        excludeAmbiguous,
      })
      setPassword(pass)
    } catch (err) {
      setPassword('')
      setError(err instanceof Error ? err.message : 'Error generating password')
    }
  }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous])

  // Live generate on options change
  useEffect(() => {
    const timer = setTimeout(() => {
      handleGenerate()
    }, 0)
    return () => clearTimeout(timer)
  }, [handleGenerate])

  const handleBulkGenerate = () => {
    setError('')
    setBulkCopiedIdx(null)
    try {
      const list = Array.from({ length: 10 }, () =>
        generatePassword({
          length,
          uppercase,
          lowercase,
          numbers,
          symbols,
          excludeAmbiguous,
        })
      )
      setBulkPasswords(list)
    } catch (err) {
      setBulkPasswords([])
      setError(err instanceof Error ? err.message : 'Error generating passwords')
    }
  }

  const handleCopySingle = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyBulk = async (idx: number, pass: string) => {
    await navigator.clipboard.writeText(pass)
    setBulkCopiedIdx(idx)
    setTimeout(() => setBulkCopiedIdx(null), 2000)
  }

  const strength = getPasswordStrength(password)
  const strengthDetails = {
    'weak': { label: 'Weak', color: 'bg-red-500', text: 'text-red-500', width: 'w-1/4' },
    'fair': { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500', width: 'w-2/4' },
    'strong': { label: 'Strong', color: 'bg-green-500', text: 'text-green-500', width: 'w-3/4' },
    'very-strong': { label: 'Very Strong', color: 'bg-emerald-600', text: 'text-emerald-600', width: 'w-full' },
  }[strength]

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Main Password Output Panel */}
        <div className="space-y-4">
          <div className="relative flex items-center justify-between p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
            <span className="font-mono text-sm sm:text-base md:text-lg font-bold select-all break-all pr-12 text-(--color-primary)">
              {password || <span className="text-(--color-text-muted) italic font-normal text-sm">Select options below...</span>}
            </span>
            <div className="absolute right-3 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGenerate}
                disabled={!uppercase && !lowercase && !numbers && !symbols}
                className="w-8 h-8 cursor-pointer hover:bg-(--color-surface)"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4 text-(--color-text-secondary)" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopySingle}
                disabled={!password}
                className="w-8 h-8 cursor-pointer hover:bg-(--color-surface)"
                title="Copy"
              >
                {copied ? <Check className="w-4 h-4 text-(--color-success)" /> : <Copy className="w-4 h-4 text-(--color-text-secondary)" />}
              </Button>
            </div>
          </div>

          {/* Strength Bar */}
          {password && (
            <div className="space-y-1.5 px-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-(--color-text-secondary) font-medium">Strength:</span>
                <span className={`font-semibold ${strengthDetails.text}`}>{strengthDetails.label}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full ${strengthDetails.color} ${strengthDetails.width} transition-all duration-300`} />
              </div>
            </div>
          )}
        </div>

        {/* Options Box */}
        <div className="space-y-4 p-4 rounded-2xl border border-(--color-border) bg-(--color-surface-alt)">
          <h3 className="text-sm font-semibold border-b border-(--color-border) pb-1">Password Options</h3>

          {/* Length Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-(--color-text-secondary)">
              <Label htmlFor="pass-length">Length</Label>
              <span className="font-mono font-semibold">{length} characters</span>
            </div>
            <input
              id="pass-length"
              type="range"
              min="8"
              max="128"
              step="1"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-(--color-primary) cursor-pointer"
            />
          </div>

          {/* Character Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2.5 text-xs sm:text-sm cursor-pointer select-none">
              <Checkbox
                checked={uppercase}
                onCheckedChange={(checked) => setUppercase(!!checked)}
                className="cursor-pointer"
              />
              <span>Uppercase Letters (A-Z)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs sm:text-sm cursor-pointer select-none">
              <Checkbox
                checked={lowercase}
                onCheckedChange={(checked) => setLowercase(!!checked)}
                className="cursor-pointer"
              />
              <span>Lowercase Letters (a-z)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs sm:text-sm cursor-pointer select-none">
              <Checkbox
                checked={numbers}
                onCheckedChange={(checked) => setNumbers(!!checked)}
                className="cursor-pointer"
              />
              <span>Numbers (0-9)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs sm:text-sm cursor-pointer select-none">
              <Checkbox
                checked={symbols}
                onCheckedChange={(checked) => setSymbols(!!checked)}
                className="cursor-pointer"
              />
              <span>Symbols (!@#$...)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs sm:text-sm cursor-pointer select-none sm:col-span-2 pt-1 border-t border-(--color-border)/50 mt-1">
              <Checkbox
                checked={excludeAmbiguous}
                onCheckedChange={(checked) => setExcludeAmbiguous(!!checked)}
                className="cursor-pointer"
              />
              <span className="text-xs text-(--color-text-secondary)">Exclude ambiguous characters (like I, l, 1, O, 0)</span>
            </label>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Bulk Passwords Action */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkGenerate}
              disabled={!uppercase && !lowercase && !numbers && !symbols}
              className="cursor-pointer text-xs"
            >
              <Layers className="w-4 h-4 mr-2" /> Generate 10 Passwords At Once
            </Button>

            {bulkPasswords.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBulkPasswords([])}
                className="text-xs text-(--color-text-muted) hover:text-(--color-danger) cursor-pointer"
              >
                Clear Bulk List
              </Button>
            )}
          </div>

          {/* Bulk Password List */}
          {bulkPasswords.length > 0 && (
            <div className="border border-(--color-border) rounded-xl overflow-hidden divide-y divide-(--color-border)">
              {bulkPasswords.map((pass, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-(--color-surface-alt)/30 hover:bg-(--color-surface-alt)/65 transition-colors text-xs font-mono"
                >
                  <span className="select-all break-all text-(--color-text-primary) font-semibold pr-4">
                    {pass}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 cursor-pointer"
                    onClick={() => handleCopyBulk(idx, pass)}
                  >
                    {bulkCopiedIdx === idx ? (
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
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
