import { describe, expect, test } from 'vitest'

function sortLines(lines: string[], method: string, deduplicate: boolean, caseSensitive: boolean): string[] {
  let list = [...lines]

  // Deduplicate
  if (deduplicate) {
    if (caseSensitive) {
      list = Array.from(new Set(list))
    } else {
      const seen = new Set<string>()
      list = list.filter(line => {
        const lower = line.toLowerCase()
        if (seen.has(lower)) return false
        seen.add(lower)
        return true
      })
    }
  }

  // Sort
  if (method === 'alphabetical') {
    list.sort((a, b) => {
      return caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase())
    })
  } else if (method === 'reverse') {
    list.sort((a, b) => {
      return caseSensitive ? b.localeCompare(a) : b.toLowerCase().localeCompare(a.toLowerCase())
    })
  } else if (method === 'numeric') {
    list.sort((a, b) => {
      const numA = parseFloat(a)
      const numB = parseFloat(b)
      if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b)
      if (isNaN(numA)) return 1
      if (isNaN(numB)) return -1
      return numA - numB
    })
  }

  return list
}

describe('List Sorter & Deduplicator Logic', () => {
  test('should sort alphabetically', () => {
    const list = ['Cherry', 'Banana', 'Apple']
    expect(sortLines(list, 'alphabetical', false, false)).toEqual(['Apple', 'Banana', 'Cherry'])
    expect(sortLines(list, 'reverse', false, false)).toEqual(['Cherry', 'Banana', 'Apple'])
  })

  test('should sort numerically', () => {
    const list = ['10', '2', '1']
    expect(sortLines(list, 'numeric', false, false)).toEqual(['1', '2', '10'])
  })

  test('should deduplicate repeating items', () => {
    const list = ['Apple', 'apple', 'Banana', 'Apple']
    // Case-insensitive deduplication (default) -> should keep 'Apple' and 'Banana'
    expect(sortLines(list, 'alphabetical', true, false)).toEqual(['Apple', 'Banana'])
    // Case-sensitive deduplication -> should keep both 'Apple' and 'apple'
    expect(sortLines(list, 'alphabetical', true, true)).toEqual(['apple', 'Apple', 'Banana'])
  })
})
