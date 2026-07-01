import { Metadata } from 'next'
import BPMMetronomeClient from './bpm-metronome-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'BPM Tapper & Visual Metronome — Tap Tempo | Toolify',
    description: 'Calculate song tempos by tapping along on your keyboard, and play a synthesized click metronome with adjustable beats and time signatures.',
    keywords: ['bpm tapper online', 'tap tempo song', 'visual metronome clock', 'find song bpm', 'music timing tool', 'metronome click track'],
  }
}

export default function BPMMetronomePage() {
  return <BPMMetronomeClient />
}
