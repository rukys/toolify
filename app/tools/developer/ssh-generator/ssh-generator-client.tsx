'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Key, Copy, Check, Download, ShieldCheck } from 'lucide-react'

type KeyType = 'rsa' | 'ecdsa'

export default function SSHGeneratorClient() {
  const tool = getToolById('ssh-generator')!
  const [keyType, setKeyType] = useState<KeyType>('rsa')
  const [isGenerating, setIsGenerating] = useState(false)
  const [publicKeyPem, setPublicKeyPem] = useState('')
  const [privateKeyPem, setPrivateKeyPem] = useState('')
  
  const [copiedPub, setCopiedPub] = useState(false)
  const [copiedPriv, setCopiedPriv] = useState(false)

  // ArrayBuffer to base64 line wrapped string helper
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const b64 = window.btoa(binary)
    return b64.match(/.{1,64}/g)?.join('\n') || b64
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setPublicKeyPem('')
    setPrivateKeyPem('')

    try {
      let keyPair: CryptoKeyPair

      if (keyType === 'rsa') {
        keyPair = await window.crypto.subtle.generateKey(
          {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: { name: 'SHA-256' },
          },
          true,
          ['sign', 'verify']
        )
      } else {
        keyPair = await window.crypto.subtle.generateKey(
          {
            name: 'ECDSA',
            namedCurve: 'P-256',
          },
          true,
          ['sign', 'verify']
        )
      }

      // Export SPKI Public Key
      const pubBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey)
      const pubB64 = arrayBufferToBase64(pubBuffer)
      setPublicKeyPem(`-----BEGIN PUBLIC KEY-----\n${pubB64}\n-----END PUBLIC KEY-----`)

      // Export PKCS8 Private Key
      const privBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
      const privB64 = arrayBufferToBase64(privBuffer)
      setPrivateKeyPem(`-----BEGIN PRIVATE KEY-----\n${privB64}\n-----END PRIVATE KEY-----`)

    } catch (err) {
      alert('Key generation failed. Web Crypto is blocked or unsupported in this browser.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (text: string, isPub: boolean) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    if (isPub) {
      setCopiedPub(true)
      setTimeout(() => setCopiedPub(false), 2000)
    } else {
      setCopiedPriv(true)
      setTimeout(() => setCopiedPriv(false), 2000)
    }
  }

  const handleDownload = (text: string, filename: string) => {
    if (!text) return
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Toggle selectors and triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          {/* Key Type selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Signature Algorithm</Label>
            <div className="flex gap-1.5">
              {([
                { val: 'rsa', label: 'RSA (2048-bit)' },
                { val: 'ecdsa', label: 'ECDSA (P-256)' },
              ] as { val: KeyType; label: string }[]).map((t) => (
                <button
                  key={t.val}
                  onClick={() => setKeyType(t.val)}
                  className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    keyType === t.val
                      ? 'bg-(--color-primary) text-white border-transparent'
                      : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Generate */}
          <div className="flex items-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-(--color-primary) hover:bg-(--color-primary-dark) text-white cursor-pointer h-9.5 text-xs font-semibold"
            >
              <Key className="w-4 h-4 mr-1.5" />
              {isGenerating ? 'Generating secure keys...' : 'Generate SSH Key Pair'}
            </Button>
          </div>
        </div>

        {/* Output Areas */}
        {(publicKeyPem || privateKeyPem) && (
          <div className="space-y-6 animate-fade-in">
            {/* Public key */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold text-(--color-text-secondary)">SSH Public Key (id_rsa.pub)</Label>
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(publicKeyPem, true)}
                    className="h-7 text-xs cursor-pointer text-(--color-text-muted) hover:text-(--color-text-primary)"
                  >
                    {copiedPub ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className={copiedPub ? 'text-green-500 font-semibold' : ''}>{copiedPub ? 'Copied' : 'Copy'}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(publicKeyPem, `id_${keyType}.pub`)}
                    className="h-7 text-xs cursor-pointer text-(--color-text-muted) hover:text-(--color-text-primary)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
              <pre className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-[10px] text-(--color-text-primary) overflow-x-auto select-all leading-relaxed max-h-[140px]">
                {publicKeyPem}
              </pre>
            </div>

            {/* Private key */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold text-(--color-text-secondary)">SSH Private Key (id_rsa)</Label>
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(privateKeyPem, false)}
                    className="h-7 text-xs cursor-pointer text-(--color-text-muted) hover:text-(--color-text-primary)"
                  >
                    {copiedPriv ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className={copiedPriv ? 'text-green-500 font-semibold' : ''}>{copiedPriv ? 'Copied' : 'Copy'}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(privateKeyPem, `id_${keyType}`)}
                    className="h-7 text-xs cursor-pointer text-(--color-text-muted) hover:text-(--color-text-primary)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
              <pre className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-[10px] text-(--color-text-primary) overflow-x-auto select-all leading-relaxed max-h-[140px]">
                {privateKeyPem}
              </pre>
            </div>
          </div>
        )}

        {/* Security Notification */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-300">🔒 Zero-Server Cryptographic Security</h4>
            <p className="text-xs mt-1 leading-relaxed">
              Keys are generated inside your local sandbox process using the browser's <code>window.crypto</code> engine. No key data is ever sent to or processed by external web servers.
            </p>
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
