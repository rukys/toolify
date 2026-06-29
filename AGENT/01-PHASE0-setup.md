# 🏗️ Phase 0 — Project Setup & Shared Components

> **Baca dulu:** `00-CONTEXT.md` dan `PROGRESS.md`  
> **Goal phase ini:** Project scaffolding, design system, dan semua shared components siap sebelum ngerjain tool manapun.

---

## Checklist Phase 0

- [ ] Project scaffolding
- [ ] Dependencies installed
- [ ] CSS variables & globals.css
- [ ] Types
- [ ] Tools Registry (skeleton)
- [ ] Shared components
- [ ] Homepage & layout
- [ ] Dark mode
- [ ] Mobile responsive

---

## Step 1 — Scaffold Project

```bash
npx create-next-app@latest toolify --typescript --tailwind --app
cd toolify
```

---

## Step 2 — Install Dependencies

```bash
# Phase 1 deps
npm install uuid qrcode marked dompurify diff @noble/hashes prism-react-renderer

# Phase 1 types
npm install -D @types/uuid @types/qrcode @types/dompurify @types/diff

# UI deps
npm install lucide-react @dnd-kit/core react-dropzone sonner clsx tailwind-merge

# shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input select slider tabs toast accordion badge
```

> ⚠️ Phase 2 deps (pdf-lib, jszip, browser-image-compression, react-image-crop) diinstall nanti di Phase 2A/2B

---

## Step 3 — globals.css

Ganti isi `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #2563EB;
  --color-primary-dark: #1D4ED8;
  --color-primary-light: #EFF6FF;
  --color-accent: #0EA5E9;
  --color-surface: #FFFFFF;
  --color-surface-alt: #F8FAFC;
  --color-border: #E2E8F0;
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #94A3B8;
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-danger: #DC2626;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}

.dark {
  --color-surface: #0F172A;
  --color-surface-alt: #1E293B;
  --color-border: #334155;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
}

body {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-inter), sans-serif;
}

/* Mono font untuk output code/JSON/hash */
.font-mono {
  font-family: var(--font-jetbrains-mono), monospace;
}
```

---

## Step 4 — Types

Buat `types/tools.ts`:

```typescript
import { LucideIcon } from 'lucide-react'

export type ToolCategory = 'pdf' | 'image' | 'generator' | 'text' | 'developer'

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error'

export interface ToolMeta {
  id: string                    // 'pdf-merge'
  name: string                  // 'PDF Merge'
  description: string           // max 60 chars
  category: ToolCategory
  href: string                  // '/tools/pdf/merge'
  icon: string                  // Lucide icon name as string
  tags: string[]                // untuk search
  isNew?: boolean
  phase: 1 | 2 | 3
  processingLocation: 'client' | 'server'
  acceptedFormats?: string[]
  maxFileSizeMB?: number
}
```

---

## Step 5 — Tools Registry

Buat `lib/tools-registry.ts`:

