import { Metadata } from 'next'
import SchemaFormClient from './schema-form-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'JSON Schema to Visual HTML Form Builder | Toolify',
    description: 'Paste standard JSON Schema structures to dynamically build interactive HTML forms, test user entries, and export filled data JSON in real-time.',
    keywords: ['json schema form', 'schema to form builder', 'dynamic html form builder', 'json schema validator', 'visual form generator', 'testing schema forms'],
  }
}

export default function SchemaFormPage() {
  return <SchemaFormClient />
}
