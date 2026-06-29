# 🖼️ Phase 2B — Image Tools

> **Baca dulu:** `00-CONTEXT.md` → `PROGRESS.md` → file ini  
> **Prerequisite:** Phase 0, Phase 1 (semua), Phase 2A selesai  
> **Goal:** 4 image tools fungsional, semua client-side

---

## Checklist Phase 2B

- [ ] Install dependencies image
- [ ] `app/tools/image/page.tsx` (category page)
- [ ] `lib/converters/image-compress.ts` + halaman Image Compress
- [ ] `lib/converters/image-resize.ts` + halaman Image Resize
- [ ] `lib/converters/image-convert.ts` + halaman Image Convert
- [ ] `lib/converters/image-crop.ts` + halaman Image Crop

---

## Step 1 — Install Dependencies

```bash
npm install browser-image-compression react-image-crop
npm install -D @types/react-image-crop
```

---

## Route: `/tools/image`

Category page — tampilkan 4 image tools dalam grid.

---

## 1. Image Compress

**Route:** `/tools/image/compress`  
**Library:** `browser-image-compression`  
**Constraints:** JPG, PNG, WEBP. Max 50 MB. Multiple files (ZIP output).

### Logic
```typescript
// lib/converters/image-compress.ts
import imageCompression from 'browser-image-compression'

export interface CompressOptions {
  quality: number       // 1-100
  outputFormat?: string // 'image/jpeg' | 'image/webp' | 'image/png' | same as input
  onProgress?: (progress: number) => void
}

export async function compressImage(file: File, options: CompressOptions): Promise<File> {
  const targetFormat = options.outputFormat === 'same' ? file.type : (options.outputFormat ?? file.type)

  return imageCompression(file, {
    maxSizeMB: options.quality < 50 ? 0.3 : options.quality < 80 ? 1 : 2,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
    initialQuality: options.quality / 100,
    fileType: targetFormat,
    onProgress: options.onProgress,
  })
}

export function estimateOutputSize(fileSize: number, quality: number): string {
  const ratio = quality < 50 ? 0.15 : quality < 80 ? 0.35 : 0.65
  const estBytes = fileSize * ratio
  if (estBytes < 1024 * 1024) return `~${(estBytes / 1024).toFixed(0)} KB`
  return `~${(estBytes / 1024 / 1024).toFixed(1)} MB`
}
```

### Multiple File + ZIP
```typescript
import JSZip from 'jszip'

async function compressMultipleImages(files: File[], options: CompressOptions): Promise<Blob> {
  const zip = new JSZip()
  for (const file of files) {
    const compressed = await compressImage(file, options)
    zip.file(`compressed-${file.name}`, compressed)
  }
  return zip.generateAsync({ type: 'blob' })
}
```

### UI Layout
```
[DropZone — JPG, PNG, WEBP — multiple]

photo.jpg · 4.2 MB

Quality:   [━━━━━━━━━━━━━━━━●──] 80%
           Estimated output: ~1.1 MB (73% reduction)

Output format:
● Same as input    ○ JPG    ○ WEBP    ○ PNG

[Compress Image]

─── Output ──────────────────────────────────────────
photo.jpg  4.2 MB → 1.1 MB  (74% smaller)  [Download ↓]
[Download all as .zip]  (jika multiple)
```

---

## 2. Image Resize

**Route:** `/tools/image/resize`  
**Library:** Canvas API (zero deps)  
**Constraints:** Single image, JPG/PNG/WEBP, max 50 MB

### Logic
```typescript
// lib/converters/image-resize.ts

export interface ResizeOptions {
  width: number
  height: number
  format?: string    // default: same as input
  quality?: number   // default: 0.95
}

export async function resizeImage(file: File, options: ResizeOptions): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = options.width
      canvas.height = options.height
      
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, options.width, options.height)
      
      URL.revokeObjectURL(url)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Resize failed')),
        options.format ?? file.type,
        options.quality ?? 0.95
      )
    }
    
    img.onerror = reject
    img.src = url
  })
}

// Get image dimensions
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = reject
    img.src = url
  })
}
```

### Aspect Ratio Lock
```typescript
function maintainAspectRatio(
  newWidth: number,
  originalWidth: number,
  originalHeight: number
): number {
  return Math.round((newWidth / originalWidth) * originalHeight)
}
```

### Presets
```typescript
export const RESIZE_PRESETS = [
  { label: 'HD', width: 1280, height: 720 },
  { label: 'Full HD', width: 1920, height: 1080 },
  { label: '4K', width: 3840, height: 2160 },
  { label: 'Instagram Square', width: 1080, height: 1080 },
  { label: 'Twitter Header', width: 1500, height: 500 },
  { label: 'LinkedIn Banner', width: 1584, height: 396 },
]
```

