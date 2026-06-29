'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById, getRelatedTools } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { ProcessingButton } from '@/components/tool/processing-button'
import { OutputArea } from '@/components/tool/output-area'
import { toast } from 'sonner'
import { compressImage, estimateOutputSize, compressMultipleImages } from '@/lib/converters/image-compress'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Trash2, Download, FileImage } from 'lucide-react'

interface CompressedResult {
  name: string
  originalSize: number
  compressedSize: number
  blob: Blob
  reduction: number
}

export default function CompressClient() {
  const tool = getToolById('image-compress')!
  const related = getRelatedTools('image-compress')

  const [files, setFiles] = useState<File[]>([])
  const [quality, setQuality] = useState<number>(80)
  const [format, setFormat] = useState<string>('same')
  const [results, setResults] = useState<CompressedResult[]>([])
  const [zipBlob, setZipBlob] = useState<Blob | null>(null)

  const handleFilesAccepted = (acceptedFiles: File[]) => {
    setFiles((prev) => {
      const combined = [...prev, ...acceptedFiles]
      const sliced = combined.slice(0, 20) // limit to 20 files
      if (combined.length > 20) {
        toast.warning('Maximum 20 images allowed. Excess files were ignored.')
      }
      return sliced
    })
    setResults([])
    setZipBlob(null)
  }

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setResults([])
    setZipBlob(null)
  }

  const handleClear = () => {
    setFiles([])
    setResults([])
    setZipBlob(null)
    toast.success('List cleared')
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const handleCompress = async () => {
    if (files.length === 0) {
      toast.error('Please add at least 1 image to compress')
      throw new Error('No files')
    }

    try {
      const formatOption = format === 'same' ? undefined : format
      const isMultiple = files.length > 1
      const compressOptions = {
        quality,
        outputFormat: formatOption,
      }

      if (isMultiple) {
        // Multi compression
        const listResults: CompressedResult[] = []
        for (const file of files) {
          const compressedFile = await compressImage(file, compressOptions)
          const reduction = Math.round(((file.size - compressedFile.size) / file.size) * 100)
          
          listResults.push({
            name: compressedFile.name,
            originalSize: file.size,
            compressedSize: compressedFile.size,
            blob: compressedFile,
            reduction: reduction > 0 ? reduction : 0,
          })
        }

        const zip = await compressMultipleImages(files, compressOptions)
        setZipBlob(zip)
        setResults(listResults)
        toast.success(`Successfully compressed ${files.length} images!`)
      } else {
        // Single compression
        const file = files[0]
        const compressedFile = await compressImage(file, compressOptions)
        const reduction = Math.round(((file.size - compressedFile.size) / file.size) * 100)
        
        setResults([
          {
            name: compressedFile.name,
            originalSize: file.size,
            compressedSize: compressedFile.size,
            blob: compressedFile,
            reduction: reduction > 0 ? reduction : 0,
          },
        ])
        toast.success('Image compressed successfully!')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to compress images. Please try other files.')
      throw err
    }
  }

  const downloadFile = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAllZip = () => {
    if (!zipBlob) return
    downloadFile(zipBlob, 'compressed-images.zip')
    toast.success('ZIP download started')
  }

  return (
    <ToolLayout tool={tool} relatedTools={related}>
      <div className="space-y-6">
        {/* Input files */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              {files.length === 0 ? 'Upload Images' : `Uploaded Images (${files.length}/20)`}
            </Label>
            {files.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] cursor-pointer h-8 px-2"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear All
              </Button>
            )}
          </div>

          {files.length > 0 ? (
            <div className="space-y-4">
              {/* Files list */}
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs"
                  >
                    <div className="p-2 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                      <FileImage className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {formatSize(file.size)} •{' '}
                        <span className="text-[var(--color-accent)] font-medium">
                          Estimated output: {estimateOutputSize(file.size, quality)}
                        </span>
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(idx)}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface-alt)] cursor-pointer h-9 w-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Smaller Dropzone for appending files */}
              {files.length < 20 && (
                <div className="border border-dashed rounded-xl p-4 bg-[var(--color-surface-alt)] hover:border-[var(--color-primary)] transition-colors">
                  <DropZone
                    accept={{
                      'image/jpeg': ['.jpg', '.jpeg'],
                      'image/png': ['.png'],
                      'image/webp': ['.webp'],
                    }}
                    maxSizeMB={50}
                    multiple
                    onFilesAccepted={handleFilesAccepted}
                    onError={(msg) => toast.error(msg)}
                    files={[]}
                  />
                </div>
              )}
            </div>
          ) : (
            <DropZone
              accept={{
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/png': ['.png'],
                'image/webp': ['.webp'],
              }}
              maxSizeMB={50}
              multiple
              onFilesAccepted={handleFilesAccepted}
              onError={(msg) => toast.error(msg)}
              files={[]}
            />
          )}
        </div>

        {/* Configurations */}
        {files.length > 0 && (
          <div className="space-y-5 border-t border-[var(--color-border)] pt-5 animate-fade-in">
            <Label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Compression Settings
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl">
              {/* Quality slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <Label htmlFor="quality-slider" className="font-semibold">Compression Quality</Label>
                  <span className="font-mono text-[var(--color-primary)] font-bold">{quality}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase">Size</span>
                  <Slider
                    id="quality-slider"
                    min={10}
                    max={100}
                    step={1}
                    value={[quality]}
                    onValueChange={(val) => {
                      const num = Array.isArray(val) ? val[0] : val
                      if (typeof num === 'number') setQuality(num)
                    }}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase">Quality</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)]">
                  Lower quality results in smaller file sizes, but may introduce compression artifacts.
                </p>
              </div>

              {/* Output format */}
              <div className="space-y-1.5 justify-self-stretch sm:justify-self-start min-w-[200px]">
                <Label htmlFor="output-format-select" className="text-xs font-semibold">Output Format</Label>
                <Select value={format} onValueChange={(val) => { if (val) setFormat(val) }}>
                  <SelectTrigger id="output-format-select" className="bg-[var(--color-surface)]">
                    <SelectValue placeholder="Format options" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">Same as input</SelectItem>
                    <SelectItem value="image/jpeg">JPG</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/webp">WEBP</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
                  Leave same as input or override to convert images formats.
                </p>
              </div>
            </div>

            {/* Trigger Button */}
            <div className="pt-2">
              <ProcessingButton
                onClick={handleCompress}
                label={`Compress ${files.length} Image${files.length > 1 ? 's' : ''}`}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Output Section */}
        {results.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[var(--color-border)] animate-fade-in">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Optimization Results
              </Label>
              {zipBlob && (
                <Button
                  onClick={downloadAllZip}
                  size="sm"
                  className="text-xs cursor-pointer gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download All (.zip)
                </Button>
              )}
            </div>

            {/* Result Grid / List */}
            {results.length === 1 ? (
              <OutputArea
                mode="download"
                filename={results[0].name}
                blob={results[0].blob}
                sizeInfo={`${formatSize(results[0].originalSize)} → ${formatSize(results[0].compressedSize)} (${results[0].reduction}% smaller)`}
              />
            ) : (
              <div className="space-y-2 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-alt)] overflow-hidden">
                <div className="divide-y divide-[var(--color-border)]">
                  {results.map((res, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-[var(--color-surface)] text-sm"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="font-semibold text-xs truncate max-w-[280px]">{res.name}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                          {formatSize(res.originalSize)} → {formatSize(res.compressedSize)} •{' '}
                          <span className="text-[var(--color-success)] font-semibold">
                            {res.reduction}% saved
                          </span>
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(res.blob, res.name)}
                        className="text-xs cursor-pointer h-8"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
