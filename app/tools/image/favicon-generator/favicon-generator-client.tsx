'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { ProcessingButton } from '@/components/tool/processing-button'
import { OutputArea } from '@/components/tool/output-area'
import { Label } from '@/components/ui/label'
import { AlertCircle, FileImage, HelpCircle } from 'lucide-react'
import { formatSize } from '@/lib/utils'
import JSZip from 'jszip'

const ICON_SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
]

export default function FaviconGeneratorClient() {
  const tool = getToolById('favicon-generator')!
  const [file, setFile] = useState<File | null>(null)
  const [zipBlob, setZipBlob] = useState<Blob | null>(null)
  const [zipSize, setZipSize] = useState<string>('')
  const [error, setError] = useState('')

  const handleFilesAccepted = (acceptedFiles: File[]) => {
    setError('')
    setZipBlob(null)
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleGenerateFavicon = async () => {
    if (!file) return
    setError('')

    try {
      const zip = new JSZip()
      const img = new Image()
      const url = URL.createObjectURL(file)

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image file.'))
        img.src = url
      })

      URL.revokeObjectURL(url)

      // Generate each icon size and add to zip
      for (const iconSpec of ICON_SIZES) {
        const canvas = document.createElement('canvas')
        canvas.width = iconSpec.size
        canvas.height = iconSpec.size
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          throw new Error('Failed to create 2D canvas context.')
        }

        // Draw centered and scale image
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, iconSpec.size, iconSpec.size)

        const blob = await new Promise<Blob | null>((resolveBlob) => {
          canvas.toBlob((b) => resolveBlob(b), 'image/png')
        })

        if (!blob) {
          throw new Error(`Failed to generate ${iconSpec.name}`)
        }

        // Add to zip index
        zip.file(iconSpec.name, blob)
        
        // Also export a duplicate named favicon.ico for the 32x32 size
        if (iconSpec.size === 32) {
          zip.file('favicon.ico', blob)
        }
      }

      // Generate raw HTML integration code snippet and include in zip
      const htmlInstructions = `<!-- Favicon & App Icon Integration Markup -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="shortcut icon" href="/favicon.ico">
`
      zip.file('favicon-instructions.html', htmlInstructions)

      const outputZip = await zip.generateAsync({ type: 'blob' })
      setZipBlob(outputZip)
      setZipSize(`${formatSize(file.size)} → ${formatSize(outputZip.size)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating icon pack.')
      throw err
    }
  }

  const handleClear = () => {
    setFile(null)
    setZipBlob(null)
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

            {/* Instruction Alert box */}
            <div className="flex gap-2.5 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs leading-relaxed">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-700 dark:text-amber-300">Favicon Pack Output Info</p>
                <p className="mt-0.5">
                  We recommend uploading a high-resolution, square aspect ratio image (e.g., 512x512px) to guarantee clean resizing outputs. The resulting ZIP pack will contain all sizes along with HTML integration snippets.
                </p>
              </div>
            </div>

            {/* Generate Button */}
            {!zipBlob && (
              <ProcessingButton
                onClick={handleGenerateFavicon}
                label="Generate Favicon Package"
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

        {/* Download result */}
        {zipBlob && file && (
          <div className="space-y-4 pt-4 border-t border-(--color-border) animate-fade-in">
            <Label className="text-sm font-semibold">Favicon ZIP Package</Label>
            <OutputArea
              mode="download"
              blob={zipBlob}
              filename={`${file.name.replace(/\.[^/.]+$/, '')}_favicons.zip`}
              sizeInfo={zipSize}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
