<template>
  <div class="app-layout">
    <!-- Top Bar -->
    <header class="top-bar">
      <div class="top-bar-left">
        <button class="hamburger-btn" @click="toggleDrawer" aria-label="Toggle navigation">
          <span class="hamburger-lines">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <div class="logo" @click="router.push('/dashboard')">✈ WingTime</div>
      </div>
      <div class="top-bar-right">
        <span v-if="authStore.user" class="user-details">
          {{ authStore.user.first_name }} {{ authStore.user.last_name }}
          <span class="role-badge" :class="`role-${authStore.userRole}`">{{ authStore.userRole }}</span>
        </span>
        <button class="btn-secondary btn-small" @click="router.push('/profile')">Profile</button>
        <button class="btn-secondary btn-small" @click="authStore.logout()">Logout</button>
      </div>
    </header>

    <!-- Left Drawer -->
    <nav class="drawer" :class="{ 'drawer-open': drawerOpen }">
      <ul class="nav-list">
        <li>
          <button class="nav-btn" :class="{ active: route.path === '/dashboard' }" @click="router.push('/dashboard')">
            <span class="nav-icon">📊</span> Dashboard
          </button>
        </li>
        <li>
          <button class="nav-btn" :class="{ active: route.path === '/reservations' }" @click="router.push('/reservations')">
            <span class="nav-icon">📅</span> Reservations
          </button>
        </li>
        <li>
          <button class="nav-btn" :class="{ active: route.path === '/flight-logs' }" @click="router.push('/flight-logs')">
            <span class="nav-icon">📋</span> Flight Logs
          </button>
        </li>
        <li v-if="authStore.canManageAircraft">
          <button class="nav-btn" :class="{ active: route.path === '/aircraft' }" @click="router.push('/aircraft')">
            <span class="nav-icon">🛩</span> Aircraft
          </button>
        </li>
        <li v-if="authStore.canManageMembers">
          <button class="nav-btn" :class="{ active: route.path === '/members' }" @click="router.push('/members')">
            <span class="nav-icon">👥</span> Members
          </button>
        </li>
        <li v-if="authStore.canManageBilling">
          <button class="nav-btn" :class="{ active: route.path === '/billing' }" @click="router.push('/billing')">
            <span class="nav-icon">💰</span> Billing
          </button>
        </li>
      </ul>
    </nav>

    <!-- Overlay for mobile when drawer is open -->
    <div v-if="drawerOpen" class="drawer-overlay" @click="toggleDrawer"></div>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'drawer-pushed': drawerOpen }">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const drawerOpen = ref(localStorage.getItem('drawerOpen') !== 'false')

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value
  localStorage.setItem('drawerOpen', String(drawerOpen.value))
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

/* ── Top Bar ── */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  background: rgba(8, 47, 73, 0.97);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  font-family: 'Space Mono', monospace;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--cloud-white);
}

/* ── Hamburger Button ── */
.hamburger-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hamburger-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: none;
  box-shadow: none;
}

.hamburger-lines {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.hamburger-lines span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--cloud-white);
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* ── Left Drawer ── */
.drawer {
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  width: 240px;
  background: rgba(8, 47, 73, 0.98);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 900;
  overflow-y: auto;
  padding: 1rem 0;
}

.drawer.drawer-open {
  transform: translateX(0);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-btn {
  width: 100%;
  text-align: left;
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  border-right: 3px solid transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.975rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  border-radius: 0;
}

.nav-btn:hover {
  background: rgba(14, 165, 233, 0.15);
  color: white;
  transform: none;
  box-shadow: none;
}

.nav-btn.active {
  background: rgba(14, 165, 233, 0.2);
  color: var(--sky-blue);
  border-right-color: var(--sky-blue);
}

.nav-icon {
  font-size: 1.1rem;
  width: 1.5rem;
  text-align: center;
}

/* ── Overlay (mobile) ── */
.drawer-overlay {
  display: none;
  position: fixed;
  inset: 64px 0 0 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 850;
}

/* ── Main Content ── */
.main-content {
  margin-top: 64px;
  margin-left: 0;
  transition: margin-left 0.3s ease;
  min-height: calc(100vh - 64px);
}

.main-content.drawer-pushed {
  margin-left: 240px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .main-content.drawer-pushed {
    margin-left: 0;
  }

  .drawer-overlay {
    display: block;
  }

  .user-details {
    display: none;
  }
}
</style>
