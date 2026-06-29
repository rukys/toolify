export function toUpperCase(text: string): string {
  return text.toUpperCase()
}

export function toLowerCase(text: string): string {
  return text.toLowerCase()
}

export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
}

export function toSentenceCase(text: string): string {
  return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase())
}

export function toCamelCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/-/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i) => (i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
    .join('')
}

export function toPascalCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/-/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

export function toSnakeCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/-/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join('_')
    .toLowerCase()
}

export function toKebabCase(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s_]/g, '')
    .replace(/_/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join('-')
    .toLowerCase()
}
