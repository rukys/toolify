import { describe, expect, test } from 'vitest'
import { analyzeText } from '@/lib/utils/text-stats'

describe('Text Stats Analysis Utility', () => {
  test('should return zero metrics for empty strings', () => {
    const stats = analyzeText('')
    expect(stats.words).toBe(0)
    expect(stats.characters).toBe(0)
    expect(stats.charactersNoSpaces).toBe(0)
    expect(stats.sentences).toBe(0)
    expect(stats.paragraphs).toBe(0)
  })

  test('should accurately calculate word, char, sentence, and paragraph counts', () => {
    const sampleText = 'Hello world! This is a test. Next paragraph starts here.\n\nTwo sentences here. End of test.'
    const stats = analyzeText(sampleText)

    expect(stats.words).toBe(16)
    expect(stats.characters).toBe(90)
    expect(stats.charactersNoSpaces).toBe(74) // 90 - 16 spaces/newlines
    expect(stats.sentences).toBe(5)
    expect(stats.paragraphs).toBe(2)
  })

  test('should estimate reading and speaking duration times', () => {
    // 250 words should be ~2 min read and ~2 min speak
    const words = Array(250).fill('word').join(' ')
    const stats = analyzeText(words)

    expect(stats.words).toBe(250)
    expect(stats.readingTime).toBe('2 min read')
    expect(stats.speakingTime).toBe('2 min speak')
  })

  test('should handle single short sentences with under 1 minute times', () => {
    const stats = analyzeText('Short phrase.')
    expect(stats.readingTime).toBe('< 1 min read')
    expect(stats.speakingTime).toBe('< 1 min speak')
  })
})
