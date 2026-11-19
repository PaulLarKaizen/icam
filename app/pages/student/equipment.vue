
<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({
  layout: 'student',
  title: 'Equipment Catalog',
})

useSeoMeta({
  title: 'Equipment Catalog | ICAM',
  description: 'Browse available laboratory equipment for student requisitions.',
})

interface Equipment {
  id: number
  name: string
  category: string
  description: string
  available: number
  total: number
}

const searchQuery = ref('')
const selectedCategory = ref('All Categories')
const selectedAvailability = ref('All')

const equipmentList = ref<Equipment[]>([
  {
    id: 1,
    name: 'Compound Microscope',
    category: 'Microscope',
    description: 'Laboratory microscope for examining specimens.',
    available: 8,
    total: 12,
  },
  {
    id: 2,
    name: 'Analytical Balance',
    category: 'Measuring Equipment',
    description: 'Precision balance for measuring laboratory samples.',
    available: 3,
    total: 5,
  },
  {
    id: 3,
    name: 'Centrifuge',
    category: 'Laboratory Equipment',
    description: 'Equipment used for separating sample components.',
    available: 2,
    total: 4,
  },
  {
    id: 4,
    name: 'Glassware Set',
    category: 'Glassware',
    description: 'Set of laboratory glassware for experimental procedures.',
    available: 15,
    total: 20,
  },
  {
    id: 5,
    name: 'Pipette Set',
    category: 'Laboratory Equipment',
    description: 'Tools used for accurate liquid measurement and transfer.',
    available: 6,
    total: 10,
  },
  {
    id: 6,
    name: 'Test Tube Rack',
    category: 'Glassware',
    description: 'Rack for holding and organizing laboratory test tubes.',
    available: 10,
    total: 15,
  },
])

const categories = computed(() => [
  'All Categories',
  ...new Set(equipmentList.value.map(item => item.category)),
])

const filteredEquipment = computed(() => {
  return equipmentList.value.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      equipment.category.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCategory =
      selectedCategory.value === 'All Categories' ||
      equipment.category === selectedCategory.value

    const matchesAvailability =
      selectedAvailability.value === 'All' ||
      (selectedAvailability.value === 'Available' && equipment.available > 0) ||
      (selectedAvailability.value === 'Unavailable' && equipment.available === 0)

    return matchesSearch && matchesCategory && matchesAvailability
  })
})

const totalEquipment = computed(() => equipmentList.value.length)

const availableEquipment = computed(() =>
  equipmentList.value.filter(item => item.available > 0).length,
)
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold">Equipment Catalog</h1>
      <p class="text-base-content/60 mt-1">
        Browse laboratory equipment and check availability.
      </p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="card bg-base-100 border border-base-300 shadow-sm">
        <div class="card-body">
          <p class="text-sm text-base-content/60">Total Equipment Types</p>
          <h2 class="text-3xl font-bold">{{ totalEquipment }}</h2>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-300 shadow-sm">
        <div class="card-body">
          <p class="text-sm text-base-content/60">Equipment Available</p>
          <h2 class="text-3xl font-bold">{{ availableEquipment }}</h2>
        </div>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search equipment..."
            class="input input-bordered w-full"
          />

          <select
            v-model="selectedCategory"
            class="select select-bordered w-full"
          >
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>

          <select
            v-model="selectedAvailability"
            class="select select-bordered w-full"
          >
            <option value="All">All Availability</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Equipment Grid -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="equipment in filteredEquipment"
        :key="equipment.id"
        class="card bg-base-100 border border-base-300 shadow-sm"
      >
        <div class="card-body space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="card-title text-lg">
                {{ equipment.name }}
              </h2>
              <p class="text-sm text-base-content/60">
                {{ equipment.category }}
              </p>
            </div>

            <span
              class="badge"
              :class="equipment.available > 0
                ? 'badge-success badge-outline'
                : 'badge-error badge-outline'"
            >
              {{ equipment.available > 0 ? 'Available' : 'Unavailable' }}
            </span>
          </div>

          <p class="text-sm text-base-content/70">
            {{ equipment.description }}
          </p>

          <div class="flex items-center justify-between text-sm">
            <span class="text-base-content/60">Stock availability</span>
            <span class="font-semibold">
              {{ equipment.available }} / {{ equipment.total }}
            </span>
          </div>

          <progress
            class="progress progress-primary w-full"
            :value="equipment.available"
            :max="equipment.total"
          />

          <div class="card-actions justify-end pt-2">
            <NuxtLink
              :to="`/student/requisitions?equipment=${encodeURIComponent(equipment.name)}`"
              class="btn btn-primary btn-sm"
            >
              Request Equipment
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredEquipment.length === 0"
      class="card bg-base-100 border border-base-300 shadow-sm"
    >
      <div class="card-body items-center text-center py-12">
        <h2 class="text-lg font-semibold">No equipment found</h2>
        <p class="text-sm text-base-content/60">
          Try adjusting your search or filters.
        </p>
      </div>
    </div>
  </div>
</template>
