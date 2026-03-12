export type Role = 'admin' | 'operator' | 'member'

export interface Member {
  id: number
  member_number: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  password?: string
  role: Role
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Aircraft {
  id: number
  tail_number: string
  make: string
  model: string
  year: number
  hourly_rate: number
  current_tach_hours: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: number
  member_id: number
  aircraft_id: number
  start_time: string
  end_time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
  // Fields joined from members/aircraft by the API
  member_name?: string
  tail_number?: string
  make?: string
  model?: string
}

export interface FlightLog {
  id: number
  reservation_id?: number
  member_id: number
  aircraft_id: number
  tach_start: number
  tach_end: number
  tach_hours: number
  flight_date: string
  departure_time: string
  arrival_time: string
  created_at: string
  updated_at: string
}

export interface BillingRecord {
  id: number
  member_id: number
  flight_log_id: number
  aircraft_id: number
  tach_hours: number
  hourly_rate: number
  amount: number
  billing_date: string
  is_paid: boolean
  payment_date?: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token: string
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  member_number: string
  phone?: string
  role: Role
  is_active: boolean
  created_at: string
}
