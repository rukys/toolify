// HTTP Response Security Headers Auditing Utility

export interface HeaderAudit {
  name: string
  status: 'secure' | 'warning' | 'info'
  value: string | null
  description: string
  recommendation: string
}

export interface AuditResult {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  audits: HeaderAudit[]
}

const AUDIT_SPECS = [
  {
    key: 'content-security-policy',
    name: 'Content Security Policy (CSP)',
    recommendation: "Configure Content-Security-Policy to restrict resource loading (e.g., default-src 'self').",
    successMsg: 'CSP is configured.',
    failMsg: 'Missing Content-Security-Policy header. Exposes site to XSS attacks.',
    weight: 25,
  },
  {
    key: 'strict-transport-security',
    name: 'Strict Transport Security (HSTS)',
    recommendation: 'Configure HSTS with max-age parameters (e.g., max-age=31536000; includeSubDomains).',
    successMsg: 'HSTS is configured.',
    failMsg: 'Missing Strict-Transport-Security header. Connection could be downgraded to HTTP.',
    weight: 20,
  },
  {
    key: 'x-frame-options',
    name: 'X-Frame Options (Clickjacking Protection)',
    recommendation: 'Configure to DENY or SAMEORIGIN to prevent framing.',
    successMsg: 'X-Frame-Options is configured.',
    failMsg: 'Missing X-Frame-Options header. Exposes site to Clickjacking attacks.',
    weight: 15,
  },
  {
    key: 'x-content-type-options',
    name: 'X-Content Type Options (MIME Sniffing)',
    recommendation: 'Configure to nosniff.',
    successMsg: 'X-Content-Type-Options: nosniff is configured.',
    failMsg: 'Missing X-Content-Type-Options header. Browser might execute non-executable files.',
    weight: 15,
  },
  {
    key: 'referrer-policy',
    name: 'Referrer Policy',
    recommendation: 'Configure Referrer-Policy to limit referrer leakage (e.g., strict-origin-when-cross-origin).',
    successMsg: 'Referrer-Policy is configured.',
    failMsg: 'Missing Referrer-Policy header. Referrer header might leak user navigation details.',
    weight: 10,
  },
  {
    key: 'permissions-policy',
    name: 'Permissions Policy',
    recommendation: 'Configure Permissions-Policy to restrict browser features (e.g., geolocation=(), camera=()).',
    successMsg: 'Permissions-Policy is configured.',
    failMsg: 'Missing Permissions-Policy header.',
    weight: 10,
  },
  {
    key: 'cross-origin-opener-policy',
    name: 'Cross Origin Opener Policy (COOP)',
    recommendation: 'Configure COOP to isolate window contexts (e.g., same-origin).',
    successMsg: 'COOP is configured.',
    failMsg: 'Missing Cross-Origin-Opener-Policy header.',
    weight: 5,
  },
]

export function auditHttpHeaders(rawHeaders: string): AuditResult {
  const lines = rawHeaders.split('\n')
  const headerMap: Record<string, string> = {}

  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx !== -1) {
      const key = line.slice(0, idx).trim().toLowerCase()
      const val = line.slice(idx + 1).trim()
      headerMap[key] = val
    }
  }

  let totalScore = 0
  const audits: HeaderAudit[] = []

  for (const spec of AUDIT_SPECS) {
    const val = headerMap[spec.key] || null
    const isSecure = !!val

    if (isSecure) {
      totalScore += spec.weight
    }

    audits.push({
      name: spec.name,
      status: isSecure ? 'secure' : 'warning',
      value: val,
      description: isSecure ? spec.successMsg : spec.failMsg,
      recommendation: spec.recommendation,
    })
  }

  // Map score to a simple letter grade (A-F)
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F'
  if (totalScore >= 90) grade = 'A'
  else if (totalScore >= 70) grade = 'B'
  else if (totalScore >= 50) grade = 'C'
  else if (totalScore >= 30) grade = 'D'

  return {
    score: totalScore,
    grade,
    audits,
  }
}
