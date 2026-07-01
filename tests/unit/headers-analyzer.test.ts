import { describe, expect, test } from 'vitest'
import { auditHttpHeaders } from '@/lib/utils/headers-helper'

describe('HTTP Headers Security Auditor Utility', () => {
  test('should return 100 for a fully configured secure header set', () => {
    const rawHeaders = `Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=()
Cross-Origin-Opener-Policy: same-origin`

    const res = auditHttpHeaders(rawHeaders)
    expect(res.score).toBe(100)
    expect(res.grade).toBe('A')
    expect(res.audits.every((a) => a.status === 'secure')).toBe(true)
  })

  test('should return 0 for missing headers block', () => {
    const rawHeaders = `Server: Apache
Content-Type: text/html`

    const res = auditHttpHeaders(rawHeaders)
    expect(res.score).toBe(0)
    expect(res.grade).toBe('F')
    expect(res.audits.every((a) => a.status === 'warning')).toBe(true)
  })

  test('should compute correct weighted score for partial configurations', () => {
    // Spec weights: CSP (25) + X-Frame-Options (15) = 40
    const rawHeaders = `Content-Security-Policy: default-src 'self'
X-Frame-Options: SAMEORIGIN`

    const res = auditHttpHeaders(rawHeaders)
    expect(res.score).toBe(40)
    expect(res.grade).toBe('D')
  })
})
