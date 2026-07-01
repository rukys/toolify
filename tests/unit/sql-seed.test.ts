import { describe, expect, test } from 'vitest'
import { parseSQLSchema, generateSQLSeed } from '@/lib/utils/sql-seed-helper'

describe('SQL Schema Parser & Dummy Seed Generator', () => {
  test('should parse sql create table schemas correctly', () => {
    const ddl = `CREATE TABLE test_table (
      id INT PRIMARY KEY,
      first_name VARCHAR(50),
      hired_date DATE,
      balance DECIMAL(10,2)
    );`

    const { tableName, columns } = parseSQLSchema(ddl)
    
    expect(tableName).toBe('test_table')
    expect(columns).toEqual([
      { name: 'id', type: 'integer' },
      { name: 'first_name', type: 'string' },
      { name: 'hired_date', type: 'date' },
      { name: 'balance', type: 'number' },
    ])
  })

  test('should generate insert seed queries matching schema columns', () => {
    const ddl = `CREATE TABLE users (
      id INT,
      email VARCHAR(255)
    );`

    const query = generateSQLSeed(ddl, 2)
    
    expect(query).toContain('INSERT INTO `users` (`id`, `email`) VALUES')
    expect(query).toContain('(1, \'alice@example.com\')')
    expect(query).toContain('(2, \'bob@example.com\')')
  })
})
