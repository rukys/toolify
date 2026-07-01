'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check, Copy, Grid } from 'lucide-react'

type PatternType = 'dots' | 'lines' | 'chevrons' | 'grids'

export default function PatternGeneratorClient() {
  const tool = getToolById('pattern-generator')!

  const [patternType, setPatternType] = useState<PatternType>('dots')
  const [scale, setScale] = useState(24)
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [strokeColor, setStrokeColor] = useState('#3b82f6')
  const [bgColor, setBgColor] = useState('#ffffff')

  const [svgCode, setSvgCode] = useState('')
  const [cssCode, setCssCode] = useState('')
  const [copiedSvg, setCopiedSvg] = useState(false)
  const [copiedCss, setCopiedCss] = useState(false)

  // Recalculate SVG and CSS background on parameters change
  useEffect(() => {
    let innerSvg = ''

    if (patternType === 'dots') {
      innerSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='${scale}' height='${scale}'>
  <rect width='100%' height='100%' fill='${bgColor}'/>
  <circle cx='${scale / 2}' cy='${scale / 2}' r='${strokeWidth}' fill='${strokeColor}'/>
</svg>`
    } else if (patternType === 'lines') {
      innerSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='${scale}' height='${scale}'>
  <rect width='100%' height='100%' fill='${bgColor}'/>
  <line x1='0' y1='${scale / 2}' x2='${scale}' y2='${scale / 2}' stroke='${strokeColor}' stroke-width='${strokeWidth}'/>
</svg>`
    } else if (patternType === 'chevrons') {
      innerSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='${scale}' height='${scale}'>
  <rect width='100%' height='100%' fill='${bgColor}'/>
  <path d='M0,${scale / 4} L${scale / 2},${scale / 2} L${scale},${scale / 4}' fill='none' stroke='${strokeColor}' stroke-width='${strokeWidth}'/>
</svg>`
    } else if (patternType === 'grids') {
      innerSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='${scale}' height='${scale}'>
  <rect width='100%' height='100%' fill='${bgColor}'/>
  <rect x='0' y='0' width='${scale}' height='${scale}' fill='none' stroke='${strokeColor}' stroke-width='${strokeWidth}'/>
</svg>`
    }

    setSvgCode(innerSvg)

    // Encode SVG safely to use in CSS background url
    const encoded = encodeURIComponent(innerSvg.trim())
      .replace(/'/g, "%27")
      .replace(/"/g, "%22")
    
    setCssCode(`background-image: url("data:image/svg+xml;utf8,${encoded}");`)
  }, [patternType, scale, strokeWidth, strokeColor, bgColor])

  const handleCopy = async (text: string, isSvg: boolean) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    if (isSvg) {
      setCopiedSvg(true)
      setTimeout(() => setCopiedSvg(false), 2000)
    } else {
      setCopiedCss(true)
      setTimeout(() => setCopiedCss(false), 2000)
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Configurations column */}
        <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) pb-2 border-b border-(--color-border)/50">
            Geometric Configurations
          </h3>

          {/* Pattern Type select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Pattern Layout</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {([
                { val: 'dots', label: 'Dots Grid' },
                { val: 'lines', label: 'Horiz Lines' },
                { val: 'chevrons', label: 'Chevrons' },
                { val: 'grids', label: 'Square Grid' },
              ] as { val: PatternType; label: string }[]).map((p) => (
                <button
                  key={p.val}
                  onClick={() => setPatternType(p.val)}
                  className={`text-xs font-semibold py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    patternType === p.val
                      ? 'bg-(--color-primary) text-white border-transparent'
                      : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scale Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <Label htmlFor="scale-slider">Pattern Size Scale</Label>
              <span className="text-(--color-primary) font-bold">{scale}px</span>
            </div>
            <input
              id="scale-slider"
              type="range"
              min={8}
              max={80}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
            />
          </div>

          {/* Stroke Width Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <Label htmlFor="stroke-width-slider">Stroke Thickness</Label>
              <span className="text-(--color-primary) font-bold">{strokeWidth}px</span>
            </div>
            <input
              id="stroke-width-slider"
              type="range"
              min={1}
              max={8}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
            />
          </div>

          {/* Color pickers */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="stroke-color-picker" className="text-xs font-semibold text-(--color-text-muted)">Stroke / Dot Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  id="stroke-color-picker"
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-8 h-8 rounded border border-(--color-border) cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-(--color-text-secondary)">{strokeColor.toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pattern-bg-color-picker" className="text-xs font-semibold text-(--color-text-muted)">Background Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  id="pattern-bg-color-picker"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-(--color-border) cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-(--color-text-secondary)">{bgColor.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Repeating background preview */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Tiled Background Preview</Label>
            <div
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svgCode.trim())}")`,
                backgroundSize: `${scale}px ${scale}px`,
              }}
              className="rounded-xl border border-(--color-border) min-h-[160px] shadow-inner transition-all"
            />
          </div>

          {/* Output panels */}
          <div className="space-y-4">
            {/* SVG Output */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-(--color-text-muted)">Raw SVG XML Code</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(svgCode, true)}
                  className="h-7 text-xs text-(--color-text-secondary) cursor-pointer"
                >
                  {copiedSvg ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className={copiedSvg ? 'text-green-500 font-semibold' : ''}>{copiedSvg ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
              <pre className="p-3 rounded-lg border border-(--color-border) bg-(--color-surface-alt) font-mono text-[9px] text-(--color-text-primary) overflow-x-auto select-all max-h-[85px] leading-relaxed">
                {svgCode}
              </pre>
            </div>

            {/* CSS Output */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-(--color-text-muted)">Copyable Inline CSS Background</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(cssCode, false)}
                  className="h-7 text-xs text-(--color-text-secondary) cursor-pointer"
                >
                  {copiedCss ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className={copiedCss ? 'text-green-500 font-semibold' : ''}>{copiedCss ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
              <pre className="p-3 rounded-lg border border-(--color-border) bg-(--color-surface-alt) font-mono text-[9px] text-(--color-text-primary) overflow-x-auto select-all max-h-[85px] leading-relaxed">
                {cssCode}
              </pre>
            </div>
          </div>

        </div>

      </div>
    </ToolLayout>
  )
}
