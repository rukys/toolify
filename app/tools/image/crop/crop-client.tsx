'use client'

import { useState, useRef, useEffect } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById, getRelatedTools } from '@/lib/tools-registry'
import { DropZone } from '@/components/tool/drop-zone'
import { ProcessingButton } from '@/components/tool/processing-button'
import { OutputArea } from '@/components/tool/output-area'
import { toast } from 'sonner'
import { cropImage } from '@/lib/converters/image-crop'
import { getImageDimensions } from '@/lib/converters/image-resize'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FileImage, Trash2 } from 'lucide-react'

export default function CropClient() {
  const tool = getToolById('image-crop')!
  const related = getRelatedTools('image-crop')

  const [file, setFile] = useState<File | null>(null)
  const [imgSrc, setImgSrc] = useState<string>('')
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number } | null>(null)

  // react-image-crop states
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [aspect, setAspect] = useState<number | undefined>(undefined)

  const imgRef = useRef<HTMLImageElement>(null)

  // Output
  const [output, setOutput] = useState<{ blob: Blob; sizeInfo: string; filename: string } | null>(null)

  const handleFileAccepted = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const selected = acceptedFiles[0]
    setFile(selected)
    setOutput(null)
    setCompletedCrop(null)

    // Generate local Object URL for image preview
    const url = URL.createObjectURL(selected)
    setImgSrc(url)

    try {
      const dim = await getImageDimensions(selected)
      setOrigDimensions(dim)

      // Center crop box initially
      const initialCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          aspect || 1,
          dim.width,
          dim.height
        ),
        dim.width,
        dim.height
      )
      setCrop(initialCrop)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load image.')
      setFile(null)
    }
  }

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imgSrc) {
        URL.revokeObjectURL(imgSrc)
      }
    }
  }, [imgSrc])

  const handleRemove = () => {
    if (imgSrc) {
      URL.revokeObjectURL(imgSrc)
    }
    setFile(null)
    setImgSrc('')
    setOrigDimensions(null)
    setCrop(undefined)
    setCompletedCrop(null)
    setOutput(null)
  }

  const handleAspectChange = (value: number | undefined) => {
    setAspect(value)
    if (!origDimensions) return

    if (value) {
      // Recompute aspect ratio bounding crop box
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          value,
          origDimensions.width,
          origDimensions.height
        ),
        origDimensions.width,
        origDimensions.height
      )
      setCrop(newCrop)
    } else {
      // Free aspect ratio
      setCrop({
        unit: '%',
        width: 80,
        height: 80,
        x: 10,
        y: 10,
      })
    }
  }

  const handleCropAction = async () => {
    if (!completedCrop || !imgRef.current || !file || !origDimensions) {
      toast.error('Please select a crop area first.')
      throw new Error('No crop area selected')
    }

    const img = imgRef.current
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    const cropArea = {
      x: Math.round(completedCrop.x * scaleX),
      y: Math.round(completedCrop.y * scaleY),
      width: Math.round(completedCrop.width * scaleX),
      height: Math.round(completedCrop.height * scaleY),
    }

    if (cropArea.width === 0 || cropArea.height === 0) {
      toast.error('Selection size is too small.')
      throw new Error('Selection too small')
    }

    try {
      const blob = await cropImage(file, cropArea)

      const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`
      }

      const filename = `${file.name.replace(/\.[^.]+$/, '')}-cropped.${file.type.split('/')[1]}`

      setOutput({
        blob,
        filename,
        sizeInfo: `${formatSize(file.size)} → ${formatSize(blob.size)} (${cropArea.width} × ${cropArea.height} px)`,
      })
      toast.success('Image cropped successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Crop action failed.')
      throw err
    }
  }

  return (
    <ToolLayout tool={tool} relatedTools={related}>
      <div className="space-y-6">
        {/* Upload Box */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Upload Image</Label>

          {file && imgSrc ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
              <FileImage className="w-8 h-8 text-[var(--color-primary)] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-[var(--color-text-primary)]">
                  {file.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                  {origDimensions && ` • Original: ${origDimensions.width} × ${origDimensions.height} px`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface)] cursor-pointer h-9 w-9"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <DropZone
              accept={{
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/png': ['.png'],
                'image/webp': ['.webp'],
              }}
              maxSizeMB={50}
              onFilesAccepted={handleFileAccepted}
              onError={(msg) => toast.error(msg)}
            />
          )}
        </div>

        {/* Configurations and Editor */}
        {file && imgSrc && (
          <div className="space-y-5 border-t border-[var(--color-border)] pt-5 animate-fade-in">
            {/* Aspect ratios presets */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Select Aspect Ratio
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Free Shape', value: undefined },
                  { label: 'Square (1:1)', value: 1 },
                  { label: 'Standard (4:3)', value: 4 / 3 },
                  { label: 'Widescreen (16:9)', value: 16 / 9 },
                  { label: 'Portrait (3:4)', value: 3 / 4 },
                ].map((preset, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant={aspect === preset.value ? 'default' : 'outline'}
                    onClick={() => handleAspectChange(preset.value)}
                    className="text-xs cursor-pointer h-9"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Draggable Crop Area */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Drag Crop Box
              </Label>
              <div className="flex justify-center p-6 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl max-h-[480px] overflow-auto select-none">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  className="max-w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="Source image to crop"
                    className="max-h-[380px] w-auto object-contain rounded-lg"
                  />
                </ReactCrop>
              </div>
            </div>

            {/* Selection coordinates preview */}
            {completedCrop && (
              <div className="text-xs font-mono text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)] p-3 rounded-lg border border-[var(--color-border)] flex flex-wrap justify-between gap-4">
                <span>
                  Crop X:{' '}
                  <strong className="text-[var(--color-text-primary)]">
                    {Math.round(completedCrop.x)} px
                  </strong>
                </span>
                <span>
                  Crop Y:{' '}
                  <strong className="text-[var(--color-text-primary)]">
                    {Math.round(completedCrop.y)} px
                  </strong>
                </span>
                <span>
                  Width:{' '}
                  <strong className="text-[var(--color-primary)]">
                    {Math.round(completedCrop.width)} px
                  </strong>
                </span>
                <span>
                  Height:{' '}
                  <strong className="text-[var(--color-primary)]">
                    {Math.round(completedCrop.height)} px
                  </strong>
                </span>
              </div>
            )}

            {/* Action button */}
            <div className="pt-2">
              <ProcessingButton
                onClick={handleCropAction}
                disabled={!completedCrop}
                label="Crop Image"
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="space-y-2 pt-2 animate-fade-in">
            <Label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Cropped Output
            </Label>
            <OutputArea
              mode="download"
              filename={output.filename}
              blob={output.blob}
              sizeInfo={output.sizeInfo}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
