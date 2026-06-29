'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById, getRelatedTools } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { ProcessingButton } from '@/components/tool/processing-button'
import { OutputArea } from '@/components/tool/output-area'
import { toast } from 'sonner'
import {
  convertImage,
  getOutputFilename,
  ImageFormat,
} from '@/lib/converters/image-convert'
import { getImageDimensions } from '@/lib/converters/image-resize'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { FileImage, Trash2, ArrowRight } from 'lucide-react'

export default function ConvertClient() {
  const tool = getToolById('image-convert')!
  const related = getRelatedTools('image-convert')

  const [file, setFile] = useState<File | null>(null)
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number } | null>(null)

  // Configuration States
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/webp')
  const [quality, setQuality] = useState<number>(85)

  // Output
  const [output, setOutput] = useState<{ blob: Blob; sizeInfo: string; filename: string } | null>(null)

  const handleFileAccepted = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const selected = acceptedFiles[0]
    setFile(selected)
    setOrigDimensions(null)
    setOutput(null)

    // Suggest default format swap
    if (selected.type === 'image/png') {
      setTargetFormat('image/webp')
    } else {
      setTargetFormat('image/png')
    }

    try {
      const dim = await getImageDimensions(selected)
      setOrigDimensions(dim)
    } catch (err) {
      console.error(err)
      toast.error('Failed to read image dimensions.')
      setFile(null)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setOrigDimensions(null)
    setOutput(null)
  }

  const handleConvert = async () => {
    if (!file) return

    try {
      const blob = await convertImage(file, targetFormat, quality / 100)

      const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`
      }

      const filename = getOutputFilename(file.name, targetFormat)

      setOutput({
        blob,
        filename,
        sizeInfo: `${formatSize(file.size)} → ${formatSize(blob.size)}`,
      })
      toast.success('Image format converted successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to convert image format.')
      throw err
    }
  }

  const getFormatLabel = (mime: string) => {
    return {
      'image/jpeg': 'JPG',
      'image/png': 'PNG',
      'image/webp': 'WEBP',
      'image/gif': 'GIF',
      'image/bmp': 'BMP',
    }[mime] || 'Unknown'
  }

  const isLossyFormat = targetFormat === 'image/jpeg' || targetFormat === 'image/webp'

  return (
    <ToolLayout tool={tool} relatedTools={related}>
      <div className="space-y-6">
        {/* Upload Box */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Upload Image</Label>

          {file ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
              <FileImage className="w-8 h-8 text-(--color-primary) shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-(--color-text-primary)">
                  {file.name}
                </p>
                <p className="text-xs text-(--color-text-muted) mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB •{' '}
                  <span className="font-semibold text-(--color-primary)">{getFormatLabel(file.type)}</span>
                  {origDimensions && ` • ${origDimensions.width} × ${origDimensions.height} px`}
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
              accept={{
                'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'],
              }}
              maxSizeMB={50}
              onFilesAccepted={handleFileAccepted}
              onError={(msg) => toast.error(msg)}
            />
          )}
        </div>

        {/* Configurations */}
        {file && (
          <div className="space-y-5 border-t border-(--color-border) pt-5 animate-fade-in">
            <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
              Conversion Configurations
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-(--color-surface-alt) border border-(--color-border) rounded-xl">
              {/* Target Format */}
              <div className="space-y-1.5 justify-self-stretch sm:justify-self-start min-w-[200px]">
                <Label htmlFor="target-format-select" className="text-xs font-semibold">Convert to Format</Label>
                <Select
                  value={targetFormat}
                  onValueChange={(val) => { if (val) setTargetFormat(val as ImageFormat) }}
                >
                  <SelectTrigger id="target-format-select" className="bg-(--color-surface)">
                    <SelectValue placeholder="Select target format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/jpeg">JPG (JPEG)</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/webp">WEBP</SelectItem>
                    <SelectItem value="image/gif">GIF</SelectItem>
                    <SelectItem value="image/bmp">BMP</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-(--color-text-secondary) mt-1 flex items-center gap-1">
                  <span>{getFormatLabel(file.type)}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-semibold text-(--color-primary)">{getFormatLabel(targetFormat)}</span>
                </p>
              </div>

              {/* Quality Slider (for JPG/WEBP) */}
              <div className={`space-y-3 transition-opacity duration-200 ${isLossyFormat ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="flex justify-between items-center text-xs">
                  <Label htmlFor="quality-slider" className="font-semibold">Image Quality (Lossy Formats)</Label>
                  <span className="font-mono text-(--color-primary) font-bold">{quality}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-(--color-text-muted) font-semibold uppercase">Size</span>
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
                    disabled={!isLossyFormat}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-(--color-text-muted) font-semibold uppercase">Quality</span>
                </div>
                <p className="text-[10px] text-(--color-text-secondary)">
                  Only applies to JPEG/WEBP output formats. PNG, GIF, and BMP conversion is lossless.
                </p>
              </div>
            </div>

            {/* Convert trigger */}
            <div className="pt-2">
              <ProcessingButton onClick={handleConvert} label="Convert Format" className="w-full" />
            </div>
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="space-y-2 pt-2 animate-fade-in">
            <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
              Converted Result
            </Label>
            <OutputArea
              mode="download"
              filename={output.filename}
              blob={output.blob}
              sizeInfo={output.sizeInfo}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