```typescript
import { ToolMeta } from '@/types/tools'

export const tools: ToolMeta[] = [
  // === DEVELOPER TOOLS (Phase 1) ===
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON instantly',
    category: 'developer',
    href: '/tools/developer/json',
    icon: 'Braces',
    tags: ['json', 'format', 'validate', 'minify', 'beautify'],
    phase: 1,
    processingLocation: 'client',
  },
  {
    id: 'base64',
    name: 'Base64 Encode / Decode',
    description: 'Encode or decode text and files to Base64',
    category: 'developer',
    href: '/tools/developer/base64',
    icon: 'Code2',
    tags: ['base64', 'encode', 'decode'],
    phase: 1,
    processingLocation: 'client',
    maxFileSizeMB: 10,
  },
  {
    id: 'url-encode',
    name: 'URL Encode / Decode',
    description: 'Encode or decode URL strings',
    category: 'developer',
    href: '/tools/developer/url',
    icon: 'Link2',
    tags: ['url', 'encode', 'decode', 'percent-encoding'],
    phase: 1,
    processingLocation: 'client',
  },
  {
    id: 'jwt-debugger',
    name: 'JWT Debugger',
    description: 'Decode and inspect JWT tokens',
    category: 'developer',
    href: '/tools/developer/jwt',
    icon: 'Shield',
    tags: ['jwt', 'token', 'decode', 'json web token'],
    phase: 1,
    processingLocation: 'client',
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions live',
    category: 'developer',
    href: '/tools/developer/regex',
    icon: 'Search',
    tags: ['regex', 'regexp', 'pattern', 'match', 'test'],
    phase: 1,
    processingLocation: 'client',
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and convert between HEX, RGB, HSL',
    category: 'developer',
    href: '/tools/developer/color',
    icon: 'Pipette',
    tags: ['color', 'hex', 'rgb', 'hsl', 'picker', 'converter'],
    phase: 1,
    processingLocation: 'client',
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert Unix timestamps to human-readable dates',
    category: 'developer',
    href: '/tools/developer/timestamp',
    icon: 'Clock',
    tags: ['timestamp', 'unix', 'date', 'time', 'convert'],
    phase: 1,
    processingLocation: 'client',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes',
    category: 'developer',
    href: '/tools/developer/hash',
    icon: 'Fingerprint',
    tags: ['hash', 'md5', 'sha256', 'sha512', 'checksum'],
    phase: 1,
    processingLocation: 'client',
  },

  // === GENERATOR TOOLS (Phase 1) ===
  {
    id: 'qr-code',
    name: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, email, or phone',
    category: 'generator',
    href: '/tools/generator/qr-code',
    icon: 'QrCode',
    tags: ['qr', 'qr code', 'generate', 'barcode'],
    phase: 1,
    processingLocation: 'client',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong, random passwords instantly',
    category: 'generator',
    href: '/tools/generator/password',
    icon: 'KeyRound',
    tags: ['password', 'generate', 'random', 'secure'],
    phase: 1,
    processingLocation: 'client',
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate UUID v4, v7, and ULID identifiers',
    category: 'generator',
    href: '/tools/generator/uuid',
    icon: 'Hash',
    tags: ['uuid', 'guid', 'ulid', 'generate', 'identifier'],
    phase: 1,
    processingLocation: 'client',
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text for designs and mockups',
    category: 'generator',
    href: '/tools/generator/lorem',
    icon: 'AlignLeft',
    tags: ['lorem ipsum', 'placeholder', 'text', 'generate'],
    phase: 1,
    processingLocation: 'client',
  },

  // === TEXT TOOLS (Phase 1) ===
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, reading time',
    category: 'text',
    href: '/tools/text/word-counter',
    icon: 'FileText',
    tags: ['word count', 'character count', 'reading time', 'text'],
    phase: 1,
    processingLocation: 'client',
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text to UPPER, lower, Title, camelCase, and more',
    category: 'text',
    href: '/tools/text/case-converter',
    icon: 'Type',
    tags: ['case', 'uppercase', 'lowercase', 'camelcase', 'snakecase'],
    phase: 1,
    processingLocation: 'client',
  },
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Write and preview Markdown with live rendering',
    category: 'text',
    href: '/tools/text/markdown',
    icon: 'BookOpen',
    tags: ['markdown', 'preview', 'md', 'render'],
    phase: 1,
    processingLocation: 'client',
  },
  {
    id: 'diff-checker',
    name: 'Diff Checker',
    description: 'Compare two texts and highlight differences',
    category: 'text',
    href: '/tools/text/diff',
    icon: 'GitDiff',
    tags: ['diff', 'compare', 'text', 'difference'],
    phase: 1,
    processingLocation: 'client',
  },

  // === PDF TOOLS (Phase 2) ===
  {
    id: 'pdf-merge',
    name: 'PDF Merge',
    description: 'Combine multiple PDF files into one',
    category: 'pdf',
    href: '/tools/pdf/merge',
    icon: 'Layers',
    tags: ['pdf', 'merge', 'combine', 'join'],
    phase: 2,
    processingLocation: 'client',
    acceptedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
  },
  {
    id: 'pdf-split',
    name: 'PDF Split',
    description: 'Split PDF into individual pages or page ranges',
    category: 'pdf',
    href: '/tools/pdf/split',
    icon: 'Scissors',
    tags: ['pdf', 'split', 'extract', 'pages'],
    phase: 2,
    processingLocation: 'client',
    acceptedFormats: ['application/pdf'],
    maxFileSizeMB: 50,
  },
  {
    id: 'pdf-compress',
    name: 'PDF Compress',
    description: 'Reduce PDF file size without losing quality',
    category: 'pdf',
    href: '/tools/pdf/compress',
    icon: 'Archive',
    tags: ['pdf', 'compress', 'reduce', 'optimize'],
    phase: 2,
    processingLocation: 'client',
    acceptedFormats: ['application/pdf'],
    maxFileSizeMB: 50,
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert JPG, PNG, or WEBP images to PDF',
    category: 'pdf',
    href: '/tools/pdf/image-to-pdf',
    icon: 'FileImage',
    tags: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert'],
    phase: 2,
    processingLocation: 'client',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFileSizeMB: 50,
  },

  // === IMAGE TOOLS (Phase 2) ===
  {
    id: 'image-compress',
    name: 'Image Compress',
    description: 'Compress JPG, PNG, WEBP images without losing quality',
    category: 'image',
    href: '/tools/image/compress',
    icon: 'ImageDown',
    tags: ['image', 'compress', 'reduce', 'optimize', 'jpg', 'png', 'webp'],
    phase: 2,
    processingLocation: 'client',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
  },
  {
    id: 'image-resize',
    name: 'Image Resize',
    description: 'Resize images by dimensions, percentage, or preset sizes',
    category: 'image',
    href: '/tools/image/resize',
    icon: 'Maximize2',
    tags: ['image', 'resize', 'dimensions', 'scale'],
    phase: 2,
    processingLocation: 'client',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
  },
  {
    id: 'image-convert',
    name: 'Image Convert',
    description: 'Convert images between JPG, PNG, WEBP, GIF, and more',
    category: 'image',
    href: '/tools/image/convert',
    icon: 'RefreshCw',
    tags: ['image', 'convert', 'jpg', 'png', 'webp', 'gif'],
    phase: 2,
    processingLocation: 'client',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFileSizeMB: 50,
  },
  {
    id: 'image-crop',
    name: 'Image Crop',
    description: 'Crop images with free or locked aspect ratios',
    category: 'image',
    href: '/tools/image/crop',
    icon: 'Crop',
    tags: ['image', 'crop', 'trim', 'aspect ratio'],
    phase: 2,
    processingLocation: 'client',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
  },
]

// Helper functions
export function getToolsByCategory(category: string) {
  return tools.filter(t => t.category === category)
}

export function getToolById(id: string) {
  return tools.find(t => t.id === id)
}

export function getRelatedTools(toolId: string, limit = 4) {
  const tool = getToolById(toolId)
  if (!tool) return []
  return tools
    .filter(t => t.category === tool.category && t.id !== toolId)
    .slice(0, limit)
}

export function searchTools(query: string) {
  const q = query.toLowerCase()
  return tools.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.includes(q))
  )
}
```

