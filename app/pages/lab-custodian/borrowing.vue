
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Search,
  ArrowLeftRight,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  Eye,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'lab-custodian',
  title: 'Borrowing',
})

useSeoMeta({
  title: 'Borrowing | ICAM',
  description: 'Monitor laboratory equipment borrowing transactions.',
})

interface BorrowingRecord {
  id: string
  borrower: string
  department: string
  equipment: string
  quantity: number
  dateBorrowed: string
  dueDate: string
  status: 'Borrowed' | 'Due Today' | 'Overdue' | 'Returned'
}

const searchQuery = ref('')
const selectedStatus = ref('All Statuses')

const borrowingRecords = ref<BorrowingRecord[]>([
  {
    id: 'BOR-2026-021',
    borrower: 'Maria Santos',
    department: 'Medical Laboratory Science',
    equipment: 'Compound Microscope',
    quantity: 2,
    dateBorrowed: 'Nov 18, 2026',
    dueDate: 'Nov 22, 2026',
    status: 'Borrowed',
  },
  {
    id: 'BOR-2026-020',
    borrower: 'John Reyes',
    department: 'Medical Laboratory Science',
    equipment: 'Centrifuge',
    quantity: 1,
    dateBorrowed: 'Nov 17, 2026',
    dueDate: 'Nov 20, 2026',
    status: 'Due Today',
  },
  {
    id: 'BOR-2026-019',
    borrower: 'Angela Cruz',
    department: 'Medical Laboratory Science',
    equipment: 'Microscope Slides',
    quantity: 10,
    dateBorrowed: 'Nov 15, 2026',
    dueDate: 'Nov 18, 2026',
    status: 'Overdue',
  },
  {
    id: 'BOR-2026-018',
    borrower: 'Paolo Garcia',
    department: 'Medical Laboratory Science',
    equipment: 'Test Tube Rack',
    quantity: 3,
    dateBorrowed: 'Nov 16, 2026',
    dueDate: 'Nov 21, 2026',
    status: 'Borrowed',
  },
  {
    id: 'BOR-2026-017',
    borrower: 'Sofia Mendoza',
    department: 'Medical Laboratory Science',
    equipment: 'Analytical Balance',
    quantity: 1,
    dateBorrowed: 'Nov 12, 2026',
    dueDate: 'Nov 17, 2026',
    status: 'Returned',
  },
  {
    id: 'BOR-2026-016',
    borrower: 'Daniel Flores',
    department: 'Medical Laboratory Science',
    equipment: 'Pipette Set',
    quantity: 2,
    dateBorrowed: 'Nov 14, 2026',
    dueDate: 'Nov 20, 2026',
    status: 'Due Today',
  },
])

const activeCount = computed(() =>
  borrowingRecords.value.filter(item =>
    ['Borrowed', 'Due Today', 'Overdue'].includes(item.status),
  ).length,
)

const dueTodayCount = computed(() =>
  borrowingRecords.value.filter(item => item.status === 'Due Today').length,
)

const overdueCount = computed(() =>
  borrowingRecords.value.filter(item => item.status === 'Overdue').length,
)

const returnedCount = computed(() =>
  borrowingRecords.value.filter(item => item.status === 'Returned').length,
)

