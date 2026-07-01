'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, Download, Stamp, ShieldCheck, FileText } from 'lucide-react'
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'

type PlacementType = 'center' | 'diagonal' | 'grid'

export default function PDFWatermarkClient() {
  const tool = getToolById('pdf-watermark')!
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)

  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL')
  const [textSize, setTextSize] = useState(50)
  const [opacity, setOpacity] = useState(0.25)
  const [rotation, setRotation] = useState(-45)
  const [color, setColor] = useState('#ff0000')
  const [placement, setPlacement] = useState<PlacementType>('diagonal')

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

  // Hex to pdf-lib rgb percentage conversion helper
  const hexToPdfColor = (hex: string) => {
    const clean = hex.replace('#', '')
    const r = parseInt(clean.substring(0, 2), 16) / 255
    const g = parseInt(clean.substring(2, 4), 16) / 255
    const b = parseInt(clean.substring(4, 6), 16) / 255
    return rgb(r, g, b)
  }

  const handleApplyWatermark = async () => {
    if (!pdfData) return
    setIsProcessing(true)

    try {
      const pdfDoc = await PDFDocument.load(pdfData)
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const pages = pdfDoc.getPages()

      const targetColor = hexToPdfColor(color)

      for (const page of pages) {
        const { width, height } = page.getSize()

        if (placement === 'center' || placement === 'diagonal') {
          const rotAngle = placement === 'diagonal' ? rotation : 0
          
          // Calculate bounding text offsets to attempt centration
          const textWidth = font.widthOfTextAtSize(watermarkText, textSize)
          const textHeight = textSize
          
          const x = (width - textWidth) / 2
          const y = (height - textHeight) / 2

          page.drawText(watermarkText, {
            x,
            y,
            size: textSize,
            font,
            color: targetColor,
            opacity,
            rotate: degrees(rotAngle),
          })
        } else if (placement === 'grid') {
          // Draw watermark in a grid repeating pattern across the entire page
          const xStep = 200
          const yStep = 200

          for (let gx = 40; gx < width; gx += xStep) {
            for (let gy = 40; gy < height; gy += yStep) {
              page.drawText(watermarkText, {
                x: gx,
                y: gy,
                size: Math.max(12, textSize * 0.4), // scale down grid sizes slightly
                font,
                color: targetColor,
                opacity,
                rotate: degrees(rotation),
              })
            }
          }
        }
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `watermarked-${selectedFile?.name || 'document.pdf'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err) {
      alert('Failed to embed watermark onto PDF.')
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

        {/* Configurations sandbox */}
        {selectedFile && pdfData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Form settings */}
            <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) pb-2 border-b border-(--color-border)/50 flex items-center gap-1.5">
                <Stamp className="w-4 h-4 text-(--color-primary)" />
                <span>Watermark Parameters</span>
              </h3>

              {/* Text Input */}
              <div className="space-y-1.5">
                <Label htmlFor="watermark-txt" className="text-xs font-semibold text-(--color-text-muted)">Watermark Text</Label>
                <Input
                  id="watermark-txt"
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="h-8.5 bg-(--color-surface) border-(--color-border) text-xs"
                />
              </div>

              {/* Text Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <Label htmlFor="text-size-slider">Font Size</Label>
                  <span className="text-(--color-primary) font-bold">{textSize}px</span>
                </div>
                <input
                  id="text-size-slider"
                  type="range"
                  min={10}
                  max={120}
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                />
              </div>

              {/* Opacity */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <Label htmlFor="opacity-slider">Opacity</Label>
                  <span className="text-(--color-primary) font-bold">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  id="opacity-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <Label htmlFor="rotation-slider">Rotation Angle</Label>
                  <span className="text-(--color-primary) font-bold">{rotation}°</span>
                </div>
                <input
                  id="rotation-slider"
                  type="range"
                  min={-90}
                  max={90}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                />
              </div>

              {/* Color & Placement */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="watermark-color-picker" className="text-xs font-semibold text-(--color-text-muted)">Stamp Color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      id="watermark-color-picker"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded border border-(--color-border) cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-(--color-text-secondary)">{color.toUpperCase()}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="watermark-placement" className="text-xs font-semibold text-(--color-text-muted)">Placement Layout</Label>
                  <select
                    id="watermark-placement"
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as PlacementType)}
                    className="w-full h-8.5 rounded-md border border-(--color-border) bg-(--color-surface) px-2 text-xs shadow-sm focus:outline-none text-(--color-text-primary)"
                  >
                    <option value="diagonal">Diagonal Center</option>
                    <option value="center">Horizontal Center</option>
                    <option value="grid">Repeated Grid</option>
                  </select>
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
                  onClick={handleApplyWatermark}
                  disabled={isProcessing}
                  className="w-full bg-(--color-primary) hover:bg-(--color-primary-dark) text-white h-9.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Stamp className="w-4 h-4" />
                  <span>{isProcessing ? 'Adding Watermark...' : 'Apply & Download PDF'}</span>
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">🔒 Secure Local Watermarking</h4>
            <p className="text-xs mt-1 leading-relaxed">
              Text embedding and PDF drawing operations execute completely offline. Your sensitive files are never uploaded to any remote networks.
            </p>
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
