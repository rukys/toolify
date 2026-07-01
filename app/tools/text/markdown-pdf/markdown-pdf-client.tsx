'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Printer, FileCode, Sparkles } from 'lucide-react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

type ThemeType = 'github' | 'academic' | 'modern'

const DEFAULT_MARKDOWN = `# Project Document

## Introduction
This is an example document compiled from **Markdown** to a styled **PDF** print sheet.

### Key Highlights
- **100% Client-Side:** No server data transmission.
- **Custom Themes:** Choose between Github, Academic, or Modern styles.
- **Instant Export:** Click the print button to save directly as PDF.

---

## Code Example
\`\`\`javascript
function calculateScore(weight, factor) {
  return weight * factor;
}
\`\`\`

## Blockquote Example
> "Simplicity is the ultimate sophistication." — Leonardo da Vinci
`

export default function MarkdownPDFClient() {
  const tool = getToolById('markdown-pdf')!
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)
  const [theme, setTheme] = useState<ThemeType>('modern')
  const [compiledHtml, setCompiledHtml] = useState('')

  const handleCompile = async () => {
    try {
      const parsed = await marked.parse(markdown)
      // Sanitize compiled HTML using DOMPurify (runs client-side)
      const clean = DOMPurify.sanitize(parsed)
      setCompiledHtml(clean)
    } catch {
      setCompiledHtml('<p className="text-red-500 font-bold">Failed to compile markdown.</p>')
    }
  }

  useEffect(() => {
    handleCompile()
  }, [markdown])

  const handlePrint = () => {
    window.print()
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Print Media query overrides */}
        <style>{`
          @media print {
            /* Hide entire page header, sidebar, controls */
            body * {
              visibility: hidden;
            }
            /* Show only the styled compiled print-area */
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              background: white !important;
              color: black !important;
            }
          }
        `}</style>

        {/* Configurations selector */}
        <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Document Style Theme</Label>
            <div className="flex gap-1.5">
              {([
                { val: 'github', label: 'Github' },
                { val: 'academic', label: 'Academic (Serif)' },
                { val: 'modern', label: 'Modern Minimal' },
              ] as { val: ThemeType; label: string }[]).map((t) => (
                <button
                  key={t.val}
                  onClick={() => setTheme(t.val)}
                  className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
                    theme === t.val
                      ? 'bg-(--color-primary) text-white border-transparent'
                      : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handlePrint}
            className="bg-(--color-primary) text-white hover:bg-(--color-primary-dark) cursor-pointer text-xs flex items-center gap-1.5 h-9"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save to PDF</span>
          </Button>
        </div>

        {/* Input and Preview Split Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input text area */}
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="markdown-input" className="text-sm font-semibold">Markdown Source Editor</Label>
            <textarea
              id="markdown-input"
              rows={14}
              placeholder="Write markdown here..."
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted) resize-y flex-1"
            />
          </div>

          {/* Compiled Styled Print Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Styled Preview Document</Label>
            <div className="p-6 rounded-xl border border-(--color-border) bg-white text-black overflow-y-auto max-h-[400px] shadow-inner">
              
              {/* Document wrapper applying theme classes */}
              <div
                id="print-area"
                className={`prose max-w-none ${
                  theme === 'github'
                    ? 'font-sans text-sm space-y-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:border-b [&_h1]:pb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:border-b [&_h2]:pb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:font-mono [&_pre]:text-xs'
                    : theme === 'academic'
                    ? 'font-serif text-base leading-relaxed space-y-5 [&_h1]:text-3xl [&_h1]:font-normal [&_h1]:text-center [&_h2]:text-2xl [&_h2]:font-normal [&_blockquote]:border-l-2 [&_blockquote]:border-black [&_blockquote]:pl-6 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-6'
                    : 'font-sans text-sm space-y-4 [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-blue-900 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-blue-800 [&_blockquote]:bg-blue-50/50 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:p-3 [&_blockquote]:rounded-r-md [&_ul]:list-disc [&_ul]:pl-5 [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:font-mono [&_pre]:text-xs'
                }`}
                dangerouslySetInnerHTML={{ __html: compiledHtml }}
              />
              
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
