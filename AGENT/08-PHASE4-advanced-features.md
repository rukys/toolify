# 🚀 Phase 4 — Advanced Features & Systems

> **Baca dulu:** `00-CONTEXT.md` → `PROGRESS.md` → file ini  
> **Goal:** Mengimplementasikan optimasi navigasi global, sistem personalisasi, serta menambahkan fungsionalitas lanjutan pada utility developer, teks, dan gambar secara 100% client-side.

---

## Checklist Phase 4

- [ ] **Sistem & Navigasi Global**
  - [ ] Global Command Palette (`Cmd + K`)
  - [ ] Starred / Favorite Tools System (LocalStorage)
- [ ] **Developer Tools Tambahan**
  - [ ] JSON to YAML / YAML to JSON Converter (`/tools/developer/yaml`)
  - [ ] URL Parser & Query String Decoder (`/tools/developer/url-parser`)
- [ ] **Image Utilities Tambahan**
  - [ ] EXIF Metadata Stripper (`/tools/image/exif-stripper`)

---

## 🎹 1. Global Command Palette (`Cmd + K`)

Membuka modal pencarian mengambang (floating overlay search) dari mana saja di aplikasi menggunakan shortcut keyboard, mempermudah pengguna berpindah antar tool secara instan.

**Trigger:** Keyboard shortcut `Cmd + K` (Mac) atau `Ctrl + K` (Windows/Linux)  
**Library:** Zero-dependency (menggunakan React portal/dialog native) atau Command menu component jika dibutuhkan.

### Fitur
- Deteksi hotkey keyboard global.
- Modal pencarian dengan efek backdrop blur dan animasi transisi halus.
- Pencarian cerdas (fuzzy search) berdasarkan nama tool, deskripsi, dan tags.
- Navigasi hasil pencarian menggunakan tombol panah keyboard (`ArrowUp` / `ArrowDown`) dan pemilihan menggunakan `Enter`.
- Auto-focus pada search input saat modal terbuka.

### UI Layout
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Search tools... [ESC to close]                      │
├─────────────────────────────────────────────────────────┤
│  ⚡ JSON Formatter          (Developer Tools)            │
│  ✨ Word Counter             (Text Utilities)             │
│  📄 PDF Merge               (PDF Utilities)             │
│  🎲 UUID Generator          (Generators)                │
└─────────────────────────────────────────────────────────┘
```

### Core Logic
```typescript
// hooks/use-command-palette.ts
import { useEffect, useState } from 'react'

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { isOpen, setIsOpen }
}
```

---

## ⭐ 2. Starred / Favorite Tools System

Memungkinkan pengguna menyematkan (pin) tool yang paling sering mereka gunakan di bagian teratas homepage.

**Storage:** `localStorage` (100% client-side)  
**Route:** Terintegrasi di Homepage (`/`) & Category Catalog.

### Fitur
- Tombol bintang (Star icon) di setiap `ToolCard` and `ToolLayout` header.
- Menyimpan daftar ID tool favorit secara persisten di `localStorage`.
- Bagian "Starred Utilities" baru di homepage di atas daftar kategori utama (hanya muncul jika ada minimal 1 favorit).

### Core Logic
```typescript
// hooks/use-favorite-tools.ts
import { useState, useEffect, useCallback } from 'react'

const FAVORITES_KEY = 'toolify-favorites'

export function useFavoriteTools() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (stored) {
      setFavorites(JSON.parse(stored))
    }
  }, [])

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { favorites, toggleFavorite, isFavorite: (id: string) => favorites.includes(id) }
}
```

---

## 🗂️ 3. JSON to YAML / YAML to JSON Converter

Konverter format data dua arah untuk mempermudah manipulasi file konfigurasi.

**Route:** `/tools/developer/yaml`  
**Library:** `yaml` (pustaka parsing YAML ringan dan cepat)

### Fitur
- Mode toggle: **JSON to YAML** | **YAML to JSON**.
- Indent size selection (2 / 4 spasi).
- Fitur live validation & formatting error display dengan line number.
- Copy hasil output secara instan ke clipboard.

### UI Layout
```
[ Textarea: Input (JSON / YAML) ]

