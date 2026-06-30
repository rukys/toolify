import { Metadata } from 'next'
import MathPlotterClient from './math-plotter-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Visual Math Function Plotter — Interactive Math Grapher | Toolify',
    description: 'Plot mathematical algebraic functions and curves on an interactive 2D coordinate grid. Supports sine, cosine, quadratic, and cubic functions.',
    keywords: ['math function plotter', 'math grapher online', 'algebra plotter', 'sine wave plotter', 'draw math curves', 'interactive function graphing'],
  }
}

export default function MathPlotterPage() {
  return <MathPlotterClient />
}
