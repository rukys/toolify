'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { OutputArea } from '@/components/tool/output-area'
import { Info, Download } from 'lucide-react'

// Text encode helper handling UTF-8 properly
function encodeText(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)))
  } catch {
    throw new Error('Unable to encode text to Base64')
  }
}

// Text decode helper handling UTF-8 properly
function decodeText(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64.trim())))
  } catch {
    throw new Error('Invalid Base64 string for decoding')
  }
}

// File base64 conversion helper
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // strip "data:*/*;base64," prefix
      const commaIndex = result.indexOf(',')
      if (commaIndex !== -1) {
        resolve(result.slice(commaIndex + 1))
      } else {
        resolve(result)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export default function Base64Client() {
  const tool = getToolById('base64')!
  const [activeTab, setActiveTab] = useState<'encode' | 'decode' | 'file'>('encode')
  
  // Text Mode States
  const [textInput, setTextInput] = useState('')

  // Compute text output and error on the fly
  let textOutput = ''
  let textError = ''
  if (textInput) {
    try {
      if (activeTab === 'encode') {
        textOutput = encodeText(textInput)
      } else if (activeTab === 'decode') {
        textOutput = decodeText(textInput)
      }
    } catch (err) {
      textError = err instanceof Error ? err.message : String(err)
    }
  }

  // File Mode States
  const [files, setFiles] = useState<File[]>([])
  const [fileOutput, setFileOutput] = useState('')
  const [fileError, setFileError] = useState('')
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  // Handle File Acceptance
  const handleFilesAccepted = async (acceptedFiles: File[]) => {
    setFileError('')
    setFileOutput('')
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setFiles([file])
    setIsProcessingFile(true)

    try {
      const b64 = await fileToBase64(file)
      setFileOutput(b64)
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Error processing file')
      setFiles([])
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleRemoveFile = () => {
    setFiles([])
    setFileOutput('')
    setFileError('')
  }

  const handleDownloadBase64Text = () => {
    if (!fileOutput || files.length === 0) return
    const blob = new Blob([fileOutput], { type: 'text/plain;charset=utf-8' })
    const filename = `${files[0].name}.base64.txt`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setTextInput('')
    setFiles([])
    setFileOutput('')
    setFileError('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as 'encode' | 'decode' | 'file')
            handleClear()
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 bg-[var(--color-surface-alt)]">
            <TabsTrigger value="encode" className="cursor-pointer">Encode Text</TabsTrigger>
            <TabsTrigger value="decode" className="cursor-pointer">Decode Text</TabsTrigger>
            <TabsTrigger value="file" className="cursor-pointer">File to Base64</TabsTrigger>
          </TabsList>

          {/* Encode Text Tab */}
          <TabsContent value="encode" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="encode-text-input" className="text-sm font-semibold">
                Text to Encode
              </Label>
              <textarea
                id="encode-text-input"
                rows={6}
                placeholder="Type or paste the plain text here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {textError && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="font-mono">{textError}</div>
              </div>
            )}

            {textOutput && (
              <div className="space-y-2">
                <OutputArea mode="text" content={textOutput} label="Base64 Encoded Output" />
              </div>
            )}
          </TabsContent>

          {/* Decode Text Tab */}
          <TabsContent value="decode" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="decode-text-input" className="text-sm font-semibold">
                Base64 Text to Decode
              </Label>
              <textarea
                id="decode-text-input"
                rows={6}
                placeholder="Paste the Base64 encoded string here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] font-mono text-sm focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {textError && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="font-mono">{textError}</div>
              </div>
            )}

            {textOutput && (
              <div className="space-y-2">
                <OutputArea mode="text" content={textOutput} label="Decoded Plain Text" />
              </div>
            )}
          </TabsContent>

          {/* File to Base64 Tab */}
          <TabsContent value="file" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Convert File to Base64</Label>
              <DropZone
                accept={{ '*/*': [] }}
                maxSizeMB={10}
                multiple={false}
                onFilesAccepted={handleFilesAccepted}
                onError={(msg) => setFileError(msg)}
                files={files}
                onRemove={handleRemoveFile}
              />
            </div>

            {isProcessingFile && (
              <p className="text-xs text-[var(--color-text-muted)] animate-pulse">Encoding file...</p>
            )}

            {fileError && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="font-mono">{fileError}</div>
              </div>
            )}

            {fileOutput && (
              <div className="space-y-4">
                <OutputArea mode="text" content={fileOutput} label="Base64 String" />
                
                <div className="flex items-center justify-end">
                  <Button onClick={handleDownloadBase64Text} variant="outline" size="sm" className="cursor-pointer">
                    <Download className="w-4 h-4 mr-2" /> Download as TXT
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Clear Button */}
        {(textInput || files.length > 0) && (
          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={handleClear} className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] cursor-pointer text-xs">
              Reset / Clear Inputs
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
