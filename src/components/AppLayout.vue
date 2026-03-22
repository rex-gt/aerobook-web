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
      <div class="user-info">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const drawerOpen = ref(false)
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

.user-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger-red);
}

.role-operator {
  background: rgba(251, 146, 60, 0.2);
  color: var(--accent-orange);
}

.role-member {
  background: rgba(14, 165, 233, 0.2);
  color: var(--sky-blue);
}
</style>
