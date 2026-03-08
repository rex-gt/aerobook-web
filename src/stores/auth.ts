import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/api'
import type { User, Role } from '../types'
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
    try {
      const response = await authAPI.login(email, password)
      token.value = response.data.token
      localStorage.setItem('token', response.data.token)
      await loadProfile()
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function loadProfile() {
    try {
      const response = await authAPI.getProfile()
      user.value = response.data
    } catch (error) {
      console.error('Failed to load profile:', error)
      logout()
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
    loadProfile()
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
