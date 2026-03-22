<template>
  <AppLayout>
    <div class="members-header">
      <h1>Manage Members</h1>
      <p>View and manage existing members</p>
    </div>

    <div class="members-content">
      <!-- Members List Section -->
      <div class="members-list-card">
        <div class="list-header">
          <h2>All Members</h2>
          <div class="list-header-actions">
            <div class="search-box">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search members..."
              />
            </div>
            <button class="btn-primary" @click="openRegisterModal">
              + Register New Member
            </button>
          </div>
        </div>

        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <div class="table-container">
          <table v-if="filteredMembers.length > 0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member #</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in filteredMembers" :key="member.id">
                <td>{{ member.id }}</td>
                <td>{{ member.member_number }}</td>
                <td>{{ member.first_name }} {{ member.last_name }}</td>
                <td>{{ member.email }}</td>
                <td>{{ member.phone || '-' }}</td>
                <td>
                  <select
                    :value="member.role"
                    @change="updateMemberRole(member.id, $event)"
                    class="role-select"
                  >
                    <option value="member">Member</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <select
                    :value="member.is_active"
                    @change="updateMemberStatus(member.id, $event)"
                    class="status-select"
                  >
                    <option :value="true">Active</option>
                    <option :value="false">Inactive</option>
                  </select>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      @click="editMember(member)"
                      class="btn-sm btn-edit"
                      title="Edit member"
                    >
                      Edit
                    </button>
                    <button
                      @click="confirmDeleteMember(member)"
                      class="btn-sm btn-delete"
                      title="Delete member"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="no-data">
            No members found
          </div>
        </div>
      </div>
    </div>

    <!-- Register New Member Modal -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="closeRegisterModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Register New Member</h3>
          <button @click="closeRegisterModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <div v-if="registerSuccessMessage" class="alert alert-success">
            {{ registerSuccessMessage }}
          </div>

          <div v-if="registerErrorMessage" class="alert alert-error">
            {{ registerErrorMessage }}
          </div>

          <form @submit.prevent="handleRegisterMember">
            <div class="form-grid">
              <div class="form-group">
                <label for="first_name">First Name</label>
                <input
                  v-model="newMemberForm.first_name"
                  type="text"
                  id="first_name"
                  placeholder="First name"
                  required
                />
              </div>

              <div class="form-group">
                <label for="last_name">Last Name</label>
                <input
                  v-model="newMemberForm.last_name"
                  type="text"
                  id="last_name"
                  placeholder="Last name"
                  required
                />
              </div>

              <div class="form-group">
                <label for="email">Email Address</label>
                <input
                  v-model="newMemberForm.email"
                  type="email"
                  id="email"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input
                  v-model="newMemberForm.phone"
                  type="tel"
                  id="phone"
                  placeholder="Phone number (optional)"
                />
              </div>

              <div class="form-group">
                <label for="password">Password</label>
                <input
                  v-model="newMemberForm.password"
                  type="password"
                  id="password"
                  placeholder="Initial password"
                  required
                />
              </div>

              <div class="form-group">
                <label for="role">Role</label>
                <select v-model="newMemberForm.role" id="role" required>
                  <option value="member">Member</option>
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div class="form-group">
                <label for="member_number">Member Number (optional)</label>
                <input
                  v-model="newMemberForm.member_number"
                  type="text"
                  id="member_number"
                  placeholder="Auto-generated if not provided"
                />
              </div>
            </div>

            <div class="modal-footer">
              <button type="submit" class="btn-primary" :disabled="isRegistering">
                {{ isRegistering ? 'Registering...' : 'Register Member' }}
              </button>
              <button type="button" class="btn-secondary" @click="closeRegisterModal">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Member Modal -->
    <div v-if="editingMember" class="modal-overlay" @click.self="editingMember = null">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Member</h3>
          <button @click="editingMember = null" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <div v-if="editErrorMessage" class="alert alert-error">
            {{ editErrorMessage }}
          </div>

          <form @submit.prevent="handleUpdateMember">
            <div class="form-group">
              <label for="edit_first_name">First Name</label>
              <input
                v-model="editingMember.first_name"
                type="text"
                id="edit_first_name"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit_last_name">Last Name</label>
              <input
                v-model="editingMember.last_name"
                type="text"
                id="edit_last_name"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit_email">Email</label>
              <input
                v-model="editingMember.email"
                type="email"
                id="edit_email"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit_phone">Phone</label>
              <input
                v-model="editingMember.phone"
                type="tel"
                id="edit_phone"
              />
            </div>

            <div class="modal-footer">
              <button type="submit" class="btn-primary" :disabled="isUpdating">
                {{ isUpdating ? 'Saving...' : 'Save Changes' }}
              </button>
              <button type="button" class="btn-secondary" @click="editingMember = null">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="memberToDelete" class="modal-overlay" @click.self="memberToDelete = null">
      <div class="modal modal-confirm">
        <div class="modal-header">
          <h3>Confirm Delete</h3>
        </div>

        <div class="modal-body">
          <p>
            Are you sure you want to delete <strong>{{ memberToDelete.first_name }} {{ memberToDelete.last_name }}</strong>?
          </p>
          <p class="warning">This action cannot be undone.</p>
        </div>

        <div class="modal-footer">
          <button @click="handleDeleteMember" class="btn-danger" :disabled="isDeleting">
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
          <button @click="memberToDelete = null" class="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Member } from '../types'
