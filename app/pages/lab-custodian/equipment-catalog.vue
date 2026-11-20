
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Search,
  Microscope,
  FlaskConical,
  Pipette,
  Scan,
  Package,
  Eye,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'lab-custodian',
  title: 'Equipment Catalog',
})

useSeoMeta({
  title: 'Equipment Catalog | ICAM',
  description: 'Browse registered laboratory equipment.',
})

interface CatalogItem {
  id: string
  name: string
  category: string
  description: string
  imageType: string
  status: string
}

const searchQuery = ref('')
const selectedCategory = ref('All Categories')

const equipment = ref<CatalogItem[]>([
  {
    id: 'EQ-001',
    name: 'Compound Microscope',
    category: 'Microscope',
    description: 'Optical instrument used to magnify specimens for laboratory examination.',
    imageType: 'microscope',
    status: 'Available',
  },
  {
    id: 'EQ-002',
    name: 'Centrifuge',
    category: 'Equipment',
    description: 'Laboratory equipment used to separate components of samples through rotation.',
    imageType: 'centrifuge',
    status: 'Available',
  },
  {
    id: 'EQ-003',
    name: 'Microscope Slides',
    category: 'Glassware',
    description: 'Glass slides used to hold specimens for microscopic examination.',
    imageType: 'slides',
    status: 'Available',
  },
  {
    id: 'EQ-004',
    name: 'Test Tube Rack',
    category: 'Laboratory Supplies',
    description: 'Rack used to organize, hold, and support test tubes during laboratory procedures.',
    imageType: 'rack',
    status: 'Borrowed',
  },
  {
    id: 'EQ-005',
    name: 'Analytical Balance',
    category: 'Equipment',
    description: 'Precision instrument used to measure the mass of laboratory samples.',
    imageType: 'balance',
    status: 'Available',
  },
  {
    id: 'EQ-006',
    name: 'Beaker Set',
    category: 'Glassware',
    description: 'Laboratory glass containers used for mixing, holding, and measuring liquids.',
    imageType: 'beaker',
    status: 'Available',
  },
  {
    id: 'EQ-007',
    name: 'Laboratory Incubator',
    category: 'Equipment',
    description: 'Equipment designed to maintain controlled temperature conditions for laboratory samples.',
    imageType: 'incubator',
    status: 'Maintenance',
  },
  {
    id: 'EQ-008',
    name: 'Pipette Set',
    category: 'Laboratory Supplies',
    description: 'Tools used to transfer and measure small volumes of liquid.',
    imageType: 'pipette',
    status: 'Available',
  },
])

const categories = computed(() => [
  'All Categories',
  ...new Set(equipment.value.map(item => item.category)),
])

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

    return matchesSearch && matchesCategory
  })
})

const categoryCount = computed(() => categories.value.length - 1)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <section class="space-y-1">
      <p class="text-sm text-base-content/50">Laboratory Management</p>
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
        Equipment Catalog
      </h1>
      <p class="text-sm text-base-content/60">
        Browse and explore registered laboratory equipment and supplies.
      </p>
    </section>

    <!-- Catalog summary -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Catalog Items</p>
              <p class="mt-2 text-3xl font-bold">{{ equipment.length }}</p>
            </div>
            <div class="rounded-xl bg-primary/10 p-3 text-primary">
              <Package :size="22" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Registered equipment entries</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Categories</p>
              <p class="mt-2 text-3xl font-bold">{{ categoryCount }}</p>
            </div>
            <div class="rounded-xl bg-info/10 p-3 text-info">
              <Scan :size="22" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Equipment classifications</p>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-base-content/60">Available Catalog</p>
              <p class="mt-2 text-3xl font-bold">{{ filteredEquipment.length }}</p>
            </div>
            <div class="rounded-xl bg-success/10 p-3 text-success">
              <FlaskConical :size="22" />
            </div>
          </div>
          <p class="text-xs text-base-content/50">Matching your search and filters</p>
        </div>
      </div>
    </section>

    <!-- Search and filters -->
    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body space-y-4 p-5">
        <div class="flex flex-col gap-3 sm:flex-row">
          <label class="input input-bordered flex flex-1 items-center gap-2">
            <Search :size="18" class="text-base-content/40" />
            <input
              v-model="searchQuery"
              type="text"
              class="grow"
              placeholder="Search equipment name, ID, or category..."
            />
          </label>

          <select
            v-model="selectedCategory"
            class="select select-bordered w-full sm:w-56"
          >
            <option v-for="category in categories" :key="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <!-- Equipment cards -->
    <section>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-semibold">Registered Equipment</h2>
        <p class="text-sm text-base-content/50">
          {{ filteredEquipment.length }} results
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="item in filteredEquipment"
          :key="item.id"
          class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <!-- Illustration area -->
          <div class="flex h-44 items-center justify-center border-b border-base-300 bg-base-200/60">
            <div class="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Microscope v-if="item.imageType === 'microscope'" :size="54" stroke-width="1.4" />
              <FlaskConical v-else-if="item.imageType === 'beaker'" :size="54" stroke-width="1.4" />
              <Pipette v-else-if="item.imageType === 'pipette'" :size="54" stroke-width="1.4" />
              <Package v-else :size="54" stroke-width="1.4" />
            </div>
          </div>

          <div class="card-body p-5">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h3 class="font-semibold">{{ item.name }}</h3>
                <p class="mt-1 text-xs text-base-content/50">{{ item.id }}</p>
              </div>

              <span
                class="badge badge-sm whitespace-nowrap"
                :class="{
                  'badge-success badge-outline': item.status === 'Available',
                  'badge-warning badge-outline': item.status === 'Borrowed',
                  'badge-error badge-outline': item.status === 'Maintenance',
                }"
              >
                {{ item.status }}
              </span>
            </div>

            <div class="mt-2">
              <span class="badge badge-ghost badge-sm">{{ item.category }}</span>
            </div>

            <p class="mt-3 min-h-12 text-sm leading-relaxed text-base-content/60">
              {{ item.description }}
            </p>

            <div class="card-actions mt-4">
              <button class="btn btn-outline btn-sm w-full">
                <Eye :size="16" />
                View Equipment Details
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty search result -->
      <div
        v-if="filteredEquipment.length === 0"
        class="rounded-xl border border-base-300 bg-base-100 py-16 text-center"
      >
        <Package :size="36" class="mx-auto text-base-content/30" />
        <h3 class="mt-3 font-semibold">No equipment found</h3>
        <p class="mt-1 text-sm text-base-content/50">
          Try another search term or category.
        </p>
      </div>
    </section>

    <!-- Notice -->
    <div class="alert border border-base-300 bg-base-100 text-base-content shadow-sm">
      <Package :size="18" class="text-info" />
      <div>
        <p class="text-sm font-medium">Equipment Catalog</p>
        <p class="text-xs text-base-content/60">
          Catalog entries are currently sample records used during frontend development.
        </p>
      </div>
    </div>
  </div>
</template>
