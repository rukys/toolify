import { describe, expect, test } from 'vitest'
import { caesarCipher, vigenereCipher, rot13, morseCode } from '@/lib/utils/cipher-helper'

describe('Classic Cryptography Ciphers', () => {
  test('Caesar Cipher shifts letters correctly', () => {
    expect(caesarCipher('ABC', 3, 'encode')).toBe('DEF')
    expect(caesarCipher('DEF', 3, 'decode')).toBe('ABC')
    expect(caesarCipher('Hello World!', 5, 'encode')).toBe('Mjqqt Btwqi!')
    expect(caesarCipher('Mjqqt Btwqi!', 5, 'decode')).toBe('Hello World!')
  })

  test('Vigenere Cipher encodes and decodes correctly with key phrase', () => {
    // Vigenere standard verification
    expect(vigenereCipher('ATTACKATDAWN', 'LEMON', 'encode')).toBe('LXFOPVEFRNHR')
    expect(vigenereCipher('LXFOPVEFRNHR', 'LEMON', 'decode')).toBe('ATTACKATDAWN')
  })

  test('ROT13 shifts letters by 13 positions symmetrically', () => {
    expect(rot13('Hello')).toBe('Uryyb')
    expect(rot13('Uryyb')).toBe('Hello')
  })

  test('Morse Code converts back and forth accurately', () => {
    expect(morseCode('HELLO', 'encode')).toBe('.... . .-.. .-.. ---')
    expect(morseCode('.... . .-.. .-.. ---', 'decode')).toBe('HELLO')
  })
})
