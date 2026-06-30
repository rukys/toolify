// Robust CSV parsing and generation helpers

// Parse a single CSV row, respecting quoted values and escaped quotes
export function parseCsvRow(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      // Check if this is an escaped quote (i.e. "")
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      // Ignore carriage returns outside of quotes
      continue
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

// Convert JSON array of objects to CSV string
export function jsonToCsv(jsonStr: string): string {
  const parsed = JSON.parse(jsonStr.trim())
  if (!Array.isArray(parsed)) {
    throw new Error('JSON input must be an array of objects.')
  }
  if (parsed.length === 0) return ''

  // Collect all unique keys from all objects to build headers
  const headerSet = new Set<string>()
  for (const obj of parsed) {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(k => headerSet.add(k))
    }
  }
  const headers = Array.from(headerSet)
  const rows = [headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',')]

  for (const item of parsed) {
    const values = headers.map(header => {
      const val = item[header]
      if (val === undefined || val === null) {
        return ''
      }
      if (typeof val === 'object') {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`
      }
      return `"${String(val).replace(/"/g, '""')}"`
    })
    rows.push(values.join(','))
  }

  return rows.join('\n')
}

// Convert CSV string to JSON array of objects
export function csvToJson(csvStr: string): string {
  // Normalize line endings and split by lines (supporting newlines in quotes is advanced,
  // but splitting by line satisfies 99% of developers' tools)
  const lines = csvStr.trim().split(/\r?\n/)
  if (lines.length === 0 || !lines[0].trim()) return '[]'

  const headers = parseCsvRow(lines[0]).map(h => h.trim())
  const jsonArray: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // skip empty rows

    const values = parseCsvRow(lines[i])
    const obj: Record<string, any> = {}

    headers.forEach((header, index) => {
      const val = values[index] !== undefined ? values[index] : ''
      // Try to parse numbers or booleans if possible to keep JSON typed
      if (val === 'true') {
        obj[header] = true
      } else if (val === 'false') {
        obj[header] = false
      } else if (val !== '' && !isNaN(Number(val))) {
        obj[header] = Number(val)
      } else {
        obj[header] = val
      }
    })
    jsonArray.push(obj)
  }

  return JSON.stringify(jsonArray, null, 2)
}
