
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Save,
  ClipboardList,
  CheckCircle,
  Clock,
  Package,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
  title: 'Inventory Management',
})

useSeoMeta({
  title: 'Inventory Management | ICAM',
  description: 'Manage laboratory equipment inventory and reservations.',
})

interface Equipment {
  id: string
  name: string
  category: string
  quantity: number
  condition: string
  location: string
  description: string
  remarks: string
}

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

const EQUIPMENT_KEY = 'icam-equipment'
const RESERVATION_KEY = 'icam-reservations'

const equipmentList = ref<Equipment[]>([
  {
    id: 'EQ-001',
    name: 'Microscope',
    category: 'Laboratory Equipment',
    quantity: 10,
    condition: 'Good',
    location: 'Laboratory 1',
    description: 'Laboratory microscope used for specimen examination.',
    remarks: '',
  },
  {
    id: 'EQ-002',
    name: 'Centrifuge',
    category: 'Laboratory Equipment',
    quantity: 5,
    condition: 'Good',
    location: 'Laboratory 1',
    description: 'Equipment used for separating sample components.',
    remarks: '',
  },
  {
    id: 'EQ-003',
    name: 'Beaker',
    category: 'Glassware',
    quantity: 30,
    condition: 'Good',
    location: 'Storage Room',
    description: 'Glass container used for laboratory preparation.',
    remarks: '',
  },
  {
    id: 'EQ-004',
    name: 'Test Tube',
    category: 'Glassware',
    quantity: 50,
    condition: 'Good',
    location: 'Storage Room',
    description: 'Glass tubes used for handling laboratory samples.',
    remarks: '',
  },
  {
    id: 'EQ-005',
    name: 'Pipette',
    category: 'Laboratory Equipment',
    quantity: 15,
    condition: 'Good',
    location: 'Laboratory 2',
    description: 'Instrument used to measure and transfer liquids.',
    remarks: '',
  },
  {
    id: 'EQ-006',
    name: 'Blood Pressure Apparatus',
    category: 'Medical Equipment',
    quantity: 8,
    condition: 'Good',
    location: 'Laboratory 2',
    description: 'Equipment used for blood pressure measurement.',
    remarks: '',
  },
  {
    id: 'EQ-007',
    name: 'Laboratory Gloves',
    category: 'Consumables',
    quantity: 100,
    condition: 'Good',
    location: 'Storage Room',
    description: 'Disposable gloves for laboratory safety.',
    remarks: '',
  },
  {
    id: 'EQ-008',
    name: 'Graduated Cylinder',
    category: 'Glassware',
    quantity: 20,
    condition: 'Good',
    location: 'Laboratory 1',
    description: 'Cylinder used for measuring liquid volume.',
    remarks: '',
  },
  {
    id: 'EQ-009',
    name: 'Analytical Balance',
    category: 'Laboratory Equipment',
    quantity: 3,
    condition: 'Good',
    location: 'Laboratory 2',
    description: 'Precision instrument for measuring specimen mass.',
    remarks: '',
  },
  {
    id: 'EQ-010',
    name: 'Petri Dish',
    category: 'Glassware',
    quantity: 40,
    condition: 'Good',
    location: 'Storage Room',
    description: 'Shallow dishes used for specimen culture.',
    remarks: '',
  },
])

const reservations = ref<Reservation[]>([])

const searchQuery = ref('')
const selectedCategory = ref('All')
const selectedStatus = ref('All')
const reservationStatusFilter = ref('All')

const categories = computed(() => [
  'All',
  ...new Set(equipmentList.value.map(item => item.category)),
])

const getEquipment = (id: string) =>
  equipmentList.value.find(item => item.id === id)

function getReservedQuantity(equipmentId: string) {
  return reservations.value
    .filter(
      reservation =>
        reservation.equipmentId === equipmentId &&
        reservation.status === 'Approved',
    )
    .reduce((total, reservation) => total + reservation.quantity, 0)
}

