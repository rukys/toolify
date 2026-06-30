import { describe, expect, test } from 'vitest'
import { humanizeCron, getNextCronRuns } from '@/lib/utils/cron-helper'

describe('Cron Expression Parser Utility', () => {
  test('should humanize cron expressions correctly', () => {
    expect(humanizeCron('* * * * *')).toContain('every minute')
    expect(humanizeCron('0 0 * * *')).toContain('at minute 0, at hour 0')
    expect(humanizeCron('*/15 8-17 * * 1-5')).toContain('every 15 minutes')
    expect(humanizeCron('*/15 8-17 * * 1-5')).toContain('between hours 8 and 17')
  })

  test('should throw error for invalid expressions', () => {
    expect(() => humanizeCron('* * *')).toThrow()
  })

  test('should calculate future trigger dates correctly', () => {
    // Starting Sunday 2026-06-28 12:00:00 local time
    const start = new Date(2026, 5, 28, 12, 0, 0)
    
    // Daily at midnight -> 0 0 * * *
    const runs = getNextCronRuns('0 0 * * *', start, 3)
    expect(runs.length).toBe(3)
    
    // First run should be Monday June 29th midnight
    expect(runs[0].getDate()).toBe(29)
    expect(runs[0].getMonth()).toBe(5) // June (0-indexed)
    expect(runs[0].getHours()).toBe(0)
    expect(runs[0].getMinutes()).toBe(0)

    // Second run should be Tuesday June 30th midnight
    expect(runs[1].getDate()).toBe(30)
    
    // Third run should be Wednesday July 1st midnight
    expect(runs[2].getDate()).toBe(1)
    expect(runs[2].getMonth()).toBe(6) // July
  })
})
