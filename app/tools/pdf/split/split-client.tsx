'use client'

import { useState, useMemo } from 'react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById, getRelatedTools } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { ProcessingButton } from '@/components/tool/processing-button'
import { OutputArea } from '@/components/tool/output-area'
import { toast } from 'sonner'
import { splitPDF, zipPDFs, SplitMode } from '@/lib/converters/pdf-split'
import { Label } from '@/components/ui/label'
import { formatSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileIcon, Trash2, Layers, Grid } from 'lucide-react'

export default function SplitClient() {
  const tool = getToolById('pdf-split')!
  const related = getRelatedTools('pdf-split')

  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [splitMode, setSplitMode] = useState<SplitMode>('individual')

  // Inputs
  const [rangeInput, setRangeInput] = useState('1-3, 5')
  const [nInput, setNInput] = useState<number | string>(1)

  // Outputs
  const [output, setOutput] = useState<{ blob: Blob; filename: string; sizeInfo: string } | null>(null)

  const handleFileAccepted = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const selectedFile = acceptedFiles[0]
    setFile(selectedFile)
    setTotalPages(0)
    setOutput(null)

    try {
      const buffer = await selectedFile.arrayBuffer()
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true })
      setTotalPages(pdf.getPageCount())
    } catch (err) {
      console.error(err)
      toast.error('Failed to parse PDF file. It might be protected or corrupted.')
      setFile(null)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setTotalPages(0)
    setOutput(null)
  }

  // Count how many pages are selected in range mode (real-time validation)
  const rangeCount = useMemo(() => {
    if (!rangeInput || totalPages === 0) return 0
    const indices = new Set<number>()
    const parts = rangeInput.split(',')
    for (const part of parts) {
      const trimmed = part.trim()
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-')
        const start = Number(startStr)
        const end = Number(endStr)
        if (!isNaN(start) && !isNaN(end)) {
          const from = Math.min(start, end)
          const to = Math.max(start, end)
          for (let i = from; i <= Math.min(to, totalPages); i++) {
            if (i >= 1) indices.add(i - 1)
          }
        }
      } else {
        const page = Number(trimmed)
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
          indices.add(page - 1)
        }
      }
    }
    return indices.size
  }, [rangeInput, totalPages])
  const batchCount = Math.ceil(totalPages / (Number(nInput) || 1))

  const handleSplit = async () => {
    if (!file) return

    try {
      if (splitMode === 'range' && rangeCount === 0) {
        toast.error('Please enter a valid page range (e.g. 1-3, 5)')
        throw new Error('Invalid range')
      }
      if (splitMode === 'every-n') {
        const nVal = Number(nInput)
        if (isNaN(nVal) || nVal < 1 || nVal > totalPages) {
          toast.error(`Please enter an N value between 1 and ${totalPages}`)
          throw new Error('Invalid N value')
        }
      }

      const { blobs, names } = await splitPDF(file, splitMode, {
        range: rangeInput,
        n: Number(nInput),
      })



      if (blobs.length === 1) {
        // Single PDF file output
        setOutput({
          blob: blobs[0],
          filename: names[0],
          sizeInfo: `${formatSize(file.size)} → ${formatSize(blobs[0].size)}`,
        })
      } else {
        // Multiple files -> Bundle into zip
        const zipBlob = await zipPDFs(blobs, names)
        setOutput({
          blob: zipBlob,
          filename: 'split-pages.zip',
          sizeInfo: `${formatSize(file.size)} → ${formatSize(zipBlob.size)} (${blobs.length} files)`,
        })
      }

      toast.success('PDF split successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to split PDF. Please check settings and try again.')
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
            <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
              <FileIcon className="w-8 h-8 text-[var(--color-primary)] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-[var(--color-text-primary)]">
                  {file.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB •{' '}
                  <strong className="text-[var(--color-primary)]">
                    {totalPages > 0 ? `${totalPages} page${totalPages > 1 ? 's' : ''}` : 'Loading page count...'}
                  </strong>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface)] cursor-pointer h-9 w-9"
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
        {file && totalPages > 0 && (
          <div className="space-y-4 border-t border-[var(--color-border)] pt-5 animate-fade-in">
            <Label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Split Configurations
            </Label>

            {/* Split Mode Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSplitMode('individual')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  splitMode === 'individual'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)] bg-[var(--color-surface)]'
                }`}
              >
                <Grid className="w-5 h-5 mb-2" />
                <span className="text-xs font-bold">Individual Pages</span>
                <span className="text-[10px] opacity-75 mt-1">Extract every page as a separate PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('range')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  splitMode === 'range'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)] bg-[var(--color-surface)]'
                }`}
              >
                <Layers className="w-5 h-5 mb-2" />
                <span className="text-xs font-bold">Custom Range</span>
                <span className="text-[10px] opacity-75 mt-1">Extract specific pages or page ranges</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('every-n')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  splitMode === 'every-n'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)] bg-[var(--color-surface)]'
                }`}
              >
                <Layers className="w-5 h-5 mb-2 rotate-90" />
                <span className="text-xs font-bold">Split Every N Pages</span>
                <span className="text-[10px] opacity-75 mt-1">Split document into N-page batches</span>
              </button>
            </div>

            {/* Split Mode details inputs */}
            <div className="bg-[var(--color-surface-alt)] p-4 rounded-xl border border-[var(--color-border)]">
              {splitMode === 'individual' && (
                <div className="text-xs space-y-1">
                  <p className="font-semibold">Extract Every Page</p>
                  <p className="text-[var(--color-text-secondary)]">
                    This will split the document into <strong className="text-[var(--color-primary)]">{totalPages}</strong> separate PDF files, bundled together into a single `.zip` file for easy download.
                  </p>
                </div>
              )}

              {splitMode === 'range' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="page-range-input" className="text-xs font-semibold">Page Range</Label>
                    <Input
                      id="page-range-input"
                      value={rangeInput}
                      onChange={(e) => setRangeInput(e.target.value)}
                      placeholder="e.g. 1-3, 5, 8-10"
                      className="bg-[var(--color-surface)]"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs text-[var(--color-text-secondary)] font-mono">
                    <span>
                      Selected:{' '}
                      <strong className="text-[var(--color-primary)]">
                        {rangeCount} page{rangeCount !== 1 ? 's' : ''}
                      </strong>
                    </span>
                    <span>Total pages: {totalPages}</span>
                  </div>
                </div>
              )}

              {splitMode === 'every-n' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="pages-per-file-input" className="text-xs font-semibold">Pages per File</Label>
                    <Input
                      id="pages-per-file-input"
                      type="number"
                      min={1}
                      max={totalPages}
                      value={nInput}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '') {
                          setNInput('')
                        } else {
                          const num = Number(val)
                          if (!isNaN(num)) setNInput(num)
                        }
                      }}
                      className="bg-[var(--color-surface)]"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs text-[var(--color-text-secondary)] font-mono">
                    <span>
                      Batch output:{' '}
                      <strong className="text-[var(--color-primary)]">
                        {batchCount} file{batchCount !== 1 ? 's' : ''}
                      </strong>
                    </span>
                    <span>Total pages: {totalPages}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Split trigger */}
            <div className="pt-2">
              <ProcessingButton
                onClick={handleSplit}
                label={
                  splitMode === 'individual'
                    ? `Extract ${totalPages} Pages`
                    : splitMode === 'range'
                    ? `Extract Selected (${rangeCount} Pages)`
                    : `Split into ${batchCount} Files`
                }
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="space-y-2 pt-2 animate-fade-in">
            <Label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Output Document
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
