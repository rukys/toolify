'use client'

import { useState } from 'react'
import { Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProcessingStatus } from '@/types/tools'
import { cn } from '@/lib/utils'

interface ProcessingButtonProps {
  onClick: () => Promise<void>
  label: string
  className?: string
  disabled?: boolean
}

export function ProcessingButton({ onClick, label, className, disabled = false }: ProcessingButtonProps) {
  const [status, setStatus] = useState<ProcessingStatus>('idle')

  const handleClick = async () => {
    setStatus('processing')
    try {
      await onClick()
      setStatus('done')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || status === 'processing'}
      className={cn(
        'px-6 py-3 font-semibold transition-colors cursor-pointer',
        status === 'done' && 'bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]',
        status === 'error' && 'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]',
        className
      )}
    >
      {status === 'idle' && label}
      {status === 'processing' && (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
        </>
      )}
      {status === 'done' && (
        <>
          <Check className="w-4 h-4 mr-2" /> Done
        </>
      )}
      {status === 'error' && (
        <>
          <X className="w-4 h-4 mr-2" /> Try again
        </>
      )}
    </Button>
  )
}