import { membersAPI } from '../services/api'
import AppLayout from '../components/AppLayout.vue'

const members = ref<Member[]>([])
const searchQuery = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const editErrorMessage = ref('')
const registerSuccessMessage = ref('')
const registerErrorMessage = ref('')
const isRegistering = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)
const editingMember = ref<Member | null>(null)
const memberToDelete = ref<Member | null>(null)
const showRegisterModal = ref(false)

const newMemberForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  role: 'member',
  member_number: ''
})

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  const query = searchQuery.value.toLowerCase()
  return members.value.filter(
    m =>
      m.first_name.toLowerCase().includes(query) ||
      m.last_name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.member_number.toLowerCase().includes(query)
  )
})

async function loadMembers() {
  try {
    const response = await membersAPI.getAll()
    members.value = response.data
  } catch (error) {
    console.error('Failed to load members:', error)
  }
}

function openRegisterModal() {
  showRegisterModal.value = true
  registerSuccessMessage.value = ''
  registerErrorMessage.value = ''
  newMemberForm.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'member',
    member_number: ''
  }
}

function closeRegisterModal() {
  showRegisterModal.value = false
  registerSuccessMessage.value = ''
  registerErrorMessage.value = ''
  newMemberForm.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'member',
    member_number: ''
  }
}

async function handleRegisterMember() {
  registerSuccessMessage.value = ''
  registerErrorMessage.value = ''

  // Validate required fields
  if (!newMemberForm.value.first_name || !newMemberForm.value.last_name || 
      !newMemberForm.value.email || !newMemberForm.value.password) {
    registerErrorMessage.value = 'Please fill in all required fields'
    return
  }

  if (newMemberForm.value.password.length < 6) {
    registerErrorMessage.value = 'Password must be at least 6 characters long'
    return
  }

  isRegistering.value = true

  try {
    const response = await membersAPI.create({
      first_name: newMemberForm.value.first_name,
      last_name: newMemberForm.value.last_name,
      email: newMemberForm.value.email,
      phone: newMemberForm.value.phone || undefined,
      password: newMemberForm.value.password,
      role: newMemberForm.value.role,
      member_number: newMemberForm.value.member_number || undefined
    })

    members.value.push(response.data)
    showRegisterModal.value = false
    newMemberForm.value = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      role: 'member',
      member_number: ''
    }
    successMessage.value = `Member ${response.data.first_name} ${response.data.last_name} registered successfully!`

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error: any) {
    registerErrorMessage.value = error.response?.data?.error || 'Failed to register member'
  } finally {
    isRegistering.value = false
  }
}

function editMember(member: Member) {
  editingMember.value = { ...member }
  editErrorMessage.value = ''
}

