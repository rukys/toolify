# 🧠 TOOLIFY — AI AGENT CONTEXT (Baca ini dulu sebelum ngoding)

> Ini adalah **sumber kebenaran tunggal** untuk project Toolify.  
> Setiap kali session baru atau kena limit, baca file ini + file phase yang sedang dikerjakan.

---

## Apa itu Toolify?

Toolify adalah free browser-based utility toolkit. Semua tool berjalan **100% di browser user** — tidak ada upload ke server, tidak perlu login, tidak ada batas pemakaian.

**Value proposition:** Alternatif gratis dari ilovepdf.com / smallpdf.com yang tidak ada paywallnya.

---

## Tech Stack

```
Framework:     Next.js 14 (App Router)
Language:      TypeScript
Styling:       Tailwind CSS + shadcn/ui
Deploy:        Vercel (free tier)
Processing:    Client-side only (no server)
```

---

## Struktur Folder

```
toolify/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Homepage
│   ├── globals.css                   # CSS variables
│   └── tools/
│       ├── layout.tsx
│       ├── page.tsx                  # /tools — all tools searchable
│       ├── pdf/                      # Phase 2
│       ├── image/                    # Phase 2
│       ├── generator/                # Phase 1
│       ├── text/                     # Phase 1
│       └── developer/                # Phase 1
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── sidebar.tsx
│   ├── tool/
│   │   ├── tool-layout.tsx           # Wrapper untuk semua tool page
│   │   ├── tool-card.tsx
│   │   ├── tool-grid.tsx
│   │   ├── drop-zone.tsx             # Reusable drag-drop
│   │   ├── processing-button.tsx     # idle/processing/done/error
│   │   ├── output-area.tsx           # download atau text output
│   │   ├── sortable-file-list.tsx    # Untuk multi-file tools
│   │   └── related-tools.tsx
│   └── ui/                           # shadcn/ui (auto-generated)
├── lib/
│   ├── tools-registry.ts             # ← SOURCE OF TRUTH semua tools
│   ├── converters/                   # Phase 2 logic
│   ├── generators/                   # Phase 1 logic
│   └── utils/
│       ├── file.ts                   # formatBytes, getMimeType, downloadBlob
│       ├── color.ts
│       └── string.ts
├── hooks/
│   ├── use-file-processor.ts
│   ├── use-clipboard.ts
│   └── use-tool-history.ts
└── types/
    └── tools.ts                      # ToolMeta, ToolCategory, ProcessingStatus
```

---

## Design System (Jangan pake nilai hardcode, pakai CSS variable)

### Color Variables
```css
/* globals.css — sudah didefinisikan */
--color-primary: #2563EB
--color-primary-dark: #1D4ED8
--color-primary-light: #EFF6FF
--color-accent: #0EA5E9
--color-surface: #FFFFFF
--color-surface-alt: #F8FAFC
--color-border: #E2E8F0
--color-text-primary: #0F172A
--color-text-secondary: #475569
--color-text-muted: #94A3B8
--color-success: #16A34A
--color-warning: #D97706
--color-danger: #DC2626
```

### Typography
```
Font display/body: Inter (variable)
Font mono:         JetBrains Mono  ← untuk output code/JSON/hash
```

### Layout Rules
```
Container:     max-w-6xl mx-auto px-4
Tool page:     max-w-3xl (fokus ke tool)
Card padding:  p-6
Form gap:      gap-4
```

### Icons
Pakai **Lucide React** saja (sudah bundled dengan shadcn/ui).

---

## Types Penting

```typescript
// types/tools.ts
export type ToolCategory = 'pdf' | 'image' | 'generator' | 'text' | 'developer'

export interface ToolMeta {
  id: string                  // 'pdf-merge'
  name: string                // 'PDF Merge'
  description: string         // max 60 chars
  category: ToolCategory
  href: string                // '/tools/pdf/merge'
  icon: string                // Lucide icon name as string
  tags: string[]
  isNew?: boolean
  phase: 1 | 2 | 3
  processingLocation: 'client' | 'server'
  acceptedFormats?: string[]
  maxFileSizeMB?: number
}

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error'
```

---

## Shared Components — Interface Contract

