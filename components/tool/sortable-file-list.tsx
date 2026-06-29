'use client'

import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, GripVertical, FileText, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface SortableItem {
  id: string
  file: File
  extraInfo?: string
  thumbnailUrl?: string
}

interface SortableFileListProps {
  items: SortableItem[]
  onItemsChange: (items: SortableItem[]) => void
  onRemove: (id: string) => void
  layout?: 'list' | 'grid'
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function SortableFileItemComponent({
  item,
  layout,
  onRemove,
}: {
  item: SortableItem
  layout: 'list' | 'grid'
  onRemove: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  if (layout === 'grid') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative flex flex-col items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs transition-shadow group ${
          isDragging ? 'shadow-lg border-[var(--color-primary)]' : 'hover:border-[var(--color-text-muted)]'
        }`}
      >
        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-[var(--color-danger)] text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm hover:scale-105"
        >
          <Trash2 className="w-3 h-3" />
        </button>

        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1.5 left-1.5 p-1 rounded-md bg-[var(--color-surface-alt)] border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-3 h-3 text-[var(--color-text-secondary)]" />
        </div>

        {/* Thumbnail or Fallback */}
        <div className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-alt)] flex items-center justify-center mb-2 mt-3 select-none">
          {item.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnailUrl}
              alt={item.file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-[var(--color-text-muted)]" />
          )}
        </div>

        {/* Info */}
        <div className="w-full text-center space-y-0.5">
          <p className="text-[11px] font-semibold text-[var(--color-text-primary)] truncate max-w-full px-1">
            {item.file.name}
          </p>
          <p className="text-[9px] text-[var(--color-text-muted)]">
            {formatSize(item.file.size)}
          </p>
        </div>
      </div>
    )
  }

  // Default List Row Layout (perfect for PDF files)
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs transition-shadow ${
        isDragging ? 'shadow-md border-[var(--color-primary)] bg-[var(--color-surface-alt)]' : ''
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="p-1 rounded-md hover:bg-[var(--color-surface-alt)] cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-[var(--color-text-secondary)]" />
      </div>

      {/* File Icon */}
      <div className="p-2 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
        <FileText className="w-4 h-4" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {item.file.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span>{formatSize(item.file.size)}</span>
          {item.extraInfo && (
            <>
              <span>•</span>
              <span className="text-[var(--color-primary)] font-medium">{item.extraInfo}</span>
            </>
          )}
        </div>
      </div>

      {/* Remove Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.id)}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface-alt)] cursor-pointer h-9 w-9"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

export function SortableFileList({
  items,
  onItemsChange,
  onRemove,
  layout = 'list',
}: SortableFileListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // prevent accidental drags on clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      onItemsChange(arrayMove(items, oldIndex, newIndex))
    }
  }

  if (items.length === 0) return null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div
          className={
            layout === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 p-1'
              : 'space-y-2 max-h-[380px] overflow-y-auto pr-1'
          }
        >
          {items.map((item) => (
            <SortableFileItemComponent
              key={item.id}
              item={item}
              layout={layout}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
