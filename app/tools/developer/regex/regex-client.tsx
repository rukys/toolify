'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Info } from 'lucide-react'

interface MatchResult {
  match: string
  index: number
  groups: string[]
}

export default function RegexClient() {
  const tool = getToolById('regex-tester')!
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
  const [testString, setTestString] = useState('Contact us at support@toolify.com or jobs@toolify.org!')
  
  // Flag states
  const [globalFlag, setGlobalFlag] = useState(true)
  const [caseFlag, setCaseFlag] = useState(true)
  const [multiFlag, setMultiFlag] = useState(false)
  const [dotAllFlag, setDotAllFlag] = useState(false)
  const [unicodeFlag, setUnicodeFlag] = useState(false)

  // Compute regex matches and error on the fly during render
  const matches: MatchResult[] = []
  let error = ''

  if (pattern) {
    try {
      let flags = ''
      if (globalFlag) flags += 'g'
      if (caseFlag) flags += 'i'
      if (multiFlag) flags += 'm'
      if (dotAllFlag) flags += 's'
      if (unicodeFlag) flags += 'u'

      const regex = new RegExp(pattern, flags)

      if (flags.includes('g')) {
        let m
        while ((m = regex.exec(testString)) !== null) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          })
          // Prevent infinite loop on zero-width match
          if (m[0] === '') {
            regex.lastIndex++
          }
        }
      } else {
        const m = regex.exec(testString)
        if (m) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          })
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Invalid regular expression'
    }
  }

  // Renders test string with highlighted matches using <mark>
  const renderHighlights = () => {
    if (!testString) {
      return <span className="text-[var(--color-text-muted)] italic">Test string is empty</span>
    }
    if (matches.length === 0) {
      return <span>{testString}</span>
    }

    const elements = []
    let lastIndex = 0

    // Sort matches by index to render them in sequential order
    const sortedMatches = [...matches].sort((a, b) => a.index - b.index)

    sortedMatches.forEach((m, idx) => {
      // Add text before the match
      if (m.index > lastIndex) {
        elements.push(testString.substring(lastIndex, m.index))
      }

      // Add highlighted match span
      elements.push(
        <mark
          key={idx}
          className="bg-yellow-200 dark:bg-amber-600 dark:text-white px-0.5 rounded font-mono text-sm border-b border-amber-400"
          title={`Match ${idx + 1}`}
        >
          {m.match}
        </mark>
      )

      lastIndex = m.index + m.match.length
    })

    // Add remaining text
    if (lastIndex < testString.length) {
      elements.push(testString.substring(lastIndex))
    }

    return <pre className="whitespace-pre-wrap font-mono text-sm break-all">{elements}</pre>
  }

  const handleClear = () => {
    setPattern('')
    setTestString('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Section */}
        <div className="lg:col-span-6 space-y-6">
          {/* Regex Pattern Input */}
          <div className="space-y-2">
            <Label htmlFor="regex-pattern" className="text-sm font-semibold">
              Regular Expression Pattern
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[var(--color-text-muted)]">/</span>
              <input
                id="regex-pattern"
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="w-full pl-6 pr-12 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] font-mono text-sm focus:border-[var(--color-primary)] focus:outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[var(--color-text-muted)]">
                /{globalFlag ? 'g' : ''}{caseFlag ? 'i' : ''}{multiFlag ? 'm' : ''}{dotAllFlag ? 's' : ''}{unicodeFlag ? 'u' : ''}
              </span>
            </div>
          </div>

          {/* Flag Options */}
          <div className="space-y-2">
            <Label className="text-xs text-[var(--color-text-secondary)] font-semibold">Flags</Label>
            <div className="flex flex-wrap gap-x-4 gap-y-2 p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-alt)]">
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <Checkbox checked={globalFlag} onCheckedChange={(checked) => setGlobalFlag(!!checked)} />
                <span>global (g)</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <Checkbox checked={caseFlag} onCheckedChange={(checked) => setCaseFlag(!!checked)} />
                <span>ignore case (i)</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <Checkbox checked={multiFlag} onCheckedChange={(checked) => setMultiFlag(!!checked)} />
                <span>multiline (m)</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <Checkbox checked={dotAllFlag} onCheckedChange={(checked) => setDotAllFlag(!!checked)} />
                <span>dotAll (s)</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <Checkbox checked={unicodeFlag} onCheckedChange={(checked) => setUnicodeFlag(!!checked)} />
                <span>unicode (u)</span>
              </label>
            </div>
          </div>

          {/* Test String Textarea */}
          <div className="space-y-2">
            <Label htmlFor="test-string" className="text-sm font-semibold">
              Test String
            </Label>
            <textarea
              id="test-string"
              rows={8}
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to match against the regular expression..."
              className="w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] font-mono text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-mono">{error}</div>
            </div>
          )}

          {/* Action Buttons */}
          {(pattern || testString) && (
            <div className="flex justify-end">
              <Button variant="ghost" onClick={handleClear} className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] text-xs cursor-pointer">
                Clear Fields
              </Button>
            </div>
          )}
        </div>

        {/* Right Output Section */}
        <div className="lg:col-span-6 space-y-6">
          {/* Matches Highlight Box */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Regex Match Highlight</Label>
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] min-h-[120px] max-h-[300px] overflow-auto whitespace-pre-wrap select-text leading-relaxed">
              {renderHighlights()}
            </div>
          </div>

          {/* Matches List Table */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Matches ({matches.length})
            </Label>
            {matches.length > 0 ? (
              <div className="border border-[var(--color-border)] rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
                      <th className="p-3 font-semibold text-[var(--color-text-primary)] w-16">No</th>
                      <th className="p-3 font-semibold text-[var(--color-text-primary)]">Match</th>
                      <th className="p-3 font-semibold text-[var(--color-text-primary)] w-24">Index</th>
                      <th className="p-3 font-semibold text-[var(--color-text-primary)]">Groups</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m, idx) => (
                      <tr key={idx} className="border-b border-[var(--color-border)]/50 last:border-b-0 hover:bg-[var(--color-surface-alt)]/50">
                        <td className="p-3 text-[var(--color-text-muted)] font-mono">{idx + 1}</td>
                        <td className="p-3 font-mono text-[var(--color-primary)] font-semibold break-all">{m.match}</td>
                        <td className="p-3 text-[var(--color-text-secondary)] font-mono">{m.index}</td>
                        <td className="p-3 text-[var(--color-text-muted)] font-mono break-all">
                          {m.groups.length > 0 ? (
                            <span className="flex flex-wrap gap-1">
                              {m.groups.map((group, gIdx) => (
                                <span key={gIdx} className="px-1.5 py-0.5 rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[10px]" title={`Group ${gIdx + 1}`}>
                                  {group === undefined ? 'undefined' : `"${group}"`}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span className="italic opacity-60">none</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] text-xs">
                No matching substrings found
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
