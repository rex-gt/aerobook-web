import { vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { makeUser, makeAircraft, makeReservation, makeBillingRecord } from '../__tests__/helpers'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

const mockMembersGetAll = vi.fn(() => Promise.resolve({ data: [] }))
const mockAircraftGetAll = vi.fn(() => Promise.resolve({ data: [makeAircraft()] }))
const mockReservationsGetAll = vi.fn((_params?: any) => Promise.resolve({ data: [makeReservation()] }))
const mockReservationsUpdate = vi.fn((_id?: any, _data?: any) => Promise.resolve({ data: {} }))
const mockBillingGetAll = vi.fn(() => Promise.resolve({ data: [makeBillingRecord()] }))
const mockFlightLogsCreate = vi.fn((_data?: any) => Promise.resolve({ data: {} }))

vi.mock('../services/api', () => ({
  authAPI: { login: vi.fn(), getProfile: vi.fn() },
  membersAPI: { getAll: () => mockMembersGetAll() },
  aircraftAPI: { getAll: () => mockAircraftGetAll() },
  reservationsAPI: { 
    getAll: (params?: any) => mockReservationsGetAll(params),
    update: (id: any, data: any) => mockReservationsUpdate(id, data)
  },
  billingAPI: { getAll: () => mockBillingGetAll() },
  flightLogsAPI: { create: (data: any) => mockFlightLogsCreate(data) }
}))

import Dashboard from './Dashboard.vue'

function mountDashboard(role: 'admin' | 'operator' | 'member' | null) {
  const user = role ? makeUser({ role }) : null
  return mount(Dashboard, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            auth: { user, token: user ? 'test-token' : null }
          },
          stubActions: false
        })
      ],
      stubs: {
        RouterLink: true
      }
    }
  })
}