### DropZone
```typescript
interface DropZoneProps {
  accept: string[]           // ['application/pdf', 'image/jpeg']
  maxSizeMB: number
  multiple?: boolean
  onFilesAccepted: (files: File[]) => void
  onError: (msg: string) => void
}
```

### ToolLayout
```typescript
interface ToolLayoutProps {
  tool: ToolMeta
  children: React.ReactNode
  relatedTools?: ToolMeta[]
}
```

### ProcessingButton
- States: `idle` → `processing` → `done` (auto-reset 3s) / `error`
- Disabled saat `processing`

### OutputArea
- Mode `'download'`: tampilkan filename + size stats + tombol Download
- Mode `'text'`: tampilkan scrollable pre/code + tombol Copy

---

## Prinsip Utama (JANGAN dilanggar)

1. **Zero server** — semua processing harus client-side
2. **Tidak ada login/paywall** — tidak boleh ada auth sama sekali di Phase 1 & 2
3. **Privacy by default** — files tidak boleh keluar dari browser
4. **One tool, one job** — setiap halaman hanya melakukan satu fungsi
5. **Dark mode** — harus berfungsi di semua halaman
6. **Mobile responsive** — test di 375px, 768px, 1280px

---

## SEO Pattern (tiap tool page)

```typescript
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '[Tool Name] — [Action] Free Online | Toolify',
    description: '[Apa yang dilakukan] [Format yang didukung] Free, no upload, works in your browser.',
    keywords: [...],
    openGraph: { ... }
  }
}
```

---

## Dependencies yang Dipakai

```
Phase 1:
  uuid, qrcode, marked, dompurify, diff, @noble/hashes, prism-react-renderer

Phase 2 (tambahan):
  pdf-lib, jszip, browser-image-compression, react-image-crop

UI:
  lucide-react, @dnd-kit/core, react-dropzone, sonner, clsx, tailwind-merge
```

---

## Route Map Lengkap

```
/                           Homepage
/tools                      All tools (searchable)
/tools/pdf                  PDF category         [Phase 2]
/tools/pdf/merge            PDF Merge            [Phase 2]
/tools/pdf/split            PDF Split            [Phase 2]
/tools/pdf/compress         PDF Compress         [Phase 2]
/tools/pdf/image-to-pdf     Image to PDF         [Phase 2]
/tools/image                Image category       [Phase 2]
/tools/image/compress       Image Compress       [Phase 2]
/tools/image/resize         Image Resize         [Phase 2]
/tools/image/convert        Image Convert        [Phase 2]
/tools/image/crop           Image Crop           [Phase 2]
/tools/generator            Generator category   [Phase 1]
/tools/generator/qr-code    QR Code Generator    [Phase 1]
/tools/generator/password   Password Generator   [Phase 1]
/tools/generator/uuid       UUID Generator       [Phase 1]
/tools/generator/lorem      Lorem Ipsum          [Phase 1]
/tools/text                 Text category        [Phase 1]
/tools/text/word-counter    Word Counter         [Phase 1]
/tools/text/case-converter  Case Converter       [Phase 1]
/tools/text/markdown        Markdown Preview     [Phase 1]
/tools/text/diff            Diff Checker         [Phase 1]
/tools/developer            Developer category   [Phase 1]
/tools/developer/json       JSON Formatter       [Phase 1]
/tools/developer/base64     Base64 Encode/Decode [Phase 1]
/tools/developer/url        URL Encode/Decode    [Phase 1]
/tools/developer/jwt        JWT Debugger         [Phase 1]
/tools/developer/regex      Regex Tester         [Phase 1]
/tools/developer/color      Color Picker         [Phase 1]
/tools/developer/timestamp  Timestamp Converter  [Phase 1]
/tools/developer/hash       Hash Generator       [Phase 1]
```

---

## Out of Scope (JANGAN dibuat di Phase 1 & 2)

- Word → PDF (butuh server)
- PDF → Word (butuh server)
- Background removal (WASM terlalu besar)
- OCR / Tesseract
- Video compress/convert
- User accounts / auth
- File history
- API access

---

## 📍 Status Progress

Lihat file `PROGRESS.md` untuk track apa yang sudah selesai.
