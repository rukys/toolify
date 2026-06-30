import { Metadata } from 'next'
import CubicBezierClient from './cubic-bezier-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Cubic-Bezier Easing Builder — CSS Transition Curve Creator | Toolify',
    description: 'Design custom easing transition functions visually. Drag control handles on an interactive canvas, test animations in real-time, and copy CSS cubic-bezier code.',
    keywords: ['cubic-bezier generator', 'css transition curves', 'animation easing builder', 'css cubic-bezier', 'easing visualizer', 'cubic bezier drag'],
  }
}

export default function CubicBezierPage() {
  return <CubicBezierClient />
}
