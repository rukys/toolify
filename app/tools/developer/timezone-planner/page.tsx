import { Metadata } from 'next'
import TimezonePlannerClient from './timezone-planner-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Global Timezone Meeting Planner — Group Time Coordinator | Toolify',
    description: 'Coordinate meetings across international time zones visually. Add global zones (EST, GMT, JST, WIB) and find overlapping work hours instantly.',
    keywords: ['global timezone planner', 'meeting time coordinator', 'timezone overlap checker', 'coordinate cross border meetings', 'world clock planner', 'world time match'],
  }
}

export default function TimezonePlannerPage() {
  return <TimezonePlannerClient />
}