const filteredRecords = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return borrowingRecords.value.filter(item => {
    const matchesSearch =
      !query ||
      item.id.toLowerCase().includes(query) ||
      item.borrower.toLowerCase().includes(query) ||
      item.equipment.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query)

    const matchesStatus =
      selectedStatus.value === 'All Statuses' ||
      item.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

function getStatusClass(status: BorrowingRecord['status']) {
  switch (status) {
    case 'Borrowed':
      return 'badge-info badge-outline'
    case 'Due Today':
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
    <!-- Header -->
    <section>
      <p class="text-sm text-base-content/50">Laboratory Management</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        Borrowing Transactions
      </h1>
      <p class="mt-1 text-sm text-base-content/60">
        Track issued equipment, borrowers, and expected return dates.
      </p>
    </section>

    <!-- Summary cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Active Borrowings</p>
              <p class="mt-2 text-3xl font-bold">{{ activeCount }}</p>
            </div>
            <div class="rounded-xl bg-info/10 p-3 text-info">
              <ArrowLeftRight :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Unreturned transactions</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Due Today</p>
              <p class="mt-2 text-3xl font-bold">{{ dueTodayCount }}</p>
            </div>
            <div class="rounded-xl bg-warning/10 p-3 text-warning">
              <Clock3 :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Expected return today</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Overdue</p>
              <p class="mt-2 text-3xl font-bold">{{ overdueCount }}</p>
            </div>
            <div class="rounded-xl bg-error/10 p-3 text-error">
              <AlertTriangle :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Past expected return date</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Returned</p>
              <p class="mt-2 text-3xl font-bold">{{ returnedCount }}</p>
            </div>
            <div class="rounded-xl bg-success/10 p-3 text-success">
              <CheckCircle2 :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Completed transactions</p>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body p-5">
        <div class="flex flex-col gap-3 lg:flex-row">
          <label class="input input-bordered flex flex-1 items-center gap-2">
            <Search :size="18" class="text-base-content/40" />
            <input
              v-model="searchQuery"
              type="text"
              class="grow"
              placeholder="Search borrower, transaction ID, or equipment..."
            />
          </label>

          <select
            v-model="selectedStatus"
            class="select select-bordered w-full sm:w-52"
          >
            <option>All Statuses</option>
            <option>Borrowed</option>
            <option>Due Today</option>
            <option>Overdue</option>
            <option>Returned</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Borrowing table -->
    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4 p-5">
        <div>
          <h2 class="text-lg font-semibold">Borrowing Records</h2>
          <p class="mt-1 text-sm text-base-content/50">
            {{ filteredRecords.length }} transactions displayed
          </p>
        </div>

        <div class="overflow-x-auto rounded-lg border border-base-300">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="text-xs uppercase text-base-content/50">
                <th>Transaction</th>
                <th>Borrower</th>
                <th>Equipment</th>
                <th>Qty.</th>
                <th>Date Borrowed</th>
                <th>Due Date</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredRecords" :key="item.id">
                <td class="min-w-36 font-medium">{{ item.id }}</td>

                <td class="min-w-40">
                  <p class="font-medium">{{ item.borrower }}</p>
                  <p class="mt-1 text-xs text-base-content/50">
                    {{ item.department }}
                  </p>
                </td>

                <td class="min-w-40">{{ item.equipment }}</td>

                <td>{{ item.quantity }}</td>

                <td class="whitespace-nowrap text-sm">{{ item.dateBorrowed }}</td>

                <td class="whitespace-nowrap">
                  <span class="flex items-center gap-1 text-sm">
                    <CalendarDays :size="14" class="text-base-content/40" />
                    {{ item.dueDate }}
                  </span>
                </td>

                <td>
                  <span
                    class="badge badge-sm whitespace-nowrap"
                    :class="getStatusClass(item.status)"
                  >
                    {{ item.status }}
                  </span>
                </td>

                <td>
                  <div class="flex justify-end">
                    <button class="btn btn-ghost btn-sm" title="View transaction">
                      <Eye :size="16" />
                      View
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredRecords.length === 0">
                <td colspan="8" class="py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-base-content/40">
                    <Search :size="28" />
                    <p class="font-medium">No borrowing records found</p>
                    <p class="text-sm">Try changing your search or filter.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Sample data notice -->
    <div class="alert border border-base-300 bg-base-100 text-base-content shadow-sm">
      <AlertTriangle :size="18" class="text-warning" />
      <div>
        <p class="text-sm font-medium">Sample Borrowing Records</p>
        <p class="text-xs text-base-content/60">
          These transactions are sample data for frontend development. Borrowing records are not yet connected to requisitions, inventory, or return processing.
        </p>
      </div>
    </div>
  </div>
</template>
