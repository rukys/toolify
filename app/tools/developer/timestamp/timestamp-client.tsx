'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Copy, Check, Clock, Calendar } from 'lucide-react'

// Convert a Date object to local datetime-local string (YYYY-MM-DDTHH:MM)
function dateToDateTimeLocal(date: Date): string {
  const ten = (i: number) => (i < 10 ? '0' : '') + i
  const YYYY = date.getFullYear()
  const MM = ten(date.getMonth() + 1)
  const DD = ten(date.getDate())
  const HH = ten(date.getHours())
  const MIN = ten(date.getMinutes())
  return `${YYYY}-${MM}-${DD}T${HH}:${MIN}`
}

function getRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const abs = Math.abs(diff)
  const past = diff > 0

  if (abs < 60000) return 'just now'
  if (abs < 3600000) return `${Math.floor(abs / 60000)} minutes ${past ? 'ago' : 'from now'}`
  if (abs < 86400000) return `${Math.floor(abs / 3600000)} hours ${past ? 'ago' : 'from now'}`
  return `${Math.floor(abs / 86400000)} days ${past ? 'ago' : 'from now'}`
}

export default function TimestampClient() {
  const tool = getToolById('timestamp-converter')!
  const [currentSec, setCurrentSec] = useState(0)
  const [currentMs, setCurrentMs] = useState(0)

  // Converter States
  const [timestampInput, setTimestampInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [copiedMap, setCopiedMap] = useState<{ [key: string]: boolean }>({})

  // outputs
  const [utcTime, setUtcTime] = useState('')
  const [localTime, setLocalTime] = useState('')
  const [isoTime, setIsoTime] = useState('')
  const [relativeTime, setRelativeTime] = useState('')
  const [detectedUnit, setDetectedUnit] = useState<'s' | 'ms' | null>(null)

  // 1. Current ticking time clock
  useEffect(() => {
    const updateTick = () => {
      const now = Date.now()
      setCurrentMs(now)
      setCurrentSec(Math.floor(now / 1000))
    }
    updateTick()
    const timer = setInterval(updateTick, 1000)
    return () => clearInterval(timer)
  }, [])

  const clearOutputs = useCallback(() => {
    setUtcTime('')
    setLocalTime('')
    setIsoTime('')
    setRelativeTime('')
    setDetectedUnit(null)
  }, [])

  // Live conversion logic
  const handleTimestampConvert = useCallback((val: string) => {
    setTimestampInput(val)
    if (!val || isNaN(Number(val))) {
      clearOutputs()
      return
    }

    const num = Number(val)
    const isMs = num > 1e10
    setDetectedUnit(isMs ? 'ms' : 's')

    const date = new Date(isMs ? num : num * 1000)
    if (isNaN(date.getTime())) {
      clearOutputs()
      return
    }

    setUtcTime(date.toUTCString())
    setLocalTime(date.toLocaleString())
    setIsoTime(date.toISOString())
    setRelativeTime(getRelativeTime(date))
    
    // Sync date-time input picker without triggering infinity loop
    setDateInput(dateToDateTimeLocal(date))
  }, [clearOutputs])

  // Handle Date Time Picker input change
  const handleDateConvert = useCallback((val: string) => {
    setDateInput(val)
    if (!val) {
      clearOutputs()
      return
    }

    const date = new Date(val)
    if (isNaN(date.getTime())) {
      clearOutputs()
      return
    }

    // Default to matching the unit previously typed, or default to seconds
    const useMs = detectedUnit === 'ms'
    const newTimestamp = useMs ? date.getTime() : Math.floor(date.getTime() / 1000)
    
    setTimestampInput(newTimestamp.toString())
    setUtcTime(date.toUTCString())
    setLocalTime(date.toLocaleString())
    setIsoTime(date.toISOString())
    setRelativeTime(getRelativeTime(date))
  }, [clearOutputs, detectedUnit])

  // 2. Set default input to current time on load
  useEffect(() => {
    const now = Date.now()
    const currentSecString = Math.floor(now / 1000).toString()
    
    const timer = setTimeout(() => {
      handleTimestampConvert(currentSecString)
    }, 0)

    return () => clearTimeout(timer)
  }, [handleTimestampConvert])

  const handleInsertCurrent = (isMs: boolean) => {
    const val = isMs ? currentMs.toString() : currentSec.toString()
    handleTimestampConvert(val)
  }

  const handleCopyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedMap((prev) => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [key]: false }))
    }, 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Live Current Time Panel */}
        <div className="p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-alt)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider">Current Unix Epoch Time</p>
              <div className="flex flex-wrap items-baseline gap-x-2 mt-1">
                <span className="text-xl font-bold font-mono tracking-tight text-[var(--color-primary)]">{currentSec}</span>
                <span className="text-xs text-[var(--color-text-muted)]">seconds</span>
                <span className="text-sm font-semibold font-mono text-[var(--color-text-secondary)] ml-2">/ {currentMs}</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">milliseconds</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInsertCurrent(false)}
              className="flex-1 sm:flex-none cursor-pointer text-xs h-9"
            >
              Insert (Seconds)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInsertCurrent(true)}
              className="flex-1 sm:flex-none cursor-pointer text-xs h-9"
            >
              Insert (Ms)
            </Button>
          </div>
        </div>

        {/* Converter Inputs (Dual Column) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unix Timestamp Input */}
          <div className="space-y-2">
            <Label htmlFor="timestamp-input" className="text-sm font-semibold">
              Unix Epoch Timestamp
            </Label>
            <div className="relative">
              <Input
                id="timestamp-input"
                type="text"
                placeholder="Enter Unix timestamp..."
                value={timestampInput}
                onChange={(e) => handleTimestampConvert(e.target.value)}
                className="font-mono text-sm pr-12"
              />
              {detectedUnit && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] uppercase font-bold bg-[var(--color-primary-light)] text-[var(--color-primary)] px-1.5 py-0.5 rounded border border-blue-200">
                  {detectedUnit}
                </span>
              )}
            </div>
          </div>

          {/* Local Date Picker Input */}
          <div className="space-y-2">
            <Label htmlFor="date-input" className="text-sm font-semibold">
              Local Calendar Date
            </Label>
            <div className="relative">
              <Input
                id="date-input"
                type="datetime-local"
                value={dateInput}
                onChange={(e) => handleDateConvert(e.target.value)}
                className="text-sm pr-8 cursor-pointer"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Output Fields */}
        {utcTime ? (
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-semibold">Conversion Outputs</Label>
            <div className="border border-[var(--color-border)] rounded-xl overflow-hidden text-xs">
              <div className="divide-y divide-[var(--color-border)]">
                {/* UTC Time */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-2 hover:bg-[var(--color-surface-alt)]/30">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[var(--color-text-secondary)]">UTC Date-Time</p>
                    <p className="font-mono text-[var(--color-text-primary)]">{utcTime}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-[10px] h-7 w-20 shrink-0"
                    onClick={() => handleCopyText('utc', utcTime)}
                  >
                    {copiedMap['utc'] ? <Check className="w-3.5 h-3.5 text-[var(--color-success)] mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedMap['utc'] ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                {/* Local Time */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-2 hover:bg-[var(--color-surface-alt)]/30">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[var(--color-text-secondary)]">Local Date-Time</p>
                    <p className="font-mono text-[var(--color-text-primary)]">{localTime}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-[10px] h-7 w-20 shrink-0"
                    onClick={() => handleCopyText('local', localTime)}
                  >
                    {copiedMap['local'] ? <Check className="w-3.5 h-3.5 text-[var(--color-success)] mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedMap['local'] ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                {/* ISO 8601 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-2 hover:bg-[var(--color-surface-alt)]/30">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[var(--color-text-secondary)]">ISO 8601 String</p>
                    <p className="font-mono text-[var(--color-text-primary)] break-all">{isoTime}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-[10px] h-7 w-20 shrink-0"
                    onClick={() => handleCopyText('iso', isoTime)}
                  >
                    {copiedMap['iso'] ? <Check className="w-3.5 h-3.5 text-[var(--color-success)] mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedMap['iso'] ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                {/* Relative Time */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-2 hover:bg-[var(--color-surface-alt)]/30">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[var(--color-text-secondary)]">Relative Age</p>
                    <p className="font-mono text-[var(--color-text-primary)]">{relativeTime}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-[10px] h-7 w-20 shrink-0"
                    onClick={() => handleCopyText('relative', relativeTime)}
                  >
                    {copiedMap['relative'] ? <Check className="w-3.5 h-3.5 text-[var(--color-success)] mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedMap['relative'] ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] text-xs">
            Enter a valid timestamp or calendar date to see conversions
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
