'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, Download, Tags, ShieldCheck } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'

export default function PDFMetadataClient() {
  const tool = getToolById('pdf-metadata')!
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)

  // Document properties
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [subject, setSubject] = useState('')
  const [keywords, setKeywords] = useState('')
  const [creator, setCreator] = useState('')

  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setIsProcessing(true)

      try {
        const buffer = await file.arrayBuffer()
        setPdfData(buffer)

        const pdfDoc = await PDFDocument.load(buffer)
        
        // Extract existing metadata properties
        setTitle(pdfDoc.getTitle() || '')
        setAuthor(pdfDoc.getAuthor() || '')
        setSubject(pdfDoc.getSubject() || '')
        setKeywords(pdfDoc.getKeywords() || '')
        setCreator(pdfDoc.getCreator() || '')
      } catch (err) {
        alert('Failed to parse PDF metadata.')
        setSelectedFile(null)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleSaveMetadata = async () => {
    if (!pdfData) return
    setIsProcessing(true)

    try {
      const pdfDoc = await PDFDocument.load(pdfData)

      // Set new metadata attributes
      pdfDoc.setTitle(title.trim())
      pdfDoc.setAuthor(author.trim())
      pdfDoc.setSubject(subject.trim())
      pdfDoc.setKeywords(keywords.split(',').map((k) => k.trim()).filter(Boolean))
      pdfDoc.setCreator(creator.trim())

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `updated-${selectedFile?.name || 'document.pdf'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err) {
      alert('Failed to update PDF metadata.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPdfData(null)
    setTitle('')
    setAuthor('')
    setSubject('')
    setKeywords('')
    setCreator('')
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

        {/* Configuration settings sandbox */}
        {selectedFile && pdfData && (
          <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4 shadow-xs animate-fade-in max-w-2xl mx-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) pb-2 border-b border-(--color-border)/50 flex items-center gap-1.5">
              <Tags className="w-4 h-4 text-(--color-primary)" />
              <span>PDF Document Metadata Editor</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Document Title */}
              <div className="space-y-1.5">
                <Label htmlFor="doc-title-input" className="text-xs font-semibold text-(--color-text-muted)">Document Title</Label>
                <Input
                  id="doc-title-input"
                  type="text"
                  placeholder="e.g. Annual Report"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8.5 bg-(--color-surface) border-(--color-border) text-xs"
                />
              </div>

              {/* Author */}
              <div className="space-y-1.5">
                <Label htmlFor="doc-author-input" className="text-xs font-semibold text-(--color-text-muted)">Author / Publisher</Label>
                <Input
                  id="doc-author-input"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="h-8.5 bg-(--color-surface) border-(--color-border) text-xs"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label htmlFor="doc-subject-input" className="text-xs font-semibold text-(--color-text-muted)">Document Subject</Label>
                <Input
                  id="doc-subject-input"
                  type="text"
                  placeholder="e.g. Sales Metrics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-8.5 bg-(--color-surface) border-(--color-border) text-xs"
                />
              </div>

              {/* Creator Application */}
              <div className="space-y-1.5">
                <Label htmlFor="doc-creator-input" className="text-xs font-semibold text-(--color-text-muted)">Creator / Application</Label>
                <Input
                  id="doc-creator-input"
                  type="text"
                  placeholder="e.g. Microsoft Word"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  className="h-8.5 bg-(--color-surface) border-(--color-border) text-xs"
                />
              </div>

              {/* Keywords (colspan 2) */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="doc-keywords-input" className="text-xs font-semibold text-(--color-text-muted)">Keywords (comma separated)</Label>
                <Input
                  id="doc-keywords-input"
                  type="text"
                  placeholder="e.g. finance, statistics, annual"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="h-8.5 bg-(--color-surface) border-(--color-border) text-xs"
                />
              </div>
            </div>

            {/* Actions button */}
            <div className="flex gap-2 pt-4 border-t border-(--color-border)/40">
              <Button
                onClick={handleSaveMetadata}
                disabled={isProcessing}
                className="bg-(--color-primary) hover:bg-(--color-primary-dark) text-white h-8.5 text-xs font-semibold px-4 cursor-pointer"
              >
                <Download className="w-4 h-4 mr-1.5" />
                <span>Save Metadata & Download</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                className="border-(--color-border) hover:bg-(--color-surface) text-xs h-8.5 cursor-pointer ml-auto"
              >
                Clear File
              </Button>
            </div>
          </div>
        )}

        {/* Security Notification */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">🔒 Secure Local Metadata Audits</h4>
            <p className="text-xs mt-1 leading-relaxed">
              PDF document properties modification and tags removal are processed in-memory. File metrics are never shared with third-party servers.
            </p>
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
