import { Metadata } from 'next'
import PomodoroClient from './pomodoro-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Pomodoro Timer & Task Logger — Stay Focused | Toolify',
    description: 'Keep track of focus sessions using the Pomodoro technique. Features customized intervals, native Web Audio alerts, and localStorage task logger sync.',
    keywords: ['pomodoro timer online', 'stay focused clock', 'pomodoro task board', 'time tracker developer', 'productivity countdown', 'pomodoro session logger'],
  }
}

export default function PomodoroPage() {
  return <PomodoroClient />
}
