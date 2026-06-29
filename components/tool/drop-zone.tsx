'use client'

import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Upload, File as FileIcon, X } from 'lucide-react'
import { cn, formatSize } from '@/lib/utils'

interface DropZoneProps {
  accept: Record<string, string[]>   // react-dropzone format
  maxSizeMB: number
  multiple?: boolean
  onFilesAccepted: (files: File[]) => void
  onError: (msg: string) => void
  files?: File[]
  onRemove?: (index: number) => void
}

export function DropZone({
  accept,
  maxSizeMB,
  multiple = false,
  onFilesAccepted,
  onError,
  files = [],
  onRemove,
}: DropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const err = rejected[0].errors[0]
        if (err.code === 'file-too-large') {
          onError(`File too large. Maximum size is ${maxSizeMB} MB.`)
        } else if (err.code === 'file-invalid-type') {
          onError('File type not supported.')
        } else {
          onError('Invalid file.')
        }
        return
      }
      onFilesAccepted(accepted)
    },
    [maxSizeMB, onFilesAccepted, onError]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple,
  })

  if (files.length > 0) {
    return (
      <div className="space-y-2">
        {files.map((file, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)]"
          >
            <FileIcon className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{formatSize(file.size)}</p>
            </div>
            {onRemove && (
              <button
                onClick={() => onRemove(i)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <div {...getRootProps()} className="cursor-pointer text-center py-3 text-sm text-[var(--color-primary)] hover:underline">
          <input {...getInputProps()} />
          + Add more files
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
        isDragActive
          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] scale-[1.02]'
          : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] hover:border-[var(--color-primary)]'
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-10 h-10 mx-auto mb-4 text-[var(--color-text-muted)]" />
      <p className="text-base font-medium text-[var(--color-text-primary)]">
        {isDragActive ? 'Drop your file here' : 'Drag and drop your file here'}
      </p>
      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
        or <span className="text-[var(--color-primary)] underline">Browse files</span>
      </p>
      <p className="text-xs text-[var(--color-text-muted)] mt-3">
        Max {maxSizeMB} MB
      </p>
    </div>
  )
}