Options:
  Mode: [ JSON to YAML ▾ ]   Indent: [ 2 ▾ ]

[ Convert ]  [ Clear ]

─── Output ───────────────────────────
[ OutputArea mode="text" ]
```

### Core Logic
```typescript
// lib/converters/yaml-json.ts
import YAML from 'yaml'

export function convertJSONToYAML(jsonStr: string, indentSize: number): string {
  const parsed = JSON.parse(jsonStr)
  return YAML.stringify(parsed, { indent: indentSize })
}

export function convertYAMLToJSON(yamlStr: string, indentSize: number): string {
  const parsed = YAML.parse(yamlStr)
  return JSON.stringify(parsed, null, indentSize)
}
```

---

## 🔗 4. URL Parser & Query String Decoder

Memecah URL yang kompleks dan panjang menjadi parameter-parameter terpisah agar mudah dibaca oleh API debugger.

**Route:** `/tools/developer/url-parser`  
**Library:** Native browser `URL` & `URLSearchParams` API (zero-deps).

### Fitur
- Parse URL instan (protokol, host, pathname, query parameters, hash).
- Ekstraksi parameter query string ke dalam bentuk tabel (Key & Value).
- Decode otomatis (percent-decoding) pada parameter yang di-encode.
- Fitur menambah/menghapus/mengedit parameter di tabel dan menyusun ulang URL baru secara real-time.

### UI Layout
```
[ Input URL: https://example.com/api?user=john&role=admin ]

─── URL Breakdown ───────────────────
Protocol: https:
Host:     example.com
Path:     /api

─── Query Parameters ────────────────
Key       | Value        | Actions
----------|--------------|--------
user      | john         | [Edit] [Delete]
role      | admin        | [Edit] [Delete]

[ + Add Parameter ]
[ Copy Parsed URL ]
```

### Core Logic
```typescript
// lib/utils/url-parser.ts
export interface ParsedURL {
  protocol: string
  host: string
  pathname: string
  searchParams: { key: string; value: string }[]
  hash: string
}

export function parseFullURL(inputUrl: string): ParsedURL {
  const url = new URL(inputUrl)
  const params: { key: string; value: string }[] = []
  url.searchParams.forEach((value, key) => {
    params.push({ key, value })
  })
  return {
    protocol: url.protocol,
    host: url.host,
    pathname: url.pathname,
    searchParams: params,
    hash: url.hash,
  }
}
```

---

## 📷 5. EXIF Metadata Stripper

Menghapus tag metadata EXIF (seperti lokasi GPS, data kamera, dan tanggal) dari file gambar sebelum dibagikan di internet untuk menjaga privasi pengguna.

**Route:** `/tools/image/exif-stripper`  
**Library:** Zero-dependency canvas redraw (untuk menghapus EXIF secara default) atau browser-native binary file parsing.

### Fitur
- DropZone untuk mengunggah gambar (JPG, PNG, WEBP).
- Tampilkan indikator metadata yang terdeteksi (apakah mengandung koordinat lokasi/GPS, informasi perangkat, dll.).
- Penghapusan metadata instan secara client-side.
- Unduhan hasil gambar yang bersih.

### UI Layout
```
[ DropZone: Upload Image to Strip EXIF ]

Image Detected: photo.jpg (4.2 MB)
⚠️ Contains GPS Location & Camera EXIF metadata!

[ Clean & Strip Metadata ]

─── Output ───────────────────────────
[ OutputArea mode="download" filename="photo_stripped.jpg" ]
```

### Core Logic
```typescript
// lib/converters/exif-stripper.ts
export async function stripImageMetadata(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        URL.revokeObjectURL(url)
        return reject(new Error('Canvas context failed'))
      }

      // Menggambar ulang gambar ke kanvas secara otomatis membuang metadata EXIF biner asli
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Stripping metadata failed'))
          }
        },
        file.type,
        0.95
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}
```
