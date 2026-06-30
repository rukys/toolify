import { Metadata } from 'next'
import BaseConverterClient from './base-converter-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Universal Base Number Converter — Binary, Octal, Decimal, Hex | Toolify',
    description: 'Convert integer values between Binary, Octal, Decimal, Hexadecimal, and any custom base up to base 36 instantly. 100% secure client-side conversion.',
    keywords: ['base number converter', 'binary to hex', 'hex to decimal', 'base 36 converter', 'octal conversion online', 'integer base converter'],
  }
}

export default function BaseConverterPage() {
  return <BaseConverterClient />
}
