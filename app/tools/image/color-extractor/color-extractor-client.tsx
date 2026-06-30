'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { ProcessingButton } from '@/components/tool/processing-button'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle, FileImage, Copy, Check } from 'lucide-react'
import { formatSize } from '@/lib/utils'

interface ColorItem {
  hex: string
  rgb: string
  percentage: number
}

export default function ColorExtractorClient() {
  const tool = getToolById('color-extractor')!
  const [file, setFile] = useState<File | null>(null)
  const [palette, setPalette] = useState<ColorItem[]>([])
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleFilesAccepted = (acceptedFiles: File[]) => {
    setError('')
    setPalette([])
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleExtractColors = async () => {
    if (!file) return
    setError('')

    try {
      const img = new Image()
      const url = URL.createObjectURL(file)

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image file.'))
        img.src = url
      })

      URL.revokeObjectURL(url)

      const canvas = document.createElement('canvas')
      // Scale down image inside canvas for fast analysis and memory savings
      const scaleSize = 200
      const ratio = Math.min(scaleSize / img.naturalWidth, scaleSize / img.naturalHeight, 1)
      canvas.width = img.naturalWidth * ratio
      canvas.height = img.naturalHeight * ratio

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get 2D canvas context.')
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      const colorMap: Record<string, number> = {}
      let totalSamples = 0

      // Sample every 4th pixel (step of 16 in array buffer index)
      for (let i = 0; i < imgData.length; i += 16) {
        const r = imgData[i]
        const g = imgData[i + 1]
        const b = imgData[i + 2]
        const a = imgData[i + 3]

        // Skip highly transparent pixels
        if (a < 128) continue

        // Quantize colors (group similar shades by rounding to multiples of 16)
        const qR = Math.round(r / 16) * 16
        const qG = Math.round(g / 16) * 16
        const qB = Math.round(b / 16) * 16
        const key = `${qR},${qG},${qB}`

        colorMap[key] = (colorMap[key] || 0) + 1
        totalSamples++
      }

      const sortedColors = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      const extractedPalette: ColorItem[] = sortedColors.map(([rgbStr, count]) => {
        const [r, g, b] = rgbStr.split(',').map(Number)
        // Convert to HEX
        const toHexVal = (val: number) => {
          const hex = Math.min(255, Math.max(0, val)).toString(16)
          return hex.length === 1 ? `0${hex}` : hex
        }
        const hex = `#${toHexVal(r)}${toHexVal(g)}${toHexVal(b)}`.toUpperCase()
        const rgb = `rgb(${r}, ${g}, ${b})`
        const percentage = Math.round((count / totalSamples) * 100)

        return { hex, rgb, percentage }
      })

      if (extractedPalette.length === 0) {
        throw new Error('No clear colors could be extracted from this image.')
      }

      setPalette(extractedPalette)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error extracting colors.')
      throw err
    }
  }

  const handleCopyColor = async (color: string, index: number) => {
    await navigator.clipboard.writeText(color)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleClear = () => {
    setFile(null)
    setPalette([])
    setError('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Upload Zone */}
        {!file ? (
          <DropZone
            accept={{
              'image/png': ['.png'],
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/webp': ['.webp'],
            }}
            maxSizeMB={50}
            onFilesAccepted={handleFilesAccepted}
            onError={(msg) => setError(msg)}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
              <FileImage className="w-10 h-10 text-(--color-primary) shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{file.name}</p>
                <p className="text-xs text-(--color-text-muted) mt-0.5">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={handleClear}
                className="text-xs text-(--color-text-secondary) hover:text-(--color-danger) cursor-pointer font-medium"
              >
                Change Photo
              </button>
            </div>

            {/* Extract Trigger */}
            {palette.length === 0 && (
              <ProcessingButton
                onClick={handleExtractColors}
                label="Extract Color Palette"
                className="w-full bg-(--color-primary) text-white hover:bg-(--color-primary-dark) cursor-pointer"
              />
            )}
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Palette Results */}
        {palette.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-(--color-border) animate-fade-in">
            <Label className="text-sm font-semibold">Extracted Color Palette</Label>
            <div className="grid grid-cols-1 gap-3">
              {palette.map((color, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl border border-(--color-border) bg-(--color-surface-alt) gap-3"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Color Swatch preview block */}
                    <div
                      className="w-12 h-12 rounded-lg border border-(--color-border) shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <p className="text-sm font-mono font-bold text-(--color-text-primary)">
                        {color.hex}
                      </p>
                      <p className="text-[11px] font-mono text-(--color-text-muted) mt-0.5">
                        {color.rgb}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0 border-(--color-border)">
                    <span className="text-xs font-bold text-(--color-text-secondary) bg-(--color-surface) px-2.5 py-1 rounded-md border border-(--color-border)">
                      {color.percentage}% Prevalence
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyColor(color.hex, index)}
                      className="flex items-center gap-1.5 text-xs border-(--color-border) hover:bg-(--color-surface) cursor-pointer"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-green-500 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy HEX</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
