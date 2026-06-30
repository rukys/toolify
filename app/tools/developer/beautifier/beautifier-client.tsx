'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Copy, Check } from 'lucide-react'

type CodeLang = 'html' | 'css' | 'javascript'
type ToolMode = 'beautify' | 'minify'

export default function BeautifierClient() {
  const tool = getToolById('beautifier')!
  const [lang, setLang] = useState<CodeLang>('html')
  const [mode, setMode] = useState<ToolMode>('beautify')
  const [inputCode, setInputCode] = useState('<div class="container">\n<h1>Hello World</h1>\n<p>Lorem ipsum dolor sit amet.</p>\n</div>')
  const [outputCode, setOutputCode] = useState('')
  const [copied, setCopied] = useState(false)

  // Minify Code
  const minifyCode = (code: string, language: CodeLang): string => {
    let clean = code.trim()
    if (language === 'html') {
      return clean
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
    }
    
    // CSS or JavaScript
    clean = clean.replace(/\/\*[\s\S]*?\*\//g, '')
    if (language === 'javascript') {
      clean = clean.replace(/(?:^|[^:])\/\/.*$/gm, '')
    }
    
    return clean
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}::,;+=/*-])\s*/g, '$1')
  }

  // Beautify Code
  const beautifyCode = (code: string, language: CodeLang): string => {
    let clean = code.trim()
    if (language === 'html') {
      let formatted = ''
      let indent = 0
      const tokens = clean.split(/(<\/?[a-zA-Z0-9_\-]+[^>]*>)/).filter(t => t.trim() !== '')
      
      tokens.forEach(token => {
        if (token.startsWith('</')) {
          indent = Math.max(0, indent - 1)
          formatted += '  '.repeat(indent) + token + '\n'
        } else if (token.startsWith('<') && !token.endsWith('/>') && !token.startsWith('<!')) {
          const isSelfClosing = /<(img|br|hr|input|meta|link|col)[^>]*>/i.test(token)
          formatted += '  '.repeat(indent) + token + '\n'
          if (!isSelfClosing) {
            indent++
          }
        } else {
          formatted += '  '.repeat(indent) + token.trim() + '\n'
        }
      })
      return formatted.trim()
    }

    // CSS or JavaScript
    let formatted = ''
    let indent = 0
    const tokens = clean
      .replace(/\s*\{\s*/g, ' {\n')
      .replace(/\s*\}\s*/g, '\n}\n')
      .replace(/\s*;\s*/g, ';\n')
      .split('\n')
      .map(t => t.trim())
      .filter(t => t !== '')

    tokens.forEach(token => {
      if (token.includes('}')) {
        indent = Math.max(0, indent - 1)
      }
      formatted += '  '.repeat(indent) + token + '\n'
      if (token.includes('{')) {
        indent++
      }
    })
    return formatted.trim()
  }

  const handleConvert = () => {
    if (!inputCode.trim()) return
    if (mode === 'beautify') {
      setOutputCode(beautifyCode(inputCode, lang))
    } else {
      setOutputCode(minifyCode(inputCode, lang))
    }
  }

  const handleCopy = async () => {
    if (!outputCode) return
    await navigator.clipboard.writeText(outputCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInputCode('')
    setOutputCode('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Toggle Lang & Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          {/* Lang selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Language</Label>
            <div className="flex gap-1.5">
              {([
                { val: 'html', label: 'HTML' },
                { val: 'css', label: 'CSS' },
                { val: 'javascript', label: 'JavaScript' },
              ] as { val: CodeLang; label: string }[]).map((c) => (
                <button
                  key={c.val}
                  onClick={() => setLang(c.val)}
                  className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
                    lang === c.val
                      ? 'bg-(--color-primary) text-white border-transparent'
                      : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Output Mode</Label>
            <div className="flex gap-1.5">
              {([
                { val: 'beautify', label: 'Beautify (Format)' },
                { val: 'minify', label: 'Minify (Compact)' },
              ] as { val: ToolMode; label: string }[]).map((m) => (
                <button
                  key={m.val}
                  onClick={() => setMode(m.val)}
                  className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
                    mode === m.val
                      ? 'bg-(--color-primary) text-white border-transparent'
                      : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Label htmlFor="code-input" className="text-sm font-semibold">Input Code</Label>
          <textarea
            id="code-input"
            rows={8}
            placeholder={`Paste raw ${lang.toUpperCase()} code...`}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted)"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1 bg-(--color-primary) text-white hover:bg-(--color-primary-dark) cursor-pointer">
            {mode === 'beautify' ? 'Beautify Code' : 'Minify Code'}
          </Button>
          <Button variant="outline" onClick={handleClear} className="border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer">
            Clear
          </Button>
        </div>

        {/* Output */}
        {outputCode && (
          <div className="space-y-2 pt-4 border-t border-(--color-border) animate-fade-in">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Output code result</Label>
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
            <textarea
              readOnly
              rows={8}
              value={outputCode}
              className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none text-(--color-text-primary)"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
