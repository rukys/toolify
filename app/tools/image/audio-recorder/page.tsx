import { Metadata } from 'next'
import AudioRecorderClient from './audio-recorder-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Microphone Voice Recorder & Waveform Trimmer | Toolify',
    description: 'Record voice audio directly from your microphone, visualize waveforms, trim audio segments, and download the edited file as WAV offline.',
    keywords: ['voice recorder online', 'trim audio files', 'microphone recorder web', 'waveform audio editor', 'wav exporter online', 'cut audio segments'],
  }
}

export default function AudioRecorderPage() {
  return <AudioRecorderClient />
}
