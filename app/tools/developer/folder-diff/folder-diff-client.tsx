'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { GitCompare, PlusCircle, Check } from 'lucide-react'
import { compareFolderStructures, DiffNode } from '@/lib/utils/folder-diff-helper'

const PRESET_A = `README.md
package.json
src/index.ts
src/utils/math.ts
src/components/button.tsx`

const PRESET_B = `README.md
package.json
src/index.ts
src/components/button.tsx
src/components/input.tsx
tests/button.test.ts`

// Recursive tree component
function DiffTreeRender({ node, depth = 0 }: { node: DiffNode; depth?: number }) {
  const keys = Object.keys(node.children).sort((a, b) => {
    // Sort directories before files
    const aIsDir = node.children[a].isDir
    const bIsDir = node.children[b].isDir
    if (aIsDir && !bIsDir) return -1
    if (!aIsDir && bIsDir) return 1
    return a.localeCompare(b)
  })

  return (
    <div className="font-mono text-xs space-y-1" style={{ paddingLeft: depth ? 18 : 0 }}>
      {keys.map((key) => {
        const child = node.children[key]
        const colorClass =
          child.status === 'added'
            ? 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20 font-bold'
            : child.status === 'deleted'
            ? 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20 line-through font-bold'
            : 'text-(--color-text-secondary)'

        return (
          <div key={child.path} className="space-y-1">
            <div className={`py-0.5 px-2 rounded-md inline-flex items-center gap-1.5 border border-transparent ${colorClass}`}>
              <span>{child.isDir ? '📁' : '📄'}</span>
              <span>{child.name}</span>
              {child.status !== 'unchanged' && (
                <span className="text-[8px] uppercase tracking-wider px-1 py-0.2 rounded-full bg-white dark:bg-black font-extrabold ml-1">
                  {child.status === 'added' ? '+ added' : '- deleted'}
                </span>
              )}
            </div>
            {child.isDir && <DiffTreeRender node={child} depth={depth + 1} />}
          </div>
        )
      })}
    </div>
  )
}

export default function FolderDiffClient() {
  const tool = getToolById('folder-diff')!
  const [listA, setListA] = useState(PRESET_A)
  const [listB, setListB] = useState(PRESET_B)
  const [diffTree, setDiffTree] = useState<DiffNode | null>(null)

  const handleCompare = () => {
    const linesA = listA.split('\n')
    const linesB = listB.split('\n')
    setDiffTree(compareFolderStructures(linesA, linesB))
  }

  useEffect(() => {
    handleCompare()
  }, [listA, listB])

  const handleClear = () => {
    setListA('')
    setListB('')
    setDiffTree(null)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Split editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* List A */}
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="folder-a" className="text-sm font-semibold">Directory File List A (Base)</Label>
            <textarea
              id="folder-a"
              rows={8}
              placeholder="README.md&#10;src/index.js..."
              value={listA}
              onChange={(e) => setListA(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted) resize-y flex-1"
            />
          </div>

          {/* List B */}
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="folder-b" className="text-sm font-semibold">Directory File List B (Target)</Label>
            <textarea
              id="folder-b"
              rows={8}
              placeholder="README.md&#10;src/index.js..."
              value={listB}
              onChange={(e) => setListB(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-xs focus:outline-none focus:ring-2 focus:ring-(--color-primary-light) focus:border-(--color-primary) text-(--color-text-primary) placeholder:text-(--color-text-muted) resize-y flex-1"
            />
          </div>
        </div>

        {/* Action presets */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setListA(PRESET_A)
              setListB(PRESET_B)
            }}
            className="text-xs h-8 border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer"
          >
            Load Presets Demo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs h-8 text-(--color-text-muted) hover:text-red-500 cursor-pointer ml-auto"
          >
            Clear Lists
          </Button>
        </div>

        {/* Tree Output comparison */}
        {diffTree && (
          <div className="space-y-3 pt-4 border-t border-(--color-border) animate-fade-in">
            <Label className="text-sm font-semibold">Directory Difference Tree Map</Label>
            <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) overflow-x-auto min-h-[150px] shadow-inner">
              {Object.keys(diffTree.children).length > 0 ? (
                <DiffTreeRender node={diffTree} />
              ) : (
                <div className="text-center text-xs text-(--color-text-muted) italic font-semibold py-4">
                  Directories are completely identical.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
