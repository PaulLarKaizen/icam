
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Admin Dashboard',
})

useSeoMeta({
  title: 'Admin Dashboard | ICAM',
  description: 'Administrator dashboard for ICAM Laboratory Inventory Management System.',
})

interface Equipment {
  id: string
  name: string
  category: string
  quantity: number
  condition?: string
  location?: string
}

interface Reservation {
  id: string
  equipmentId: string
  equipmentName?: string
  quantity: number
  status: string
  studentName?: string
  studentId?: string
  date?: string
  purpose?: string
}

const equipmentList = ref<Equipment[]>([])
const reservations = ref<Reservation[]>([])

// Load data from Inventory localStorage
const loadDashboardData = () => {
  try {
    const savedEquipment = localStorage.getItem('icam-equipment')
    const savedReservations = localStorage.getItem('icam-reservations')

    equipmentList.value = savedEquipment
      ? JSON.parse(savedEquipment)
      : []

    reservations.value = savedReservations
      ? JSON.parse(savedReservations)
      : []
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    equipmentList.value = []
    reservations.value = []
  }
}

// Total physical equipment units
const totalEquipment = computed(() =>
  equipmentList.value.reduce(
    (total, equipment) => total + Number(equipment.quantity || 0),
    0,
  ),
)

// Units in approved reservations
const reservedEquipment = computed(() =>
  reservations.value
    .filter(reservation => reservation.status === 'Approved')
    .reduce(
      (total, reservation) => total + Number(reservation.quantity || 0),
      0,
    ),
)

// Units currently borrowed
const borrowedEquipment = computed(() =>
  reservations.value
    .filter(reservation => reservation.status === 'Borrowed')
    .reduce(
      (total, reservation) => total + Number(reservation.quantity || 0),
      0,
    ),
)

// Available equipment
const availableEquipment = computed(() =>
  Math.max(
    0,
    totalEquipment.value -
      reservedEquipment.value -
      borrowedEquipment.value,
  ),
)

// Pending reservation requests
const pendingReservations = computed(() =>
  reservations.value.filter(
    reservation => reservation.status === 'Pending',
  ).length,
)

// Equipment under maintenance
const maintenanceEquipment = computed(() =>
  equipmentList.value
    .filter(equipment =>
      equipment.condition?.toLowerCase().includes('maintenance'),
    )
    .reduce(
      (total, equipment) => total + Number(equipment.quantity || 0),
      0,
    ),
)

// Unavailable equipment
const unavailableEquipment = computed(() =>
  equipmentList.value
    .filter(equipment =>
      equipment.condition?.toLowerCase().includes('unavailable'),
    )
    .reduce(
      (total, equipment) => total + Number(equipment.quantity || 0),
      0,
    ),
)

// Summary Cards
const summaryCards = computed(() => [
  {
    title: 'Total Equipment',
    value: totalEquipment.value,
    description: 'All registered equipment units',
    accent: 'border-l-primary',
  },
  {
    title: 'Available Equipment',
    value: availableEquipment.value,
    description: 'Ready for requisition',
    accent: 'border-l-success',
  },
  {
    title: 'Reserved Equipment',
    value: reservedEquipment.value,
    description: 'Units with approved reservations',
    accent: 'border-l-warning',
  },
  {
    title: 'Borrowed Equipment',
    value: borrowedEquipment.value,
    description: 'Units currently issued',
    accent: 'border-l-info',
  },
  {
    title: 'Pending Reservations',
    value: pendingReservations.value,
    description: 'Awaiting approval',
    accent: 'border-l-error',
  },
])

// Inventory Overview
const inventoryOverview = computed(() => [
  {
    label: 'Available',
    count: availableEquipment.value,
    color: 'bg-success',
  },
  {
    label: 'Reserved',
    count: reservedEquipment.value,
    color: 'bg-warning',
  },
  {
    label: 'Borrowed',
    count: borrowedEquipment.value,
    color: 'bg-info',
  },
  {
    label: 'Under Maintenance',
    count: maintenanceEquipment.value,
    color: 'bg-warning',
  },
  {
    label: 'Unavailable',
    count: unavailableEquipment.value,
    color: 'bg-error',
  },
])

// Recent Activities (temporary demo data)
const recentActivities = [
  {
    title: 'Equipment returned',
    description: 'Microscope returned to laboratory',
    time: '10 minutes ago',
    type: 'return',
  },
  {
    title: 'New requisition submitted',
    description: 'A faculty member submitted an equipment request',
    time: '30 minutes ago',
    type: 'request',
  },
  {
    title: 'Equipment added',
    description: 'New laboratory equipment added to inventory',
    time: '1 hour ago',
    type: 'inventory',
  },
  {
    title: 'Equipment borrowed',
    description: 'Laboratory equipment issued for use',
    time: '2 hours ago',
    type: 'borrow',
  },
]

// Quick Actions
const quickActions = [
  {
    title: 'Manage Inventory',
    description: 'View and manage laboratory equipment records.',
  },
  {
    title: 'Review Requests',
    description: 'Review equipment requisitions and pending requests.',
  },
  {
    title: 'Manage Users',
    description: 'View registered users and manage their accounts.',
  },
]

