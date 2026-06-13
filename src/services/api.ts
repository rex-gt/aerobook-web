import axios from 'axios'
import type { 
  Member, 
  Aircraft, 
  Reservation, 
  FlightLog, 
  BillingRecord,
  MaintenanceItem,
  Squawk,
  SquawkComment,
  AuthResponse,
  User
} from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/users/login', { email, password }),

  getProfile: () =>
    api.get<User>('/users/profile'),

  updateProfile: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    current_password?: string;
    new_password?: string;
    reminder_hours?: number;
    timezone_pref?: string;
  }) => api.put<{ message: string; user: User }>('/users/profile', data),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/users/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>('/users/reset-password', { token, password })
}

// Members
export const membersAPI = {
  getAll: () => api.get<Member[]>('/members'),
  getById: (id: number) => api.get<Member>(`/members/${id}`),
  create: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    role?: string;
    member_number?: string;
    skip_welcome_email?: boolean;
  }) => api.post<Member>('/members', data),
  update: (id: number, data: Partial<Member>) => api.put<Member>(`/members/${id}`, data),
  delete: (id: number) => api.delete(`/members/${id}`)
}

// Aircraft
export const aircraftAPI = {
  getAll: () => api.get<Aircraft[]>('/aircraft'),
  getById: (id: number) => api.get<Aircraft>(`/aircraft/${id}`),
  create: (data: Partial<Aircraft>) => api.post<Aircraft>('/aircraft', data),
  update: (id: number, data: Partial<Aircraft>) => api.put<Aircraft>(`/aircraft/${id}`, data),
  delete: (id: number) => api.delete(`/aircraft/${id}`)
}

// Reservations
export const reservationsAPI = {
  getAll: (filters?: { member_id?: number; needs_log?: boolean }) => 
    api.get<Reservation[]>('/reservations', { params: filters }),
  getById: (id: number) => api.get<Reservation>(`/reservations/${id}`),
  create: (data: Partial<Reservation>) => api.post<Reservation>('/reservations', data),
  update: (id: number, data: Partial<Reservation>) => api.put<Reservation>(`/reservations/${id}`, data),
  delete: (id: number) => api.delete(`/reservations/${id}`)
}

// Flight Logs
export const flightLogsAPI = {
  getAll: () => api.get<FlightLog[]>('/flight-logs'),
  getById: (id: number) => api.get<FlightLog>(`/flight-logs/${id}`),
  create: (data: Partial<FlightLog>) => api.post<FlightLog>('/flight-logs', data),
  update: (id: number, data: Partial<FlightLog>) => api.put<FlightLog>(`/flight-logs/${id}`, data),
  delete: (id: number) => api.delete(`/flight-logs/${id}`)
}

// Billing
export const billingAPI = {
  getAll: () => api.get<BillingRecord[]>('/billing'),
  generate: (flightLogId: number) => api.post<BillingRecord>('/billing/generate', { flight_log_id: flightLogId }),
  markPaid: (id: number) => api.put<BillingRecord>(`/billing/${id}/pay`, {}),
  getSummary: (memberId: number) => api.get(`/billing/summary/${memberId}`),
  delete: (id: number) => api.delete(`/billing/${id}`)
}

// Maintenance
export const maintenanceAPI = {
  getAll: (filters?: { aircraft_id?: number; status?: string }) => 
    api.get<MaintenanceItem[]>('/maintenance', { params: filters }),
  getById: (id: number) => api.get<MaintenanceItem>(`/maintenance/${id}`),
  create: (data: Partial<MaintenanceItem>) => api.post<MaintenanceItem>('/maintenance', data),
  update: (id: number, data: Partial<MaintenanceItem>) => api.put<MaintenanceItem>(`/maintenance/${id}`, data),
  delete: (id: number) => api.delete(`/maintenance/${id}`)
}

// Squawks
export const squawkAPI = {
  getAll: (filters?: { aircraft_id?: number; status?: string }) => 
    api.get<Squawk[]>('/squawks', { params: filters }),
  getById: (id: number) => api.get<Squawk>(`/squawks/${id}`),
  create: (data: Partial<Squawk>) => api.post<Squawk>('/squawks', data),
  addComment: (id: number, comment: string) => api.post<SquawkComment>(`/squawks/${id}/comments`, { comment }),
  close: (id: number) => api.put<Squawk>(`/squawks/${id}/close`, {})
}
