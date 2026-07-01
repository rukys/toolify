import { describe, expect, test } from 'vitest'
import { compareFolderStructures } from '@/lib/utils/folder-diff-helper'

describe('Folder Structure Difference Checker Utility', () => {
  test('should parse and diff file lists correctly', () => {
    const listA = ['README.md', 'src/index.js']
    const listB = ['README.md', 'src/helpers.js'] // src/index.js deleted, src/helpers.js added

    const root = compareFolderStructures(listA, listB)

    // Check README.md
    expect(root.children['README.md']).toBeDefined()
    expect(root.children['README.md'].status).toBe('unchanged')

    // Check src directory
    expect(root.children['src']).toBeDefined()
    expect(root.children['src'].isDir).toBe(true)

    // Check deleted file
    const src = root.children['src']
    expect(src.children['index.js']).toBeDefined()
    expect(src.children['index.js'].status).toBe('deleted')
    expect(src.children['index.js'].isDir).toBe(false)

    // Check added file
    expect(src.children['helpers.js']).toBeDefined()
    expect(src.children['helpers.js'].status).toBe('added')
    expect(src.children['helpers.js'].isDir).toBe(false)
  })
})
