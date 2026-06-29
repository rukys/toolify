'use client'

import { useState } from 'react'
import { ulid } from 'ulid'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById, getRelatedTools } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { SortableFileList, SortableItem } from '@/components/tool/sortable-file-list'
import { ProcessingButton } from '@/components/tool/processing-button'
import { OutputArea } from '@/components/tool/output-area'
import { toast } from 'sonner'
import { imagesToPDF, ImageToPDFOptions } from '@/lib/converters/image-to-pdf'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2 } from 'lucide-react'

export default function ImageToPDFClient() {
  const tool = getToolById('image-to-pdf')!
  const related = getRelatedTools('image-to-pdf')

  const [items, setItems] = useState<SortableItem[]>([])
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'auto'>('auto')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [margin, setMargin] = useState<string>('0')
  const [fit, setFit] = useState<'fit' | 'fill' | 'stretch'>('fit')

  // Output
  const [output, setOutput] = useState<{ blob: Blob; sizeInfo: string } | null>(null)

  const handleFilesAccepted = (acceptedFiles: File[]) => {
    const newItems: SortableItem[] = acceptedFiles.map((file) => ({
      id: ulid(),
      file,
      thumbnailUrl: URL.createObjectURL(file), // Generate local thumbnail
    }))

    setItems((prev) => {
      const combined = [...prev, ...newItems]
      const sliced = combined.slice(0, 30) // Up to 30 images
      if (combined.length > 30) {
        toast.warning('Maximum 30 images allowed. Excess images were ignored.')
      }
      return sliced
    })
    setOutput(null)
  }

  const handleRemove = (id: string) => {
    const item = items.find((p) => p.id === id)
    if (item?.thumbnailUrl) {
      URL.revokeObjectURL(item.thumbnailUrl)
    }
    setItems((prev) => prev.filter((p) => p.id !== id))
    setOutput(null)
  }

  const handleClear = () => {
    items.forEach((item) => {
      if (item.thumbnailUrl) {
        URL.revokeObjectURL(item.thumbnailUrl)
      }
    })
    setItems([])
    setOutput(null)
    toast.success('List cleared')
  }

  const handleConvert = async () => {
    if (items.length === 0) {
      toast.error('Please add at least 1 image to convert')
      throw new Error('No images')
    }

    try {
      const files = items.map((item) => item.file)
      const options: ImageToPDFOptions = {
        pageSize,
        orientation,
        margin: Number(margin),
        fit,
      }

      const pdfBytes = await imagesToPDF(files, options)
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' })

      const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`
      }

      const totalInputBytes = files.reduce((sum, f) => sum + f.size, 0)

      setOutput({
        blob,
        sizeInfo: `${formatSize(totalInputBytes)} → ${formatSize(blob.size)}`,
      })
      toast.success('PDF compiled successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to convert images to PDF. Please check your image types.')
      throw err
    }
  }

  return (
    <ToolLayout tool={tool} relatedTools={related}>
      <div className="space-y-6">
        {/* Input section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              {items.length === 0 ? 'Upload Images' : `Arrange Images (${items.length}/30)`}
            </Label>
            {items.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs text-(--color-text-secondary) hover:text-(--color-danger) cursor-pointer h-8 px-2"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear All
              </Button>
            )}
          </div>

          {items.length > 0 ? (
            <div className="space-y-4">
              {/* Sortable Grid List */}
              <div className="p-3 border border-(--color-border) rounded-xl bg-(--color-surface-alt)">
                <SortableFileList
                  items={items}
                  onItemsChange={setItems}
                  onRemove={handleRemove}
                  layout="grid"
                />
              </div>

              {/* Smaller Dropzone for appending files */}
              {items.length < 30 && (
                <div className="border border-dashed rounded-xl p-4 bg-(--color-surface-alt) hover:border-(--color-primary) transition-colors">
                  <DropZone
                    accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] }}
                    maxSizeMB={20}
                    multiple
                    onFilesAccepted={handleFilesAccepted}
                    onError={(msg) => toast.error(msg)}
                    files={[]}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Large Full Dropzone */
            <DropZone
              accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] }}
              maxSizeMB={20}
              multiple
              onFilesAccepted={handleFilesAccepted}
              onError={(msg) => toast.error(msg)}
              files={[]}
            />
          )}
        </div>

        {/* Configurations */}
        {items.length > 0 && (
          <div className="space-y-4 border-t border-(--color-border) pt-5 animate-fade-in">
            <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
              Layout Settings
            </Label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-(--color-surface-alt) border border-(--color-border) rounded-xl">
              {/* Page Size */}
              <div className="space-y-1.5">
                <Label htmlFor="page-size-select" className="text-xs font-semibold">Page Size</Label>
                <Select value={pageSize} onValueChange={(val) => { if (val) setPageSize(val) }}>
                  <SelectTrigger id="page-size-select" className="bg-(--color-surface)">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (Match Image)</SelectItem>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orientation */}
              <div className="space-y-1.5">
                <Label htmlFor="orientation-select" className="text-xs font-semibold">Orientation</Label>
                <Select
                  value={orientation}
                  onValueChange={(val) => { if (val) setOrientation(val) }}
                  disabled={pageSize === 'auto'}
                >
                  <SelectTrigger id="orientation-select" className="bg-(--color-surface)">
                    <SelectValue placeholder="Orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Margin */}
              <div className="space-y-1.5">
                <Label htmlFor="margin-select" className="text-xs font-semibold">Margin</Label>
                <Select value={margin} onValueChange={(val) => { if (val) setMargin(val) }}>
                  <SelectTrigger id="margin-select" className="bg-(--color-surface)">
                    <SelectValue placeholder="Margin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None (0px)</SelectItem>
                    <SelectItem value="15">Small (15px)</SelectItem>
                    <SelectItem value="30">Medium (30px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fit */}
              <div className="space-y-1.5">
                <Label htmlFor="image-fit-select" className="text-xs font-semibold">Fit Image</Label>
                <Select value={fit} onValueChange={(val) => { if (val) setFit(val) }}>
                  <SelectTrigger id="image-fit-select" className="bg-(--color-surface)">
                    <SelectValue placeholder="Fit options" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fit">Fit (Aspect Ratio)</SelectItem>
                    <SelectItem value="fill">Fill (Cropped)</SelectItem>
                    <SelectItem value="stretch">Stretch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Trigger convert */}
            <div className="pt-2">
              <ProcessingButton
                onClick={handleConvert}
                label={`Convert ${items.length} Image${items.length > 1 ? 's' : ''} to PDF`}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="space-y-2 pt-2 animate-fade-in">
            <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
              Output Document
            </Label>
            <OutputArea
              mode="download"
              filename="compiled-images.pdf"
              blob={output.blob}
              sizeInfo={output.sizeInfo}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