---

## Step 6 — Shared Components

### `components/tool/drop-zone.tsx`

```typescript
'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  accept: Record<string, string[]>   // react-dropzone format
  maxSizeMB: number
  multiple?: boolean
  onFilesAccepted: (files: File[]) => void
  onError: (msg: string) => void
  files?: File[]
  onRemove?: (index: number) => void
}

export function DropZone({ accept, maxSizeMB, multiple = false, onFilesAccepted, onError, files = [], onRemove }: DropZoneProps) {
  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected.length > 0) {
      const err = rejected[0].errors[0]
      if (err.code === 'file-too-large') onError(`File too large. Maximum size is ${maxSizeMB} MB.`)
      else if (err.code === 'file-invalid-type') onError('File type not supported.')
      else onError('Invalid file.')
      return
    }
    onFilesAccepted(accepted)
  }, [maxSizeMB, onFilesAccepted, onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple,
  })

  if (files.length > 0) {
    return (
      <div className="space-y-2">
        {files.map((file, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            <File className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{formatBytes(file.size)}</p>
            </div>
            {onRemove && (
              <button onClick={() => onRemove(i)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <div {...getRootProps()} className="cursor-pointer text-center py-3 text-sm text-[var(--color-primary)] hover:underline">
          <input {...getInputProps()} />
          + Add more files
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
        isDragActive
          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] scale-[1.02]'
          : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] hover:border-[var(--color-primary)]'
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-10 h-10 mx-auto mb-4 text-[var(--color-text-muted)]" />
      <p className="text-base font-medium text-[var(--color-text-primary)]">
        {isDragActive ? 'Drop your file here' : 'Drop your file here'}
      </p>
      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
        or <span className="text-[var(--color-primary)] underline">Browse files</span>
      </p>
      <p className="text-xs text-[var(--color-text-muted)] mt-3">
        Max {maxSizeMB} MB
      </p>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
```

