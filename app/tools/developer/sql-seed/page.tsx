import { Metadata } from 'next'
import SQLSeedClient from './sql-seed-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'SQL Schema to Dummy Seed Data Generator | Toolify',
    description: 'Parse SQL CREATE TABLE declarations and generate customizable dummy row mock data INSERT queries instantly.',
    keywords: ['sql seed generator', 'sql mockup database', 'generate sql insert query', 'create mock rows database', 'sql schema parser', 'dummy query seeds'],
  }
}

export default function SQLSeedPage() {
  return <SQLSeedClient />
}
