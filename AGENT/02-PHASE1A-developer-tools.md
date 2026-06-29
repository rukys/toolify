# 🛠️ Phase 1A — Developer Tools

> **Baca dulu:** `00-CONTEXT.md` → `PROGRESS.md` → file ini  
> **Prerequisite:** Phase 0 sudah selesai (shared components siap)  
> **Goal:** Semua 8 developer tools fungsional

---

## Checklist Phase 1A

- [ ] `app/tools/developer/page.tsx` (category page)
- [ ] JSON Formatter
- [ ] Base64 Encode/Decode
- [ ] URL Encode/Decode
- [ ] JWT Debugger
- [ ] Regex Tester
- [ ] Color Picker
- [ ] Timestamp Converter
- [ ] Hash Generator

---

## Route: `/tools/developer`

Category page yang menampilkan semua developer tools dalam grid.  
Pakai komponen `ToolGrid` dengan filter `category === 'developer'`.

---

## 1. JSON Formatter

**Route:** `/tools/developer/json`  
**Library:** Native `JSON.parse` / `JSON.stringify` (zero deps)

### Fitur
- Input: Textarea — paste raw JSON
- Options: Indent size (2 / 4 / tab), Sort keys toggle
- Output: Formatted JSON dengan syntax highlighting (`prism-react-renderer`)
- Actions: Format, Minify, Copy, Clear
- Error: Tampilkan parse error dengan line number

### UI Layout
```
[Textarea — paste JSON here]

Options:
  Indent: [2 ▾]  [Sort keys □]

[Format]  [Minify]  [Clear]

─── Output ───────────────────────────
[OutputArea mode="text" — dengan syntax highlight]
```

### Logic
```typescript
// lib/utils/json-formatter.ts
export function formatJSON(raw: string, indent: number | '\t', sortKeys: boolean): string {
  const parsed = JSON.parse(raw) // throws jika invalid
  if (sortKeys) {
    return JSON.stringify(sortObjectKeys(parsed), null, indent)
  }
  return JSON.stringify(parsed, null, indent)
}

function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys)
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((acc, key) => {
      acc[key] = sortObjectKeys(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}
```

### Error Handling
```typescript
try {
  const result = formatJSON(input, indent, sortKeys)
  setOutput(result)
} catch (e) {
  if (e instanceof SyntaxError) {
    setError(`Parse error: ${e.message}`)
  }
}
```

---

## 2. Base64 Encode/Decode

**Route:** `/tools/developer/base64`  
**Library:** `btoa()` / `atob()` untuk text; `FileReader.readAsDataURL` untuk file

### Fitur
- Mode toggle: **Encode** | **Decode** (text mode) + **File to Base64** (file mode)
- Text mode: Textarea input → output
- File mode: DropZone (any file, max 10 MB) → base64 string output

### Logic
```typescript
// Text encode
function encodeText(text: string): string {
  return btoa(unescape(encodeURIComponent(text)))
}

// Text decode
function decodeText(b64: string): string {
  return decodeURIComponent(escape(atob(b64)))
}

// File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // strip data:...;base64, prefix
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

---

## 3. URL Encode/Decode

**Route:** `/tools/developer/url`  
**Library:** `encodeURIComponent` / `decodeURIComponent` (zero deps)

### Fitur
- Input: Textarea
- Mode toggle: Encode | Decode
- Output: Result text + Copy
- Live update saat mode berubah

### Logic
```typescript
function encodeURL(input: string): string {
  return encodeURIComponent(input)
}

