'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Copy, Check, RefreshCw } from 'lucide-react'

// Local memorable words list (150 words)
const WORD_LIST = [
  'about', 'above', 'actor', 'acute', 'admit', 'adopt', 'adult', 'agent', 'agree', 'ahead',
  'alarm', 'album', 'alert', 'alike', 'alive', 'allow', 'alone', 'along', 'alter', 'among',
  'anger', 'angle', 'angry', 'apart', 'apple', 'apply', 'arena', 'argue', 'arise', 'array',
  'arrow', 'aside', 'asset', 'audio', 'audit', 'avoid', 'award', 'aware', 'awful', 'bacon',
  'badge', 'baker', 'basic', 'basin', 'basis', 'beach', 'beast', 'begin', 'being', 'below',
  'bench', 'berry', 'bible', 'birth', 'black', 'blade', 'blame', 'blind', 'block', 'blood',
  'board', 'boast', 'bonus', 'boost', 'bound', 'brain', 'brand', 'brave', 'bread', 'break',
  'brick', 'bride', 'brief', 'bring', 'broad', 'brush', 'build', 'built', 'bunch', 'buyer',
  'cable', 'cabin', 'camel', 'camera', 'camp', 'canal', 'candy', 'canon', 'cargo', 'carry',
  'carve', 'case', 'cash', 'castle', 'catch', 'cause', 'cedar', 'chain', 'chair', 'chalk',
  'champ', 'chart', 'chase', 'cheap', 'check', 'cheek', 'cheer', 'chef', 'chest', 'chief',
  'child', 'chill', 'china', 'chips', 'choir', 'chose', 'chunk', 'cider', 'cigar', 'claim',
  'class', 'clean', 'clear', 'clerk', 'click', 'cliff', 'climb', 'clock', 'close', 'cloth',
  'cloud', 'coach', 'coast', 'cobra', 'cocoa', 'coded', 'color', 'colt', 'comet', 'comic',
]

type Separator = '-' | ' ' | '_'

export default function PassphraseClient() {
  const tool = getToolById('passphrase')!
  const [wordCount, setWordCount] = useState(4)
  const [separator, setSeparator] = useState<Separator>('-')
  const [passphrase, setPassphrase] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    const array = new Uint32Array(wordCount)
    // Cryptographically secure random number generator in browser
    window.crypto.getRandomValues(array)

    const words: string[] = []
    for (let i = 0; i < wordCount; i++) {
      const index = array[i] % WORD_LIST.length
      words.push(WORD_LIST[index])
    }

    setPassphrase(words.join(separator))
  }

  // Generate initial passphrase on mount
  useEffect(() => {
    handleGenerate()
  }, [])

  const handleCopy = async () => {
    if (!passphrase) return
    await navigator.clipboard.writeText(passphrase)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Configuration settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          {/* Word Count Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <Label htmlFor="word-count-slider">Number of Words</Label>
              <span className="text-(--color-primary) font-bold">{wordCount} words</span>
            </div>
            <input
              id="word-count-slider"
              type="range"
              min={3}
              max={10}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
            />
          </div>

          {/* Separator Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Separator</Label>
            <div className="flex gap-1.5">
              {(['-', ' ', '_'] as Separator[]).map((sep) => (
                <button
                  key={sep}
                  onClick={() => setSeparator(sep)}
                  className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
                    separator === sep
                      ? 'bg-(--color-primary) text-white border-transparent'
                      : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                  }`}
                >
                  {sep === '-' ? 'Hyphen (-)' : sep === ' ' ? 'Space ( )' : 'Underscore (_)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Trigger Button */}
        <Button
          onClick={handleGenerate}
          className="w-full bg-(--color-primary) text-white hover:bg-(--color-primary-dark) cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Generate Secure Passphrase</span>
        </Button>

        {/* Output Area */}
        {passphrase && (
          <div className="space-y-2 pt-4 border-t border-(--color-border) animate-fade-in">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold font-mono">Your Passphrase</Label>
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
            <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) text-center select-all">
              <span className="font-mono text-sm sm:text-base font-bold text-(--color-text-primary) tracking-wide">
                {passphrase}
              </span>
            </div>
          </div>
        )}

        {/* Informational callout box */}
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs leading-relaxed">
          <p className="font-bold text-amber-700 dark:text-amber-300">💡 Why use Diceware Passphrases?</p>
          <p className="mt-1">
            Diceware passphrases are highly resistant to brute-force dictionaries due to their length, yet are far easier for humans to remember than random sequences of symbols (e.g. <code>k1$p#9xZ!</code>). This tool runs entirely in your browser using secure random values.
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}
