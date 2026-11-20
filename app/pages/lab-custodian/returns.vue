
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Search,
  RotateCcw,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ClipboardCheck,
  CalendarDays,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'lab-custodian',
  title: 'Equipment Returns',
})

useSeoMeta({
  title: 'Returns | ICAM',
  description: 'Process laboratory equipment returns and inspect returned items.',
})

interface ReturnRecord {
  id: string
  borrower: string
  equipment: string
  quantity: number
  dateBorrowed: string
  expectedReturn: string
  dateReturned: string
  condition: 'Good' | 'Damaged' | 'Needs Inspection'
  status: 'Pending Inspection' | 'Completed' | 'Late Return'
}

const searchQuery = ref('')
const selectedStatus = ref('All Statuses')

const returns = ref<ReturnRecord[]>([
  {
    id: 'RET-2026-021',
    borrower: 'Maria Santos',
    equipment: 'Compound Microscope',
    quantity: 2,
    dateBorrowed: 'Nov 17, 2026',
    expectedReturn: 'Nov 20, 2026',
    dateReturned: 'Nov 20, 2026',
    condition: 'Good',
    status: 'Completed',
  },
  {
    id: 'RET-2026-020',
    borrower: 'John Reyes',
    equipment: 'Centrifuge',
    quantity: 1,
    dateBorrowed: 'Nov 16, 2026',
    expectedReturn: 'Nov 20, 2026',
    dateReturned: 'Nov 20, 2026',
    condition: 'Needs Inspection',
    status: 'Pending Inspection',
  },
  {
    id: 'RET-2026-019',
    borrower: 'Angela Cruz',
    equipment: 'Beaker Set',
    quantity: 5,
    dateBorrowed: 'Nov 15, 2026',
    expectedReturn: 'Nov 18, 2026',
    dateReturned: 'Nov 19, 2026',
    condition: 'Good',
    status: 'Late Return',
  },
  {
    id: 'RET-2026-018',
    borrower: 'Paolo Garcia',
    equipment: 'Analytical Balance',
    quantity: 1,
    dateBorrowed: 'Nov 14, 2026',
    expectedReturn: 'Nov 19, 2026',
    dateReturned: 'Nov 19, 2026',
    condition: 'Damaged',
    status: 'Pending Inspection',
  },
  {
    id: 'RET-2026-017',
    borrower: 'Sofia Mendoza',
    equipment: 'Pipette Set',
    quantity: 2,
    dateBorrowed: 'Nov 13, 2026',
    expectedReturn: 'Nov 18, 2026',
    dateReturned: 'Nov 18, 2026',
    condition: 'Good',
    status: 'Completed',
  },
  {
    id: 'RET-2026-016',
    borrower: 'Daniel Flores',
    equipment: 'Test Tube Rack',
    quantity: 3,
    dateBorrowed: 'Nov 12, 2026',
    expectedReturn: 'Nov 17, 2026',
    dateReturned: 'Nov 18, 2026',
    condition: 'Needs Inspection',
    status: 'Pending Inspection',
  },
])

const totalReturns = computed(() => returns.value.length)

const pendingInspectionCount = computed(() =>
  returns.value.filter(item => item.status === 'Pending Inspection').length,
)

const goodConditionCount = computed(() =>
  returns.value.filter(item => item.condition === 'Good').length,
)

const damagedCount = computed(() =>
  returns.value.filter(item => item.condition === 'Damaged').length,
)

