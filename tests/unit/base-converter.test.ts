import { describe, expect, test } from 'vitest'

function convertBase(value: string, fromBase: number, toBase: number): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const parsed = parseInt(trimmed, fromBase)
  if (isNaN(parsed)) return 'Invalid'
  return parsed.toString(toBase).toUpperCase()
}

describe('Universal Base Converter Logic', () => {
  test('should convert bases correctly', () => {
    expect(convertBase('42', 10, 16)).toBe('2A')
    expect(convertBase('2A', 16, 10)).toBe('42')
    
    expect(convertBase('101010', 2, 10)).toBe('42')
    expect(convertBase('42', 10, 2)).toBe('101010')

    expect(convertBase('FF', 16, 2)).toBe('11111111')
    expect(convertBase('11111111', 2, 16)).toBe('FF')
  })

  test('should return Invalid for un-parseable inputs', () => {
    expect(convertBase('xyz', 10, 16)).toBe('Invalid')
    expect(convertBase('99', 2, 10)).toBe('Invalid')
  })
})