describe('Dashboard.vue', () => {
  it('shows Total Members stat card for admin', async () => {
    const wrapper = mountDashboard('admin')
    await flushPromises()
    expect(wrapper.text()).toContain('Total Members')
  })

  it('hides Total Members stat card for member', async () => {
    const wrapper = mountDashboard('member')
    await flushPromises()
    expect(wrapper.text()).not.toContain('Total Members')
  })

  it('shows Unpaid Bills stat card for admin', async () => {
    const wrapper = mountDashboard('admin')
    await flushPromises()
    expect(wrapper.text()).toContain('Unpaid Bills')
  })

  it('hides Unpaid Bills stat card for member', async () => {
    const wrapper = mountDashboard('member')
    await flushPromises()
    expect(wrapper.text()).not.toContain('Unpaid Bills')
  })

  it('always shows Available Aircraft stat card', async () => {
    const wrapper = mountDashboard('member')
    await flushPromises()
    expect(wrapper.text()).toContain('Available Aircraft')
  })

  it('always shows Upcoming Reservations stat card', async () => {
    const wrapper = mountDashboard('member')
    await flushPromises()
    expect(wrapper.text()).toContain('Upcoming Reservations')
  })

  it('shows Manage Members button only for admin', async () => {
    const adminWrapper = mountDashboard('admin')
    await flushPromises()
    expect(adminWrapper.text()).toContain('Manage Members')

    const memberWrapper = mountDashboard('member')
    await flushPromises()
    expect(memberWrapper.text()).not.toContain('Manage Members')
  })

  it('shows Billing button for operator', async () => {
    const wrapper = mountDashboard('operator')
    await flushPromises()
    expect(wrapper.text()).toContain('Billing')
  })

  it('correctly counts upcoming and in-progress reservations', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    const futureEnd = new Date(futureDate)
    futureEnd.setHours(futureEnd.getHours() + 2)

    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    
    mockReservationsGetAll.mockResolvedValue({
      data: [
        makeReservation({ id: 1, status: 'scheduled', start_time: futureDate.toISOString(), end_time: futureEnd.toISOString() }),
        makeReservation({ id: 2, status: 'in_progress', start_time: new Date().toISOString(), end_time: futureEnd.toISOString() }),
        makeReservation({ id: 3, status: 'completed', start_time: pastDate.toISOString(), end_time: new Date().toISOString() }),
        makeReservation({ id: 4, status: 'scheduled', start_time: pastDate.toISOString(), end_time: new Date().toISOString() }), // Expired
      ]
    })

    const wrapper = mountDashboard('member')
    await flushPromises()
    
    // Should count ID 1 and ID 2
    const upcomingCard = wrapper.findAll('.stat-card').find(c => c.text().includes('Upcoming Reservations'))
    expect(upcomingCard?.find('.value').text()).toBe('2')
  })

  it('fetches reservations needing logs for authenticated user', async () => {
    mockReservationsGetAll.mockClear()
    mountDashboard('member')
    await flushPromises()
    
    // Should be called twice: once for all, once for needs_log
    expect(mockReservationsGetAll).toHaveBeenCalledTimes(2)
    
    // Check the second call specifically
    expect(mockReservationsGetAll).toHaveBeenNthCalledWith(2, expect.objectContaining({
      needs_log: true
    }))
  })

  it('does not fetch reservations needing logs when user is unauthenticated', async () => {
    mockReservationsGetAll.mockClear()
    mountDashboard(null)
    await flushPromises()
    
    // Should only be called once (for all reservations)
    expect(mockReservationsGetAll).toHaveBeenCalledTimes(1)
    expect(mockReservationsGetAll).not.toHaveBeenNthCalledWith(1, expect.objectContaining({
      needs_log: true
    }))
  })

  it('shows validation error when submitting flight log without selection', async () => {
    // Mock needsLogReservations to have data
    mockReservationsGetAll.mockResolvedValueOnce({ data: [makeReservation({ id: 101 })] }) // for the generic call
    mockReservationsGetAll.mockResolvedValueOnce({ data: [makeReservation({ id: 101 })] }) // for the needs_log call
    
    const wrapper = mountDashboard('member')
    await flushPromises()
    
    // Open modal
    await wrapper.find('.log-prompt-alert button').trigger('click')
    
    // Submit form (completed is null by default)
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.text()).toContain('Please select whether the flight was completed.')
  })

  it('submits a completed flight log successfully', async () => {
    const res = makeReservation({ id: 101, member_id: 1, aircraft_id: 2, start_time: '2026-04-20T10:00:00Z' })
    const aircraft = makeAircraft({ id: 2, current_tach_hours: 100.5 })
    
    // Initial load: 1 for general, 1 for needs_log
    mockAircraftGetAll.mockResolvedValue({ data: [aircraft] })
    mockReservationsGetAll.mockResolvedValueOnce({ data: [res] }) 
    mockReservationsGetAll.mockResolvedValueOnce({ data: [res] })
    
    // Refresh: 1 for general, 1 for needs_log (empty now)
    mockReservationsGetAll.mockResolvedValueOnce({ data: [] })
    mockReservationsGetAll.mockResolvedValueOnce({ data: [] })

    mockFlightLogsCreate.mockResolvedValue({ data: {} })
    mockReservationsUpdate.mockResolvedValue({ data: {} })
    
    const wrapper = mountDashboard('member')
    await flushPromises()
    
    // Open modal
    await wrapper.find('.log-prompt-alert button').trigger('click')
    
    // Fill form: Yes (completed) and 1.5 hours
    const radioYes = wrapper.findAll('input[type="radio"]').find(r => (r.element as HTMLInputElement).value === 'true')
    await radioYes?.setValue()
    await wrapper.find('input[type="number"]').setValue(1.5)
    
    // Submit
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    
    expect(mockFlightLogsCreate).toHaveBeenCalledWith(expect.objectContaining({
      reservation_id: 101,
      tach_start: 100.5,
      tach_end: 102.0, // 100.5 + 1.5
      flight_date: '2026-04-20'
    }))
    expect(mockReservationsUpdate).toHaveBeenCalledWith(101, { status: 'completed' })
    expect(wrapper.find('.modal-overlay').exists()).toBe(false) // Modal closed
  })

  it('submits a cancelled flight (non-completed) successfully', async () => {
    const res = makeReservation({ id: 102, notes: 'Original note' })
    // Initial load
    mockReservationsGetAll.mockResolvedValueOnce({ data: [res] })
    mockReservationsGetAll.mockResolvedValueOnce({ data: [res] })
    
    // Refresh
    mockReservationsGetAll.mockResolvedValueOnce({ data: [] })
    mockReservationsGetAll.mockResolvedValueOnce({ data: [] })

    mockReservationsUpdate.mockResolvedValue({ data: {} })
    mockFlightLogsCreate.mockClear()
    
    const wrapper = mountDashboard('member')
    await flushPromises()
    
    await wrapper.find('.log-prompt-alert button').trigger('click')
    
    // Fill form: No (not completed) and reason
    const radioNo = wrapper.findAll('input[type="radio"]').find(r => (r.element as HTMLInputElement).value === 'false')
    await radioNo?.setValue()
    await wrapper.find('textarea').setValue('Weather issue')
    
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    
    expect(mockFlightLogsCreate).not.toHaveBeenCalled()
    expect(mockReservationsUpdate).toHaveBeenCalledWith(102, { 
      status: 'cancelled',
      notes: 'Original note Not completed: Weather issue'
    })
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('handles error during flight log submission', async () => {
    const res = makeReservation({ id: 103 })
    mockAircraftGetAll.mockResolvedValue({ data: [makeAircraft()] })
    mockReservationsGetAll.mockResolvedValue({ data: [res] })
    mockFlightLogsCreate.mockRejectedValue(new Error('API Error'))
    
    const wrapper = mountDashboard('member')
    await flushPromises()
    
    await wrapper.find('.log-prompt-alert button').trigger('click')
    const radioYes = wrapper.findAll('input[type="radio"]').find(r => (r.element as HTMLInputElement).value === 'true')
    await radioYes?.setValue()
    await wrapper.find('input[type="number"]').setValue(1.0)
    
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    
    expect(wrapper.text()).toContain('Failed to submit flight details. Please try again.')
    expect(wrapper.find('.modal-overlay').exists()).toBe(true) // Modal stays open
  })

  it('redirects to /members when Total Members card is clicked', async () => {
    mockPush.mockClear()
    const wrapper = mountDashboard('admin')
    await flushPromises()
    const card = wrapper.findAll('.stat-card').find(c => c.text().includes('Total Members'))
    expect(card).toBeDefined()
    await card?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/members')
  })

  it('redirects to /aircraft when Available Aircraft card is clicked', async () => {
    mockPush.mockClear()
    const wrapper = mountDashboard('member')
    await flushPromises()
    const card = wrapper.findAll('.stat-card').find(c => c.text().includes('Available Aircraft'))
    expect(card).toBeDefined()
    await card?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/aircraft')
  })

  it('redirects to /reservations when Upcoming Reservations card is clicked', async () => {
    mockPush.mockClear()
    const wrapper = mountDashboard('member')
    await flushPromises()
    const card = wrapper.findAll('.stat-card').find(c => c.text().includes('Upcoming Reservations'))
    expect(card).toBeDefined()
    await card?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/reservations')
  })

  it('redirects to /billing when Unpaid Bills card is clicked', async () => {
    mockPush.mockClear()
    const wrapper = mountDashboard('admin')
    await flushPromises()
    const card = wrapper.findAll('.stat-card').find(c => c.text().includes('Unpaid Bills'))
    expect(card).toBeDefined()
    await card?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/billing')
  })
})
