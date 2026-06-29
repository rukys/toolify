'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CodeHighlight } from '@/components/tool/code-highlight'
import { Copy, Check, Info, ShieldAlert } from 'lucide-react'

interface JwtHeader {
  alg?: string
  typ?: string
  [key: string]: unknown
}

interface JwtPayload {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: unknown
}

interface DecodedToken {
  header: JwtHeader
  payload: JwtPayload
  signature: string
}

function base64urlDecode(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  } catch {
    throw new Error('Failed to decode segment: Base64Url parsing error.')
  }
}

function decodeJWT(token: string): DecodedToken {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: A JSON Web Token must consist of 3 parts separated by dots (header.payload.signature)')
  }

  const header = JSON.parse(base64urlDecode(parts[0]))
  const payload = JSON.parse(base64urlDecode(parts[1]))

  return {
    header,
    payload,
    signature: parts[2],
  }
}

export default function JWTClient() {
  const tool = getToolById('jwt-debugger')!
  const [token, setToken] = useState('')
  const [copiedSig, setCopiedSig] = useState(false)

  // Compute decoded token and error on the fly during render
  let decoded: DecodedToken | null = null
  let error = ''
  if (token.trim()) {
    try {
      decoded = decodeJWT(token)
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to parse JWT token'
    }
  }

  const handleCopySignature = async () => {
    if (!decoded) return
    await navigator.clipboard.writeText(decoded.signature)
    setCopiedSig(true)
    setTimeout(() => setCopiedSig(false), 2000)
  }

  const formatTimestamp = (ts: unknown) => {
    if (typeof ts !== 'number') return 'Invalid timestamp'
    const date = new Date(ts * 1000)
    return `${date.toLocaleString()} (Local) / ${date.toUTCString()} (UTC)`
  }

  // Common claims explanation list
  const getSpecialClaims = (payload: JwtPayload) => {
    const claims: { name: string; value: string; desc: string }[] = []
    if (payload.iss) claims.push({ name: 'iss (Issuer)', value: payload.iss, desc: 'Identifies the principal that issued the JWT' })
    if (payload.sub) claims.push({ name: 'sub (Subject)', value: payload.sub, desc: 'Identifies the principal that is the subject of the JWT' })
    if (payload.aud) {
      const audVal = Array.isArray(payload.aud) ? payload.aud.join(', ') : payload.aud
      claims.push({ name: 'aud (Audience)', value: audVal, desc: 'Identifies the recipients that the JWT is intended for' })
    }
    if (payload.exp) claims.push({ name: 'exp (Expiration)', value: formatTimestamp(payload.exp), desc: 'The expiration time on or after which the JWT must not be accepted' })
    if (payload.nbf) claims.push({ name: 'nbf (Not Before)', value: formatTimestamp(payload.nbf), desc: 'The time before which the JWT must not be accepted' })
    if (payload.iat) claims.push({ name: 'iat (Issued At)', value: formatTimestamp(payload.iat), desc: 'The time at which the JWT was issued' })
    if (payload.jti) claims.push({ name: 'jti (JWT ID)', value: payload.jti, desc: 'A unique identifier for the JWT' })
    return claims
  }

  const claimsList = decoded ? getSpecialClaims(decoded.payload) : []

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jwt-input" className="text-sm font-semibold">
              Encoded JWT Token
            </Label>
            <textarea
              id="jwt-input"
              rows={12}
              placeholder="Paste your JSON Web Token here..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] font-mono text-xs focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)] break-all"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-mono">{error}</div>
            </div>
          )}

          {!decoded && !error && (
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-xs text-[var(--color-text-muted)] flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-primary)]" />
              <p>Paste a token on the left. The token will be parsed completely in your browser without hitting any external servers.</p>
            </div>
          )}
        </div>

        {/* Right Column: Decoded Panels */}
        <div className="lg:col-span-7 space-y-6">
          {decoded ? (
            <>
              {/* Header Panel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-500">Header: Algorithm & Token Type</span>
                </div>
                <CodeHighlight code={JSON.stringify(decoded.header, null, 2)} language="json" />
              </div>

              {/* Payload Claims Panel */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Payload: Data / Claims</span>
                <CodeHighlight code={JSON.stringify(decoded.payload, null, 2)} language="json" />
              </div>

              {/* Claims Description */}
              {claimsList.length > 0 && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4 space-y-3">
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">Parsed Claims Info</span>
                  <div className="space-y-2 text-xs">
                    {claimsList.map((claim) => (
                      <div key={claim.name} className="grid grid-cols-1 sm:grid-cols-3 gap-1 border-b border-[var(--color-border)]/50 pb-2 last:border-b-0 last:pb-0">
                        <span className="font-semibold text-[var(--color-primary)]">{claim.name}</span>
                        <span className="sm:col-span-2 font-mono text-[var(--color-text-primary)] break-all">{claim.value}</span>
                        <span className="sm:col-start-2 sm:col-span-2 text-[var(--color-text-muted)] text-[10px]">{claim.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signature Panel */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">Signature Parameters</span>
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] space-y-4">
                  <div className="flex items-start gap-3 text-xs text-[var(--color-text-secondary)]">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[var(--color-text-primary)]">Signature Verification Disclaimer</p>
                      <p className="text-[var(--color-text-muted)] mt-1">
                        This debugger is client-side only. We show the signature block and algorithm details, but validation checking against secret keys is out of scope for browser-based offline processing without keys.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">Raw Signature</span>
                    <pre className="p-3 text-xs font-mono rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] overflow-x-auto break-all whitespace-pre-wrap select-all">
                      {decoded.signature}
                    </pre>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Algorithm: <strong className="font-semibold text-[var(--color-text-primary)]">{decoded.header.alg || 'unknown'}</strong>
                    </span>
                    <Button variant="outline" size="sm" onClick={handleCopySignature} className="cursor-pointer text-xs">
                      {copiedSig ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-[var(--color-success)]" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy Signature
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]">
              <p className="text-sm">Waiting for valid token input...</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