// Listen for changes from another browser tab
const handleStorageChange = (event: StorageEvent) => {
  if (
    event.key === 'icam-equipment' ||
    event.key === 'icam-reservations' ||
    event.key === null
  ) {
    loadDashboardData()
  }
}

onMounted(() => {
  loadDashboardData()
  window.addEventListener('storage', handleStorageChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<template>
  <div class="space-y-6">

    <!-- Welcome Section -->
    <section
      class="relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 px-6 py-7 shadow-sm sm:px-8"
    >
      <img
        src="/images/admin/admin-sdcacampus.jpg"
        alt="St. Dominic College of Asia campus"
        class="absolute inset-0 h-full w-full object-cover object-right"
      />

      <div
        class="absolute inset-0 bg-gradient-to-r from-base-100 via-base-100/95 to-base-100/20"
      ></div>

      <div
        class="absolute left-0 top-8 bottom-8 w-1 rounded-full bg-error"
      ></div>

      <div class="relative z-10 max-w-2xl space-y-2 pl-4">
        <p class="text-sm font-semibold tracking-wide text-primary">
          ICAM ADMIN DASHBOARD
        </p>

        <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
          Welcome back, Admin! 👋
        </h1>

        <p class="max-w-xl text-sm leading-relaxed text-base-content/70 sm:text-base">
          Manage laboratory equipment, monitor requisitions, and keep track of
          inventory activities in one place.
        </p>
      </div>
    </section>

    <!-- Summary Cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <div
        v-for="card in summaryCards"
        :key="card.title"
        class="card border border-base-300 border-l-4 bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        :class="card.accent"
      >
        <div class="card-body gap-3 p-5">
          <h2 class="text-sm font-medium text-base-content/60">
            {{ card.title }}
          </h2>

          <p class="text-3xl font-bold tracking-tight text-base-content">
            {{ card.value }}
          </p>

          <p class="text-sm text-base-content/50">
            {{ card.description }}
          </p>
        </div>
      </div>
    </section>

    <!-- Inventory Overview & Recent Activities -->
    <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">

      <!-- Inventory Overview -->
      <div
        class="card border border-base-300 bg-base-100 shadow-sm transition-shadow duration-200 hover:shadow-md"
      >
        <div class="card-body gap-5 p-5 sm:p-6">

          <div>
            <h2 class="card-title text-lg font-semibold">
              Inventory Overview
            </h2>
            <p class="mt-1 text-sm text-base-content/60">
              Equipment status distribution
            </p>
          </div>

          <div class="space-y-5">
            <div
              v-for="item in inventoryOverview"
              :key="item.label"
              class="space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-base-content">
                  {{ item.label }}
                </span>

                <span class="text-sm font-semibold tabular-nums text-base-content/70">
                  {{ item.count }}
                </span>
              </div>

              <div class="h-2.5 w-full overflow-hidden rounded-full bg-base-300">
                <div
                  :class="item.color"
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: `${totalEquipment > 0
                      ? Math.min((item.count / totalEquipment) * 100, 100)
                      : 0}%`,
                  }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Total Equipment -->
          <div class="border-t border-base-300 pt-4">
            <p class="text-sm text-base-content/60">
              Total equipment tracked
            </p>

            <p class="mt-1 text-2xl font-bold tracking-tight text-base-content">
              {{ totalEquipment }}
              <span class="text-sm font-normal text-base-content/50">
                units
              </span>
            </p>
          </div>

        </div>
      </div>

      <!-- Recent Activities -->
      <div
        class="card border border-base-300 bg-base-100 shadow-sm transition-shadow duration-200 hover:shadow-md"
      >
        <div class="card-body gap-5 p-5 sm:p-6">

          <div>
            <h2 class="card-title text-lg font-semibold">
              Recent Activities
            </h2>
            <p class="mt-1 text-sm text-base-content/60">
              Latest inventory and transaction updates
            </p>
          </div>

          <div class="space-y-4">
            <div
              v-for="activity in recentActivities"
              :key="activity.title"
              class="flex items-start gap-3 border-b border-base-300 pb-4 last:border-0 last:pb-0"
            >
              <div class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary"></div>

              <div class="min-w-0 flex-1 space-y-1">
                <p class="text-sm font-medium text-base-content">
                  {{ activity.title }}
                </p>

                <p class="text-sm leading-relaxed text-base-content/60">
                  {{ activity.description }}
                </p>

                <p class="text-xs text-base-content/40">
                  {{ activity.time }}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>

    <!-- Quick Actions -->
    <section class="space-y-4">

      <div>
        <h2 class="text-lg font-semibold">
          Quick Actions
        </h2>
        <p class="text-sm text-base-content/60">
          Frequently used administrative functions
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          v-for="action in quickActions"
          :key="action.title"
          class="card border border-base-300 bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="card-body gap-3 p-5">

            <h3 class="card-title text-base">
              {{ action.title }}
            </h3>

            <p class="text-sm leading-relaxed text-base-content/60">
              {{ action.description }}
            </p>

            <div class="card-actions justify-end mt-2">
              <button
                class="btn btn-sm btn-outline"
                disabled
              >
                Coming soon
              </button>
            </div>

          </div>
        </div>
      </div>

    </section>

  </div>
</template>
