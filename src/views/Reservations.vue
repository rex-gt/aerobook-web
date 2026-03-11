<template>
  <div class="container">
    <!-- Header -->
    <header>
      <div class="logo" @click="$router.push('/dashboard')">✈ WingTime</div>
      <div class="user-info">
        <button class="btn-secondary" @click="$router.push('/dashboard')">Dashboard</button>
        <button class="btn-secondary" @click="authStore.logout()">Logout</button>
      </div>
    </header>

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1>Reservations</h1>
        <p>Manage aircraft bookings</p>
      </div>
      <button class="btn-primary" @click="openNewReservationForm()">+ New Reservation</button>
    </div>

    <!-- Calendar Toolbar -->
    <div class="calendar-toolbar">
      <!-- View Switcher -->
      <div class="view-switcher">
        <button
          v-for="v in (['day', 'week', 'month'] as CalendarView[])"
          :key="v"
          :class="['btn-view', { active: currentView === v }]"
          @click="currentView = v"
        >
          {{ v.charAt(0).toUpperCase() + v.slice(1) }}
        </button>
      </div>

      <!-- Navigation -->
      <div class="cal-nav">
        <button class="btn-secondary btn-small" @click="navigate(-1)">&#8249;</button>
        <button class="btn-secondary btn-small" @click="goToToday">Today</button>
        <button class="btn-secondary btn-small" @click="navigate(1)">&#8250;</button>
        <span class="period-label">{{ currentPeriodLabel }}</span>
      </div>

      <!-- Aircraft Filter -->
      <div class="aircraft-filter">
        <select v-model="selectedAircraftId">
          <option :value="0">All Aircraft</option>
          <option v-for="plane in aircraft" :key="plane.id" :value="plane.id">
            {{ plane.tail_number }} — {{ plane.make }} {{ plane.model }}
          </option>
        </select>
      </div>
    </div>

    <!-- Aircraft Colour Legend -->
    <div v-if="selectedAircraftId === 0 && aircraft.length > 0" class="aircraft-legend">
      <div v-for="(plane, idx) in aircraft" :key="plane.id" class="legend-item">
        <span class="legend-color" :class="`aircraft-color-${idx % AIRCRAFT_COLOR_COUNT}`"></span>
        <span>{{ plane.tail_number }} — {{ plane.make }} {{ plane.model }}</span>
      </div>
    </div>

    <!-- ── Month View ─────────────────────────────────────── -->
    <div v-if="currentView === 'month'" class="month-view">
      <div class="month-day-names">
        <div v-for="name in DAY_NAMES" :key="name">{{ name }}</div>
      </div>
      <div class="month-grid">
        <div
          v-for="(day, idx) in monthDays"
          :key="idx"
          class="month-cell"
          :class="{ 'other-month': !day.inMonth, today: day.isToday }"
          @click="handleDayClick(day.date)"
        >
          <span class="cell-date">{{ day.date.getDate() }}</span>
          <div class="cell-events">
            <div
              v-for="res in getReservationsForDay(day.date)"
              :key="res.id"
              class="event-chip"
              :class="`aircraft-color-${getAircraftColorIndex(res.aircraft_id)}`"
              @click.stop="openDetail(res)"
            >
              {{ formatTime(res.start_time) }} {{ getAircraftLabel(res.aircraft_id) }} · {{ res.member_name || getMemberName(res.member_id) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Day / Week View ────────────────────────────────── -->
    <div v-else class="time-view">
      <div class="time-view-header">
        <div class="time-gutter-header"></div>
        <div
          v-for="day in viewDays"
          :key="day.getTime()"
          class="time-col-header"
          :class="{ today: isToday(day) }"
        >
          {{ formatDayColumnHeader(day) }}
        </div>
      </div>
      <div class="time-view-body" ref="timeViewBodyRef">
        <div class="time-gutter">
          <div v-for="hour in displayHours" :key="hour" class="time-gutter-label">
            {{ formatHour(hour) }}
          </div>
        </div>
        <div class="time-grid">
          <div
            v-for="day in viewDays"
            :key="day.getTime()"
            class="time-col"
          >
            <div
              v-for="hour in displayHours"
              :key="hour"
              class="hour-slot"
              @click="handleTimeSlotClick(day, hour)"
            ></div>
            <div
              v-for="res in getReservationsForDay(day)"
              :key="res.id"
              class="cal-event"
              :class="`aircraft-color-${getAircraftColorIndex(res.aircraft_id)}`"
              :style="getEventStyle(res, day)"
              @click.stop="openDetail(res)"
            >
              <div class="event-label">{{ getAircraftLabel(res.aircraft_id) }}</div>
              <div class="event-time">{{ formatTime(res.start_time) }}–{{ formatTime(res.end_time) }}</div>
              <div class="event-member">{{ res.member_name || getMemberName(res.member_id) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Reservation Detail / Edit Modal ───────────────── -->
    <div v-if="detailReservation" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-card form-card">
        <div class="modal-header">
          <h2>{{ editMode ? 'Edit Reservation' : 'Reservation #' + detailReservation.id }}</h2>
          <button class="btn-close" @click="closeDetail">✕</button>
        </div>

        <!-- View Mode -->
        <template v-if="!editMode">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Member</label>
              <p>{{ detailReservation.member_name || getMemberName(detailReservation.member_id) }}</p>
            </div>
            <div class="detail-item">
              <label>Aircraft</label>
              <p>{{ getAircraftName(detailReservation.aircraft_id) }}</p>
            </div>
            <div class="detail-item">
              <label>Start</label>
              <p>{{ formatDate(detailReservation.start_time) }}</p>
            </div>
            <div class="detail-item">
              <label>End</label>
              <p>{{ formatDate(detailReservation.end_time) }}</p>
            </div>
            <div class="detail-item">
              <label>Status</label>
              <p>
                <span class="status-badge" :class="`status-${detailReservation.status}`">
                  {{ detailReservation.status }}
                </span>
              </p>
            </div>
            <div v-if="detailReservation.notes" class="detail-item detail-full">
              <label>Notes</label>
              <p>{{ detailReservation.notes }}</p>
            </div>
          </div>
          <div class="modal-actions">
            <template v-if="!authStore.isMember || detailReservation.member_id === authStore.user?.id">
              <button class="btn-primary btn-small" @click="beginEdit">Edit</button>
              <button class="btn-danger btn-small" @click="deleteReservation(detailReservation.id)">Delete</button>
            </template>
            <button class="btn-secondary btn-small" @click="closeDetail">Close</button>
          </div>
        </template>

        <!-- Edit Mode -->
        <form v-else @submit.prevent="saveEdit">
          <div class="form-row">
            <div v-if="!authStore.isMember" class="form-group">
              <label>Member</label>
              <select v-model="editData.member_id" :required="!authStore.isMember">
                <option :value="0">Select Member</option>
                <option v-for="m in members" :key="m.id" :value="m.id">
                  {{ m.first_name }} {{ m.last_name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Aircraft</label>
              <select v-model="editData.aircraft_id" required>
                <option :value="0">Select Aircraft</option>
                <option v-for="a in aircraft" :key="a.id" :value="a.id">
                  {{ a.tail_number }} — {{ a.make }} {{ a.model }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start Time</label>
              <input v-model="editData.start_time" type="datetime-local" required />
            </div>
            <div class="form-group">
              <label>End Time</label>
              <input v-model="editData.end_time" type="datetime-local" required />
            </div>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="editData.status">
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="editData.notes" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-primary">Save Changes</button>
            <button type="button" class="btn-secondary" @click="editMode = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── New Reservation Modal ──────────────────────────── -->
    <div v-if="showNewForm" class="modal-overlay" @click.self="showNewForm = false">
      <div class="modal-card form-card">
        <div class="modal-header">
          <h2>New Reservation</h2>
          <button class="btn-close" @click="showNewForm = false">✕</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div v-if="!authStore.isMember" class="form-group">
              <label>Member</label>
              <select v-model="formData.member_id" :required="!authStore.isMember">
                <option :value="0">Select Member</option>
                <option v-for="m in members" :key="m.id" :value="m.id">
                  {{ m.first_name }} {{ m.last_name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Aircraft</label>
              <select v-model="formData.aircraft_id" required>
                <option :value="0">Select Aircraft</option>
                <option v-for="a in aircraft" :key="a.id" :value="a.id">
                  {{ a.tail_number }} — {{ a.make }} {{ a.model }}
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
          <div class="modal-actions">
            <button type="submit" class="btn-primary">Create Reservation</button>
            <button type="button" class="btn-secondary" @click="showNewForm = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { reservationsAPI, membersAPI, aircraftAPI } from '../services/api'
import type { Reservation, Member, Aircraft } from '../types'

type CalendarView = 'day' | 'week' | 'month'

const authStore = useAuthStore()

// ── Data ──────────────────────────────────────────────────
const reservations = ref<Reservation[]>([])
const members = ref<Member[]>([])
const aircraft = ref<Aircraft[]>([])

// ── Calendar State ────────────────────────────────────────
const currentView = ref<CalendarView>('week')
const currentDate = ref(new Date())
const selectedAircraftId = ref(0)

// ── Form State ────────────────────────────────────────────
const showNewForm = ref(false)
const formData = ref({
  member_id: 0,
  aircraft_id: 0,
  start_time: '',
  end_time: '',
  notes: '',
  status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled'
})

// ── Detail / Edit State ───────────────────────────────────
const detailReservation = ref<Reservation | null>(null)
const editMode = ref(false)
const editData = ref({
  member_id: 0,
  aircraft_id: 0,
  start_time: '',
  end_time: '',
  status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
  notes: ''
})

// ── Calendar Constants ────────────────────────────────────
const HOUR_HEIGHT = 60        // px per hour row
const DAY_START_HOUR = 6      // 6 AM
const DAY_END_HOUR = 22       // 10 PM
const MIN_EVENT_HEIGHT = 20   // px
const AIRCRAFT_COLOR_COUNT = 6
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const displayHours = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
  (_, i) => i + DAY_START_HOUR
) // [6, 7, …, 22]

// ── Template Ref ──────────────────────────────────────────
const timeViewBodyRef = ref<HTMLElement | null>(null)

// ── Load Data ─────────────────────────────────────────────
async function loadData() {
  try {
    const requests: Promise<any>[] = [
      reservationsAPI.getAll(),
      aircraftAPI.getAll()
    ]
    if (!authStore.isMember) {
      requests.push(membersAPI.getAll())
    }

    const [resRes, airRes, memRes] = await Promise.all(requests)
    reservations.value = resRes.data
    aircraft.value = airRes.data
    if (memRes) members.value = memRes.data
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

onMounted(() => {
  loadData()
  scrollToBusinessHours()
})

// ── Computed ──────────────────────────────────────────────
const filteredReservations = computed(() =>
  selectedAircraftId.value === 0
    ? reservations.value
    : reservations.value.filter(r => r.aircraft_id === selectedAircraftId.value)
)

const currentPeriodLabel = computed(() => {
  const d = currentDate.value
  if (currentView.value === 'day') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    })
  }
  if (currentView.value === 'week') {
    const days = getWeekDays(d)
    const start = days[0]
    const end = days[6]
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`
    }
    return (
      start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' – ' +
      end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    )
  }
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

// Days shown in the time grid
const viewDays = computed<Date[]>(() => {
  if (currentView.value === 'day') return [stripTime(currentDate.value)]
  return getWeekDays(currentDate.value)
})

// All cells for the month grid (5 or 6 full weeks)
const monthDays = computed(() => {
  const d = currentDate.value
  const year = d.getFullYear()
  const month = d.getMonth()
  const today = new Date()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Sunday of the week containing the 1st
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - firstDay.getDay())

  // Saturday of the week containing the last day
  const end = new Date(lastDay)
  end.setDate(lastDay.getDate() + (6 - lastDay.getDay()))

  const days: { date: Date; inMonth: boolean; isToday: boolean }[] = []
  const cur = new Date(start)
  while (cur <= end) {
    days.push({
      date: new Date(cur),
      inMonth: cur.getMonth() === month,
      isToday: sameDay(cur, today)
    })
    cur.setDate(cur.getDate() + 1)
  }
  return days
})

// ── Navigation ────────────────────────────────────────────
function navigate(direction: number) {
  const d = new Date(currentDate.value)
  if (currentView.value === 'day') {
    d.setDate(d.getDate() + direction)
  } else if (currentView.value === 'week') {
    d.setDate(d.getDate() + direction * 7)
  } else {
    d.setDate(1) // prevent month overflow (e.g. Jan 31 → Mar when going to Feb)
    d.setMonth(d.getMonth() + direction)
  }
  currentDate.value = d
}

function goToToday() {
  currentDate.value = new Date()
}

function scrollToBusinessHours() {
  nextTick(() => {
    if (timeViewBodyRef.value) {
      timeViewBodyRef.value.scrollTop = (8 - DAY_START_HOUR) * HOUR_HEIGHT
    }
  })
}

watch(currentView, (v) => {
  if (v !== 'month') scrollToBusinessHours()
})

// ── Calendar Click Handlers ───────────────────────────────
function handleDayClick(date: Date) {
  // Clicking a month-cell opens a new reservation pre-filled for that day
  const start = new Date(date)
  start.setHours(9, 0, 0, 0)
  const end = new Date(date)
  end.setHours(10, 0, 0, 0)
  openNewReservationForm(start, end)
}

function handleTimeSlotClick(day: Date, hour: number) {
  const start = new Date(day)
  start.setHours(hour, 0, 0, 0)
  const end = new Date(day)
  end.setHours(hour + 1, 0, 0, 0)
  openNewReservationForm(start, end)
}

// ── New Reservation ───────────────────────────────────────
function openNewReservationForm(start?: Date, end?: Date) {
  formData.value = {
    member_id: authStore.isMember && authStore.user ? authStore.user.id : 0,
    aircraft_id: selectedAircraftId.value > 0 ? selectedAircraftId.value : 0,
    start_time: start ? toDatetimeLocal(start) : '',
    end_time: end ? toDatetimeLocal(end) : '',
    notes: '',
    status: 'scheduled'
  }
  showNewForm.value = true
}

async function handleSubmit() {
  if (!formData.value.member_id || !formData.value.aircraft_id) {
    alert('Please select a member and an aircraft.')
    return
  }
  try {
    const payload = {
      ...formData.value,
      start_time: toUTCISOString(formData.value.start_time),
      end_time: toUTCISOString(formData.value.end_time)
    }
    await reservationsAPI.create(payload)
    await loadData()
    showNewForm.value = false
  } catch (error) {
    console.error('Error creating reservation:', error)
  }
}

// ── Detail / Edit ─────────────────────────────────────────
function openDetail(res: Reservation) {
  detailReservation.value = res
  editMode.value = false
}

function closeDetail() {
  detailReservation.value = null
  editMode.value = false
}

function beginEdit() {
  const res = detailReservation.value!
  editData.value = {
    member_id: res.member_id,
    aircraft_id: res.aircraft_id,
    start_time: toDatetimeLocal(new Date(res.start_time)),
    end_time: toDatetimeLocal(new Date(res.end_time)),
    status: res.status,
    notes: res.notes ?? ''
  }
  editMode.value = true
}

async function saveEdit() {
  if (!detailReservation.value) return
  if (!editData.value.member_id || !editData.value.aircraft_id) {
    alert('Please select a member and an aircraft.')
    return
  }
  try {
    const payload = {
      ...editData.value,
      start_time: toUTCISOString(editData.value.start_time),
      end_time: toUTCISOString(editData.value.end_time)
    }
    await reservationsAPI.update(detailReservation.value.id, payload)
    await loadData()
    closeDetail()
  } catch (error) {
    console.error('Error updating reservation:', error)
  }
}

async function deleteReservation(id: number) {
  if (confirm('Delete this reservation?')) {
    try {
      await reservationsAPI.delete(id)
      await loadData()
      closeDetail()
    } catch (error) {
      console.error('Error deleting reservation:', error)
    }
  }
}

// ── Calendar Helpers ──────────────────────────────────────
function getWeekDays(date: Date): Date[] {
  const d = stripTime(date)
  const sunday = new Date(d)
  sunday.setDate(d.getDate() - d.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday)
    day.setDate(sunday.getDate() + i)
    return day
  })
}

function getReservationsForDay(date: Date): Reservation[] {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)
  return filteredReservations.value.filter(res => {
    const s = new Date(res.start_time)
    const e = new Date(res.end_time)
    return s <= dayEnd && e >= dayStart
  })
}

function getEventStyle(res: Reservation, day: Date): Record<string, string> {
  const resStart = new Date(res.start_time)
  const resEnd = new Date(res.end_time)

  // Clip event to the visible time range for this day
  const visibleStart = new Date(day)
  visibleStart.setHours(DAY_START_HOUR, 0, 0, 0)
  const visibleEnd = new Date(day)
  visibleEnd.setHours(DAY_END_HOUR, 59, 59, 999)

  const start = resStart < visibleStart ? visibleStart : resStart
  const end = resEnd > visibleEnd ? visibleEnd : resEnd

  const startMins = start.getHours() * 60 + start.getMinutes()
  const endMins = end.getHours() * 60 + end.getMinutes()

  const topPx = (startMins - DAY_START_HOUR * 60) / 60 * HOUR_HEIGHT
  const heightPx = Math.max(MIN_EVENT_HEIGHT, (endMins - startMins) / 60 * HOUR_HEIGHT)

  return { top: `${topPx}px`, height: `${heightPx}px` }
}

function getAircraftColorIndex(aircraftId: number): number {
  const idx = aircraft.value.findIndex(a => a.id === aircraftId)
  return (idx >= 0 ? idx : 0) % AIRCRAFT_COLOR_COUNT
}

function getAircraftLabel(aircraftId: number): string {
  const a = aircraft.value.find(x => x.id === aircraftId)
  return a ? a.tail_number : `#${aircraftId}`
}

function getMemberName(memberId: number): string {
  const m = members.value.find(x => x.id === memberId)
  return m ? `${m.first_name} ${m.last_name}` : `Member #${memberId}`
}

function getAircraftName(aircraftId: number): string {
  const a = aircraft.value.find(x => x.id === aircraftId)
  return a ? `${a.tail_number} — ${a.make} ${a.model}` : `Aircraft #${aircraftId}`
}

function isToday(date: Date): boolean {
  return sameDay(date, new Date())
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function stripTime(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  })
}

function formatDayColumnHeader(day: Date): string {
  if (currentView.value === 'day') {
    return day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }
  return day.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
}

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Convert a datetime-local string (local time, no timezone) to a UTC ISO string
// so the backend always receives unambiguous UTC timestamps.
function toUTCISOString(datetimeLocal: string): string {
  const date = new Date(datetimeLocal)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid datetime value: "${datetimeLocal}"`)
  }
  return date.toISOString()
}
</script>

<style scoped>
/* ── Calendar Toolbar ──────────────────────────────────── */
.calendar-toolbar {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.view-switcher {
  display: flex;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.btn-view {
  padding: 0.5rem 1.1rem;
  background: rgba(255, 255, 255, 0.05);
  color: var(--cloud-white);
  border: none;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0;
  font-size: 0.9rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-view:last-child {
  border-right: none;
}

.btn-view.active {
  background: var(--sky-blue);
  color: white;
}

.btn-view:not(.active):hover {
  background: rgba(255, 255, 255, 0.12);
}

.cal-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.period-label {
  font-weight: 600;
  font-size: 1.05rem;
  padding-left: 0.5rem;
  min-width: 200px;
}

.aircraft-filter {
  margin-left: auto;
}

.aircraft-filter select {
  width: auto;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* ── Aircraft Colour Legend ────────────────────────────── */
.aircraft-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  font-size: 0.85rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}

/* ── Month View ────────────────────────────────────────── */
.month-view {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.month-day-names {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: rgba(255, 255, 255, 0.06);
}

.month-day-names > div {
  text-align: center;
  padding: 0.65rem 0;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.55);
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.month-cell {
  min-height: 110px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  border-left: 1px solid rgba(255, 255, 255, 0.07);
  padding: 0.4rem 0.5rem;
  cursor: pointer;
  transition: background 0.15s ease;
  overflow: hidden;
}

.month-cell:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* remove left border on the first cell of every row */
.month-cell:nth-child(7n + 1) {
  border-left: none;
}

.month-cell.other-month {
  opacity: 0.35;
}

.cell-date {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 50%;
  margin-bottom: 0.25rem;
}

.month-cell.today .cell-date {
  background: var(--sky-blue);
  color: white;
}

.cell-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-chip {
  font-size: 0.72rem;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: filter 0.15s ease;
}

.event-chip:hover {
  filter: brightness(1.25);
}

/* ── Day / Week Time Grid ──────────────────────────────── */
.time-view {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.time-view-header {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.time-gutter-header {
  width: 64px;
  flex-shrink: 0;
}

.time-col-header {
  flex: 1;
  text-align: center;
  padding: 0.65rem 0.25rem;
  font-size: 0.82rem;
  font-weight: 600;
  border-left: 1px solid rgba(255, 255, 255, 0.07);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time-col-header.today {
  color: var(--sky-blue);
}

.time-view-body {
  display: flex;
  max-height: 68vh;
  overflow-y: auto;
}

.time-gutter {
  width: 64px;
  flex-shrink: 0;
}

.time-gutter-label {
  height: 60px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 4px 8px 0 0;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.45);
  box-sizing: border-box;
}

.time-grid {
  flex: 1;
  display: flex;
  min-width: 0;
}

.time-col {
  flex: 1;
  position: relative;
  border-left: 1px solid rgba(255, 255, 255, 0.07);
  min-width: 0;
}

.hour-slot {
  height: 60px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.15s ease;
}

.hour-slot:hover {
  background: rgba(255, 255, 255, 0.04);
}

.cal-event {
  position: absolute;
  left: 2px;
  right: 2px;
  border-radius: 5px;
  padding: 3px 6px;
  font-size: 0.72rem;
  cursor: pointer;
  overflow: hidden;
  transition: filter 0.15s ease;
  z-index: 1;
}

.cal-event:hover {
  filter: brightness(1.2);
  z-index: 2;
}

.event-label {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.68rem;
}

.event-member {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.67rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Aircraft Colour Variants (6 colours) ─────────────── */
.aircraft-color-0 {
  background: rgba(14, 165, 233, 0.28);
  border-left: 3px solid var(--sky-blue);
  color: #bae6fd;
}

.aircraft-color-1 {
  background: rgba(16, 185, 129, 0.28);
  border-left: 3px solid var(--success-green);
  color: #a7f3d0;
}

.aircraft-color-2 {
  background: rgba(251, 146, 60, 0.28);
  border-left: 3px solid var(--accent-orange);
  color: #fed7aa;
}

.aircraft-color-3 {
  background: rgba(167, 139, 250, 0.28);
  border-left: 3px solid #a78bfa;
  color: #ede9fe;
}

.aircraft-color-4 {
  background: rgba(45, 212, 191, 0.28);
  border-left: 3px solid #2dd4bf;
  color: #ccfbf1;
}

.aircraft-color-5 {
  background: rgba(251, 113, 133, 0.28);
  border-left: 3px solid #fb7185;
  color: #ffe4e6;
}

/* legend dots use the same classes */
.legend-color.aircraft-color-0 { background: var(--sky-blue); border-left: none; }
.legend-color.aircraft-color-1 { background: var(--success-green); border-left: none; }
.legend-color.aircraft-color-2 { background: var(--accent-orange); border-left: none; }
.legend-color.aircraft-color-3 { background: #a78bfa; border-left: none; }
.legend-color.aircraft-color-4 { background: #2dd4bf; border-left: none; }
.legend-color.aircraft-color-5 { background: #fb7185; border-left: none; }

/* ── Modals ────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
}

.btn-close {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  border: none;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* ── Detail View ───────────────────────────────────────── */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.25rem;
}

.detail-item p {
  font-size: 1rem;
}

.detail-full {
  grid-column: 1 / -1;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}
</style>
