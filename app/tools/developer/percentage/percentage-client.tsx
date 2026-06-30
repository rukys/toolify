'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

// Helper: Greatest Common Divisor
function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

export default function PercentageClient() {
  const tool = getToolById('percentage')!

  // Panel 1: What is X% of Y?
  const [p1Pct, setP1Pct] = useState('15')
  const [p1Val, setP1Val] = useState('200')
  const [p1Result, setP1Result] = useState('30')

  // Panel 2: X is what percent of Y?
  const [p2Val1, setP2Val1] = useState('50')
  const [p2Val2, setP2Val2] = useState('200')
  const [p2Result, setP2Result] = useState('25')

  // Panel 3: Percentage Change from X to Y
  const [p3Start, setP3Start] = useState('100')
  const [p3End, setP3End] = useState('150')
  const [p3Result, setP3Result] = useState('50')
  const [p3Direction, setP3Direction] = useState<'increase' | 'decrease' | 'none'>('increase')

  // Panel 4: Aspect Ratio Simplifier
  const [p4Width, setP4Width] = useState('1920')
  const [p4Height, setP4Height] = useState('1080')
  const [p4Result, setP4Result] = useState('16:9')

  // Calculate Panel 1
  useEffect(() => {
    const pct = parseFloat(p1Pct)
    const val = parseFloat(p1Val)
    if (!isNaN(pct) && !isNaN(val)) {
      setP1Result(((pct / 100) * val).toFixed(2).replace(/\.00$/, ''))
    } else {
      setP1Result('—')
    }
  }, [p1Pct, p1Val])

  // Calculate Panel 2
  useEffect(() => {
    const val1 = parseFloat(p2Val1)
    const val2 = parseFloat(p2Val2)
    if (!isNaN(val1) && !isNaN(val2) && val2 !== 0) {
      setP2Result(((val1 / val2) * 100).toFixed(2).replace(/\.00$/, ''))
    } else {
      setP2Result('—')
    }
  }, [p2Val1, p2Val2])

  // Calculate Panel 3
  useEffect(() => {
    const start = parseFloat(p3Start)
    const end = parseFloat(p3End)
    if (!isNaN(start) && !isNaN(end) && start !== 0) {
      const diff = end - start
      const pct = (diff / start) * 100
      setP3Result(Math.abs(pct).toFixed(2).replace(/\.00$/, ''))
      setP3Direction(pct > 0 ? 'increase' : pct < 0 ? 'decrease' : 'none')
    } else {
      setP3Result('—')
      setP3Direction('none')
    }
  }, [p3Start, p3End])

  // Calculate Panel 4
  useEffect(() => {
    const w = parseInt(p4Width, 10)
    const h = parseInt(p4Height, 10)
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      const divisor = gcd(w, h)
      setP4Result(`${w / divisor}:${h / divisor}`)
    } else {
      setP4Result('—')
    }
  }, [p4Width, p4Height])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Panel 1: Percentage of Value */}
          <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-(--color-text-secondary)">
              1. Percentage of Value
            </h3>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <span className="text-xs font-medium text-(--color-text-muted) shrink-0">What is</span>
              <Input
                type="number"
                value={p1Pct}
                onChange={(e) => setP1Pct(e.target.value)}
                className="w-20 text-center font-mono h-8 bg-(--color-surface) border-(--color-border)"
              />
              <span className="text-xs font-medium text-(--color-text-muted) shrink-0">% of</span>
              <Input
                type="number"
                value={p1Val}
                onChange={(e) => setP1Val(e.target.value)}
                className="w-28 text-center font-mono h-8 bg-(--color-surface) border-(--color-border)"
              />
            </div>
            <div className="pt-2 border-t border-(--color-border) flex justify-between items-center">
              <span className="text-xs font-bold text-(--color-text-muted)">Result:</span>
              <span className="font-mono text-sm font-bold text-(--color-primary)">{p1Result}</span>
            </div>
          </div>

          {/* Panel 2: Percentage Ratio */}
          <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-(--color-text-secondary)">
              2. Percentage Ratio
            </h3>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Input
                type="number"
                value={p2Val1}
                onChange={(e) => setP2Val1(e.target.value)}
                className="w-24 text-center font-mono h-8 bg-(--color-surface) border-(--color-border)"
              />
              <span className="text-xs font-medium text-(--color-text-muted) shrink-0">is what percent of</span>
              <Input
                type="number"
                value={p2Val2}
                onChange={(e) => setP2Val2(e.target.value)}
                className="w-24 text-center font-mono h-8 bg-(--color-surface) border-(--color-border)"
              />
            </div>
            <div className="pt-2 border-t border-(--color-border) flex justify-between items-center">
              <span className="text-xs font-bold text-(--color-text-muted)">Result:</span>
              <span className="font-mono text-sm font-bold text-(--color-primary)">
                {p2Result !== '—' ? `${p2Result}%` : '—'}
              </span>
            </div>
          </div>

          {/* Panel 3: Percentage Change Delta */}
          <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-(--color-text-secondary)">
              3. Percentage Change (Delta)
            </h3>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <span className="text-xs font-medium text-(--color-text-muted) shrink-0">From</span>
              <Input
                type="number"
                value={p3Start}
                onChange={(e) => setP3Start(e.target.value)}
                className="w-24 text-center font-mono h-8 bg-(--color-surface) border-(--color-border)"
              />
              <span className="text-xs font-medium text-(--color-text-muted) shrink-0">to</span>
              <Input
                type="number"
                value={p3End}
                onChange={(e) => setP3End(e.target.value)}
                className="w-24 text-center font-mono h-8 bg-(--color-surface) border-(--color-border)"
              />
            </div>
            <div className="pt-2 border-t border-(--color-border) flex justify-between items-center">
              <span className="text-xs font-bold text-(--color-text-muted)">Result:</span>
              <span className="font-mono text-sm font-bold flex items-center gap-1.5">
                <span className="text-(--color-primary)">
                  {p3Result !== '—' ? `${p3Result}%` : '—'}
                </span>
                {p3Direction !== 'none' && (
                  <span className={`text-[10px] uppercase font-bold py-0.5 px-2 rounded-full border ${
                    p3Direction === 'increase'
                      ? 'text-green-500 bg-green-500/10 border-green-500/20'
                      : 'text-red-500 bg-red-500/10 border-red-500/20'
                  }`}>
                    {p3Direction}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Panel 4: Aspect Ratio Simplifier */}
          <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-(--color-text-secondary)">
              4. Aspect Ratio Simplifier
            </h3>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Input
                type="number"
                placeholder="Width"
                value={p4Width}
                onChange={(e) => setP4Width(e.target.value)}
                className="w-24 text-center font-mono h-8 bg-(--color-surface) border-(--color-border)"
              />
              <span className="text-xs font-medium text-(--color-text-muted) shrink-0">x</span>
              <Input
                type="number"
                placeholder="Height"
                value={p4Height}
                onChange={(e) => setP4Height(e.target.value)}
                className="w-24 text-center font-mono h-8 bg-(--color-surface) border-(--color-border)"
              />
            </div>
            <div className="pt-2 border-t border-(--color-border) flex justify-between items-center">
              <span className="text-xs font-bold text-(--color-text-muted)">Simplified Ratio:</span>
              <span className="font-mono text-sm font-bold text-(--color-primary)">{p4Result}</span>
            </div>
          </div>

        </div>
      </div>
    </ToolLayout>
  )
}
