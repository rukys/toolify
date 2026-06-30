import { Metadata } from 'next'
import PercentageClient from './percentage-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Percentage & Ratio Calculator — Free Online Math Tools | Toolify',
    description: 'Calculate quick percentages, values, percentage changes (increases/decreases), and simplify aspect ratios in one interactive dashboard.',
    keywords: ['percentage calculator', 'ratio simplifier', 'aspect ratio calculator', 'percentage increase decoder', 'percentage change calculator', 'quick math tools'],
  }
}

export default function PercentagePage() {
  return <PercentageClient />
}
