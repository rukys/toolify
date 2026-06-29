import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'

export type SplitMode = 'individual' | 'range' | 'every-n'

export function parsePageRange(range: string, totalPages: number): number[] {
  const indices = new Set<number>()
  const parts = range.split(',')
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-')
      const start = Number(startStr)
      const end = Number(endStr)
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.min(start, end)
        const to = Math.max(start, end)
        for (let i = from; i <= Math.min(to, totalPages); i++) {
          if (i >= 1) indices.add(i - 1)
        }
      }
    } else {
      const page = Number(trimmed)
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        indices.add(page - 1)
      }
    }
  }
  return Array.from(indices).sort((a, b) => a - b)
}

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
    const n = options.n
    for (let i = 0; i < totalPages; i += n) {
      pageGroups.push(
        Array.from({ length: Math.min(n, totalPages - i) }, (_, j) => i + j)
      )
    }
  }

  const blobs: Blob[] = []
  const names: string[] = []

  const splitResults = await Promise.all(
    pageGroups.map(async (group, g) => {
      if (group.length === 0) return null
      const newPdf = await PDFDocument.create()
      const pages = await newPdf.copyPages(sourcePdf, group)
      pages.forEach((p) => newPdf.addPage(p))
      const bytes = await newPdf.save()
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
      
      let name = ''
      if (mode === 'individual') {
        name = `page-${g + 1}.pdf`
      } else if (mode === 'range') {
        name = `split-pages-${options.range?.replace(/\s+/g, '')}.pdf`
      } else {
        const startPage = g * (options.n || 1) + 1
        const endPage = Math.min((g + 1) * (options.n || 1), totalPages)
        name = `pages-${startPage}-${endPage}.pdf`
      }
      return { blob, name }
    })
  )

  for (const res of splitResults) {
    if (res) {
      blobs.push(res.blob)
      names.push(res.name)
    }
  }

  return { blobs, names }
}

export async function zipPDFs(blobs: Blob[], names: string[]): Promise<Blob> {
  const zip = new JSZip()
  for (let i = 0; i < blobs.length; i++) {
    zip.file(names[i], blobs[i])
  }
  return zip.generateAsync({ type: 'blob' })
}
