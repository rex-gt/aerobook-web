import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../stores/auth'
import {
  getWeekDays,
  sameDay,
  stripTime,
  formatHour,
  toDatetimeLocal,
  extractApiError,
  validateReservationTimes,
  toUTCISOString,
  formatDate,
  formatTime,
  getUserTimezone,
  getUserTimezoneAbbr
} from './reservations'

describe('validateReservationTimes', () => {
  it('returns error when start_time is empty', () => {
    expect(validateReservationTimes('', '2027-06-15T10:00')).toBe(
      'Please provide both a start time and an end time.'
    )
  })

  it('returns error when end_time is empty', () => {
    expect(validateReservationTimes('2027-06-15T09:00', '')).toBe(
      'Please provide both a start time and an end time.'
    )
  })

  it('returns error when end time equals start time', () => {
    expect(validateReservationTimes('2027-06-15T09:00', '2027-06-15T09:00')).toBe(
      'End time must be after start time.'
    )
  })

  it('returns error when end time is before start time', () => {
    expect(validateReservationTimes('2027-06-15T10:00', '2027-06-15T09:00')).toBe(
      'End time must be after start time.'
    )
  })

  it('returns error when start time is in the past', () => {
    expect(validateReservationTimes('2020-01-01T09:00', '2020-01-01T10:00')).toBe(
      'Reservations cannot be made in the past.'
    )
  })

  it('returns empty string when times are valid', () => {
    expect(validateReservationTimes('2027-06-15T09:00', '2027-06-15T10:00')).toBe('')
  })
})

