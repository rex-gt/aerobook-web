<template>
  <AppLayout>
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome back! Here's what's happening with your flying club.</p>
    </div>

    <!-- Alert for reservations needing logs -->
    <div v-if="needsLogReservations.length > 0" class="alert alert-warning log-prompt-alert">
      <div class="alert-content">
        <span class="alert-icon">⚠️</span>
        <div>
          <strong>Action Required:</strong> You have {{ needsLogReservations.length }} past reservation{{ needsLogReservations.length > 1 ? 's' : '' }} needing flight details.
        </div>
      </div>
      <button class="btn-primary btn-small" @click="showLogModal = true">Enter Details</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card clickable" v-if="authStore.canManageMembers" @click="router.push('/members')">
        <h3>Total Members</h3>
        <div class="value">{{ members.length }}</div>
      </div>

      <div class="stat-card clickable" @click="router.push('/aircraft')">
        <h3>Available Aircraft</h3>
        <div class="value">{{ availableAircraft }}</div>
      </div>

      <div class="stat-card clickable" @click="router.push('/reservations')">
        <h3>Upcoming Reservations</h3>
        <div class="value">{{ upcomingReservations }}</div>
      </div>

      <div class="stat-card clickable" v-if="authStore.canManageBilling" @click="router.push('/billing')">
        <h3>Unpaid Bills</h3>
        <div class="value">{{ unpaidBills }}</div>
      </div>
    </div>

    <div class="recent-activity">
      <h2>Recent Reservations</h2>
      <div class="table-container desktop-only">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Aircraft</th>
              <th>Start Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reservation in displayReservations" :key="reservation.id">
              <td>{{ reservation.member_name }}</td>
              <td>{{ reservation.tail_number }} - {{ reservation.make }} {{ reservation.model }}</td>
              <td>{{ formatDate(reservation.start_time) }}</td>
              <td>
                <span class="status-badge" :class="`status-${reservation.status}`">
                  {{ reservation.status }}
                </span>
              </td>
            </tr>
            <tr v-if="displayReservations.length === 0">
              <td colspan="4" class="no-data">
                No reservations found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards for Recent Reservations -->
      <div class="mobile-only dashboard-mobile-list">
        <div v-if="displayReservations.length > 0">
          <div v-for="reservation in displayReservations" :key="reservation.id" class="reservation-mobile-card">
            <div class="card-header">
              <div class="res-identity">
                <h3>{{ reservation.tail_number }} - {{ reservation.make }} {{ reservation.model }}</h3>
              </div>
              <span class="status-badge" :class="`status-${reservation.status}`">
                {{ reservation.status }}
              </span>
            </div>
            
            <div class="card-details">
              <div class="detail-row">
                <span class="detail-label">Member:</span>
                <span class="detail-value">{{ reservation.member_name }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Start Time:</span>
                <span class="detail-value">{{ formatDate(reservation.start_time) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-data">
          No reservations found
        </div>
      </div>
    </div>
  </AppLayout>

  <!-- Flight Log Entry Modal -->
  <div v-if="showLogModal && currentNeedsLogRes" class="modal-overlay" @click.self="showLogModal = false">
    <div class="modal-card form-card">
      <div class="modal-header">
        <h2>Flight Details</h2>
        <button class="btn-close" @click="showLogModal = false">✕</button>
      </div>
      
      <div class="log-step-info">
        <p><strong>Aircraft:</strong> {{ currentNeedsLogRes.tail_number }}</p>
        <p><strong>Date:</strong> {{ formatDate(currentNeedsLogRes.start_time) }}</p>
      </div>

      <form @submit.prevent="submitFlightLog">
        <div v-if="logError" class="alert alert-error">{{ logError }}</div>
        
        <div class="form-group">
          <label>Was the flight completed?</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="logData.completed" :value="true"> Yes
            </label>
            <label class="radio-label">
              <input type="radio" v-model="logData.completed" :value="false"> No
            </label>
          </div>
        </div>

        <div v-if="logData.completed === true" class="form-group">
          <label>Flight Length (Hours)</label>
          <input type="number" step="0.1" v-model="logData.hours" required placeholder="e.g. 1.2" min="0.1">
        </div>

        <div v-if="logData.completed === false" class="form-group">
          <label>Reason for non-completion</label>
          <textarea v-model="logData.reason" required placeholder="e.g. Weather, mechanical issue..."></textarea>
        </div>

        <div class="modal-actions">
          <button type="submit" class="btn-primary" :disabled="isSubmittingLog">
            {{ isSubmittingLog ? 'Saving...' : 'Submit' }}
          </button>
          <button type="button" class="btn-secondary" @click="showLogModal = false">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { membersAPI, aircraftAPI, reservationsAPI, billingAPI, flightLogsAPI } from '../services/api'
import type { Member, Aircraft, Reservation, BillingRecord } from '../types'
import AppLayout from '../components/AppLayout.vue'

const authStore = useAuthStore()
const router = useRouter()

const members = ref<Member[]>([])
const aircraft = ref<Aircraft[]>([])
const reservations = ref<Reservation[]>([])
const billing = ref<BillingRecord[]>([])
const needsLogReservations = ref<Reservation[]>([])

// Log Modal State
const showLogModal = ref(false)
const logError = ref('')
const isSubmittingLog = ref(false)
const logData = ref({
  completed: null as boolean | null,
  hours: 0,
  reason: ''
})

const currentNeedsLogRes = computed(() => needsLogReservations.value[0] || null)

const availableAircraft = computed(() => aircraft.value.filter(a => a.is_available).length)
const upcomingReservations = computed(() => {
  const now = new Date()
  let filtered = reservations.value
  
  if (authStore.isMember) {
    filtered = filtered.filter(r => r.member_id === authStore.user?.id)
  }

  return filtered.filter(r => 
    (r.status === 'scheduled' || r.status === 'in_progress') && 
    new Date(r.end_time) > now
  ).length
})
const unpaidBills = computed(() => billing.value.filter(b => !b.is_paid).length)

const displayReservations = computed(() => {
  const now = new Date()
  let filtered = reservations.value.filter(r => new Date(r.start_time) < now)
  
  if (authStore.isMember) {
    filtered = filtered.filter(r => r.member_id === authStore.user?.id)
  }

  return [...filtered]
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 5)
})

async function loadData() {
  try {
    const promises: Promise<any>[] = [
      aircraftAPI.getAll(),
      reservationsAPI.getAll()
    ]

    // Fetch reservations that need logs for the current member
    if (authStore.user?.id) {
      promises.push(reservationsAPI.getAll({ member_id: authStore.user.id, needs_log: true }))
    }

    // Only fetch members list if authorized (prevents 403 crashing the whole load)
    if (authStore.canManageMembers) {
      promises.push(membersAPI.getAll())
    }

    if (authStore.canManageBilling) {
      promises.push(billingAPI.getAll())
    }

    const results = await Promise.all(promises)

    aircraft.value = results[0].data
    reservations.value = results[1].data
    
    let nextResultIndex = 2
    if (authStore.user?.id) {
      needsLogReservations.value = results[nextResultIndex++].data
    }

    if (authStore.canManageMembers) {
      members.value = results[nextResultIndex++].data
    }

    if (authStore.canManageBilling) {
      billing.value = results[nextResultIndex++].data
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

async function submitFlightLog() {
  if (!currentNeedsLogRes.value) return
  
  if (logData.value.completed === null) {
    logError.value = 'Please select whether the flight was completed.'
    return
  }
  
  logError.value = ''
  isSubmittingLog.value = true
  
  try {
    const res = currentNeedsLogRes.value
    
    if (logData.value.completed) {
      const aircraftInfo = aircraft.value.find(a => a.id === res.aircraft_id)
      if (!aircraftInfo) {
        logError.value = 'Unable to find the selected aircraft. Please refresh and try again.'
        return
      }

      const tachStart = Number(aircraftInfo.current_tach_hours)
      const hours = Number(logData.value.hours)

      await flightLogsAPI.create({
        reservation_id: res.id,
        member_id: res.member_id,
        aircraft_id: res.aircraft_id,
        tach_start: tachStart,
        tach_end: tachStart + hours,
        flight_date: new Date(res.start_time).toISOString().split('T')[0]
      })
      await reservationsAPI.update(res.id, { status: 'completed' })
    } else {
      await reservationsAPI.update(res.id, { 
        status: 'cancelled', 
        notes: [res.notes?.trim(), 'Not completed: ' + logData.value.reason].filter(Boolean).join(' ')
      })
    }
    
    await loadData()
    logData.value = { completed: null, hours: 0, reason: '' }
    if (needsLogReservations.value.length === 0) {
      showLogModal.value = false
    }
  } catch (error) {
    console.error('Error submitting log:', error)
    logError.value = 'Failed to submit flight details. Please try again.'
  } finally {
    isSubmittingLog.value = false
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

.log-prompt-alert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: rgba(251, 146, 60, 0.15);
  border: 1px solid var(--accent-orange);
  color: #fed7aa;
}

.alert-content {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.alert-icon {
  font-size: 1.25rem;
}

.log-step-info {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.log-step-info p {
  margin: 0.25rem 0;
}

.radio-group {
  display: flex;
  gap: 2rem;
  margin-top: 0.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: none;
  font-weight: 400;
  cursor: pointer;
}

.radio-label input {
  width: auto;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 2rem;
  }

  .dashboard-header p {
    font-size: 1rem;
  }

  /* Modern Mobile Card Styles for Dashboard */
  .dashboard-mobile-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .reservation-mobile-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .res-identity h3 {
    margin: 0;
    font-size: 1rem;
    color: #e2e8f0;
  }

  .res-id {
    font-size: 0.75rem;
    color: #94a3b8;
    font-family: 'Space Mono', monospace;
  }

  .card-details {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
  }

  .detail-label {
    color: #94a3b8;
  }

  .detail-value {
    color: #cbd5e1;
    font-weight: 500;
  }
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
