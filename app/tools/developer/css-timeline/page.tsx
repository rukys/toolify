import { Metadata } from 'next'
import CSSTimelineClient from './css-timeline-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CSS Keyframe Animation Timeline Builder | Toolify',
    description: 'Design CSS transition keyframe animations visually. Configure stops (scale, rotation, offsets, colors), preview animations in real-time, and copy clean CSS code.',
    keywords: ['css keyframe builder', 'css animation timeline generator', 'web animation designer', 'keyframes css generator', 'visual timeline creator', 'custom transition tool'],
  }
}

export default function CSSTimelinePage() {
  return <CSSTimelineClient />
}
