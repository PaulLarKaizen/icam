
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Search,
  Eye,
  Package,
  Clock,
  CheckCircle,
  RotateCcw,
  X,
  AlertCircle,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
  title: 'Returns Management',
})

useSeoMeta({
  title: 'Returns Management | ICAM',
  description: 'Manage laboratory equipment return transactions.',
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
const selectedReservation = ref<Reservation | null>(null)

const statuses = ['All', 'Borrowed', 'Completed']

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
    console.error('Unable to load return records:', error)
  }
}

onMounted(loadData)

watch(
  reservations,
  value => {
    localStorage.setItem(RESERVATION_KEY, JSON.stringify(value))
  },
  { deep: true },
)

const returnRecords = computed(() =>
  reservations.value.filter(record =>
    ['Borrowed', 'Completed'].includes(record.status),
  ),
)

const pendingReturns = computed(() =>
  returnRecords.value.filter(
    record => record.status === 'Borrowed',
  ).length,
)

const completedReturns = computed(() =>
  returnRecords.value.filter(
    record => record.status === 'Completed',
  ).length,
)

const totalReturns = computed(() =>
  returnRecords.value.length,
)

function getEquipmentName(equipmentId: string) {
  const equipment = equipmentList.value.find(
    item => item.id === equipmentId,
  )

  return equipment?.name || equipmentId
}

