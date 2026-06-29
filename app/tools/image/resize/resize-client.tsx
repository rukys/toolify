'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById, getRelatedTools } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { ProcessingButton } from '@/components/tool/processing-button'
import { OutputArea } from '@/components/tool/output-area'
import { toast } from 'sonner'
import {
  resizeImage,
  getImageDimensions,
  maintainAspectRatio,
  RESIZE_PRESETS,
  ResizeOptions,
} from '@/lib/converters/image-resize'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FileImage, Trash2, Maximize2, Scale, Percent } from 'lucide-react'

type ResizeMode = 'dimensions' | 'percentage' | 'presets'

export default function ResizeClient() {
  const tool = getToolById('image-resize')!
  const related = getRelatedTools('image-resize')

  const [file, setFile] = useState<File | null>(null)
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number } | null>(null)

  // Configuration States
  const [mode, setMode] = useState<ResizeMode>('dimensions')
  const [width, setWidth] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [lockRatio, setLockRatio] = useState<boolean>(true)
  const [percent, setPercent] = useState<number>(50)
  const [format, setFormat] = useState<string>('same')

  // Output
  const [output, setOutput] = useState<{ blob: Blob; sizeInfo: string; filename: string } | null>(null)

  const handleFileAccepted = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const selected = acceptedFiles[0]
    setFile(selected)
    setOrigDimensions(null)
    setOutput(null)

    try {
      const dim = await getImageDimensions(selected)
      setOrigDimensions(dim)
      setWidth(dim.width.toString())
      setHeight(dim.height.toString())
    } catch (err) {
      console.error(err)
      toast.error('Failed to read image dimensions. It might be corrupted.')
      setFile(null)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setOrigDimensions(null)
    setOutput(null)
  }

  // Handle Width change with Ratio Lock
  const handleWidthChange = (val: string) => {
    setWidth(val)
    if (!val || isNaN(Number(val)) || !origDimensions || !lockRatio) return

    const newH = maintainAspectRatio(Number(val), origDimensions.width, origDimensions.height)
    setHeight(newH.toString())
  }

  // Handle Height change with Ratio Lock
  const handleHeightChange = (val: string) => {
    setHeight(val)
    if (!val || isNaN(Number(val)) || !origDimensions || !lockRatio) return

    const newW = maintainAspectRatio(
      Number(val),
      origDimensions.height,
      origDimensions.width
    )
    setWidth(newW.toString())
  }

  const handlePercentChange = (pct: number) => {
    setPercent(pct)
    if (origDimensions) {
      const newW = Math.round((origDimensions.width * pct) / 100)
      const newH = Math.round((origDimensions.height * pct) / 100)
      setWidth(newW.toString())
      setHeight(newH.toString())
    }
  }

  const handleModeChange = (newMode: ResizeMode) => {
    setMode(newMode)
    if (newMode === 'percentage' && origDimensions) {
      const newW = Math.round((origDimensions.width * percent) / 100)
      const newH = Math.round((origDimensions.height * percent) / 100)
      setWidth(newW.toString())
      setHeight(newH.toString())
    }
  }

  // Apply presets
  const handlePresetSelect = (w: number, h: number) => {
    setWidth(w.toString())
    setHeight(h.toString())
    toast.success(`Preset applied: ${w} × ${h} px`)
  }

  const handleResize = async () => {
    if (!file || !origDimensions) return

    const finalW = Number(width)
    const finalH = Number(height)

    if (isNaN(finalW) || finalW <= 0 || isNaN(finalH) || finalH <= 0) {
      toast.error('Please enter valid positive dimensions.')
      throw new Error('Invalid dimensions')
    }

    try {
      const formatOption = format === 'same' ? undefined : format
      const options: ResizeOptions = {
        width: finalW,
        height: finalH,
        format: formatOption,
      }

      const blob = await resizeImage(file, options)

      const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`
      }

      // Rename output
      const extension = formatOption ? formatOption.split('/')[1] : file.type.split('/')[1]
      const extStr = extension === 'jpeg' ? 'jpg' : extension
      const filename = `${file.name.replace(/\.[^.]+$/, '')}-resized.${extStr}`

      setOutput({
        blob,
        filename,
        sizeInfo: `${formatSize(file.size)} → ${formatSize(blob.size)} (${finalW} × ${finalH} px)`,
      })
      toast.success('Image resized successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to resize image.')
      throw err
    }
  }

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
                  <strong className="text-(--color-primary)">
                    {origDimensions ? `${origDimensions.width} × ${origDimensions.height} px` : 'Loading size...'}
                  </strong>
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
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/png': ['.png'],
                'image/webp': ['.webp'],
              }}
              maxSizeMB={50}
              onFilesAccepted={handleFileAccepted}
              onError={(msg) => toast.error(msg)}
            />
          )}
        </div>

        {/* Configurations */}
        {file && origDimensions && (
          <div className="space-y-5 border-t border-(--color-border) pt-5 animate-fade-in">
            <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
              Resize Configurations
            </Label>

            {/* Mode selection buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleModeChange('dimensions')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  mode === 'dimensions'
                    ? 'border-(--color-primary) bg-(--color-primary-light) text-(--color-primary) shadow-sm'
                    : 'border-(--color-border) hover:border-(--color-text-muted) bg-(--color-surface)'
                }`}
              >
                <Maximize2 className="w-4 h-4 mb-1.5" />
                <span className="text-xs font-bold">Dimensions</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('percentage')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  mode === 'percentage'
                    ? 'border-(--color-primary) bg-(--color-primary-light) text-(--color-primary) shadow-sm'
                    : 'border-(--color-border) hover:border-(--color-text-muted) bg-(--color-surface)'
                }`}
              >
                <Percent className="w-4 h-4 mb-1.5" />
                <span className="text-xs font-bold">Percentage</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('presets')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  mode === 'presets'
                    ? 'border-(--color-primary) bg-(--color-primary-light) text-(--color-primary) shadow-sm'
                    : 'border-(--color-border) hover:border-(--color-text-muted) bg-(--color-surface)'
                }`}
              >
                <Scale className="w-4 h-4 mb-1.5" />
                <span className="text-xs font-bold">Presets</span>
              </button>
            </div>

            {/* Inputs block depending on mode */}
            <div className="p-4 bg-(--color-surface-alt) border border-(--color-border) rounded-xl space-y-4">
              {mode === 'dimensions' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full space-y-1.5">
                      <Label htmlFor="width-input" className="text-xs font-semibold">Width (px)</Label>
                      <Input
                        id="width-input"
                        value={width}
                        onChange={(e) => handleWidthChange(e.target.value)}
                        placeholder="Width"
                        className="bg-(--color-surface) font-mono"
                      />
                    </div>
                    <span className="text-(--color-text-muted) font-bold hidden sm:inline">×</span>
                    <div className="w-full space-y-1.5">
                      <Label htmlFor="height-input" className="text-xs font-semibold">Height (px)</Label>
                      <Input
                        id="height-input"
                        value={height}
                        onChange={(e) => handleHeightChange(e.target.value)}
                        placeholder="Height"
                        className="bg-(--color-surface) font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="ratio-checkbox"
                      checked={lockRatio}
                      onCheckedChange={(checked) => setLockRatio(!!checked)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="ratio-checkbox" className="text-xs font-semibold select-none cursor-pointer">
                      Lock aspect ratio (recommended)
                    </Label>
                  </div>
                </div>
              )}

              {mode === 'percentage' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <Label className="font-semibold">Resize Percentage</Label>
                    <span className="font-mono text-(--color-primary) font-bold">{percent}%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 90].map((pct) => (
                      <Button
                        key={pct}
                        type="button"
                        variant={percent === pct ? 'default' : 'outline'}
                        onClick={() => handlePercentChange(pct)}
                        className="text-xs cursor-pointer h-9"
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>
                  <div className="text-xs text-(--color-text-secondary) font-mono flex items-center justify-between bg-(--color-surface) p-2.5 rounded-lg border border-(--color-border)">
                    <span>Target Dimensions:</span>
                    <span className="font-bold text-(--color-text-primary)">
                      {width} × {height} px
                    </span>
                  </div>
                </div>
              )}

              {mode === 'presets' && (
                <div className="space-y-3">
                  <Label className="text-xs font-semibold">Social Media & Standard Layout Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {RESIZE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetSelect(preset.width, preset.height)}
                        className="flex flex-col p-2.5 rounded-lg border border-(--color-border) hover:border-(--color-primary) bg-(--color-surface) text-left cursor-pointer transition-colors text-xs"
                      >
                        <span className="font-bold text-(--color-text-primary)">{preset.label}</span>
                        <span className="text-[10px] text-(--color-text-muted) font-mono mt-0.5">
                          {preset.width} × {preset.height} px
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Output format select */}
              <div className="space-y-1.5 border-t border-(--color-border) pt-4 max-w-[220px]">
                <Label htmlFor="output-format-select" className="text-xs font-semibold">Output Format</Label>
                <Select value={format} onValueChange={(val) => { if (val) setFormat(val) }}>
                  <SelectTrigger id="output-format-select" className="bg-(--color-surface)">
                    <SelectValue placeholder="Format options" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">Same as input</SelectItem>
                    <SelectItem value="image/jpeg">JPG</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/webp">WEBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resize trigger */}
            <div className="pt-2">
              <ProcessingButton onClick={handleResize} label="Resize Image" className="w-full" />
            </div>
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="space-y-2 pt-2 animate-fade-in">
            <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
              Resized Result
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