function decodeURL(input: string): string {
  try {
    return decodeURIComponent(input)
  } catch {
    throw new Error('Invalid URL-encoded string')
  }
}
```

---

## 4. JWT Debugger

**Route:** `/tools/developer/jwt`  
**Library:** Manual base64url decode (zero deps)

### Fitur
- Input: Paste JWT string
- Output: Tiga panel:
  - **Header** (JSON formatted)
  - **Payload** (JSON formatted, tampilkan exp sebagai human date)
  - **Signature** (algorithm info + disclaimer)
- Signature panel: tampilkan algoritma, note bahwa tidak bisa verify tanpa secret

### Logic
```typescript
function decodeJWT(token: string): { header: object; payload: object; signature: string } {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT format')

  function base64urlDecode(str: string): string {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
    return atob(padded)
  }

  const header = JSON.parse(base64urlDecode(parts[0]))
  const payload = JSON.parse(base64urlDecode(parts[1]))

  return { header, payload, signature: parts[2] }
}
```

### Catatan UI
- Jika payload ada field `exp` atau `iat`, tampilkan juga sebagai human-readable date
- Signature panel harus punya copy button untuk raw signature

---

## 5. Regex Tester

**Route:** `/tools/developer/regex`  
**Library:** Native `RegExp` (zero deps)

### Fitur
- Input: Pattern field + Flag checkboxes (g, i, m, s, u)
- Test string: Large textarea
- Output: Match highlights + match list + groups
- **Live** — update setiap keystroke dengan 300ms debounce

### Logic
```typescript
function testRegex(pattern: string, flags: string, testString: string) {
  const regex = new RegExp(pattern, flags)
  const matches: Array<{ match: string; index: number; groups: string[] }> = []
  
  if (flags.includes('g')) {
    let m
    while ((m = regex.exec(testString)) !== null) {
      matches.push({
        match: m[0],
        index: m.index,
        groups: m.slice(1),
      })
    }
  } else {
    const m = regex.exec(testString)
    if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) })
  }

  return matches
}
```

### UI untuk highlight
Gunakan array dari match positions untuk render spans dengan `bg-yellow-200` di test string.

---

## 6. Color Picker

**Route:** `/tools/developer/color`  
**Library:** Zero deps (pure color math)

### Fitur
- Input: `<input type="color">` + manual HEX/RGB/HSL input
- Output: HEX, RGB, HSL, CMYK, CSS variable — masing-masing punya Copy button
- Extras: Tint/shade scale (10 stops), contrast ratio against white/black

### Logic
```typescript
// lib/utils/color.ts

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) throw new Error('Invalid hex')
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function rgbToCmyk(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const k = 1 - Math.max(r, g, b)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  return {
    c: Math.round((1 - r - k) / (1 - k) * 100),
    m: Math.round((1 - g - k) / (1 - k) * 100),
    y: Math.round((1 - b - k) / (1 - k) * 100),
    k: Math.round(k * 100),
  }
}

export function getContrastRatio(hex: string): { white: number; black: number } {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (c: number) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const L = 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b)
  return {
    white: Math.round(((1 + 0.05) / (L + 0.05)) * 100) / 100,
    black: Math.round(((L + 0.05) / (0 + 0.05)) * 100) / 100,
  }
}
```

---

## 7. Timestamp Converter

**Route:** `/tools/developer/timestamp`  
**Library:** Native `Date` (zero deps)

### Fitur
- Input: Unix timestamp (ms atau s) ATAU date-time picker
- Output: UTC, Local time, ISO 8601, Relative ("3 hours ago")
- **Live** — auto-update current timestamp setiap 1 detik
- Auto-detect apakah input adalah ms atau s (jika > 1e10 anggap ms)

### Logic
```typescript
function convertTimestamp(input: number): {
  utc: string
  local: string
  iso: string
  relative: string
} {
  // Auto-detect ms vs s
  const ms = input > 1e10 ? input : input * 1000
  const date = new Date(ms)

  return {
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    iso: date.toISOString(),
    relative: getRelativeTime(date),
  }
}

function getRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const abs = Math.abs(diff)
  const past = diff > 0

  if (abs < 60000) return 'just now'
  if (abs < 3600000) return `${Math.floor(abs / 60000)} minutes ${past ? 'ago' : 'from now'}`
  if (abs < 86400000) return `${Math.floor(abs / 3600000)} hours ${past ? 'ago' : 'from now'}`
  return `${Math.floor(abs / 86400000)} days ${past ? 'ago' : 'from now'}`
}
```

---

## 8. Hash Generator

**Route:** `/tools/developer/hash`  
**Library:** `@noble/hashes` (pure JS)

### Fitur
- Input: Text atau file
- Output: MD5, SHA-1, SHA-256, SHA-512 — semua ditampilkan bersamaan
- Setiap hash punya Copy button

### Logic
```typescript
import { sha256, sha512 } from '@noble/hashes/sha2'
import { sha1 } from '@noble/hashes/sha1'
import { md5 } from '@noble/hashes/md5'
import { bytesToHex } from '@noble/hashes/utils'

function hashText(text: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  return {
    md5: bytesToHex(md5(data)),
    sha1: bytesToHex(sha1(data)),
    sha256: bytesToHex(sha256(data)),
    sha512: bytesToHex(sha512(data)),
  }
}

async function hashFile(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const data = new Uint8Array(arrayBuffer)
  return {
    md5: bytesToHex(md5(data)),
    sha1: bytesToHex(sha1(data)),
    sha256: bytesToHex(sha256(data)),
    sha512: bytesToHex(sha512(data)),
  }
}
```

---

## Acceptance Criteria Phase 1A

Sebelum lanjut ke Phase 1B:

- [ ] Semua 8 tool pages bisa diakses tanpa error
- [ ] JSON Formatter: format + minify + error handling berfungsi
- [ ] Base64: encode + decode text berfungsi, file mode berfungsi
- [ ] URL: encode + decode berfungsi
- [ ] JWT: decode valid JWT menampilkan 3 panel dengan benar
- [ ] Regex: live highlighting berfungsi, flags bekerja
- [ ] Color: HEX input update semua output format serentak
- [ ] Timestamp: current time auto-update setiap detik
- [ ] Hash: text input menghasilkan 4 hash bersamaan
- [ ] Semua tool: dark mode berfungsi
- [ ] Semua tool: `generateMetadata()` sudah ada
