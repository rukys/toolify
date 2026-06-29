'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { ProcessingButton } from '@/components/tool/processing-button'
import { OutputArea } from '@/components/tool/output-area'
import { Label } from '@/components/ui/label'
import { AlertCircle, ShieldAlert, Sparkles, FileImage } from 'lucide-react'
import { formatSize } from '@/lib/utils'

// Zero-deps binary JPEG EXIF APP1 marker detector
async function checkHasExif(file: File): Promise<boolean> {
  if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
    // Other formats (PNG/WEBP/GIF) generally don't leak camera/GPS EXIF headers,
    // but they can still be stripped via canvas redraw.
    return false
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer
      if (!buffer) return resolve(false)
      const view = new DataView(buffer)

      // Verify SOI (Start of Image) marker
      if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
        return resolve(false)
      }

      let offset = 2
      while (offset < view.byteLength - 4) {
        const marker = view.getUint16(offset)
        if (marker === 0xffe1) {
          // APP1 Marker - check if it is the Exif block
          if (offset + 8 <= view.byteLength) {
            const char1 = String.fromCharCode(view.getUint8(offset + 4))
            const char2 = String.fromCharCode(view.getUint8(offset + 5))
            const char3 = String.fromCharCode(view.getUint8(offset + 6))
            const char4 = String.fromCharCode(view.getUint8(offset + 7))
            if (char1 === 'E' && char2 === 'x' && char3 === 'i' && char4 === 'f') {
              return resolve(true)
            }
          }
        }

        // Advance in binary structure
        if (marker >= 0xffd0 && marker <= 0xffd9) {
          offset += 2
        } else {
          const length = view.getUint16(offset + 2)
          offset += length + 2
        }
      }
      resolve(false)
    }
    reader.onerror = () => resolve(false)
    // Read only the header segment (128 KB is plenty)
    reader.readAsArrayBuffer(file.slice(0, 131072))
  })
}

// Strip EXIF metadata by redrawing image on canvas
async function stripMetadata(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        URL.revokeObjectURL(url)
        return reject(new Error('Failed to create Canvas context'))
      }

      // Drawing to canvas copies raw pixel data, stripping EXIF headers
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to generate output image'))
          }
        },
        file.type,
        0.98 // High quality factor to preserve visual fidelity
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to parse image file'))
    }
    img.src = url
  })
}

export default function EXIFStripperClient() {
  const tool = getToolById('exif-stripper')!
  const [file, setFile] = useState<File | null>(null)
  const [hasExif, setHasExif] = useState<boolean | null>(null)
  const [output, setOutput] = useState<{ blob: Blob; sizeInfo: string } | null>(null)
  const [error, setError] = useState('')

  const handleFilesAccepted = async (acceptedFiles: File[]) => {
    setError('')
    setOutput(null)
    setHasExif(null)

    const selectedFile = acceptedFiles[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const detectedExif = await checkHasExif(selectedFile)
    setHasExif(detectedExif)
  }

  const handleStrip = async () => {
    if (!file) return
    setError('')

    try {
      const cleanBlob = await stripMetadata(file)
      setOutput({
        blob: cleanBlob,
        sizeInfo: `${formatSize(file.size)} → ${formatSize(cleanBlob.size)}`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error clearing metadata.')
      throw err
    }
  }

  const handleClear = () => {
    setFile(null)
    setHasExif(null)
    setOutput(null)
    setError('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Upload Zone */}
        {!file ? (
          <DropZone
            accept={{
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
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

            {/* EXIF scan status display */}
            {hasExif !== null && (
              <div
                className={`flex gap-3 p-4 rounded-xl border ${
                  hasExif
                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400'
                }`}
              >
                {hasExif ? (
                  <>
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">⚠️ EXIF Metadata Detected</p>
                      <p className="text-xs mt-1 text-(--color-text-secondary)">
                        This image contains EXIF camera settings, timestamps, or GPS location tags. Strip this data to protect your privacy before sharing.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">✓ Clear of JPG EXIF Markers</p>
                      <p className="text-xs mt-1 text-(--color-text-secondary)">
                        No standard JPEG camera header markers were found. You can still clean the image to ensure all binary metadata is fully purged.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Clear Button */}
            {!output && (
              <ProcessingButton
                onClick={handleStrip}
                label="Clean & Strip Metadata"
                className="w-full bg-(--color-primary) text-white hover:bg-(--color-primary-dark) cursor-pointer"
              />
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Clean Output download area */}
        {output && file && (
          <div className="space-y-4 pt-4 border-t border-(--color-border) animate-fade-in">
            <Label className="text-sm font-semibold">Cleaned Output Image</Label>
            <OutputArea
              mode="download"
              blob={output.blob}
              filename={`${file.name.replace(/\.[^/.]+$/, '')}_stripped.${file.name.split('.').pop()}`}
              sizeInfo={output.sizeInfo}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
