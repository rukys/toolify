'use client'

import { useState, useRef, useEffect } from 'react'
import { ToolLayout } from '@/components/tool/tool-layout'
import { getToolById } from '@/lib/tools-registry'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Mic, Square, Trash2, Scissors, Download, Info } from 'lucide-react'

// Zero-deps WAV encoder helper
function bufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels
  const length = buffer.length * numOfChan * 2 + 44
  const bufferArr = new ArrayBuffer(length)
  const view = new DataView(bufferArr)
  const channels = []
  let i
  let sample
  let offset = 0
  let pos = 0

  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true)
    pos += 2
  }
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true)
    pos += 4
  }

  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8)
  setUint32(0x45564157) // "WAVE"
  setUint32(0x20746d66) // "fmt "
  setUint32(16)
  setUint16(1) // PCM
  setUint16(numOfChan)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * numOfChan)
  setUint16(numOfChan * 2)
  setUint16(16) // 16-bit
  setUint32(0x61746164) // "data"
  setUint32(length - pos - 4)

  for (i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i))
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]))
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(pos, sample, true)
      pos += 2
    }
    offset++
  }

  return new Blob([bufferArr], { type: 'audio/wav' })
}

export default function AudioRecorderClient() {
  const tool = getToolById('audio-recorder')!
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string>('')
  const [duration, setDuration] = useState(0) // seconds
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null)
  const [trimmedUrl, setTrimmedUrl] = useState<string>('')
  const [isTrimming, setIsTrimming] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  
  // Real-time animation canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Track recording duration
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      stopAllStreams()
    }
  }, [])

  const stopAllStreams = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }

  const startRecording = async () => {
    chunksRef.current = []
    setRecordedBlob(null)
    setRecordedUrl('')
    setTrimmedBlob(null)
    setTrimmedUrl('')
    setDuration(0)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up Audio Analyser for visual waves
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const audioCtx = new AudioCtx()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      // Draw real-time waves
      drawRealTimeWaves()

      const options = { mimeType: 'audio/webm' }
      let recorder
      try {
        recorder = new MediaRecorder(stream, options)
      } catch {
        // Fallback for Safari/browsers lacking webm audio
        recorder = new MediaRecorder(stream)
      }
      
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = async () => {
        const fullBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        setRecordedBlob(fullBlob)
        const url = URL.createObjectURL(fullBlob)
        setRecordedUrl(url)
        
        // Calculate dynamic end times
        setStartTime(0)
        setEndTime(duration)
      }

      recorder.start()
      setIsRecording(true)

      // Start duration counter
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)

    } catch (err) {
      alert('Could not gain microphone access. Check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    stopAllStreams()
  }

  // Draw real-time animation waves on canvas
  const drawRealTimeWaves = () => {
    if (!canvasRef.current || !analyserRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)
      analyserRef.current?.getByteFrequencyData(dataArray)

      ctx.fillStyle = '#0f172a' // Dark surface slate background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2
      let barHeight
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5

        ctx.fillStyle = `rgb(59, 130, 246)` // primary blue color theme
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight)

        x += barWidth
      }
    }

    draw()
  }

  const handleTrim = async () => {
    if (!recordedBlob) return
    setIsTrimming(true)
    
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioCtx()
      
      const arrayBuffer = await recordedBlob.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      
      // Calculate sample boundaries
      const sampleRate = audioBuffer.sampleRate
      const startSample = Math.floor(startTime * sampleRate)
      const endSample = Math.floor(endTime * sampleRate)
      const frameCount = Math.max(1, endSample - startSample)

      // Create new buffer for trimmed segment
      const trimmedBuffer = ctx.createBuffer(
        audioBuffer.numberOfChannels,
        frameCount,
        sampleRate
      )

      for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
        const channelData = audioBuffer.getChannelData(ch)
        const newChannelData = trimmedBuffer.getChannelData(ch)
        
        // Copy samples slice
        const segment = channelData.subarray(startSample, endSample)
        newChannelData.set(segment)
      }

      // Encode trimmed buffer to WAV Blob
      const wavBlob = bufferToWav(trimmedBuffer)
      setTrimmedBlob(wavBlob)
      const url = URL.createObjectURL(wavBlob)
      setTrimmedUrl(url)
      
      ctx.close()
    } catch (err) {
      alert('Failed to crop audio. Ensure browser decoding is supported.')
    } finally {
      setIsTrimming(false)
    }
  }

  const handleClear = () => {
    stopAllStreams()
    setRecordedBlob(null)
    setRecordedUrl('')
    setTrimmedBlob(null)
    setTrimmedUrl('')
    setDuration(0)
    setIsRecording(false)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        
        {/* Visual canvas waves display */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Waveform Wave Analyzer</Label>
          <div className="relative rounded-xl border border-(--color-border) bg-slate-900 overflow-hidden flex flex-col justify-center items-center p-4 min-h-[160px]">
            {isRecording ? (
              <canvas
                ref={canvasRef}
                width={400}
                height={120}
                className="w-full h-28 max-w-lg rounded-lg opacity-85"
              />
            ) : recordedBlob ? (
              <div className="text-center space-y-2 py-4">
                <span className="text-xs font-bold text-green-500 bg-green-500/10 border border-green-500/20 py-1 px-3 rounded-full uppercase tracking-wider">
                  Recording Completed
                </span>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Total duration: {duration} seconds
                </p>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 font-semibold py-8 italic">
                Click Record voice to capture microphone input.
              </div>
            )}
            
            {/* Visual clock display */}
            {isRecording && (
              <div className="absolute top-3 right-3 text-red-500 flex items-center gap-1.5 font-mono text-xs font-extrabold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>{duration}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white cursor-pointer h-9 flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <Mic className="w-4 h-4" />
              <span>Record Voice</span>
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white cursor-pointer h-9 flex items-center justify-center gap-1.5 text-xs font-semibold border border-slate-700"
            >
              <Square className="w-4 h-4" />
              <span>Stop Recording</span>
            </Button>
          )}
          
          {(recordedBlob || isRecording) && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="border-(--color-border) hover:bg-(--color-surface-alt) cursor-pointer h-9 text-xs"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Trimmer tools panel */}
        {recordedBlob && (
          <div className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface-alt) space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) pb-2 border-b border-(--color-border)/50 flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-(--color-primary)" />
              <span>Waveform Audio Trimmer</span>
            </h3>

            {/* Listen to raw audio */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-(--color-text-muted)">Raw Recording Playback</Label>
              <audio src={recordedUrl} controls className="w-full h-9" />
            </div>

            {/* Trimmer sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <Label htmlFor="start-trim-slider">Start Offset</Label>
                  <span className="text-(--color-primary) font-bold">{startTime.toFixed(1)}s</span>
                </div>
                <input
                  id="start-trim-slider"
                  type="range"
                  min={0}
                  max={Math.max(0.1, duration)}
                  step={0.1}
                  value={startTime}
                  onChange={(e) => setStartTime(Math.min(Number(e.target.value), endTime - 0.1))}
                  className="w-full h-1 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <Label htmlFor="end-trim-slider">End Offset</Label>
                  <span className="text-(--color-primary) font-bold">{endTime.toFixed(1)}s</span>
                </div>
                <input
                  id="end-trim-slider"
                  type="range"
                  min={0}
                  max={Math.max(0.1, duration)}
                  step={0.1}
                  value={endTime}
                  onChange={(e) => setEndTime(Math.max(Number(e.target.value), startTime + 0.1))}
                  className="w-full h-1 rounded-lg bg-(--color-border) appearance-none cursor-pointer accent-(--color-primary)"
                />
              </div>
            </div>

            {/* Action crop trigger */}
            <Button
              onClick={handleTrim}
              disabled={isTrimming}
              className="w-full bg-(--color-primary) hover:bg-(--color-primary-dark) text-white cursor-pointer h-9 text-xs font-semibold"
            >
              {isTrimming ? 'Processing trim segment...' : 'Crop & Export Segment'}
            </Button>
          </div>
        )}

        {/* Trimmed Export Output */}
        {trimmedBlob && (
          <div className="p-5 rounded-xl border border-green-500/20 bg-green-500/5 space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 pb-2 border-b border-green-500/20">
              Trimmed WAV Export Segment
            </h3>

            {/* Adjusted playback */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-green-700 dark:text-green-400">Cropped Segment Playback</Label>
              <audio src={trimmedUrl} controls className="w-full h-9" />
            </div>

            {/* Download button */}
            <a
              href={trimmedUrl}
              download="trimmed-audio-segment.wav"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer w-full justify-center"
            >
              <Download className="w-4 h-4" />
              <span>Download Trimmed WAV</span>
            </a>
          </div>
        )}

        {/* Information box */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">🔒 100% Secure Local Processing</h4>
            <p className="text-xs mt-1 leading-relaxed">
              Recording streams, visual amplitude canvases, and waveform trimming are executed entirely inside your browser client thread. Audio files never leave your device.
            </p>
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
