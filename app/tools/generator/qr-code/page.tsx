import { Metadata } from 'next'
import QRCodeClient from './qr-code-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'QR Code Generator Free Online — Generate QR Codes | Toolify',
    description: 'Generate high-quality QR codes for URLs, text, email messages, or phone numbers. Customize color, size, and error correction level. Download as PNG or SVG.',
    keywords: ['qr code generator', 'make qr code', 'free qr code', 'qr code maker', 'custom qr code', 'png to qr code', 'svg qr code'],
  }
}

export default function QRCodePage() {
  return <QRCodeClient />
}
