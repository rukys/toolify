# 📄 Phase 2A — PDF Tools

> **Baca dulu:** `00-CONTEXT.md` → `PROGRESS.md` → file ini  
> **Prerequisite:** Phase 0 + Phase 1 (semua) selesai  
> **Goal:** 4 PDF tools fungsional, semua client-side

---

## Checklist Phase 2A

- [ ] Install dependencies Phase 2
- [ ] `app/tools/pdf/page.tsx` (category page)
- [ ] `lib/converters/pdf-merge.ts` + halaman PDF Merge
- [ ] `lib/converters/pdf-split.ts` + halaman PDF Split
- [ ] `lib/converters/pdf-compress.ts` + halaman PDF Compress
- [ ] `lib/converters/image-to-pdf.ts` + halaman Image to PDF

---

## Step 1 — Install Dependencies

```bash
npm install pdf-lib jszip
```

---

## ⚠️ Catatan Penting untuk AI Agent

**PDF Compress:** `pdf-lib` TIDAK bisa re-encode embedded images. Kompresi yang bisa dilakukan hanya:
- Hapus metadata (title, author, subject, keywords, producer, creator)
- Gunakan object streams (`useObjectStreams: true`)
- Hasil kompresi bisa sangat minimal untuk PDF gambar

**JANGAN** tampilkan UI yang menjanjikan kompresi besar. Gunakan copy yang jujur seperti yang ada di bawah.

---

## Route: `/tools/pdf`

Category page — tampilkan 4 PDF tools dalam grid.

---

## 1. PDF Merge

**Route:** `/tools/pdf/merge`  
**Library:** `pdf-lib`  
**Constraints:** Max 20 files, max total 100 MB

### Logic
```typescript
// lib/converters/pdf-merge.ts
import { PDFDocument } from 'pdf-lib'

export async function mergePDFs(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create()

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i, files.length)
    const arrayBuffer = await files[i].arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    pages.forEach(page => mergedPdf.addPage(page))
  }

  onProgress?.(files.length, files.length)
  return mergedPdf.save()
}
```

### UI Layout
```
[DropZone — multiple PDF, max 20 files, max 100MB total]

Sortable file list:
┌────────────────────────────────────────────────────┐
│  ⋮⋮  📄 document1.pdf        2.3 MB    [×]        │
│  ⋮⋮  📄 report.pdf           890 KB    [×]        │
│  ⋮⋮  📄 appendix.pdf         1.1 MB    [×]        │
└────────────────────────────────────────────────────┘
Total: 3 files · 4.3 MB                [+ Add more]

[Merge PDFs]  ← ProcessingButton

─── Output ──────────────────────────────────────────
[OutputArea mode="download" filename="merged.pdf"]
```

### Sortable File List
Gunakan `@dnd-kit/core` untuk drag-and-drop reorder. Urutan drag = urutan halaman di output.

### Page Layout Component
```typescript
// app/tools/pdf/merge/page.tsx
'use client'
import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { DropZone } from '@/components/tool/drop-zone'
import { ProcessingButton } from '@/components/tool/processing-button'
import { OutputArea } from '@/components/tool/output-area'
import { SortableFileList } from '@/components/tool/sortable-file-list'
import { mergePDFs } from '@/lib/converters/pdf-merge'
import { getToolById, getRelatedTools } from '@/lib/tools-registry'
import { toast } from 'sonner'

const tool = getToolById('pdf-merge')!
const related = getRelatedTools('pdf-merge')

export default function PDFMergePage() {
  const [files, setFiles] = useState<File[]>([])
  const [output, setOutput] = useState<{ blob: Blob; size: string } | null>(null)

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Add at least 2 PDF files to merge')
      throw new Error('Need 2+ files')
    }
    const merged = await mergePDFs(files)
    const blob = new Blob([merged], { type: 'application/pdf' })
    const totalMB = (files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(1)
    const outMB = (blob.size / 1024 / 1024).toFixed(1)
    setOutput({ blob, size: `${totalMB} MB → ${outMB} MB` })
  }

  return (
    <ToolLayout tool={tool} relatedTools={related}>
      <DropZone
        accept={{ 'application/pdf': ['.pdf'] }}
        maxSizeMB={50}
        multiple
        onFilesAccepted={f => setFiles(prev => [...prev, ...f].slice(0, 20))}
        onError={msg => toast.error(msg)}
        files={files}
        onRemove={i => setFiles(prev => prev.filter((_, idx) => idx !== i))}
      />

      {files.length >= 2 && (
        <ProcessingButton onClick={handleMerge} label="Merge PDFs" className="w-full mt-4" />
      )}

      {output && (
        <OutputArea
          mode="download"
          filename="merged.pdf"
          blob={output.blob}
          sizeInfo={output.size}
        />
      )}
    </ToolLayout>
  )
}
```

