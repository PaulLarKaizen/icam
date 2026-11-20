
<script setup lang="ts">
import {
  ClipboardList,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  CalendarDays,
  Eye,
  X,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'student',
  title: 'My Requisitions',
})

useSeoMeta({
  title: 'My Requisitions | ICAM',
  description: 'Submit and track laboratory equipment requisitions.',
})

interface Requisition {
  id: string
  equipment: string
  quantity: number
  purpose: string
  dateRequested: string
  expectedDate: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed'
}

const requisitions = ref<Requisition[]>([
  {
    id: 'REQ-2026-031',
    equipment: 'Glassware Set',
    quantity: 1,
    purpose: 'For Chemistry laboratory experiment',
    dateRequested: 'Nov 20, 2026',
    expectedDate: 'Nov 24, 2026',
    status: 'Pending',
  },
  {
    id: 'REQ-2026-028',
    equipment: 'Compound Microscope',
    quantity: 1,
    purpose: 'For laboratory practical examination',
    dateRequested: 'Nov 17, 2026',
    expectedDate: 'Nov 18, 2026',
    status: 'Approved',
  },
  {
    id: 'REQ-2026-021',
    equipment: 'Pipette Set',
    quantity: 2,
    purpose: 'For specimen measurement activity',
    dateRequested: 'Nov 12, 2026',
    expectedDate: 'Nov 14, 2026',
    status: 'Completed',
  },
  {
    id: 'REQ-2026-019',
    equipment: 'Analytical Balance',
    quantity: 1,
    purpose: 'For measurement of laboratory samples',
    dateRequested: 'Nov 10, 2026',
    expectedDate: 'Nov 12, 2026',
    status: 'Rejected',
  },
])

const equipmentOptions = [
  'Compound Microscope',
  'Analytical Balance',
  'Centrifuge',
  'Glassware Set',
  'Pipette Set',
  'Test Tube Rack',
]

const searchQuery = ref('')
const selectedStatus = ref('All')
const showForm = ref(false)

const form = reactive({
  equipment: '',
  quantity: 1,
  purpose: '',
  expectedDate: '',
})

const statusOptions = ['All', 'Pending', 'Approved', 'Rejected', 'Completed']

const filteredRequisitions = computed(() => {
  return requisitions.value.filter((request => {
    const matchesSearch =
      request.equipment.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus =
      selectedStatus.value === 'All' ||
      request.status === selectedStatus.value

    return matchesSearch && matchesStatus
  }))
})

const pendingCount = computed(() =>
  requisitions.value.filter(item => item.status === 'Pending').length,
)

const approvedCount = computed(() =>
  requisitions.value.filter(item => item.status === 'Approved').length,
)

const completedCount = computed(() =>
  requisitions.value.filter(item => item.status === 'Completed').length,
)

const rejectedCount = computed(() =>
  requisitions.value.filter(item => item.status === 'Rejected').length,
)

function getStatusClass(status: Requisition['status']) {
  switch (status) {
    case 'Pending':
      return 'badge-warning'
    case 'Approved':
      return 'badge-info'
    case 'Rejected':
      return 'badge-error'
    case 'Completed':
      return 'badge-success'
  }
}

function getStatusIcon(status: Requisition['status']) {
  switch (status) {
    case 'Pending':
      return Clock
    case 'Approved':
      return CheckCircle2
    case 'Rejected':
      return XCircle
    case 'Completed':
      return CheckCircle2
  }
}

function generateRequestId() {
  const nextNumber = requisitions.value.length + 32

  return `REQ-2026-${String(nextNumber).padStart(3, '0')}`
}

