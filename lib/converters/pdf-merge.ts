import { PDFDocument } from 'pdf-lib'

export async function mergePDFs(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create()
  const total = files.length

  onProgress?.(0, total)

  // Load all PDF documents concurrently
  let completed = 0
  const pdfs = await Promise.all(
    files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      completed++
      onProgress?.(completed, total)
      return pdf
    })
  )

  // Copy pages sequentially in correct order
  for (const pdf of pdfs) {
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    pages.forEach((page) => mergedPdf.addPage(page))
  }

  return mergedPdf.save()
}
