'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface Shade {
  weight: number
  hex: string
}

// Convert HEX to HSL
function hexToHsl(hex: string) {
  const cleanHex = hex.trim().replace(/^#/, '')
  if (cleanHex.length !== 6) return { h: 0, s: 0, l: 0 }
  
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

// Convert HSL to HEX
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (0 <= h && h < 60) { r = c; g = x; b = 0 }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0 }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x }

  const toHexVal = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }
  return `#${toHexVal(r)}${toHexVal(g)}${toHexVal(b)}`.toUpperCase()
}

export default function TailwindPaletteClient() {
  const tool = getToolById('tailwind-palette')!
  const [baseColor, setBaseColor] = useState('#3B82F6')
  const [shades, setShades] = useState<Shade[]>([])
  const [copiedWeight, setCopiedWeight] = useState<number | null>(null)
  const [copiedConfig, setCopiedConfig] = useState(false)

  const generateShades = () => {
    const hexPattern = /^#[a-fA-F0-9]{6}$/
    if (!hexPattern.test(baseColor)) return

    const { h, s } = hexToHsl(baseColor)

    // Tailwind standard lightness scale percentages for shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
    const lightnessMap: Record<number, number> = {
      50: 97,
      100: 92,
      200: 84,
      300: 74,
      400: 62,
      500: 50,
      600: 42,
      700: 32,
      800: 22,
      900: 14,
      950: 8,
    }

    const calculatedShades: Shade[] = Object.entries(lightnessMap).map(([weightStr, lightness]) => {
      const weight = Number(weightStr)
      // If weight is 500, use exact input color base for reference
      if (weight === 500) {
        return { weight, hex: baseColor.toUpperCase() }
      }
      return { weight, hex: hslToHex(h, s, lightness) }
    })

    setShades(calculatedShades)
  }

  useEffect(() => {
    generateShades()
  }, [baseColor])

  const handleCopySingle = async (hex: string, weight: number) => {
    await navigator.clipboard.writeText(hex)
    setCopiedWeight(weight)
    setTimeout(() => setCopiedWeight(null), 2000)
  }

  // Generate copyable JSON config code block
  const configCode = `"custom": {
${shades.map((s) => `  "${s.weight}": "${s.hex}"`).join(',\n')}
}`

  const handleCopyConfig = async () => {
    await navigator.clipboard.writeText(configCode)
    setCopiedConfig(true)
    setTimeout(() => setCopiedConfig(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Input parameters */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          <div className="w-12 h-12 rounded-lg border border-(--color-border) overflow-hidden relative shrink-0">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
              aria-label="Pick base color"
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="hex-input" className="text-xs font-semibold">Select Base Color (HEX)</Label>
            <Input
              id="hex-input"
              type="text"
              placeholder="#3B82F6"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="h-8 max-w-[120px] bg-(--color-surface) border-(--color-border) font-mono text-xs focus-visible:ring-(--color-primary)"
            />
          </div>
        </div>

        {/* Color Palette Grid */}
        {shades.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-(--color-border) animate-fade-in">
            <Label className="text-sm font-semibold">Generated Shades</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {shades.map((s) => (
                <div
                  key={s.weight}
                  onClick={() => handleCopySingle(s.hex, s.weight)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-(--color-border) bg-(--color-surface-alt) hover:border-(--color-primary) cursor-pointer transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-md border border-(--color-border) shrink-0"
                      style={{ backgroundColor: s.hex }}
                    />
                    <div>
                      <span className="text-[10px] font-bold text-(--color-text-muted)">{s.weight}</span>
                      <p className="text-xs font-mono font-bold text-(--color-text-primary) mt-0.5">{s.hex}</p>
                    </div>
                  </div>
                  <div className="text-(--color-text-muted)">
                    {copiedWeight === s.weight ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 hover:text-(--color-text-primary)" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Tailwind Config */}
        {shades.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-(--color-border)">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Tailwind Config Object</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyConfig}
                className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) cursor-pointer"
              >
                {copiedConfig ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500 font-semibold">Copied Config!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Config Code</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-[10px] text-(--color-text-primary) overflow-x-auto select-all leading-relaxed">
              {configCode}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