function submitRequisition() {
  if (!form.equipment || !form.purpose.trim() || !form.expectedDate) {
    return
  }

  const newRequest: Requisition = {
    id: generateRequestId(),
    equipment: form.equipment,
    quantity: form.quantity,
    purpose: form.purpose.trim(),
    dateRequested: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    expectedDate: new Date(`${form.expectedDate}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    status: 'Pending',
  }

  requisitions.value.unshift(newRequest)

  form.equipment = ''
  form.quantity = 1
  form.purpose = ''
  form.expectedDate = ''

  showForm.value = false
}

function cancelForm() {
  form.equipment = ''
  form.quantity = 1
  form.purpose = ''
  form.expectedDate = ''
  showForm.value = false
}
</script>

<template>
  <div class="space-y-6">

    <!-- Page Header -->
    <section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
          My Requisitions
        </h1>

        <p class="mt-1 text-sm text-base-content/60">
          Submit equipment requests and keep track of their status.
        </p>
      </div>

      <button
        class="btn btn-primary"
        @click="showForm = !showForm"
      >
        <Plus class="size-4" />
        Submit Requisition
      </button>
    </section>

    <!-- Summary Cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <!-- Pending -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Pending</p>
            <div class="rounded-xl bg-warning/10 p-2.5 text-warning">
              <Clock class="size-5" />
            </div>
          </div>

          <h2 class="text-3xl font-bold">{{ pendingCount }}</h2>
          <p class="text-xs text-base-content/50">Awaiting approval</p>
        </div>
      </div>

      <!-- Approved -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Approved</p>
            <div class="rounded-xl bg-info/10 p-2.5 text-info">
              <CheckCircle2 class="size-5" />
            </div>
          </div>

          <h2 class="text-3xl font-bold">{{ approvedCount }}</h2>
          <p class="text-xs text-base-content/50">Approved requests</p>
        </div>
      </div>

      <!-- Completed -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Completed</p>
            <div class="rounded-xl bg-success/10 p-2.5 text-success">
              <CheckCircle2 class="size-5" />
            </div>
          </div>

          <h2 class="text-3xl font-bold">{{ completedCount }}</h2>
          <p class="text-xs text-base-content/50">Successfully processed</p>
        </div>
      </div>

      <!-- Rejected -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Rejected</p>
            <div class="rounded-xl bg-error/10 p-2.5 text-error">
              <XCircle class="size-5" />
            </div>
          </div>

          <h2 class="text-3xl font-bold">{{ rejectedCount }}</h2>
          <p class="text-xs text-base-content/50">Requests not approved</p>
        </div>
      </div>
    </section>

    <!-- Requisition Form -->
    <section
      v-if="showForm"
      class="card border border-primary/30 bg-base-100 shadow-sm"
    >
      <div class="card-body space-y-5">

        <div class="flex items-center justify-between">
          <div>
            <h2 class="card-title">New Equipment Requisition</h2>
            <p class="text-sm text-base-content/60">
              Fill out the details for your equipment request.
            </p>
          </div>

          <button
            class="btn btn-ghost btn-square btn-sm"
            aria-label="Close form"
            @click="cancelForm"
          >
            <X class="size-5" />
          </button>
        </div>

        <form
          class="space-y-5"
          @submit.prevent="submitRequisition"
        >
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">

            <!-- Equipment -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Equipment</span>
              </label>

              <select
                v-model="form.equipment"
                class="select select-bordered w-full"
                required
              >
                <option value="" disabled>Select equipment</option>

                <option
                  v-for="equipment in equipmentOptions"
                  :key="equipment"
                  :value="equipment"
                >
                  {{ equipment }}
                </option>
              </select>
            </div>

            <!-- Quantity -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Quantity</span>
              </label>

              <input
                v-model.number="form.quantity"
                type="number"
                min="1"
                max="20"
                class="input input-bordered w-full"
                required
              />
            </div>

            <!-- Expected Date -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Expected Usage Date</span>
              </label>

              <input
                v-model="form.expectedDate"
                type="date"
                class="input input-bordered w-full"
                :min="new Date().toISOString().split('T')[0]"
                required
              />
            </div>
          </div>

          <!-- Purpose -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Purpose of Request</span>
            </label>

            <textarea
              v-model="form.purpose"
              class="textarea textarea-bordered min-h-28 w-full"
              placeholder="Explain why you need this laboratory equipment..."
              required
            />
          </div>

          <!-- Form Actions -->
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="btn btn-ghost"
              @click="cancelForm"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="btn btn-primary"
            >
              <ClipboardList class="size-4" />
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- Requisitions List -->
    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4">

        <!-- List Header -->
        <div>
          <h2 class="card-title">Request History</h2>
          <p class="text-sm text-base-content/60">
            View all your submitted equipment requests.
          </p>
        </div>

        <!-- Search and Filter -->
        <div class="flex flex-col gap-3 sm:flex-row">

          <label class="input input-bordered flex items-center gap-2 flex-1">
            <Search class="size-4 text-base-content/40" />

            <input
              v-model="searchQuery"
              type="text"
              class="grow"
              placeholder="Search equipment or request ID..."
            />
          </label>

          <select
            v-model="selectedStatus"
            class="select select-bordered w-full sm:w-48"
          >
            <option
              v-for="status in statusOptions"
              :key="status"
              :value="status"
            >
              {{ status === 'All' ? 'All Statuses' : status }}
            </option>
          </select>
        </div>

        <!-- Request Items -->
        <div
          v-if="filteredRequisitions.length"
          class="space-y-3"
        >
          <div
            v-for="request in filteredRequisitions"
            :key="request.id"
            class="rounded-xl border border-base-300 p-4 transition-colors hover:border-primary/30"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <!-- Request Information -->
              <div class="flex min-w-0 gap-3">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package class="size-5" />
                </div>

                <div class="min-w-0">
                  <h3 class="font-semibold">
                    {{ request.equipment }}
                  </h3>

                  <p class="mt-1 text-xs text-base-content/50">
                    {{ request.id }}
                  </p>

                  <p class="mt-2 text-sm text-base-content/60">
                    {{ request.purpose }}
                  </p>
                </div>
              </div>

              <!-- Status -->
              <span
                class="badge gap-1 self-start"
                :class="getStatusClass(request.status)"
              >
                <component
                  :is="getStatusIcon(request.status)"
                  class="size-3.5"
                />
                {{ request.status }}
              </span>
            </div>

            <!-- Request Details -->
            <div class="mt-4 grid grid-cols-1 gap-3 border-t border-base-300 pt-3 sm:grid-cols-3">

              <div class="flex items-center gap-2 text-sm">
                <Package class="size-4 text-base-content/40" />
                <span class="text-base-content/60">Quantity:</span>
                <span class="font-medium">{{ request.quantity }}</span>
              </div>

              <div class="flex items-center gap-2 text-sm">
                <CalendarDays class="size-4 text-base-content/40" />
                <span class="text-base-content/60">Requested:</span>
                <span class="font-medium">{{ request.dateRequested }}</span>
              </div>

              <div class="flex items-center gap-2 text-sm">
                <CalendarDays class="size-4 text-base-content/40" />
                <span class="text-base-content/60">Expected:</span>
                <span class="font-medium">{{ request.expectedDate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="flex flex-col items-center justify-center rounded-xl border border-dashed border-base-300 py-12 text-center"
        >
          <ClipboardList class="size-10 text-base-content/30" />

          <h3 class="mt-3 font-semibold">
            No requisitions found
          </h3>

          <p class="mt-1 text-sm text-base-content/50">
            Try changing your search or status filter.
          </p>
        </div>

        <!-- Sample Data Notice -->
        <p class="text-center text-xs text-base-content/40">
          Requisition records are currently displayed using sample data.
        </p>
      </div>
    </section>
  </div>
</template>
