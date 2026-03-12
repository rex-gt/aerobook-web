import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/api'
import type { User } from '../types'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const router = useRouter()

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)
  
  // Role checks
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isOperator = computed(() => user.value?.role === 'operator')
  const isMember = computed(() => user.value?.role === 'member')
  
  // Permission checks
  const canManageMembers = computed(() => isAdmin.value)
  const canManageAircraft = computed(() => isAdmin.value || isOperator.value)
  const canManageReservations = computed(() => isAdmin.value || isOperator.value)
  const canManageBilling = computed(() => isAdmin.value || isOperator.value)
  const canViewOwnData = computed(() => isAuthenticated.value)

  async function login(email: string, password: string) {
    const response = await authAPI.login(email, password)
    token.value = response.data.token
    localStorage.setItem('token', response.data.token)
    await loadProfile(false)
    router.push('/reservations')
  }

  async function loadProfile(logoutOnFail = true) {
    try {
      const response = await authAPI.getProfile()
      user.value = response.data
    } catch (error) {
      console.error('Failed to load profile:', error)
      if (logoutOnFail) logout()
      throw error
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  // Load profile on store initialization if token exists
  if (token.value) {
    loadProfile(true)
  }

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    isAdmin,
    isOperator,
    isMember,
    canManageMembers,
    canManageAircraft,
    canManageReservations,
    canManageBilling,
    canViewOwnData,
    login,
    logout,
    loadProfile
  }
})
