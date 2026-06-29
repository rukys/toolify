'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import QRCode from 'qrcode'

type QrType = 'url' | 'text' | 'email' | 'phone'

export default function QRCodeClient() {
  const tool = getToolById('qr-code')!
  const [activeTab, setActiveTab] = useState<QrType>('url')

  // Inputs
  const [url, setUrl] = useState('https://toolify.com')
  const [text, setText] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  // Styling Options
  const [size, setSize] = useState(256)
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')

  // Outputs
  const [qrUrl, setQrUrl] = useState('')
  const [error, setError] = useState('')

  // Build the raw text to encode into the QR code
  const getRawText = () => {
    switch (activeTab) {
      case 'url':
        return url.trim() || 'https://toolify.com'
      case 'text':
        return text || 'Toolify'
      case 'email': {
        const address = emailAddress.trim()
        if (!address) return 'mailto:'
        const query = []
        if (emailSubject) query.push(`subject=${encodeURIComponent(emailSubject)}`)
        if (emailBody) query.push(`body=${encodeURIComponent(emailBody)}`)
        const queryString = query.length > 0 ? `?${query.join('&')}` : ''
        return `mailto:${address}${queryString}`
      }
      case 'phone':
        return phoneNumber.trim() ? `tel:${phoneNumber.trim()}` : 'tel:'
      default:
        return 'https://toolify.com'
    }
  }

  const rawText = getRawText()

  // Generate QR Code data URL asynchronously
  useEffect(() => {
    let active = true

    QRCode.toDataURL(rawText, {
      width: size,
      margin: 2,
      errorCorrectionLevel: errorCorrection,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    })
      .then((dataUrl) => {
        if (active) {
          setQrUrl(dataUrl)
          setError('')
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Error generating QR Code')
          setQrUrl('')
        }
      })

    return () => {
      active = false
    }
  }, [rawText, size, errorCorrection, fgColor, bgColor])

  const handleDownloadPNG = () => {
    if (!qrUrl) return
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = `qrcode_${activeTab}.png`
    a.click()
  }

  const handleDownloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(rawText, {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: errorCorrection,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      })
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qrcode_${activeTab}.svg`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating SVG')
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as QrType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 bg-(--color-surface-alt)">
            <TabsTrigger value="url" className="cursor-pointer text-xs sm:text-sm">URL</TabsTrigger>
            <TabsTrigger value="text" className="cursor-pointer text-xs sm:text-sm">Text</TabsTrigger>
            <TabsTrigger value="email" className="cursor-pointer text-xs sm:text-sm">Email</TabsTrigger>
            <TabsTrigger value="phone" className="cursor-pointer text-xs sm:text-sm">Phone</TabsTrigger>
          </TabsList>

          {/* URL Input */}
          <TabsContent value="url" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="qr-url-input" className="text-sm font-semibold">
                Target URL
              </Label>
              <Input
                id="qr-url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL (e.g. https://google.com)"
              />
            </div>
          </TabsContent>

          {/* Plain Text Input */}
          <TabsContent value="text" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="qr-text-input" className="text-sm font-semibold">
                Text Content
              </Label>
              <textarea
                id="qr-text-input"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type the message or text you want to encode..."
                className="w-full p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) text-sm focus:border-(--color-primary) focus:outline-none placeholder:text-(--color-text-muted)"
              />
            </div>
          </TabsContent>

          {/* Email Input */}
          <TabsContent value="email" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qr-email-address" className="text-sm font-semibold">
                  Email Address
                </Label>
                <Input
                  id="qr-email-address"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="e.g. support@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-email-subject" className="text-sm font-semibold">
                  Subject (Optional)
                </Label>
                <Input
                  id="qr-email-subject"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Inquiry about services"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-email-body" className="text-sm font-semibold">
                  Message Body (Optional)
                </Label>
                <textarea
                  id="qr-email-body"
                  rows={3}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="e.g. Write your email contents here..."
                  className="w-full p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) text-sm focus:border-(--color-primary) focus:outline-none placeholder:text-(--color-text-muted)"
                />
              </div>
            </div>
          </TabsContent>

          {/* Phone Input */}
          <TabsContent value="phone" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="qr-phone" className="text-sm font-semibold">
                Phone Number
              </Label>
              <Input
                id="qr-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +1234567890"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Customization Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl border border-(--color-border) bg-(--color-surface-alt)">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b border-(--color-border) pb-1">Appearance</h3>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-(--color-text-secondary)">
                <Label htmlFor="qr-size">Size</Label>
                <span className="font-mono">{size}x{size} px</span>
              </div>
              <input
                id="qr-size"
                type="range"
                min="128"
                max="1024"
                step="64"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-(--color-primary) cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="qr-correction" className="text-xs text-(--color-text-secondary)">
                Error Correction Level
              </Label>
              <select
                id="qr-correction"
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                className="block w-full px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-surface) focus:border-(--color-primary) focus:outline-none cursor-pointer"
              >
                <option value="L">L — Low (7% redundancy)</option>
                <option value="M">M — Medium (15% redundancy)</option>
                <option value="Q">Q — Quartile (25% redundancy)</option>
                <option value="H">H — High (30% redundancy)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b border-(--color-border) pb-1">Colors</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="qr-fg-color" className="text-xs text-(--color-text-secondary)">
                  Foreground Color
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="qr-fg-color"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-(--color-border) cursor-pointer bg-transparent"
                  />
                  <Input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="font-mono text-xs uppercase h-8 px-2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="qr-bg-color" className="text-xs text-(--color-text-secondary)">
                  Background Color
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="qr-bg-color"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-(--color-border) cursor-pointer bg-transparent"
                  />
                  <Input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="font-mono text-xs uppercase h-8 px-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Errors */}
        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Live Preview & Actions Panel */}
        {qrUrl && (
          <div className="flex flex-col items-center justify-center p-6 border border-(--color-border) rounded-2xl bg-(--color-surface) space-y-6">
            <div className="p-4 rounded-xl border border-(--color-border) bg-white shadow-inner flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR Code Preview" className="max-w-[200px] h-auto object-contain" />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button onClick={handleDownloadPNG} className="flex-1 sm:flex-none cursor-pointer">
                <Download className="w-4 h-4 mr-2" /> Download PNG
              </Button>
              <Button variant="secondary" onClick={handleDownloadSVG} className="flex-1 sm:flex-none cursor-pointer">
                <Download className="w-4 h-4 mr-2" /> Download SVG
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
