'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Printer, ShieldCheck } from 'lucide-react'
import JSZip from 'jszip'

type FontFamily = 'sans' | 'serif' | 'mono'
type MarginSize = 'compact' | 'normal' | 'wide'

export default function DocxToPdfClient() {
  const tool = getToolById('pdf-docx-to-pdf')!
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const [htmlContent, setHtmlContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Styling properties
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans')
  const [margin, setMargin] = useState<MarginSize>('normal')
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setIsProcessing(true)
      setHtmlContent('')

      try {
        const buffer = await file.arrayBuffer()
        const zip = await JSZip.loadAsync(buffer)
        
        const docXmlText = await zip.file('word/document.xml')?.async('text')
        if (!docXmlText) {
          throw new Error('Invalid DOCX document structure. Could not find word/document.xml.')
        }

        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(docXmlText, 'application/xml')

        const paragraphs = xmlDoc.getElementsByTagName('w:p')
        const lines: string[] = []

        for (let i = 0; i < paragraphs.length; i++) {
          const p = paragraphs[i]
          
          // Get all text nodes within paragraph
          const textNodes = p.getElementsByTagName('w:t')
          let pText = ''
          for (let j = 0; j < textNodes.length; j++) {
            pText += textNodes[j].textContent || ''
          }

          // Simple heading detection
          const styleNode = p.getElementsByTagName('w:pStyle')[0]
          const styleVal = styleNode?.getAttribute('w:val') || ''
          
          if (styleVal.toLowerCase().startsWith('heading') && pText.trim()) {
            lines.push(`<h2 class="text-xl font-bold mt-5 mb-2.5 text-slate-900 border-b border-slate-200 pb-1">${pText}</h2>`)
          } else if (pText.trim()) {
            lines.push(`<p class="mb-3 text-slate-800 text-justify">${pText}</p>`)
          }
        }

        if (lines.length === 0) {
          lines.push('<p class="italic text-slate-400">Empty document or unparseable text elements.</p>')
        }

        setHtmlContent(lines.join('\n'))

      } catch (err) {
        alert('Failed to parse Word document. Ensure it is a valid .docx file.')
        setSelectedFile(null)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleClear = () => {
    setSelectedFile(null)
    setHtmlContent('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Dynamic stylesheet injection for high-res print scaling */}
        <style>{`
          @media print {
            header, footer, nav, aside, .no-print, button, input, select, .tool-layout-sidebar {
              display: none !important;
            }
            body {
              background: white !important;
              color: black !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
            }
            #printable-doc {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: transparent !important;
            }
          }
        `}</style>

        {/* Upload zone */}
        {!selectedFile && (
          <div className="space-y-2 no-print">
            <Label className="text-sm font-semibold">Upload Word Document (.docx)</Label>
            <div className="border-2 border-dashed border-(--color-border) rounded-xl p-8 bg-(--color-surface-alt)/40 text-center hover:bg-(--color-surface-alt)/60 transition-colors relative flex flex-col justify-center items-center gap-3">
              <input
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                aria-label="Upload DOCX file"
              />
              <div className="w-12 h-12 rounded-full bg-(--color-surface) border border-(--color-border) flex items-center justify-center shadow-xs">
                <Upload className="w-5 h-5 text-(--color-text-muted)" />
              </div>
              <div>
                <span className="text-xs font-semibold text-(--color-text-secondary) block">
                  Drag and drop DOCX here, or click to browse
                </span>
                <span className="text-[10px] text-(--color-text-muted) font-semibold block mt-1">
                  Accepts Word document files up to 20MB
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Customization controls */}
        {selectedFile && htmlContent && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start no-print">
            {/* Style parameters card */}
            <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) pb-2 border-b border-(--color-border)/50 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-(--color-primary)" />
                <span>Layout Settings</span>
              </h3>

              {/* Font selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-(--color-text-muted)">Font Family</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { val: 'sans', label: 'Sans-Serif' },
                    { val: 'serif', label: 'Serif' },
                    { val: 'mono', label: 'Monospace' },
                  ] as { val: FontFamily; label: string }[]).map((f) => (
                    <button
                      key={f.val}
                      onClick={() => setFontFamily(f.val)}
                      className={`text-xs font-semibold py-1 rounded-md border transition-all cursor-pointer ${
                        fontFamily === f.val
                          ? 'bg-(--color-primary) text-white border-transparent'
                          : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-(--color-text-muted)">Document Margins</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { val: 'compact', label: 'Compact' },
                    { val: 'normal', label: 'Normal' },
                    { val: 'wide', label: 'Wide' },
                  ] as { val: MarginSize; label: string }[]).map((m) => (
                    <button
                      key={m.val}
                      onClick={() => setMargin(m.val)}
                      className={`text-xs font-semibold py-1 rounded-md border transition-all cursor-pointer ${
                        margin === m.val
                          ? 'bg-(--color-primary) text-white border-transparent'
                          : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Print size */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-(--color-text-muted)">Base Font Size</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['sm', 'base', 'lg'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFontSize(s)}
                      className={`text-xs font-semibold py-1 rounded-md border transition-all cursor-pointer ${
                        fontSize === s
                          ? 'bg-(--color-primary) text-white border-transparent'
                          : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                      }`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Document preview & export triggers */}
            <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex flex-col justify-between shadow-xs md:col-span-2 min-h-[220px]">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) pb-2 border-b border-(--color-border)/50">
                  Target Document
                </h3>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">Word File Name</span>
                  <p className="text-xs font-semibold text-(--color-text-primary) truncate">{selectedFile.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">Original Size</span>
                  <p className="text-xs font-mono text-(--color-text-primary)">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-6">
                <Button
                  onClick={handlePrint}
                  className="flex-1 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white h-9.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Convert & Print to PDF</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="border-(--color-border) hover:bg-(--color-surface) h-9.5 text-xs cursor-pointer px-4"
                >
                  Clear File
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Printable styled preview area */}
        {selectedFile && htmlContent && (
          <div className="space-y-2 mt-4">
            <Label className="text-sm font-semibold no-print">Document Layout Preview</Label>
            <div className="p-1 rounded-xl border border-(--color-border) bg-slate-900 overflow-x-auto">
              <div
                id="printable-doc"
                className={`bg-white border border-slate-200 shadow-sm mx-auto transition-all ${
                  fontFamily === 'sans' ? 'font-sans' : fontFamily === 'serif' ? 'font-serif' : 'font-mono'
                } ${
                  margin === 'compact' ? 'p-6 max-w-2xl' : margin === 'normal' ? 'p-10 max-w-3xl' : 'p-16 max-w-4xl'
                } ${
                  fontSize === 'sm' ? 'text-xs' : fontSize === 'base' ? 'text-sm' : 'text-base'
                }`}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        )}

        {/* Security Notification */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 no-print">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">🔒 100% Offline DOCX Parsing</h4>
            <p className="text-xs mt-1 leading-relaxed">
              Word files are parsed in your browser. Document formatting styles are compiled entirely locally.
            </p>
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
