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

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        return reject(new Error('Canvas context failed'))
      }

      // Fill white background for JPEG output (transparency maps to black by default in JPEG)
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Conversion failed'))),
        targetFormat,
        targetFormat === 'image/png' ? undefined : quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Convert image loading failed'))
    }
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
