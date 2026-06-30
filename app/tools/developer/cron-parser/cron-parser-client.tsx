'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, HelpCircle, Calendar, MessageSquareCode } from 'lucide-react'
import { humanizeCron, getNextCronRuns } from '@/lib/utils/cron-helper'

const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every hour', expr: '0 * * * *' },
  { label: 'Every 15 mins (working hours)', expr: '*/15 8-17 * * 1-5' },
  { label: 'Daily at midnight', expr: '0 0 * * *' },
  { label: 'Weekly on Sunday', expr: '0 0 * * 0' },
]

export default function CronParserClient() {
  const tool = getToolById('cron-parser')!
  const [expression, setExpression] = useState('*/15 8-17 * * 1-5')
  const [humanText, setHumanText] = useState<string | null>(null)
  const [nextRuns, setNextRuns] = useState<Date[]>([])
  const [error, setError] = useState('')

  const handleParse = () => {
    setError('')
    setHumanText(null)
    setNextRuns([])

    const cleaned = expression.trim()
    if (!cleaned) return

    try {
      const translated = humanizeCron(cleaned)
      const runs = getNextCronRuns(cleaned, new Date(), 5)
      
      setHumanText(translated)
      setNextRuns(runs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid cron expression format.')
    }
  }

  const handlePresetClick = (expr: string) => {
    setExpression(expr)
    setError('')
    try {
      const translated = humanizeCron(expr)
      const runs = getNextCronRuns(expr, new Date(), 5)
      setHumanText(translated)
      setNextRuns(runs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid cron expression.')
    }
  }

  const handleClear = () => {
    setExpression('')
    setHumanText(null)
    setNextRuns([])
    setError('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Input area */}
        <div className="space-y-3">
          <Label htmlFor="cron-input" className="text-sm font-semibold">
            Cron Expression
          </Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="cron-input"
              type="text"
              placeholder="e.g. */5 * * * *"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="flex-1 bg-(--color-surface-alt) border-(--color-border) font-mono text-sm focus-visible:ring-(--color-primary)"
            />
            <div className="flex gap-2">
              <Button onClick={handleParse} className="cursor-pointer bg-(--color-primary) text-white hover:bg-(--color-primary-dark)">
                Parse Schedule
              </Button>
              <Button variant="outline" onClick={handleClear} className="cursor-pointer border-(--color-border) hover:bg-(--color-surface-alt)">
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-(--color-text-muted)">Common Patterns:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset.expr)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) cursor-pointer text-(--color-text-secondary)"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error layout */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Translation Output */}
        {humanText && (
          <div className="space-y-6 animate-fade-in">
            {/* Translated text card */}
            <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex gap-3">
              <MessageSquareCode className="w-5 h-5 text-(--color-primary) shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-(--color-text-muted)">Humanized Explanation</h4>
                <p className="text-sm font-medium text-(--color-text-primary) mt-1">{humanText}</p>
              </div>
            </div>

            {/* Next execution times timeline */}
            {nextRuns.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-(--color-border)">
                <h4 className="text-xs font-bold uppercase tracking-wider text-(--color-text-muted) flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Next 5 Execution Timings</span>
                </h4>
                <div className="relative border-l border-(--color-border) ml-3 pl-5 space-y-4 py-2">
                  {nextRuns.map((date, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-(--color-border) bg-(--color-primary) shadow-sm" />
                      <div className="text-xs">
                        <span className="font-bold text-(--color-text-primary)">
                          {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="text-(--color-text-muted) ml-2">
                          at {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tip Box */}
        <div className="flex gap-2.5 p-4 rounded-xl border border-(--color-border) text-(--color-text-muted) text-xs leading-relaxed bg-(--color-surface-alt)">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-(--color-text-muted)/80" />
          <div>
            <p className="font-bold text-(--color-text-secondary)">Standard Crontab Notation format</p>
            <p className="mt-0.5">
              Input format is 5 fields separated by space representing: <code>minute hour day-of-month month day-of-week</code>. Standard ranges apply (e.g. minutes: <code>0-59</code>, hours: <code>0-23</code>, day of week: <code>0-6</code> starting from Sunday).
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
