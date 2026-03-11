<template>
  <div class="container">
    <header>
      <div class="logo" @click="$router.push('/dashboard')">✈ WingTime</div>
      <div class="user-info">
        <span v-if="authStore.user" class="user-details">
          {{ authStore.user.first_name }} {{ authStore.user.last_name }}
          <span class="role-badge" :class="`role-${authStore.userRole}`">{{ authStore.userRole }}</span>
        </span>
        <button class="btn-secondary" @click="$router.push('/profile')" title="Edit profile">Profile</button>
        <button class="btn-secondary" @click="authStore.logout()">Logout</button>
      </div>
    </header>

    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome back! Here's what's happening with your flying club.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card" v-if="authStore.canManageMembers">
        <h3>Total Members</h3>
        <div class="value">{{ members.length }}</div>
      </div>

      <div class="stat-card">
        <h3>Available Aircraft</h3>
        <div class="value">{{ availableAircraft }}</div>
      </div>

      <div class="stat-card">
        <h3>Upcoming Reservations</h3>
        <div class="value">{{ upcomingReservations }}</div>
      </div>

      <div class="stat-card" v-if="authStore.canManageBilling">
        <h3>Unpaid Bills</h3>
        <div class="value">{{ unpaidBills }}</div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="action-buttons">
        <button v-if="authStore.canManageMembers" class="btn-primary" @click="$router.push('/members')">
          Manage Members
        </button>
        <button v-if="authStore.canManageAircraft" class="btn-primary" @click="$router.push('/aircraft')">
          Manage Aircraft
        </button>
        <button class="btn-primary" @click="$router.push('/reservations')">
          Reservations
        </button>
        <button class="btn-primary" @click="$router.push('/flight-logs')">
          {{ authStore.isAdmin || authStore.isOperator ? 'All Flight Logs' : 'My Flight Logs' }}
        </button>
        <button v-if="authStore.canManageBilling" class="btn-primary" @click="$router.push('/billing')">
          Billing
        </button>
      </div>
    </div>

    <div class="recent-activity">
      <h2>Recent Reservations</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Member</th>
              <th>Aircraft</th>
              <th>Start Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reservation in displayReservations" :key="reservation.id">
              <td>{{ reservation.id }}</td>
              <td>Member #{{ reservation.member_id }}</td>
              <td>Aircraft #{{ reservation.aircraft_id }}</td>
              <td>{{ formatDate(reservation.start_time) }}</td>
              <td>
                <span class="status-badge" :class="`status-${reservation.status}`">
                  {{ reservation.status }}
                </span>
              </td>
            </tr>
            <tr v-if="displayReservations.length === 0">
              <td colspan="5" class="no-data">
                No reservations found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { membersAPI, aircraftAPI, reservationsAPI, billingAPI } from '../services/api'
import type { Member, Aircraft, Reservation, BillingRecord } from '../types'

const authStore = useAuthStore()

const members = ref<Member[]>([])
const aircraft = ref<Aircraft[]>([])
const reservations = ref<Reservation[]>([])
const billing = ref<BillingRecord[]>([])

const availableAircraft = computed(() => aircraft.value.filter(a => a.is_available).length)
const upcomingReservations = computed(() => {
  return reservations.value.filter(r => r.status === 'scheduled').length
})
const unpaidBills = computed(() => billing.value.filter(b => !b.is_paid).length)

const displayReservations = computed(() => {
  return reservations.value.slice(0, 5)
})

async function loadData() {
  try {
    const promises: Promise<any>[] = [
      aircraftAPI.getAll(),
      reservationsAPI.getAll()
    ]
    
    if (authStore.canManageMembers) {
      promises.push(membersAPI.getAll())
    }
    
    if (authStore.canManageBilling) {
      promises.push(billingAPI.getAll())
    }

    const results = await Promise.all(promises)
    
    aircraft.value = results[0].data
    reservations.value = results[1].data
    
    let resultIndex = 2
    if (authStore.canManageMembers) {
      members.value = results[resultIndex].data
      resultIndex++
    }
    if (authStore.canManageBilling) {
      billing.value = results[resultIndex].data
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard-header {
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.quick-actions, .recent-activity {
  margin-bottom: 3rem;
}

.quick-actions h2, .recent-activity h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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
