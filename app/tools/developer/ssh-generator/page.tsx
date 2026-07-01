import { Metadata } from 'next'
import SSHGeneratorClient from './ssh-generator-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'SSH Key Pair Generator — RSA & ECDSA | Toolify',
    description: 'Generate secure RSA-2048 or ECDSA-P256 public/private SSH key pairs locally using the browser Web Crypto API. 100% private and secure.',
    keywords: ['ssh key generator', 'generate rsa key', 'ecdsa key pair generator', 'client side ssh creator', 'pem format keys', 'public private key generator'],
  }
}

export default function SSHGeneratorPage() {
  return <SSHGeneratorClient />
}
