
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Search,
  Filter,
  Package,
  Microscope,
  Eye,
  X,
  Boxes,
  FlaskConical,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Equipment Catalog',
})

type Equipment = {
  id: string
  name: string
  category: string
  description: string
  quantity: number
  unit: string
  status: 'Available' | 'Limited' | 'Unavailable'
}

const equipmentList = ref<Equipment[]>([
  {
    id: 'EQ-001',
    name: 'Binocular Microscope',
    category: 'Microscopy',
    description: 'Compound binocular microscope for laboratory observation and specimen analysis.',
    quantity: 12,
    unit: 'units',
    status: 'Available',
  },
  {
    id: 'EQ-002',
    name: 'Digital Analytical Balance',
    category: 'Measurement',
    description: 'Precision digital balance for measuring laboratory samples.',
    quantity: 8,
    unit: 'units',
    status: 'Available',
  },
  {
    id: 'EQ-003',
    name: 'Centrifuge',
    category: 'Laboratory Equipment',
    description: 'Laboratory centrifuge for separating sample components.',
    quantity: 5,
    unit: 'units',
    status: 'Limited',
  },
  {
    id: 'EQ-004',
    name: 'Compound Microscope Slides',
    category: 'Laboratory Supplies',
    description: 'Glass microscope slides for specimen preparation and observation.',
    quantity: 150,
    unit: 'pieces',
    status: 'Available',
  },
  {
    id: 'EQ-005',
    name: 'Beaker Set',
    category: 'Glassware',
    description: 'Laboratory beakers in various capacities for mixing and preparation.',
    quantity: 30,
    unit: 'pieces',
    status: 'Available',
  },
  {
    id: 'EQ-006',
    name: 'Digital Thermometer',
    category: 'Measurement',
    description: 'Digital temperature measuring instrument for laboratory use.',
    quantity: 0,
    unit: 'units',
    status: 'Unavailable',
  },
])

const searchQuery = ref('')
const selectedCategory = ref('All Categories')
const selectedEquipment = ref<Equipment | null>(null)

const categories = computed(() => [
  'All Categories',
  ...new Set(equipmentList.value.map(item => item.category)),
])

