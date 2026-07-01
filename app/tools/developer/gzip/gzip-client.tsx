'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FileArchive, Upload, Download, ArrowRightLeft, Info, File } from 'lucide-react'

type GzipMode = 'compress' | 'decompress'

export default function GzipClient() {
  const tool = getToolById('gzip')!
  const [mode, setMode] = useState<GzipMode>('compress')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null)
  const [outputFileName, setOutputFileName] = useState('')
  const [outputSize, setOutputSize] = useState<number | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      setOutputBlob(null)
      setOutputSize(null)
    }
  }

  const compressFile = async (file: File): Promise<Blob> => {
    // Check if CompressionStream is supported
    if (typeof CompressionStream === 'undefined') {
      throw new Error('CompressionStream API is not supported in this browser.')
    }
    const stream = file.stream().pipeThrough(new CompressionStream('gzip'))
    return new Response(stream).blob()
  }

  const decompressFile = async (file: File): Promise<Blob> => {
    // Check if DecompressionStream is supported
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('DecompressionStream API is not supported in this browser.')
    }
    const stream = file.stream().pipeThrough(new DecompressionStream('gzip'))
    return new Response(stream).blob()
  }

  const handleProcess = async () => {
    if (!selectedFile) return
    setIsProcessing(true)

    try {
      if (mode === 'compress') {
        const compressed = await compressFile(selectedFile)
        setOutputBlob(compressed)
        setOutputFileName(`${selectedFile.name}.gz`)
        setOutputSize(compressed.size)
      } else {
        const decompressed = await decompressFile(selectedFile)
        setOutputBlob(decompressed)
        
        // Strip out .gz suffix if present
        const cleanName = selectedFile.name.endsWith('.gz')
          ? selectedFile.name.slice(0, -3)
          : `decompressed-${selectedFile.name}`
        
        setOutputFileName(cleanName)
        setOutputSize(decompressed.size)
      }
    } catch (err: any) {
      alert(`Error: ${err.message || 'Operation failed. Ensure the file is a valid gzip format.'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!outputBlob || !outputFileName) return
    const url = URL.createObjectURL(outputBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = outputFileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setSelectedFile(null)
    setOutputBlob(null)
    setOutputSize(null)
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Toggle mode tab bar */}
        <div className="flex gap-1.5 p-1 rounded-lg bg-(--color-surface-alt) border border-(--color-border) max-w-md">
          {([
            { val: 'compress', label: 'Compress to Gzip (.gz)' },
            { val: 'decompress', label: 'Decompress from Gzip (.gz)' },
          ] as { val: GzipMode; label: string }[]).map((m) => (
            <button
              key={m.val}
              onClick={() => {
                setMode(m.val)
                handleClear()
              }}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all cursor-pointer ${
                mode === m.val
                  ? 'bg-(--color-primary) text-white'
                  : 'text-(--color-text-secondary) hover:bg-(--color-surface)'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Upload Dropzone */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Upload Target File</Label>
          <div className="border-2 border-dashed border-(--color-border) rounded-xl p-8 bg-(--color-surface-alt)/40 text-center hover:bg-(--color-surface-alt)/60 transition-colors relative flex flex-col justify-center items-center gap-3">
            <input
              type="file"
              accept={mode === 'decompress' ? '.gz' : undefined}
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label="Upload file for Gzip operations"
            />
            <div className="w-12 h-12 rounded-full bg-(--color-surface) border border-(--color-border) flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5 text-(--color-text-muted)" />
            </div>
            
            {selectedFile ? (
              <div className="space-y-1">
                <span className="text-xs font-bold text-(--color-text-primary) block max-w-sm truncate">
                  {selectedFile.name}
                </span>
                <span className="text-[10px] text-(--color-text-muted) font-semibold block">
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-xs font-semibold text-(--color-text-secondary) block">
                  Drag and drop file here, or click to browse
                </span>
                <span className="text-[10px] text-(--color-text-muted) font-semibold block mt-1">
                  {mode === 'decompress' ? 'Accepts .gz files' : 'Accepts any file type'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Process actions */}
        {selectedFile && (
          <div className="flex gap-2">
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="flex-1 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white cursor-pointer h-9.5 text-xs font-semibold"
            >
              {isProcessing ? 'Processing files...' : mode === 'compress' ? 'Gzip Compress' : 'Gzip Extract'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              className="border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer h-9.5 text-xs"
            >
              Clear
            </Button>
          </div>
        )}

        {/* Output metrics details */}
        {outputBlob && outputSize !== null && selectedFile && (
          <div className="p-5 rounded-xl border border-green-500/20 bg-green-500/5 space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 pb-2 border-b border-green-500/20 flex items-center gap-1.5">
              <FileArchive className="w-4 h-4" />
              <span>Gzip Processing Completed</span>
            </h3>

            {/* Output Details row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">Output File Name</span>
                <p className="text-xs font-mono font-bold text-(--color-text-primary) truncate">{outputFileName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">File Size</span>
                <p className="text-xs font-mono font-bold text-(--color-text-primary)">
                  {formatBytes(outputSize)}
                </p>
              </div>

              {mode === 'compress' && (
                <div className="sm:col-span-2 p-2.5 rounded-lg bg-(--color-surface) border border-(--color-border) text-[11px] text-(--color-text-muted) leading-relaxed">
                  <span className="font-bold text-(--color-text-secondary)">Compression Rate: </span>
                  {((1 - outputSize / selectedFile.size) * 100).toFixed(1)}% space saved!
                </div>
              )}
            </div>

            {/* Download button */}
            <Button
              onClick={handleDownload}
              className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer h-9.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Processed File</span>
            </Button>
          </div>
        )}

        {/* Information box */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">💡 Native Compression Streams API</h4>
            <p className="text-xs mt-1 leading-relaxed">
              This tool utilizes the browser native <code>CompressionStream</code> and <code>DecompressionStream</code> APIs to perform file packages. Compression runs entirely local, in-memory, without external Node-Canvas or third-party zlib modules.
            </p>
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
