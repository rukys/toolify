export interface CropArea {
  x: number      // pixels from left
  y: number      // pixels from top
  width: number
  height: number
}

export async function cropImage(file: File, crop: CropArea): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = crop.width
      canvas.height = crop.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        return reject(new Error('Canvas context failed'))
      }

      ctx.drawImage(
        img,
        crop.x,
        crop.y,
        crop.width,
        crop.height, // source rect
        0,
        0,
        crop.width,
        crop.height // dest rect
      )

      URL.revokeObjectURL(url)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Crop failed'))),
        file.type,
        0.95
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Crop image loading failed'))
    }
    img.src = url
  })
}
