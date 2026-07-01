'use client'

import { useState, useRef, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, RefreshCw } from 'lucide-react'

interface NodeItem {
  id: string
  label: string
  x: number
  y: number
  vx: number
  vy: number
}

interface EdgeItem {
  source: string
  target: string
}

const DEFAULT_NODES: NodeItem[] = [
  { id: '1', label: 'A', x: 150, y: 100, vx: 0, vy: 0 },
  { id: '2', label: 'B', x: 250, y: 80, vx: 0, vy: 0 },
  { id: '3', label: 'C', x: 350, y: 150, vx: 0, vy: 0 },
  { id: '4', label: 'D', x: 280, y: 230, vx: 0, vy: 0 },
  { id: '5', label: 'E', x: 120, y: 220, vx: 0, vy: 0 },
]

const DEFAULT_EDGES: EdgeItem[] = [
  { source: '1', target: '2' },
  { source: '2', target: '3' },
  { source: '3', target: '4' },
  { source: '4', target: '5' },
  { source: '5', target: '1' },
  { source: '1', target: '3' },
]

export default function GraphVisualizerClient() {
  const tool = getToolById('graph-visualizer')!
  const [nodes, setNodes] = useState<NodeItem[]>(DEFAULT_NODES)
  const [edges, setEdges] = useState<EdgeItem[]>(DEFAULT_EDGES)

  const [newNodeLabel, setNewNodeLabel] = useState('')
  const [newEdgeSource, setNewEdgeSource] = useState('1')
  const [newEdgeTarget, setNewEdgeTarget] = useState('2')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const dragNodeIdRef = useRef<string | null>(null)
  
  // Keep nodes and edges refs for the animation loop
  const nodesRef = useRef<NodeItem[]>(DEFAULT_NODES)
  const edgesRef = useRef<EdgeItem[]>(DEFAULT_EDGES)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    edgesRef.current = edges
  }, [edges])

  // Physics animation tick loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const kRepel = 600 // repulsion coefficient
    const kAttract = 0.04 // spring coefficient
    const restLength = 100 // rest spring length
    const friction = 0.85
    const centerGravity = 0.015

    const tick = () => {
      const activeNodes = [...nodesRef.current]
      const activeEdges = [...edgesRef.current]
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // 1. Calculate Repulsion Forces (All node pairs)
      for (let i = 0; i < activeNodes.length; i++) {
        const nodeA = activeNodes[i]
        for (let j = i + 1; j < activeNodes.length; j++) {
          const nodeB = activeNodes[j]
          const dx = nodeB.x - nodeA.x
          const dy = nodeB.y - nodeA.y
          const distSq = dx * dx + dy * dy
          const dist = Math.sqrt(distSq) || 0.1

          if (dist < 220) {
            const force = kRepel / (dist * dist)
            const fx = (dx / dist) * force
            const fy = (dy / dist) * force

            // Apply opposite force vectors
            nodeA.vx -= fx
            nodeA.vy -= fy
            nodeB.vx += fx
            nodeB.vy += fy
          }
        }

        // Gravity pull to center
        nodeA.vx += (centerX - nodeA.x) * centerGravity
        nodeA.vy += (centerY - nodeA.y) * centerGravity
      }

      // 2. Calculate Spring Attraction Forces (Connected edges)
      for (const edge of activeEdges) {
        const nodeA = activeNodes.find((n) => n.id === edge.source)
        const nodeB = activeNodes.find((n) => n.id === edge.target)

        if (nodeA && nodeB) {
          const dx = nodeB.x - nodeA.x
          const dy = nodeB.y - nodeA.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1
          const force = kAttract * (dist - restLength)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force

          nodeA.vx += fx
          nodeA.vy += fy
          nodeB.vx -= fx
          nodeB.vy -= fy
        }
      }

      // 3. Update Coordinates based on velocities (unless being dragged!)
      for (const node of activeNodes) {
        if (node.id !== dragNodeIdRef.current) {
          node.x += node.vx
          node.y += node.vy
          node.vx *= friction
          node.vy *= friction

          // Keep within canvas limits
          node.x = Math.max(20, Math.min(canvas.width - 20, node.x))
          node.y = Math.max(20, Math.min(canvas.height - 20, node.y))
        } else {
          node.vx = 0
          node.vy = 0
        }
      }

      // 4. Render Graph Visuals
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connection lines (edges)
      for (const edge of activeEdges) {
        const nodeA = activeNodes.find((n) => n.id === edge.source)
        const nodeB = activeNodes.find((n) => n.id === edge.target)
        if (nodeA && nodeB) {
          ctx.beginPath()
          ctx.moveTo(nodeA.x, nodeA.y)
          ctx.lineTo(nodeB.x, nodeB.y)
          ctx.strokeStyle = '#94a3b8' // Slate color edges
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      // Draw node circles
      for (const node of activeNodes) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI)
        ctx.fillStyle = '#2563eb'
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()

        // Text label
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.label, node.x, node.y)
      }

      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // Mouse drag handler loops
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Check if mouse is over any node
    const clickedNode = nodes.find((n) => {
      const dx = n.x - mouseX
      const dy = n.y - mouseY
      return dx * dx + dy * dy < 16 * 16
    })

    if (clickedNode) {
      dragNodeIdRef.current = clickedNode.id
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const dragId = dragNodeIdRef.current
    if (!dragId) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setNodes((prev) =>
      prev.map((n) => (n.id === dragId ? { ...n, x: mouseX, y: mouseY } : n))
    )
  }

  const handleMouseUp = () => {
    dragNodeIdRef.current = null
  }

  const handleAddNode = () => {
    const label = newNodeLabel.trim()
    if (!label) return
    const id = Date.now().toString()
    const newNode: NodeItem = {
      id,
      label,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 150,
      vx: 0,
      vy: 0,
    }
    setNodes((prev) => [...prev, newNode])
    setNewNodeLabel('')
    
    // Default selecting values
    if (nodes.length >= 1) {
      setNewEdgeSource(nodes[0].id)
      setNewEdgeTarget(id)
    }
  }

  const handleAddEdge = () => {
    if (newEdgeSource === newEdgeTarget) return
    // Check if edge already exists
    const exists = edges.some(
      (e) =>
        (e.source === newEdgeSource && e.target === newEdgeTarget) ||
        (e.source === newEdgeTarget && e.target === newEdgeSource)
    )
    if (exists) return

    setEdges((prev) => [...prev, { source: newEdgeSource, target: newEdgeTarget }])
  }

  const handleReset = () => {
    setNodes(DEFAULT_NODES)
    setEdges(DEFAULT_EDGES)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Graph inputs control board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt)">
          {/* Add node */}
          <div className="space-y-1.5">
            <Label htmlFor="graph-add-node" className="text-xs font-semibold text-(--color-text-muted)">Add New Node</Label>
            <div className="flex gap-2">
              <Input
                id="graph-add-node"
                type="text"
                placeholder="e.g. F"
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                className="h-8.5 bg-(--color-surface) border-(--color-border) text-xs"
              />
              <Button onClick={handleAddNode} className="bg-(--color-primary) hover:bg-(--color-primary-dark) text-white cursor-pointer h-8.5">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Add edge relationship */}
          <div className="space-y-1.5">
            <Label htmlFor="graph-add-edge" className="text-xs font-semibold text-(--color-text-muted)">Add Relation Edge</Label>
            <div className="flex gap-1.5">
              <select
                value={newEdgeSource}
                onChange={(e) => setNewEdgeSource(e.target.value)}
                className="flex-1 h-8.5 rounded-md border border-(--color-border) bg-(--color-surface) px-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) text-(--color-text-primary)"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
              <span className="self-center text-xs font-bold text-(--color-text-muted)">to</span>
              <select
                value={newEdgeTarget}
                onChange={(e) => setNewEdgeTarget(e.target.value)}
                className="flex-1 h-8.5 rounded-md border border-(--color-border) bg-(--color-surface) px-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) text-(--color-text-primary)"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
              <Button onClick={handleAddEdge} className="bg-(--color-primary) hover:bg-(--color-primary-dark) text-white cursor-pointer h-8.5">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Clear controls */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full border-(--color-border) hover:bg-(--color-surface) text-xs cursor-pointer h-8.5"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              <span>Reset to Defaults</span>
            </Button>
          </div>
        </div>

        {/* Physics Canvas simulator display */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-semibold">Interactive Physics Force Network Sandbox</Label>
            <span className="text-[10px] text-(--color-text-muted) font-semibold block">
              Drag nodes with your mouse to stretch the spring network relations.
            </span>
          </div>

          <div className="p-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex justify-center items-center overflow-x-auto min-h-[340px]">
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="max-w-full bg-(--color-surface) border border-(--color-border)/40 rounded-lg shadow-inner cursor-pointer"
            />
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