---

## 2. PDF Split

**Route:** `/tools/pdf/split`  
**Library:** `pdf-lib`, `jszip`  
**Constraints:** Max 1 file, max 50 MB

### Logic
```typescript
// lib/converters/pdf-split.ts
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'

export type SplitMode = 'individual' | 'range' | 'every-n'

export async function splitPDF(
  file: File,
  mode: SplitMode,
  options: { range?: string; n?: number }
): Promise<{ blobs: Blob[]; names: string[] }> {
  const arrayBuffer = await file.arrayBuffer()
  const sourcePdf = await PDFDocument.load(arrayBuffer)
  const totalPages = sourcePdf.getPageCount()

  let pageGroups: number[][] = []

  if (mode === 'individual') {
    pageGroups = Array.from({ length: totalPages }, (_, i) => [i])
  } else if (mode === 'range' && options.range) {
    const indices = parsePageRange(options.range, totalPages)
    pageGroups = [indices]
  } else if (mode === 'every-n' && options.n) {
    for (let i = 0; i < totalPages; i += options.n) {
      pageGroups.push(
        Array.from({ length: Math.min(options.n, totalPages - i) }, (_, j) => i + j)
      )
    }
  }

  const blobs: Blob[] = []
  const names: string[] = []

  for (let g = 0; g < pageGroups.length; g++) {
    const newPdf = await PDFDocument.create()
    const pages = await newPdf.copyPages(sourcePdf, pageGroups[g])
    pages.forEach(p => newPdf.addPage(p))
    const bytes = await newPdf.save()
    blobs.push(new Blob([bytes], { type: 'application/pdf' }))
    names.push(pageGroups.length === 1 ? 'extracted.pdf' : `page-${g + 1}.pdf`)
  }

  return { blobs, names }
}

// Parse "1-3, 5, 8-10" → [0, 1, 2, 4, 7, 8, 9] (0-indexed)
function parsePageRange(range: string, totalPages: number): number[] {
  const indices = new Set<number>()
  const parts = range.split(',')
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number)
      for (let i = start; i <= Math.min(end, totalPages); i++) {
        if (i >= 1) indices.add(i - 1)
      }
    } else {
      const page = Number(trimmed)
      if (page >= 1 && page <= totalPages) indices.add(page - 1)
    }
  }
  return Array.from(indices).sort((a, b) => a - b)
}

export async function zipPDFs(blobs: Blob[], names: string[]): Promise<Blob> {
  const zip = new JSZip()
  for (let i = 0; i < blobs.length; i++) {
    zip.file(names[i], blobs[i])
  }
  return zip.generateAsync({ type: 'blob' })
}
```

### UI Layout
```
[DropZone — single PDF]

After upload:
document.pdf · 24 pages

Split mode:
○ Extract pages    ● Individual pages    ○ Every N pages

[If "Extract pages":]
Page range: [1-3, 5, 8-10     ]
            Preview: 5 pages selected

[If "Every N pages":]
N: [3] pages per file → will create 8 files

[Split PDF]

─── Output ───────────────────────
✓ 24 individual PDF files
[Download all as .zip]
```

---

## 3. PDF Compress

**Route:** `/tools/pdf/compress`  
**Library:** `pdf-lib`  
**Constraints:** Max 1 file, max 50 MB

### ⚠️ Catatan Penting
Kompresi true (re-encode images) TIDAK bisa dilakukan di browser dengan pdf-lib.  
Yang bisa dilakukan: hapus metadata + useObjectStreams.  
**JANGAN** over-promise di UI.

### Logic
```typescript
// lib/converters/pdf-compress.ts
import { PDFDocument } from 'pdf-lib'

export type CompressionLevel = 'light' | 'balanced' | 'strong'

export async function compressPDF(file: File, level: CompressionLevel): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

  // Remove all metadata
  pdf.setTitle('')
  pdf.setAuthor('')
  pdf.setSubject('')
  pdf.setKeywords([])
  pdf.setProducer('')
  pdf.setCreator('')

  return pdf.save({
    useObjectStreams: level !== 'light',
    addDefaultPage: false,
  })
}
```

