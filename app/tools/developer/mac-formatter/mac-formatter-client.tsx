'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Copy, Check, Info } from 'lucide-react'

// Local OUI OUI-prefix database for top network card hardware manufacturers
const OUI_DATABASE: Record<string, string> = {
  '00:00:0C': 'Cisco Systems',
  '00:1A:11': 'Google',
  '00:1C:42': 'Parallels (virtual machine)',
  '00:05:69': 'VMware',
  '08:00:27': 'Oracle VirtualBox',
  '3C:D9:2B': 'Hewlett Packard',
  'A4:C3:F0': 'Intel Corporation',
  'E4:E7:49': 'Intel Corporation',
  '00:11:22': 'Cisco Systems Test',
  '00:25:90': 'Super Micro Computer',
  '00:17:F2': 'Apple Inc.',
  '00:1C:B3': 'Apple Inc.',
  '00:25:00': 'Apple Inc.',
  'F4:0F:24': 'Apple Inc.',
  'D8:30:62': 'Apple Inc.',
  '70:3E:AC': 'Apple Inc.',
  '00:50:56': 'VMware',
  '00:0C:29': 'VMware',
  '00:16:3E': 'Xen (virtual machine)',
  '54:EE:75': 'Wistron InfoComm (often Dell/HP/Lenovo)',
  'FC:AA:14': 'Giga-Byte Technology',
  '2C:33:7A': 'Xiaomi Communications',
  '7C:11:BE': 'Xiaomi Communications',
  '48:2C:6A': 'Samsung Electronics',
  'B0:C5:59': 'Samsung Electronics',
  'D4:F5:47': 'Huawei Technologies',
  'E8:08:8B': 'Huawei Technologies',
  '00:1E:8C': 'ASUSTek Computer',
  '10:7B:44': 'ASUSTek Computer',
  'A8:5E:45': 'Realtek Semiconductor',
}

type Delimiter = ':' | '-' | '.'

export default function MACFormatterClient() {
  const tool = getToolById('mac-formatter')!
  const [inputMac, setInputMac] = useState('001C42001122')
  const [delimiter, setDelimiter] = useState<Delimiter>(':')
  const [useUppercase, setUseUppercase] = useState(true)
  
  const [formatted, setFormatted] = useState('')
  const [vendor, setVendor] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const processMac = () => {
    setError('')
    setFormatted('')
    setVendor(null)

    const cleaned = inputMac.trim().replace(/[^a-fA-F0-9]/g, '')
    if (!cleaned) return

    if (cleaned.length !== 12) {
      setError('Invalid MAC address length. Must contain exactly 12 hexadecimal characters (0-9, A-F).')
      return
    }

    // Format address
    const parts: string[] = []
    if (delimiter === '.') {
      // 3 groups of 4 chars (e.g. xxxx.xxxx.xxxx)
      parts.push(cleaned.slice(0, 4), cleaned.slice(4, 8), cleaned.slice(8, 12))
    } else {
      // 6 groups of 2 chars (e.g. xx:xx:xx:xx:xx:xx)
      for (let i = 0; i < 12; i += 2) {
        parts.push(cleaned.slice(i, i + 2))
      }
    }

    let finalStr = parts.join(delimiter)
    finalStr = useUppercase ? finalStr.toUpperCase() : finalStr.toLowerCase()
    setFormatted(finalStr)

    // Lookup Vendor (OUI prefix - first 6 characters formatted with colons)
    const ouiParts = [cleaned.slice(0, 2), cleaned.slice(2, 4), cleaned.slice(4, 6)]
    const ouiKey = ouiParts.join(':').toUpperCase()
    const detectedVendor = OUI_DATABASE[ouiKey] || 'Unknown Manufacturer'
    setVendor(detectedVendor)
  }

  useEffect(() => {
    processMac()
  }, [inputMac, delimiter, useUppercase])

  const handleCopy = async () => {
    if (!formatted) return
    await navigator.clipboard.writeText(formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInputMac('')
    setFormatted('')
    setVendor(null)
    setError('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="mac-input" className="text-sm font-semibold">Enter MAC Address</Label>
          <div className="flex gap-2">
            <Input
              id="mac-input"
              type="text"
              placeholder="e.g. 00-1c-42-00-11-22 or 001C42001122"
              value={inputMac}
              onChange={(e) => setInputMac(e.target.value)}
              className="flex-1 bg-(--color-surface-alt) border-(--color-border) font-mono text-sm focus-visible:ring-(--color-primary)"
            />
            <Button variant="outline" onClick={handleClear} className="border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer">
              Clear
            </Button>
          </div>
        </div>

        {/* Configuration settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Separator</Label>
            <div className="flex gap-1.5">
              {([':', '-', '.'] as Delimiter[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDelimiter(d)}
                  className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
                    delimiter === d
                      ? 'bg-(--color-primary) text-white border-transparent'
                      : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                  }`}
                >
                  {d === ':' ? 'Colons (:)' : d === '-' ? 'Hyphens (-)' : 'Dots (.)'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Casing</Label>
            <div className="flex gap-1.5">
              <button
                onClick={() => setUseUppercase(true)}
                className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
                  useUppercase
                    ? 'bg-(--color-primary) text-white border-transparent'
                    : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                }`}
              >
                UPPERCASE
              </button>
              <button
                onClick={() => setUseUppercase(false)}
                className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
                  !useUppercase
                    ? 'bg-(--color-primary) text-white border-transparent'
                    : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                }`}
              >
                lowercase
              </button>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Output Panel */}
        {formatted && (
          <div className="space-y-4 pt-4 border-t border-(--color-border) animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Formatted MAC Address</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-green-500 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-sm text-(--color-text-primary) tracking-wide">
                {formatted}
              </div>
            </div>

            {/* Vendor Display */}
            {vendor && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-300">OUI Hardware Manufacturer</h4>
                  <p className="text-sm font-semibold mt-1">{vendor}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