function getBorrowedQuantity(equipmentId: string) {
  return reservations.value
    .filter(
      reservation =>
        reservation.equipmentId === equipmentId &&
        reservation.status === 'Borrowed',
    )
    .reduce((total, reservation) => total + reservation.quantity, 0)
}

function getAvailableQuantity(equipmentId: string) {
  const equipment = getEquipment(equipmentId)
  if (!equipment) return 0

  return Math.max(
    0,
    equipment.quantity -
      getReservedQuantity(equipmentId) -
      getBorrowedQuantity(equipmentId),
  )
}

const equipmentWithStock = computed(() =>
  equipmentList.value.map(item => ({
    ...item,
    reserved: getReservedQuantity(item.id),
    borrowed: getBorrowedQuantity(item.id),
    available: getAvailableQuantity(item.id),
  })),
)

const filteredEquipment = computed(() =>
  equipmentWithStock.value.filter(item => {
    const query = searchQuery.value.toLowerCase()

    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)

    const matchesCategory =
      selectedCategory.value === 'All' ||
      item.category === selectedCategory.value

    const matchesStatus =
      selectedStatus.value === 'All' ||
      (selectedStatus.value === 'Available' && item.available > 0) ||
      (selectedStatus.value === 'Unavailable' && item.available === 0)

    return matchesSearch && matchesCategory && matchesStatus
  }),
)

// Inventory summary
const totalEquipment = computed(() =>
  equipmentList.value.reduce((sum, item) => sum + item.quantity, 0),
)

const totalReserved = computed(() =>
  equipmentWithStock.value.reduce((sum, item) => sum + item.reserved, 0),
)

const totalBorrowed = computed(() =>
  equipmentWithStock.value.reduce((sum, item) => sum + item.borrowed, 0),
)

const totalAvailable = computed(() =>
  equipmentWithStock.value.reduce((sum, item) => sum + item.available, 0),
)

const totalCategories = computed(() => categories.value.length - 1)

const pendingReservations = computed(() =>
  reservations.value.filter(item => item.status === 'Pending'),
)

const approvedReservations = computed(() =>
  reservations.value.filter(item => item.status === 'Approved'),
)

const filteredReservations = computed(() =>
  reservations.value.filter(item =>
    reservationStatusFilter.value === 'All'
      ? true
      : item.status === reservationStatusFilter.value,
  ),
)

// Modal states
const modalType = ref<
  'add' | 'view' | 'edit' | 'delete' | 'reservation' | null
>(null)

const selectedEquipment = ref<Equipment | null>(null)
const selectedReservation = ref<Reservation | null>(null)

const emptyEquipmentForm = (): Equipment => ({
  id: '',
  name: '',
  category: '',
  quantity: 1,
  condition: 'Good',
  location: '',
  description: '',
  remarks: '',
})

const equipmentForm = ref<Equipment>(emptyEquipmentForm())

const reservationForm = ref({
  studentName: '',
  studentId: '',
  equipmentId: '',
  quantity: 1,
  reservationDate: '',
  purpose: '',
})

function openAddModal() {
  equipmentForm.value = emptyEquipmentForm()
  modalType.value = 'add'
}

function openViewModal(item: Equipment) {
  selectedEquipment.value = item
  modalType.value = 'view'
}

function openEditModal(item: Equipment) {
  equipmentForm.value = {
    ...item,
    remarks: item.remarks ?? '',
  }
  selectedEquipment.value = item
  modalType.value = 'edit'
}

function openDeleteModal(item: Equipment) {
  selectedEquipment.value = item
  modalType.value = 'delete'
}

function openReservationModal(item?: Equipment) {
  reservationForm.value = {
    studentName: '',
    studentId: '',
    equipmentId: item?.id || '',
    quantity: 1,
    reservationDate: '',
    purpose: '',
  }

  selectedEquipment.value = item || null
  modalType.value = 'reservation'
}

function closeModal() {
  modalType.value = null
  selectedEquipment.value = null
  selectedReservation.value = null
  equipmentForm.value = emptyEquipmentForm()
}

