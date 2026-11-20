
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ClipboardList,
  X,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
  title: 'Requisitions',
})

useSeoMeta({
  title: 'Requisitions | ICAM',
  description: 'Review and manage laboratory equipment requisitions.',
})

type RequisitionStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Borrowed'
  | 'Completed'

interface Requisition {
  id: string
  studentName: string
  studentId: string
  equipmentId: string
  quantity: number
  reservationDate: string
  purpose: string
  status: RequisitionStatus
  createdAt: string
}

const STORAGE_KEY = 'icam-reservations'

const requisitions = ref<Requisition[]>([])

const searchQuery = ref('')
const selectedStatus = ref('All')
const selectedRequisition = ref<Requisition | null>(null)
const showDetailsModal = ref(false)

// Summary cards
const totalRequests = computed(() => requisitions.value.length)

const pendingRequests = computed(() =>
  requisitions.value.filter(item => item.status === 'Pending').length,
)

const approvedRequests = computed(() =>
  requisitions.value.filter(item => item.status === 'Approved').length,
)

const rejectedRequests = computed(() =>
  requisitions.value.filter(item => item.status === 'Rejected').length,
)

// Search and filtering
const filteredRequisitions = computed(() => {
  const query = searchQuery.value.toLowerCase()

  return requisitions.value.filter(item => {
    const matchesSearch =
      item.id.toLowerCase().includes(query) ||
      item.studentName.toLowerCase().includes(query) ||
      item.studentId.toLowerCase().includes(query) ||
      item.equipmentId.toLowerCase().includes(query) ||
      getEquipmentName(item.equipmentId).toLowerCase().includes(query)

    const matchesStatus =
      selectedStatus.value === 'All' ||
      item.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

// Equipment information is shared with Inventory
function getEquipmentName(id: string) {
  try {
    const savedEquipment = localStorage.getItem('icam-equipment')

    if (savedEquipment) {
      const equipment = JSON.parse(savedEquipment)
      const item = equipment.find(
        (equipmentItem: { id: string }) => equipmentItem.id === id,
      )

      if (item) return item.name
    }
  } catch {
    console.warn('Could not retrieve equipment information.')
  }

  const equipmentNames: Record<string, string> = {
    'EQ-001': 'Microscope',
    'EQ-002': 'Centrifuge',
    'EQ-003': 'Beaker',
    'EQ-004': 'Test Tube',
    'EQ-005': 'Pipette',
    'EQ-006': 'Blood Pressure Apparatus',
    'EQ-007': 'Laboratory Gloves',
    'EQ-008': 'Graduated Cylinder',
    'EQ-009': 'Analytical Balance',
    'EQ-010': 'Petri Dish',
  }

  return equipmentNames[id] || 'Equipment not found'
}

function getStatusClass(status: RequisitionStatus) {
  const classes: Record<RequisitionStatus, string> = {
    Pending: 'badge-warning',
    Approved: 'badge-success',
    Rejected: 'badge-error',
    Cancelled: 'badge-ghost',
    Borrowed: 'badge-info',
    Completed: 'badge-neutral',
  }

  return classes[status]
}

// Requisition details
function openDetails(item: Requisition) {
  selectedRequisition.value = item
  showDetailsModal.value = true
}

function closeDetails() {
  showDetailsModal.value = false
  selectedRequisition.value = null
}

// Requisition actions
function approveRequisition(item: Requisition) {
  if (item.status !== 'Pending') return

  item.status = 'Approved'
}

function rejectRequisition(item: Requisition) {
  if (item.status !== 'Pending') return

  const confirmed = confirm(
    `Are you sure you want to reject requisition ${item.id}?`,
  )

  if (!confirmed) return

  item.status = 'Rejected'
}

function cancelRequisition(item: Requisition) {
  if (!['Pending', 'Approved'].includes(item.status)) return

  const confirmed = confirm(
    `Are you sure you want to cancel requisition ${item.id}?`,
  )

  if (!confirmed) return

  item.status = 'Cancelled'
}

// Load mock data from shared localStorage
onMounted(() => {
  const savedRequisitions = localStorage.getItem(STORAGE_KEY)

  if (savedRequisitions) {
    try {
      requisitions.value = JSON.parse(savedRequisitions)
    } catch {
      console.warn('Could not load requisition records.')
    }
  } else {
    // Initial sample records for frontend testing
    const today = new Date()
    const dateAfterTwoDays = new Date(today)
    dateAfterTwoDays.setDate(today.getDate() + 2)

    const dateAfterThreeDays = new Date(today)
    dateAfterThreeDays.setDate(today.getDate() + 3)

    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      return `${year}-${month}-${day}`
    }

    requisitions.value = [
      {
        id: 'RES-1001',
        studentName: 'Juan Dela Cruz',
        studentId: '2024-00123',
        equipmentId: 'EQ-001',
        quantity: 2,
        reservationDate: formatDate(dateAfterTwoDays),
        purpose: 'Microscope examination for Biology laboratory activity.',
        status: 'Pending',
        createdAt: today.toISOString(),
      },
      {
        id: 'RES-1002',
        studentName: 'Maria Santos',
        studentId: '2024-00145',
        equipmentId: 'EQ-002',
        quantity: 1,
        reservationDate: formatDate(dateAfterThreeDays),
        purpose: 'Laboratory experiment and specimen preparation.',
        status: 'Pending',
        createdAt: today.toISOString(),
      },
      {
        id: 'RES-1003',
        studentName: 'Pedro Reyes',
        studentId: '2023-00089',
        equipmentId: 'EQ-003',
        quantity: 5,
        reservationDate: formatDate(dateAfterTwoDays),
        purpose: 'Chemistry laboratory activity.',
        status: 'Approved',
        createdAt: today.toISOString(),
      },
      {
        id: 'RES-1004',
        studentName: 'Ana Garcia',
        studentId: '2024-00201',
        equipmentId: 'EQ-004',
        quantity: 3,
        reservationDate: formatDate(dateAfterThreeDays),
        purpose: 'Laboratory practical examination.',
        status: 'Rejected',
        createdAt: today.toISOString(),
      },
    ]
  }
})

// Save changes to shared localStorage
watch(
  requisitions,
  value => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="space-y-6">

    <!-- PAGE HEADER -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight">
        Requisitions
      </h1>
      <p class="mt-1 text-base-content/60">
        Review and manage laboratory equipment requests.
      </p>
    </div>

    <!-- SUMMARY CARDS -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Total Requests</p>
            <ClipboardList :size="20" class="text-base-content/50" />
          </div>
          <h2 class="text-3xl font-bold">{{ totalRequests }}</h2>
          <p class="text-xs text-base-content/50">All requisition records</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Pending</p>
            <Clock :size="20" class="text-warning" />
          </div>
          <h2 class="text-3xl font-bold text-warning">
            {{ pendingRequests }}
          </h2>
          <p class="text-xs text-base-content/50">Awaiting review</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Approved</p>
            <CheckCircle :size="20" class="text-success" />
          </div>
          <h2 class="text-3xl font-bold text-success">
            {{ approvedRequests }}
          </h2>
          <p class="text-xs text-base-content/50">Approved requests</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">Rejected</p>
            <XCircle :size="20" class="text-error" />
          </div>
          <h2 class="text-3xl font-bold text-error">
            {{ rejectedRequests }}
          </h2>
          <p class="text-xs text-base-content/50">Declined requests</p>
        </div>
      </div>

    </div>

    <!-- REQUISITIONS TABLE -->
    <div class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4">

        <div>
          <h2 class="card-title">Requisition Records</h2>
          <p class="text-sm text-base-content/60">
            View submitted requests and manage their approval status.
          </p>
        </div>

        <!-- SEARCH AND FILTER -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div class="relative w-full sm:max-w-sm">
            <Search
              :size="18"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
            />

            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search requisitions..."
              class="input input-bordered w-full pl-10"
            />
          </div>

          <select
            v-model="selectedStatus"
            class="select select-bordered w-full sm:w-48"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Borrowed">Borrowed</option>
            <option value="Completed">Completed</option>
          </select>

        </div>

        <!-- TABLE -->
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Requester</th>
                <th>Equipment</th>
                <th>Qty</th>
                <th>Date Needed</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in filteredRequisitions"
                :key="item.id"
              >
                <td class="font-medium">{{ item.id }}</td>

                <td>
                  <div class="font-semibold">{{ item.studentName }}</div>
                  <div class="text-xs text-base-content/50">
                    {{ item.studentId }}
                  </div>
                </td>

                <td>{{ getEquipmentName(item.equipmentId) }}</td>

                <td>{{ item.quantity }}</td>

                <td>{{ item.reservationDate }}</td>

                <td>
                  <span
                    class="badge"
                    :class="getStatusClass(item.status)"
                  >
                    {{ item.status }}
                  </span>
                </td>

                <td>
                  <div class="flex justify-end gap-1">

                    <button
                      class="btn btn-ghost btn-sm btn-square"
                      title="View Details"
                      @click="openDetails(item)"
                    >
                      <Eye :size="16" />
                    </button>

                    <button
                      v-if="item.status === 'Pending'"
                      class="btn btn-success btn-sm btn-square"
                      title="Approve"
                      @click="approveRequisition(item)"
                    >
                      <CheckCircle :size="16" />
                    </button>

                    <button
                      v-if="item.status === 'Pending'"
                      class="btn btn-error btn-sm btn-square"
                      title="Reject"
                      @click="rejectRequisition(item)"
                    >
                      <XCircle :size="16" />
                    </button>

                    <button
                      v-if="['Pending', 'Approved'].includes(item.status)"
                      class="btn btn-ghost btn-sm btn-square"
                      title="Cancel"
                      @click="cancelRequisition(item)"
                    >
                      <X :size="16" />
                    </button>

                  </div>
                </td>
              </tr>

              <tr v-if="filteredRequisitions.length === 0">
                <td colspan="7" class="py-12 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <ClipboardList
                      :size="32"
                      class="text-base-content/30"
                    />
                    <p class="font-medium text-base-content/60">
                      No requisition records found.
                    </p>
                    <p class="text-sm text-base-content/40">
                      Try changing your search or status filter.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="text-sm text-base-content/50">
          Showing {{ filteredRequisitions.length }} of {{ totalRequests }} requisitions
        </div>

      </div>
    </div>

    <!-- DETAILS MODAL -->
    <div
      v-if="showDetailsModal && selectedRequisition"
      class="modal modal-open"
    >
      <div class="modal-box max-w-2xl">

        <div class="mb-6 flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold">Requisition Details</h3>
            <p class="text-sm text-base-content/50">
              {{ selectedRequisition.id }}
            </p>
          </div>

          <button
            class="btn btn-sm btn-circle btn-ghost"
            @click="closeDetails"
          >
            <X :size="18" />
          </button>
        </div>

        <div class="space-y-5">

          <div class="flex items-center justify-between">
            <span class="text-sm text-base-content/60">Request Status</span>
            <span
              class="badge"
              :class="getStatusClass(selectedRequisition.status)"
            >
              {{ selectedRequisition.status }}
            </span>
          </div>

          <div class="divider my-0"></div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <p class="text-sm text-base-content/50">Requester Name</p>
              <p class="font-semibold">
                {{ selectedRequisition.studentName }}
              </p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Student ID</p>
              <p class="font-semibold">
                {{ selectedRequisition.studentId }}
              </p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Equipment</p>
              <p class="font-semibold">
                {{ getEquipmentName(selectedRequisition.equipmentId) }}
              </p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Quantity Requested</p>
              <p class="font-semibold">
                {{ selectedRequisition.quantity }}
              </p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Date Needed</p>
              <p class="font-semibold">
                {{ selectedRequisition.reservationDate }}
              </p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Date Submitted</p>
              <p class="font-semibold">
                {{ new Date(selectedRequisition.createdAt).toLocaleDateString() }}
              </p>
            </div>

          </div>

          <div>
            <p class="text-sm text-base-content/50">Purpose of Request</p>
            <p class="mt-1 leading-relaxed">
              {{ selectedRequisition.purpose }}
            </p>
          </div>

        </div>

        <div class="modal-action">
          <button class="btn btn-ghost" @click="closeDetails">
            Close
          </button>

          <button
            v-if="selectedRequisition.status === 'Pending'"
            class="btn btn-error"
            @click="rejectRequisition(selectedRequisition); closeDetails()"
          >
            <XCircle :size="16" />
            Reject
          </button>

          <button
            v-if="selectedRequisition.status === 'Pending'"
            class="btn btn-success"
            @click="approveRequisition(selectedRequisition); closeDetails()"
          >
            <CheckCircle :size="16" />
            Approve
          </button>
        </div>

      </div>

      <div class="modal-backdrop" @click="closeDetails">
        <button>Close</button>
      </div>
    </div>

  </div>
</template>
