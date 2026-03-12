import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      component: () => import('../components/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/reservations'
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue')
        },
        {
          path: 'aircraft',
          name: 'Aircraft',
          component: () => import('../views/Aircraft.vue')
        },
        {
          path: 'reservations',
          name: 'Reservations',
          component: () => import('../views/Reservations.vue')
        },
        {
          path: 'flight-logs',
          name: 'FlightLogs',
          component: () => import('../views/FlightLogs.vue')
        },
        {
          path: 'billing',
          name: 'Billing',
          component: () => import('../views/Billing.vue')
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/Profile.vue')
        },
        {
          path: 'members',
          name: 'Members',
          component: () => import('../views/Members.vue'),
          meta: { requiresAdmin: true }
        }
      ]
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
    next('/reservations')
  } else {
    next()
  }
})

export default router