// Add / edit equipment
function saveEquipment() {
  if (
    !equipmentForm.value.name.trim() ||
    !equipmentForm.value.category ||
    !equipmentForm.value.location.trim()
  ) return

  if (modalType.value === 'add') {
    equipmentList.value.unshift({
      ...equipmentForm.value,
      id: `EQ-${Date.now().toString().slice(-6)}`,
    })
  }

  if (modalType.value === 'edit' && selectedEquipment.value) {
    const item = selectedEquipment.value

    const reserved = getReservedQuantity(item.id)
    const borrowed = getBorrowedQuantity(item.id)

    if (equipmentForm.value.quantity < reserved + borrowed) {
      alert(
        `Quantity cannot be lower than ${reserved + borrowed} units currently reserved or borrowed.`,
      )
      return
    }

    const index = equipmentList.value.findIndex(
      equipment => equipment.id === item.id,
    )

    if (index !== -1) {
      equipmentList.value[index] = {
        ...equipmentForm.value,
        remarks: equipmentForm.value.remarks ?? '',
      }
    }
  }

  closeModal()
}

function confirmDelete() {
  if (!selectedEquipment.value) return

  const hasActiveReservations = reservations.value.some(
    reservation =>
      reservation.equipmentId === selectedEquipment.value?.id &&
      ['Pending', 'Approved', 'Borrowed'].includes(reservation.status),
  )

  if (hasActiveReservations) {
    alert('This equipment has active reservations or borrowings and cannot be deleted.')
    return
  }

  equipmentList.value = equipmentList.value.filter(
    item => item.id !== selectedEquipment.value?.id,
  )

  closeModal()
}

// Reservation actions
function submitReservation() {
  const equipment = getEquipment(reservationForm.value.equipmentId)

  if (!equipment) return

  const quantity = Number(reservationForm.value.quantity)

  if (
    !reservationForm.value.studentName.trim() ||
    !reservationForm.value.studentId.trim() ||
    !reservationForm.value.reservationDate ||
    !reservationForm.value.purpose.trim() ||
    quantity < 1
  ) {
    alert('Please complete all reservation fields.')
    return
  }

  if (quantity > getAvailableQuantity(equipment.id)) {
    alert('The requested quantity exceeds the available stock.')
    return
  }

  reservations.value.unshift({
    id: `RES-${Date.now().toString().slice(-6)}`,
    studentName: reservationForm.value.studentName.trim(),
    studentId: reservationForm.value.studentId.trim(),
    equipmentId: equipment.id,
    quantity,
    reservationDate: reservationForm.value.reservationDate,
    purpose: reservationForm.value.purpose.trim(),
    status: 'Pending',
    createdAt: new Date().toISOString(),
  })

  closeModal()
}

function approveReservation(reservation: Reservation) {
  if (reservation.status !== 'Pending') return

  const available = getAvailableQuantity(reservation.equipmentId)

  if (reservation.quantity > available) {
    alert('Not enough available stock to approve this reservation.')
    return
  }

  reservation.status = 'Approved'
}

function rejectReservation(reservation: Reservation) {
  if (reservation.status !== 'Pending') return
  reservation.status = 'Rejected'
}

function cancelReservation(reservation: Reservation) {
  if (!['Pending', 'Approved'].includes(reservation.status)) return
  reservation.status = 'Cancelled'
}

function markAsBorrowed(reservation: Reservation) {
  if (reservation.status !== 'Approved') return

  reservation.status = 'Borrowed'
}

function completeReservation(reservation: Reservation) {
  if (reservation.status !== 'Borrowed') return

  reservation.status = 'Completed'
}

function deleteReservation(reservation: Reservation) {
  const confirmed = confirm(`Delete reservation ${reservation.id}?`)
  if (!confirmed) return

  reservations.value = reservations.value.filter(
    item => item.id !== reservation.id,
  )
}

