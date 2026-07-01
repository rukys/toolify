import { Metadata } from 'next'
import ChartGeneratorClient from './chart-generator-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CSV to High-Res Chart Generator — Online Chart Maker | Toolify',
    description: 'Transform tabular CSV raw data into beautiful, high-res Line, Bar, or Pie charts. Customize styles, scale colors, and download graphs as PNG images.',
    keywords: ['csv chart generator', 'online chart maker', 'csv to graph', 'generate bar chart', 'download pie chart', 'no dependency chart generator'],
  }
}

export default function ChartGeneratorPage() {
  return <ChartGeneratorClient />
}
