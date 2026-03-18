<template>
  <AppLayout>
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
            <td>{{ getMemberName(log.member_id) }}</td>
            <td>{{ getAircraftName(log.aircraft_id) }}</td>
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
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { flightLogsAPI, membersAPI, aircraftAPI } from '../services/api'
import type { FlightLog, Member, Aircraft } from '../types'
import AppLayout from '../components/AppLayout.vue'

const flightLogs = ref<FlightLog[]>([])
const members = ref<Member[]>([])
const aircraft = ref<Aircraft[]>([])

async function loadData() {
  try {
    const [logsRes, membersRes, aircraftRes] = await Promise.all([
      flightLogsAPI.getAll(),
      membersAPI.getAll(),
      aircraftAPI.getAll()
    ])
    flightLogs.value = logsRes.data
    members.value = membersRes.data
    aircraft.value = aircraftRes.data
  } catch (error) {
    console.error('Error loading flight logs:', error)
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
  return new Date(dateString).toLocaleDateString()
}

function formatTime(timeString: string) {
  return new Date(timeString).toLocaleTimeString()
}

onMounted(() => {
  loadData()
})
</script>
