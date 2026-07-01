// SQL Schema Parser to Dummy Seed Data Generator

export interface SQLColumn {
  name: string
  type: 'integer' | 'string' | 'date' | 'boolean' | 'number'
}

export interface SQLParserResult {
  tableName: string
  columns: SQLColumn[]
}

const MOCK_NAMES = [
  'Alice Smith',
  'Bob Johnson',
  'Charlie Davis',
  'Diana Martinez',
  'Evan Wilson',
  'Fiona Gallagher',
  'George Harrison',
  'Hannah Abbott',
]

const MOCK_EMAILS = [
  'alice@example.com',
  'bob@example.com',
  'charlie@example.com',
  'diana@example.com',
  'evan@example.com',
  'fiona@example.com',
  'george@example.com',
  'hannah@example.com',
]

export function parseSQLSchema(schema: string): SQLParserResult {
  const clean = schema.replace(/\s+/g, ' ')
  
  // Extract table name
  const tableMatch = clean.match(/CREATE\s+TABLE\s+([a-zA-Z0-9_`"]+)/i)
  const tableName = tableMatch ? tableMatch[1].replace(/[`"]/g, '') : 'dummy_table'

  const columns: SQLColumn[] = []

  // Extract columns segment (inside outer parentheses)
  const firstParen = clean.indexOf('(')
  const lastParen = clean.lastIndexOf(')')
  
  if (firstParen !== -1 && lastParen !== -1) {
    const colSegment = clean.slice(firstParen + 1, lastParen)
    // Split by commas (careful with varchar limits like (255) and decimal like (10,2))
    // A simple split by comma, skipping commas inside parenthesis:
    const lines: string[] = []
    let parenDepth = 0
    let currentLine = ''

    for (let char of colSegment) {
      if (char === '(') parenDepth++
      if (char === ')') parenDepth--
      
      if (char === ',' && parenDepth === 0) {
        lines.push(currentLine.trim())
        currentLine = ''
      } else {
        currentLine += char
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }

    for (const line of lines) {
      // Skip constraints like PRIMARY KEY, FOREIGN KEY, UNIQUE
      if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CONSTRAINT|KEY|INDEX)/i.test(line)) {
        continue
      }

      const tokens = line.split(/\s+/)
      if (tokens.length >= 2) {
        const name = tokens[0].replace(/[`"]/g, '')
        const rawType = tokens[1].toLowerCase()

        let type: SQLColumn['type'] = 'string'
        if (rawType.includes('int') || rawType.includes('serial')) {
          type = 'integer'
        } else if (rawType.includes('date') || rawType.includes('time')) {
          type = 'date'
        } else if (rawType.includes('bool') || rawType.includes('tinyint(1)')) {
          type = 'boolean'
        } else if (rawType.includes('double') || rawType.includes('float') || rawType.includes('decimal')) {
          type = 'number'
        }

        columns.push({ name, type })
      }
    }
  }

  return { tableName, columns }
}

export function generateSQLSeed(schema: string, rowCount = 5): string {
  const { tableName, columns } = parseSQLSchema(schema)
  if (columns.length === 0) return '-- No columns parsed. Ensure table schema matches CREATE TABLE syntax.'

  const rows: string[] = []
  
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const vals = columns.map((col) => {
      const colName = col.name.toLowerCase()

      // Handle mock data by column names
      if (colName === 'id') return (rowIndex + 1).toString()
      if (colName.includes('email')) {
        return `'${MOCK_EMAILS[rowIndex % MOCK_EMAILS.length]}'`
      }
      if (colName.includes('name')) {
        return `'${MOCK_NAMES[rowIndex % MOCK_NAMES.length]}'`
      }

      // Handle by types
      if (col.type === 'integer') {
        return Math.floor(10 + Math.random() * 90).toString()
      }
      if (col.type === 'number') {
        return (10 + Math.random() * 90).toFixed(2)
      }
      if (col.type === 'date') {
        return `'2026-07-01 12:00:00'`
      }
      if (col.type === 'boolean') {
        return Math.random() > 0.5 ? 'true' : 'false'
      }

      return `'mock_data_${rowIndex + 1}'`
    })

    rows.push(`  (${vals.join(', ')})`)
  }

  const colNames = columns.map((c) => `\`${c.name}\``).join(', ')
  return `INSERT INTO \`${tableName}\` (${colNames}) VALUES\n${rows.join(',\n')};`
}
