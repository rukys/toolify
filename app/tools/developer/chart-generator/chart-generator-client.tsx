'use client'

import { useState, useRef, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BarChart3, Download, RefreshCw, AlertCircle } from 'lucide-react'

type ChartType = 'bar' | 'line' | 'pie'
type ColorTheme = 'blue' | 'green' | 'orange' | 'slate'

const DEFAULT_CSV = `Label,Value
January,1200
February,1800
March,950
April,2200
May,1600
June,2800`

const THEME_COLORS: Record<ColorTheme, string[]> = {
  blue: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  green: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
  orange: ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'],
  slate: ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'],
}

export default function ChartGeneratorClient() {
  const tool = getToolById('chart-generator')!
  const [csvText, setCsvText] = useState(DEFAULT_CSV)
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [theme, setTheme] = useState<ColorTheme>('blue')

  const [data, setData] = useState<{ label: string; value: number }[]>([])
  const [parseError, setParseError] = useState('')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Parse CSV when text changes
  const handleParse = () => {
    setParseError('')
    const lines = csvText.split('\n').map((line) => line.trim()).filter(Boolean)
    if (lines.length < 2) {
      setParseError('CSV must contain a header row and at least one data row.')
      setData([])
      return
    }

    const parsed: { label: string; value: number }[] = []
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim())
      if (parts.length >= 2) {
        const label = parts[0]
        const val = parseFloat(parts[1])
        if (!isNaN(val)) {
          parsed.push({ label, value: val })
        } else {
          setParseError(`Line ${i + 1}: Value "${parts[1]}" is not a valid number.`)
          setData([])
          return
        }
      }
    }

    if (parsed.length === 0) {
      setParseError('No valid data rows found in CSV.')
    } else {
      setData(parsed)
    }
  }

  useEffect(() => {
    handleParse()
  }, [csvText])

  // Re-draw chart on data/style changes
  useEffect(() => {
    drawChart()
  }, [data, chartType, theme])

  const drawChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (data.length === 0) return

    const width = canvas.width
    const height = canvas.height
    const padding = 50
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    const colors = THEME_COLORS[theme]

    if (chartType === 'bar' || chartType === 'line') {
      // 1. Draw Axes
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, height - padding)
      ctx.lineTo(width - padding, height - padding)
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Calculate boundaries
      const maxVal = Math.max(...data.map((d) => d.value)) * 1.15 || 10
      const minVal = 0

      // 2. Draw Y-Axis markings
      ctx.fillStyle = '#64748b'
      ctx.font = '10px monospace'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      
      const yTicks = 5
      for (let i = 0; i <= yTicks; i++) {
        const yVal = minVal + ((maxVal - minVal) / yTicks) * i
        const yPos = height - padding - (yVal / maxVal) * chartHeight
        
        ctx.fillText(Math.round(yVal).toString(), padding - 8, yPos)
        
        // Grid lines
        ctx.beginPath()
        ctx.moveTo(padding, yPos)
        ctx.lineTo(width - padding, yPos)
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // 3. Draw Data
      const barSpacing = chartWidth / data.length

      data.forEach((item, index) => {
        const xPos = padding + index * barSpacing + barSpacing / 2
        const yPos = height - padding - (item.value / maxVal) * chartHeight

        // Write X-Axis labels
        ctx.fillStyle = '#64748b'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(item.label, xPos, height - padding + 8)

        if (chartType === 'bar') {
          // Draw rect bar columns
          const barWidth = barSpacing * 0.6
          const color = colors[index % colors.length]
          ctx.fillStyle = color
          ctx.fillRect(xPos - barWidth / 2, yPos, barWidth, height - padding - yPos)
        }
      })

      if (chartType === 'line') {
        // Draw connecting curves line path
        ctx.beginPath()
        data.forEach((item, index) => {
          const xPos = padding + index * barSpacing + barSpacing / 2
          const yPos = height - padding - (item.value / maxVal) * chartHeight
          if (index === 0) {
            ctx.moveTo(xPos, yPos)
          } else {
            ctx.lineTo(xPos, yPos)
          }
        })
        ctx.strokeStyle = colors[0]
        ctx.lineWidth = 3
        ctx.stroke()

        // Draw points nodes
        data.forEach((item, index) => {
          const xPos = padding + index * barSpacing + barSpacing / 2
          const yPos = height - padding - (item.value / maxVal) * chartHeight
          ctx.beginPath()
          ctx.arc(xPos, yPos, 5, 0, 2 * Math.PI)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          ctx.strokeStyle = colors[0]
          ctx.lineWidth = 2
          ctx.stroke()
        })
      }

    } else if (chartType === 'pie') {
      // Pie chart drawing logic
      const total = data.reduce((sum, item) => sum + item.value, 0)
      const centerX = width / 2 - 40
      const centerY = height / 2
      const radius = Math.min(chartWidth, chartHeight) / 2 - 10

      let startAngle = 0

      data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI
        const color = colors[index % colors.length]

        // Draw Slice
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()

        // Draw Legend indicators
        const legendX = width - padding - 80
        const legendY = padding + index * 20
        ctx.fillStyle = color
        ctx.fillRect(legendX, legendY, 12, 12)

        ctx.fillStyle = '#475569'
        ctx.font = '10px monospace'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          `${item.label} (${((item.value / total) * 100).toFixed(0)}%)`,
          legendX + 18,
          legendY + 6
        )

        startAngle += sliceAngle
      })
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'chart-visualization.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleClear = () => {
    setCsvText('')
    setData([])
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Split inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSV Input */}
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="csv-chart-input" className="text-sm font-semibold">CSV Tabular Data</Label>
            <textarea
              id="csv-chart-input"
              rows={10}
              placeholder="Label,Value&#10;January,100..."
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted) resize-y flex-1"
            />
            {parseError && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-semibold mt-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
          </div>

          {/* Configuration style parameters */}
          <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) pb-2 border-b border-(--color-border)/50">
                Chart Customizations
              </h3>

              {/* Chart type selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-(--color-text-muted)">Graph Type Format</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { val: 'bar', label: 'Bar Chart' },
                    { val: 'line', label: 'Line Chart' },
                    { val: 'pie', label: 'Pie Chart' },
                  ] as { val: ChartType; label: string }[]).map((t) => (
                    <button
                      key={t.val}
                      onClick={() => setChartType(t.val)}
                      className={`text-xs font-semibold py-1.5 rounded-md border transition-all cursor-pointer ${
                        chartType === t.val
                          ? 'bg-(--color-primary) text-white border-transparent'
                          : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Themes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-(--color-text-muted)">Color Palette Theme</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {([
                    { val: 'blue', label: 'Ocean Blue' },
                    { val: 'green', label: 'Emerald' },
                    { val: 'orange', label: 'Sunset' },
                    { val: 'slate', label: 'Slate' },
                  ] as { val: ColorTheme; label: string }[]).map((c) => (
                    <button
                      key={c.val}
                      onClick={() => setTheme(c.val)}
                      className={`text-xs font-semibold py-1.5 rounded-md border transition-all cursor-pointer ${
                        theme === c.val
                          ? 'bg-(--color-primary) text-white border-transparent'
                          : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions button */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCsvText(DEFAULT_CSV)}
                className="text-xs h-9 border-(--color-border) hover:bg-(--color-surface) cursor-pointer"
              >
                Load Demo CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs h-9 text-(--color-text-muted) hover:text-red-500 cursor-pointer ml-auto"
              >
                Clear Input
              </Button>
            </div>
          </div>
        </div>

        {/* High-res Chart preview renderer */}
        {data.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-(--color-border) animate-fade-in">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Graph Visualization Preview</Label>
              <Button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white cursor-pointer text-xs h-8 px-3 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG Graph</span>
              </Button>
            </div>
            <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex justify-center items-center overflow-x-auto shadow-inner">
              <canvas
                ref={canvasRef}
                width={500}
                height={260}
                className="bg-(--color-surface) border border-(--color-border)/40 rounded-lg shadow-sm"
              />
            </div>
          </div>
        )}

      </div>
    </ToolLayout>
  )
}
