'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

const PRESETS = [
  { name: 'Curve Wave', d: 'M 10 80 Q 52.5 10, 95 80 T 180 80' },
  { name: 'Love Heart', d: 'M 50 30 C 50 30 50 15 35 15 C 20 15 20 35 20 35 C 20 55 50 75 50 85 C 50 75 80 55 80 35 C 80 35 80 15 65 15 C 50 15 50 30 50 30 Z' },
  { name: 'Star Shape', d: 'M 50 5 L 63 35 L 95 35 L 70 55 L 80 85 L 50 68 L 20 85 L 30 55 L 5 35 L 37 35 Z' },
  { name: 'Infinity Loop', d: 'M 50 50 C 20 20 20 80 50 50 C 80 20 80 80 50 50 Z' },
]

export default function SVGVisualizerClient() {
  const tool = getToolById('svg-visualizer')!
  const [pathD, setPathD] = useState('M 10 80 Q 52.5 10, 95 80 T 180 80')
  const [strokeColor, setStrokeColor] = useState('#2563EB')
  const [fillColor, setFillColor] = useState('none')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [viewBoxSize, setViewBoxSize] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [copied, setCopied] = useState(false)

  // Construct copyable code snippet
  const svgOutputCode = `<svg viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <path 
    d="${pathD}" 
    stroke="${strokeColor}" 
    fill="${fillColor}" 
    stroke-width="${strokeWidth}" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  />
</svg>`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(svgOutputCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setPathD('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Presets and Inputs */}
        <div className="space-y-3">
          <Label htmlFor="svg-path-input" className="text-sm font-semibold">SVG Path Data (d attribute)</Label>
          <div className="flex gap-2">
            <Input
              id="svg-path-input"
              type="text"
              placeholder="e.g. M 10 10 L 90 90 Z"
              value={pathD}
              onChange={(e) => setPathD(e.target.value)}
              className="flex-1 bg-(--color-surface-alt) border-(--color-border) font-mono text-xs focus-visible:ring-(--color-primary)"
            />
            <Button variant="outline" onClick={handleClear} className="border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer">
              Clear
            </Button>
          </div>
          
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-(--color-text-muted) self-center mr-1">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setPathD(p.d)}
                className="text-[10px] font-semibold py-1 px-2.5 rounded-lg border border-(--color-border) bg-(--color-surface-alt) hover:bg-(--color-surface) cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Styling controls grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          {/* Stroke color */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Stroke color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-8 h-8 rounded border border-(--color-border) cursor-pointer p-0 bg-transparent"
                aria-label="Pick stroke color"
              />
              <Input
                type="text"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="h-8 text-xs font-mono border-(--color-border) bg-(--color-surface) focus-visible:ring-(--color-primary)"
              />
            </div>
          </div>

          {/* Fill color */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Fill color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={fillColor === 'none' ? '#000000' : fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                disabled={fillColor === 'none'}
                className="w-8 h-8 rounded border border-(--color-border) cursor-pointer p-0 bg-transparent disabled:opacity-50"
                aria-label="Pick fill color"
              />
              <select
                value={fillColor === 'none' ? 'none' : 'color'}
                onChange={(e) => setFillColor(e.target.value === 'none' ? 'none' : '#3B82F6')}
                className="h-8 rounded-md border border-(--color-border) bg-(--color-surface) px-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) text-(--color-text-primary) flex-1"
              >
                <option value="none">None (Transparent)</option>
                <option value="color">Custom Color</option>
              </select>
            </div>
          </div>

          {/* Stroke width */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <Label htmlFor="stroke-width-slider">Stroke Width</Label>
              <span className="text-(--color-primary) font-bold">{strokeWidth}px</span>
            </div>
            <input
              id="stroke-width-slider"
              type="range"
              min={1}
              max={15}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
            />
          </div>

          {/* ViewBox size */}
          <div className="space-y-1">
            <Label htmlFor="viewbox-select" className="text-xs font-semibold text-(--color-text-muted)">ViewBox Resolution</Label>
            <select
              id="viewbox-select"
              value={viewBoxSize}
              onChange={(e) => setViewBoxSize(Number(e.target.value))}
              className="w-full h-8 rounded-md border border-(--color-border) bg-(--color-surface) px-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) text-(--color-text-primary)"
            >
              <option value={100}>100 x 100</option>
              <option value={200}>200 x 200</option>
              <option value={500}>500 x 500</option>
            </select>
          </div>
        </div>

        {/* Visual Canvas Playground */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-semibold">Interactive Sandbox Preview</Label>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-(--color-text-secondary) cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-(--color-border) text-(--color-primary) focus:ring-(--color-primary) cursor-pointer"
              />
              <span>Display Grid Coordinates</span>
            </label>
          </div>

          <div className="p-6 rounded-xl border border-(--color-border) bg-(--color-surface) min-h-[300px] flex items-center justify-center relative overflow-hidden">
            
            {/* Grid Pattern overlay */}
            {showGrid && (
              <div 
                className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]"
                style={{
                  maskImage: 'radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)',
                  WebkitMaskImage: 'radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)'
                }}
              />
            )}

            {/* SVG Renderer container */}
            <div className="w-56 h-56 border border-(--color-border)/30 bg-(--color-surface-alt)/40 rounded-lg flex items-center justify-center p-2 z-10 shadow-xs relative">
              {pathD && (
                <svg
                  viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d={pathD}
                    stroke={strokeColor}
                    fill={fillColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Code Output */}
        {pathD && (
          <div className="space-y-2 pt-4 border-t border-(--color-border)">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Copyable SVG Element Code</Label>
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
                    <span>Copy SVG Code</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-[10px] text-(--color-text-primary) overflow-x-auto select-all leading-relaxed">
              {svgOutputCode}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
