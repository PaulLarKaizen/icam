
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  BarChart3,
  Package,
  ClipboardList,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Download,
  TrendingUp,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'lab-custodian',
  title: 'Reports & Analytics',
})

useSeoMeta({
  title: 'Reports & Analytics | ICAM',
  description: 'Laboratory inventory, requisition, borrowing, and return reports.',
})

interface Transaction {
  id: string
  type: string
  person: string
  equipment: string
  date: string
  status: string
}

const searchQuery = ref('')
const selectedPeriod = ref('All Time')

const transactions: Transaction[] = [
  {
    id: 'REQ-2026-031',
    type: 'Requisition',
    person: 'Maria Santos',
    equipment: 'Microscope',
    date: '2026-11-20',
    status: 'Pending',
  },
  {
    id: 'BOR-2026-024',
    type: 'Borrowing',
    person: 'John Reyes',
    equipment: 'Analytical Balance',
    date: '2026-11-19',
    status: 'Active',
  },
  {
    id: 'RET-2026-021',
    type: 'Return',
    person: 'Angela Cruz',
    equipment: 'Centrifuge',
    date: '2026-11-19',
    status: 'Completed',
  },
  {
    id: 'REQ-2026-030',
    type: 'Requisition',
    person: 'Mark Villanueva',
    equipment: 'Glassware Set',
    date: '2026-11-18',
    status: 'Approved',
  },
  {
    id: 'BOR-2026-023',
    type: 'Borrowing',
    person: 'Sofia Garcia',
    equipment: 'Compound Microscope',
    date: '2026-11-17',
    status: 'Overdue',
  },
  {
    id: 'RET-2026-020',
    type: 'Return',
    person: 'Daniel Flores',
    equipment: 'Pipette Set',
    date: '2026-11-16',
    status: 'Pending Inspection',
  },
  {
    id: 'REQ-2026-029',
    type: 'Requisition',
    person: 'Emily Torres',
    equipment: 'Test Tubes',
    date: '2026-11-15',
    status: 'Rejected',
  },
  {
    id: 'RET-2026-019',
    type: 'Return',
    person: 'Carlos Mendoza',
    equipment: 'Beaker Set',
    date: '2026-11-14',
    status: 'Completed',
  },
]

const inventorySummary = [
  { label: 'Available', value: 86, percentage: 67, color: 'bg-success' },
  { label: 'Borrowed', value: 28, percentage: 22, color: 'bg-warning' },
  { label: 'Unavailable', value: 14, percentage: 11, color: 'bg-error' },
]

const requisitionSummary = [
  { label: 'Pending', value: 12, color: 'text-warning' },
  { label: 'Approved', value: 34, color: 'text-success' },
  { label: 'Rejected', value: 5, color: 'text-error' },
]

const filteredTransactions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return transactions.filter((transaction) => {
    const matchesSearch =
      !query ||
      transaction.id.toLowerCase().includes(query) ||
      transaction.person.toLowerCase().includes(query) ||
      transaction.equipment.toLowerCase().includes(query) ||
      transaction.type.toLowerCase().includes(query) ||
      transaction.status.toLowerCase().includes(query)

    return matchesSearch
  })
})

