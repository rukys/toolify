import imageCompression from 'browser-image-compression'
import JSZip from 'jszip'

export interface CompressOptions {
  quality: number       // 1-100
  outputFormat?: string // 'image/jpeg' | 'image/webp' | 'image/png' | 'same'
  onProgress?: (progress: number) => void
}

export async function compressImage(file: File, options: CompressOptions): Promise<File> {
  const targetFormat =
    options.outputFormat === 'same' || !options.outputFormat ? file.type : options.outputFormat

  return imageCompression(file, {
    maxSizeMB: options.quality < 50 ? 0.3 : options.quality < 80 ? 1 : 2,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
    initialQuality: options.quality / 100,
    fileType: targetFormat,
    onProgress: options.onProgress,
  })
}

export function estimateOutputSize(fileSize: number, quality: number): string {
  const ratio = quality < 50 ? 0.15 : quality < 80 ? 0.35 : 0.65
  const estBytes = fileSize * ratio
  if (estBytes < 1024 * 1024) return `~${(estBytes / 1024).toFixed(0)} KB`
  return `~${(estBytes / 1024 / 1024).toFixed(1)} MB`
}

export async function compressMultipleImages(
  files: File[],
  options: CompressOptions
): Promise<Blob> {
  const zip = new JSZip()
  const compressedFiles = await Promise.all(
    files.map(async (file) => {
      const compressed = await compressImage(file, options)
      return { name: file.name, data: compressed }
    })
  )
  for (const file of compressedFiles) {
    zip.file(`compressed-${file.name}`, file.data)
  }
  return zip.generateAsync({ type: 'blob' })
}
