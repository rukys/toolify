'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { generateSQLSeed } from '@/lib/utils/sql-seed-helper'

const DEFAULT_SQL_PRESET = `CREATE TABLE employees (
  id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  salary DECIMAL(10,2),
  is_active BOOLEAN,
  hired_at DATE,
  PRIMARY KEY (id)
);`

export default function SQLSeedClient() {
  const tool = getToolById('sql-seed')!
  const [schemaText, setSchemaText] = useState(DEFAULT_SQL_PRESET)
  const [rowCount, setRowCount] = useState(5)
  const [seedOutput, setSeedOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    const raw = schemaText.trim()
    if (!raw) {
      setSeedOutput('')
      return
    }
    const seed = generateSQLSeed(raw, rowCount)
    setSeedOutput(seed)
  }

  useEffect(() => {
    handleGenerate()
  }, [schemaText, rowCount])

  const handleCopy = async () => {
    if (!seedOutput) return
    await navigator.clipboard.writeText(seedOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setSchemaText('')
    setSeedOutput('')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Split grid for config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input schema */}
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="sql-schema-input" className="text-sm font-semibold">SQL Table DDL Schema (CREATE TABLE)</Label>
            <textarea
              id="sql-schema-input"
              rows={9}
              placeholder="CREATE TABLE my_table (..."
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted) resize-y flex-1"
            />
          </div>

          {/* Configuration parameters */}
          <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) pb-2 border-b border-(--color-border)/50">
                Mock Row Configurations
              </h3>

              {/* Row count slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <Label htmlFor="row-count-slider">Seed Row Quantity</Label>
                  <span className="text-(--color-primary) font-bold">{rowCount} Rows</span>
                </div>
                <input
                  id="row-count-slider"
                  type="range"
                  min={1}
                  max={40}
                  value={rowCount}
                  onChange={(e) => setRowCount(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                />
              </div>
            </div>

            {/* Actions button */}
            <div className="flex gap-2 pt-4 border-t border-(--color-border)/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSchemaText(DEFAULT_SQL_PRESET)}
                className="text-xs h-8.5 border-(--color-border) hover:bg-(--color-surface) cursor-pointer"
              >
                Load Demo DDL
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs h-8.5 text-(--color-text-muted) hover:text-red-500 cursor-pointer ml-auto"
              >
                Clear Schema
              </Button>
            </div>
          </div>
        </div>

        {/* Output seed list */}
        {seedOutput && (
          <div className="space-y-2 pt-4 border-t border-(--color-border) animate-fade-in">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Mock INSERT Seed Queries Output</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500 font-semibold">Copied Seed!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy INSERT Query</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-[10px] text-(--color-text-primary) overflow-x-auto select-all leading-relaxed max-h-[220px]">
              {seedOutput}
            </pre>
          </div>
        )}

      </div>
    </ToolLayout>
  )
}
