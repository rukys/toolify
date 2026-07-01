'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle, Check, Copy } from 'lucide-react'

const DEFAULT_PEM_PRESET = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzX1H8pTsk1fG4gQc+HhE
m+9gqP7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6r
Q9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7C
g0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8
k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e
7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v
9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6r
Q9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7C
g0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8
k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e
7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v
9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6r
Q9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7C
g0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8
k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e
7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v
9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6r
Q9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7C
g0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8
k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e
7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v
9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6r
Q9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7C
g0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8
k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e
7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v
9g+H+y7Cg0X71P1e7XQvNn6rQ9H3v4B8k5rQ9v6v9g+H+y7CwIDAQAB
-----END PUBLIC KEY-----`

export default function PemJwkClient() {
  const tool = getToolById('pem-jwk')!
  const [pemText, setPemText] = useState(DEFAULT_PEM_PRESET)
  const [jwkOutput, setJwkOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const base64ToArrayBuffer = (b64: string): ArrayBuffer => {
    const binary = window.atob(b64)
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  const handleConvert = async () => {
    setError('')
    setJwkOutput('')
    const raw = pemText.trim()
    if (!raw) return

    try {
      // Strip PEM tags and spaces
      const cleanB64 = raw
        .replace(/-----BEGIN[^-]*-----/g, '')
        .replace(/-----END[^-]*-----/g, '')
        .replace(/\s+/g, '')

      const derBuffer = base64ToArrayBuffer(cleanB64)

      // Import key as RSA PKCS1 SPKI public key
      const cryptoKey = await window.crypto.subtle.importKey(
        'spki',
        derBuffer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: { name: 'SHA-256' },
        },
        true,
        ['verify']
      )

      // Export key as JWK JSON
      const jwk = await window.crypto.subtle.exportKey('jwk', cryptoKey)
      setJwkOutput(JSON.stringify(jwk, null, 2))
    } catch (err: any) {
      setError(`Import Error: Invalid public SPKI PEM key format. Ensure headers and body are fully intact. (${err.message})`)
    }
  }

  useEffect(() => {
    handleConvert()
  }, [pemText])

  const handleCopy = async () => {
    if (!jwkOutput) return
    await navigator.clipboard.writeText(jwkOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setPemText('')
    setJwkOutput('')
    setError('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Input */}
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="pem-input" className="text-sm font-semibold">Paste raw PEM public certificate key</Label>
          <textarea
            id="pem-input"
            rows={10}
            placeholder="-----BEGIN PUBLIC KEY-----&#10;MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...&#10;-----END PUBLIC KEY-----"
            value={pemText}
            onChange={(e) => setPemText(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted) resize-y flex-1"
          />
        </div>

        {/* Action presets */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPemText(DEFAULT_PEM_PRESET)}
            className="text-xs h-8.5 border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer"
          >
            Load Preset Demo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs h-8.5 text-(--color-text-muted) hover:text-red-500 cursor-pointer ml-auto"
          >
            Clear Key
          </Button>
        </div>

        {/* Error panel */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Output */}
        {jwkOutput && (
          <div className="space-y-2 pt-4 border-t border-(--color-border) animate-fade-in">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">JSON Web Key (JWK) Configuration Output</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500 font-semibold">Copied JWK!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JWK JSON</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-[10px] text-(--color-text-primary) overflow-x-auto select-all leading-relaxed max-h-[220px]">
              {jwkOutput}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
