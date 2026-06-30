'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calculateSubnet } from '@/lib/utils/subnet-helper'

export default function SubnetCalculatorClient() {
  const tool = getToolById('subnet-calculator')!
  const [ip, setIp] = useState('192.168.1.1')
  const [cidr, setCidr] = useState(24)
  const [results, setResults] = useState(calculateSubnet(ip, cidr))

  useEffect(() => {
    setResults(calculateSubnet(ip, cidr))
  }, [ip, cidr])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* IP Address input */}
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="ip-input" className="text-sm font-semibold">IP Address</Label>
            <Input
              id="ip-input"
              type="text"
              placeholder="e.g. 192.168.1.1"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="bg-(--color-surface-alt) border-(--color-border) focus-visible:ring-(--color-primary)"
            />
          </div>

          {/* CIDR Mask Selection */}
          <div className="space-y-2">
            <Label htmlFor="cidr-select" className="text-sm font-semibold">CIDR Prefix</Label>
            <select
              id="cidr-select"
              value={cidr}
              onChange={(e) => setCidr(Number(e.target.value))}
              className="w-full h-9 rounded-md border border-(--color-border) bg-(--color-surface-alt) px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) text-(--color-text-primary)"
            >
              {Array.from({ length: 33 }, (_, i) => (
                <option key={i} value={i}>
                  /{i} ({calculateSubnet('0.0.0.0', i).subnetMask})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CIDR Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-(--color-text-muted)">
            <span>/0</span>
            <span className="text-(--color-primary) font-bold">Selected: /{cidr}</span>
            <span>/32</span>
          </div>
          <input
            type="range"
            min={0}
            max={32}
            value={cidr}
            onChange={(e) => setCidr(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
          />
        </div>

        {/* Error check */}
        {!results.isValid && ip.trim() !== '' && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-medium">
            ⚠️ Invalid IPv4 address format. Please enter four dot-separated octets (e.g. 192.168.1.1).
          </div>
        )}

        {/* Result grid display */}
        {results.isValid && (
          <div className="space-y-4 pt-4 border-t border-(--color-border) animate-fade-in">
            <h3 className="text-sm font-bold uppercase tracking-wider text-(--color-text-secondary)">
              Calculated Subnet Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
                <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">Subnet Mask</span>
                <p className="text-sm font-mono font-bold text-(--color-text-primary) mt-0.5">{results.subnetMask}</p>
              </div>

              <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
                <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">Network Address</span>
                <p className="text-sm font-mono font-bold text-(--color-text-primary) mt-0.5">{results.networkAddress}</p>
              </div>

              <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
                <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">Broadcast Address</span>
                <p className="text-sm font-mono font-bold text-(--color-text-primary) mt-0.5">{results.broadcastAddress}</p>
              </div>

              <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
                <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">Usable Host Range</span>
                <p className="text-sm font-mono font-bold text-(--color-text-primary) mt-0.5">
                  {results.firstHost} - {results.lastHost}
                </p>
              </div>

              <div className="sm:col-span-2 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
                <span className="text-[10px] uppercase font-bold text-(--color-text-muted)">Total Usable Hosts</span>
                <p className="text-sm font-mono font-bold text-(--color-text-primary) mt-0.5">
                  {results.totalHosts.toLocaleString()} {results.totalHosts === 1 ? 'host' : 'hosts'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
