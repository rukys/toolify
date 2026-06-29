'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById, getRelatedTools } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { ProcessingButton } from '@/components/tool/processing-button'
import { OutputArea } from '@/components/tool/output-area'
import { toast } from 'sonner'
import { compressPDF, CompressionLevel } from '@/lib/converters/pdf-compress'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FileIcon, Trash2, Info, Check, ShieldAlert } from 'lucide-react'

export default function CompressClient() {
  const tool = getToolById('pdf-compress')!
  const related = getRelatedTools('pdf-compress')

  const [file, setFile] = useState<File | null>(null)
  const [level, setLevel] = useState<CompressionLevel>('balanced')
  const [output, setOutput] = useState<{ blob: Blob; sizeInfo: string; percentSaved: number } | null>(null)

  const handleFileAccepted = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    setFile(acceptedFiles[0])
    setOutput(null)
  }

  const handleRemove = () => {
    setFile(null)
    setOutput(null)
  }

  const handleCompress = async () => {
    if (!file) return

    try {
      const compressedBytes = await compressPDF(file, level)
      const blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' })

      const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`
      }

      const diff = file.size - blob.size
      const percent = diff > 0 ? Math.round((diff / file.size) * 100) : 0

      setOutput({
        blob,
        sizeInfo: `${formatSize(file.size)} → ${formatSize(blob.size)}`,
        percentSaved: percent,
      })

      if (percent > 0) {
        toast.success(`PDF optimized! Saved ${percent}% of space.`)
      } else {
        toast.info('PDF is already fully optimized. No further structural size reduction possible.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to compress PDF. File structure could be encrypted or invalid.')
      throw err
    }
  }

  return (
    <ToolLayout tool={tool} relatedTools={related}>
      <div className="space-y-6">
        {/* Input Area */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Upload PDF File</Label>

          {file ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
              <FileIcon className="w-8 h-8 text-(--color-primary) shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-(--color-text-primary)">
                  {file.name}
                </p>
                <p className="text-xs text-(--color-text-muted) mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="text-(--color-text-secondary) hover:text-(--color-danger) hover:bg-(--color-surface) cursor-pointer h-9 w-9"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <DropZone
              accept={{ 'application/pdf': ['.pdf'] }}
              maxSizeMB={50}
              onFilesAccepted={handleFileAccepted}
              onError={(msg) => toast.error(msg)}
            />
          )}
        </div>

        {/* Configurations */}
        {file && (
          <div className="space-y-5 border-t border-(--color-border) pt-5 animate-fade-in">
            {/* Compression Level */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
                Compression Level
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setLevel('light')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    level === 'light'
                      ? 'border-(--color-primary) bg-(--color-primary-light) text-(--color-primary) shadow-sm'
                      : 'border-(--color-border) hover:border-(--color-text-muted) bg-(--color-surface)'
                  }`}
                >
                  <span className="text-xs font-bold">Light Compression</span>
                  <span className="text-[10px] opacity-75 mt-1">Cleans metadata and structural junk</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLevel('balanced')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    level === 'balanced'
                      ? 'border-(--color-primary) bg-(--color-primary-light) text-(--color-primary) shadow-sm'
                      : 'border-(--color-border) hover:border-(--color-text-muted) bg-(--color-surface)'
                  }`}
                >
                  <span className="text-xs font-bold">Balanced Compression</span>
                  <span className="text-[10px] opacity-75 mt-1">Compresses objects streams & metadata</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLevel('strong')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    level === 'strong'
                      ? 'border-(--color-primary) bg-(--color-primary-light) text-(--color-primary) shadow-sm'
                      : 'border-(--color-border) hover:border-(--color-text-muted) bg-(--color-surface)'
                  }`}
                >
                  <span className="text-xs font-bold">Strong Compression</span>
                  <span className="text-[10px] opacity-75 mt-1">Strong object stream packing</span>
                </button>
              </div>
            </div>

            {/* Disclaimer block */}
            <div className="flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="space-y-1">
                <p className="font-semibold">Browser-Based Optimization Disclaimer</p>
                <p className="leading-relaxed">
                  Toolify runs <strong>100% in your browser</strong> to guarantee security. In order to protect your privacy and execute offline, we optimize structural elements and strip metadata without re-encoding embedded images. 
                </p>
                <p className="leading-relaxed opacity-90">
                  As a result, size reduction may be minimal for image-heavy scanned PDFs, but is highly effective for text-heavy documents.
                </p>
              </div>
            </div>

            {/* Trigger Button */}
            <div className="pt-2">
              <ProcessingButton onClick={handleCompress} label="Compress PDF" className="w-full" />
            </div>
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="space-y-2 pt-2 animate-fade-in">
            <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
              Compressed Document
            </Label>
            <div className="space-y-3">
              <OutputArea
                mode="download"
                filename={file ? `${file.name.replace(/\.[^.]+$/, '')}-compressed.pdf` : 'compressed.pdf'}
                blob={output.blob}
                sizeInfo={output.sizeInfo}
              />
              {output.percentSaved > 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-(--color-success) font-medium bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 px-3 py-2 rounded-lg w-fit">
                  <Check className="w-4 h-4" />
                  Successfully reduced PDF file size by {output.percentSaved}%!
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) font-medium bg-(--color-surface-alt) border border-(--color-border) px-3 py-2 rounded-lg w-fit">
                  <Info className="w-4 h-4 text-(--color-primary)" />
                  PDF structural optimizations applied. File size remains unchanged.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
