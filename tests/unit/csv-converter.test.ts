import { describe, expect, test } from 'vitest'
import { parseCsvRow, jsonToCsv, csvToJson } from '@/lib/utils/csv-helper'

describe('CSV ⇄ JSON Converter Utility', () => {
  test('should parse CSV rows respecting quotes and escaped quotes', () => {
    expect(parseCsvRow('a,b,c')).toEqual(['a', 'b', 'c'])
    expect(parseCsvRow('"a,b",c')).toEqual(['a,b', 'c'])
    expect(parseCsvRow('"a""b",c')).toEqual(['a"b', 'c'])
  })

  test('should convert JSON Array of Objects to CSV format', () => {
    const json = `[
      { "name": "Alex", "age": 28, "active": true },
      { "name": "Sarah", "age": 25, "active": false }
    ]`
    const csv = jsonToCsv(json)
    
    // Check headers
    expect(csv).toContain('"name","age","active"')
    // Check rows
    expect(csv).toContain('"Alex","28","true"')
    expect(csv).toContain('"Sarah","25","false"')
  })

  test('should convert CSV format back to JSON Array', () => {
    const csv = 'name,age,active\nAlex,28,true\nSarah,25,false'
    const jsonStr = csvToJson(csv)
    const json = JSON.parse(jsonStr)

    expect(json).toEqual([
      { name: 'Alex', age: 28, active: true },
      { name: 'Sarah', age: 25, active: false }
    ])
  })

  test('should fail when JSON is not an array', () => {
    const invalidJson = '{ "name": "Alex" }'
    expect(() => jsonToCsv(invalidJson)).toThrow()
  })
})
