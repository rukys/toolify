import { Metadata } from 'next'
import PemJwkClient from './pem-jwk-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'PEM Certificate to JWK JSON Key Converter | Toolify',
    description: 'Convert PEM public certificates (SPKI blocks) into standard JSON Web Key (JWK) configurations securely inside your browser.',
    keywords: ['pem to jwk converter', 'convert pem to json key', 'spki to jwk online', 'json web key maker', 'security credentials converter'],
  }
}

export default function PemJwkPage() {
  return <PemJwkClient />
}
