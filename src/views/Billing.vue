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
            <td>Member #{{ bill.member_id }}</td>
            <td>Aircraft #{{ bill.aircraft_id }}</td>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { billingAPI } from '../services/api'
import type { BillingRecord } from '../types'

const authStore = useAuthStore()
const billingRecords = ref<BillingRecord[]>([])

async function loadBillingRecords() {
  try {
    const response = await billingAPI.getAll()
    billingRecords.value = response.data
  } catch (error) {
    console.error('Error loading billing records:', error)
  }
}

async function markAsPaid(id: number) {
  try {
    await billingAPI.markPaid(id)
    await loadBillingRecords()
  } catch (error) {
    console.error('Error marking as paid:', error)
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadBillingRecords()
})
</script>
