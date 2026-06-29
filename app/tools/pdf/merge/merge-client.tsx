'use client'

import { useState } from 'react'
import { ulid } from 'ulid'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById, getRelatedTools } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { SortableFileList, SortableItem } from '@/components/tool/sortable-file-list'
import { ProcessingButton } from '@/components/tool/processing-button'
import { OutputArea } from '@/components/tool/output-area'
import { toast } from 'sonner'
import { mergePDFs } from '@/lib/converters/pdf-merge'
import { Button } from '@/components/ui/button'
import { formatSize } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'

export default function MergeClient() {
  const tool = getToolById('pdf-merge')!
  const related = getRelatedTools('pdf-merge')

  const [items, setItems] = useState<SortableItem[]>([])
  const [output, setOutput] = useState<{ blob: Blob; sizeInfo: string } | null>(null)

  const handleFilesAccepted = (acceptedFiles: File[]) => {
    // Generate new items with unique IDs
    const newItems: SortableItem[] = acceptedFiles.map((file) => ({
      id: ulid(),
      file,
      extraInfo: 'Loading pages...',
    }))

    // Limit to maximum 20 files
    setItems((prev) => {
      const combined = [...prev, ...newItems]
      const sliced = combined.slice(0, 20)
      if (combined.length > 20) {
        toast.warning('Maximum 20 PDF files allowed. Excess files were ignored.')
      }
      return sliced
    })

    // Reset output when files change
    setOutput(null)

    // Load page counts asynchronously in the background
    newItems.forEach(async (item) => {
      try {
        const buffer = await item.file.arrayBuffer()
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true })
        const pageCount = pdf.getPageCount()
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, extraInfo: `${pageCount} page${pageCount > 1 ? 's' : ''}` } : p
          )
        )
      } catch (err) {
        console.error('Failed to load page count for file:', item.file.name, err)
        setItems((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, extraInfo: 'Failed to count pages' } : p))
        )
      }
    })
  }

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setOutput(null)
  }

  const handleClear = () => {
    setItems([])
    setOutput(null)
    toast.success('List cleared')
  }

  const handleMerge = async () => {
    if (items.length < 2) {
      toast.error('Please add at least 2 PDF files to merge')
      throw new Error('Requires at least 2 files')
    }

    try {
      const filesToMerge = items.map((item) => item.file)
      const mergedBytes = await mergePDFs(filesToMerge)
      const blob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' })

      const totalInputBytes = filesToMerge.reduce((sum, f) => sum + f.size, 0)


      setOutput({
        blob,
        sizeInfo: `${formatSize(totalInputBytes)} → ${formatSize(blob.size)}`,
      })
      toast.success('PDFs merged successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to merge PDF files. Ensure files are not password-protected.')
      throw err
    }
  }

  return (
    <ToolLayout tool={tool} relatedTools={related}>
      <div className="space-y-6">
        {/* File Uploader / Display Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              {items.length === 0 ? 'Upload PDF Files' : `Arrange PDF Files (${items.length}/20)`}
            </Label>
            {items.length > 0 && (
              <Button
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
              {/* Sortable List */}
              <SortableFileList
                items={items}
                onItemsChange={setItems}
                onRemove={handleRemove}
                layout="list"
              />

              {/* Smaller Dropzone for appending files */}
              {items.length < 20 && (
                <div className="border border-dashed rounded-xl p-4 bg-(--color-surface-alt) hover:border-(--color-primary) transition-colors">
                  <DropZone
                    accept={{ 'application/pdf': ['.pdf'] }}
                    maxSizeMB={50}
                    multiple
                    onFilesAccepted={handleFilesAccepted}
                    onError={(msg) => toast.error(msg)}
                    files={[]} // Pass empty to force rendering upload text instead of file rows
                  />
                </div>
              )}
            </div>
          ) : (
            /* Large Full Dropzone */
            <DropZone
              accept={{ 'application/pdf': ['.pdf'] }}
              maxSizeMB={50}
              multiple
              onFilesAccepted={handleFilesAccepted}
              onError={(msg) => toast.error(msg)}
              files={[]}
            />
          )}
        </div>

        {/* Action Button */}
        {items.length >= 2 && (
          <div className="pt-2">
            <ProcessingButton
              onClick={handleMerge}
              label={`Merge ${items.length} PDF Files`}
              className="w-full"
            />
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="space-y-2 pt-2 animate-fade-in">
            <Label className="text-xs font-bold text-(--color-text-secondary) uppercase tracking-wider">
              Merged Document
            </Label>
            <OutputArea
              mode="download"
              filename="merged.pdf"
              blob={output.blob}
              sizeInfo={output.sizeInfo}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
