
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  FileText,
  Download,
  CalendarDays,
  ChartNoAxesColumn,
  Eye,
  X,
  AlertCircle,
  TrendingUp,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
  title: 'Reports & Analytics',
})

useSeoMeta({
  title: 'Reports & Analytics | ICAM',
  description: 'View laboratory equipment transactions and utilization reports.',
})

type ReservationStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Borrowed'
  | 'Completed'

interface Reservation {
  id: string
  studentName: string
  studentId: string
  equipmentId: string
  quantity: number
  reservationDate: string
  purpose: string
  status: ReservationStatus
  createdAt: string
}

interface Equipment {
  id: string
  name: string
  quantity: number
  category: string
}

const RESERVATION_KEY = 'icam-reservations'
const EQUIPMENT_KEY = 'icam-equipment'

const reservations = ref<Reservation[]>([])
const equipmentList = ref<Equipment[]>([])

const searchQuery = ref('')
const selectedStatus = ref('All')
const startDate = ref('')
const endDate = ref('')
const selectedReservation = ref<Reservation | null>(null)

const statuses = [
  'All',
  'Pending',
  'Approved',
  'Rejected',
  'Cancelled',
  'Borrowed',
  'Completed',
]

function loadData() {
  try {
    const savedReservations = localStorage.getItem(RESERVATION_KEY)
    const savedEquipment = localStorage.getItem(EQUIPMENT_KEY)

    if (savedReservations !== null) {
      const parsed = JSON.parse(savedReservations)

      if (Array.isArray(parsed)) {
        reservations.value = parsed
      }
    }

    if (savedEquipment !== null) {
      const parsed = JSON.parse(savedEquipment)

      if (Array.isArray(parsed)) {
        equipmentList.value = parsed
      }
    }
  } catch (error) {
    console.error('Unable to load report data:', error)
  }
}

onMounted(loadData)

function getEquipmentName(equipmentId: string) {
  const equipment = equipmentList.value.find(
    item => item.id === equipmentId,
  )

  return equipment?.name || equipmentId
}

function getRecordDate(record: Reservation) {
  const dateValue = record.createdAt || record.reservationDate

  if (!dateValue) return null

  const date = new Date(dateValue)

  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(dateValue: string) {
  if (!dateValue) return 'Not specified'

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return dateValue

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Summary Cards
const totalTransactions = computed(() =>
  reservations.value.length,
)

const approvedTransactions = computed(() =>
  reservations.value.filter(
    record => record.status === 'Approved',
  ).length,
)

const currentlyBorrowed = computed(() =>
  reservations.value.filter(
    record => record.status === 'Borrowed',
  ).length,
)

const completedReturns = computed(() =>
  reservations.value.filter(
    record => record.status === 'Completed',
  ).length,
)

// Monthly Transaction Overview
const monthlyTransactions = computed(() => {
  const now = new Date()
  const months: {
    label: string
    year: number
    month: number
    count: number
  }[] = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1,
    )

    months.push({
      label: date.toLocaleDateString('en-US', {
        month: 'short',
      }),
      year: date.getFullYear(),
      month: date.getMonth(),
      count: 0,
    })
  }

  reservations.value.forEach(record => {
    const date = getRecordDate(record)

    if (!date) return

    const month = months.find(
      item =>
        item.year === date.getFullYear() &&
        item.month === date.getMonth(),
    )

    if (month) month.count++
  })

  return months
})

const maxMonthlyTransactions = computed(() =>
  Math.max(
    1,
    ...monthlyTransactions.value.map(item => item.count),
  ),
)

