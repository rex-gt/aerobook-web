import { useAuthStore } from '../stores/auth'

export function isUTCMode(): boolean {
  try {
    const authStore = useAuthStore()
    return authStore.user?.timezone_pref === 'UTC'
  } catch (e) {
    return false
  }
}

export function getPreferredTimezone(): string {
  if (isUTCMode()) {
    return 'UTC'
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function getWeekDays(date: Date): Date[] {
  const d = stripTime(date)
  const sunday = new Date(d)
  if (isUTCMode()) {
    sunday.setUTCDate(d.getUTCDate() - d.getUTCDay())
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(sunday)
      day.setUTCDate(sunday.getUTCDate() + i)
      return day
    })
  } else {
    sunday.setDate(d.getDate() - d.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(sunday)
      day.setDate(sunday.getDate() + i)
      return day
    })
  }
}

export function sameDay(a: Date, b: Date): boolean {
  if (isUTCMode()) {
    return (
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate()
    )
  }
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function stripTime(date: Date): Date {
  const d = new Date(date)
  if (isUTCMode()) {
    d.setUTCHours(0, 0, 0, 0)
  } else {
    d.setHours(0, 0, 0, 0)
  }
  return d
}

export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

export function formatTime(isoString: string): string {
  const timeZone = getPreferredTimezone()
  return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone, timeZoneName: 'short' })
}

export function formatDate(isoString: string): string {
  const timeZone = getPreferredTimezone()
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone, timeZoneName: 'short'
  })
}

export function getUserTimezone(): string {
  if (isUTCMode()) {
    return 'UTC'
  }
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const abbr = Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
    .formatToParts(new Date())
    .find(part => part.type === 'timeZoneName')?.value
  return abbr ? `${tz} (${abbr})` : tz
}

export function getUserTimezoneAbbr(): string {
  if (isUTCMode()) {
    return 'UTC'
  }
  return Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
    .formatToParts(new Date())
    .find(part => part.type === 'timeZoneName')?.value || ''
}

export function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  if (isUTCMode()) {
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function extractApiError(error: unknown): string {
  const axiosError = error as { response?: { data?: { error?: string; message?: string } } }
  return (
    axiosError.response?.data?.error ||
    axiosError.response?.data?.message ||
    ''
  )
}

export function validateReservationTimes(startTime: string, endTime: string): string {
  if (!startTime || !endTime) {
    return 'Please provide both a start time and an end time.'
  }
  
  const start = isUTCMode() ? new Date(startTime + 'Z') : new Date(startTime)
  const end = isUTCMode() ? new Date(endTime + 'Z') : new Date(endTime)
  const now = new Date()

  if (start < now) {
    return 'Reservations cannot be made in the past.'
  }
  
  if (end <= start) {
    return 'End time must be after start time.'
  }
  return ''
}

export function toUTCISOString(datetimeLocal: string): string {
  if (isUTCMode()) {
    const date = new Date(datetimeLocal + 'Z')
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid datetime value: "${datetimeLocal}"`)
    }
    return date.toISOString()
  } else {
    const date = new Date(datetimeLocal)
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid datetime value: "${datetimeLocal}"`)
    }
    return date.toISOString()
  }
}
