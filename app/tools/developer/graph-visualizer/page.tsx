import { Metadata } from 'next'
import GraphVisualizerClient from './graph-visualizer-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Graph Network Physics Simulator — Interactive Nodes | Toolify',
    description: 'Draw interactive node-relationship graphs with live spring physics repulsion. Drag nodes, configure connections, and simulate network models.',
    keywords: ['graph network visualizer', 'node relationship map', 'spring physics graph', 'd3 graph simulator online', 'interactive network diagram maker'],
  }
}

export default function GraphVisualizerPage() {
  return <GraphVisualizerClient />
}
