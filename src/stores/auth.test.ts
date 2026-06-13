import { vi } from 'vitest'

const { mockPush, mockLogin, mockGetProfile } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockLogin: vi.fn(),
  mockGetProfile: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

vi.mock('../services/api', () => ({
  authAPI: {
    login: mockLogin,
    getProfile: mockGetProfile
  }
}))

import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'
import { makeUser } from '../__tests__/helpers'

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mockPush.mockClear()
    mockLogin.mockClear()
    mockGetProfile.mockClear()
  })

  describe('initial state', () => {
    it('starts with null user and null token when no token in localStorage', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
    })

    it('reads token from localStorage on initialization', () => {
      localStorage.setItem('token', 'stored-token')
      mockGetProfile.mockResolvedValue({ data: makeUser() })
      setActivePinia(createPinia())
      const store = useAuthStore()
      expect(store.token).toBe('stored-token')
    })

    it('calls loadProfile automatically when token exists in localStorage', () => {
      localStorage.setItem('token', 'stored-token')
      mockGetProfile.mockResolvedValue({ data: makeUser() })
      setActivePinia(createPinia())
      useAuthStore()
      expect(mockGetProfile).toHaveBeenCalledTimes(1)
    })
  })

  describe('isAuthenticated', () => {
    it('returns false when no token and no user', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('returns false when token exists but user is null', () => {
      const store = useAuthStore()
      store.token = 'some-token'
      expect(store.isAuthenticated).toBe(false)
    })

    it('returns true when both token and user exist', () => {
      const store = useAuthStore()
      store.token = 'some-token'
      store.user = makeUser()
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('role checks', () => {
    it('isAdmin returns true only for admin role', () => {
      const store = useAuthStore()
      store.user = makeUser({ role: 'admin' })
      expect(store.isAdmin).toBe(true)
      expect(store.isOperator).toBe(false)
      expect(store.isMember).toBe(false)
    })

    it('isOperator returns true only for operator role', () => {
      const store = useAuthStore()
      store.user = makeUser({ role: 'operator' })
      expect(store.isAdmin).toBe(false)
      expect(store.isOperator).toBe(true)
      expect(store.isMember).toBe(false)
    })

    it('isMember returns true only for member role', () => {
      const store = useAuthStore()
      store.user = makeUser({ role: 'member' })
      expect(store.isAdmin).toBe(false)
      expect(store.isOperator).toBe(false)
      expect(store.isMember).toBe(true)
    })
  })

  describe('permission checks', () => {
    it('canManageMembers is true only for admin', () => {
      const store = useAuthStore()
      store.user = makeUser({ role: 'admin' })
      expect(store.canManageMembers).toBe(true)

      store.user = makeUser({ role: 'operator' })
      expect(store.canManageMembers).toBe(false)

      store.user = makeUser({ role: 'member' })
      expect(store.canManageMembers).toBe(false)
    })

    it('canManageAircraft is true for admin and operator', () => {
      const store = useAuthStore()
      store.user = makeUser({ role: 'admin' })
      expect(store.canManageAircraft).toBe(true)

      store.user = makeUser({ role: 'operator' })
      expect(store.canManageAircraft).toBe(true)

      store.user = makeUser({ role: 'member' })
      expect(store.canManageAircraft).toBe(false)
    })

    it('canManageReservations is true for admin and operator', () => {
      const store = useAuthStore()
      store.user = makeUser({ role: 'admin' })
      expect(store.canManageReservations).toBe(true)

      store.user = makeUser({ role: 'operator' })
      expect(store.canManageReservations).toBe(true)

      store.user = makeUser({ role: 'member' })
      expect(store.canManageReservations).toBe(false)
    })

    it('canManageBilling is true for admin and operator', () => {
      const store = useAuthStore()
      store.user = makeUser({ role: 'admin' })
      expect(store.canManageBilling).toBe(true)

      store.user = makeUser({ role: 'operator' })
      expect(store.canManageBilling).toBe(true)

      store.user = makeUser({ role: 'member' })
      expect(store.canManageBilling).toBe(false)
    })

    it('canViewOwnData is true when authenticated', () => {
      const store = useAuthStore()
      expect(store.canViewOwnData).toBe(false)

      store.token = 'some-token'
      store.user = makeUser()
      expect(store.canViewOwnData).toBe(true)
    })
  })

  describe('login()', () => {
    it('calls authAPI.login with email and password', async () => {
      mockLogin.mockResolvedValue({ data: { token: 'new-token' } })
      mockGetProfile.mockResolvedValue({ data: makeUser() })
      const store = useAuthStore()
      await store.login('test@example.com', 'password123')
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    it('stores token in state and localStorage on success', async () => {
      mockLogin.mockResolvedValue({ data: { token: 'new-token' } })
      mockGetProfile.mockResolvedValue({ data: makeUser() })
      const store = useAuthStore()
      await store.login('test@example.com', 'password123')
      expect(store.token).toBe('new-token')
      expect(localStorage.getItem('token')).toBe('new-token')
    })

    it('calls loadProfile after successful login', async () => {
      mockLogin.mockResolvedValue({ data: { token: 'new-token' } })
      mockGetProfile.mockResolvedValue({ data: makeUser() })
      const store = useAuthStore()
      await store.login('test@example.com', 'password123')
      expect(mockGetProfile).toHaveBeenCalled()
      expect(store.user).not.toBeNull()
    })

    it('navigates to /dashboard after successful login', async () => {
      mockLogin.mockResolvedValue({ data: { token: 'new-token' } })
      mockGetProfile.mockResolvedValue({ data: makeUser() })
      const store = useAuthStore()
      await store.login('test@example.com', 'password123')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('propagates error when authAPI.login fails', async () => {
      mockLogin.mockRejectedValue(new Error('Network error'))
      const store = useAuthStore()
      await expect(store.login('test@example.com', 'bad')).rejects.toThrow('Network error')
    })

    it('clears What\'s New session dismissed state on successful login', async () => {
      const userData = makeUser({ id: 5 })
      mockLogin.mockResolvedValue({ data: { token: 'new-token' } })
      mockGetProfile.mockResolvedValue({ data: userData })
      sessionStorage.setItem('whats_new_session_dismissed_5', 'v1')
      const store = useAuthStore()
      await store.login('test@example.com', 'password123')
      expect(sessionStorage.getItem('whats_new_session_dismissed_5')).toBeNull()
    })
  })

  describe('loadProfile()', () => {
    it('sets user from API response on success', async () => {
      const userData = makeUser({ first_name: 'Jane' })
      mockGetProfile.mockResolvedValue({ data: userData })
      const store = useAuthStore()
      await store.loadProfile(false)
      expect(store.user).toEqual(userData)
    })

    it('calls logout on failure when logoutOnFail is true', async () => {
      mockGetProfile.mockRejectedValue(new Error('Unauthorized'))
      const store = useAuthStore()
      store.token = 'some-token'
      try {
        await store.loadProfile(true)
      } catch {
        // expected
      }
      expect(store.token).toBeNull()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('does NOT call logout on failure when logoutOnFail is false', async () => {
      mockGetProfile.mockRejectedValue(new Error('Unauthorized'))
      const store = useAuthStore()
      store.token = 'some-token'
      try {
        await store.loadProfile(false)
      } catch {
        // expected
      }
      expect(store.token).toBe('some-token')
    })
  })

  describe('logout()', () => {
    it('clears user, token, and localStorage', () => {
      const store = useAuthStore()
      store.user = makeUser()
      store.token = 'some-token'
      localStorage.setItem('token', 'some-token')

      store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
    })

    it('navigates to /login', () => {
      const store = useAuthStore()
      store.logout()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('clears What\'s New session dismissed state on logout', () => {
      const userData = makeUser({ id: 5 })
      const store = useAuthStore()
      store.user = userData
      sessionStorage.setItem('whats_new_session_dismissed_5', 'v1')
      store.logout()
      expect(sessionStorage.getItem('whats_new_session_dismissed_5')).toBeNull()
    })
  })
})
