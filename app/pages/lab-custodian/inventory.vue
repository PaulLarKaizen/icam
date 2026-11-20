
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Search,
  Plus,
  Package,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Eye,
  Pencil,
  SlidersHorizontal,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'lab-custodian',
  title: 'Inventory Management',
})

useSeoMeta({
  title: 'Inventory | ICAM',
  description: 'Manage laboratory equipment inventory and availability.',
})

interface Equipment {
  id: string
  name: string
  category: string
  totalQuantity: number
  availableQuantity: number
  condition: string
  status: string
}

const searchQuery = ref('')
const selectedCategory = ref('All Categories')
const selectedStatus = ref('All Statuses')

const equipmentList = ref<Equipment[]>([
  {
    id: 'EQ-001',
    name: 'Compound Microscope',
    category: 'Microscope',
    totalQuantity: 15,
    availableQuantity: 10,
    condition: 'Good',
    status: 'Available',
  },
  {
    id: 'EQ-002',
    name: 'Centrifuge',
    category: 'Equipment',
    totalQuantity: 8,
    availableQuantity: 5,
    condition: 'Good',
    status: 'Available',
  },
  {
    id: 'EQ-003',
    name: 'Microscope Slides',
    category: 'Glassware',
    totalQuantity: 100,
    availableQuantity: 65,
    condition: 'Good',
    status: 'Available',
  },
  {
    id: 'EQ-004',
    name: 'Test Tube Rack',
    category: 'Laboratory Supplies',
    totalQuantity: 20,
    availableQuantity: 0,
    condition: 'Good',
    status: 'Borrowed',
  },
  {
    id: 'EQ-005',
    name: 'Analytical Balance',
    category: 'Equipment',
    totalQuantity: 3,
    availableQuantity: 1,
    condition: 'Needs Inspection',
    status: 'Available',
  },
  {
    id: 'EQ-006',
    name: 'Beaker Set',
    category: 'Glassware',
    totalQuantity: 25,
    availableQuantity: 18,
    condition: 'Good',
    status: 'Available',
  },
  {
    id: 'EQ-007',
    name: 'Laboratory Incubator',
    category: 'Equipment',
    totalQuantity: 4,
    availableQuantity: 0,
    condition: 'Under Maintenance',
    status: 'Maintenance',
  },
  {
    id: 'EQ-008',
    name: 'Pipette Set',
    category: 'Laboratory Supplies',
    totalQuantity: 12,
    availableQuantity: 7,
    condition: 'Good',
    status: 'Available',
  },
])

const categories = computed(() => [
  'All Categories',
  ...new Set(equipmentList.value.map(item => item.category)),
])

const filteredEquipment = computed(() => {
  return equipmentList.value.filter((item) => {
    const query = searchQuery.value.toLowerCase().trim()

    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)

    const matchesCategory =
      selectedCategory.value === 'All Categories' ||
      item.category === selectedCategory.value

    const matchesStatus =
      selectedStatus.value === 'All Statuses' ||
      item.status === selectedStatus.value

    return matchesSearch && matchesCategory && matchesStatus
  })
})

const totalEquipment = computed(() =>
  equipmentList.value.reduce((total, item) => total + item.totalQuantity, 0),
)

const totalAvailable = computed(() =>
  equipmentList.value.reduce((total, item) => total + item.availableQuantity, 0),
)

const maintenanceCount = computed(() =>
  equipmentList.value.filter(item => item.status === 'Maintenance').length,
)

const unavailableCount = computed(() =>
  equipmentList.value.filter(item => item.condition !== 'Good').length,
)

function getStatusClass(status: string) {
  switch (status) {
    case 'Available':
      return 'badge-success badge-outline'
    case 'Borrowed':
      return 'badge-warning badge-outline'
    case 'Maintenance':
      return 'badge-error badge-outline'
    default:
      return 'badge-ghost'
  }
}

