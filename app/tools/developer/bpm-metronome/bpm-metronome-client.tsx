'use client'

import { useState, useEffect, useRef } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Music, Play, Pause, RefreshCw } from 'lucide-react'

type TimeSignature = 2 | 3 | 4

export default function BPMMetronomeClient() {
  const tool = getToolById('bpm-metronome')!

  // BPM Tapper states
  const [taps, setTaps] = useState<number[]>([])
  const [tappedBpm, setTappedBpm] = useState<number | null>(null)

  // Metronome states
  const [metronomeBpm, setMetronomeBpm] = useState(120)
  const [isTicking, setIsTicking] = useState(false)
  const [timeSig, setTimeSig] = useState<TimeSignature>(4)
  const [currentBeat, setCurrentBeat] = useState(0) // 0-indexed beat count

  const audioContextRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopMetronome()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Tap handler
  const handleTap = () => {
    const now = Date.now()
    setTaps((prev) => {
      const newTaps = [...prev, now].slice(-10) // keep last 10 taps
      if (newTaps.length > 1) {
        // Calculate intervals
        const intervals = []
        for (let i = 1; i < newTaps.length; i++) {
          intervals.push(newTaps[i] - newTaps[i - 1])
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
        const bpm = Math.round(60000 / avgInterval)
        setTappedBpm(bpm)
      }
      return newTaps
    })
  }

  // Keyboard Spacebar Listener for BPM Tapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleTap()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleResetTaps = () => {
    setTaps([])
    setTappedBpm(null)
  }

  // Synthesize professional click sound using Web Audio API
  const playClickSound = (isFirstBeat: boolean) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioCtx()
      }
      const ctx = audioContextRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // High click on beat 1, low click on other beats
      const freq = isFirstBeat ? 880 : 440
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    } catch {
      // blocked
    }
  }

  const startMetronome = () => {
    if (isTicking) return
    setIsTicking(true)
    setCurrentBeat(0)
    
    // Play initial sound beat
    playClickSound(true)

    const intervalMs = (60 / metronomeBpm) * 1000
    let nextBeat = 1

    intervalRef.current = setInterval(() => {
      const isFirst = nextBeat === 0
      playClickSound(isFirst)
      setCurrentBeat(nextBeat)
      nextBeat = (nextBeat + 1) % timeSig
    }, intervalMs)
  }

  const stopMetronome = () => {
    setIsTicking(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCurrentBeat(0)
  }

  // Re-schedule metronome if BPM or Time Signature changes while playing
  useEffect(() => {
    if (isTicking) {
      stopMetronome()
      startMetronome()
    }
  }, [metronomeBpm, timeSig])

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel 1: BPM Tapper */}
        <div className="p-6 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex flex-col items-center justify-between gap-5 min-h-[300px] shadow-sm">
          <div className="text-center space-y-1 self-start">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary)">
              BPM Tap Tempo Finder
            </h3>
            <span className="text-[10px] text-(--color-text-muted) font-semibold block">
              Tap along to the beat of any song using the button below or hit Spacebar.
            </span>
          </div>

          {/* Huge BPM display */}
          <div className="text-center">
            <h2 className="text-6xl font-bold font-mono text-(--color-text-primary) tracking-wide">
              {tappedBpm || '—'}
            </h2>
            <span className="text-[10px] uppercase font-bold text-(--color-text-muted) tracking-widest mt-1 block">
              {tappedBpm ? 'Calculated BPM' : 'Tap to start'}
            </span>
          </div>

          {/* Tap pad button */}
          <div className="w-full flex gap-2">
            <button
              onClick={handleTap}
              className="flex-1 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white font-semibold text-xs py-3 rounded-lg shadow-sm transition-all transform active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              Tap Rhythm
            </button>
            <Button
              variant="outline"
              onClick={handleResetTaps}
              disabled={taps.length === 0}
              className="border-(--color-border) hover:bg-(--color-surface) cursor-pointer h-10.5"
              title="Reset tapper data"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Panel 2: Visual Metronome */}
        <div className="p-6 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex flex-col justify-between gap-5 min-h-[300px] shadow-sm">
          <div className="text-center space-y-1 self-start w-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary)">
              Visual Metronome
            </h3>
            <span className="text-[10px] text-(--color-text-muted) font-semibold block">
              Adjust tempo speed and measure signature beats.
            </span>
          </div>

          {/* Metronome Beat pulses display */}
          <div className="flex gap-3 justify-center items-center py-2 w-full">
            {Array.from({ length: timeSig }).map((_, b) => {
              const isActive = isTicking && currentBeat === b
              return (
                <div
                  key={b}
                  className={`w-5 h-5 rounded-full transition-all border ${
                    isActive
                      ? b === 0
                        ? 'bg-red-500 border-transparent scale-125 shadow-md shadow-red-500/20'
                        : 'bg-(--color-primary) border-transparent scale-115 shadow-md shadow-blue-500/20'
                      : 'bg-(--color-surface) border-(--color-border)'
                  }`}
                />
              )
            })}
          </div>

          {/* Metronome configuration controls */}
          <div className="w-full space-y-4">
            {/* Speed slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <Label htmlFor="metronome-bpm-slider">Tempo Speed</Label>
                <span className="text-(--color-primary) font-bold">{metronomeBpm} BPM</span>
              </div>
              <input
                id="metronome-bpm-slider"
                type="range"
                min={40}
                max={240}
                value={metronomeBpm}
                onChange={(e) => setMetronomeBpm(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
              />
            </div>

            {/* Time signature selector */}
            <div className="grid grid-cols-3 gap-1.5">
              {([2, 3, 4] as TimeSignature[]).map((sig) => (
                <button
                  key={sig}
                  onClick={() => setTimeSig(sig)}
                  className={`text-xs font-semibold py-1 rounded-md border transition-all cursor-pointer ${
                    timeSig === sig
                      ? 'bg-(--color-primary) text-white border-transparent'
                      : 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-alt) text-(--color-text-secondary)'
                  }`}
                >
                  {sig}/4 Time
                </button>
              ))}
            </div>
          </div>

          {/* Metronome play action */}
          <Button
            onClick={isTicking ? stopMetronome : startMetronome}
            className={`w-full text-white cursor-pointer h-10.5 text-xs font-semibold flex items-center justify-center gap-1.5 ${
              isTicking
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            {isTicking ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Stop Metronome</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Metronome</span>
              </>
            )}
          </Button>
        </div>

      </div>
    </ToolLayout>
  )
}
