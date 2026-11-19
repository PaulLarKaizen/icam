<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({
  layout: 'student',
  title: 'My Borrowings',
})

useSeoMeta({
  title: 'My Borrowings | ICAM',
  description: 'Track borrowed laboratory equipment, due dates, and return history.',
})

interface Borrowing {
  id: string
  equipment: string
  category: string
  quantity: number
  borrowedDate: string
  dueDate: string
  returnedDate: string | null
  status: 'Active' | 'Due Soon' | 'Overdue' | 'Returned'
}

const searchQuery = ref('')
const selectedStatus = ref('All Statuses')

const borrowings = ref<Borrowing[]>([
  {
    id: 'BOR-2026-001',
    equipment: 'Compound Microscope',
    category: 'Microscope',
    quantity: 1,
    borrowedDate: '2026-11-17',
    dueDate: '2026-11-24',
    returnedDate: null,
    status: 'Active',
  },
  {
    id: 'BOR-2026-002',
    equipment: 'Glassware Set',
    category: 'Glassware',
    quantity: 2,
    borrowedDate: '2026-11-18',
    dueDate: '2026-11-21',
    returnedDate: null,
    status: 'Due Soon',
  },
  {
    id: 'BOR-2026-003',
    equipment: 'Analytical Balance',
    category: 'Measuring Equipment',
    quantity: 1,
    borrowedDate: '2026-11-10',
    dueDate: '2026-11-15',
    returnedDate: null,
    status: 'Overdue',
  },
  {
    id: 'BOR-2026-004',
    equipment: 'Test Tube Rack',
    category: 'Glassware',
    quantity: 3,
    borrowedDate: '2026-11-05',
    dueDate: '2026-11-10',
    returnedDate: '2026-11-10',
    status: 'Returned',
  },
  {
    id: 'BOR-2026-005',
    equipment: 'Pipette Set',
    category: 'Laboratory Equipment',
    quantity: 1,
    borrowedDate: '2026-11-02',
    dueDate: '2026-11-07',
    returnedDate: '2026-11-07',
    status: 'Returned',
  },
])

const statuses = ['All Statuses', 'Active', 'Due Soon', 'Overdue', 'Returned']

