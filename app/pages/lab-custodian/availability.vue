
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Search,
  CheckCircle2,
  ArrowLeftRight,
  AlertTriangle,
  Package,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'lab-custodian',
  title: 'Equipment Availability',
})

useSeoMeta({
  title: 'Availability | ICAM',
  description: 'Monitor laboratory equipment availability and quantities.',
})

interface EquipmentAvailability {
  id: string
  name: string
  category: string
  total: number
  available: number
  borrowed: number
  unavailable: number
}

const searchQuery = ref('')
const selectedCategory = ref('All Categories')
const selectedAvailability = ref('All Availability')

const equipment = ref<EquipmentAvailability[]>([
  {
    id: 'EQ-001',
    name: 'Compound Microscope',
    category: 'Microscope',
    total: 15,
    available: 10,
    borrowed: 4,
    unavailable: 1,
  },
  {
    id: 'EQ-002',
    name: 'Centrifuge',
    category: 'Equipment',
    total: 8,
    available: 5,
    borrowed: 3,
    unavailable: 0,
  },
  {
    id: 'EQ-003',
    name: 'Microscope Slides',
    category: 'Glassware',
    total: 100,
    available: 65,
    borrowed: 30,
    unavailable: 5,
  },
  {
    id: 'EQ-004',
    name: 'Test Tube Rack',
    category: 'Laboratory Supplies',
    total: 20,
    available: 0,
    borrowed: 20,
    unavailable: 0,
  },
  {
    id: 'EQ-005',
    name: 'Analytical Balance',
    category: 'Equipment',
    total: 3,
    available: 1,
    borrowed: 1,
    unavailable: 1,
  },
  {
    id: 'EQ-006',
    name: 'Beaker Set',
    category: 'Glassware',
    total: 25,
    available: 18,
    borrowed: 5,
    unavailable: 2,
  },
  {
    id: 'EQ-007',
    name: 'Laboratory Incubator',
    category: 'Equipment',
    total: 4,
    available: 0,
    borrowed: 0,
    unavailable: 4,
  },
  {
    id: 'EQ-008',
    name: 'Pipette Set',
    category: 'Laboratory Supplies',
    total: 12,
    available: 7,
    borrowed: 4,
    unavailable: 1,
  },
])

const categories = computed(() => [
  'All Categories',
  ...new Set(equipment.value.map(item => item.category)),
])

const totalUnits = computed(() =>
  equipment.value.reduce((sum, item) => sum + item.total, 0),
)

const totalAvailable = computed(() =>
  equipment.value.reduce((sum, item) => sum + item.available, 0),
)

const totalBorrowed = computed(() =>
  equipment.value.reduce((sum, item) => sum + item.borrowed, 0),
)

const totalUnavailable = computed(() =>
  equipment.value.reduce((sum, item) => sum + item.unavailable, 0),
)

function getAvailability(item: EquipmentAvailability) {
  if (item.unavailable === item.total) return 'Unavailable'
  if (item.available === 0 && item.borrowed > 0) return 'Fully Borrowed'
  if (item.available < item.total) return 'Partially Available'
  return 'Available'
}

const filteredEquipment = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return equipment.value.filter(item => {
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)

    const matchesCategory =
      selectedCategory.value === 'All Categories' ||
      item.category === selectedCategory.value

    const availability = getAvailability(item)

    const matchesAvailability =
      selectedAvailability.value === 'All Availability' ||
      availability === selectedAvailability.value

    return matchesSearch && matchesCategory && matchesAvailability
  })
})

function getAvailabilityClass(status: string) {
  switch (status) {
    case 'Available':
      return 'badge-success badge-outline'
    case 'Partially Available':
      return 'badge-info badge-outline'
    case 'Fully Borrowed':
      return 'badge-warning badge-outline'
    case 'Unavailable':
      return 'badge-error badge-outline'
    default:
      return 'badge-ghost'
  }
}

