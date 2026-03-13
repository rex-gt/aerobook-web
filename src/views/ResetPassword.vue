<template>
  <div class="reset-container">
    <div class="reset-box">
      <div class="logo">✈ WingTime</div>

      <template v-if="!success">
        <h1>Set Your Password</h1>
        <p>Enter a new password for your account</p>

        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleReset">
          <div class="form-group">
            <label for="password">New Password</label>
            <input
              v-model="password"
              type="password"
              id="password"
              placeholder="Enter new password"
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              required
              minlength="6"
            />
          </div>

          <button type="submit" class="btn-primary" :disabled="isLoading">
            {{ isLoading ? 'Setting Password...' : 'Set Password' }}
          </button>
        </form>
      </template>

      <template v-else>
        <div class="success-message">
          <div class="success-icon">✓</div>
          <h1>Password Set Successfully!</h1>
          <p>Your password has been set. You can now sign in with your new password.</p>
          <router-link to="/login" class="btn-primary">
            Go to Sign In
          </router-link>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authAPI } from '../services/api'

const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const success = ref(false)
const token = ref('')

onMounted(() => {
  token.value = route.query.token as string || ''
  if (!token.value) {
    errorMessage.value = 'Invalid or missing reset token. Please use the link from your email.'
  }
})

async function handleReset() {
  errorMessage.value = ''

  if (!token.value) {
    errorMessage.value = 'Invalid or missing reset token.'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  isLoading.value = true

  try {
    await authAPI.resetPassword(token.value, password.value)
    success.value = true
  } catch (error: any) {
    if (!error.response) {
      errorMessage.value = 'Unable to reach the server. Please try again later.'
    } else {
      errorMessage.value = error.response.data?.message || 'Failed to reset password. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.reset-box {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.logo {
  font-family: 'Space Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reset-box h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.reset-box p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

button[type="submit"],
.btn-primary {
  width: 100%;
  margin-top: 1rem;
  display: inline-block;
  text-align: center;
  text-decoration: none;
}

.success-message {
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
}

.success-message h1 {
  color: #10b981;
}

.success-message p {
  margin-bottom: 2rem;
}
</style>
