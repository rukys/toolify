const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
]

const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'

function generateWords(count: number): string {
  return Array.from(
    { length: count },
    () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
  ).join(' ')
}

function generateSentence(): string {
  const wordCount = Math.floor(Math.random() * 10) + 8
  const words = generateWords(wordCount)
  return words.charAt(0).toUpperCase() + words.slice(1) + '.'
}

function generateParagraph(): string {
  const sentenceCount = Math.floor(Math.random() * 4) + 4
  return Array.from({ length: sentenceCount }, generateSentence).join(' ')
}

export function generateLorem(
  unit: 'paragraphs' | 'sentences' | 'words',
  count: number,
  startWithLorem: boolean
): string {
  let result = ''

  if (unit === 'words') {
    if (startWithLorem) {
      const startWords = LOREM_START.toLowerCase().replace(/[,.]/g, '').split(' ')
      if (count <= startWords.length) {
        result = startWords.slice(0, count).join(' ')
      } else {
        result = startWords.join(' ') + ' ' + generateWords(count - startWords.length)
      }
      result = result.charAt(0).toUpperCase() + result.slice(1)
    } else {
      result = generateWords(count)
    }
  } else if (unit === 'sentences') {
    if (startWithLorem) {
      if (count <= 1) {
        result = LOREM_START
      } else {
        result = LOREM_START + ' ' + Array.from({ length: count - 1 }, generateSentence).join(' ')
      }
    } else {
      result = Array.from({ length: count }, generateSentence).join(' ')
    }
  } else {
    if (startWithLorem) {
      if (count <= 1) {
        result = LOREM_START
      } else {
        result = LOREM_START + '\n\n' + Array.from({ length: count - 1 }, generateParagraph).join('\n\n')
      }
    } else {
      result = Array.from({ length: count }, generateParagraph).join('\n\n')
    }
  }

  return result
}
