import { describe, expect, test } from 'vitest'
import {
  encodePunycode,
  decodePunycode,
  toPunycodeDomain,
  toUnicodeDomain,
} from '@/lib/utils/punycode-helper'

describe('Punycode & IDN Domain Utility', () => {
  test('should encode Unicode label to Punycode correctly', () => {
    expect(encodePunycode('münchen')).toBe('mnchen-3ya')
    expect(encodePunycode('café')).toBe('caf-dma')
  })

  test('should decode Punycode label to Unicode correctly', () => {
    expect(decodePunycode('mnchen-3ya')).toBe('münchen')
    expect(decodePunycode('caf-dma')).toBe('café')
  })

  test('should convert whole IDN domain to Punycode domain format', () => {
    expect(toPunycodeDomain('münchen.de')).toBe('xn--mnchen-3ya.de')
    expect(toPunycodeDomain('sub.café.fr')).toBe('sub.xn--caf-dma.fr')
  })

  test('should convert Punycode domain to Unicode domain format', () => {
    expect(toUnicodeDomain('xn--mnchen-3ya.de')).toBe('münchen.de')
    expect(toUnicodeDomain('sub.xn--caf-dma.fr')).toBe('sub.café.fr')
  })
})
