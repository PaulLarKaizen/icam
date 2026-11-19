
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  Search,
  Eye,
  Package,
  CheckCircle,
  Clock,
  ArrowDownToLine,
  AlertCircle,
  X,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
  title: 'Equipment Availability',
})

useSeoMeta({
  title: 'Equipment Availability | ICAM',
  description: 'View laboratory equipment stock and availability.',
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

const defaultEquipment: Equipment[] = [
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
]

const equipmentList = ref<Equipment[]>([...defaultEquipment])
const reservations = ref<Reservation[]>([])

const searchQuery = ref('')
const selectedCategory = ref('All')
const selectedEquipment = ref<Equipment | null>(null)

onMounted(() => {
  try {
    const savedEquipment = localStorage.getItem(EQUIPMENT_KEY)
    const savedReservations = localStorage.getItem(RESERVATION_KEY)

    if (savedEquipment !== null) {
      const parsedEquipment = JSON.parse(savedEquipment)
      if (Array.isArray(parsedEquipment)) {
        equipmentList.value = parsedEquipment
      }
    }

    if (savedReservations !== null) {
      const parsedReservations = JSON.parse(savedReservations)
      if (Array.isArray(parsedReservations)) {
        reservations.value = parsedReservations
      }
    }
  } catch (error) {
    console.error('Unable to load availability data:', error)
  }
})

const categories = computed(() => [
  'All',
  ...new Set(equipmentList.value.map(item => item.category)),
])

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

function getAvailableQuantity(equipment: Equipment) {
  return Math.max(
    0,
    equipment.quantity -
      getReservedQuantity(equipment.id) -
      getBorrowedQuantity(equipment.id),
  )
}

function getAvailabilityStatus(equipment: Equipment) {
  const available = getAvailableQuantity(equipment)

  if (equipment.quantity <= 0) return 'Out of Stock'
  if (available <= 0) return 'Fully Allocated'
  return 'Available'
}

const equipmentWithStock = computed(() =>
  equipmentList.value.map(item => ({
    ...item,
    reserved: getReservedQuantity(item.id),
    borrowed: getBorrowedQuantity(item.id),
    available: getAvailableQuantity(item),
    availabilityStatus: getAvailabilityStatus(item),
  })),
)

const filteredEquipment = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return equipmentWithStock.value.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)

    const matchesCategory =
      selectedCategory.value === 'All' ||
      item.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

const totalEquipment = computed(() => equipmentList.value.length)

const totalUnits = computed(() =>
  equipmentList.value.reduce((total, item) => total + item.quantity, 0),
)

const totalAvailable = computed(() =>
  equipmentWithStock.value.reduce((total, item) => total + item.available, 0),
)

const totalReserved = computed(() =>
  equipmentWithStock.value.reduce((total, item) => total + item.reserved, 0),
)

const totalBorrowed = computed(() =>
  equipmentWithStock.value.reduce((total, item) => total + item.borrowed, 0),
)

function viewEquipment(equipment: Equipment) {
  selectedEquipment.value = equipment
}

function closeDetails() {
  selectedEquipment.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <p class="text-sm font-medium text-emerald-500">
        Laboratory Management
      </p>
      <h1 class="mt-1 text-2xl font-bold text-base-content">
        Equipment Availability
      </h1>
      <p class="mt-2 text-sm text-base-content/60">
        Monitor available, reserved, and borrowed laboratory equipment.
      </p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-xl border border-base-300 bg-base-100 p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-base-content/60">Equipment Types</p>
          <Package class="h-5 w-5 text-emerald-500" />
        </div>
        <p class="mt-3 text-2xl font-bold">{{ totalEquipment }}</p>
        <p class="mt-1 text-xs text-base-content/50">Registered equipment records</p>
      </div>

      <div class="rounded-xl border border-base-300 bg-base-100 p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-base-content/60">Available Units</p>
          <CheckCircle class="h-5 w-5 text-success" />
        </div>
        <p class="mt-3 text-2xl font-bold text-success">{{ totalAvailable }}</p>
        <p class="mt-1 text-xs text-base-content/50">Currently available for requests</p>
      </div>

      <div class="rounded-xl border border-base-300 bg-base-100 p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-base-content/60">Reserved Units</p>
          <Clock class="h-5 w-5 text-warning" />
        </div>
        <p class="mt-3 text-2xl font-bold text-warning">{{ totalReserved }}</p>
        <p class="mt-1 text-xs text-base-content/50">Approved reservations</p>
      </div>

      <div class="rounded-xl border border-base-300 bg-base-100 p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-base-content/60">Borrowed Units</p>
          <ArrowDownToLine class="h-5 w-5 text-info" />
        </div>
        <p class="mt-3 text-2xl font-bold text-info">{{ totalBorrowed }}</p>
        <p class="mt-1 text-xs text-base-content/50">Currently borrowed equipment</p>
      </div>
    </div>

    <!-- Availability Table -->
    <div class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <div class="border-b border-base-300 p-5">
        <div>
          <h2 class="text-lg font-semibold">Equipment Stock Overview</h2>
          <p class="mt-1 text-sm text-base-content/60">
            View current stock levels and equipment allocation.
          </p>
        </div>

        <!-- Search and Filters -->
        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
          <label class="input input-bordered flex w-full items-center gap-2 sm:max-w-sm">
            <Search class="h-4 w-4 text-base-content/50" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search equipment..."
              class="grow"
            />
          </label>

          <select
            v-model="selectedCategory"
            class="select select-bordered w-full sm:max-w-xs"
          >
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category === 'All' ? 'All Categories' : category }}
            </option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr class="text-xs uppercase text-base-content/60">
              <th>Equipment</th>
              <th>Category</th>
              <th>Total Stock</th>
              <th>Available</th>
              <th>Reserved</th>
              <th>Borrowed</th>
              <th>Status</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in filteredEquipment"
              :key="item.id"
              class="hover"
            >
              <td>
                <p class="font-medium">{{ item.name }}</p>
                <p class="text-xs text-base-content/50">{{ item.id }}</p>
              </td>

              <td class="text-sm">{{ item.category }}</td>

              <td class="font-medium">{{ item.quantity }}</td>

              <td>
                <span class="font-semibold text-success">
                  {{ item.available }}
                </span>
              </td>

              <td>{{ item.reserved }}</td>

              <td>{{ item.borrowed }}</td>

              <td>
                <span
                  v-if="item.availabilityStatus === 'Available'"
                  class="badge badge-success badge-soft"
                >
                  Available
                </span>

                <span
                  v-else-if="item.availabilityStatus === 'Fully Allocated'"
                  class="badge badge-warning badge-soft"
                >
                  Fully Allocated
                </span>

                <span
                  v-else
                  class="badge badge-error badge-soft"
                >
                  Out of Stock
                </span>
              </td>

              <td class="text-right">
                <button
                  class="btn btn-ghost btn-sm"
                  title="View equipment details"
                  @click="viewEquipment(item)"
                >
                  <Eye class="h-4 w-4" />
                  <span class="hidden sm:inline">View</span>
                </button>
              </td>
            </tr>

            <tr v-if="filteredEquipment.length === 0">
              <td colspan="8" class="py-12 text-center">
                <AlertCircle class="mx-auto h-8 w-8 text-base-content/30" />
                <p class="mt-3 font-medium">No equipment found</p>
                <p class="mt-1 text-sm text-base-content/50">
                  Try changing your search or category filter.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="border-t border-base-300 px-5 py-3">
        <p class="text-xs text-base-content/50">
          Showing {{ filteredEquipment.length }} of {{ totalEquipment }} equipment records
        </p>
      </div>
    </div>

    <!-- Equipment Details Modal -->
    <div
      v-if="selectedEquipment"
      class="modal modal-open"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-box max-w-lg">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-emerald-500">
              Equipment Details
            </p>
            <h3 class="mt-1 text-xl font-bold">
              {{ selectedEquipment.name }}
            </h3>
            <p class="mt-1 text-sm text-base-content/50">
              {{ selectedEquipment.id }}
            </p>
          </div>

          <button
            class="btn btn-ghost btn-sm btn-circle"
            aria-label="Close details"
            @click="closeDetails"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="mt-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-base-content/50">Category</p>
              <p class="mt-1 text-sm font-medium">{{ selectedEquipment.category }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/50">Condition</p>
              <p class="mt-1 text-sm font-medium">{{ selectedEquipment.condition }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/50">Total Quantity</p>
              <p class="mt-1 text-sm font-medium">{{ selectedEquipment.quantity }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/50">Location</p>
              <p class="mt-1 text-sm font-medium">{{ selectedEquipment.location }}</p>
            </div>
          </div>

          <div class="rounded-lg bg-base-200 p-4">
            <p class="text-sm font-semibold">Equipment Description</p>
            <p class="mt-2 text-sm text-base-content/70">
              {{ selectedEquipment.description || 'No description available.' }}
            </p>
          </div>

          <div>
            <p class="text-xs text-base-content/50">Remarks</p>
            <p class="mt-1 text-sm">
              {{ selectedEquipment.remarks || 'No remarks.' }}
            </p>
          </div>

          <div class="divider">Current Stock</div>

          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="rounded-lg bg-success/10 p-3">
              <p class="text-xl font-bold text-success">
                {{ getAvailableQuantity(selectedEquipment) }}
              </p>
              <p class="text-xs text-base-content/60">Available</p>
            </div>

            <div class="rounded-lg bg-warning/10 p-3">
              <p class="text-xl font-bold text-warning">
                {{ getReservedQuantity(selectedEquipment.id) }}
              </p>
              <p class="text-xs text-base-content/60">Reserved</p>
            </div>

            <div class="rounded-lg bg-info/10 p-3">
              <p class="text-xl font-bold text-info">
                {{ getBorrowedQuantity(selectedEquipment.id) }}
              </p>
              <p class="text-xs text-base-content/60">Borrowed</p>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-outline" @click="closeDetails">
            Close
          </button>
        </div>
      </div>

      <div class="modal-backdrop" @click="closeDetails"></div>
    </div>
  </div>
</template>