const filteredBorrowings = computed(() => {
  return borrowings.value.filter((borrowing) => {
    const matchesSearch =
      borrowing.equipment.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      borrowing.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      borrowing.category.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus =
      selectedStatus.value === 'All Statuses' ||
      borrowing.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

const activeCount = computed(() =>
  borrowings.value.filter(item =>
    ['Active', 'Due Soon', 'Overdue'].includes(item.status),
  ).length,
)

const dueSoonCount = computed(() =>
  borrowings.value.filter(item => item.status === 'Due Soon').length,
)

const overdueCount = computed(() =>
  borrowings.value.filter(item => item.status === 'Overdue').length,
)

const returnedCount = computed(() =>
  borrowings.value.filter(item => item.status === 'Returned').length,
)

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatusClass(status: Borrowing['status']) {
  switch (status) {
    case 'Active':
      return 'badge-info badge-outline'
    case 'Due Soon':
      return 'badge-warning badge-outline'
    case 'Overdue':
      return 'badge-error badge-outline'
    case 'Returned':
      return 'badge-success badge-outline'
    default:
      return 'badge-ghost'
  }
}
</script>

<template>
  <div class="space-y-6">

    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold">My Borrowings</h1>
      <p class="mt-1 text-base-content/60">
        Track your borrowed equipment, due dates, and return history.
      </p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <!-- Active -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Active Borrowings</p>
            <span class="badge badge-info badge-outline">Active</span>
          </div>
          <h2 class="text-3xl font-bold">{{ activeCount }}</h2>
          <p class="text-xs text-base-content/50">
            Currently borrowed equipment
          </p>
        </div>
      </div>

      <!-- Due Soon -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Due Soon</p>
            <span class="badge badge-warning badge-outline">Reminder</span>
          </div>
          <h2 class="text-3xl font-bold">{{ dueSoonCount }}</h2>
          <p class="text-xs text-base-content/50">
            Approaching return date
          </p>
        </div>
      </div>

      <!-- Overdue -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Overdue</p>
            <span class="badge badge-error badge-outline">Attention</span>
          </div>
          <h2 class="text-3xl font-bold">{{ overdueCount }}</h2>
          <p class="text-xs text-base-content/50">
            Past the return date
          </p>
        </div>
      </div>

      <!-- Returned -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Returned</p>
            <span class="badge badge-success badge-outline">Completed</span>
          </div>
          <h2 class="text-3xl font-bold">{{ returnedCount }}</h2>
          <p class="text-xs text-base-content/50">
            Completed borrowing records
          </p>
        </div>
      </div>

    </div>

    <!-- Search & Filter -->
    <div class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search equipment or borrowing ID..."
            class="input input-bordered w-full"
          />

          <select
            v-model="selectedStatus"
            class="select select-bordered w-full"
          >
            <option
              v-for="status in statuses"
              :key="status"
              :value="status"
            >
              {{ status }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Borrowings List -->
    <div class="space-y-4">

      <div
        v-for="borrowing in filteredBorrowings"
        :key="borrowing.id"
        class="card border border-base-300 bg-base-100 shadow-sm"
      >
        <div class="card-body space-y-4">

          <!-- Equipment & Status -->
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 class="text-lg font-bold">
                {{ borrowing.equipment }}
              </h2>
              <p class="text-sm text-base-content/60">
                {{ borrowing.category }}
              </p>
            </div>

            <span
              class="badge badge-lg"
              :class="getStatusClass(borrowing.status)"
            >
              {{ borrowing.status }}
            </span>
          </div>

          <!-- Borrowing ID -->
          <div class="text-xs text-base-content/50">
            Borrowing ID: {{ borrowing.id }}
          </div>

          <!-- Details -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div>
              <p class="text-xs text-base-content/50">Quantity</p>
              <p class="font-semibold">
                {{ borrowing.quantity }} item(s)
              </p>
            </div>

            <div>
              <p class="text-xs text-base-content/50">Borrowed Date</p>
              <p class="font-semibold">
                {{ formatDate(borrowing.borrowedDate) }}
              </p>
            </div>

            <div>
              <p class="text-xs text-base-content/50">
                {{ borrowing.status === 'Returned' ? 'Returned Date' : 'Due Date' }}
              </p>
              <p
                class="font-semibold"
                :class="borrowing.status === 'Overdue' ? 'text-error' : ''"
              >
                {{ borrowing.status === 'Returned'
                  ? formatDate(borrowing.returnedDate!)
                  : formatDate(borrowing.dueDate) }}
              </p>
            </div>

          </div>

          <!-- Overdue Notice -->
          <div
            v-if="borrowing.status === 'Overdue'"
            class="alert alert-error alert-soft text-sm"
          >
            <span>
              This equipment is past its return date. Please coordinate with the
              laboratory custodian regarding its return.
            </span>
          </div>

          <!-- Due Soon Notice -->
          <div
            v-else-if="borrowing.status === 'Due Soon'"
            class="alert alert-warning alert-soft text-sm"
          >
            <span>
              This equipment is approaching its return date. Please prepare it for return.
            </span>
          </div>

        </div>
      </div>

    </div>

    <!-- Empty State -->
    <div
      v-if="filteredBorrowings.length === 0"
      class="card border border-base-300 bg-base-100 shadow-sm"
    >
      <div class="card-body items-center py-12 text-center">
        <h2 class="text-lg font-semibold">No borrowings found</h2>
        <p class="text-sm text-base-content/60">
          Try changing your search or status filter.
        </p>
      </div>
    </div>

  </div>
</template>
