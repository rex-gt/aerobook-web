import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('../views/ResetPassword.vue')
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/aircraft',
      name: 'Aircraft',
      component: () => import('../views/Aircraft.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reservations',
      name: 'Reservations',
      component: () => import('../views/Reservations.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/flight-logs',
      name: 'FlightLogs',
      component: () => import('../views/FlightLogs.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/billing',
      name: 'Billing',
      component: () => import('../views/Billing.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/members',
      name: 'Members',
      component: () => import('../views/Members.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
