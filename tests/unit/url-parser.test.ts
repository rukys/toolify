import { describe, expect, test } from 'vitest'

describe('URL Parser Logic', () => {
  test('should parse standard URL structure correctly', () => {
    const inputUrl = 'https://example.com/search?q=nextjs&category=code#top'
    const url = new URL(inputUrl)

    expect(url.protocol).toBe('https:')
    expect(url.host).toBe('example.com')
    expect(url.pathname).toBe('/search')
    expect(url.hash).toBe('#top')

    const params: Record<string, string> = {}
    url.searchParams.forEach((val, key) => {
      params[key] = val
    })
    expect(params).toEqual({
      q: 'nextjs',
      category: 'code'
    })
  })

  test('should compile URL from query parameter state correctly', () => {
    const protocol = 'https:'
    const host = 'example.com'
    const pathname = '/search'
    const hash = '#top'
    const params = [
      { key: 'q', value: 'nextjs' },
      { key: 'category', value: 'code' }
    ]

    const url = new URL(`${protocol}//${host}${pathname}`)
    params.forEach((p) => {
      url.searchParams.append(p.key, p.value)
    })
    url.hash = hash

    expect(url.toString()).toBe('https://example.com/search?q=nextjs&category=code#top')
  })
})
