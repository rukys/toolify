import { Metadata } from 'next'
import SVGVisualizerClient from './svg-visualizer-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'SVG Path Visualizer — Interactive SVG Path Preview | Toolify',
    description: 'Paste raw SVG path coordinate strings (d parameter) to render, customize styles, and visualize vectors instantly inside a grid coordinate playground.',
    keywords: ['svg path visualizer', 'svg preview online', 'draw svg path', 'interactive svg grid', 'vector path inspector', 'svg coordinate tool'],
  }
}

export default function SVGVisualizerPage() {
  return <SVGVisualizerClient />
}
