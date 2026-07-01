'use client'

import { useState, useRef, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, RotateCcw } from 'lucide-react'
import { insertNode, deleteNode, getInorderTraversal, BSTNode } from '@/lib/utils/bst-helper'

export default function BSTVisualizerClient() {
  const tool = getToolById('bst-visualizer')!
  const [tree, setTree] = useState<BSTNode | null>({
    value: 50,
    left: {
      value: 30,
      left: { value: 20, left: null, right: null },
      right: { value: 40, left: null, right: null },
    },
    right: {
      value: 70,
      left: { value: 60, left: null, right: null },
      right: { value: 80, left: null, right: null },
    },
  })
  const [valToInsert, setValToInsert] = useState('')
  const [valToDelete, setValToDelete] = useState('')
  const [traversal, setTraversal] = useState<number[]>([20, 30, 40, 50, 60, 70, 80])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Re-render canvas on tree changes
  useEffect(() => {
    drawBST()
    if (tree) {
      setTraversal(getInorderTraversal(tree))
    } else {
      setTraversal([])
    }
  }, [tree])

  const drawBST = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (!tree) {
      ctx.fillStyle = '#94a3b8'
      ctx.font = 'italic 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('BST is empty. Insert a value to start.', canvas.width / 2, canvas.height / 2)
      return
    }

    // Draw tree recursively starting from root
    const rootX = canvas.width / 2
    const rootY = 40
    const initialSpace = canvas.width / 4

    const drawNode = (node: BSTNode, x: number, y: number, space: number) => {
      // Draw lines to children first (so they are rendered under the circle)
      if (node.left) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x - space, y + 55)
        ctx.strokeStyle = '#94a3b8'
        ctx.lineWidth = 2
        ctx.stroke()
        drawNode(node.left, x - space, y + 55, space * 0.5)
      }

      if (node.right) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + space, y + 55)
        ctx.strokeStyle = '#94a3b8'
        ctx.lineWidth = 2
        ctx.stroke()
        drawNode(node.right, x + space, y + 55, space * 0.5)
      }

      // Draw node circle wrapper
      ctx.beginPath()
      ctx.arc(x, y, 16, 0, 2 * Math.PI)
      ctx.fillStyle = '#2563eb' // Toolify primary blue
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw numeric text value
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.value.toString(), x, y)
    }

    drawNode(tree, rootX, rootY, initialSpace)
  }

  const handleInsert = () => {
    const num = parseInt(valToInsert, 10)
    if (isNaN(num)) return
    
    // Copy the tree deeply or trigger update
    setTree((prev) => {
      if (!prev) return { value: num, left: null, right: null }
      const newTree = JSON.parse(JSON.stringify(prev))
      return insertNode(newTree, num)
    })
    setValToInsert('')
  }

  const handleDelete = () => {
    const num = parseInt(valToDelete, 10)
    if (isNaN(num)) return
    
    setTree((prev) => {
      if (!prev) return null
      const newTree = JSON.parse(JSON.stringify(prev))
      return deleteNode(newTree, num)
    })
    setValToDelete('')
  }

  const handleReset = () => {
    setTree(null)
    setTraversal([])
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Top controls configuration row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          {/* Insert */}
          <div className="space-y-1.5">
            <Label htmlFor="bst-insert-val" className="text-xs font-semibold text-(--color-text-muted)">Insert Node Value</Label>
            <div className="flex gap-2">
              <Input
                id="bst-insert-val"
                type="number"
                placeholder="e.g. 55"
                value={valToInsert}
                onChange={(e) => setValToInsert(e.target.value)}
                className="h-8.5 bg-(--color-surface) border-(--color-border) text-xs"
              />
              <Button onClick={handleInsert} className="bg-(--color-primary) hover:bg-(--color-primary-dark) text-white cursor-pointer h-8.5">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Delete */}
          <div className="space-y-1.5">
            <Label htmlFor="bst-delete-val" className="text-xs font-semibold text-(--color-text-muted)">Delete Node Value</Label>
            <div className="flex gap-2">
              <Input
                id="bst-delete-val"
                type="number"
                placeholder="e.g. 30"
                value={valToDelete}
                onChange={(e) => setValToDelete(e.target.value)}
                className="h-8.5 bg-(--color-surface) border-(--color-border) text-xs"
              />
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer h-8.5">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full border-(--color-border) hover:bg-(--color-surface) text-xs cursor-pointer h-8.5"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              <span>Clear Tree</span>
            </Button>
          </div>
        </div>

        {/* Tree visual canvas */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Binary Search Tree Sandbox Canvas</Label>
          <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex justify-center items-center overflow-x-auto min-h-[320px]">
            <canvas
              ref={canvasRef}
              width={600}
              height={280}
              className="max-w-full bg-(--color-surface) border border-(--color-border)/40 rounded-lg shadow-inner"
            />
          </div>
        </div>

        {/* Traversal sequence outputs */}
        {traversal.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-(--color-border) animate-fade-in">
            <Label className="text-xs font-bold uppercase tracking-wider text-(--color-text-muted)">
              Sorted Inorder Traversal Array Sequence
            </Label>
            <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-sm font-bold text-(--color-primary) flex gap-2 flex-wrap shadow-inner">
              {traversal.map((val, idx) => (
                <span key={`${val}-${idx}`} className="bg-(--color-surface) border border-(--color-border) py-1 px-3 rounded-md shadow-xs">
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
