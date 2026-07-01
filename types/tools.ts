export type ToolCategory = 'pdf' | 'image' | 'generator' | 'text' | 'developer'

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error'

export interface ToolMeta {
  id: string                    // e.g., 'pdf-merge'
  name: string                  // e.g., 'PDF Merge'
  description: string           // max 60 chars
  category: ToolCategory
  href: string                  // e.g., '/tools/pdf/merge'
  icon: string                  // Lucide icon name as string
  tags: string[]                // for search index
  isNew?: boolean
  phase: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  processingLocation: 'client' | 'server'
  acceptedFormats?: string[]
  maxFileSizeMB?: number
}