### UI Copy yang Jujur
```
"Toolify removes metadata and optimizes PDF structure. 
For PDFs with embedded images, size reduction may be minimal.
Best results with text-heavy PDFs."
```

### UI Layout
```
[DropZone — single PDF]

original.pdf · 8.4 MB

Compression level:
○ Light (faster)    ● Balanced    ○ Strong

[Note disclaimer di atas]

[Compress PDF]

─── Output ────────────────────────────────────
✓ original-compressed.pdf
8.4 MB → 7.8 MB  (saved 7%)        [Download ↓]
```

---

## 4. Image to PDF

**Route:** `/tools/pdf/image-to-pdf`  
**Library:** `pdf-lib`  
**Constraints:** Multiple images, max 50 MB total, format JPG/PNG/WEBP/GIF

### Logic
```typescript
// lib/converters/image-to-pdf.ts
import { PDFDocument, PageSizes } from 'pdf-lib'

export interface ImageToPDFOptions {
  pageSize: 'A4' | 'Letter' | 'auto'
  orientation: 'portrait' | 'landscape'
  margin: number        // pixels
  fit: 'fit' | 'fill' | 'stretch'
}

async function convertToPNG(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url)
        if (!blob) return reject(new Error('Conversion failed'))
        resolve(blob.arrayBuffer())
      }, 'image/png')
    }
    img.onerror = reject
    img.src = url
  })
}

export async function imagesToPDF(files: File[], options: ImageToPDFOptions): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()

  const pageSizeMap = {
    A4: PageSizes.A4,
    Letter: PageSizes.Letter,
  }

  for (const file of files) {
    let imageBytes: ArrayBuffer
    let image

    if (file.type === 'image/jpeg') {
      imageBytes = await file.arrayBuffer()
      image = await pdf.embedJpg(imageBytes)
    } else {
      imageBytes = await convertToPNG(file)
      image = await pdf.embedPng(imageBytes)
    }

    let [pageWidth, pageHeight] = options.pageSize === 'auto'
      ? [image.width, image.height]
      : pageSizeMap[options.pageSize as 'A4' | 'Letter']

    if (options.orientation === 'landscape' && pageWidth < pageHeight) {
      ;[pageWidth, pageHeight] = [pageHeight, pageWidth]
    }

    const page = pdf.addPage([pageWidth, pageHeight])
    const usableW = pageWidth - options.margin * 2
    const usableH = pageHeight - options.margin * 2

    let drawW = usableW
    let drawH = usableH

    if (options.fit === 'fit') {
      const scaled = image.scaleToFit(usableW, usableH)
      drawW = scaled.width
      drawH = scaled.height
    } else if (options.fit === 'stretch') {
      drawW = usableW
      drawH = usableH
    }

    page.drawImage(image, {
      x: options.margin + (usableW - drawW) / 2,
      y: options.margin + (usableH - drawH) / 2,
      width: drawW,
      height: drawH,
    })
  }

  return pdf.save()
}
```

### UI Layout
```
[DropZone — JPG, PNG, WEBP, GIF — multiple]

Thumbnail grid (sortable):
┌──────┐ ┌──────┐ ┌──────┐
│ img1 │ │ img2 │ │ img3 │
└──────┘ └──────┘ └──────┘

Options:
Page size:   [A4 ▾]     Orientation: [Portrait ▾]
Margin:      [Normal ▾] Fit image:   ● Fit  ○ Fill  ○ Stretch

[Convert to PDF]

─── Output ──────────────────────────────────
✓ images.pdf · 3 pages · 2.8 MB    [Download ↓]
```

---

## Acceptance Criteria Phase 2A

Sebelum lanjut ke Phase 2B:

- [ ] PDF Merge: 2–20 files, drag reorder berfungsi, output bisa didownload dan dibuka dengan benar
- [ ] PDF Split: mode individual + range + every-n semuanya benar, ZIP download berfungsi
- [ ] PDF Compress: file diproses dan bisa didownload, UI tidak over-promise kompresi
- [ ] Image to PDF: JPG + PNG + WEBP semua berhasil dikonversi, page options berfungsi
- [ ] Semua tool: tidak ada network request selama processing (verifikasi via browser network tab)
- [ ] Test large file: 50 MB PDF merge selesai tanpa browser crash
- [ ] Semua tool: dark mode berfungsi
- [ ] Semua tool: `generateMetadata()` sudah ada
