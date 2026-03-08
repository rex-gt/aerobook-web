<template>
  <div class="container">
    <header>
      <div class="logo" @click="$router.push('/dashboard')">✈ Flying Club</div>
      <div class="user-info">
        <button class="btn-secondary" @click="$router.push('/dashboard')">Dashboard</button>
        <button class="btn-secondary" @click="authStore.logout()">Logout</button>
      </div>
    </header>

    <div class="page-header">
      <div>
        <h1>Reservations</h1>
        <p>Manage aircraft bookings</p>
      </div>
      <button class="btn-primary" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : '+ New Reservation' }}
      </button>
    </div>

    <div v-if="showForm" class="form-card">
      <h2>New Reservation</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label>Member</label>
            <select v-model="formData.member_id" required>
              <option value="0">Select Member</option>
              <option v-for="member in members" :key="member.id" :value="member.id">
                {{ member.first_name }} {{ member.last_name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Aircraft</label>
            <select v-model="formData.aircraft_id" required>
              <option value="0">Select Aircraft</option>
              <option v-for="plane in aircraft" :key="plane.id" :value="plane.id">
                {{ plane.tail_number }} - {{ plane.make }} {{ plane.model }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Start Time</label>
            <input v-model="formData.start_time" type="datetime-local" required />
          </div>

          <div class="form-group">
            <label>End Time</label>
            <input v-model="formData.end_time" type="datetime-local" required />
          </div>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea v-model="formData.notes" rows="3"></textarea>
        </div>

        <button type="submit" class="btn-primary">Create Reservation</button>
      </form>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Member</th>
            <th>Aircraft</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="res in reservations" :key="res.id">
            <td>#{{ res.id }}</td>
            <td>Member #{{ res.member_id }}</td>
            <td>Aircraft #{{ res.aircraft_id }}</td>
            <td>{{ formatDate(res.start_time) }}</td>
            <td>{{ formatDate(res.end_time) }}</td>
            <td><span class="status-badge" :class="`status-${res.status}`">{{ res.status }}</span></td>
            <td>
              <button class="btn-small btn-danger" @click="deleteReservation(res.id)">Delete</button>
            </td>
          </tr>
          <tr v-if="reservations.length === 0">
            <td colspan="7" class="no-data">No reservations found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { reservationsAPI, membersAPI, aircraftAPI } from '../services/api'
import type { Reservation, Member, Aircraft } from '../types'

const authStore = useAuthStore()

const reservations = ref<Reservation[]>([])
const members = ref<Member[]>([])
const aircraft = ref<Aircraft[]>([])
const showForm = ref(false)

const formData = ref({
  member_id: 0,
  aircraft_id: 0,
  start_time: '',
  end_time: '',
  notes: '',
  status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled'
})

async function loadData() {
  try {
    const [resRes, memRes, airRes] = await Promise.all([
      reservationsAPI.getAll(),
      membersAPI.getAll(),
      aircraftAPI.getAll()
    ])
    reservations.value = resRes.data
    members.value = memRes.data
    aircraft.value = airRes.data
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

async function handleSubmit() {
  try {
    await reservationsAPI.create(formData.value)
    await loadData()
    showForm.value = false
  } catch (error) {
    console.error('Error creating reservation:', error)
  }
}

async function deleteReservation(id: number) {
  if (confirm('Are you sure?')) {
    try {
      await reservationsAPI.delete(id)
      await loadData()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  loadData()
})
</script>