async function handleUpdateMember() {
  if (!editingMember.value) return

  editErrorMessage.value = ''
  isUpdating.value = true

  try {
    const response = await membersAPI.update(editingMember.value.id, {
      first_name: editingMember.value.first_name,
      last_name: editingMember.value.last_name,
      email: editingMember.value.email,
      phone: editingMember.value.phone
    })

    const index = members.value.findIndex(m => m.id === editingMember.value!.id)
    if (index !== -1) {
      members.value[index] = response.data
    }

    editingMember.value = null
    successMessage.value = 'Member updated successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error: any) {
    editErrorMessage.value = error.response?.data?.error || 'Failed to update member'
  } finally {
    isUpdating.value = false
  }
}

async function updateMemberRole(memberId: number, event: Event) {
  const newRole = (event.target as HTMLSelectElement).value as 'member' | 'operator' | 'admin'
  const member = members.value.find(m => m.id === memberId)
  if (!member) return

  try {
    const response = await membersAPI.update(memberId, { role: newRole })
    const index = members.value.findIndex(m => m.id === memberId)
    if (index !== -1) {
      members.value[index] = response.data
    }
  } catch (error: any) {
    console.error('Failed to update role:', error)
    errorMessage.value = 'Failed to update member role'
    // Revert the change
    await loadMembers()
  }
}

async function updateMemberStatus(memberId: number, event: Event) {
  const newStatus = (event.target as HTMLSelectElement).value === 'true'
  const member = members.value.find(m => m.id === memberId)
  if (!member) return

  try {
    const response = await membersAPI.update(memberId, { is_active: newStatus })
    const index = members.value.findIndex(m => m.id === memberId)
    if (index !== -1) {
      members.value[index] = response.data
    }
  } catch (error: any) {
    console.error('Failed to update status:', error)
    errorMessage.value = 'Failed to update member status'
    // Revert the change
    await loadMembers()
  }
}

function confirmDeleteMember(member: Member) {
  memberToDelete.value = member
}

async function handleDeleteMember() {
  if (!memberToDelete.value) return

  isDeleting.value = true

  try {
    await membersAPI.delete(memberToDelete.value.id)
    members.value = members.value.filter(m => m.id !== memberToDelete.value!.id)
    memberToDelete.value = null
    successMessage.value = 'Member deleted successfully'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error: any) {
    console.error('Failed to delete member:', error)
    errorMessage.value = error.response?.data?.error || 'Failed to delete member'
  } finally {
    isDeleting.value = false
  }
}

// Load members on component mount
loadMembers()
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%);
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.logo {
  font-family: 'Space Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #e2e8f0;
  font-size: 0.9rem;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.role-operator {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.role-member {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.members-header {
  padding: 2rem;
  text-align: center;
  color: #e2e8f0;
}

.members-header h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
}

.members-header p {
  margin: 0;
  color: #94a3b8;
}

.members-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.members-list-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
}

.members-list-card h2 {
  margin: 0 0 1.5rem;
  color: #e2e8f0;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #cbd5e1;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.05);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.list-header h2 {
  margin: 0;
  color: #e2e8f0;
}

.list-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 0.9rem;
}

.search-box input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.05);
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  color: #e2e8f0;
}

thead {
  background: rgba(59, 130, 246, 0.1);
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #93c5fd;
  font-size: 0.85rem;
  text-transform: uppercase;
}

td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

tbody tr:hover {
  background: rgba(59, 130, 246, 0.05);
}

.role-select,
.status-select {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 0.85rem;
  cursor: pointer;
}

.role-select:focus,
.status-select:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit {
  background: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.btn-edit:hover {
  background: rgba(59, 130, 246, 0.5);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.5);
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
}

.btn-danger:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.no-data {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: #1a1f3a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

.modal-confirm {
  max-width: 400px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  color: #e2e8f0;
}

.btn-close {
  background: none;
  border: none;
  color: #cbd5e1;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-close:hover {
  color: #e2e8f0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1rem;
  color: #e2e8f0;
}

.warning {
  color: #fca5a5;
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    gap: 1rem;
  }

  .members-header {
    padding: 1.5rem;
  }

  .members-content {
    padding: 1rem;
  }

  .members-list-card {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .list-header-actions {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .search-box {
    width: 100%;
    max-width: none;
  }

  table {
    font-size: 0.85rem;
  }

  th,
  td {
    padding: 0.5rem;
  }

  .modal {
    margin: 0 1rem;
  }
}
</style>
