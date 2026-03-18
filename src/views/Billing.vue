<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <h1>Billing</h1>
        <p>Manage member invoices and payments</p>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Member</th>
            <th>Aircraft</th>
            <th>Date</th>
            <th>Tach Hours</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bill in billingRecords" :key="bill.id">
            <td>#{{ bill.id }}</td>
            <td>{{ getMemberName(bill.member_id) }}</td>
            <td>{{ getAircraftName(bill.aircraft_id) }}</td>
            <td>{{ formatDate(bill.billing_date) }}</td>
            <td>{{ bill.tach_hours }}</td>
            <td>${{ bill.hourly_rate }}/hr</td>
            <td><strong>${{ bill.amount }}</strong></td>
            <td>
              <span class="status-badge" :class="bill.is_paid ? 'status-paid' : 'status-unpaid'">
                {{ bill.is_paid ? 'Paid' : 'Unpaid' }}
              </span>
            </td>
            <td>
              <button v-if="!bill.is_paid" class="btn-small btn-primary" @click="markAsPaid(bill.id)">
                Mark Paid
              </button>
            </td>
          </tr>
          <tr v-if="billingRecords.length === 0">
            <td colspan="9" class="no-data">No billing records found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { billingAPI, membersAPI, aircraftAPI } from '../services/api'
import type { BillingRecord, Member, Aircraft } from '../types'
import AppLayout from '../components/AppLayout.vue'

const billingRecords = ref<BillingRecord[]>([])
const members = ref<Member[]>([])
const aircraft = ref<Aircraft[]>([])

async function loadData() {
  try {
    const [billingRes, membersRes, aircraftRes] = await Promise.all([
      billingAPI.getAll(),
      membersAPI.getAll(),
      aircraftAPI.getAll()
    ])
    billingRecords.value = billingRes.data
    members.value = membersRes.data
    aircraft.value = aircraftRes.data
  } catch (error) {
    console.error('Error loading billing data:', error)
  }
}

async function markAsPaid(id: number) {
  try {
    await billingAPI.markPaid(id)
    await loadData()
  } catch (error) {
    console.error('Error marking as paid:', error)
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

onMounted(() => {
  loadData()
})
</script>
