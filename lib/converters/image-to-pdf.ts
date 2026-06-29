import { PDFDocument } from 'pdf-lib'

export interface ImageToPDFOptions {
  pageSize: 'A4' | 'Letter' | 'auto'
  orientation: 'portrait' | 'landscape'
  margin: number        // margins in PDF points (1 pt = 1/72 inch)
  fit: 'fit' | 'fill' | 'stretch'
}

async function convertToPNG(file: File): Promise<ArrayBuffer> {
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
        return reject(new Error('Canvas context acquisition failed'))
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url)
        if (!blob) return reject(new Error('PNG conversion blob creation failed'))
        resolve(blob.arrayBuffer())
      }, 'image/png')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image failed to load'))
    }
    img.src = url
  })
}

export async function imagesToPDF(
  files: File[],
  options: ImageToPDFOptions
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()

  // Standard paper sizes in points (72 points per inch)
  // A4: 8.27 x 11.69 inches -> 595.28 x 841.89 pt
  // Letter: 8.5 x 11 inches -> 612 x 792 pt
  const pageSizeMap: Record<'A4' | 'Letter', [number, number]> = {
    A4: [595.28, 841.89],
    Letter: [612, 792],
  }

  const preparedImages = await Promise.all(
    files.map(async (file) => {
      const isJpg = file.type === 'image/jpeg' || file.type === 'image/jpg'
      const bytes = isJpg ? await file.arrayBuffer() : await convertToPNG(file)
      return { bytes, isJpg }
    })
  )

  for (const prep of preparedImages) {
    const image = prep.isJpg ? await pdf.embedJpg(prep.bytes) : await pdf.embedPng(prep.bytes)

    let [pageWidth, pageHeight] =
      options.pageSize === 'auto'
        ? [image.width + options.margin * 2, image.height + options.margin * 2]
        : pageSizeMap[options.pageSize]

    // Swap dimensions if orientation is landscape
    if (
      options.pageSize !== 'auto' &&
      options.orientation === 'landscape' &&
      pageWidth < pageHeight
    ) {
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
    } else if (options.fit === 'fill') {
      const imgRatio = image.width / image.height
      const areaRatio = usableW / usableH
      if (imgRatio > areaRatio) {
        drawH = usableH
        drawW = usableH * imgRatio
      } else {
        drawW = usableW
        drawH = usableW / imgRatio
      }
    } else if (options.fit === 'stretch') {
      drawW = usableW
      drawH = usableH
    }

    // Centered drawing coordinates
    const drawX = options.margin + (usableW - drawW) / 2
    const drawY = options.margin + (usableH - drawH) / 2

    page.drawImage(image, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    })
  }

  return pdf.save()
}
