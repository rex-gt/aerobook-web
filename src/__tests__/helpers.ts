import type { User, Member, Aircraft, Reservation, FlightLog, BillingRecord } from '../types'

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    member_number: 'M-001',
    role: 'member',
    is_active: true,
    reminder_hours: 24,
    created_at: '2025-01-01T00:00:00Z',
    ...overrides
  }
}

export function makeMember(overrides: Partial<Member> = {}): Member {
  return {
    id: 1,
    member_number: 'M-001',
    first_name: 'Test',
    last_name: 'Member',
    email: 'member@example.com',
    role: 'member',
    is_active: true,
    reminder_hours: 24,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides
  }
}

export function makeAircraft(overrides: Partial<Aircraft> = {}): Aircraft {
  return {
    id: 1,
    tail_number: 'N12345',
    make: 'Cessna',
    model: '172S',
    year: 2020,
    hourly_rate: 150,
    current_tach_hours: 1200,
    is_available: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides
  }
}

export function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: 1,
    member_id: 1,
    aircraft_id: 1,
    start_time: '2025-06-15T09:00:00Z',
    end_time: '2025-06-15T11:00:00Z',
    status: 'scheduled',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides
  }
}

export function makeFlightLog(overrides: Partial<FlightLog> = {}): FlightLog {
  return {
    id: 1,
    member_id: 1,
    aircraft_id: 1,
    tach_start: 1200,
    tach_end: 1202,
    tach_hours: 2,
    flight_date: '2025-06-15',
    departure_time: '2025-06-15T09:00:00Z',
    arrival_time: '2025-06-15T11:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides
  }
}

export function makeBillingRecord(overrides: Partial<BillingRecord> = {}): BillingRecord {
  return {
    id: 1,
    member_id: 1,
    flight_log_id: 1,
    aircraft_id: 1,
    tach_hours: 2,
    hourly_rate: 150,
    amount: 300,
    billing_date: '2025-06-15',
    is_paid: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides
  }
}
