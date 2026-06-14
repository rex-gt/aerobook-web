<template>
  <AppLayout>
    <div class="profile-header">
      <h1>Edit Profile</h1>
      <p>Update your personal information and password</p>
    </div>

    <div class="profile-content">
      <div class="form-card">
        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleUpdate">
          <!-- Personal Information Section -->
          <div class="form-section">
            <h2>Personal Information</h2>

            <div class="form-group">
              <label for="first_name">First Name</label>
              <input
                v-model="formData.first_name"
                type="text"
                id="first_name"
                placeholder="Your first name"
                required
              />
            </div>

            <div class="form-group">
              <label for="last_name">Last Name</label>
              <input
                v-model="formData.last_name"
                type="text"
                id="last_name"
                placeholder="Your last name"
                required
              />
            </div>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                v-model="formData.email"
                type="email"
                id="email"
                placeholder="your@email.com"
                required
              />
            </div>

            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input
                v-model="formData.phone"
                type="tel"
                id="phone"
                placeholder="Your phone number (optional)"
              />
            </div>
          </div>

          <!-- Password Change Section -->
          <div class="form-section">
            <h2>Change Password</h2>
            <p class="section-note">Leave these fields empty if you don't want to change your password</p>

            <div class="form-group">
              <label for="current_password">Current Password</label>
              <input
                v-model="formData.current_password"
                type="password"
                id="current_password"
                placeholder="Enter your current password"
              />
            </div>

            <div class="form-group">
              <label for="new_password">New Password</label>
              <input
                v-model="formData.new_password"
                type="password"
                id="new_password"
                placeholder="Enter your new password"
              />
            </div>

            <div class="form-group">
              <label for="confirm_password">Confirm New Password</label>
              <input
                v-model="formData.confirm_password"
                type="password"
                id="confirm_password"
                placeholder="Confirm your new password"
              />
              <span v-if="showPasswordMismatch" class="error-text">Passwords do not match</span>
            </div>
          </div>

          <!-- Notification Settings -->
          <div class="form-section">
            <h2>Notification Settings</h2>
            <div class="form-group">
              <label for="reminder_hours">Reservation Reminder Lead Time (Hours)</label>
              <div class="input-with-hint">
                <input
                  v-model.number="formData.reminder_hours"
                  type="number"
                  id="reminder_hours"
                  min="1"
                  max="168"
                  required
                />
                <span class="hint-text">How many hours before your flight should we email you? (1-168)</span>
              </div>
            </div>
          </div>

          <!-- Time Zone Preference -->
          <div class="form-section">
            <h2>Time Zone Preference</h2>
            <div class="form-group">
              <label for="timezone_pref">Display Time Zone</label>
              <div class="input-with-hint">
                <select
                  v-model="formData.timezone_pref"
                  id="timezone_pref"
                  required
                >
                  <option value="local">Local Time Zone ({{ resolvedLocalTimezone }})</option>
                  <option value="UTC">UTC</option>
                </select>
                <span class="hint-text">Choose how dates and times are displayed on the schedule and in emails sent to you.</span>
              </div>
            </div>
          </div>

          <!-- Member Information Display -->
          <div class="form-section info-section">
            <h2>Member Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <label>Member Number</label>
                <p>{{ authStore.user?.member_number }}</p>
              </div>
              <div class="info-item">
                <label>Role</label>
                <p>{{ authStore.user?.role }}</p>
              </div>
              <div class="info-item">
                <label>Member Since</label>
                <p>{{ formatDate(authStore.user?.created_at) }}</p>
              </div>
              <div class="info-item">
                <label>Status</label>
                <p>
                  <span class="status-badge" :class="authStore.user?.is_active ? 'status-active' : 'status-inactive'">
                    {{ authStore.user?.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="isLoading">
              {{ isLoading ? 'Saving...' : 'Save Changes' }}
            </button>
            <button type="button" class="btn-secondary" @click="goBack">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { authAPI } from '../services/api'
import AppLayout from '../components/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

interface FormData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  reminder_hours: number
  timezone_pref: string
  current_password?: string
  new_password?: string
  confirm_password?: string
}

const resolvedLocalTimezone = computed(() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (e) {
    return 'UTC'
  }
})

const formData = ref<FormData>({
  first_name: authStore.user?.first_name || '',
  last_name: authStore.user?.last_name || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
  reminder_hours: authStore.user?.reminder_hours || 24,
  timezone_pref: authStore.user?.timezone_pref || 'local',
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const showPasswordMismatch = computed(() => {
  return formData.value.new_password && 
         formData.value.confirm_password && 
         formData.value.new_password !== formData.value.confirm_password
})

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function handleUpdate() {
  successMessage.value = ''
  errorMessage.value = ''

  // Validate password fields - only if a new password is being set
  if (formData.value.new_password) {
    if (!formData.value.current_password) {
      errorMessage.value = 'Current password is required to change password'
      return
    }

    if (formData.value.new_password !== formData.value.confirm_password) {
      errorMessage.value = 'New passwords do not match'
      return
    }

    if (formData.value.new_password.length < 6) {
      errorMessage.value = 'New password must be at least 6 characters long'
      return
    }
  }

  isLoading.value = true

  try {
    const updatePayload = {
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      email: formData.value.email,
      phone: formData.value.phone,
      reminder_hours: formData.value.reminder_hours,
      timezone_pref: formData.value.timezone_pref,
      ...(formData.value.new_password && {
        current_password: formData.value.current_password,
        new_password: formData.value.new_password
      })
    }

    const response = await authAPI.updateProfile(updatePayload)

    // Update the auth store with new user data
    authStore.user = response.data.user

    // Clear password fields after successful update
    formData.value.current_password = ''
    formData.value.new_password = ''
    formData.value.confirm_password = ''

    successMessage.value = 'Profile updated successfully!'

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to update profile. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function goBack() {
  router.push('/dashboard')
}
</script>

<style scoped>
.profile-header {
  padding: 2rem;
  text-align: center;
  color: #e2e8f0;
}

.profile-header h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
}

.profile-header p {
  margin: 0;
  color: #94a3b8;
}

.profile-content {
  flex: 1;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.form-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.alert-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.form-section h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.75rem;
}

.section-note {
  margin: 0 0 1rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #cbd5e1;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.05);
}

.error-text {
  display: block;
  margin-top: 0.25rem;
  color: #fca5a5;
  font-size: 0.8rem;
}

.input-with-hint {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hint-text {
  font-size: 0.8rem;
  color: #94a3b8;
}

.info-section {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 1.5rem;
  border-radius: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.info-item label {
  display: block;
  color: #94a3b8;
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.info-item p {
  margin: 0;
  color: #e2e8f0;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-primary, .btn-secondary {
  flex: 1;
}

@media (max-width: 640px) {
  .profile-header {
    padding: 1.5rem;
  }

  .profile-content {
    padding: 1rem;
  }

  .form-card {
    padding: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
