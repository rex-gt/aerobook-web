<template>
  <div class="container">
    <div v-if="!authStore.canManageAircraft" class="alert alert-error">
      <strong>Access Denied:</strong> You don't have permission to manage aircraft. Only Admins and Operators can access this page.
    </div>

    <template v-else>
      <div class="page-header">
        <div>
          <h1>Aircraft Management</h1>
          <p>Manage your fleet of aircraft</p>
        </div>
        <button class="btn-primary" @click="toggleForm">
          {{ showForm ? 'Cancel' : '+ Add Aircraft' }}
        </button>
      </div>

      <div v-if="showForm" class="form-card">
        <h2>{{ editingAircraft ? 'Edit Aircraft' : 'Add New Aircraft' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label for="tail_number">Tail Number</label>
              <input v-model="formData.tail_number" type="text" id="tail_number" placeholder="N12345" required />
            </div>

            <div class="form-group">
              <label for="make">Make</label>
              <input v-model="formData.make" type="text" id="make" placeholder="Cessna" required />
            </div>

            <div class="form-group">
              <label for="model">Model</label>
              <input v-model="formData.model" type="text" id="model" placeholder="172S" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="year">Year</label>
              <input v-model.number="formData.year" type="number" id="year" required />
            </div>

            <div class="form-group">
              <label for="hourly_rate">Hourly Rate ($)</label>
              <input v-model.number="formData.hourly_rate" type="number" id="hourly_rate" step="0.01" required />
            </div>

            <div class="form-group">
              <label for="current_tach_hours">Tach Hours</label>
              <input v-model.number="formData.current_tach_hours" type="number" id="current_tach_hours" step="0.1" required />
            </div>
          </div>

          <div class="form-group">
            <label>
              <input v-model="formData.is_available" type="checkbox" />
              Aircraft is available
            </label>
          </div>

          <button type="submit" class="btn-primary">
            {{ editingAircraft ? 'Update Aircraft' : 'Add Aircraft' }}
          </button>
        </form>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Tail Number</th>
              <th>Make/Model</th>
              <th>Year</th>
              <th>Hourly Rate</th>
              <th>Tach Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plane in aircraft" :key="plane.id">
              <td><strong>{{ plane.tail_number }}</strong></td>
              <td>{{ plane.make }} {{ plane.model }}</td>
              <td>{{ plane.year }}</td>
              <td>${{ plane.hourly_rate }}/hr</td>
              <td>{{ plane.current_tach_hours }}</td>
              <td>
                <span class="status-badge" :class="plane.is_available ? 'status-available' : 'status-unavailable'">
                  {{ plane.is_available ? 'Available' : 'Unavailable' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-small btn-secondary" @click="editAircraft(plane)">Edit</button>
                  <button class="btn-small btn-danger" @click="deleteAircraft(plane.id)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="aircraft.length === 0">
              <td colspan="7" class="no-data">No aircraft found. Add your first aircraft to get started!</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { aircraftAPI } from '../services/api'
import type { Aircraft } from '../types'

const authStore = useAuthStore()

const aircraft = ref<Aircraft[]>([])
const showForm = ref(false)
const editingAircraft = ref<Aircraft | null>(null)

const formData = ref({
  tail_number: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  hourly_rate: 0,
  current_tach_hours: 0,
  is_available: true
})

async function loadAircraft() {
  if (!authStore.canManageAircraft) return
  
  try {
    const response = await aircraftAPI.getAll()
    aircraft.value = response.data
  } catch (error) {
    console.error('Error loading aircraft:', error)
  }
}

function toggleForm() {
  showForm.value = !showForm.value
  if (!showForm.value) {
    editingAircraft.value = null
    resetForm()
  }
}

function resetForm() {
  formData.value = {
    tail_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    hourly_rate: 0,
    current_tach_hours: 0,
    is_available: true
  }
}

async function handleSubmit() {
  try {
    if (editingAircraft.value) {
      await aircraftAPI.update(editingAircraft.value.id, formData.value)
    } else {
      await aircraftAPI.create(formData.value)
    }
    await loadAircraft()
    toggleForm()
  } catch (error) {
    console.error('Error saving aircraft:', error)
  }
}

function editAircraft(plane: Aircraft) {
  editingAircraft.value = plane
  formData.value = {
    tail_number: plane.tail_number,
    make: plane.make,
    model: plane.model,
    year: plane.year,
    hourly_rate: plane.hourly_rate,
    current_tach_hours: plane.current_tach_hours,
    is_available: plane.is_available
  }
  showForm.value = true
}

async function deleteAircraft(id: number) {
  if (confirm('Are you sure you want to delete this aircraft?')) {
    try {
      await aircraftAPI.delete(id)
      await loadAircraft()
    } catch (error) {
      console.error('Error deleting aircraft:', error)
    }
  }
}

onMounted(() => {
  loadAircraft()
})
</script>

<style scoped>
.form-card {
  margin-bottom: 2rem;
}

.form-card h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
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
