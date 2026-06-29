'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToCmyk,
  getContrastRatio,
  getTintsAndShades,
} from '@/lib/utils/color'
import { Copy, Check } from 'lucide-react'

interface CopiedState {
  [key: string]: boolean
}

export default function ColorClient() {
  const tool = getToolById('color-picker')!
  const [color, setColor] = useState('#2563eb') // Initial Hex Color
  const [rgb, setRgb] = useState({ r: 37, g: 99, b: 235 })
  const [hsl, setHsl] = useState({ h: 221, s: 83, l: 53 })
  const [cmyk, setCmyk] = useState({ c: 84, m: 58, y: 0, k: 8 })
  
  const [copiedMap, setCopiedMap] = useState<CopiedState>({})
  const [hexInput, setHexInput] = useState('#2563eb')
  const [rInput, setRInput] = useState('37')
  const [gInput, setGInput] = useState('99')
  const [bInput, setBInput] = useState('235')
  const [hInput, setHInput] = useState('221')
  const [sInput, setSInput] = useState('83')
  const [lInput, setLInput] = useState('53')

  // Sync color adjustments
  const syncColors = (hexVal: string) => {
    try {
      const rgbVal = hexToRgb(hexVal)
      const hslVal = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b)
      const cmykVal = rgbToCmyk(rgbVal.r, rgbVal.g, rgbVal.b)

      setColor(hexVal)
      setRgb(rgbVal)
      setHsl(hslVal)
      setCmyk(cmykVal)

      // Sync form inputs
      setHexInput(hexVal)
      setRInput(rgbVal.r.toString())
      setGInput(rgbVal.g.toString())
      setBInput(rgbVal.b.toString())
      setHInput(hslVal.h.toString())
      setSInput(hslVal.s.toString())
      setLInput(hslVal.l.toString())
    } catch {
      // Ignore invalid input while typing
    }
  }

  // Handle color wheel selection
  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    syncColors(e.target.value)
  }

  // Handle manual Hex string input
  const handleHexInputChange = (val: string) => {
    setHexInput(val)
    if (/^#[a-fA-F0-9]{6}$/.test(val) || /^#[a-fA-F0-9]{3}$/.test(val)) {
      syncColors(val)
    } else if (/^[a-fA-F0-9]{6}$/.test(val) || /^[a-fA-F0-9]{3}$/.test(val)) {
      syncColors('#' + val)
    }
  }

  // Handle manual RGB change
  const handleRgbFieldChange = (channel: 'r' | 'g' | 'b', val: string) => {
    if (channel === 'r') setRInput(val)
    if (channel === 'g') setGInput(val)
    if (channel === 'b') setBInput(val)

    const num = parseInt(val)
    if (!isNaN(num) && num >= 0 && num <= 255) {
      const nr = channel === 'r' ? num : rgb.r
      const ng = channel === 'g' ? num : rgb.g
      const nb = channel === 'b' ? num : rgb.b
      const hexVal = rgbToHex(nr, ng, nb)
      syncColors(hexVal)
    }
  }

  // Handle manual HSL change
  const handleHslFieldChange = (channel: 'h' | 's' | 'l', val: string) => {
    if (channel === 'h') setHInput(val)
    if (channel === 's') setSInput(val)
    if (channel === 'l') setLInput(val)

    const num = parseInt(val)
    if (!isNaN(num)) {
      const nh = channel === 'h' ? Math.max(0, Math.min(360, num)) : hsl.h
      const ns = channel === 's' ? Math.max(0, Math.min(100, num)) : hsl.s
      const nl = channel === 'l' ? Math.max(0, Math.min(100, num)) : hsl.l
      const rgbVal = hslToRgb(nh, ns, nl)
      const hexVal = rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b)
      syncColors(hexVal)
    }
  }

  const handleCopyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedMap((prev) => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [key]: false }))
    }, 2000)
  }

  // Get tints and shades
  const { tints, shades } = getTintsAndShades(color)
  const contrast = getContrastRatio(color)

  const getWCAGLabel = (ratio: number) => {
    if (ratio >= 7) return <span className="text-(--color-success) font-semibold">PASS (AAA)</span>
    if (ratio >= 4.5) return <span className="text-(--color-success) font-semibold">PASS (AA)</span>
    if (ratio >= 3) return <span className="text-amber-500 font-semibold">PASS (Large Text Only)</span>
    return <span className="text-(--color-danger) font-semibold">FAIL</span>
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Color Wheel & Live Preview Box */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Label className="text-sm font-semibold">Interactive Color Picker</Label>
            
            {/* Color Preview Block */}
            <div
              className="w-full h-44 rounded-2xl border border-(--color-border) shadow-inner flex flex-col justify-end p-4 transition-all duration-150"
              style={{ backgroundColor: color }}
            >
              <div className="bg-black/40 backdrop-blur-md rounded-lg p-2.5 text-white space-y-0.5 text-xs font-mono w-fit">
                <p>HEX: {color.toUpperCase()}</p>
                <p>RGB: rgb({rgb.r}, {rgb.g}, {rgb.b})</p>
                <p>HSL: hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</p>
              </div>
            </div>

            {/* Native Picker Trigger */}
            <div className="relative flex items-center gap-4">
              <input
                type="color"
                value={color}
                onChange={handlePickerChange}
                className="w-12 h-12 rounded-xl border border-(--color-border) cursor-pointer bg-transparent"
              />
              <div className="flex-1 space-y-1">
                <span className="text-xs text-(--color-text-secondary)">Click color box to open system color wheel picker</span>
              </div>
            </div>
          </div>

          {/* Manual Input Fields */}
          <div className="md:col-span-7 space-y-4">
            <Label className="text-sm font-semibold">Color Value Fields</Label>

            {/* HEX Input */}
            <div className="grid grid-cols-12 items-center gap-3">
              <span className="col-span-2 text-xs font-semibold text-(--color-text-secondary)">HEX</span>
              <div className="col-span-8 relative">
                <Input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexInputChange(e.target.value)}
                  className="font-mono text-sm uppercase pr-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="col-span-2 cursor-pointer h-9 px-0"
                onClick={() => handleCopyText('hex', color.toUpperCase())}
              >
                {copiedMap['hex'] ? <Check className="w-4 h-4 text-(--color-success)" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {/* RGB Input */}
            <div className="grid grid-cols-12 items-center gap-3">
              <span className="col-span-2 text-xs font-semibold text-(--color-text-secondary)">RGB</span>
              <div className="col-span-8 flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-(--color-text-muted) font-bold">R</span>
                  <Input
                    type="text"
                    value={rInput}
                    onChange={(e) => handleRgbFieldChange('r', e.target.value)}
                    className="font-mono text-xs pl-6 pr-1.5"
                  />
                </div>
                <div className="flex-1 relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-(--color-text-muted) font-bold">G</span>
                  <Input
                    type="text"
                    value={gInput}
                    onChange={(e) => handleRgbFieldChange('g', e.target.value)}
                    className="font-mono text-xs pl-6 pr-1.5"
                  />
                </div>
                <div className="flex-1 relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-(--color-text-muted) font-bold">B</span>
                  <Input
                    type="text"
                    value={bInput}
                    onChange={(e) => handleRgbFieldChange('b', e.target.value)}
                    className="font-mono text-xs pl-6 pr-1.5"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="col-span-2 cursor-pointer h-9 px-0"
                onClick={() => handleCopyText('rgb', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
              >
                {copiedMap['rgb'] ? <Check className="w-4 h-4 text-(--color-success)" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {/* HSL Input */}
            <div className="grid grid-cols-12 items-center gap-3">
              <span className="col-span-2 text-xs font-semibold text-(--color-text-secondary)">HSL</span>
              <div className="col-span-8 flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-(--color-text-muted) font-bold">H</span>
                  <Input
                    type="text"
                    value={hInput}
                    onChange={(e) => handleHslFieldChange('h', e.target.value)}
                    className="font-mono text-xs pl-6 pr-1.5"
                  />
                </div>
                <div className="flex-1 relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-(--color-text-muted) font-bold">S%</span>
                  <Input
                    type="text"
                    value={sInput}
                    onChange={(e) => handleHslFieldChange('s', e.target.value)}
                    className="font-mono text-xs pl-7 pr-1.5"
                  />
                </div>
                <div className="flex-1 relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-(--color-text-muted) font-bold">L%</span>
                  <Input
                    type="text"
                    value={lInput}
                    onChange={(e) => handleHslFieldChange('l', e.target.value)}
                    className="font-mono text-xs pl-7 pr-1.5"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="col-span-2 cursor-pointer h-9 px-0"
                onClick={() => handleCopyText('hsl', `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
              >
                {copiedMap['hsl'] ? <Check className="w-4 h-4 text-(--color-success)" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {/* CMYK & CSS Variable Values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 border border-(--color-border) rounded-xl bg-(--color-surface-alt) flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-(--color-text-secondary)">CMYK Format</p>
                  <p className="font-mono text-(--color-text-primary) mt-1">
                    cmyk({cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%)
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 cursor-pointer hover:bg-(--color-surface)"
                  onClick={() => handleCopyText('cmyk', `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`)}
                >
                  {copiedMap['cmyk'] ? <Check className="w-3.5 h-3.5 text-(--color-success)" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>

              <div className="p-3 border border-(--color-border) rounded-xl bg-(--color-surface-alt) flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-(--color-text-secondary)">CSS Property</p>
                  <p className="font-mono text-(--color-text-primary) mt-1">
                    --color-val: {color.toLowerCase()};
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 cursor-pointer hover:bg-(--color-surface)"
                  onClick={() => handleCopyText('cssvar', `--color-val: ${color.toLowerCase()};`)}
                >
                  {copiedMap['cssvar'] ? <Check className="w-3.5 h-3.5 text-(--color-success)" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tints & Shades Scale */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Tints & Shades Palette</Label>
          <div className="grid grid-cols-11 gap-1 h-12 rounded-xl overflow-hidden border border-(--color-border) shadow-sm">
            {/* Tints from light to dark */}
            {tints.map((tintHex) => (
              <button
                key={tintHex}
                onClick={() => syncColors(tintHex)}
                className="w-full h-full cursor-pointer relative group"
                style={{ backgroundColor: tintHex }}
                title={`Tint: ${tintHex.toUpperCase()}`}
              >
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/70 text-[8px] text-white py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  {tintHex.toUpperCase()}
                </span>
              </button>
            ))}
            {/* Middle original color */}
            <button
              onClick={() => syncColors(color)}
              className="w-full h-full cursor-pointer relative group border-2 border-black/40 dark:border-white/40 scale-y-105 z-10 shadow-md"
              style={{ backgroundColor: color }}
              title={`Base: ${color.toUpperCase()}`}
            >
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/70 text-[8px] text-white py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                {color.toUpperCase()}
              </span>
            </button>
            {/* Shades from light to dark */}
            {shades.map((shadeHex) => (
              <button
                key={shadeHex}
                onClick={() => syncColors(shadeHex)}
                className="w-full h-full cursor-pointer relative group"
                style={{ backgroundColor: shadeHex }}
                title={`Shade: ${shadeHex.toUpperCase()}`}
              >
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/70 text-[8px] text-white py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  {shadeHex.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-(--color-text-muted) text-center">Click any square block above to set it as active color.</p>
        </div>

        {/* Contrast Ratio & WCAG Checker */}
        <div className="space-y-3 pt-2">
          <Label className="text-sm font-semibold">Contrast Ratio & WCAG Conformance</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* White Text Contrast */}
            <div className="p-4 border border-(--color-border) rounded-xl bg-(--color-surface-alt) space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-(--color-text-secondary)">Against White Text (#FFFFFF)</span>
                {getWCAGLabel(contrast.white)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono">{contrast.white}:1</span>
                <span className="text-[10px] text-(--color-text-muted)">Minimum 4.5:1 (AA) / 7:1 (AAA)</span>
              </div>
              <div
                className="p-4 rounded-lg flex items-center justify-center text-white text-sm font-medium transition-all"
                style={{ backgroundColor: color }}
              >
                Example text on this background (White)
              </div>
            </div>

            {/* Black Text Contrast */}
            <div className="p-4 border border-(--color-border) rounded-xl bg-(--color-surface-alt) space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-(--color-text-secondary)">Against Black Text (#000000)</span>
                {getWCAGLabel(contrast.black)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono">{contrast.black}:1</span>
                <span className="text-[10px] text-(--color-text-muted)">Minimum 4.5:1 (AA) / 7:1 (AAA)</span>
              </div>
              <div
                className="p-4 rounded-lg flex items-center justify-center text-black text-sm font-medium transition-all"
                style={{ backgroundColor: color }}
              >
                Example text on this background (Black)
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
