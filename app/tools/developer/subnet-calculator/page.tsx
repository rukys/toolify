import { Metadata } from 'next'
import SubnetCalculatorClient from './subnet-calculator-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'IP Subnet Calculator — Free Online CIDR & IP Mask Calculator | Toolify',
    description: 'Calculate subnet masks, network addresses, broadcast addresses, usable host ranges, and total host counts for any IPv4 address in CIDR notation.',
    keywords: ['ip subnet calculator', 'cidr calculator', 'ip mask calculator', 'network address calculator', 'broadcast address', 'ipv4 subnetting'],
  }
}

export default function SubnetCalculatorPage() {
  return <SubnetCalculatorClient />
}