const filteredReturns = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return returns.value.filter(item => {
    const matchesSearch =
      !query ||
      item.id.toLowerCase().includes(query) ||
      item.borrower.toLowerCase().includes(query) ||
      item.equipment.toLowerCase().includes(query)

    const matchesStatus =
      selectedStatus.value === 'All Statuses' ||
      item.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

function getStatusClass(status: ReturnRecord['status']) {
  switch (status) {
    case 'Completed':
      return 'badge-success badge-outline'
    case 'Pending Inspection':
      return 'badge-warning badge-outline'
    case 'Late Return':
      return 'badge-error badge-outline'
    default:
      return 'badge-ghost'
  }
}

function getConditionClass(condition: ReturnRecord['condition']) {
  switch (condition) {
    case 'Good':
      return 'text-success'
    case 'Damaged':
      return 'text-error'
    case 'Needs Inspection':
      return 'text-warning'
    default:
      return 'text-base-content'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <section>
      <p class="text-sm text-base-content/50">Laboratory Management</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        Equipment Returns
      </h1>
      <p class="mt-1 text-sm text-base-content/60">
        Monitor returned equipment, inspect item conditions, and complete return transactions.
      </p>
    </section>

    <!-- Summary Cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Total Returns</p>
              <p class="mt-2 text-3xl font-bold">{{ totalReturns }}</p>
            </div>
            <div class="rounded-xl bg-primary/10 p-3 text-primary">
              <RotateCcw :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Recorded return transactions</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Pending Inspection</p>
              <p class="mt-2 text-3xl font-bold">{{ pendingInspectionCount }}</p>
            </div>
            <div class="rounded-xl bg-warning/10 p-3 text-warning">
              <Clock3 :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Awaiting condition verification</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Good Condition</p>
              <p class="mt-2 text-3xl font-bold">{{ goodConditionCount }}</p>
            </div>
            <div class="rounded-xl bg-success/10 p-3 text-success">
              <CheckCircle2 :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Returned without reported damage</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Damaged Returns</p>
              <p class="mt-2 text-3xl font-bold">{{ damagedCount }}</p>
            </div>
            <div class="rounded-xl bg-error/10 p-3 text-error">
              <AlertTriangle :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Items requiring attention</p>
        </div>
      </div>
    </section>

    <!-- Search and Filter -->
    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body p-5">
        <div class="flex flex-col gap-3 lg:flex-row">
          <label class="input input-bordered flex flex-1 items-center gap-2">
            <Search :size="18" class="text-base-content/40" />
            <input
              v-model="searchQuery"
              type="text"
              class="grow"
              placeholder="Search return ID, borrower, or equipment..."
            />
          </label>

          <select
            v-model="selectedStatus"
            class="select select-bordered w-full sm:w-56"
          >
            <option>All Statuses</option>
            <option>Pending Inspection</option>
            <option>Completed</option>
            <option>Late Return</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Return Records -->
    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4 p-5">
        <div>
          <h2 class="text-lg font-semibold">Return Records</h2>
          <p class="mt-1 text-sm text-base-content/50">
            {{ filteredReturns.length }} return records displayed
          </p>
        </div>

        <div class="overflow-x-auto rounded-lg border border-base-300">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="text-xs uppercase text-base-content/50">
                <th>Return ID</th>
                <th>Borrower</th>
                <th>Equipment</th>
                <th>Qty.</th>
                <th>Expected Return</th>
                <th>Date Returned</th>
                <th>Condition</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredReturns" :key="item.id">
                <td class="min-w-36 font-medium">{{ item.id }}</td>

                <td class="min-w-36">{{ item.borrower }}</td>

                <td class="min-w-40">{{ item.equipment }}</td>

                <td>{{ item.quantity }}</td>

                <td class="whitespace-nowrap text-sm">
                  <span class="flex items-center gap-1">
                    <CalendarDays :size="14" class="text-base-content/40" />
                    {{ item.expectedReturn }}
                  </span>
                </td>

                <td class="whitespace-nowrap text-sm">{{ item.dateReturned }}</td>

                <td>
                  <span class="text-sm font-medium" :class="getConditionClass(item.condition)">
                    {{ item.condition }}
                  </span>
                </td>

                <td>
                  <span class="badge badge-sm whitespace-nowrap" :class="getStatusClass(item.status)">
                    {{ item.status }}
                  </span>
                </td>
              </tr>

              <tr v-if="filteredReturns.length === 0">
                <td colspan="8" class="py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-base-content/40">
                    <ClipboardCheck :size="28" />
                    <p class="font-medium">No return records found</p>
                    <p class="text-sm">Try changing your search or filter.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Notice -->
    <div class="alert border border-base-300 bg-base-100 text-base-content shadow-sm">
      <ClipboardCheck :size="18" class="text-info" />
      <div>
        <p class="text-sm font-medium">Sample Return Records</p>
        <p class="text-xs text-base-content/60">
          These return records are sample data for frontend development. Actual return processing, equipment condition verification, and inventory updates will be implemented during system integration.
        </p>
      </div>
    </div>
  </div>
</template>
