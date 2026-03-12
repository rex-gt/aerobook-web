<template>
  <header class="app-header">
    <div class="nav-logo" @click="$router.push('/dashboard')">✈ WingTime</div>

    <!-- Desktop nav links -->
    <nav class="nav-links" aria-label="Main navigation">
      <a @click="$router.push('/dashboard')" :class="{ active: $route.path === '/dashboard' }">Dashboard</a>
      <a @click="$router.push('/reservations')" :class="{ active: $route.path === '/reservations' }">Reservations</a>
      <a v-if="authStore.canManageAircraft" @click="$router.push('/aircraft')" :class="{ active: $route.path === '/aircraft' }">Aircraft</a>
      <a @click="$router.push('/flight-logs')" :class="{ active: $route.path === '/flight-logs' }">Flight Logs</a>
      <a v-if="authStore.canManageBilling" @click="$router.push('/billing')" :class="{ active: $route.path === '/billing' }">Billing</a>
      <a v-if="authStore.canManageMembers" @click="$router.push('/members')" :class="{ active: $route.path === '/members' }">Members</a>
    </nav>

    <!-- Desktop user info -->
    <div class="nav-user">
      <span v-if="authStore.user" class="user-name">
        {{ authStore.user.first_name }} {{ authStore.user.last_name }}
      </span>
      <span v-if="authStore.userRole" class="role-badge" :class="`role-${authStore.userRole}`">{{ authStore.userRole }}</span>
      <button class="btn-secondary btn-small" @click="$router.push('/profile')">Profile</button>
      <button class="btn-secondary btn-small" @click="authStore.logout()">Logout</button>
    </div>

    <!-- Mobile hamburger -->
    <button class="hamburger" :class="{ open: menuOpen }" @click="toggleMenu" aria-label="Toggle menu" :aria-expanded="menuOpen">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </header>

  <!-- Mobile menu overlay -->
  <div class="mobile-menu" :class="{ open: menuOpen }" role="dialog" aria-label="Mobile navigation">
    <div class="mobile-menu-user" v-if="authStore.user">
      <span class="user-name">{{ authStore.user.first_name }} {{ authStore.user.last_name }}</span>
      <span class="role-badge" :class="`role-${authStore.userRole}`">{{ authStore.userRole }}</span>
    </div>
    <nav class="mobile-nav-links" aria-label="Mobile navigation">
      <a @click="navigate('/dashboard')" :class="{ active: $route.path === '/dashboard' }">🏠 Dashboard</a>
      <a @click="navigate('/reservations')" :class="{ active: $route.path === '/reservations' }">📅 Reservations</a>
      <a v-if="authStore.canManageAircraft" @click="navigate('/aircraft')" :class="{ active: $route.path === '/aircraft' }">✈ Aircraft</a>
      <a @click="navigate('/flight-logs')" :class="{ active: $route.path === '/flight-logs' }">📋 Flight Logs</a>
      <a v-if="authStore.canManageBilling" @click="navigate('/billing')" :class="{ active: $route.path === '/billing' }">💳 Billing</a>
      <a v-if="authStore.canManageMembers" @click="navigate('/members')" :class="{ active: $route.path === '/members' }">👥 Members</a>
      <a @click="navigate('/profile')" :class="{ active: $route.path === '/profile' }">👤 Profile</a>
    </nav>
    <button class="btn-danger mobile-logout" @click="authStore.logout()">Logout</button>
  </div>

  <!-- Backdrop -->
  <div v-if="menuOpen" class="menu-backdrop" @click="closeMenu"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function navigate(path: string) {
  closeMenu()
  router.push(path)
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  height: 64px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(8, 47, 73, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 1.5rem;
}

.nav-logo {
  font-family: 'Space Mono', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Desktop nav links */
.nav-links {
  display: flex;
  gap: 0.25rem;
  flex: 1;
}

.nav-links a,
.mobile-nav-links a {
  cursor: pointer;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  transition: all 0.2s ease;
  white-space: nowrap;
  text-decoration: none;
}

.nav-links a:hover,
.nav-links a.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-links a.active {
  color: var(--sky-blue);
}

/* Desktop user info */
.nav-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.user-name {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.role-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.role-admin {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.role-operator {
  background: rgba(251, 146, 60, 0.2);
  color: #fdba74;
}

.role-member {
  background: rgba(14, 165, 233, 0.2);
  color: var(--sky-blue);
}

/* Hamburger button */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 8px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.hamburger:hover {
  background: rgba(255, 255, 255, 0.1);
}

.hamburger span {
  display: block;
  height: 2px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.open span:nth-child(2) {
  opacity: 0;
}

.hamburger.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile menu */
.mobile-menu {
  position: fixed;
  top: 64px;
  right: 0;
  width: 280px;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  background: rgba(8, 47, 73, 0.97);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 200;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.mobile-menu.open {
  transform: translateX(0);
}

.mobile-menu-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
}

.mobile-menu-user .user-name {
  font-size: 0.95rem;
  font-weight: 600;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-nav-links a {
  display: block;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-nav-links a:hover,
.mobile-nav-links a.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.mobile-nav-links a.active {
  color: var(--sky-blue);
  background: rgba(14, 165, 233, 0.1);
}

.mobile-logout {
  width: 100%;
  margin-top: auto;
}

/* Backdrop */
.menu-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 150;
  top: 64px;
}

/* Responsive: show hamburger, hide desktop nav */
@media (max-width: 768px) {
  .nav-links,
  .nav-user {
    display: none;
  }

  .hamburger {
    display: flex;
    margin-left: auto;
  }
}

@media (min-width: 769px) {
  .mobile-menu,
  .menu-backdrop {
    display: none !important;
  }
}
</style>
