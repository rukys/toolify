# ✅ Phase 3 — Finalisasi, SEO & Deployment

> **Baca dulu:** `00-CONTEXT.md` → `PROGRESS.md` → file ini  
> **Prerequisite:** Phase 0, Phase 1 (A+B+C), Phase 2 (A+B) selesai  
> **Goal:** Project production-ready, Lighthouse score optimal, deployed ke Vercel

---

## Checklist Phase 3

- [ ] SEO: `generateMetadata()` di semua tool pages
- [ ] `robots.txt`
- [ ] `sitemap.xml`
- [ ] `components/tool/related-tools.tsx`
- [ ] `hooks/use-tool-history.ts`
- [ ] `hooks/use-clipboard.ts`
- [ ] `hooks/use-file-processor.ts`
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO = 100
- [ ] Test mobile: 375px, 768px, 1280px
- [ ] Test large file
- [ ] Vercel deployment

---

## 1. SEO — generateMetadata()

Setiap tool page harus punya `generateMetadata()`. Pattern:

```typescript
// Contoh untuk PDF Merge: app/tools/pdf/merge/page.tsx
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'PDF Merge — Combine PDF Files Free Online | Toolify',
    description: 'Merge multiple PDF files into one in seconds. Free, no upload, works in your browser. No account required.',
    keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'pdf merger online free'],
    openGraph: {
      title: 'PDF Merge — Free Online Tool',
      description: 'Merge PDF files without uploading. Private, instant, free.',
      url: 'https://toolify.app/tools/pdf/merge',
      siteName: 'Toolify',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'PDF Merge — Free Online Tool | Toolify',
    },
  }
}
```

### Template Metadata per Tool

| Tool | Title | Description (max 155 chars) |
|---|---|---|
| JSON Formatter | JSON Formatter & Validator — Free Online \| Toolify | Format, validate, and minify JSON instantly. Free browser tool, no signup. |
| Base64 | Base64 Encode / Decode — Free Online \| Toolify | Encode or decode text and files to Base64. Works in browser, no data uploaded. |
| URL Encode | URL Encode / Decode — Free Online \| Toolify | Encode and decode URL strings instantly. Browser-based, no login required. |
| JWT Debugger | JWT Debugger — Decode JWT Tokens Free \| Toolify | Decode and inspect JWT tokens. View header, payload, and signature. Free, private. |
| Regex Tester | Regex Tester — Test Regex Online Free \| Toolify | Test and debug regular expressions with live match highlighting. Zero install. |
| Color Picker | Color Picker & Converter — Free Online \| Toolify | Convert colors between HEX, RGB, HSL, CMYK. Pick colors with live preview. |
| Timestamp | Timestamp Converter — Unix to Date Free \| Toolify | Convert Unix timestamps to human-readable dates. Supports ms and seconds. |
| Hash Generator | Hash Generator — MD5 SHA256 Free Online \| Toolify | Generate MD5, SHA-1, SHA-256, SHA-512 hashes from text or files. |
| QR Code | QR Code Generator — Free Online \| Toolify | Generate QR codes for URLs, text, email. Download as PNG or SVG. |
| Password | Password Generator — Strong Passwords Free \| Toolify | Generate secure random passwords instantly. No data sent to server. |
| UUID | UUID Generator — v4 v7 ULID Free \| Toolify | Generate UUID v4, v7, and ULID identifiers. Bulk generate up to 100. |
| Lorem Ipsum | Lorem Ipsum Generator — Free Online \| Toolify | Generate placeholder text by paragraphs, sentences, or words. |
| Word Counter | Word Counter — Characters & Reading Time \| Toolify | Count words, characters, sentences, and estimate reading time instantly. |
| Case Converter | Case Converter — Text Case Tool Free \| Toolify | Convert text to UPPERCASE, lowercase, camelCase, snake_case and more. |
| Markdown | Markdown Preview — Live Renderer Free \| Toolify | Write and preview Markdown with live rendering. Download as HTML. |
| Diff Checker | Diff Checker — Compare Text Free Online \| Toolify | Compare two texts and highlight differences. Word-level diff comparison. |
| PDF Merge | PDF Merge — Combine PDF Files Free Online \| Toolify | Merge multiple PDF files into one in seconds. No upload, 100% browser-based. |
| PDF Split | PDF Split — Extract PDF Pages Free \| Toolify | Split PDF into individual pages or page ranges. Download as ZIP. |
| PDF Compress | PDF Compress — Reduce PDF Size Free \| Toolify | Compress PDF files to reduce size. Removes metadata and optimizes structure. |
| Image to PDF | Image to PDF — Convert JPG PNG to PDF Free \| Toolify | Convert JPG, PNG, WEBP images to PDF. No upload required. |
| Image Compress | Image Compress — Reduce Image Size Free \| Toolify | Compress JPG, PNG, WEBP without losing quality. Multi-file ZIP download. |
| Image Resize | Image Resize — Resize Images Free Online \| Toolify | Resize images by dimensions, percentage, or social media presets. |
| Image Convert | Image Convert — JPG PNG WEBP GIF Free \| Toolify | Convert images between JPG, PNG, WEBP, GIF, and more. Instant download. |
| Image Crop | Image Crop — Crop Images Free Online \| Toolify | Crop images with free or locked aspect ratios. Download instantly. |

---

## 2. robots.txt

Buat `public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://toolify.app/sitemap.xml
```

---

## 3. sitemap.xml

