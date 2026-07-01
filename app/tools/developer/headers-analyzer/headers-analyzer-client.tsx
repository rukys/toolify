'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react'
import { auditHttpHeaders, AuditResult } from '@/lib/utils/headers-helper'

const PRESETS = [
  {
    name: 'Secure Configuration (Grade A)',
    headers: `HTTP/2 200 OK
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=()
Cross-Origin-Opener-Policy: same-origin`,
  },
  {
    name: 'Weak Configuration (Grade F)',
    headers: `HTTP/1.1 200 OK
Server: Apache/2.4.41 (Ubuntu)
Content-Type: text/html; charset=UTF-8
Connection: keep-alive`,
  },
]

export default function HeadersAnalyzerClient() {
  const tool = getToolById('headers-analyzer')!
  const [headersRaw, setHeadersRaw] = useState(PRESETS[0].headers)
  const [result, setResult] = useState<AuditResult | null>(null)

  const handleAudit = () => {
    setResult(auditHttpHeaders(headersRaw))
  }

  useEffect(() => {
    handleAudit()
  }, [headersRaw])

  const handleClear = () => {
    setHeadersRaw('')
    setResult(null)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Input */}
        <div className="space-y-2">
          <Label htmlFor="headers-input" className="text-sm font-semibold">Paste raw HTTP response headers block</Label>
          <textarea
            id="headers-input"
            rows={8}
            placeholder="HTTP/1.1 200 OK&#10;Content-Security-Policy: default-src 'self'..."
            value={headersRaw}
            onChange={(e) => setHeadersRaw(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted)"
          />
        </div>

        {/* Preset selections */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-(--color-text-muted) self-center mr-1">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setHeadersRaw(p.headers)}
              className="text-[10px] font-semibold py-1 px-2.5 rounded-lg border border-(--color-border) bg-(--color-surface-alt) hover:bg-(--color-surface) cursor-pointer"
            >
              {p.name}
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-[10px] font-semibold h-6 hover:text-red-500 cursor-pointer ml-auto"
          >
            Clear
          </Button>
        </div>

        {/* Audit Results display panel */}
        {result && (
          <div className="space-y-6 pt-4 border-t border-(--color-border) animate-fade-in">
            {/* Summary Score Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Score card */}
              <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">Security Score</span>
                  <p className="text-2xl font-bold font-mono text-(--color-text-primary) mt-1">
                    {result.score} <span className="text-xs text-(--color-text-muted)">/ 100</span>
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono text-2xl font-bold border ${
                  result.grade === 'A' || result.grade === 'B'
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : result.grade === 'C'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {result.grade}
                </div>
              </div>

              {/* Status breakdown card */}
              <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex flex-col justify-center shadow-xs">
                <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">Audit Status Breakdown</span>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-xs font-bold text-(--color-text-primary)">
                      {result.audits.filter((a) => a.status === 'secure').length} Secure
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-xs font-bold text-(--color-text-primary)">
                      {result.audits.filter((a) => a.status === 'warning').length} Warnings
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Audits List */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-(--color-text-muted)">Header Audit Rulings</Label>
              <div className="space-y-2.5">
                {result.audits.map((audit) => (
                  <div
                    key={audit.name}
                    className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)/50 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-(--color-text-primary)">{audit.name}</h4>
                        {audit.value && (
                          <p className="text-[10px] font-mono bg-(--color-surface) border border-(--color-border) py-0.5 px-2 rounded-md mt-1 break-all select-all font-semibold inline-block">
                            {audit.value}
                          </p>
                        )}
                      </div>
                      <span className={`text-[9px] uppercase font-bold py-0.5 px-2 rounded-full border shrink-0 ${
                        audit.status === 'secure'
                          ? 'text-green-500 bg-green-500/10 border-green-500/20'
                          : 'text-red-500 bg-red-500/10 border-red-500/20'
                      }`}>
                        {audit.status}
                      </span>
                    </div>

                    <p className="text-xs text-(--color-text-secondary) mt-1">{audit.description}</p>
                    
                    {audit.status !== 'secure' && (
                      <div className="p-2.5 rounded-lg bg-(--color-surface) border border-(--color-border) text-[11px] text-(--color-text-muted) leading-relaxed">
                        <span className="font-bold text-(--color-text-secondary)">Recommendation: </span>
                        {audit.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
