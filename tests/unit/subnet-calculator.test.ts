import { describe, expect, test } from 'vitest'
import { ipToLong, longToIp, calculateSubnet } from '@/lib/utils/subnet-helper'

describe('IP Subnet Calculator Utility', () => {
  test('should convert dotted IP to 32-bit integer and back', () => {
    expect(ipToLong('192.168.1.1')).toBe(3232235777)
    expect(longToIp(3232235777)).toBe('192.168.1.1')

    expect(ipToLong('10.0.0.1')).toBe(167772161)
    expect(longToIp(167772161)).toBe('10.0.0.1')
  })

  test('should calculate correct subnet details for /24 prefix', () => {
    const res = calculateSubnet('192.168.1.15', 24)
    expect(res.isValid).toBe(true)
    expect(res.subnetMask).toBe('255.255.255.0')
    expect(res.networkAddress).toBe('192.168.1.0')
    expect(res.broadcastAddress).toBe('192.168.1.255')
    expect(res.firstHost).toBe('192.168.1.1')
    expect(res.lastHost).toBe('192.168.1.254')
    expect(res.totalHosts).toBe(254)
  })

  test('should calculate correct subnet details for /30 prefix', () => {
    const res = calculateSubnet('10.0.0.1', 30)
    expect(res.isValid).toBe(true)
    expect(res.subnetMask).toBe('255.255.255.252')
    expect(res.networkAddress).toBe('10.0.0.0')
    expect(res.broadcastAddress).toBe('10.0.0.3')
    expect(res.firstHost).toBe('10.0.0.1')
    expect(res.lastHost).toBe('10.0.0.2')
    expect(res.totalHosts).toBe(2)
  })

  test('should flag invalid IP formats correctly', () => {
    expect(calculateSubnet('abc.def.ghi.jkl', 24).isValid).toBe(false)
    expect(calculateSubnet('300.400.500.600', 24).isValid).toBe(false)
    expect(calculateSubnet('192.168.1.1', 35).isValid).toBe(false)
  })
})
