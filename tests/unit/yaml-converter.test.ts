import { describe, expect, test } from 'vitest'
import YAML from 'yaml'

describe('YAML / JSON Converter Logic', () => {
  test('should stringify JSON to YAML format correctly', () => {
    const obj = { name: 'Toolify', tags: ['json', 'yaml'] }
    const yamlStr = YAML.stringify(obj, { indent: 2 })

    expect(yamlStr).toContain('name: Toolify')
    expect(yamlStr).toContain('- json')
    expect(yamlStr).toContain('- yaml')
  })

  test('should parse YAML into JSON correctly', () => {
    const yamlStr = `
name: Toolify
tags:
  - json
  - yaml
`
    const parsed = YAML.parse(yamlStr)
    expect(parsed).toEqual({
      name: 'Toolify',
      tags: ['json', 'yaml']
    })
  })
})