Auto-generate dari `tools-registry.ts`.

Buat `app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next'
import { tools } from '@/lib/tools-registry'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://toolify.app'

  const toolUrls = tools.map(tool => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...toolUrls,
  ]
}
```

---

## 4. Related Tools Component

```typescript
// components/tool/related-tools.tsx
import { ToolMeta } from '@/types/tools'
import { ToolCard } from './tool-card'

interface RelatedToolsProps {
  tools: ToolMeta[]
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (!tools.length) return null
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
      </div>
    </section>
  )
}
```

---

## 5. Hooks

### `hooks/use-clipboard.ts`
```typescript
'use client'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export function useClipboard() {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }, [])

  return { copy, copied }
}
```

### `hooks/use-tool-history.ts`
```typescript
'use client'
import { useEffect, useState } from 'react'
import { ToolMeta } from '@/types/tools'

const HISTORY_KEY = 'toolify-recent'
const MAX_HISTORY = 5

export function useToolHistory() {
  const [recentIds, setRecentIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) setRecentIds(JSON.parse(stored))
    } catch {}
  }, [])

  const addToHistory = (toolId: string) => {
    setRecentIds(prev => {
      const updated = [toolId, ...prev.filter(id => id !== toolId)].slice(0, MAX_HISTORY)
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  return { recentIds, addToHistory }
}
```

---

## 6. QA Checklist

### Functionality
- [ ] Semua 24 tools berjalan tanpa error di Chrome, Firefox, Safari
- [ ] Tidak ada network request saat memproses file (buka DevTools → Network → filter XHR/Fetch saat processing)
- [ ] File yang dihasilkan bisa dibuka dengan aplikasi yang sesuai

### Large File Tests
- [ ] PDF Merge: 10 file masing-masing 5 MB → output benar, tidak crash
- [ ] Image Compress: file 15 MB → selesai diproses
- [ ] PDF Split: 100 halaman PDF → semua halaman tersplit benar

### Responsive
- [ ] 375px (mobile): semua tool usable, tidak ada overflow horizontal
- [ ] 768px (tablet): layout tablet benar
- [ ] 1280px (desktop): sidebar tampil, layout desktop benar

### Dark Mode
- [ ] Toggle dark mode di header
- [ ] Semua tool pages dark mode benar (tidak ada teks yang invisible)
- [ ] DropZone, output areas semua dark mode berfungsi

### Accessibility
- [ ] Semua interactive elements punya keyboard focus yang visible
- [ ] Semua tombol punya label yang jelas
- [ ] Images punya alt text yang tepat

---

## 7. Lighthouse Targets

```
Performance:    ≥ 90
Accessibility:  ≥ 95
Best Practices: ≥ 90
SEO:            100
```

### Tips Performance
- Gunakan `next/dynamic` untuk import library besar (pdf-lib, browser-image-compression) 
- Jangan import library Phase 2 di Phase 1 pages
- Aktifkan `useWebWorker: true` di browser-image-compression

```typescript
// Contoh dynamic import
const { PDFDocument } = await import('pdf-lib')
```

---

## 8. Deployment ke Vercel

```bash
# 1. Push ke GitHub
git init
git add .
git commit -m "feat: Toolify v1.0"
git remote add origin https://github.com/username/toolify.git
git push -u origin main

# 2. Import di Vercel
# Buka vercel.com → New Project → Import from GitHub → toolify
# Settings: Framework = Next.js (auto-detected)
# Environment Variables: tidak ada yang diperlukan

# 3. Custom domain (opsional)
# Settings → Domains → Add → toolify.app
```

### next.config.ts
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Untuk pdf-lib yang pakai canvas
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
}

export default nextConfig
```

---

## 9. Final Acceptance Criteria

### Phase 1 Done ✅
- [ ] 8 Developer Tools functional dan tested
- [ ] 4 Generator Tools functional dan tested
- [ ] 4 Text Tools functional dan tested
- [ ] DropZone: drag, click-to-browse, validation, error states semua berfungsi
- [ ] Setiap tool page punya `generateMetadata()` yang benar
- [ ] Dark mode berfungsi di semua halaman
- [ ] Mobile responsive di 375px, 768px, 1280px
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO = 100
- [ ] `tools-registry.ts` punya semua Phase 1 tools

### Phase 2 Done ✅
- [ ] PDF Merge: 20 files, urutan halaman benar, output downloadable
- [ ] PDF Split: 3 mode berfungsi, ZIP download berfungsi
- [ ] PDF Compress: size reduction jujur, tidak over-promise di UI
- [ ] Image to PDF: JPG, PNG, WEBP semua convert benar, page options berfungsi
- [ ] Image Compress: quality slider, format conversion, multi-file ZIP
- [ ] Image Resize: aspect ratio lock, presets, format output
- [ ] Image Convert: semua format pair yang disupport berfungsi
- [ ] Image Crop: free + ratio-locked cropping, output downloadable
- [ ] Semua Phase 2 tools: tidak ada file data keluar dari browser
- [ ] Large file test: 50 MB PDF merge selesai tanpa crash

---

## 🎉 Project Complete!

Setelah semua checklist di atas selesai, Toolify v1.0 siap production.

**Apa yang sudah dibuat:**
- 24 tools gratis, semua client-side
- Tidak ada server, tidak ada database, tidak ada auth
- Deploy ke Vercel free tier, zero biaya operasional
- SEO-optimized dengan metadata lengkap dan sitemap
