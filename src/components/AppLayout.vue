<template>
  <div class="container">
    <header>
      <div class="header-left">
        <button class="hamburger" @click="drawerOpen = !drawerOpen" aria-label="Open menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <img src="/aerobook-logo.svg" alt="AeroBook" class="logo" @click="$router.push('/dashboard')" />
      </div>
      <div class="user-info desktop-only">
        <span v-if="authStore.user" class="user-details">
          {{ authStore.user.first_name }} {{ authStore.user.last_name }}
          <span class="role-badge" :class="`role-${authStore.userRole}`">{{ authStore.userRole }}</span>
        </span>
        <button class="btn-secondary" @click="$router.push('/profile')" title="Edit profile">Profile</button>
        <button class="btn-secondary" @click="authStore.logout()">Logout</button>
      </div>
    </header>

    <!-- Left Drawer -->
    <div class="left-drawer" :class="{ open: drawerOpen }">
      <div class="drawer-header">
        <span class="drawer-title">Menu</span>
        <button class="drawer-close" @click="drawerOpen = false" aria-label="Close menu">&times;</button>
      </div>

      <!-- User info in drawer (mobile only) -->
      <div v-if="authStore.user" class="drawer-user-info mobile-only">
        <div class="drawer-user-details">
          <p class="drawer-user-name">{{ authStore.user.first_name }} {{ authStore.user.last_name }}</p>
          <span class="role-badge" :class="`role-${authStore.userRole}`">{{ authStore.userRole }}</span>
        </div>
        <div class="drawer-user-actions">
          <button class="btn-secondary btn-small" @click="$router.push('/profile'); drawerOpen = false">Profile</button>
          <button class="btn-secondary btn-small" @click="authStore.logout()">Logout</button>
        </div>
      </div>

      <nav class="drawer-actions">

        <button class="btn-primary drawer-btn" @click="$router.push('/dashboard'); drawerOpen = false">
          Dashboard
        </button>
        <button v-if="authStore.canManageMembers" class="btn-primary drawer-btn" @click="$router.push('/members'); drawerOpen = false">
          Manage Members
        </button>
        <button v-if="authStore.canManageAircraft" class="btn-primary drawer-btn" @click="$router.push('/aircraft'); drawerOpen = false">
          Manage Aircraft
        </button>
        <button class="btn-primary drawer-btn" @click="$router.push('/reservations'); drawerOpen = false">
          Reservations
        </button>
        <button class="btn-primary drawer-btn" @click="$router.push('/maintenance'); drawerOpen = false">
          Maintenance
        </button>
        <button class="btn-primary drawer-btn" @click="$router.push('/squawks'); drawerOpen = false">
          Squawks
        </button>
        <button class="btn-primary drawer-btn" @click="$router.push('/flight-logs'); drawerOpen = false">
          {{ authStore.isAdmin || authStore.isOperator ? 'All Flight Logs' : 'My Flight Logs' }}
        </button>
        <button v-if="authStore.canManageBilling" class="btn-primary drawer-btn" @click="$router.push('/billing'); drawerOpen = false">
          Billing
        </button>
      </nav>
    </div>
    <div v-if="drawerOpen" class="drawer-backdrop" @click="drawerOpen = false"></div>

    <!-- Page Content -->
    <slot></slot>

    <!-- What's New Pop-up -->
    <WhatsNewModal
      v-if="whatsNewConfig && isWhatsNewOpen"
      :config="whatsNewConfig"
      :is-open="isWhatsNewOpen"
      @close="handleWhatsNewClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { WhatsNewConfig } from '../types'
import WhatsNewModal from './WhatsNewModal.vue'

const authStore = useAuthStore()
const drawerOpen = ref(false)

const isWhatsNewOpen = ref(false)
const whatsNewConfig = ref<WhatsNewConfig | null>(null)

const handleWhatsNewClose = (dontShowAgain: boolean) => {
  if (whatsNewConfig.value && authStore.user) {
    const configId = whatsNewConfig.value.id
    const userId = authStore.user.id
    if (dontShowAgain) {
      localStorage.setItem(`whats_new_dismissed_${userId}`, configId)
    }
    sessionStorage.setItem(`whats_new_session_dismissed_${userId}`, configId)
  }
  isWhatsNewOpen.value = false
}

const checkWhatsNew = async () => {
  if (!authStore.isAuthenticated || !authStore.user) return
  if (whatsNewConfig.value) return

  try {
    const response = await fetch('/whats-new.json')
    if (!response.ok) return

    const config: WhatsNewConfig = await response.json()
    if (!config || !config.enabled) return

    const now = new Date()
    if (config.startDate && now < new Date(config.startDate)) {
      return
    }
    if (config.endDate && now > new Date(config.endDate)) {
      return
    }

    const userId = authStore.user.id
    const persistentDismissed = localStorage.getItem(`whats_new_dismissed_${userId}`)
    if (persistentDismissed === config.id) return

    const sessionDismissed = sessionStorage.getItem(`whats_new_session_dismissed_${userId}`)
    if (sessionDismissed === config.id) return

    whatsNewConfig.value = config
    isWhatsNewOpen.value = true
  } catch (error) {
    console.error('Failed to load or parse What\'s New configuration:', error)
  }
}

watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      checkWhatsNew()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-right: 8px;
  z-index: 300;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 3px;
  background: var(--cloud-white);
  border-radius: 2px;
  transition: all 0.3s;
}

.left-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: rgba(20, 30, 50, 0.98);
  box-shadow: 2px 0 16px rgba(0,0,0,0.15);
  z-index: 250;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(.4,0,.2,1);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem 1rem 1rem;
}

.left-drawer.open {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.drawer-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--cloud-white);
}

.drawer-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--cloud-white);
  cursor: pointer;
  line-height: 1;
}

.drawer-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.drawer-user-info {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.drawer-user-details {
  margin-bottom: 1rem;
}

.drawer-user-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--cloud-white);
}

.drawer-user-actions {
  display: flex;
  gap: 0.5rem;
}

.drawer-user-actions button {
  flex: 1;
}

.drawer-btn {
  width: 100%;
  justify-content: flex-start;
  text-align: left;
}

.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  z-index: 200;
}

@media (max-width: 480px) {
  .left-drawer {
    width: 100%;
  }
}


.user-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
