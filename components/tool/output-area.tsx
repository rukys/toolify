'use client'

import { Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

type OutputAreaProps =
  | {
      mode: 'download'
      filename: string
      blob: Blob
      sizeInfo?: string  // e.g. "4.2 MB → 1.1 MB (74% smaller)"
    }
  | {
      mode: 'text'
      content: string
      label?: string
    }

export function OutputArea(props: OutputAreaProps) {
  const [copied, setCopied] = useState(false)

  if (props.mode === 'download') {
    const handleDownload = () => {
      const url = URL.createObjectURL(props.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = props.filename
      a.click()
      URL.revokeObjectURL(url)
    }

    return (
      <div className="rounded-xl border border-(--color-success) bg-green-50 dark:bg-green-950/20 p-4">
        <p className="text-sm font-medium text-(--color-success) mb-2">✓ Ready</p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{props.filename}</p>
            {props.sizeInfo && <p className="text-xs text-(--color-text-muted) mt-0.5">{props.sizeInfo}</p>}
          </div>
          <Button onClick={handleDownload} size="sm" className="cursor-pointer shrink-0">
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
        </div>
      </div>
    )
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(props.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-(--color-border) overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-(--color-surface-alt) border-b border-(--color-border)">
        <span className="text-sm font-medium">{props.label ?? 'Output'}</span>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="cursor-pointer">
          {copied ? <Check className="w-4 h-4 mr-1 text-(--color-success)" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="p-4 text-sm font-mono overflow-auto max-h-96 bg-(--color-surface) whitespace-pre-wrap break-all">
        {props.content}
      </pre>
    </div>
  )
}
