'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload, Download, ArrowUp, ArrowDown, RotateCw, Trash2, ShieldCheck, FileText } from 'lucide-react'
import { PDFDocument, degrees } from 'pdf-lib'

interface PageState {
  originalIndex: number // 0-indexed original page index
  rotation: number      // 0, 90, 180, 270
}

export default function PDFOrganizerClient() {
  const tool = getToolById('pdf-organizer')!
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageState[]>([])
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setIsProcessing(true)

      try {
        const buffer = await file.arrayBuffer()
        setPdfData(buffer)
        
        const pdfDoc = await PDFDocument.load(buffer)
        const count = pdfDoc.getPageCount()
        
        const initialPages: PageState[] = Array.from({ length: count }).map((_, idx) => ({
          originalIndex: idx,
          rotation: 0,
        }))
        setPages(initialPages)
      } catch (err) {
        alert('Failed to parse PDF. Ensure it is not password-protected.')
        setSelectedFile(null)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleRotate = (idx: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    )
  }

  const handleDelete = (idx: number) => {
    setPages((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleMove = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === pages.length - 1) return

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    setPages((prev) => {
      const list = [...prev]
      const temp = list[idx]
      list[idx] = list[targetIdx]
      list[targetIdx] = temp
      return list
    })
  }

  const handleSave = async () => {
    if (!pdfData || pages.length === 0) return
    setIsProcessing(true)

    try {
      const sourceDoc = await PDFDocument.load(pdfData)
      const newDoc = await PDFDocument.create()

      // Copy and rotate pages
      for (const p of pages) {
        const [copiedPage] = await newDoc.copyPages(sourceDoc, [p.originalIndex])
        
        // Add rotation (taking into account any existing original rotation)
        const currentRot = copiedPage.getRotation().angle || 0
        copiedPage.setRotation(degrees((currentRot + p.rotation) % 360))
        
        newDoc.addPage(copiedPage)
      }

      const pdfBytes = await newDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `organized-${selectedFile?.name || 'document.pdf'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to rebuild PDF document.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPages([])
    setPdfData(null)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Upload zone */}
        {!selectedFile && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Upload Target PDF</Label>
            <div className="border-2 border-dashed border-(--color-border) rounded-xl p-8 bg-(--color-surface-alt)/40 text-center hover:bg-(--color-surface-alt)/60 transition-colors relative flex flex-col justify-center items-center gap-3">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                aria-label="Upload PDF file"
              />
              <div className="w-12 h-12 rounded-full bg-(--color-surface) border border-(--color-border) flex items-center justify-center shadow-xs">
                <Upload className="w-5 h-5 text-(--color-text-muted)" />
              </div>
              <div>
                <span className="text-xs font-semibold text-(--color-text-secondary) block">
                  Drag and drop PDF here, or click to browse
                </span>
                <span className="text-[10px] text-(--color-text-muted) font-semibold block mt-1">
                  Accepts PDF files up to 50MB
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Organizer sandbox */}
        {selectedFile && pages.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className="flex justify-between items-center p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-red-500/15 text-red-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-(--color-text-primary) truncate max-w-sm">{selectedFile.name}</h4>
                  <p className="text-[10px] text-(--color-text-muted) font-semibold mt-0.5">{pages.length} Pages Active</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleClear}
                className="text-xs h-8 text-red-500 hover:bg-red-500/10 cursor-pointer"
              >
                Clear File
              </Button>
            </div>

            {/* Grid of pages */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((p, idx) => (
                <div
                  key={`${p.originalIndex}-${idx}`}
                  className="p-3 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex flex-col justify-between items-center gap-3 shadow-xs relative group"
                >
                  {/* Page Card thumbnail dummy */}
                  <div
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                    className="w-full aspect-[3/4] bg-(--color-surface) rounded-lg border border-(--color-border)/50 flex items-center justify-center text-xs font-extrabold text-(--color-text-muted) shadow-inner transition-transform"
                  >
                    <span>Page {p.originalIndex + 1}</span>
                  </div>

                  {/* Actions inside card */}
                  <div className="flex gap-1 w-full justify-between items-center pt-1 border-t border-(--color-border)/30">
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-(--color-surface) text-(--color-text-secondary) disabled:opacity-30 cursor-pointer"
                        title="Move Page Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === pages.length - 1}
                        className="p-1 rounded hover:bg-(--color-surface) text-(--color-text-secondary) disabled:opacity-30 cursor-pointer"
                        title="Move Page Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRotate(idx)}
                      className="p-1 rounded hover:bg-(--color-surface) text-blue-500 cursor-pointer"
                      title="Rotate 90 degrees Clockwise"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(idx)}
                      className="p-1 rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <Button
              onClick={handleSave}
              disabled={isProcessing}
              className="w-full bg-(--color-primary) hover:bg-(--color-primary-dark) text-white h-10 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Save & Download PDF</span>
            </Button>
          </div>
        )}

        {/* Security Notification */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">🔒 Secure Sandbox Editing</h4>
            <p className="text-xs mt-1 leading-relaxed">
              PDF page decomposition, rotation transforms, and reorder arrays are compiled entirely client-side. The file contents never leave your device.
            </p>
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
