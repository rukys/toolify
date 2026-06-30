// Classic Cryptography Encoders & Decoders

// 1. Caesar Cipher
export function caesarCipher(text: string, shift: number, mode: 'encode' | 'decode'): string {
  const normShift = ((mode === 'encode' ? shift : -shift) % 26 + 26) % 26
  
  return text.split('').map(char => {
    const code = char.charCodeAt(0)
    if (code >= 65 && code <= 90) {
      // Uppercase
      return String.fromCharCode(((code - 65 + normShift) % 26) + 65)
    } else if (code >= 97 && code <= 122) {
      // Lowercase
      return String.fromCharCode(((code - 97 + normShift) % 26) + 97)
    }
    return char
  }).join('')
}

// 2. Vigenere Cipher
export function vigenereCipher(text: string, key: string, mode: 'encode' | 'decode'): string {
  const cleanKey = key.replace(/[^a-zA-Z]/g, '').toUpperCase()
  if (!cleanKey) return text

  let keyIndex = 0
  return text.split('').map(char => {
    const code = char.charCodeAt(0)
    let isUpper = false
    
    if (code >= 65 && code <= 90) {
      isUpper = true
    } else if (code >= 97 && code <= 122) {
      isUpper = false
    } else {
      return char // non-alphabetic
    }

    const base = isUpper ? 65 : 97
    const shift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65
    const normShift = ((mode === 'encode' ? shift : -shift) % 26 + 26) % 26

    keyIndex++
    return String.fromCharCode(((code - base + normShift) % 26) + base)
  }).join('')
}

// 3. ROT13 (Symmetric)
export function rot13(text: string): string {
  return caesarCipher(text, 13, 'encode')
}

// 4. Morse Code Map definitions
const MORSE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
  'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
  'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', '0': '-----',
  ' ': '/'
}

const REVERSE_MORSE_MAP: Record<string, string> = Object.entries(MORSE_MAP).reduce((acc, [key, val]) => {
  acc[val] = key
  return acc
}, {} as Record<string, string>)

export function morseCode(text: string, mode: 'encode' | 'decode'): string {
  if (mode === 'encode') {
    return text
      .toUpperCase()
      .split('')
      .map(char => MORSE_MAP[char] || '')
      .filter(m => m !== '')
      .join(' ')
  } else {
    // Decoding
    return text
      .trim()
      .split(/\s+/)
      .map(code => REVERSE_MORSE_MAP[code] || '?')
      .join('')
      .replace(/\//g, ' ')
  }
}
