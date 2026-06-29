export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Trim leading hash
  const cleaned = hex.replace(/^#/, '')
  const shorthand = cleaned.length === 3
  const match = shorthand
    ? cleaned.split('').map((char) => char + char).join('')
    : cleaned

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(match)
  if (!result) throw new Error('Invalid Hex format')
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return '#' + toHex(r) + toHex(g) + toHex(b)
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  }
}

export function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  r /= 255
  g /= 255
  b /= 255
  const k = 1 - Math.max(r, g, b)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  return {
    c: Math.round(((1 - r - k) / (1 - k)) * 100),
    m: Math.round(((1 - g - k) / (1 - k)) * 100),
    y: Math.round(((1 - b - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  }
}

export function getContrastRatio(hex: string): { white: number; black: number } {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (c: number) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const L = 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b)
  return {
    white: Math.round(((1 + 0.05) / (L + 0.05)) * 100) / 100,
    black: Math.round(((L + 0.05) / (0 + 0.05)) * 100) / 100,
  }
}

// Generate tints (adding white) and shades (adding black)
export function getTintsAndShades(hex: string): { tints: string[]; shades: string[] } {
  const { r, g, b } = hexToRgb(hex)
  const tints: string[] = []
  const shades: string[] = []

  // 5 tints (0.1 to 0.9)
  for (let i = 1; i <= 5; i++) {
    const factor = i * 0.16
    const nr = Math.round(r + (255 - r) * factor)
    const ng = Math.round(g + (255 - g) * factor)
    const nb = Math.round(b + (255 - b) * factor)
    tints.push(rgbToHex(nr, ng, nb))
  }

  // 5 shades (0.1 to 0.9)
  for (let i = 1; i <= 5; i++) {
    const factor = i * 0.16
    const nr = Math.round(r * (1 - factor))
    const ng = Math.round(g * (1 - factor))
    const nb = Math.round(b * (1 - factor))
    shades.push(rgbToHex(nr, ng, nb))
  }

  return { tints: tints.reverse(), shades } // tints ordered light to base, shades base to dark
}