### UI Layout
```
[DropZone — single image]

Original: 4032 × 3024 px · 4.2 MB

Resize by:
● Dimensions    ○ Percentage    ○ Preset sizes

Width:  [1920    ] px
Height: [1440    ] px
        🔒 Locked aspect ratio

Presets: [HD] [Full HD] [4K] [Instagram Square] [Twitter Header] [LinkedIn Banner]

Output format: [Same as input ▾]

[Resize Image]

─── Output ────────────────────────────────
photo-resized.jpg · 1920×1440px · 850 KB  [Download ↓]
```

---

## 3. Image Convert

**Route:** `/tools/image/convert`  
**Library:** Canvas API (zero deps)  
**Constraints:** Single image, max 50 MB

### Supported Conversions
```
JPG  → PNG, WEBP, GIF, BMP, ICO
PNG  → JPG, WEBP, GIF, BMP, ICO
WEBP → JPG, PNG
GIF  → JPG, PNG, WEBP
```

### Logic
```typescript
// lib/converters/image-convert.ts

export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/bmp'

export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      const ctx = canvas.getContext('2d')!

      // Untuk JPG: fill background putih (transparan jadi hitam di JPG)
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Conversion failed')),
        targetFormat,
        targetFormat === 'image/png' ? undefined : quality
      )
    }

    img.onerror = reject
    img.src = url
  })
}

export function getOutputFilename(originalName: string, targetFormat: ImageFormat): string {
  const ext = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
  }[targetFormat]
  return originalName.replace(/\.[^.]+$/, `.${ext}`)
}
```

### UI Layout
```
[DropZone — JPG, PNG, WEBP, GIF]

logo.png · PNG · 800 × 600 px · 120 KB

Convert to: [WEBP ▾]
Quality (JPG/WEBP): [━━━━━━━━━━●────] 85%

[Convert Image]

─── Output ────────────────────────────────
logo.webp · 800×600px · 68 KB  [Download ↓]
```

---

## 4. Image Crop

**Route:** `/tools/image/crop`  
**Library:** `react-image-crop`  
**Constraints:** Single image, JPG/PNG/WEBP, max 50 MB

### Logic
```typescript
// lib/converters/image-crop.ts

export interface CropArea {
  x: number      // pixels dari kiri
  y: number      // pixels dari atas
  width: number
  height: number
}

export async function cropImage(file: File, crop: CropArea): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = crop.width
      canvas.height = crop.height

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(
        img,
        crop.x, crop.y, crop.width, crop.height,  // source rect
        0, 0, crop.width, crop.height              // dest rect
      )

      URL.revokeObjectURL(url)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Crop failed')),
        file.type,
        0.95
      )
    }

    img.onerror = reject
    img.src = url
  })
}
```

### React Crop Integration
```typescript
'use client'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { useState, useRef } from 'react'

// Dalam component:
const [crop, setCrop] = useState<Crop>()
const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
const imgRef = useRef<HTMLImageElement>(null)

// Setelah crop selesai:
const handleCrop = async () => {
  if (!completedCrop || !imgRef.current) return
  const blob = await cropImage(file, completedCrop)
  // set output
}
```

### Aspect Ratio Options
```typescript
const ASPECT_RATIOS = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4/3 },
  { label: '16:9', value: 16/9 },
  { label: '3:4', value: 3/4 },
]
```

### UI Layout
```
[DropZone — single image]

[Crop preview dengan draggable crop box via react-image-crop]

Aspect ratio:   [Free ▾]  atau  [1:1] [4:3] [16:9] [3:4]
Crop area:      X: 120    Y: 80    W: 640   H: 480

[Crop Image]

─── Output ────────────────────────────────
photo-cropped.jpg · 640×480px   [Download ↓]
```

---

## Acceptance Criteria Phase 2B

Sebelum lanjut ke Phase 3:

- [ ] Image Compress: quality slider berfungsi, format conversion berfungsi, ZIP untuk multiple files
- [ ] Image Resize: aspect ratio lock berfungsi, presets apply ke W/H, format output berfungsi
- [ ] Image Convert: JPG→PNG, PNG→WEBP, WEBP→JPG, GIF→PNG semua berfungsi; background putih untuk JPG output
- [ ] Image Crop: drag crop box berfungsi, aspect ratio lock berfungsi, output bisa didownload
- [ ] Semua tool: file tidak keluar dari browser (verifikasi via network tab)
- [ ] Semua tool: dark mode berfungsi
- [ ] Semua tool: `generateMetadata()` sudah ada

---

## ✅ Setelah Phase 2B Selesai

**Phase 2 complete!** Semua 8 image/PDF tools sudah jadi.

Total tools tersedia: **24 tools** (16 Phase 1 + 8 Phase 2).

Lanjut ke `07-PHASE3-finalisasi.md` untuk SEO, testing, dan deployment.
