# ✍️ Phase 1C — Text Tools

> **Baca dulu:** `00-CONTEXT.md` → `PROGRESS.md` → file ini  
> **Prerequisite:** Phase 0, 1A, 1B selesai  
> **Goal:** 4 text tools fungsional

---

## Checklist Phase 1C

- [ ] `app/tools/text/page.tsx` (category page)
- [ ] Word Counter
- [ ] Case Converter
- [ ] Markdown Preview
- [ ] Diff Checker

---

## Route: `/tools/text`

Category page — tampilkan semua text tools dalam grid.  
Filter `tools-registry.ts` dengan `category === 'text'`.

---

## 1. Word Counter

**Route:** `/tools/text/word-counter`  
**Library:** Zero deps

### Fitur
- Input: Large textarea
- Live stats update setiap keystroke:
  - Words
  - Characters (dengan spasi)
  - Characters (tanpa spasi)
  - Sentences
  - Paragraphs
  - Reading time (asumsi 200 wpm)
  - Speaking time (asumsi 130 wpm)

### Logic
```typescript
// lib/utils/text-stats.ts

export interface TextStats {
  words: number
  characters: number
  charactersNoSpaces: number
  sentences: number
  paragraphs: number
  readingTime: string   // "2 min read"
  speakingTime: string  // "3 min speak"
}

export function analyzeText(text: string): TextStats {
  if (!text.trim()) return {
    words: 0, characters: 0, charactersNoSpaces: 0,
    sentences: 0, paragraphs: 0, readingTime: '0 min', speakingTime: '0 min',
  }

  const words = text.trim().split(/\s+/).filter(Boolean).length
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim()).length

  const readingMins = Math.ceil(words / 200)
  const speakingMins = Math.ceil(words / 130)

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTime: readingMins < 1 ? '< 1 min read' : `${readingMins} min read`,
    speakingTime: speakingMins < 1 ? '< 1 min speak' : `${speakingMins} min speak`,
  }
}
```

### UI Layout
```
[Textarea — type or paste your text here]

─── Stats ───────────────────────────────────────
┌──────────┬──────────┬──────────┬──────────┐
│  Words   │  Chars   │ No Space │ Sentences│
│   342    │  1,847   │  1,523   │    24    │
└──────────┴──────────┴──────────┴──────────┘
┌──────────────────┬──────────────────┐
│  Paragraphs: 6   │ Reading: 2 min   │
│  Speaking: 3 min │                  │
└──────────────────┴──────────────────┘
```

---

## 2. Case Converter

**Route:** `/tools/text/case-converter`  
**Library:** Zero deps

### Fitur
- Input: Textarea
- Setiap tombol konversi otomatis copy ke clipboard
- Konversi: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case

### Logic
```typescript
// lib/utils/string.ts

export function toUpperCase(text: string): string {
  return text.toUpperCase()
}

export function toLowerCase(text: string): string {
  return text.toLowerCase()
}

export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
}

export function toSentenceCase(text: string): string {
  return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase())
}

export function toCamelCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

export function toPascalCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

export function toSnakeCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .join('_')
    .toLowerCase()
}

export function toKebabCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .join('-')
    .toLowerCase()
}
```

### UI Layout
```
[Textarea — paste your text here]

─── Convert & Copy ──────────────────────────────
[UPPERCASE]     [lowercase]     [Title Case]
[Sentence case] [camelCase]     [PascalCase]
[snake_case]    [kebab-case]

─── Result ──────────────────────────────────────
[Result text preview]            [Copy again]

✓ Copied: UPPERCASE
```

### Behavior
- Klik tombol → convert text → copy ke clipboard → tampilkan toast "Copied: UPPERCASE"
- Juga tampilkan hasil di area preview di bawah

---

## 3. Markdown Preview

**Route:** `/tools/text/markdown`  
**Library:** `marked` + `dompurify`

### Fitur
- Layout: Split pane — kiri input editor, kanan rendered preview
- Sync scroll antara kedua pane
- Extras: Word count, Copy HTML button, Download .html
- Mobile: tab antara Editor dan Preview

### Logic
```typescript
import { marked } from 'marked'
import DOMPurify from 'dompurify'

function renderMarkdown(markdown: string): string {
  const rawHTML = marked(markdown) as string
  return DOMPurify.sanitize(rawHTML)
}
```

### Starter Content
Isi default textarea dengan markdown demo agar user langsung melihat preview berfungsi.

### UI Layout
```
[Word Count: 142]     [Copy HTML]  [Download .html]

┌─────────────────────┬─────────────────────┐
│ # Markdown Input    │  Preview             │
│                     │                      │
│ ## Heading          │  Heading             │
│ **bold** text       │  ─────              │
│ - item 1            │  bold text           │
│ - item 2            │  • item 1            │
│                     │  • item 2            │
└─────────────────────┴─────────────────────┘
```

### Download .html Logic
```typescript
function downloadHTML(markdown: string, htmlContent: string) {
  const fullHTML = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Document</title></head>
<body>${htmlContent}</body>
</html>`
  
  const blob = new Blob([fullHTML], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'document.html'
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## 4. Diff Checker

**Route:** `/tools/text/diff`  
**Library:** `diff` npm package

### Fitur
- Layout: Dua textarea side by side
- Output: Inline diff highlighted di bawah
- Warna: merah = dihapus, hijau = ditambah, abu = sama

### Logic
```typescript
import * as Diff from 'diff'

function computeDiff(original: string, modified: string) {
  return Diff.diffWords(original, modified)
}

// Hasil: array of { value: string, added?: boolean, removed?: boolean }
```

### UI Layout
```
┌────────────────────────┬────────────────────────┐
│ Original               │ Modified               │
│                        │                        │
│ [Textarea]             │ [Textarea]             │
└────────────────────────┴────────────────────────┘

[Compare]

─── Diff Result ─────────────────────────────────
The quick [~~brown~~] [**red**] fox jumped over 
the [~~lazy~~] [**sleeping**] dog.

Legend: [~~removed~~]  [**added**]
```

### Render Diff
```typescript
// Map diff result ke colored spans
function renderDiff(parts: Diff.Change[]): JSX.Element[] {
  return parts.map((part, i) => {
    if (part.added) return <span key={i} className="bg-green-100 text-green-800">{part.value}</span>
    if (part.removed) return <span key={i} className="bg-red-100 text-red-800 line-through">{part.value}</span>
    return <span key={i}>{part.value}</span>
  })
}
```

---

## Acceptance Criteria Phase 1C

Sebelum lanjut ke Phase 2A:

- [ ] Word Counter: semua 7 stats akurat, live update tanpa lag
- [ ] Case Converter: semua 8 case conversion benar, copy ke clipboard berfungsi
- [ ] Markdown Preview: render benar, XSS tidak bisa masuk (dompurify), download .html berfungsi
- [ ] Diff Checker: perbedaan kata highlight dengan warna yang tepat
- [ ] Semua tool: dark mode berfungsi
- [ ] Semua tool: `generateMetadata()` sudah ada

---

## ✅ Setelah Phase 1C Selesai

**Phase 1 complete!** Semua 16 tools berikut sudah jadi:
- 8 Developer Tools
- 4 Generator Tools  
- 4 Text Tools

Lanjut ke `05-PHASE2A-pdf-tools.md`.