function getConditionClass(condition: string) {
  return condition === 'Good'
    ? 'text-success'
    : 'text-warning'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p class="text-sm text-base-content/50">Laboratory Management</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Inventory Management
        </h1>
        <p class="mt-1 text-sm text-base-content/60">
          Monitor equipment quantities, availability, and condition.
        </p>
      </div>

      <button class="btn btn-primary">
        <Plus :size="18" />
        Add Equipment
      </button>
    </section>

    <!-- Summary cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Total Units</p>
              <p class="mt-2 text-3xl font-bold">{{ totalEquipment }}</p>
            </div>
            <div class="rounded-xl bg-primary/10 p-3 text-primary">
              <Package :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Registered inventory units</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Available Units</p>
              <p class="mt-2 text-3xl font-bold">{{ totalAvailable }}</p>
            </div>
            <div class="rounded-xl bg-success/10 p-3 text-success">
              <CheckCircle2 :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Ready for requisition</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Needs Attention</p>
              <p class="mt-2 text-3xl font-bold">{{ unavailableCount }}</p>
            </div>
            <div class="rounded-xl bg-warning/10 p-3 text-warning">
              <AlertTriangle :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Equipment condition concerns</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Under Maintenance</p>
              <p class="mt-2 text-3xl font-bold">{{ maintenanceCount }}</p>
            </div>
            <div class="rounded-xl bg-error/10 p-3 text-error">
              <Wrench :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Currently unavailable</p>
        </div>
      </div>
    </section>

    <!-- Inventory table -->
    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4 p-5">
        <!-- Table heading -->
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-lg font-semibold">Equipment Inventory</h2>
            <p class="mt-1 text-sm text-base-content/50">
              {{ filteredEquipment.length }} equipment records displayed
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
              placeholder="Search equipment name, ID, or category..."
            />
          </label>

          <div class="flex flex-col gap-3 sm:flex-row">
            <select
              v-model="selectedCategory"
              class="select select-bordered w-full sm:w-48"
            >
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>

            <select
              v-model="selectedStatus"
              class="select select-bordered w-full sm:w-44"
            >
              <option>All Statuses</option>
              <option>Available</option>
              <option>Borrowed</option>
              <option>Maintenance</option>
            </select>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-lg border border-base-300">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="text-xs uppercase text-base-content/50">
                <th>Equipment</th>
                <th>Category</th>
                <th>Total Qty.</th>
                <th>Available</th>
                <th>Condition</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredEquipment" :key="item.id">
                <td class="min-w-48">
                  <p class="font-medium">{{ item.name }}</p>
                  <p class="mt-1 text-xs text-base-content/50">{{ item.id }}</p>
                </td>

                <td class="whitespace-nowrap">{{ item.category }}</td>

                <td>{{ item.totalQuantity }}</td>

                <td>
                  <span class="font-medium">{{ item.availableQuantity }}</span>
                  <span class="text-xs text-base-content/40">
                    / {{ item.totalQuantity }}
                  </span>
                </td>

                <td>
                  <span class="text-sm font-medium" :class="getConditionClass(item.condition)">
                    {{ item.condition }}
                  </span>
                </td>

                <td>
                  <span class="badge badge-sm" :class="getStatusClass(item.status)">
                    {{ item.status }}
                  </span>
                </td>

                <td>
                  <div class="flex justify-end gap-1">
                    <button class="btn btn-ghost btn-xs btn-square" title="View Details">
                      <Eye :size="16" />
                    </button>
                    <button class="btn btn-ghost btn-xs btn-square" title="Edit Equipment">
                      <Pencil :size="16" />
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredEquipment.length === 0">
                <td colspan="7" class="py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-base-content/40">
                    <SlidersHorizontal :size="28" />
                    <p class="font-medium">No equipment found</p>
                    <p class="text-sm">Try adjusting your search or filters.</p>
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
        <p class="text-sm font-medium">Sample Inventory Data</p>
        <p class="text-xs text-base-content/60">
          Inventory records are currently for interface testing only and are not connected to the ICAM database.
        </p>
      </div>
    </div>
  </div>
</template>
