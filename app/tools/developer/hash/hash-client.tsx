'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { sha256, sha512 } from '@noble/hashes/sha2.js'
import { sha1, md5 } from '@noble/hashes/legacy.js'
import { bytesToHex } from '@noble/hashes/utils.js'
import { Copy, Check, Info } from 'lucide-react'

interface HashOutputs {
  md5: string
  sha1: string
  sha256: string
  sha512: string
}

function hashText(text: string): HashOutputs {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  return {
    md5: bytesToHex(md5(data)),
    sha1: bytesToHex(sha1(data)),
    sha256: bytesToHex(sha256(data)),
    sha512: bytesToHex(sha512(data)),
  }
}

async function hashFile(file: File): Promise<HashOutputs> {
  const arrayBuffer = await file.arrayBuffer()
  const data = new Uint8Array(arrayBuffer)
  return {
    md5: bytesToHex(md5(data)),
    sha1: bytesToHex(sha1(data)),
    sha256: bytesToHex(sha256(data)),
    sha512: bytesToHex(sha512(data)),
  }
}

export default function HashClient() {
  const tool = getToolById('hash-generator')!
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')

  // Text Mode
  const [textInput, setTextInput] = useState('')

  // Compute text hashes on the fly during render
  const textHashes = textInput ? hashText(textInput) : null

  // File Mode
  const [files, setFiles] = useState<File[]>([])
  const [fileHashes, setFileHashes] = useState<HashOutputs | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [fileError, setFileError] = useState('')

  const [copiedMap, setCopiedMap] = useState<{ [key: string]: boolean }>({})

  // Handle File Acceptance
  const handleFilesAccepted = async (acceptedFiles: File[]) => {
    setFileError('')
    setFileHashes(null)
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setFiles([file])
    setIsProcessingFile(true)

    try {
      const hashes = await hashFile(file)
      setFileHashes(hashes)
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Error hashing file')
      setFiles([])
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleRemoveFile = () => {
    setFiles([])
    setFileHashes(null)
    setFileError('')
  }

  const handleCopyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedMap((prev) => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [key]: false }))
    }, 2000)
  }

  const handleClear = () => {
    setTextInput('')
    setFiles([])
    setFileHashes(null)
    setFileError('')
  }

  const renderHashOutputRow = (label: string, value: string, key: string) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 border-b border-(--color-border) last:border-b-0 hover:bg-(--color-surface-alt)/30 transition-colors">
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-(--color-text-secondary)">{label}</span>
          <p className="font-mono text-xs text-(--color-primary) break-all">{value}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer text-[10px] h-7 w-20 shrink-0 self-end sm:self-center"
          onClick={() => handleCopyText(key, value)}
        >
          {copiedMap[key] ? <Check className="w-3.5 h-3.5 text-(--color-success) mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
          {copiedMap[key] ? 'Copied' : 'Copy'}
        </Button>
      </div>
    )
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as 'text' | 'file')
            handleClear()
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-(--color-surface-alt)">
            <TabsTrigger value="text" className="cursor-pointer">Text Hash</TabsTrigger>
            <TabsTrigger value="file" className="cursor-pointer">File Hash</TabsTrigger>
          </TabsList>

          {/* Text Hash Tab */}
          <TabsContent value="text" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="text-hash-input" className="text-sm font-semibold">
                Input Text
              </Label>
              <textarea
                id="text-hash-input"
                rows={6}
                placeholder="Type or paste text to generate checksum hashes..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) text-sm focus:border-(--color-primary) focus:outline-none placeholder:text-(--color-text-muted)"
              />
            </div>

            {textHashes && (
              <div className="space-y-2 pt-2">
                <Label className="text-sm font-semibold">Generated Hashes</Label>
                <div className="border border-(--color-border) rounded-xl overflow-hidden text-xs">
                  {renderHashOutputRow('MD5 Checksum', textHashes.md5, 'text-md5')}
                  {renderHashOutputRow('SHA-1 Checksum', textHashes.sha1, 'text-sha1')}
                  {renderHashOutputRow('SHA-256 Checksum', textHashes.sha256, 'text-sha256')}
                  {renderHashOutputRow('SHA-512 Checksum', textHashes.sha512, 'text-sha512')}
                </div>
              </div>
            )}
          </TabsContent>

          {/* File Hash Tab */}
          <TabsContent value="file" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Convert File to Checksum</Label>
              <DropZone
                accept={{ '*/*': [] }}
                maxSizeMB={50}
                multiple={false}
                onFilesAccepted={handleFilesAccepted}
                onError={(msg) => setFileError(msg)}
                files={files}
                onRemove={handleRemoveFile}
              />
            </div>

            {isProcessingFile && (
              <p className="text-xs text-(--color-text-muted) animate-pulse">Calculating hashes...</p>
            )}

            {fileError && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="font-mono">{fileError}</div>
              </div>
            )}

            {fileHashes && (
              <div className="space-y-2 pt-2">
                <Label className="text-sm font-semibold">File Hashes</Label>
                <div className="border border-(--color-border) rounded-xl overflow-hidden text-xs">
                  {renderHashOutputRow('MD5 Checksum', fileHashes.md5, 'file-md5')}
                  {renderHashOutputRow('SHA-1 Checksum', fileHashes.sha1, 'file-sha1')}
                  {renderHashOutputRow('SHA-256 Checksum', fileHashes.sha256, 'file-sha256')}
                  {renderHashOutputRow('SHA-512 Checksum', fileHashes.sha512, 'file-sha512')}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Reset / Clear Trigger */}
        {(textInput || files.length > 0) && (
          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              onClick={handleClear}
              className="text-(--color-text-secondary) hover:text-(--color-danger) text-xs cursor-pointer"
            >
              Reset / Clear Inputs
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
