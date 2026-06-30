'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Info } from 'lucide-react'

const SLANT_FONT: Record<string, string[]> = {
  'A': ['    ___   ', '   /   |  ', '  / /| |  ', ' / ___ |  ', '/_/  |_|  '],
  'B': ['    ____  ', '   / __ ) ', '  / __  | ', ' / /_/ /  ', '/_____/   '],
  'C': ['   ______ ', '  / ____/ ', ' / /      ', '/ /___    ', '\\____/    '],
  'D': ['    ____  ', '   / __ \\ ', '  / / / / ', ' / /_/ /  ', '/_____/   '],
  'E': ['    ______', '   / ____/', '  / __/   ', ' / /___   ', '/_____/   '],
  'F': ['    ______', '   / ____/', '  / __/   ', ' / /      ', '/_/       '],
  'G': ['   ______ ', '  / ____/ ', ' / / __   ', '/ /_/ /   ', '\\____/    '],
  'H': ['    __  __', '   / / / /', '  / /_/ / ', ' / __  /  ', '/_/ /_/   '],
  'I': ['    ____', '   /  _/', '   / /  ', ' _/ /   ', '/___/   '],
  'J': ['       __ ', '      / / ', ' __  / /  ', '/ /_/ /   ', '\\____/    '],
  'K': ['    __ __ ', '   / //_/ ', '  / ,<    ', ' / /| |   ', '/_/ |_|   '],
  'L': ['    __    ', '   / /    ', '  / /     ', ' / /___   ', '/_____/   '],
  'M': ['    __  ___', '   /  |/  /', '  / /|_/ / ', ' / /  / /  ', '/_/  /_/   '],
  'N': ['    _   __', '   / | / /', '  /  |/ / ', ' / /|  /  ', '/_/ |_/   '],
  'O': ['   ____  ', '  / __ \\ ', ' / / / / ', ' / /_/ / ', '\\____/   '],
  'P': ['    ____  ', '   / __ \\ ', '  / /_/ / ', ' / ____/  ', '/_/       '],
  'Q': ['   ____   ', '  / __ \\  ', ' / / / /  ', '/ /_/ /__ ', '\\___\\_\\_\\ '],
  'R': ['    ____  ', '   / __ \\ ', '  / /_/ / ', ' / _, _/  ', '/_/ |_|   '],
  'S': ['   _____', '  / ___/', '  \\__ \\ ', ' ___/ / ', '/____/  '],
  'T': ['  ______', ' /_  __/', '  / /   ', ' / /    ', '/_/     '],
  'U': ['   __  __ ', '  / / / / ', ' / / / /  ', '/ /_/ /   ', '\\____/    '],
  'V': ['   _    __', '  | |  / /', '  | | / / ', '  | |/ /  ', '  |___/   '],
  'W': [' _      __', '| | /| / /', '| |/ |/ / ', '|__/\'__/__/', '(_/(_/(_/ '],
  'X': ['   _  __', '  | |/ /', '  |   / ', ' /   |  ', '/_/|_|  '],
  'Y': ['  __  __', '  \\ \\/ /', '   \\  / ', '   / /  ', '  /_/   '],
  'Z': ['  ____  ', ' /_  /  ', '  / /_  ', ' /___/  ', '/____/  '],
  '0': ['   ____  ', '  / __ \\ ', ' / / / / ', '/ /_/ /  ', '\\____/   '],
  '1': ['   ____', '  /  _/', '  / /  ', ' _/ /  ', '/___/  '],
  '2': ['  ___ ', ' |__ \\', ' ___) |', '/ __/ ', '/____/ '],
  '3': ['  _____', ' |__  /', '  /_ < ', '___/ / ', '/____/ '],
  '4': ['  __   __', ' / /  / /', '/ /__/ / ', '\\___  /  ', '   /_/   '],
  '5': ['  _____', ' |____|', ' |  __\\ ', ' | |___ ', ' |_____|'],
  '6': ['   _____', '  / ___/', ' / __ \\ ', '/ /_/ / ', '\\____/  '],
  '7': ['  _____', ' /_  _/', '  / /  ', ' / /   ', '/_/    '],
  '8': ['   ____ ', '  / __ \\', ' / /_/ /', ' \\__, / ', '/____/  '],
  '9': ['   ____ ', '  / __ \\', '  \\____/', '  / /   ', ' /_/    '],
  ' ': ['      ', '      ', '      ', '      ', '      '],
  '-': ['      ', '      ', ' _____', '/____/', '      '],
  '!': ['   ', '  !', '  !', '   ', '  *'],
}

export default function ASCIIArtClient() {
  const tool = getToolById('ascii-art')!
  const [inputText, setInputText] = useState('CODE')
  const [art, setArt] = useState('')
  const [copied, setCopied] = useState(false)

  const generateArt = () => {
    const cleanInput = inputText.trim()
    if (!cleanInput) {
      setArt('')
      return
    }

    // Construct 5 lines of ASCII Slant
    const lines = ['', '', '', '', '']
    
    for (let charIndex = 0; charIndex < cleanInput.length; charIndex++) {
      const char = cleanInput[charIndex].toUpperCase()
      const segments = SLANT_FONT[char] || SLANT_FONT[' ']

      for (let lineIndex = 0; lineIndex < 5; lineIndex++) {
        lines[lineIndex] += segments[lineIndex]
      }
    }

    setArt(lines.join('\n'))
  }

  useEffect(() => {
    generateArt()
  }, [inputText])

  const handleCopy = async () => {
    if (!art) return
    await navigator.clipboard.writeText(art)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Input parameters */}
        <div className="space-y-2">
          <Label htmlFor="art-text-input" className="text-sm font-semibold">Enter Text Banner</Label>
          <div className="flex gap-2">
            <Input
              id="art-text-input"
              type="text"
              maxLength={15}
              placeholder="e.g. CODE"
              value={inputText}
              onChange={(e) => setInputText(e.target.value.replace(/[^a-zA-Z0-9\s!\-]/g, ''))}
              className="flex-1 bg-(--color-surface-alt) border-(--color-border) font-mono text-sm focus-visible:ring-(--color-primary)"
            />
            <Button
              variant="outline"
              onClick={() => setInputText('')}
              className="border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer"
            >
              Clear
            </Button>
          </div>
          <span className="text-[10px] text-(--color-text-muted) font-semibold block">
            Supports A-Z, 0-9, Spaces, Hyphens, and Exclamation. Max 15 characters to prevent wraps.
          </span>
        </div>

        {/* Art display output */}
        {art && (
          <div className="space-y-3 pt-4 border-t border-(--color-border) animate-fade-in">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">ASCII Art Output</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500 font-semibold">Copied Art!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Art</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-[9px] sm:text-xs text-(--color-text-primary) overflow-x-auto whitespace-pre leading-none select-all shadow-inner">
              {art}
            </pre>
          </div>
        )}

        {/* Instructions Info block */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">💡 ASCII Art Best Practices</h4>
            <p className="text-xs mt-1 leading-relaxed">
              ASCII art banners are commonly used to decorate source code headers, README markdown logs, CLI entry displays, and config scripts. Copying the generated art exports it with exact spacing blocks.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
