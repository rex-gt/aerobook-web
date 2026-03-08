import axios from 'axios'
import type { 
  Member, 
  Aircraft, 
  Reservation, 
  FlightLog, 
  BillingRecord,
  AuthResponse,
  User
} from '../types'

// Update this to your Railway API URL
const API_URL = 'https://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
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
  
  register: (firstName: string, lastName: string, email: string, password: string) =>
    api.post('/users/register', { first_name: firstName, last_name: lastName, email, password }),
  
  getProfile: () => 
    api.get<User>('/users/profile'),
  
  updateProfile: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    current_password?: string;
    new_password?: string;
  }) => api.put<{ message: string; user: User }>('/users/profile', data)
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
  getAll: () => api.get<Reservation[]>('/reservations'),
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