describe('toUTCISOString', () => {
  it('converts a valid datetime-local string to UTC ISO string', () => {
    const result = toUTCISOString('2027-06-15T09:00')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('throws Error for invalid datetime string', () => {
    expect(() => toUTCISOString('not-a-date')).toThrow('Invalid datetime value')
  })

  it('output ends with Z (UTC)', () => {
    const result = toUTCISOString('2027-06-15T09:00')
    expect(result).toMatch(/Z$/)
  })
})

describe('getWeekDays', () => {
  it('returns exactly 7 days', () => {
    const days = getWeekDays(new Date(2027, 5, 15)) // June 15, 2027 (Sunday)
    expect(days).toHaveLength(7)
  })

  it('first day is Sunday', () => {
    const days = getWeekDays(new Date(2027, 5, 18)) // Wednesday
    expect(days[0].getDay()).toBe(0) // Sunday
  })

  it('last day is Saturday', () => {
    const days = getWeekDays(new Date(2027, 5, 18)) // Wednesday
    expect(days[6].getDay()).toBe(6) // Saturday
  })

  it('all days are in consecutive order', () => {
    const days = getWeekDays(new Date(2027, 5, 18))
    for (let i = 1; i < days.length; i++) {
      const diff = days[i].getTime() - days[i - 1].getTime()
      expect(diff).toBe(24 * 60 * 60 * 1000) // exactly one day
    }
  })

  it('contains the input date', () => {
    const input = new Date(2027, 5, 18) // Wednesday June 18
    const days = getWeekDays(input)
    const found = days.some(d => sameDay(d, input))
    expect(found).toBe(true)
  })
})

describe('sameDay', () => {
  it('returns true for same date with different times', () => {
    const a = new Date(2027, 5, 15, 9, 0)
    const b = new Date(2027, 5, 15, 17, 30)
    expect(sameDay(a, b)).toBe(true)
  })

  it('returns false for different dates', () => {
    const a = new Date(2027, 5, 15)
    const b = new Date(2027, 5, 16)
    expect(sameDay(a, b)).toBe(false)
  })
})

describe('stripTime', () => {
  it('returns a date with hours, minutes, seconds, ms all zero', () => {
    const result = stripTime(new Date(2027, 5, 15, 14, 30, 45, 500))
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('preserves year, month, day', () => {
    const result = stripTime(new Date(2027, 5, 15, 14, 30))
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(5)
    expect(result.getDate()).toBe(15)
  })

  it('does not mutate the original date', () => {
    const original = new Date(2027, 5, 15, 14, 30)
    stripTime(original)
    expect(original.getHours()).toBe(14)
  })
})

describe('formatHour', () => {
  it('returns "12 AM" for hour 0', () => {
    expect(formatHour(0)).toBe('12 AM')
  })

  it('returns "12 PM" for hour 12', () => {
    expect(formatHour(12)).toBe('12 PM')
  })

  it('returns AM for morning hours', () => {
    expect(formatHour(6)).toBe('6 AM')
    expect(formatHour(11)).toBe('11 AM')
  })

  it('returns PM for afternoon hours', () => {
    expect(formatHour(15)).toBe('3 PM')
    expect(formatHour(21)).toBe('9 PM')
  })
})

describe('toDatetimeLocal', () => {
  it('formats date as YYYY-MM-DDTHH:mm', () => {
    const date = new Date(2027, 5, 15, 9, 30)
    expect(toDatetimeLocal(date)).toBe('2027-06-15T09:30')
  })

  it('zero-pads single-digit months, days, hours, and minutes', () => {
    const date = new Date(2027, 0, 5, 8, 5) // Jan 5, 08:05
    expect(toDatetimeLocal(date)).toBe('2027-01-05T08:05')
  })
})

describe('extractApiError', () => {
  it('extracts error from response.data.error', () => {
    const error = { response: { data: { error: 'Conflict detected' } } }
    expect(extractApiError(error)).toBe('Conflict detected')
  })

  it('extracts message from response.data.message', () => {
    const error = { response: { data: { message: 'Not found' } } }
    expect(extractApiError(error)).toBe('Not found')
  })

  it('prefers error over message', () => {
    const error = { response: { data: { error: 'Error text', message: 'Message text' } } }
    expect(extractApiError(error)).toBe('Error text')
  })

  it('returns empty string when no response', () => {
    expect(extractApiError({})).toBe('')
    expect(extractApiError(new Error('fail'))).toBe('')
  })

  it('returns empty string when no error or message in data', () => {
    const error = { response: { data: {} } }
    expect(extractApiError(error)).toBe('')
  })
})

describe('timezone utilities', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('formatDate formats date including timezone abbreviation', () => {
    const dateStr = '2027-06-13T09:00:00Z'
    const result = formatDate(dateStr)
    expect(result).toContain('Jun 13, 2027')
    const parts = result.split(' ')
    const tzPart = parts[parts.length - 1]
    expect(tzPart.length).toBeGreaterThanOrEqual(3)
  })

  it('getUserTimezone returns a string with timezone and optional abbreviation', () => {
    const tz = getUserTimezone()
    expect(tz).toBeTruthy()
    expect(typeof tz).toBe('string')
  })

  it('getUserTimezoneAbbr returns a string representation of the timezone abbreviation', () => {
    const abbr = getUserTimezoneAbbr()
    expect(typeof abbr).toBe('string')
  })

  it('formatTime formats time including timezone abbreviation', () => {
    const dateStr = '2027-06-13T09:00:00Z'
    const result = formatTime(dateStr)
    const parts = result.split(' ')
    const tzPart = parts[parts.length - 1]
    expect(tzPart.length).toBeGreaterThanOrEqual(3)
  })

  it('respects UTC timezone preference in format functions', () => {
    const store = useAuthStore()
    store.user = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      member_number: 'M-1',
      role: 'member',
      is_active: true,
      reminder_hours: 24,
      timezone_pref: 'UTC',
      created_at: '2026-06-13T00:00:00Z'
    }

    const dateStr = '2027-06-13T09:00:00Z'
    const formattedDate = formatDate(dateStr)
    const formattedTime = formatTime(dateStr)

    expect(formattedDate).toContain('Jun 13, 2027')
    expect(formattedDate).toContain('9:00 AM')
    expect(formattedDate).toContain('UTC')

    expect(formattedTime).toContain('9:00 AM')
    expect(formattedTime).toContain('UTC')

    expect(getUserTimezone()).toBe('UTC')
    expect(getUserTimezoneAbbr()).toBe('UTC')
  })

  it('respects UTC timezone preference in datetime-local conversions', () => {
    const store = useAuthStore()
    store.user = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      member_number: 'M-1',
      role: 'member',
      is_active: true,
      reminder_hours: 24,
      timezone_pref: 'UTC',
      created_at: '2026-06-13T00:00:00Z'
    }

    const date = new Date(Date.UTC(2027, 5, 15, 9, 30))
    expect(toDatetimeLocal(date)).toBe('2027-06-15T09:30')
    expect(toUTCISOString('2027-06-15T09:30')).toBe('2027-06-15T09:30:00.000Z')
  })
})