function getStatusClass(status: ReservationStatus) {
  const classes: Record<ReservationStatus, string> = {
    Pending: 'badge-warning',
    Approved: 'badge-success',
    Rejected: 'badge-error',
    Cancelled: 'badge-ghost',
    Borrowed: 'badge-info',
    Completed: 'badge-neutral',
  }

  return classes[status]
}

function getEquipmentName(id: string) {
  return getEquipment(id)?.name || 'Equipment removed'
}

// Load and save local data
onMounted(() => {
  const savedEquipment = localStorage.getItem(EQUIPMENT_KEY)
  const savedReservations = localStorage.getItem(RESERVATION_KEY)

  if (savedEquipment) {
    try {
      equipmentList.value = JSON.parse(savedEquipment).map(
        (item: Equipment) => ({
          ...item,
          remarks: item.remarks ?? '',
        }),
      )
    } catch {
      console.warn('Could not load saved equipment.')
    }
  }

  if (savedReservations) {
    try {
      reservations.value = JSON.parse(savedReservations)
    } catch {
      console.warn('Could not load saved reservations.')
    }
  }
})

watch(
  equipmentList,
  value => {
    localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(value))
  },
  { deep: true },
)

watch(
  reservations,
  value => {
    localStorage.setItem(RESERVATION_KEY, JSON.stringify(value))
  },
  { deep: true },
)
</script>

