// Zero-deps Cron Expression Parser & Humanizer helper

export interface ParsedCron {
  minutes: Set<number>
  hours: Set<number>
  daysOfMonth: Set<number>
  months: Set<number>
  daysOfWeek: Set<number>
}

// Translate cron segments to Sets of matching numbers
export function parseCronField(field: string, minLimit: number, maxLimit: number): Set<number> {
  const values = new Set<number>()
  if (field === '*' || field === '?') {
    for (let i = minLimit; i <= maxLimit; i++) values.add(i)
    return values
  }

  const parts = field.split(',')
  for (const part of parts) {
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/')
      const step = parseInt(stepStr, 10) || 1
      let start = minLimit
      let end = maxLimit
      if (range !== '*') {
        if (range.includes('-')) {
          const [s, e] = range.split('-').map(Number)
          start = s
          end = e
        } else {
          start = parseInt(range, 10) || minLimit
        }
      }
      for (let i = start; i <= end; i += step) {
        values.add(i)
      }
    } else if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number)
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          values.add(i)
        }
      }
    } else {
      const val = parseInt(part, 10)
      if (!isNaN(val)) {
        values.add(val)
      }
    }
  }
  return values
}

// Convert a cron expression to a human-readable English sentence
export function humanizeCron(cronStr: string): string {
  const parts = cronStr.trim().split(/\s+/)
  if (parts.length < 5) {
    throw new Error('Invalid cron format. A cron expression must have at least 5 fields (minute hour day-of-month month day-of-week).')
  }

  const [min, hour, dom, month, dow] = parts

  let minuteText = ''
  if (min === '*') {
    minuteText = 'every minute'
  } else if (min.includes('/')) {
    const step = min.split('/')[1]
    minuteText = `every ${step} minutes`
  } else {
    minuteText = `at minute ${min}`
  }

  let hourText = ''
  if (hour === '*') {
    hourText = 'every hour'
  } else if (hour.includes('/')) {
    const step = hour.split('/')[1]
    hourText = `every ${step} hours`
  } else if (hour.includes('-')) {
    const [start, end] = hour.split('-')
    hourText = `between hours ${start} and ${end}`
  } else {
    hourText = `at hour ${hour}`
  }

  let domText = ''
  if (dom === '*' || dom === '?') {
    domText = 'every day'
  } else if (dom.includes('/')) {
    const step = dom.split('/')[1]
    domText = `every ${step} days of the month`
  } else {
    domText = `on day ${dom} of the month`
  }

  let monthText = ''
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  if (month === '*') {
    monthText = 'every month'
  } else {
    const monthsSelected = month.split(',').map(m => {
      const num = parseInt(m, 10)
      return monthNames[num] || m
    })
    monthText = `in ${monthsSelected.join(', ')}`
  }

  let dowText = ''
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  if (dow === '*' || dow === '?') {
    dowText = 'every day of the week'
  } else {
    const dowsSelected = dow.split(',').map(d => {
      const num = parseInt(d, 10)
      return dayNames[num] || d
    })
    dowText = `on ${dowsSelected.join(', ')}`
  }

  return `Runs ${minuteText}, ${hourText}, ${domText}, ${monthText}, ${dowText}.`
}

// Calculate the next 5 run times from a starting date
export function getNextCronRuns(cronStr: string, startDate = new Date(), count = 5): Date[] {
  const parts = cronStr.trim().split(/\s+/)
  if (parts.length < 5) return []

  const parsed: ParsedCron = {
    minutes: parseCronField(parts[0], 0, 59),
    hours: parseCronField(parts[1], 0, 23),
    daysOfMonth: parseCronField(parts[2], 1, 31),
    months: parseCronField(parts[3], 1, 12),
    daysOfWeek: parseCronField(parts[4], 0, 6), // 0 is Sunday, 6 is Saturday
  }

  const results: Date[] = []
  const testDate = new Date(startDate.getTime())
  // Align to beginning of next minute
  testDate.setSeconds(0)
  testDate.setMilliseconds(0)
  testDate.setMinutes(testDate.getMinutes() + 1)

  let limit = 0
  const maxIterations = 100000 // prevent infinite loops on impossible cron schedules (e.g. 31st of Feb)

  while (results.length < count && limit < maxIterations) {
    limit++
    
    // Quick calendar increments if components don't match
    const m = testDate.getMonth() + 1 // 1-12
    if (!parsed.months.has(m)) {
      // Increment month
      testDate.setMonth(testDate.getMonth() + 1)
      testDate.setDate(1)
      testDate.setHours(0)
      testDate.setMinutes(0)
      continue
    }

    const d = testDate.getDate() // 1-31
    const dow = testDate.getDay() // 0-6
    if (!parsed.daysOfMonth.has(d) || !parsed.daysOfWeek.has(dow)) {
      // Increment day
      testDate.setDate(testDate.getDate() + 1)
      testDate.setHours(0)
      testDate.setMinutes(0)
      continue
    }

    const h = testDate.getHours() // 0-23
    if (!parsed.hours.has(h)) {
      // Increment hour
      testDate.setHours(testDate.getHours() + 1)
      testDate.setMinutes(0)
      continue
    }

    const min = testDate.getMinutes() // 0-59
    if (parsed.minutes.has(min)) {
      results.push(new Date(testDate.getTime()))
    }
    
    // Always progress at least 1 minute
    testDate.setMinutes(testDate.getMinutes() + 1)
  }

  return results
}
