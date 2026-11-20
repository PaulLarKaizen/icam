
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Search,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  Filter,
  CalendarDays,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'lab-custodian',
  title: 'Requisitions',
})

useSeoMeta({
  title: 'Requisitions | ICAM',
  description: 'Review and manage laboratory equipment requisitions.',
})

interface Requisition {
  id: string
  requester: string
  department: string
  equipment: string
  quantity: number
  dateRequested: string
  dateNeeded: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processing' | 'Released'
}

const searchQuery = ref('')
const selectedStatus = ref('All Statuses')

const requisitions = ref<Requisition[]>([
  {
    id: 'REQ-2026-041',
    requester: 'Maria Santos',
    department: 'Medical Laboratory Science',
    equipment: 'Compound Microscope',
    quantity: 2,
    dateRequested: 'Nov 20, 2026',
    dateNeeded: 'Nov 24, 2026',
    status: 'Pending',
  },
  {
    id: 'REQ-2026-040',
    requester: 'John Reyes',
    department: 'Medical Laboratory Science',
    equipment: 'Centrifuge Tubes',
    quantity: 10,
    dateRequested: 'Nov 20, 2026',
    dateNeeded: 'Nov 22, 2026',
    status: 'Pending',
  },
  {
    id: 'REQ-2026-039',
    requester: 'Angela Cruz',
    department: 'Medical Laboratory Science',
    equipment: 'Laboratory Glassware Set',
    quantity: 5,
    dateRequested: 'Nov 19, 2026',
    dateNeeded: 'Nov 23, 2026',
    status: 'Approved',
  },
  {
    id: 'REQ-2026-038',
    requester: 'Paolo Garcia',
    department: 'Medical Laboratory Science',
    equipment: 'Test Tube Rack',
    quantity: 3,
    dateRequested: 'Nov 19, 2026',
    dateNeeded: 'Nov 21, 2026',
    status: 'Processing',
  },
  {
    id: 'REQ-2026-037',
    requester: 'Sofia Mendoza',
    department: 'Medical Laboratory Science',
    equipment: 'Analytical Balance',
    quantity: 1,
    dateRequested: 'Nov 18, 2026',
    dateNeeded: 'Nov 25, 2026',
    status: 'Rejected',
  },
  {
    id: 'REQ-2026-036',
    requester: 'Daniel Flores',
    department: 'Medical Laboratory Science',
    equipment: 'Pipette Set',
    quantity: 2,
    dateRequested: 'Nov 18, 2026',
    dateNeeded: 'Nov 20, 2026',
    status: 'Released',
  },
])

const pendingCount = computed(() =>
  requisitions.value.filter(item => item.status === 'Pending').length,
)

const approvedCount = computed(() =>
  requisitions.value.filter(item => item.status === 'Approved').length,
)

const rejectedCount = computed(() =>
  requisitions.value.filter(item => item.status === 'Rejected').length,
)

const activeCount = computed(() =>
  requisitions.value.filter(item =>
    ['Processing', 'Released'].includes(item.status),
  ).length,
)

