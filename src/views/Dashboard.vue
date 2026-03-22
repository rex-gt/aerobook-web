<template>
  <AppLayout>
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
              <td>{{ getMemberName(reservation.member_id) }}</td>
              <td>{{ getAircraftName(reservation.aircraft_id) }}</td>
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
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { membersAPI, aircraftAPI, reservationsAPI, billingAPI } from '../services/api'
import type { Member, Aircraft, Reservation, BillingRecord } from '../types'
import AppLayout from '../components/AppLayout.vue'

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
      reservationsAPI.getAll(),
      membersAPI.getAll()
    ]

    if (authStore.canManageBilling) {
      promises.push(billingAPI.getAll())
    }

    const results = await Promise.all(promises)

    aircraft.value = results[0].data
    reservations.value = results[1].data
    members.value = results[2].data

    if (authStore.canManageBilling) {
      billing.value = results[3].data
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

function getMemberName(memberId: number): string {
  const member = members.value.find(m => m.id === memberId)
  return member ? `${member.first_name} ${member.last_name}` : `Member #${memberId}`
}

function getAircraftName(aircraftId: number): string {
  const plane = aircraft.value.find(a => a.id === aircraftId)
  return plane ? `${plane.tail_number} - ${plane.make} ${plane.model}` : `Aircraft #${aircraftId}`
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
</style>
