export interface TextStats {
  words: number
  characters: number
  charactersNoSpaces: number
  sentences: number
  paragraphs: number
  readingTime: string   // e.g., "2 min read"
  speakingTime: string  // e.g., "3 min speak"
}

export function analyzeText(text: string): TextStats {
  if (!text.trim()) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: '0 min',
      speakingTime: '0 min',
    }
  }

  const characters = text.length
  let charactersNoSpaces = 0
  let words = 0
  let sentences = 0
  let paragraphs = 0

  let inWord = false
  let hasNonSpaceInSentence = false
  let hasNonSpaceInParagraph = false
  let lineBreakCount = 0
  let lastChar = ''

  for (let i = 0; i < characters; i++) {
    const char = text[i]
    const charCode = text.charCodeAt(i)

    // Determine if whitespace: space (32), tab (9), LF (10), VT (11), FF (12), CR (13), non-breaking space (160), or any unicode whitespace
    const isSpace =
      charCode === 32 ||
      (charCode >= 9 && charCode <= 13) ||
      charCode === 160 ||
      (charCode > 127 && /\s/.test(char))

    if (!isSpace) {
      charactersNoSpaces++
    }

    // Handle word count
    if (isSpace) {
      if (inWord) {
        words++
        inWord = false
      }
    } else {
      inWord = true
    }

    // Handle sentence count
    if (char === '.' || char === '!' || char === '?') {
      if (hasNonSpaceInSentence) {
        sentences++
        hasNonSpaceInSentence = false
      }
    } else if (!isSpace) {
      hasNonSpaceInSentence = true
    }

    // Handle paragraph count
    if (char === '\n') {
      if (lastChar !== '\r') {
        lineBreakCount++
      }
    } else if (char === '\r') {
      lineBreakCount++
    } else {
      if (!isSpace) {
        if (lineBreakCount >= 2 && hasNonSpaceInParagraph) {
          paragraphs++
          hasNonSpaceInParagraph = false
        }
        hasNonSpaceInParagraph = true
        lineBreakCount = 0
      }
    }

    lastChar = char
  }

  // Flush remaining counts
  if (inWord) {
    words++
  }
  if (hasNonSpaceInSentence) {
    sentences++
  }
  if (hasNonSpaceInParagraph) {
    paragraphs++
  }

  const readingMins = Math.ceil(words / 200)
  const speakingMins = Math.ceil(words / 130)

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTime: readingMins <= 1 ? '< 1 min read' : `${readingMins} min read`,
    speakingTime: speakingMins <= 1 ? '< 1 min speak' : `${speakingMins} min speak`,
  }
}
