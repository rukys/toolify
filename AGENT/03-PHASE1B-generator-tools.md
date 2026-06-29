# 🎲 Phase 1B — Generator Tools

> **Baca dulu:** `00-CONTEXT.md` → `PROGRESS.md` → file ini  
> **Prerequisite:** Phase 0 selesai, Phase 1A selesai  
> **Goal:** 4 generator tools fungsional

---

## Checklist Phase 1B

- [ ] `app/tools/generator/page.tsx` (category page)
- [ ] QR Code Generator
- [ ] Password Generator
- [ ] UUID Generator
- [ ] Lorem Ipsum Generator

---

## Route: `/tools/generator`

Category page — tampilkan semua generator tools dalam grid.  
Filter `tools-registry.ts` dengan `category === 'generator'`.

---

## 1. QR Code Generator

**Route:** `/tools/generator/qr-code`  
**Library:** `qrcode` npm package

### Fitur
- Input: Text / URL / Email / Phone — tabbed
- Options: Size (128–1024px), Error correction (L/M/Q/H), Foreground color, Background color
- Output: Preview + Download sebagai PNG atau SVG
- Live preview update saat input berubah

### Logic
```typescript
import QRCode from 'qrcode'

// Generate PNG (untuk download)
async function generateQRPNG(text: string, options: QROptions): Promise<string> {
  return QRCode.toDataURL(text, {
    width: options.size,
    errorCorrectionLevel: options.errorCorrection,
    color: {
      dark: options.foreground,
      light: options.background,
    },
  })
}

// Generate SVG string
async function generateQRSVG(text: string, options: QROptions): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: options.errorCorrection,
    color: {
      dark: options.foreground,
      light: options.background,
    },
  })
}
```

### UI Layout
```
Tabs: [URL] [Text] [Email] [Phone]

Input: [https://example.com            ]

Options:
  Size:             [512px  ━━━━━●────────] 
  Error correction: [M ▾]
  Foreground:       [🎨 #000000]
  Background:       [🎨 #FFFFFF]

[QR Preview — live]

[Download PNG]  [Download SVG]
```

### Download Logic
```typescript
// PNG download
function downloadPNG(dataUrl: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = 'qrcode.png'
  a.click()
}

// SVG download
function downloadSVG(svgString: string) {
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'qrcode.svg'
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## 2. Password Generator

**Route:** `/tools/generator/password`  
**Library:** `crypto.getRandomValues()` (zero deps, browser built-in)

### Fitur
- Options: Length (8–128), Include uppercase/lowercase/numbers/symbols, Exclude ambiguous chars
- Output: Generated password + strength meter + Copy button
- Extras: "Generate 10 at once" mode

### Character Sets
```typescript
const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: 'Il1O0', // karakter yang mirip, akan di-exclude
}
```

### Logic
```typescript
interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

function generatePassword(options: PasswordOptions): string {
  let charset = ''
  if (options.uppercase) charset += CHARS.uppercase
  if (options.lowercase) charset += CHARS.lowercase
  if (options.numbers) charset += CHARS.numbers
  if (options.symbols) charset += CHARS.symbols
  
  if (options.excludeAmbiguous) {
    charset = charset.split('').filter(c => !CHARS.ambiguous.includes(c)).join('')
  }

  if (!charset) throw new Error('Select at least one character type')

  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)
  
  return Array.from(array, n => charset[n % charset.length]).join('')
}

function getPasswordStrength(password: string): 'weak' | 'fair' | 'strong' | 'very-strong' {
  let score = 0
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  if (score <= 2) return 'weak'
  if (score <= 3) return 'fair'
  if (score <= 4) return 'strong'
  return 'very-strong'
}
```

### UI Layout
```
[Generated Password Display]                [🔄 Regenerate]  [Copy]

Strength: [████████░░] Strong

─── Options ─────────────────────────────────
Length: [━━━━━━━━━━●────────────] 16

☑ Uppercase (A-Z)       ☑ Numbers (0-9)
☑ Lowercase (a-z)       ☑ Symbols (!@#$...)
☐ Exclude ambiguous characters (Il1O0)

[Generate 10 Passwords]

─── 10 Passwords ────────────────────────────
Kj7#mP2xQw9!vR4n         [Copy]
...
```

---

## 3. UUID Generator

**Route:** `/tools/generator/uuid`  
**Library:** `uuid` npm package

### Fitur
- Output: UUID v4 (default), juga support v7 dan ULID
- Options: Uppercase toggle, Bulk generate (up to 100)
- Copy individual atau "Copy all"

### Logic
```typescript
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid'

function generateUUIDs(version: 'v4' | 'v7', count: number, uppercase: boolean): string[] {
  return Array.from({ length: count }, () => {
    let id = version === 'v7' ? uuidv7() : uuidv4()
    return uppercase ? id.toUpperCase() : id
  })
}
```

> ⚠️ Untuk ULID: install package `ulid` secara terpisah (`npm install ulid`).

### UI Layout
```
Version: [UUID v4 ▾]

[Upper case □]

Count: [1 ─────────────────────] (max 100)

[Generate]

─── Output ────────────────────────────────
550e8400-e29b-41d4-a716-446655440000    [Copy]
[Copy All]
```

---

## 4. Lorem Ipsum Generator

**Route:** `/tools/generator/lorem`  
**Library:** Zero deps — custom lorem ipsum data

### Fitur
- Options: Unit (paragraphs / words / sentences), Count, Start with "Lorem ipsum"
- Output: Generated text + Copy + Word count

### Data
```typescript
// lib/generators/lorem.ts

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
]

const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'

function generateWords(count: number): string {
  return Array.from({ length: count }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]).join(' ')
}

function generateSentence(): string {
  const wordCount = Math.floor(Math.random() * 10) + 8
  const words = generateWords(wordCount)
  return words.charAt(0).toUpperCase() + words.slice(1) + '.'
}

function generateParagraph(): string {
  const sentenceCount = Math.floor(Math.random() * 4) + 4
  return Array.from({ length: sentenceCount }, generateSentence).join(' ')
}

export function generateLorem(unit: 'paragraphs' | 'sentences' | 'words', count: number, startWithLorem: boolean): string {
  let result: string

  if (unit === 'words') {
    result = generateWords(count)
  } else if (unit === 'sentences') {
    result = Array.from({ length: count }, generateSentence).join(' ')
  } else {
    result = Array.from({ length: count }, generateParagraph).join('\n\n')
  }

  if (startWithLorem) {
    result = LOREM_START + (unit === 'paragraphs' ? '\n\n' : ' ') + result
  }

  return result
}
```

### UI Layout
```
Generate:
  ● Paragraphs    ○ Sentences    ○ Words

Count: [5                    ]

☑ Start with "Lorem ipsum..."

[Generate]

─── Output ─────────────────────────────────
[Word count: 342 words]                  [Copy]

Lorem ipsum dolor sit amet, consectetur ...

```

---

## Acceptance Criteria Phase 1B

Sebelum lanjut ke Phase 1C:

- [ ] QR Code: generate PNG dan SVG, live preview berfungsi, download berfungsi
- [ ] Password: semua option kombinasi berfungsi, strength meter akurat
- [ ] UUID: v4 + v7 generate, uppercase toggle, bulk generate, copy all
- [ ] Lorem Ipsum: semua unit (paragraphs/sentences/words) menghasilkan teks yang tepat
- [ ] Semua tool: dark mode berfungsi
- [ ] Semua tool: `generateMetadata()` sudah ada
