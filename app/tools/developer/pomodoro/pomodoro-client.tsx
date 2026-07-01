'use client'

import { useState, useEffect, useRef } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Plus, Trash2, CheckCircle } from 'lucide-react'

interface PomodoroTask {
  id: string
  text: string
  completed: boolean
  cycles: number
}

type Mode = 'work' | 'short' | 'long'

const MODE_TIMES = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
}

// Zero-deps synthesize synth beep using native Web Audio API
function playAlertBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5 note
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
  } catch {
    // blocked or unsupported
  }
}

export default function PomodoroClient() {
  const tool = getToolById('pomodoro')!
  const [mode, setMode] = useState<Mode>('work')
  const [timeLeft, setTimeLeft] = useState(MODE_TIMES.work)
  const [isRunning, setIsRunning] = useState(false)
  
  // Tasks state
  const [tasks, setTasks] = useState<PomodoroTask[]>([])
  const [newTaskText, setNewTaskText] = useState('')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load tasks on mount
  useEffect(() => {
    const cached = localStorage.getItem('pomodoro-tasks-cached')
    if (cached) {
      try {
        setTasks(JSON.parse(cached))
      } catch {
        // ignore invalid cache
      }
    }
  }, [])

  // Sync tasks to cache
  useEffect(() => {
    localStorage.setItem('pomodoro-tasks-cached', JSON.stringify(tasks))
  }, [tasks])

  // Timer tick effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, mode])

  const handleTimerComplete = () => {
    setIsRunning(false)
    playAlertBeep()
    
    // Increment cycles if we were working
    if (mode === 'work' && activeTaskId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === activeTaskId ? { ...t, cycles: t.cycles + 1 } : t))
      )
    }
    
    // Switch modes
    if (mode === 'work') {
      setMode('short')
      setTimeLeft(MODE_TIMES.short)
    } else {
      setMode('work')
      setTimeLeft(MODE_TIMES.work)
    }
  }

  const handleModeChange = (newMode: Mode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(MODE_TIMES[newMode])
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(MODE_TIMES[mode])
  }

  const handleAddTask = () => {
    const txt = newTaskText.trim()
    if (!txt) return
    const newTask: PomodoroTask = {
      id: Date.now().toString(),
      text: txt,
      completed: false,
      cycles: 0,
    }
    setTasks((prev) => [...prev, newTask])
    if (!activeTaskId) {
      setActiveTaskId(newTask.id)
    }
    setNewTaskText('')
  }

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (activeTaskId === id) {
      setActiveTaskId(null)
    }
  }

  // Format timeLeft (e.g. 1500 -> "25:00")
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Timer Panel */}
        <div className="md:col-span-3 p-6 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex flex-col items-center justify-center gap-6 shadow-sm">
          {/* Mode selectors */}
          <div className="flex gap-1.5 p-1 rounded-lg bg-(--color-surface) border border-(--color-border) w-full max-w-sm">
            {([
              { val: 'work', label: 'Work Focus' },
              { val: 'short', label: 'Short Break' },
              { val: 'long', label: 'Long Break' },
            ] as { val: Mode; label: string }[]).map((m) => (
              <button
                key={m.val}
                onClick={() => handleModeChange(m.val)}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all cursor-pointer ${
                  mode === m.val
                    ? 'bg-(--color-primary) text-white'
                    : 'text-(--color-text-secondary) hover:bg-(--color-surface-alt)'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Large Clock numbers display */}
          <div className="space-y-1 text-center py-4">
            <h2 className="text-6xl sm:text-7xl font-bold font-mono text-(--color-text-primary) tracking-wider drop-shadow-xs">
              {formatTime(timeLeft)}
            </h2>
            <span className="text-[10px] uppercase font-bold text-(--color-text-muted) tracking-widest block">
              {mode === 'work' ? 'Stay Focused 🎯' : 'Time for a break ☕'}
            </span>
          </div>

          {/* Clock controls */}
          <div className="flex gap-2 w-full max-w-sm">
            <Button
              onClick={() => setIsRunning((r) => !r)}
              className="flex-1 bg-(--color-primary) hover:bg-(--color-primary-dark) text-white cursor-pointer h-9 flex items-center justify-center gap-1 text-xs font-semibold"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Focus</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-(--color-border) hover:bg-(--color-surface) cursor-pointer h-9 text-xs"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Task Board logger panel */}
        <div className="md:col-span-2 p-6 rounded-xl border border-(--color-border) bg-(--color-surface-alt) flex flex-col gap-4 shadow-sm">
          <h3 className="text-sm font-bold text-(--color-text-primary) border-b border-(--color-border)/50 pb-2">
            Focus Task Board
          </h3>

          {/* Input task entry */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="What are you working on?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="bg-(--color-surface) border-(--color-border) text-xs h-8.5"
            />
            <Button
              onClick={handleAddTask}
              className="bg-(--color-primary) hover:bg-(--color-primary-dark) text-white cursor-pointer h-8.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Tasks list */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {tasks.length > 0 ? (
              tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => !t.completed && setActiveTaskId(t.id)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 transition-colors cursor-pointer select-none ${
                    activeTaskId === t.id && !t.completed
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-(--color-surface) border-(--color-border)/60 hover:bg-(--color-surface-alt)'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => handleToggleTask(t.id)}
                      className="w-4 h-4 rounded border-(--color-border) text-(--color-primary) focus:ring-(--color-primary) cursor-pointer shrink-0"
                    />
                    <span className={`text-xs truncate font-medium ${t.completed ? 'line-through text-(--color-text-muted)' : 'text-(--color-text-secondary)'}`}>
                      {t.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Pomodoro Cycles Count indicators */}
                    <span className="text-[10px] font-bold text-(--color-primary) bg-(--color-primary-light)/10 py-0.5 px-2 rounded-full border border-(--color-primary)/20">
                      🍅 {t.cycles}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTask(t.id)
                      }}
                      className="p-1 rounded text-(--color-text-muted) hover:text-(--color-danger) cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-(--color-text-muted) italic font-semibold py-8">
                No focus tasks listed yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
