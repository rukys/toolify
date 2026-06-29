import { describe, expect, test } from 'vitest'
import { parsePageRange } from '@/lib/converters/pdf-split'

describe('PDF Split Range Parser Utility', () => {
  test('should parse individual page numbers correctly', () => {
    expect(parsePageRange('1, 3, 5', 10)).toEqual([0, 2, 4])
  })

  test('should parse hyphenated page ranges correctly', () => {
    expect(parsePageRange('1-3, 5-7', 10)).toEqual([0, 1, 2, 4, 5, 6])
    expect(parsePageRange('3-1', 10)).toEqual([0, 1, 2]) // handles reverse order
  })

  test('should exclude duplicate page indices', () => {
    expect(parsePageRange('1-3, 2, 3, 1', 10)).toEqual([0, 1, 2])
  })

  test('should bound selections to max totalPages', () => {
    expect(parsePageRange('1-15', 5)).toEqual([0, 1, 2, 3, 4])
    expect(parsePageRange('10', 5)).toEqual([])
  })

  test('should handle empty or malformed range strings gracefully', () => {
    expect(parsePageRange('abc, , 1-3', 10)).toEqual([0, 1, 2])
    expect(parsePageRange('', 10)).toEqual([])
  })
})