const filteredEquipment = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return equipmentList.value.filter((item) => {
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)

    const matchesCategory =
      selectedCategory.value === 'All Categories' ||
      item.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

const totalEquipment = computed(() => equipmentList.value.length)

const totalUnits = computed(() =>
  equipmentList.value.reduce((total, item) => total + item.quantity, 0),
)

const availableCount = computed(() =>
  equipmentList.value.filter(item => item.status === 'Available').length,
)

const unavailableCount = computed(() =>
  equipmentList.value.filter(item => item.status === 'Unavailable').length,
)

function statusClass(status: Equipment['status']) {
  switch (status) {
    case 'Available':
      return 'bg-success/10 text-success'
    case 'Limited':
      return 'bg-warning/10 text-warning'
    case 'Unavailable':
      return 'bg-error/10 text-error'
  }
}
</script>

<template>
  <main class="space-y-6 p-4 sm:p-6 lg:p-8">
    <!-- Page Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="flex items-center gap-2 text-sm text-base-content/50">
          <Package :size="16" />
          <span>Laboratory</span>
          <span>/</span>
          <span class="text-base-content/70">Equipment Catalog</span>
        </div>

        <h1 class="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Equipment Catalog
        </h1>

        <p class="mt-1 text-sm text-base-content/60">
          Browse and view laboratory equipment and supplies.
        </p>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <!-- Total Catalog Items -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Catalog Items</p>
              <p class="mt-2 text-2xl font-bold">{{ totalEquipment }}</p>
            </div>

            <div class="rounded-xl bg-primary/10 p-3 text-primary">
              <Package :size="22" />
            </div>
          </div>
        </div>
      </div>

      <!-- Total Units -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Total Units</p>
              <p class="mt-2 text-2xl font-bold">{{ totalUnits }}</p>
            </div>

            <div class="rounded-xl bg-info/10 p-3 text-info">
              <Boxes :size="22" />
            </div>
          </div>
        </div>
      </div>

      <!-- Available -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Available Items</p>
              <p class="mt-2 text-2xl font-bold">{{ availableCount }}</p>
            </div>

            <div class="rounded-xl bg-success/10 p-3 text-success">
              <FlaskConical :size="22" />
            </div>
          </div>
        </div>
      </div>

      <!-- Unavailable -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Unavailable</p>
              <p class="mt-2 text-2xl font-bold">{{ unavailableCount }}</p>
            </div>

            <div class="rounded-xl bg-error/10 p-3 text-error">
              <Microscope :size="22" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Catalog Section -->
    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4 p-4 sm:p-6">
        <!-- Section Header -->
        <div>
          <h2 class="text-lg font-semibold">Equipment Listing</h2>
          <p class="text-sm text-base-content/60">
            Search and filter laboratory equipment.
          </p>
        </div>

        <!-- Search and Filters -->
        <div class="flex flex-col gap-3 md:flex-row">
          <label class="input input-bordered flex flex-1 items-center gap-2">
            <Search :size="17" class="text-base-content/50" />

            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search equipment, ID, or category..."
              class="grow"
            />
          </label>

          <label class="select select-bordered flex items-center gap-2 md:w-60">
            <Filter :size="17" class="text-base-content/50" />

            <select v-model="selectedCategory" class="w-full">
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </label>
        </div>

        <!-- Results Count -->
        <div class="flex items-center justify-between text-sm text-base-content/60">
          <p>
            Showing {{ filteredEquipment.length }} of {{ totalEquipment }} items
          </p>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-xl border border-base-300">
          <table class="table table-zebra">
            <thead>
              <tr class="text-xs uppercase text-base-content/60">
                <th>Equipment</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in filteredEquipment"
                :key="item.id"
                class="hover:bg-base-200/50"
              >
                <td>
                  <div class="flex items-center gap-3">
                    <div class="rounded-lg bg-base-200 p-2">
                      <Package :size="18" class="text-base-content/70" />
                    </div>

                    <div>
                      <p class="font-medium">{{ item.name }}</p>
                      <p class="text-xs text-base-content/50">{{ item.id }}</p>
                    </div>
                  </div>
                </td>

                <td>
                  <span class="text-sm">{{ item.category }}</span>
                </td>

                <td>
                  <span class="font-medium">{{ item.quantity }}</span>
                  <span class="ml-1 text-xs text-base-content/50">
                    {{ item.unit }}
                  </span>
                </td>

                <td>
                  <span
                    class="badge badge-sm border-0 font-medium"
                    :class="statusClass(item.status)"
                  >
                    {{ item.status }}
                  </span>
                </td>

                <td>
                  <div class="flex justify-end">
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm gap-2"
                      @click="selectedEquipment = item"
                    >
                      <Eye :size="15" />
                      View
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredEquipment.length === 0">
                <td colspan="5">
                  <div class="flex flex-col items-center justify-center py-12 text-center">
                    <Search :size="32" class="mb-3 text-base-content/30" />

                    <p class="font-medium">No equipment found</p>

                    <p class="mt-1 text-sm text-base-content/50">
                      Try adjusting your search or category filter.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Equipment Details Modal -->
    <div
      v-if="selectedEquipment"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      @click.self="selectedEquipment = null"
    >
      <div class="card w-full max-w-lg border border-base-300 bg-base-100 shadow-2xl">
        <div class="card-body p-5 sm:p-6">
          <!-- Modal Header -->
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-base-content/50">
                Equipment Details
              </p>

              <h2 class="mt-1 text-xl font-bold">
                {{ selectedEquipment.name }}
              </h2>

              <p class="mt-1 text-sm text-base-content/50">
                {{ selectedEquipment.id }}
              </p>
            </div>

            <button
              type="button"
              class="btn btn-ghost btn-sm btn-square"
              aria-label="Close details"
              @click="selectedEquipment = null"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="divider my-1"></div>

          <!-- Details -->
          <div class="space-y-4">
            <div>
              <p class="text-xs font-medium text-base-content/50">Description</p>
              <p class="mt-1 text-sm leading-relaxed">
                {{ selectedEquipment.description }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-xl bg-base-200 p-4">
                <p class="text-xs text-base-content/50">Category</p>
                <p class="mt-1 font-medium">{{ selectedEquipment.category }}</p>
              </div>

              <div class="rounded-xl bg-base-200 p-4">
                <p class="text-xs text-base-content/50">Quantity</p>
                <p class="mt-1 font-medium">
                  {{ selectedEquipment.quantity }} {{ selectedEquipment.unit }}
                </p>
              </div>
            </div>

            <div>
              <p class="text-xs font-medium text-base-content/50">Availability Status</p>

              <span
                class="badge mt-2 border-0 font-medium"
                :class="statusClass(selectedEquipment.status)"
              >
                {{ selectedEquipment.status }}
              </span>
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <button
              type="button"
              class="btn btn-primary btn-sm"
              @click="selectedEquipment = null"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