function getAvailabilityPercentage(item: EquipmentAvailability) {
  if (!item.total) return 0
  return Math.round((item.available / item.total) * 100)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <section>
      <p class="text-sm text-base-content/50">Laboratory Management</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        Equipment Availability
      </h1>
      <p class="mt-1 text-sm text-base-content/60">
        Monitor available, borrowed, and unavailable laboratory equipment.
      </p>
    </section>

    <!-- Summary Cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Total Units</p>
              <p class="mt-2 text-3xl font-bold">{{ totalUnits }}</p>
            </div>
            <div class="rounded-xl bg-primary/10 p-3 text-primary">
              <Package :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">All registered units</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Available</p>
              <p class="mt-2 text-3xl font-bold">{{ totalAvailable }}</p>
            </div>
            <div class="rounded-xl bg-success/10 p-3 text-success">
              <CheckCircle2 :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Ready for use or requisition</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Borrowed</p>
              <p class="mt-2 text-3xl font-bold">{{ totalBorrowed }}</p>
            </div>
            <div class="rounded-xl bg-warning/10 p-3 text-warning">
              <ArrowLeftRight :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Currently issued units</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Unavailable</p>
              <p class="mt-2 text-3xl font-bold">{{ totalUnavailable }}</p>
            </div>
            <div class="rounded-xl bg-error/10 p-3 text-error">
              <AlertTriangle :size="21" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Damaged or restricted units</p>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4 p-5">
        <div class="flex flex-col gap-3 lg:flex-row">
          <label class="input input-bordered flex flex-1 items-center gap-2">
            <Search :size="18" class="text-base-content/40" />
            <input
              v-model="searchQuery"
              type="text"
              class="grow"
              placeholder="Search equipment, ID, or category..."
            />
          </label>

          <div class="flex flex-col gap-3 sm:flex-row">
            <select
              v-model="selectedCategory"
              class="select select-bordered w-full sm:w-48"
            >
              <option v-for="category in categories" :key="category">
                {{ category }}
              </option>
            </select>

            <select
              v-model="selectedAvailability"
              class="select select-bordered w-full sm:w-52"
            >
              <option>All Availability</option>
              <option>Available</option>
              <option>Partially Available</option>
              <option>Fully Borrowed</option>
              <option>Unavailable</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Availability Table -->
    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4 p-5">
        <div>
          <h2 class="text-lg font-semibold">Equipment Availability Records</h2>
          <p class="mt-1 text-sm text-base-content/50">
            {{ filteredEquipment.length }} equipment records displayed
          </p>
        </div>

        <div class="overflow-x-auto rounded-lg border border-base-300">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="text-xs uppercase text-base-content/50">
                <th>Equipment</th>
                <th>Total</th>
                <th>Available</th>
                <th>Borrowed</th>
                <th>Unavailable</th>
                <th>Availability</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredEquipment" :key="item.id">
                <td class="min-w-44">
                  <p class="font-medium">{{ item.name }}</p>
                  <p class="mt-1 text-xs text-base-content/50">
                    {{ item.id }} · {{ item.category }}
                  </p>
                </td>

                <td>{{ item.total }}</td>

                <td class="font-medium text-success">
                  {{ item.available }}
                </td>

                <td>{{ item.borrowed }}</td>

                <td class="text-error">
                  {{ item.unavailable }}
                </td>

                <td class="min-w-36">
                  <div class="flex items-center gap-2">
                    <progress
                      class="progress progress-primary w-20"
                      :value="getAvailabilityPercentage(item)"
                      max="100"
                    />
                    <span class="text-xs text-base-content/60">
                      {{ getAvailabilityPercentage(item) }}%
                    </span>
                  </div>
                </td>

                <td>
                  <span
                    class="badge badge-sm whitespace-nowrap"
                    :class="getAvailabilityClass(getAvailability(item))"
                  >
                    {{ getAvailability(item) }}
                  </span>
                </td>
              </tr>

              <tr v-if="filteredEquipment.length === 0">
                <td colspan="7" class="py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-base-content/40">
                    <Search :size="28" />
                    <p class="font-medium">No equipment found</p>
                    <p class="text-sm">Try changing your search or filters.</p>
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
        <p class="text-sm font-medium">Sample Availability Records</p>
        <p class="text-xs text-base-content/60">
          The displayed quantities are sample data for frontend development and are not yet synchronized with requisitions or borrowing transactions.
        </p>
      </div>
    </div>
  </div>
</template>
