'use client'

import { useState, useEffect, useRef } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Copy, Check, Play } from 'lucide-react'

const PRESETS = [
  { name: 'Ease', values: [0.25, 0.1, 0.25, 1.0] },
  { name: 'Linear', values: [0.0, 0.0, 1.0, 1.0] },
  { name: 'Ease In', values: [0.42, 0.0, 1.0, 1.0] },
  { name: 'Ease Out', values: [0.0, 0.0, 0.58, 1.0] },
  { name: 'Ease In Out', values: [0.42, 0.0, 0.58, 1.0] },
  { name: 'Bouncy Elastic', values: [0.68, -0.6, 0.32, 1.6] },
]

export default function CubicBezierClient() {
  const tool = getToolById('cubic-bezier')!
  const [coords, setCoords] = useState({ x1: 0.42, y1: 0.0, x2: 0.58, y2: 1.0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDragging = useRef<1 | 2 | null>(null)

  const canvasSize = 220
  const padding = 30
  const graphSize = canvasSize - padding * 2

  // Draw the bezier curve and control handles
  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // Helper: Map 0-1 values to Canvas coordinates
    const toCanvasX = (val: number) => padding + val * graphSize
    const toCanvasY = (val: number) => canvasSize - padding - val * graphSize

    // Draw background boundary grid
    ctx.strokeStyle = '#27272A'
    ctx.lineWidth = 1
    ctx.strokeRect(padding, padding, graphSize, graphSize)

    // Draw grid lines
    ctx.beginPath()
    ctx.setLineDash([4, 4])
    ctx.moveTo(padding, toCanvasY(0.5))
    ctx.lineTo(canvasSize - padding, toCanvasY(0.5))
    ctx.stroke()
    ctx.setLineDash([])

    const x0 = toCanvasX(0)
    const y0 = toCanvasY(0)
    const x1 = toCanvasX(coords.x1)
    const y1 = toCanvasY(coords.y1)
    const x2 = toCanvasX(coords.x2)
    const y2 = toCanvasY(coords.y2)
    const x3 = toCanvasX(1)
    const y3 = toCanvasY(1)

    // Draw handle lines
    ctx.strokeStyle = '#71717A'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.moveTo(x3, y3)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    // Draw Bezier Curve
    ctx.strokeStyle = '#2563EB'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3)
    ctx.stroke()

    // Draw Handle Points (Circle 1)
    ctx.fillStyle = '#10B981'
    ctx.beginPath()
    ctx.arc(x1, y1, 7, 0, 2 * Math.PI)
    ctx.fill()
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Draw Handle Points (Circle 2)
    ctx.fillStyle = '#EF4444'
    ctx.beginPath()
    ctx.arc(x2, y2, 7, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }

  useEffect(() => {
    drawGraph()
  }, [coords])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const toCanvasX = (val: number) => padding + val * graphSize
    const toCanvasY = (val: number) => canvasSize - padding - val * graphSize

    const cx1 = toCanvasX(coords.x1)
    const cy1 = toCanvasY(coords.y1)
    const cx2 = toCanvasX(coords.x2)
    const cy2 = toCanvasY(coords.y2)

    // Check click proximity (within 12px)
    const dist1 = Math.hypot(x - cx1, y - cy1)
    const dist2 = Math.hypot(x - cx2, y - cy2)

    if (dist1 < 12) {
      isDragging.current = 1
    } else if (dist2 < 12) {
      isDragging.current = 2
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const rawX = e.clientX - rect.left
    const rawY = e.clientY - rect.top

    // Map canvas coordinates to 0-1 range
    const valX = Math.min(1, Math.max(0, (rawX - padding) / graphSize))
    // Allow Y coordinates to swing outside bounds for spring ease-effects
    const valY = Math.min(1.5, Math.max(-0.5, (canvasSize - padding - rawY) / graphSize))

    setCoords((prev) => {
      if (isDragging.current === 1) {
        return { ...prev, x1: Number(valX.toFixed(2)), y1: Number(valY.toFixed(2)) }
      } else {
        return { ...prev, x2: Number(valX.toFixed(2)), y2: Number(valY.toFixed(2)) }
      }
    })
  }

  const handleMouseUp = () => {
    isDragging.current = null
  }

  const handleCopy = async () => {
    const code = `cubic-bezier(${coords.x1}, ${coords.y1}, ${coords.x2}, ${coords.y2})`
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const triggerAnimation = () => {
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 1200)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Interaction Panel */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
          
          {/* Canvas display */}
          <div className="flex flex-col items-center gap-2">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Drag handles to adjust curves</Label>
            <div className="border border-(--color-border) bg-(--color-surface) rounded-xl overflow-hidden shadow-sm">
              <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="cursor-crosshair block"
              />
            </div>
          </div>

          {/* Presets and numeric display */}
          <div className="flex-1 w-full space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-(--color-text-muted)">Curve Presets:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setCoords({ x1: p.values[0], y1: p.values[1], x2: p.values[2], y2: p.values[3] })}
                    className="text-[11px] font-semibold text-left p-2 rounded-lg border border-(--color-border) bg-(--color-surface-alt) hover:bg-(--color-surface) cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Read-only Numeric Coordinates */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-(--color-border)">
              <div className="p-2 rounded-lg bg-(--color-surface-alt) text-center">
                <span className="text-[9px] uppercase font-bold text-green-500">X1 (Time)</span>
                <p className="text-xs font-mono font-bold mt-0.5">{coords.x1}</p>
              </div>
              <div className="p-2 rounded-lg bg-(--color-surface-alt) text-center">
                <span className="text-[9px] uppercase font-bold text-green-500">Y1 (Progress)</span>
                <p className="text-xs font-mono font-bold mt-0.5">{coords.y1}</p>
              </div>
              <div className="p-2 rounded-lg bg-(--color-surface-alt) text-center">
                <span className="text-[9px] uppercase font-bold text-red-500">X2 (Time)</span>
                <p className="text-xs font-mono font-bold mt-0.5">{coords.x2}</p>
              </div>
              <div className="p-2 rounded-lg bg-(--color-surface-alt) text-center">
                <span className="text-[9px] uppercase font-bold text-red-500">Y2 (Progress)</span>
                <p className="text-xs font-mono font-bold mt-0.5">{coords.y2}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Animation Preview Box */}
        <div className="space-y-3 pt-4 border-t border-(--color-border)">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-semibold">Animation Tester</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={triggerAnimation}
              disabled={isPlaying}
              className="flex items-center gap-1 text-xs border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Animate Box</span>
            </Button>
          </div>
          <div className="h-16 rounded-xl border border-(--color-border) bg-(--color-surface-alt) relative overflow-hidden flex items-center px-4">
            <div
              className={`w-8 h-8 rounded-lg bg-(--color-primary) flex items-center justify-center text-white font-mono text-[10px] font-bold shadow-sm ${
                isPlaying ? 'translate-x-[calc(100vw-120px)] sm:translate-x-[500px]' : ''
              }`}
              style={{
                transitionProperty: isPlaying ? 'transform' : 'none',
                transitionDuration: '1.2s',
                transitionTimingFunction: `cubic-bezier(${coords.x1}, ${coords.y1}, ${coords.x2}, ${coords.y2})`,
              }}
            >
              Box
            </div>
          </div>
        </div>

        {/* Code Output */}
        <div className="space-y-2 pt-4 border-t border-(--color-border)">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-semibold">CSS Transition Timing Property</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-(--color-text-secondary) cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500">Copied Code!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy CSS Value</span>
                </>
              )}
            </Button>
          </div>
          <pre className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs text-(--color-text-primary) break-all select-all">
            transition-timing-function: cubic-bezier({coords.x1}, {coords.y1}, {coords.x2}, {coords.y2});
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}
