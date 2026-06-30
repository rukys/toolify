import { Metadata } from 'next'
import CronParserClient from './cron-parser-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Cron Expression Parser — Free Online Cron Translator | Toolify',
    description: 'Deconstruct and translate cron schedule strings into plain, human-readable English. Calculate the next 5 execution trigger times instantly. 100% browser-based.',
    keywords: ['cron expression parser', 'cron humanizer', 'cron translator', 'cron schedule tester', 'crontab generator', 'next run times calculator'],
  }
}

export default function CronParserPage() {
  return <CronParserClient />
}