// Equipment Usage
const equipmentUsage = computed(() => {
  const usageMap = new Map<string, number>()

  reservations.value.forEach(record => {
    if (!['Borrowed', 'Completed'].includes(record.status)) {
      return
    }

    const current = usageMap.get(record.equipmentId) || 0

    usageMap.set(
      record.equipmentId,
      current + Number(record.quantity || 0),
    )
  })

  return Array.from(usageMap.entries())
    .map(([equipmentId, quantity]) => ({
      id: equipmentId,
      name: getEquipmentName(equipmentId),
      quantity,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
})

const maxEquipmentUsage = computed(() =>
  Math.max(
    1,
    ...equipmentUsage.value.map(item => item.quantity),
  ),
)

// Transaction Records
const filteredRecords = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return reservations.value
    .filter(record => {
      const equipmentName = getEquipmentName(record.equipmentId)

      const matchesSearch =
        record.id.toLowerCase().includes(query) ||
        record.studentName.toLowerCase().includes(query) ||
        record.studentId.toLowerCase().includes(query) ||
        equipmentName.toLowerCase().includes(query)

      const matchesStatus =
        selectedStatus.value === 'All' ||
        record.status === selectedStatus.value

      const recordDate = getRecordDate(record)

      const matchesStartDate =
        !startDate.value ||
        (recordDate !== null &&
          recordDate >= new Date(`${startDate.value}T00:00:00`))

      const matchesEndDate =
        !endDate.value ||
        (recordDate !== null &&
          recordDate <= new Date(`${endDate.value}T23:59:59`))

      return (
        matchesSearch &&
        matchesStatus &&
        matchesStartDate &&
        matchesEndDate
      )
    })
    .sort((a, b) => {
      const dateA = getRecordDate(a)?.getTime() || 0
      const dateB = getRecordDate(b)?.getTime() || 0

      return dateB - dateA
    })
})

function getStatusClass(status: ReservationStatus) {
  switch (status) {
    case 'Pending':
      return 'badge-warning badge-soft'
    case 'Approved':
      return 'badge-info badge-soft'
    case 'Borrowed':
      return 'badge-primary badge-soft'
    case 'Completed':
      return 'badge-success badge-soft'
    case 'Rejected':
      return 'badge-error badge-soft'
    case 'Cancelled':
      return 'badge-ghost'
    default:
      return 'badge-ghost'
  }
}

function viewDetails(record: Reservation) {
  selectedReservation.value = record
}

function closeDetails() {
  selectedReservation.value = null
}

function clearFilters() {
  searchQuery.value = ''
  selectedStatus.value = 'All'
  startDate.value = ''
  endDate.value = ''
}

function exportCSV() {
  const headers = [
    'Reference ID',
    'Requester',
    'Student ID',
    'Equipment',
    'Equipment ID',
    'Quantity',
    'Request Date',
    'Status',
    'Purpose',
  ]

  const rows = filteredRecords.value.map(record => [
    record.id,
    record.studentName,
    record.studentId,
    getEquipmentName(record.equipmentId),
    record.equipmentId,
    record.quantity,
    record.reservationDate || record.createdAt,
    record.status,
    record.purpose,
  ])

  const escapeCSV = (value: unknown) => {
    const text = String(value ?? '')
    return `"${text.replace(/"/g, '""')}"`
  }

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ].join('\r\n')

  const blob = new Blob(
    ['\uFEFF' + csvContent],
    { type: 'text/csv;charset=utf-8;' },
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `icam-report-${new Date().toISOString().slice(0, 10)}.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-6">

    <!-- Page Header -->
    <section class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-medium text-emerald-500">
          Laboratory Management
        </p>

        <h1 class="mt-1 text-2xl font-bold text-base-content">
          Reports & Analytics
        </h1>

        <p class="mt-2 text-sm text-base-content/60">
          Monitor laboratory transactions and equipment utilization.
        </p>
      </div>

      <button
        class="btn btn-primary"
        :disabled="filteredRecords.length === 0"
        @click="exportCSV"
      >
        <Download class="h-4 w-4" />
        Export CSV
      </button>
    </section>

    <!-- Summary Cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-3 p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">
              Total Transactions
            </p>
            <FileText class="h-5 w-5 text-primary" />
          </div>

          <p class="text-3xl font-bold tabular-nums">
            {{ totalTransactions }}
          </p>

          <p class="text-xs text-base-content/50">
            All recorded requisitions
          </p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-3 p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">
              Approved Requests
            </p>
            <CheckCircle class="h-5 w-5 text-info" />
          </div>

          <p class="text-3xl font-bold tabular-nums text-info">
            {{ approvedTransactions }}
          </p>

          <p class="text-xs text-base-content/50">
            Approved requisitions
          </p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-3 p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">
              Currently Borrowed
            </p>
            <Package class="h-5 w-5 text-warning" />
          </div>

          <p class="text-3xl font-bold tabular-nums text-warning">
            {{ currentlyBorrowed }}
          </p>

          <p class="text-xs text-base-content/50">
            Active borrowing transactions
          </p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-3 p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">
              Completed Returns
            </p>
            <Clock class="h-5 w-5 text-success" />
          </div>

          <p class="text-3xl font-bold tabular-nums text-success">
            {{ completedReturns }}
          </p>

          <p class="text-xs text-base-content/50">
            Completed transactions
          </p>
        </div>
      </div>

    </section>

    <!-- Analytics -->
    <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">

      <!-- Monthly Transactions -->
      <div class="rounded-xl border border-base-300 bg-base-100">

        <div class="border-b border-base-300 p-5">
          <div class="flex items-center gap-2">
            <ChartNoAxesColumn class="h-5 w-5 text-emerald-500" />

            <h2 class="text-lg font-semibold">
              Transaction Overview
            </h2>
          </div>

          <p class="mt-1 text-sm text-base-content/60">
            Monthly transaction activity over the last six months.
          </p>
        </div>

        <div class="p-5">
          <div class="flex h-56 items-end justify-around gap-3 border-b border-base-300 pb-2">

            <div
              v-for="month in monthlyTransactions"
              :key="`${month.year}-${month.month}`"
              class="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <span class="text-xs font-medium tabular-nums text-base-content/60">
                {{ month.count }}
              </span>

              <div
                class="w-full max-w-12 rounded-t-md bg-emerald-500 transition-all"
                :style="{
                  height: `${(month.count / maxMonthlyTransactions) * 75}%`,
                  minHeight: month.count > 0 ? '6px' : '0',
                }"
              />

              <span class="text-xs text-base-content/50">
                {{ month.label }}
              </span>
            </div>

          </div>

          <div class="mt-4 flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            <p class="text-xs text-base-content/50">
              Number of recorded transactions
            </p>
          </div>

          <div
            v-if="totalTransactions === 0"
            class="mt-3 text-center text-xs text-base-content/50"
          >
            Transaction data will appear here when available.
          </div>
        </div>
      </div>

      <!-- Equipment Usage -->
      <div class="rounded-xl border border-base-300 bg-base-100">

        <div class="border-b border-base-300 p-5">
          <div class="flex items-center gap-2">
            <TrendingUp class="h-5 w-5 text-emerald-500" />

            <h2 class="text-lg font-semibold">
              Equipment Usage
            </h2>
          </div>

          <p class="mt-1 text-sm text-base-content/60">
            Top five equipment items by borrowed quantity.
          </p>
        </div>

        <div class="space-y-5 p-5">

          <div
            v-for="(item, index) in equipmentUsage"
            :key="item.id"
            class="space-y-2"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-base-200 text-xs font-semibold">
                  {{ index + 1 }}
                </span>

                <div class="min-w-0">
                  <p class="truncate text-sm font-medium">
                    {{ item.name }}
                  </p>

                  <p class="text-xs text-base-content/50">
                    {{ item.id }}
                  </p>
                </div>
              </div>

              <span class="shrink-0 text-sm font-semibold tabular-nums">
                {{ item.quantity }} units
              </span>
            </div>

            <div class="h-2 overflow-hidden rounded-full bg-base-200">
              <div
                class="h-full rounded-full bg-emerald-500 transition-all"
                :style="{
                  width: `${(item.quantity / maxEquipmentUsage) * 100}%`,
                }"
              />
            </div>
          </div>

          <div
            v-if="equipmentUsage.length === 0"
            class="py-10 text-center"
          >
            <Package class="mx-auto h-8 w-8 text-base-content/30" />

            <p class="mt-3 text-sm font-medium">
              No equipment usage data
            </p>

            <p class="mt-1 text-xs text-base-content/50">
              Borrowed and completed transactions will appear here.
            </p>
          </div>

        </div>
      </div>

    </section>

    <!-- Transaction Records -->
    <section class="overflow-hidden rounded-xl border border-base-300 bg-base-100">

      <div class="border-b border-base-300 p-5">

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold">
              Transaction Records
            </h2>

            <p class="mt-1 text-sm text-base-content/60">
              Review and export laboratory transaction records.
            </p>
          </div>

          <span class="text-xs text-base-content/50">
            {{ filteredRecords.length }} records found
          </span>
        </div>

        <!-- Search -->
        <div class="mt-5 flex flex-col gap-3">

          <label class="input input-bordered flex w-full items-center gap-2">
            <Search class="h-4 w-4 text-base-content/50" />

            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search reference ID, requester, or equipment..."
              class="grow"
            />
          </label>

          <!-- Filters -->
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

            <select
              v-model="selectedStatus"
              class="select select-bordered w-full"
            >
              <option
                v-for="status in statuses"
                :key="status"
                :value="status"
              >
                {{ status === 'All' ? 'All Statuses' : status }}
              </option>
            </select>

            <label class="input input-bordered flex items-center gap-2">
              <CalendarDays class="h-4 w-4 text-base-content/50" />

              <input
                v-model="startDate"
                type="date"
                class="w-full text-sm"
                aria-label="Start date"
              />
            </label>

            <label class="input input-bordered flex items-center gap-2">
              <CalendarDays class="h-4 w-4 text-base-content/50" />

              <input
                v-model="endDate"
                type="date"
                class="w-full text-sm"
                aria-label="End date"
              />
            </label>

            <button
              class="btn btn-outline"
              @click="clearFilters"
            >
              <X class="h-4 w-4" />
              Clear Filters
            </button>

          </div>

        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="table">

          <thead>
            <tr class="text-xs uppercase text-base-content/60">
              <th>Reference ID</th>
              <th>Requester</th>
              <th>Equipment</th>
              <th>Quantity</th>
              <th>Request Date</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="record in filteredRecords"
              :key="record.id"
              class="hover"
            >
              <td class="font-medium">
                {{ record.id }}
              </td>

              <td>
                <p class="font-medium">
                  {{ record.studentName }}
                </p>

                <p class="text-xs text-base-content/50">
                  {{ record.studentId }}
                </p>
              </td>

              <td>
                <p class="font-medium">
                  {{ getEquipmentName(record.equipmentId) }}
                </p>

                <p class="text-xs text-base-content/50">
                  {{ record.equipmentId }}
                </p>
              </td>

              <td>
                {{ record.quantity }}
              </td>

              <td class="text-sm">
                {{ formatDate(record.reservationDate || record.createdAt) }}
              </td>

              <td>
                <span
                  class="badge"
                  :class="getStatusClass(record.status)"
                >
                  {{ record.status }}
                </span>
              </td>

              <td>
                <div class="flex justify-end">
                  <button
                    class="btn btn-ghost btn-sm"
                    title="View transaction details"
                    aria-label="View transaction details"
                    @click="viewDetails(record)"
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredRecords.length === 0">
              <td colspan="7" class="py-12 text-center">
                <AlertCircle class="mx-auto h-8 w-8 text-base-content/30" />

                <p class="mt-3 font-medium">
                  No transaction records found
                </p>

                <p class="mt-1 text-sm text-base-content/50">
                  Try adjusting your search or filters.
                </p>
              </td>
            </tr>
          </tbody>

        </table>
      </div>

      <div class="border-t border-base-300 px-5 py-3">
        <p class="text-xs text-base-content/50">
          Showing {{ filteredRecords.length }} of {{ totalTransactions }} transactions
        </p>
      </div>

    </section>

    <!-- Transaction Details Modal -->
    <div
      v-if="selectedReservation"
      class="modal modal-open"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-box max-w-lg">

        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-emerald-500">
              Transaction Report
            </p>

            <h3 class="mt-1 text-xl font-bold">
              {{ selectedReservation.id }}
            </h3>
          </div>

          <button
            class="btn btn-ghost btn-sm btn-circle"
            aria-label="Close details"
            @click="closeDetails"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="mt-6 space-y-5">

          <div>
            <p class="text-xs text-base-content/50">
              Requester
            </p>

            <p class="mt-1 font-medium">
              {{ selectedReservation.studentName }}
            </p>

            <p class="text-sm text-base-content/50">
              {{ selectedReservation.studentId }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">

            <div>
              <p class="text-xs text-base-content/50">
                Equipment
              </p>

              <p class="mt-1 text-sm font-medium">
                {{ getEquipmentName(selectedReservation.equipmentId) }}
              </p>
            </div>

            <div>
              <p class="text-xs text-base-content/50">
                Quantity
              </p>

              <p class="mt-1 text-sm font-medium">
                {{ selectedReservation.quantity }}
              </p>
            </div>

            <div>
              <p class="text-xs text-base-content/50">
                Request Date
              </p>

              <p class="mt-1 text-sm font-medium">
                {{ formatDate(selectedReservation.reservationDate || selectedReservation.createdAt) }}
              </p>
            </div>

            <div>
              <p class="text-xs text-base-content/50">
                Status
              </p>

              <span
                class="badge mt-1"
                :class="getStatusClass(selectedReservation.status)"
              >
                {{ selectedReservation.status }}
              </span>
            </div>

          </div>

          <div class="rounded-lg bg-base-200 p-4">
            <p class="text-sm font-semibold">
              Purpose
            </p>

            <p class="mt-2 text-sm text-base-content/70">
              {{ selectedReservation.purpose || 'No purpose specified.' }}
            </p>
          </div>

        </div>

        <div class="modal-action">
          <button
            class="btn btn-outline"
            @click="closeDetails"
          >
            Close
          </button>
        </div>

      </div>

      <div
        class="modal-backdrop"
        @click="closeDetails"
      />
    </div>

  </div>
</template>