const filteredRequisitions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return requisitions.value.filter(item => {
    const matchesSearch =
      !query ||
      item.id.toLowerCase().includes(query) ||
      item.requester.toLowerCase().includes(query) ||
      item.equipment.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query)

    const matchesStatus =
      selectedStatus.value === 'All Statuses' ||
      item.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

function getStatusClass(status: Requisition['status']) {
  switch (status) {
    case 'Pending':
      return 'badge-warning badge-outline'
    case 'Approved':
      return 'badge-success badge-outline'
    case 'Rejected':
      return 'badge-error badge-outline'
    case 'Processing':
      return 'badge-info badge-outline'
    case 'Released':
      return 'badge-primary badge-outline'
    default:
      return 'badge-ghost'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p class="text-sm text-base-content/50">Laboratory Management</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Requisitions
        </h1>
        <p class="mt-1 text-sm text-base-content/60">
          Review, monitor, and manage equipment requests from faculty.
        </p>
      </div>
    </section>

    <!-- Summary Cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <!-- Pending -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Pending Review</p>
              <p class="mt-2 text-3xl font-bold">{{ pendingCount }}</p>
            </div>
            <div class="rounded-xl bg-warning/10 p-3 text-warning">
              <Clock3 :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Awaiting your decision</p>
        </div>
      </div>

      <!-- Approved -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Approved</p>
              <p class="mt-2 text-3xl font-bold">{{ approvedCount }}</p>
            </div>
            <div class="rounded-xl bg-success/10 p-3 text-success">
              <CheckCircle2 :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Accepted requests</p>
        </div>
      </div>

      <!-- Rejected -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Rejected</p>
              <p class="mt-2 text-3xl font-bold">{{ rejectedCount }}</p>
            </div>
            <div class="rounded-xl bg-error/10 p-3 text-error">
              <XCircle :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Declined requests</p>
        </div>
      </div>

      <!-- Active -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Active Requests</p>
              <p class="mt-2 text-3xl font-bold">{{ activeCount }}</p>
            </div>
            <div class="rounded-xl bg-info/10 p-3 text-info">
              <ClipboardList :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Processing or released</p>
        </div>
      </div>
    </section>

    <!-- Requisition Table -->
    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4 p-5">
        <!-- Table header -->
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-lg font-semibold">Request Records</h2>
            <p class="mt-1 text-sm text-base-content/50">
              {{ filteredRequisitions.length }} requisitions found
            </p>
          </div>
        </div>

        <!-- Search and filters -->
        <div class="flex flex-col gap-3 lg:flex-row">
          <label class="input input-bordered flex flex-1 items-center gap-2">
            <Search :size="18" class="text-base-content/40" />
            <input
              v-model="searchQuery"
              type="text"
              class="grow"
              placeholder="Search ID, requester, or equipment..."
            />
          </label>

          <select
            v-model="selectedStatus"
            class="select select-bordered w-full sm:w-52"
          >
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Processing</option>
            <option>Released</option>
          </select>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-lg border border-base-300">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="text-xs uppercase text-base-content/50">
                <th>Requisition</th>
                <th>Requester</th>
                <th>Equipment</th>
                <th>Qty.</th>
                <th>Date Requested</th>
                <th>Date Needed</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredRequisitions" :key="item.id">
                <td class="min-w-36">
                  <span class="font-medium">{{ item.id }}</span>
                </td>

                <td class="min-w-40">
                  <p class="font-medium">{{ item.requester }}</p>
                  <p class="mt-1 text-xs text-base-content/50">
                    {{ item.department }}
                  </p>
                </td>

                <td class="min-w-40">{{ item.equipment }}</td>

                <td>{{ item.quantity }}</td>

                <td class="whitespace-nowrap text-sm">{{ item.dateRequested }}</td>

                <td class="whitespace-nowrap text-sm">
                  <span class="flex items-center gap-1">
                    <CalendarDays :size="14" class="text-base-content/40" />
                    {{ item.dateNeeded }}
                  </span>
                </td>

                <td>
                  <span class="badge badge-sm whitespace-nowrap" :class="getStatusClass(item.status)">
                    {{ item.status }}
                  </span>
                </td>

                <td>
                  <div class="flex justify-end">
                    <button
                      class="btn btn-ghost btn-sm"
                      title="View requisition"
                    >
                      <Eye :size="16" />
                      View
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="filteredRequisitions.length === 0">
                <td colspan="8" class="py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-base-content/40">
                    <Filter :size="28" />
                    <p class="font-medium">No requisitions found</p>
                    <p class="text-sm">Try changing your search or status filter.</p>
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
      <ClipboardList :size="18" class="text-info" />
      <div>
        <p class="text-sm font-medium">Sample Requisition Records</p>
        <p class="text-xs text-base-content/60">
          These requisitions are sample data for interface development. Approval and rejection actions will be implemented in a later stage.
        </p>
      </div>
    </div>
  </div>
</template>