<template>
  <div class="space-y-6">

    <!-- PAGE HEADER -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          Inventory Management
        </h1>
        <p class="mt-1 text-base-content/60">
          Manage equipment, stock availability, and reservations.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="btn btn-outline" @click="openReservationModal()">
          <ClipboardList :size="18" />
          New Reservation
        </button>

        <button class="btn btn-primary" @click="openAddModal">
          <Plus :size="18" />
          Add Equipment
        </button>
      </div>
    </div>

    <!-- INVENTORY SUMMARY -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <p class="text-sm text-base-content/60">Total Equipment</p>
          <h2 class="text-3xl font-bold">{{ totalEquipment }}</h2>
          <p class="text-xs text-base-content/50">Physical units</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <p class="text-sm text-base-content/60">Available</p>
          <h2 class="text-3xl font-bold text-success">{{ totalAvailable }}</h2>
          <p class="text-xs text-base-content/50">Free stock</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <p class="text-sm text-base-content/60">Reserved</p>
          <h2 class="text-3xl font-bold text-warning">{{ totalReserved }}</h2>
          <p class="text-xs text-base-content/50">Approved reservations</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <p class="text-sm text-base-content/60">Borrowed</p>
          <h2 class="text-3xl font-bold text-info">{{ totalBorrowed }}</h2>
          <p class="text-xs text-base-content/50">Currently issued</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <p class="text-sm text-base-content/60">Categories</p>
          <h2 class="text-3xl font-bold">{{ totalCategories }}</h2>
          <p class="text-xs text-base-content/50">Equipment types</p>
        </div>
      </div>

    </div>

    <!-- INVENTORY TABLE -->
    <div class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4">

        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="relative w-full lg:max-w-sm">
            <Search
              :size="18"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
            />

            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search equipment..."
              class="input input-bordered w-full pl-10"
            />
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <select v-model="selectedCategory" class="select select-bordered w-full sm:w-48">
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category === 'All' ? 'All Categories' : category }}
              </option>
            </select>

            <select v-model="selectedStatus" class="select select-bordered w-full sm:w-40">
              <option value="All">All Stock</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Category</th>
                <th>Total</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Borrowed</th>
                <th>Condition</th>
                <th>Location</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredEquipment" :key="item.id">
                <td>
                  <div class="font-semibold">{{ item.name }}</div>
                  <div class="text-xs text-base-content/50">{{ item.id }}</div>
                </td>

                <td>{{ item.category }}</td>
                <td>{{ item.quantity }}</td>

                <td>
                  <span class="font-semibold" :class="item.available > 0 ? 'text-success' : 'text-error'">
                    {{ item.available }}
                  </span>
                </td>

                <td>
                  <span v-if="item.reserved > 0" class="badge badge-warning badge-outline">
                    {{ item.reserved }}
                  </span>
                  <span v-else class="text-base-content/40">0</span>
                </td>

                <td>
                  <span v-if="item.borrowed > 0" class="badge badge-info badge-outline">
                    {{ item.borrowed }}
                  </span>
                  <span v-else class="text-base-content/40">0</span>
                </td>

                <td>
                  <span
                    class="badge"
                    :class="item.condition === 'Good' ? 'badge-success' : 'badge-warning'"
                  >
                    {{ item.condition }}
                  </span>
                </td>

                <td>{{ item.location }}</td>

                <td>
                  <div class="flex justify-end gap-1">
                    <button class="btn btn-ghost btn-sm btn-square" title="View" @click="openViewModal(item)">
                      <Eye :size="16" />
                    </button>

                    <button class="btn btn-ghost btn-sm btn-square" title="Edit" @click="openEditModal(item)">
                      <Pencil :size="16" />
                    </button>

                    <button class="btn btn-ghost btn-sm btn-square text-error" title="Delete" @click="openDeleteModal(item)">
                      <Trash2 :size="16" />
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredEquipment.length === 0">
                <td colspan="9" class="py-12 text-center text-base-content/50">
                  No equipment found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between text-sm text-base-content/50">
          <p>Showing {{ filteredEquipment.length }} equipment records</p>
          <p>{{ totalEquipment }} total units</p>
        </div>
      </div>
    </div>

    <!-- RESERVATION MANAGEMENT -->
    <div class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4">

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="card-title">Reservation Records</h2>
            <p class="text-sm text-base-content/60">
              Review student requests and manage reservation statuses.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <div class="badge badge-warning badge-lg">
              {{ pendingReservations.length }} Pending
            </div>
            <div class="badge badge-success badge-lg">
              {{ approvedReservations.length }} Approved
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <select
            v-model="reservationStatusFilter"
            class="select select-bordered w-full sm:w-52"
          >
            <option value="All">All Reservations</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Borrowed">Borrowed</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Reservation ID</th>
                <th>Student</th>
                <th>Equipment</th>
                <th>Qty</th>
                <th>Date Needed</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="reservation in filteredReservations"
                :key="reservation.id"
              >
                <td class="font-medium">{{ reservation.id }}</td>

                <td>
                  <div class="font-semibold">{{ reservation.studentName }}</div>
                  <div class="text-xs text-base-content/50">{{ reservation.studentId }}</div>
                </td>

                <td>{{ getEquipmentName(reservation.equipmentId) }}</td>
                <td>{{ reservation.quantity }}</td>
                <td>{{ reservation.reservationDate }}</td>

                <td class="max-w-48 truncate" :title="reservation.purpose">
                  {{ reservation.purpose }}
                </td>

                <td>
                  <span class="badge" :class="getStatusClass(reservation.status)">
                    {{ reservation.status }}
                  </span>
                </td>

                <td>
                  <div class="flex flex-wrap gap-1">
                    <button
                      v-if="reservation.status === 'Pending'"
                      class="btn btn-success btn-xs"
                      title="Approve"
                      @click="approveReservation(reservation)"
                    >
                      <CheckCircle :size="14" />
                    </button>

                    <button
                      v-if="reservation.status === 'Pending'"
                      class="btn btn-error btn-xs"
                      title="Reject"
                      @click="rejectReservation(reservation)"
                    >
                      <X :size="14" />
                    </button>

                    <button
                      v-if="reservation.status === 'Approved'"
                      class="btn btn-info btn-xs"
                      title="Mark as borrowed"
                      @click="markAsBorrowed(reservation)"
                    >
                      <Package :size="14" />
                    </button>

                    <button
                      v-if="reservation.status === 'Borrowed'"
                      class="btn btn-success btn-xs"
                      title="Mark as returned"
                      @click="completeReservation(reservation)"
                    >
                      <CheckCircle :size="14" />
                    </button>

                    <button
                      v-if="['Pending', 'Approved'].includes(reservation.status)"
                      class="btn btn-ghost btn-xs"
                      title="Cancel reservation"
                      @click="cancelReservation(reservation)"
                    >
                      <X :size="14" />
                    </button>

                    <button
                      class="btn btn-ghost btn-xs text-error"
                      title="Delete record"
                      @click="deleteReservation(reservation)"
                    >
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredReservations.length === 0">
                <td colspan="8" class="py-10 text-center text-base-content/50">
                  No reservation records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <!-- MODALS -->
    <div v-if="modalType" class="modal modal-open">
      <div class="modal-box max-w-2xl">

        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-xl font-bold">
            {{
              modalType === 'add'
                ? 'Add Equipment'
                : modalType === 'view'
                  ? 'Equipment Details'
                  : modalType === 'edit'
                    ? 'Edit Equipment'
                    : modalType === 'delete'
                      ? 'Delete Equipment'
                      : 'Create Reservation'
            }}
          </h3>

          <button class="btn btn-sm btn-circle btn-ghost" @click="closeModal">
            <X :size="18" />
          </button>
        </div>

        <!-- ADD / EDIT EQUIPMENT -->
        <form
          v-if="modalType === 'add' || modalType === 'edit'"
          class="space-y-4"
          @submit.prevent="saveEquipment"
        >
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="label"><span class="label-text font-medium">Equipment Name</span></label>
              <input v-model="equipmentForm.name" type="text" placeholder="Equipment name" class="input input-bordered w-full" required />
            </div>

            <div>
              <label class="label"><span class="label-text font-medium">Category</span></label>
              <select v-model="equipmentForm.category" class="select select-bordered w-full" required>
                <option disabled value="">Select category</option>
                <option>Laboratory Equipment</option>
                <option>Glassware</option>
                <option>Medical Equipment</option>
                <option>Consumables</option>
                <option>Safety Equipment</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label class="label"><span class="label-text font-medium">Total Quantity</span></label>
              <input v-model.number="equipmentForm.quantity" type="number" min="1" class="input input-bordered w-full" required />
            </div>

            <div>
              <label class="label"><span class="label-text font-medium">Condition</span></label>
              <select v-model="equipmentForm.condition" class="select select-bordered w-full">
                <option>Good</option>
                <option>Fair</option>
                <option>Needs Repair</option>
                <option>Damaged</option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label class="label"><span class="label-text font-medium">Location</span></label>
              <input v-model="equipmentForm.location" type="text" placeholder="e.g. Laboratory 1" class="input input-bordered w-full" required />
            </div>
          </div>

          <div>
            <label class="label"><span class="label-text font-medium">Description</span></label>
            <textarea
              v-model="equipmentForm.description"
              class="textarea textarea-bordered w-full"
              rows="3"
              placeholder="Describe the equipment and its purpose..."
            />
          </div>

          <div>
            <label class="label"><span class="label-text font-medium">Remarks</span></label>
            <textarea
              v-model="equipmentForm.remarks"
              class="textarea textarea-bordered w-full"
              rows="3"
              placeholder="Additional notes about this item (optional)..."
            />
          </div>

          <div class="modal-action">
            <button type="button" class="btn btn-ghost" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <Save :size="16" />
              {{ modalType === 'add' ? 'Add Equipment' : 'Save Changes' }}
            </button>
          </div>
        </form>

        <!-- CREATE RESERVATION -->
        <form
          v-else-if="modalType === 'reservation'"
          class="space-y-4"
          @submit.prevent="submitReservation"
        >
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label class="label"><span class="label-text font-medium">Student Name</span></label>
              <input v-model="reservationForm.studentName" type="text" class="input input-bordered w-full" placeholder="Full name" required />
            </div>

            <div>
              <label class="label"><span class="label-text font-medium">Student ID</span></label>
              <input v-model="reservationForm.studentId" type="text" class="input input-bordered w-full" placeholder="Student ID" required />
            </div>

            <div class="sm:col-span-2">
              <label class="label"><span class="label-text font-medium">Equipment</span></label>
              <select v-model="reservationForm.equipmentId" class="select select-bordered w-full" required>
                <option disabled value="">Select equipment</option>
                <option
                  v-for="item in equipmentWithStock.filter(item => item.available > 0)"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }} — {{ item.available }} available
                </option>
              </select>
            </div>

            <div>
              <label class="label"><span class="label-text font-medium">Quantity</span></label>
              <input v-model.number="reservationForm.quantity" type="number" min="1" class="input input-bordered w-full" required />
            </div>

            <div>
              <label class="label"><span class="label-text font-medium">Date Needed</span></label>
              <input v-model="reservationForm.reservationDate" type="date" class="input input-bordered w-full" :min="new Date().toISOString().split('T')[0]" required />
            </div>

          </div>

          <div>
            <label class="label"><span class="label-text font-medium">Purpose</span></label>
            <textarea v-model="reservationForm.purpose" class="textarea textarea-bordered w-full" rows="3" placeholder="Why is the equipment needed?" required />
          </div>

          <div class="alert alert-info text-sm">
            <Clock :size="18" />
            Reservation requests will be submitted as Pending. Inventory will only be deducted after approval.
          </div>

          <div class="modal-action">
            <button type="button" class="btn btn-ghost" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <ClipboardList :size="16" />
              Submit Reservation
            </button>
          </div>
        </form>

        <!-- VIEW EQUIPMENT -->
        <div v-else-if="modalType === 'view' && selectedEquipment" class="space-y-5">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p class="text-sm text-base-content/50">Equipment ID</p>
              <p class="font-semibold">{{ selectedEquipment.id }}</p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Name</p>
              <p class="font-semibold">{{ selectedEquipment.name }}</p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Category</p>
              <p class="font-semibold">{{ selectedEquipment.category }}</p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Total Quantity</p>
              <p class="font-semibold">{{ selectedEquipment.quantity }}</p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Available</p>
              <p class="font-semibold text-success">{{ getAvailableQuantity(selectedEquipment.id) }}</p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Reserved</p>
              <p class="font-semibold text-warning">{{ getReservedQuantity(selectedEquipment.id) }}</p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Borrowed</p>
              <p class="font-semibold text-info">{{ getBorrowedQuantity(selectedEquipment.id) }}</p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Condition</p>
              <p class="font-semibold">{{ selectedEquipment.condition }}</p>
            </div>

            <div>
              <p class="text-sm text-base-content/50">Location</p>
              <p class="font-semibold">{{ selectedEquipment.location }}</p>
            </div>
          </div>

          <div>
            <p class="text-sm text-base-content/50">Description</p>
            <p class="mt-1">{{ selectedEquipment.description || 'No description provided.' }}</p>
          </div>

          <div>
            <p class="text-sm text-base-content/50">Remarks</p>
            <p class="mt-1">{{ selectedEquipment.remarks || 'No remarks provided.' }}</p>
          </div>

          <div class="modal-action">
            <button class="btn btn-ghost" @click="closeModal">Close</button>
            <button class="btn btn-primary" @click="openEditModal(selectedEquipment)">
              <Pencil :size="16" />
              Edit
            </button>
          </div>
        </div>

        <!-- DELETE EQUIPMENT -->
        <div v-else-if="modalType === 'delete' && selectedEquipment" class="space-y-4">
          <div class="alert alert-warning">
            Are you sure you want to delete <strong>{{ selectedEquipment.name }}</strong>?
            This cannot be undone.
          </div>

          <div class="modal-action">
            <button class="btn btn-ghost" @click="closeModal">Cancel</button>
            <button class="btn btn-error" @click="confirmDelete">
              <Trash2 :size="16" />
              Delete Equipment
            </button>
          </div>
        </div>

      </div>

      <div class="modal-backdrop" @click="closeModal">
        <button>Close</button>
      </div>
    </div>

  </div>
</template>
