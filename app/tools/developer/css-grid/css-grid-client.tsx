'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

export default function CSSGridClient() {
  const tool = getToolById('css-grid')!
  const [cols, setCols] = useState(3)
  const [rows, setRows] = useState(3)
  const [colGap, setColGap] = useState(16)
  const [rowGap, setRowGap] = useState(16)
  const [copiedType, setCopiedType] = useState<'css' | 'html' | null>(null)

  const cssCode = `.grid-container {
  display: grid;
  grid-template-columns: repeat(${cols}, 1fr);
  grid-template-rows: repeat(${rows}, 1fr);
  column-gap: ${colGap}px;
  row-gap: ${rowGap}px;
}

.grid-item {
  background-color: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}`

  const htmlCode = `<div class="grid-container">
${Array.from({ length: cols * rows })
  .map((_, i) => `  <div class="grid-item">Cell ${i + 1}</div>`)
  .join('\n')}
</div>`

  const handleCopy = async (text: string, type: 'css' | 'html') => {
    await navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          <div className="space-y-4">
            {/* Columns Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <Label htmlFor="cols-slider">Columns</Label>
                <span className="text-(--color-primary) font-bold">{cols} columns</span>
              </div>
              <input
                id="cols-slider"
                type="range"
                min={1}
                max={12}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
              />
            </div>

            {/* Rows Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <Label htmlFor="rows-slider">Rows</Label>
                <span className="text-(--color-primary) font-bold">{rows} rows</span>
              </div>
              <input
                id="rows-slider"
                type="range"
                min={1}
                max={12}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Column Gap Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <Label htmlFor="col-gap-slider">Column Gap</Label>
                <span className="text-(--color-primary) font-bold">{colGap}px</span>
              </div>
              <input
                id="col-gap-slider"
                type="range"
                min={0}
                max={60}
                value={colGap}
                onChange={(e) => setColGap(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
              />
            </div>

            {/* Row Gap Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <Label htmlFor="row-gap-slider">Row Gap</Label>
                <span className="text-(--color-primary) font-bold">{rowGap}px</span>
              </div>
              <input
                id="row-gap-slider"
                type="range"
                min={0}
                max={60}
                value={rowGap}
                onChange={(e) => setRowGap(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
              />
            </div>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Live Layout Preview</Label>
          <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface) min-h-[260px] flex items-center justify-center">
            <div
              className="w-full grid transition-all duration-150"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                columnGap: `${colGap}px`,
                rowGap: `${rowGap}px`,
              }}
            >
              {Array.from({ length: cols * rows }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-video sm:aspect-auto sm:h-12 rounded-lg border border-(--color-border) bg-(--color-surface-alt) flex items-center justify-center text-[10px] font-mono text-(--color-text-secondary) font-bold hover:border-(--color-primary) hover:text-(--color-primary) transition-all shadow-xs"
                >
                  #{i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Output segments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-(--color-border)">
          {/* CSS Code */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold uppercase tracking-wider text-(--color-text-muted)">CSS Rules</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(cssCode, 'css')}
                className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) cursor-pointer h-7"
              >
                {copiedType === 'css' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500 font-semibold">Copied CSS!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy CSS</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-[10px] text-(--color-text-primary) overflow-x-auto whitespace-pre leading-relaxed select-all">
              {cssCode}
            </pre>
          </div>

          {/* HTML Code */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold uppercase tracking-wider text-(--color-text-muted)">HTML Markup</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(htmlCode, 'html')}
                className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) cursor-pointer h-7"
              >
                {copiedType === 'html' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500 font-semibold">Copied HTML!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy HTML</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-[10px] text-(--color-text-primary) overflow-x-auto max-h-[145px] whitespace-pre leading-relaxed select-all">
              {htmlCode}
            </pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