const filteredRecords = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return returnRecords.value.filter(record => {
    const equipmentName = getEquipmentName(record.equipmentId)

    const matchesSearch =
      record.id.toLowerCase().includes(query) ||
      record.studentName.toLowerCase().includes(query) ||
      record.studentId.toLowerCase().includes(query) ||
      equipmentName.toLowerCase().includes(query)

    const matchesStatus =
      selectedStatus.value === 'All' ||
      record.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

function processReturn(record: Reservation) {
  if (record.status !== 'Borrowed') return

  const confirmed = window.confirm(
    `Confirm the return of ${record.quantity} unit(s) of ${getEquipmentName(record.equipmentId)} from ${record.studentName}?`,
  )

  if (!confirmed) return

  reservations.value = reservations.value.map(item =>
    item.id === record.id
      ? { ...item, status: 'Completed' as ReservationStatus }
      : item,
  )

  if (selectedReservation.value?.id === record.id) {
    selectedReservation.value = {
      ...record,
      status: 'Completed',
    }
  }
}

function viewDetails(record: Reservation) {
  selectedReservation.value = record
}

function closeDetails() {
  selectedReservation.value = null
}

function getStatusClass(status: ReservationStatus) {
  switch (status) {
    case 'Borrowed':
      return 'badge-warning badge-soft'
    case 'Completed':
      return 'badge-success badge-soft'
    default:
      return 'badge-ghost'
  }
}
</script>

<template>
  <div class="space-y-6">

    <!-- Page Header -->
    <section>
      <p class="text-sm font-medium text-emerald-500">
        Laboratory Management
      </p>

      <h1 class="mt-1 text-2xl font-bold text-base-content">
        Returns Management
      </h1>

      <p class="mt-2 text-sm text-base-content/60">
        Monitor equipment returns and completed return transactions.
      </p>
    </section>

    <!-- Summary Cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-3 p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Pending Returns</p>
            <Clock class="h-5 w-5 text-warning" />
          </div>

          <p class="text-3xl font-bold tabular-nums text-warning">
            {{ pendingReturns }}
          </p>

          <p class="text-xs text-base-content/50">
            Currently borrowed equipment
          </p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-3 p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Completed Returns</p>
            <CheckCircle class="h-5 w-5 text-success" />
          </div>

          <p class="text-3xl font-bold tabular-nums text-success">
            {{ completedReturns }}
          </p>

          <p class="text-xs text-base-content/50">
            Successfully completed transactions
          </p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-3 p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Total Returns</p>
            <Package class="h-5 w-5 text-primary" />
          </div>

          <p class="text-3xl font-bold tabular-nums">
            {{ totalReturns }}
          </p>

          <p class="text-xs text-base-content/50">
            All return transactions
          </p>
        </div>
      </div>

    </section>

    <!-- Return Records -->
    <section class="overflow-hidden rounded-xl border border-base-300 bg-base-100">

      <div class="border-b border-base-300 p-5">
        <h2 class="text-lg font-semibold">
          Return Records
        </h2>

        <p class="mt-1 text-sm text-base-content/60">
          View currently borrowed equipment and completed returns.
        </p>

        <!-- Search and Filter -->
        <div class="mt-5 flex flex-col gap-3 sm:flex-row">

          <label class="input input-bordered flex w-full items-center gap-2 sm:max-w-sm">
            <Search class="h-4 w-4 text-base-content/50" />

            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search return records..."
              class="grow"
            />
          </label>

          <select
            v-model="selectedStatus"
            class="select select-bordered w-full sm:max-w-xs"
          >
            <option
              v-for="status in statuses"
              :key="status"
              :value="status"
            >
              {{ status === 'All' ? 'All Statuses' : status }}
            </option>
          </select>

        </div>
      </div>

      <!-- Records Table -->
      <div class="overflow-x-auto">
        <table class="table">

          <thead>
            <tr class="text-xs uppercase text-base-content/60">
              <th>Reference ID</th>
              <th>Borrower</th>
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

              <td>{{ record.quantity }}</td>

              <td class="text-sm">
                {{ record.reservationDate || 'Not specified' }}
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
                <div class="flex justify-end gap-2">

                  <button
                    class="btn btn-ghost btn-sm"
                    title="View return details"
                    @click="viewDetails(record)"
                  >
                    <Eye class="h-4 w-4" />
                  </button>

                  <button
                    v-if="record.status === 'Borrowed'"
                    class="btn btn-sm btn-primary"
                    @click="processReturn(record)"
                  >
                    <RotateCcw class="h-4 w-4" />
                    Process Return
                  </button>

                </div>
              </td>
            </tr>

            <tr v-if="filteredRecords.length === 0">
              <td colspan="7" class="py-12 text-center">
                <AlertCircle class="mx-auto h-8 w-8 text-base-content/30" />

                <p class="mt-3 font-medium">
                  No return records found
                </p>

                <p class="mt-1 text-sm text-base-content/50">
                  Borrowed transactions will appear here when available.
                </p>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      <div class="border-t border-base-300 px-5 py-3">
        <p class="text-xs text-base-content/50">
          Showing {{ filteredRecords.length }} of {{ totalReturns }} return records
        </p>
      </div>

    </section>

    <!-- Return Details Modal -->
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
              Return Transaction
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
            <p class="text-xs text-base-content/50">Borrower</p>
            <p class="mt-1 font-medium">
              {{ selectedReservation.studentName }}
            </p>
            <p class="text-sm text-base-content/50">
              {{ selectedReservation.studentId }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-base-content/50">Equipment</p>
              <p class="mt-1 text-sm font-medium">
                {{ getEquipmentName(selectedReservation.equipmentId) }}
              </p>
            </div>

            <div>
              <p class="text-xs text-base-content/50">Quantity</p>
              <p class="mt-1 text-sm font-medium">
                {{ selectedReservation.quantity }}
              </p>
            </div>

            <div>
              <p class="text-xs text-base-content/50">Request Date</p>
              <p class="mt-1 text-sm font-medium">
                {{ selectedReservation.reservationDate || 'Not specified' }}
              </p>
            </div>

            <div>
              <p class="text-xs text-base-content/50">Status</p>
              <span
                class="badge mt-1"
                :class="getStatusClass(selectedReservation.status)"
              >
                {{ selectedReservation.status }}
              </span>
            </div>
          </div>

          <div class="rounded-lg bg-base-200 p-4">
            <p class="text-sm font-semibold">Purpose</p>
            <p class="mt-2 text-sm text-base-content/70">
              {{ selectedReservation.purpose || 'No purpose specified.' }}
            </p>
          </div>

        </div>

        <div class="modal-action">
          <button
            v-if="selectedReservation.status === 'Borrowed'"
            class="btn btn-primary"
            @click="processReturn(selectedReservation)"
          >
            <RotateCcw class="h-4 w-4" />
            Process Return
          </button>

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
      ></div>
    </div>

  </div>
</template>
