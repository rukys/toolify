// Punycode (RFC 3492) and IDN Mapping helper

const INITIAL_N = 128
const INITIAL_BIAS = 72
const BASE = 36
const TMIN = 1
const TMAX = 26
const SKEW = 38
const DAMP = 700

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  let k = 0
  delta = firstTime ? Math.floor(delta / DAMP) : Math.floor(delta / 2)
  delta += Math.floor(delta / numPoints)
  while (delta > Math.floor(((BASE - TMIN) * TMAX) / 2)) {
    delta = Math.floor(delta / (BASE - TMIN))
    k += BASE
  }
  return k + Math.floor(((BASE - TMIN + 1) * delta) / (delta + SKEW))
}

function digitToChar(digit: number): number {
  return digit < 26 ? digit + 97 : digit + 22
}

function charToDigit(code: number): number {
  if (code >= 48 && code <= 57) return code - 22
  if (code >= 97 && code <= 122) return code - 97
  return BASE
}

export function encodePunycode(input: string): string {
  const output: string[] = []
  const basicChars = [...input].filter((c) => c.charCodeAt(0) < 128)
  output.push(...basicChars)
  
  const basicLength = output.length
  let handledCount = basicLength
  
  if (basicLength > 0) {
    output.push('-')
  }

  let n = INITIAL_N
  let delta = 0
  let bias = INITIAL_BIAS

  while (handledCount < [...input].length) {
    let m = Number.MAX_SAFE_INTEGER
    for (const c of [...input]) {
      const code = c.codePointAt(0)!
      if (code >= n && code < m) {
        m = code
      }
    }

    delta += (m - n) * (handledCount + 1)
    n = m

    for (const c of [...input]) {
      const code = c.codePointAt(0)!
      if (code < n) {
        delta++
      } else if (code === n) {
        let q = delta
        for (let k = BASE; ; k += BASE) {
          const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
          if (q < t) break
          const codeIndex = t + ((q - t) % (BASE - t))
          output.push(String.fromCharCode(digitToChar(codeIndex)))
          q = Math.floor((q - t) / (BASE - t))
        }
        output.push(String.fromCharCode(digitToChar(q)))
        bias = adapt(delta, handledCount + 1, handledCount === basicLength)
        delta = 0
        handledCount++
      }
    }
    delta++
    n++
  }

  return output.join('')
}

export function decodePunycode(input: string): string {
  const output: number[] = []
  const delimIndex = input.lastIndexOf('-')
  
  let basic = ''
  let remaining = input
  
  if (delimIndex !== -1) {
    basic = input.slice(0, delimIndex)
    remaining = input.slice(delimIndex + 1)
    for (let i = 0; i < basic.length; i++) {
      output.push(basic.charCodeAt(i))
    }
  }

  let n = INITIAL_N
  let i = 0
  let bias = INITIAL_BIAS

  let remainingChars = [...remaining]
  let charIndex = 0

  while (charIndex < remainingChars.length) {
    const oldI = i
    let w = 1
    for (let k = BASE; ; k += BASE) {
      if (charIndex >= remainingChars.length) {
        throw new Error('Invalid input')
      }
      const char = remainingChars[charIndex++]
      const digit = charToDigit(char.charCodeAt(0))
      i += digit * w
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
      if (digit < t) break
      w *= BASE - t
    }

    const len = output.length + 1
    bias = adapt(i - oldI, len, oldI === 0)
    n += Math.floor(i / len)
    i %= len

    output.splice(i, 0, n)
    i++
  }

  return String.fromCodePoint(...output)
}

// Convert entire Domain labels (e.g. münchen.de ⇄ xn--mnchen-3ya.de)
export function toPunycodeDomain(domain: string): string {
  return domain
    .split('.')
    .map((label) => {
      // Check if it contains non-ASCII characters
      const hasUnicode = [...label].some((c) => c.charCodeAt(0) >= 128)
      if (hasUnicode) {
        return `xn--${encodePunycode(label.toLowerCase())}`
      }
      return label
    })
    .join('.')
}

export function toUnicodeDomain(domain: string): string {
  return domain
    .split('.')
    .map((label) => {
      if (label.toLowerCase().startsWith('xn--')) {
        try {
          return decodePunycode(label.slice(4))
        } catch {
          return label
        }
      }
      return label
    })
    .join('.')
}