function exportTransactions() {
  const headers = ['Transaction ID', 'Type', 'Person', 'Equipment', 'Date', 'Status']

  const rows = filteredTransactions.value.map((transaction) => [
    transaction.id,
    transaction.type,
    transaction.person,
    transaction.equipment,
    transaction.date,
    transaction.status,
  ])

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','),
    )
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'icam-transaction-report.csv'
  link.click()

  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p class="mt-1 text-sm text-base-content/60">
          Overview of laboratory inventory, requisitions, borrowing, and returns.
        </p>
      </div>

      <button
        class="btn btn-primary btn-sm sm:btn-md"
        @click="exportTransactions"
      >
        <Download class="size-4" />
        Export Transactions
      </button>
    </div>

    <!-- Overview Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Total Equipment Units</p>
            <Package class="size-5 text-primary" />
          </div>
          <h2 class="text-3xl font-bold">128</h2>
          <p class="text-xs text-base-content/50">Registered laboratory equipment</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Active Borrowings</p>
            <Clock class="size-5 text-warning" />
          </div>
          <h2 class="text-3xl font-bold">28</h2>
          <p class="text-xs text-base-content/50">Currently borrowed equipment units</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Completed Returns</p>
            <CheckCircle2 class="size-5 text-success" />
          </div>
          <h2 class="text-3xl font-bold">94</h2>
          <p class="text-xs text-base-content/50">Successfully returned equipment</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Pending Requisitions</p>
            <ClipboardList class="size-5 text-info" />
          </div>
          <h2 class="text-3xl font-bold">12</h2>
          <p class="text-xs text-base-content/50">Awaiting review or approval</p>
        </div>
      </div>
    </div>

    <!-- Inventory and Requisition Summary -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <!-- Inventory Summary -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body space-y-4">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-primary/10 p-3 text-primary">
              <Package class="size-5" />
            </div>
            <div>
              <h2 class="card-title text-base">Inventory Summary</h2>
              <p class="text-xs text-base-content/60">
                Distribution of registered equipment
              </p>
            </div>
          </div>

          <div
            v-for="item in inventorySummary"
            :key="item.label"
            class="space-y-2"
          >
            <div class="flex items-center justify-between text-sm">
              <span>{{ item.label }}</span>
              <span class="font-semibold">{{ item.value }} units ({{ item.percentage }}%)</span>
            </div>

            <div class="h-2.5 w-full overflow-hidden rounded-full bg-base-300">
              <div
                :class="item.color"
                class="h-full rounded-full transition-all"
                :style="{ width: `${item.percentage}%` }"
              />
            </div>
          </div>

          <div class="rounded-lg bg-base-200/60 p-3">
            <p class="text-sm font-medium">Total Inventory: 128 units</p>
            <p class="text-xs text-base-content/60">
              Availability is based on the sample inventory records.
            </p>
          </div>
        </div>
      </div>

      <!-- Requisition Summary -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body space-y-4">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-info/10 p-3 text-info">
              <ClipboardList class="size-5" />
            </div>
            <div>
              <h2 class="card-title text-base">Requisition Summary</h2>
              <p class="text-xs text-base-content/60">
                Overview of request processing
              </p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="item in requisitionSummary"
              :key="item.label"
              class="rounded-xl border border-base-300 p-4 text-center"
            >
              <p class="text-xs text-base-content/60">{{ item.label }}</p>
              <p class="mt-2 text-2xl font-bold" :class="item.color">
                {{ item.value }}
              </p>
            </div>
          </div>

          <div class="rounded-lg bg-base-200/60 p-3">
            <div class="flex items-center gap-2">
              <TrendingUp class="size-4 text-primary" />
              <p class="text-sm font-medium">Request Activity</p>
            </div>
            <p class="mt-1 text-xs text-base-content/60">
              51 sample requisition records, including pending, approved, and rejected requests.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Activity -->
    <div class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="card-title text-base">Transaction History</h2>
            <p class="text-sm text-base-content/60">
              Recent requisition, borrowing, and return activity
            </p>
          </div>

          <div class="join w-full sm:w-auto">
            <label class="input input-bordered join-item flex w-full items-center gap-2 sm:w-64">
              <Search class="size-4 text-base-content/50" />
              <input
                v-model="searchQuery"
                type="text"
                class="grow"
                placeholder="Search transactions..."
              />
            </label>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Person</th>
                <th>Equipment</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="transaction in filteredTransactions" :key="transaction.id">
                <td class="font-medium">{{ transaction.id }}</td>
                <td>
                  <span
                    class="badge badge-outline badge-sm"
                    :class="{
                      'badge-info': transaction.type === 'Requisition',
                      'badge-warning': transaction.type === 'Borrowing',
                      'badge-success': transaction.type === 'Return',
                    }"
                  >
                    {{ transaction.type }}
                  </span>
                </td>
                <td>{{ transaction.person }}</td>
                <td>{{ transaction.equipment }}</td>
                <td>{{ transaction.date }}</td>
                <td>
                  <span
                    class="badge badge-sm"
                    :class="{
                      'badge-warning': transaction.status === 'Pending' || transaction.status === 'Pending Inspection',
                      'badge-success': transaction.status === 'Approved' || transaction.status === 'Completed',
                      'badge-error': transaction.status === 'Rejected' || transaction.status === 'Overdue',
                      'badge-info': transaction.status === 'Active',
                    }"
                  >
                    {{ transaction.status }}
                  </span>
                </td>
              </tr>

              <tr v-if="filteredTransactions.length === 0">
                <td colspan="6" class="py-10 text-center text-base-content/50">
                  No transactions found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t border-base-300 pt-3">
          <p class="text-xs text-base-content/50">
            Showing {{ filteredTransactions.length }} of {{ transactions.length }} sample transactions
          </p>
        </div>
      </div>
    </div>

    <!-- Sample Data Notice -->
    <div class="alert border border-warning/20 bg-warning/5 text-sm">
      <AlertTriangle class="size-5 shrink-0 text-warning" />
      <div>
        <p class="font-medium">Sample Report Data</p>
        <p class="text-xs text-base-content/60">
          The displayed statistics and transaction records are sample data for the frontend.
          Actual reports will be generated from ICAM records once backend integration is implemented.
        </p>
      </div>
    </div>
  </div>
</template>
