'use client'

import { useState, useEffect, useRef } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

const PRESETS = [
  { name: 'Quadratic (x² - 2x - 3)', expr: 'x^2 - 2*x - 3' },
  { name: 'Sine Wave (2 * sin(x))', expr: '2 * sin(x)' },
  { name: 'Cosine Wave (3 * cos(x))', expr: '3 * cos(x)' },
  { name: 'Cubic (x³ - 3x)', expr: 'x^3 - 3*x' },
  { name: 'Absolute (abs(x))', expr: 'abs(x)' },
]

export default function MathPlotterClient() {
  const tool = getToolById('math-plotter')!
  const [expr, setExpr] = useState('x^2 - 2*x - 3')
  const [scale, setScale] = useState(40) // Pixels per unit
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const canvasWidth = 400
  const canvasHeight = 300

  // Evaluate math expression securely
  const evaluateExpr = (expression: string, xVal: number): number => {
    let clean = expression.toLowerCase().replace(/\s+/g, '')
    if (!clean) return 0

    // Strict validation whitelist for safe calculation
    const allowedChars = /^[0-9x+\-*/().^]+$/
    const sanitized = clean
      .replace(/sin/g, '')
      .replace(/cos/g, '')
      .replace(/tan/g, '')
      .replace(/abs/g, '')
      .replace(/sqrt/g, '')
      .replace(/pi/g, '')
      .replace(/e/g, '')

    if (!allowedChars.test(sanitized)) {
      throw new Error('Unsupported operator or syntax. Only x, numbers, basic ops, and sin/cos/tan/abs/sqrt are supported.')
    }

    let executable = clean
      .replace(/pi/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/sqrt\(/g, 'Math.sqrt(')

    while (executable.includes('^')) {
      executable = executable.replace(/([x0-9a-zA-Z().]+)\^([x0-9a-zA-Z().]+)/, 'Math.pow($1,$2)')
    }

    // Evaluate in function scope
    const func = new Function('x', `return (${executable})`)
    const result = func(xVal)
    if (typeof result !== 'number' || isNaN(result)) return 0
    return result
  }

  const drawGraph = () => {
    setError('')
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2

    // 1. Draw Grid Lines
    ctx.strokeStyle = '#27272A'
    ctx.lineWidth = 0.5
    ctx.beginPath()

    // Vertical grid lines
    for (let x = centerX % scale; x < canvasWidth; x += scale) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
    }
    // Horizontal grid lines
    for (let y = centerY % scale; y < canvasHeight; y += scale) {
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
    }
    ctx.stroke()

    // 2. Draw Main Axes (X & Y)
    ctx.strokeStyle = '#71717A'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    // X Axis
    ctx.moveTo(0, centerY)
    ctx.lineTo(canvasWidth, centerY)
    // Y Axis
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, canvasHeight)
    ctx.stroke()

    // Axis Labels
    ctx.fillStyle = '#A1A1AA'
    ctx.font = '10px monospace'
    ctx.fillText('x', canvasWidth - 10, centerY - 5)
    ctx.fillText('y', centerX + 5, 12)

    // 3. Plot Math Function Curve
    ctx.strokeStyle = '#2563EB'
    ctx.lineWidth = 2.5
    ctx.beginPath()

    let firstPoint = true
    try {
      for (let px = 0; px < canvasWidth; px++) {
        // Map pixel x to cartesian coordinate value x
        const x = (px - centerX) / scale
        const y = evaluateExpr(expr, x)
        
        // Map cartesian coordinate y to pixel coordinate y
        const py = centerY - y * scale

        // Only draw points inside canvas area bounds
        if (py >= 0 && py <= canvasHeight) {
          if (firstPoint) {
            ctx.moveTo(px, py)
            firstPoint = false
          } else {
            ctx.lineTo(px, py)
          }
        } else {
          firstPoint = true // Reset segment to prevent line drawing across margins
        }
      }
      ctx.stroke()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error evaluating math expression.')
    }
  }

  useEffect(() => {
    drawGraph()
  }, [expr, scale])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Formula input */}
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="expr-input" className="text-sm font-semibold">Enter algebraic function f(x)</Label>
            <Input
              id="expr-input"
              type="text"
              placeholder="e.g. x^2 - 2*x - 3"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              className="bg-(--color-surface-alt) border-(--color-border) font-mono text-sm focus-visible:ring-(--color-primary)"
            />
          </div>

          {/* Zoom scale slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <Label htmlFor="scale-slider">Zoom scale</Label>
              <span className="text-(--color-primary) font-bold">{scale}px/unit</span>
            </div>
            <input
              id="scale-slider"
              type="range"
              min={20}
              max={100}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
            />
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-(--color-text-muted)">Presets:</Label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setExpr(p.expr)}
                className="text-[10px] font-semibold py-1.5 px-3 rounded-lg border border-(--color-border) bg-(--color-surface-alt) hover:bg-(--color-surface) cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Visual Graph Box */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-(--color-border) bg-(--color-surface)">
          <div className="border border-(--color-border) bg-(--color-surface-alt) rounded-lg overflow-hidden shadow-xs">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="block"
            />
          </div>
          <span className="text-[10px] text-(--color-text-muted) font-semibold mt-3">2D Coordinate Graph View</span>
        </div>
      </div>
    </ToolLayout>
  )
}
