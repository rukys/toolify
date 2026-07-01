'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, Play, Pause, Plus, Trash2 } from 'lucide-react'

interface Keyframe {
  id: string
  stop: number // 0 to 100
  scale: number
  rotate: number
  x: number
  y: number
  bgColor: string
  borderRadius: number
}

const DEFAULT_KEYFRAMES: Keyframe[] = [
  { id: '1', stop: 0, scale: 1, rotate: 0, x: 0, y: 0, bgColor: '#3b82f6', borderRadius: 8 },
  { id: '2', stop: 50, scale: 1.3, rotate: 180, x: 60, y: -20, bgColor: '#ef4444', borderRadius: 50 },
  { id: '3', stop: 100, scale: 1, rotate: 360, x: 0, y: 0, bgColor: '#3b82f6', borderRadius: 8 },
]

export default function CSSTimelineClient() {
  const tool = getToolById('css-timeline')!
  const [keyframes, setKeyframes] = useState<Keyframe[]>(DEFAULT_KEYFRAMES)
  const [activeFrameId, setActiveFrameId] = useState<string>('2') // Default to editing the 50% stop
  const [isPlaying, setIsPlaying] = useState(true)
  const [duration, setDuration] = useState(2.5) // in seconds
  const [copied, setCopied] = useState(false)

  const activeFrame = keyframes.find((k) => k.id === activeFrameId)

  const handleUpdateFrame = (fields: Partial<Keyframe>) => {
    setKeyframes((prev) =>
      prev.map((k) => (k.id === activeFrameId ? { ...k, ...fields } : k))
    )
  }

  const handleAddFrame = () => {
    const nextStop = Math.min(
      95,
      Math.max(5, Math.round((keyframes[keyframes.length - 1]?.stop || 50) / 2))
    )
    const newId = Date.now().toString()
    const newFrame: Keyframe = {
      id: newId,
      stop: nextStop,
      scale: 1,
      rotate: 0,
      x: 0,
      y: 0,
      bgColor: '#10b981',
      borderRadius: 12,
    }
    setKeyframes((prev) => [...prev, newFrame].sort((a, b) => a.stop - b.stop))
    setActiveFrameId(newId)
  }

  const handleDeleteFrame = (id: string) => {
    if (keyframes.length <= 2) return // Keep at least 2 frames (start/end)
    setKeyframes((prev) => prev.filter((k) => k.id !== id))
    // Select another frame
    const remaining = keyframes.filter((k) => k.id !== id)
    setActiveFrameId(remaining[0].id)
  }

  // Construct @keyframes CSS code
  const cssKeyframesCode = `@keyframes custom-pulse-animation {
${keyframes
  .map(
    (k) => `  ${k.stop}% {
    transform: translate(${k.x}px, ${k.y}px) rotate(${k.rotate}deg) scale(${k.scale});
    background-color: ${k.bgColor};
    border-radius: ${k.borderRadius}%;
  }`
  )
  .join('\n')}
}

.animating-box {
  animation: custom-pulse-animation ${duration}s infinite linear;
}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cssKeyframesCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Dynamic style tag injection for preview box */}
        <style>{`
          @keyframes custom-pulse-animation {
            ${keyframes
              .map(
                (k) => `
              ${k.stop}% {
                transform: translate(${k.x}px, ${k.y}px) rotate(${k.rotate}deg) scale(${k.scale});
                background-color: ${k.bgColor};
                border-radius: ${k.borderRadius}%;
              }
            `
              )
              .join('\n')}
          }
        `}</style>

        {/* Timeline representation stops bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold text-(--color-text-muted)">Animation Timeline Stops</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFrame}
              className="flex items-center gap-1 text-[10px] h-6 border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Keyframe</span>
            </Button>
          </div>
          <div className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex gap-2 flex-wrap items-center">
            {keyframes.map((k) => (
              <div key={k.id} className="flex items-center gap-1 bg-(--color-surface) border border-(--color-border) rounded-lg p-1.5 shadow-xs">
                <button
                  onClick={() => setActiveFrameId(k.id)}
                  className={`text-xs font-mono font-bold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    activeFrameId === k.id
                      ? 'bg-(--color-primary) text-white'
                      : 'text-(--color-text-secondary) hover:bg-(--color-surface-alt)'
                  }`}
                >
                  {k.stop}%
                </button>
                <button
                  onClick={() => handleDeleteFrame(k.id)}
                  disabled={keyframes.length <= 2}
                  className="p-1 rounded-md text-(--color-text-muted) hover:text-(--color-danger) disabled:opacity-30 cursor-pointer"
                  title="Delete keyframe stop"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Controls and preview section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active stop properties editor */}
          {activeFrame && (
            <div className="md:col-span-2 p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) pb-2 border-b border-(--color-border)/50">
                Configure Properties for {activeFrame.stop}% Stop
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Stop Percentage slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <Label htmlFor="stop-slider">Stop Percent</Label>
                    <span className="text-(--color-primary) font-bold">{activeFrame.stop}%</span>
                  </div>
                  <input
                    id="stop-slider"
                    type="range"
                    min={0}
                    max={100}
                    value={activeFrame.stop}
                    onChange={(e) => handleUpdateFrame({ stop: Number(e.target.value) })}
                    className="w-full h-1 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                  />
                </div>

                {/* Scale slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <Label htmlFor="scale-slider">Scale</Label>
                    <span className="text-(--color-primary) font-bold">{activeFrame.scale}x</span>
                  </div>
                  <input
                    id="scale-slider"
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={activeFrame.scale}
                    onChange={(e) => handleUpdateFrame({ scale: Number(e.target.value) })}
                    className="w-full h-1 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                  />
                </div>

                {/* Rotation slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <Label htmlFor="rotate-slider">Rotation</Label>
                    <span className="text-(--color-primary) font-bold">{activeFrame.rotate}°</span>
                  </div>
                  <input
                    id="rotate-slider"
                    type="range"
                    min={-360}
                    max={360}
                    value={activeFrame.rotate}
                    onChange={(e) => handleUpdateFrame({ rotate: Number(e.target.value) })}
                    className="w-full h-1 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                  />
                </div>

                {/* Border Radius */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <Label htmlFor="radius-slider">Border Radius</Label>
                    <span className="text-(--color-primary) font-bold">{activeFrame.borderRadius}%</span>
                  </div>
                  <input
                    id="radius-slider"
                    type="range"
                    min={0}
                    max={50}
                    value={activeFrame.borderRadius}
                    onChange={(e) => handleUpdateFrame({ borderRadius: Number(e.target.value) })}
                    className="w-full h-1 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                  />
                </div>

                {/* Translate X */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <Label htmlFor="x-slider">Translate X</Label>
                    <span className="text-(--color-primary) font-bold">{activeFrame.x}px</span>
                  </div>
                  <input
                    id="x-slider"
                    type="range"
                    min={-100}
                    max={100}
                    value={activeFrame.x}
                    onChange={(e) => handleUpdateFrame({ x: Number(e.target.value) })}
                    className="w-full h-1 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                  />
                </div>

                {/* Translate Y */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <Label htmlFor="y-slider">Translate Y</Label>
                    <span className="text-(--color-primary) font-bold">{activeFrame.y}px</span>
                  </div>
                  <input
                    id="y-slider"
                    type="range"
                    min={-100}
                    max={100}
                    value={activeFrame.y}
                    onChange={(e) => handleUpdateFrame({ y: Number(e.target.value) })}
                    className="w-full h-1 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                  />
                </div>

                {/* Background color */}
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold text-(--color-text-muted)">Background color</Label>
                  <div className="flex gap-2.5">
                    <input
                      type="color"
                      value={activeFrame.bgColor}
                      onChange={(e) => handleUpdateFrame({ bgColor: e.target.value })}
                      className="w-8 h-8 rounded border border-(--color-border) cursor-pointer p-0 bg-transparent"
                      aria-label="Pick background color"
                    />
                    <Input
                      type="text"
                      value={activeFrame.bgColor}
                      onChange={(e) => handleUpdateFrame({ bgColor: e.target.value })}
                      className="h-8 text-xs font-mono border-(--color-border) bg-(--color-surface) focus-visible:ring-(--color-primary) max-w-[120px]"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Sandboxed visual preview sandbox box */}
          <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex flex-col justify-between items-center gap-6 min-h-[300px] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-(--color-text-muted) self-start">Visual sandbox preview</span>

            {/* Animating element */}
            <div className="w-16 h-16 shadow-lg z-10"
              style={{
                animation: isPlaying ? `custom-pulse-animation ${duration}s infinite linear` : 'none',
                // fallback styles if not playing
                backgroundColor: !isPlaying && activeFrame ? activeFrame.bgColor : undefined,
                borderRadius: !isPlaying && activeFrame ? `${activeFrame.borderRadius}%` : undefined,
                transform: !isPlaying && activeFrame 
                  ? `translate(${activeFrame.x}px, ${activeFrame.y}px) rotate(${activeFrame.rotate}deg) scale(${activeFrame.scale})` 
                  : undefined
              }}
            />

            {/* Sandbox playback and speed controls */}
            <div className="w-full space-y-3.5 pt-4 border-t border-(--color-border)/50">
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsPlaying((p) => !p)}
                  size="sm"
                  className="flex-1 bg-(--color-primary) text-white hover:bg-(--color-primary-dark) cursor-pointer text-xs flex items-center justify-center gap-1.5 h-8"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Play</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Speed slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-semibold text-(--color-text-muted)">
                  <Label htmlFor="speed-slider">Speed duration</Label>
                  <span className="font-bold">{duration}s</span>
                </div>
                <input
                  id="speed-slider"
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.1}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-1 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Code Output */}
        <div className="space-y-2 pt-4 border-t border-(--color-border)">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-semibold">CSS Keyframes Output Code</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-(--color-text-secondary) cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500 font-semibold">Copied Code!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy CSS</span>
                </>
              )}
            </Button>
          </div>
          <pre className="p-3.5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) font-mono text-[10px] text-(--color-text-primary) overflow-x-auto select-all leading-relaxed max-h-[180px]">
            {cssKeyframesCode}
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}
