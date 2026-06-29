import { describe, expect, test } from 'vitest'
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToCmyk,
  getContrastRatio,
  getTintsAndShades,
} from '@/lib/utils/color'

describe('Color Conversions Utility', () => {
  test('hexToRgb should parse standard 6-digit hex and shorthand 3-digit hex', () => {
    expect(hexToRgb('#2563eb')).toEqual({ r: 37, g: 99, b: 235 })
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(() => hexToRgb('invalid')).toThrow()
  })

  test('rgbToHex should convert rgb numbers to hex color string', () => {
    expect(rgbToHex(37, 99, 235)).toBe('#2563eb')
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
  })

  test('rgbToHsl and hslToRgb should map correctly and be reversible', () => {
    const rgbInput = { r: 37, g: 99, b: 235 }
    const hsl = rgbToHsl(rgbInput.r, rgbInput.g, rgbInput.b)
    expect(hsl).toEqual({ h: 221, s: 83, l: 53 })

    const rgbOutput = hslToRgb(hsl.h, hsl.s, hsl.l)
    // Small deviation rounding is expected
    expect(Math.abs(rgbOutput.r - rgbInput.r)).toBeLessThanOrEqual(2)
    expect(Math.abs(rgbOutput.g - rgbInput.g)).toBeLessThanOrEqual(2)
    expect(Math.abs(rgbOutput.b - rgbInput.b)).toBeLessThanOrEqual(2)
  })

  test('rgbToCmyk should map color codes correctly', () => {
    expect(rgbToCmyk(37, 99, 235)).toEqual({ c: 84, m: 58, y: 0, k: 8 })
    expect(rgbToCmyk(0, 0, 0)).toEqual({ c: 0, m: 0, y: 0, k: 100 })
    expect(rgbToCmyk(255, 255, 255)).toEqual({ c: 0, m: 0, y: 0, k: 0 })
  })

  test('getContrastRatio should calculate WCAG contrast for white and black text', () => {
    const contrast = getContrastRatio('#2563eb') // blue
    expect(contrast.white).toBe(5.17)
    expect(contrast.black).toBe(4.06)
  })

  test('getTintsAndShades should generate a palette array of 5 items each', () => {
    const { tints, shades } = getTintsAndShades('#2563eb')
    expect(tints).toHaveLength(5)
    expect(shades).toHaveLength(5)
    // Verify first and last items are valid hexes
    expect(tints[0]).toMatch(/^#[a-fA-F0-9]{6}$/)
    expect(shades[0]).toMatch(/^#[a-fA-F0-9]{6}$/)
  })
})
