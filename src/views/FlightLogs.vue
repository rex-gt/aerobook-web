<template>
  <AppNav />
  <div class="container">

    <div class="page-header">
      <div>
        <h1>Flight Logs</h1>
        <p>View all completed flights</p>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Member</th>
            <th>Aircraft</th>
            <th>Flight Date</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Tach Hours</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in flightLogs" :key="log.id">
            <td>#{{ log.id }}</td>
            <td>Member #{{ log.member_id }}</td>
            <td>Aircraft #{{ log.aircraft_id }}</td>
            <td>{{ formatDate(log.flight_date) }}</td>
            <td>{{ formatTime(log.departure_time) }}</td>
            <td>{{ formatTime(log.arrival_time) }}</td>
            <td><strong>{{ log.tach_hours }}</strong></td>
          </tr>
          <tr v-if="flightLogs.length === 0">
            <td colspan="7" class="no-data">No flight logs found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { flightLogsAPI } from '../services/api'
import type { FlightLog } from '../types'
import AppNav from '../components/AppNav.vue'

const flightLogs = ref<FlightLog[]>([])

async function loadFlightLogs() {
  try {
    const response = await flightLogsAPI.getAll()
    flightLogs.value = response.data
  } catch (error) {
    console.error('Error loading flight logs:', error)
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

function formatTime(timeString: string) {
  return new Date(timeString).toLocaleTimeString()
}

onMounted(() => {
  loadFlightLogs()
})
</script>
