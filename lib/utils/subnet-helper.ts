// IPv4 Subnet Calculation Utilities

export interface SubnetResult {
  subnetMask: string
  networkAddress: string
  broadcastAddress: string
  firstHost: string
  lastHost: string
  totalHosts: number
  isValid: boolean
}

// Convert dotted-decimal IP string to 32-bit unsigned integer
export function ipToLong(ip: string): number {
  const parts = ip.trim().split('.')
  if (parts.length !== 4) return 0
  return parts.reduce((acc, octet) => {
    const val = parseInt(octet, 10)
    return (acc << 8) + (isNaN(val) ? 0 : val)
  }, 0) >>> 0
}

// Convert 32-bit unsigned integer to dotted-decimal IP string
export function longToIp(num: number): string {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff
  ].join('.')
}

export function calculateSubnet(ipStr: string, cidr: number): SubnetResult {
  const ipPattern = /^^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  if (!ipPattern.test(ipStr.trim()) || cidr < 0 || cidr > 32) {
    return {
      subnetMask: '0.0.0.0',
      networkAddress: '0.0.0.0',
      broadcastAddress: '0.0.0.0',
      firstHost: '0.0.0.0',
      lastHost: '0.0.0.0',
      totalHosts: 0,
      isValid: false
    }
  }

  const ipNum = ipToLong(ipStr)
  
  // Calculate mask: shift 1s left by (32 - cidr) bits
  const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0
  const networkNum = (ipNum & maskNum) >>> 0
  const broadcastNum = (networkNum | ~maskNum) >>> 0

  let firstHostNum = 0
  let lastHostNum = 0
  let totalHosts = 0

  if (cidr === 32) {
    firstHostNum = networkNum
    lastHostNum = networkNum
    totalHosts = 1
  } else if (cidr === 31) {
    firstHostNum = networkNum
    lastHostNum = broadcastNum
    totalHosts = 2
  } else {
    firstHostNum = networkNum + 1
    lastHostNum = broadcastNum - 1
    totalHosts = (broadcastNum - networkNum) - 1 // 2^(32-cidr) - 2
  }

  return {
    subnetMask: longToIp(maskNum),
    networkAddress: longToIp(networkNum),
    broadcastAddress: longToIp(broadcastNum),
    firstHost: longToIp(firstHostNum),
    lastHost: longToIp(lastHostNum),
    totalHosts,
    isValid: true
  }
}
