import { Metadata } from 'next'
import TimestampClient from './timestamp-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Unix Timestamp Converter Free Online — Epoch & Time | Toolify',
    description: 'Convert Unix epoch timestamps to human-readable local times, UTC, ISO 8601 format, and relative age strings. Ticks live time every second. 100% client-side.',
    keywords: ['timestamp converter', 'unix time converter', 'epoch converter', 'convert unix timestamp', 'utc to local time', 'date to timestamp'],
  }
}

export default function TimestampPage() {
  return <TimestampClient />
}
