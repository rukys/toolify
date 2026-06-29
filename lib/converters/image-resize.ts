export interface ResizeOptions {
  width: number
  height: number
  format?: string    // default: same as input
  quality?: number   // default: 0.95
}

export async function resizeImage(file: File, options: ResizeOptions): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = options.width
      canvas.height = options.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        return reject(new Error('Canvas context failed'))
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, options.width, options.height)

      URL.revokeObjectURL(url)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Resize failed'))),
        options.format === 'same' || !options.format ? file.type : options.format,
        options.quality ?? 0.95
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Resize image loading failed'))
    }
    img.src = url
  })
}

// Get image dimensions
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image dimensions'))
    }
    img.src = url
  })
}

export function maintainAspectRatio(
  newWidth: number,
  originalWidth: number,
  originalHeight: number
): number {
  if (originalWidth === 0) return 0
  return Math.round((newWidth / originalWidth) * originalHeight)
}

export const RESIZE_PRESETS = [
  { label: 'HD (720p)', width: 1280, height: 720 },
  { label: 'Full HD (1080p)', width: 1920, height: 1080 },
  { label: '4K Ultra HD', width: 3840, height: 2160 },
  { label: 'Instagram Square (1:1)', width: 1080, height: 1080 },
  { label: 'Twitter Header (3:1)', width: 1500, height: 500 },
  { label: 'LinkedIn Banner (4:1)', width: 1584, height: 396 },
]