### `components/tool/processing-button.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProcessingStatus } from '@/types/tools'
import { cn } from '@/lib/utils'

interface ProcessingButtonProps {
  onClick: () => Promise<void>
  label: string
  className?: string
}

export function ProcessingButton({ onClick, label, className }: ProcessingButtonProps) {
  const [status, setStatus] = useState<ProcessingStatus>('idle')

  const handleClick = async () => {
    setStatus('processing')
    try {
      await onClick()
      setStatus('done')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={status === 'processing'}
      className={cn(
        'px-6 py-3 font-semibold transition-colors',
        status === 'done' && 'bg-[var(--color-success)]',
        status === 'error' && 'bg-[var(--color-danger)]',
        className
      )}
    >
      {status === 'idle' && label}
      {status === 'processing' && <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>}
      {status === 'done' && <><Check className="w-4 h-4 mr-2" /> Done</>}
      {status === 'error' && <><X className="w-4 h-4 mr-2" /> Try again</>}
    </Button>
  )
}
```

### `components/tool/output-area.tsx`

```typescript
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
      <div className="rounded-xl border border-[var(--color-success)] bg-green-50 dark:bg-green-950 p-4">
        <p className="text-sm font-medium text-[var(--color-success)] mb-2">✓ Ready</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-sm">{props.filename}</p>
            {props.sizeInfo && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{props.sizeInfo}</p>}
          </div>
          <Button onClick={handleDownload} size="sm">
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
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
        <span className="text-sm font-medium">{props.label ?? 'Output'}</span>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4 mr-1 text-[var(--color-success)]" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="p-4 text-sm font-mono overflow-auto max-h-64 bg-[var(--color-surface)]">
        {props.content}
      </pre>
    </div>
  )
}
```

---

## Step 7 — Root Layout

`app/layout.tsx` — setup Inter + JetBrains Mono font, dark mode class strategy.

```typescript
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'Toolify — Free Online Tools',
  description: 'Free browser-based utility tools. No upload, no login, no limits.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
```

---

## Acceptance Criteria Phase 0

Sebelum lanjut ke Phase 1, pastikan:

- [ ] `npm run dev` tidak ada error
- [ ] CSS variables terdefinisi dan bisa dipakai di semua component
- [ ] `tools-registry.ts` bisa diimport tanpa error
- [ ] `DropZone`, `ProcessingButton`, `OutputArea` bisa dirender tanpa crash
- [ ] Dark mode bisa toggle (manual class test)
