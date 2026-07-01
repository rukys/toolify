'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'

export default function GlassmorphismClient() {
  const tool = getToolById('glassmorphism')!

  // Glass parameters
  const [blur, setBlur] = useState(12)
  const [opacity, setOpacity] = useState(0.2)
  const [borderOpacity, setBorderOpacity] = useState(0.15)
  const [shadowOpacity, setShadowOpacity] = useState(0.08)
  const [borderRadius, setBorderRadius] = useState(16)
  
  const [bgColor, setBgColor] = useState('#ffffff')
  const [borderColor, setBorderColor] = useState('#ffffff')

  const [copied, setCopied] = useState(false)

  // Hex to RGB parser helper
  const hexToRgb = (hex: string): string => {
    const clean = hex.replace('#', '')
    const r = parseInt(clean.substring(0, 2), 16)
    const g = parseInt(clean.substring(2, 4), 16)
    const b = parseInt(clean.substring(4, 6), 16)
    return `${r}, ${g}, ${b}`
  }

  const rgbBg = hexToRgb(bgColor)
  const rgbBorder = hexToRgb(borderColor)

  const glassStyle = {
    background: `rgba(${rgbBg}, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(${rgbBorder}, ${borderOpacity})`,
    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, ${shadowOpacity})`,
    borderRadius: `${borderRadius}px`,
  }

  const cssCode = `/* Glassmorphism CSS Snippet */
.glass-card {
  background: rgba(${rgbBg}, ${opacity});
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border: 1px solid rgba(${rgbBorder}, ${borderOpacity});
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, ${shadowOpacity});
  border-radius: ${borderRadius}px;
}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cssCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Configuration Panel */}
        <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) pb-2 border-b border-(--color-border)/50">
            Glassmorphism Customizer
          </h3>

          {/* Blur Range */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <Label htmlFor="blur-slider">Backdrop Blur</Label>
              <span className="text-(--color-primary) font-bold">{blur}px</span>
            </div>
            <input
              id="blur-slider"
              type="range"
              min={0}
              max={40}
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
            />
          </div>

          {/* Opacity Range */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <Label htmlFor="opacity-slider">Card Opacity</Label>
              <span className="text-(--color-primary) font-bold">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              id="opacity-slider"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
            />
          </div>

          {/* Border Opacity */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <Label htmlFor="border-opacity-slider">Border Opacity</Label>
              <span className="text-(--color-primary) font-bold">{Math.round(borderOpacity * 100)}%</span>
            </div>
            <input
              id="border-opacity-slider"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={borderOpacity}
              onChange={(e) => setBorderOpacity(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
            />
          </div>

          {/* Border Radius */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <Label htmlFor="border-radius-slider">Corner Radius</Label>
              <span className="text-(--color-primary) font-bold">{borderRadius}px</span>
            </div>
            <input
              id="border-radius-slider"
              type="range"
              min={0}
              max={40}
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
            />
          </div>

          {/* Colors pickers row */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="bg-color-picker" className="text-xs font-semibold text-(--color-text-muted)">Card Fill Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  id="bg-color-picker"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-(--color-border) cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-(--color-text-secondary)">{bgColor.toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="border-color-picker" className="text-xs font-semibold text-(--color-text-muted)">Border Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  id="border-color-picker"
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-8 h-8 rounded border border-(--color-border) cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-(--color-text-secondary)">{borderColor.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview & CSS Output */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Glass Preview window */}
          <div className="relative rounded-xl border border-(--color-border) overflow-hidden min-h-[220px] flex items-center justify-center p-6 bg-slate-950">
            {/* Mesh background circles */}
            <div className="absolute top-4 left-6 w-24 h-24 rounded-full bg-blue-500 blur-xl opacity-60 animate-pulse" />
            <div className="absolute bottom-6 right-10 w-28 h-28 rounded-full bg-pink-500 blur-xl opacity-50" />
            <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-emerald-500 blur-lg opacity-40" />

            {/* Glass Card */}
            <div style={glassStyle} className="relative z-10 w-full max-w-sm p-6 text-white text-center space-y-2 transition-all">
              <h4 className="text-base font-extrabold tracking-wide drop-shadow-md">Glassmorphic Card</h4>
              <p className="text-xs text-white/80 leading-relaxed drop-shadow-sm">
                This is a live preview showing how your custom glass style renders against colored background layers.
              </p>
            </div>
          </div>

          {/* Copyable CSS */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold text-(--color-text-muted)">Generated CSS Snippet</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs text-(--color-text-secondary) cursor-pointer flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className={copied ? 'text-green-500 font-semibold' : ''}>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
            <pre className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-[10px] text-(--color-text-primary) overflow-x-auto select-all leading-relaxed">
              {cssCode}
            </pre>
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
