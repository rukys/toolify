'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload, Download, Binary, ShieldCheck, FileText } from 'lucide-react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

type AlignmentType = 'footer-left' | 'footer-center' | 'footer-right' | 'header-left' | 'header-center' | 'header-right'
type NumberingFormat = 'page-x' | 'page-x-of-y' | 'x-y'

export default function PDFPageNumbererClient() {
  const tool = getToolById('pdf-page-numberer')!
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)

  const [format, setFormat] = useState<NumberingFormat>('page-x-of-y')
  const [alignment, setAlignment] = useState<AlignmentType>('footer-right')
  const [fontSize, setFontSize] = useState(10)
  const [margin, setMargin] = useState(25)
  const [color, setColor] = useState('#475569') // Slate grey

  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      try {
        const buffer = await file.arrayBuffer()
        setPdfData(buffer)
      } catch {
        alert('Failed to read PDF file.')
        setSelectedFile(null)
      }
    }
  }

  const hexToPdfColor = (hex: string) => {
    const clean = hex.replace('#', '')
    const r = parseInt(clean.substring(0, 2), 16) / 255
    const g = parseInt(clean.substring(2, 4), 16) / 255
    const b = parseInt(clean.substring(4, 6), 16) / 255
    return rgb(r, g, b)
  }

  const handleApplyNumbering = async () => {
    if (!pdfData) return
    setIsProcessing(true)

    try {
      const pdfDoc = await PDFDocument.load(pdfData)
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()
      const totalPages = pages.length

      const targetColor = hexToPdfColor(color)

      pages.forEach((page, idx) => {
        const { width, height } = page.getSize()
        const pageNum = idx + 1

        // Format label string
        let labelText = ''
        if (format === 'page-x') {
          labelText = `Page ${pageNum}`
        } else if (format === 'page-x-of-y') {
          labelText = `Page ${pageNum} of ${totalPages}`
        } else if (format === 'x-y') {
          labelText = `${pageNum} / ${totalPages}`
        }

        const textWidth = font.widthOfTextAtSize(labelText, fontSize)
        const textHeight = fontSize

        // Determine coordinates
        let x = 0
        let y = 0

        // Calculate X positioning
        if (alignment.includes('left')) {
          x = margin
        } else if (alignment.includes('center')) {
          x = (width - textWidth) / 2
        } else if (alignment.includes('right')) {
          x = width - margin - textWidth
        }

        // Calculate Y positioning
        if (alignment.startsWith('footer')) {
          y = margin
        } else if (alignment.startsWith('header')) {
          y = height - margin - textHeight
        }

        page.drawText(labelText, {
          x,
          y,
          size: fontSize,
          font,
          color: targetColor,
        })
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `numbered-${selectedFile?.name || 'document.pdf'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err) {
      alert('Failed to insert page numbers.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPdfData(null)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Upload zone */}
        {!selectedFile && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Upload Target PDF</Label>
            <div className="border-2 border-dashed border-(--color-border) rounded-xl p-8 bg-(--color-surface-alt)/40 text-center hover:bg-(--color-surface-alt)/60 transition-colors relative flex flex-col justify-center items-center gap-3">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                aria-label="Upload PDF file"
              />
              <div className="w-12 h-12 rounded-full bg-(--color-surface) border border-(--color-border) flex items-center justify-center shadow-xs">
                <Upload className="w-5 h-5 text-(--color-text-muted)" />
              </div>
              <div>
                <span className="text-xs font-semibold text-(--color-text-secondary) block">
                  Drag and drop PDF here, or click to browse
                </span>
                <span className="text-[10px] text-(--color-text-muted) font-semibold block mt-1">
                  Accepts PDF files up to 50MB
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Configuration settings sandbox */}
        {selectedFile && pdfData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Form settings */}
            <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) pb-2 border-b border-(--color-border)/50 flex items-center gap-1.5">
                <Binary className="w-4 h-4 text-(--color-primary)" />
                <span>Numbering Configurations</span>
              </h3>

              {/* Numbering Format selector */}
              <div className="space-y-1.5">
                <Label htmlFor="numbering-format" className="text-xs font-semibold text-(--color-text-muted)">Numbering Format</Label>
                <select
                  id="numbering-format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as NumberingFormat)}
                  className="w-full h-8.5 rounded-md border border-(--color-border) bg-(--color-surface) px-2 text-xs shadow-sm focus:outline-none text-(--color-text-primary)"
                >
                  <option value="page-x-of-y">Page X of Y</option>
                  <option value="page-x">Page X</option>
                  <option value="x-y">X / Y</option>
                </select>
              </div>

              {/* Page Alignment selector */}
              <div className="space-y-1.5">
                <Label htmlFor="page-alignment" className="text-xs font-semibold text-(--color-text-muted)">Number Placement</Label>
                <select
                  id="page-alignment"
                  value={alignment}
                  onChange={(e) => setAlignment(e.target.value as AlignmentType)}
                  className="w-full h-8.5 rounded-md border border-(--color-border) bg-(--color-surface) px-2 text-xs shadow-sm focus:outline-none text-(--color-text-primary)"
                >
                  <option value="footer-right">Footer Right</option>
                  <option value="footer-center">Footer Center</option>
                  <option value="footer-left">Footer Left</option>
                  <option value="header-right">Header Right</option>
                  <option value="header-center">Header Center</option>
                  <option value="header-left">Header Left</option>
                </select>
              </div>

              {/* Font Size slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <Label htmlFor="font-size-slider">Font Size</Label>
                  <span className="text-(--color-primary) font-bold">{fontSize}px</span>
                </div>
                <input
                  id="font-size-slider"
                  type="range"
                  min={8}
                  max={24}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                />
              </div>

              {/* Offset Margin slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <Label htmlFor="margin-slider">Edge Margin Offset</Label>
                  <span className="text-(--color-primary) font-bold">{margin}px</span>
                </div>
                <input
                  id="margin-slider"
                  type="range"
                  min={10}
                  max={80}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                />
              </div>

              {/* Color picker */}
              <div className="space-y-1.5">
                <Label htmlFor="number-color-picker" className="text-xs font-semibold text-(--color-text-muted)">Text Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    id="number-color-picker"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded border border-(--color-border) cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-(--color-text-secondary)">{color.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Actions & preview summaries */}
            <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) pb-2 border-b border-(--color-border)/50 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Document Details</span>
                </h3>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">File Name</span>
                  <p className="text-xs font-semibold text-(--color-text-primary) truncate">{selectedFile.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">Size</span>
                  <p className="text-xs font-mono text-(--color-text-primary)">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-6">
                <Button
                  onClick={handleApplyNumbering}
                  disabled={isProcessing}
                  className="w-full bg-(--color-primary) hover:bg-(--color-primary-dark) text-white h-9.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Binary className="w-4 h-4" />
                  <span>{isProcessing ? 'Adding Page Numbers...' : 'Number Pages & Download'}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="w-full border-(--color-border) hover:bg-(--color-surface) h-9.5 text-xs cursor-pointer"
                >
                  Cancel & Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Security Notification */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">🔒 Secure Local Processing</h4>
            <p className="text-xs mt-1 leading-relaxed">
              PDF page numbering coordinates computation and text overlays are executed inside your browser. No files are transmitted online.
            </p>
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
