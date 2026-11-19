
<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'Admin Dashboard',
})

useSeoMeta({
  title: 'Admin Dashboard | ICAM',
  description: 'Administrator dashboard for ICAM Laboratory Inventory Management System.',
})

const summaryCards = [
  {
    title: 'Total Equipment',
    value: '128',
    description: 'All registered equipment',
    accent: 'border-l-primary',
  },
  {
    title: 'Available Equipment',
    value: '96',
    description: 'Ready for requisition',
    accent: 'border-l-success',
  },
  {
    title: 'Pending Requests',
    value: '8',
    description: 'Awaiting review',
    accent: 'border-l-error',
  },
  {
    title: 'Total Users',
    value: '42',
    description: 'Registered system users',
    accent: 'border-l-info',
  },
]

const inventoryOverview = [
  {
    label: 'Available',
    count: 96,
    color: 'bg-success',
  },
  {
    label: 'Borrowed',
    count: 22,
    color: 'bg-info',
  },
  {
    label: 'Under Maintenance',
    count: 6,
    color: 'bg-warning',
  },
  {
    label: 'Unavailable',
    count: 4,
    color: 'bg-error',
  },
]

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
</script>

<template>
  <div class="space-y-6">

    <!-- Welcome Section -->
    <section
      class="relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 px-6 py-7 shadow-sm sm:px-8"
    >
      <!-- Campus Image -->
      <img
        src="/images/admin/admin-sdcacampus.jpg"
        alt="St. Dominic College of Asia campus"
        class="absolute inset-0 h-full w-full object-cover object-right"
      />

      <!-- Image Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-base-100 via-base-100/95 to-base-100/20"
      ></div>

      <!-- Red Accent -->
      <div
        class="absolute left-0 top-8 bottom-8 w-1 rounded-full bg-error"
      ></div>

      <!-- Welcome Content -->
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
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in summaryCards"
        :key="card.title"
        class="card border border-base-300 border-l-4 bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        :class="card.accent"
      >
        <div class="card-body gap-3 p-5">
          <!-- Card Label -->
          <h2 class="text-sm font-medium text-base-content/60">
            {{ card.title }}
          </h2>

          <!-- Card Value -->
          <p class="text-3xl font-bold tracking-tight text-base-content">
            {{ card.value }}
          </p>

          <!-- Card Description -->
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

          <!-- Header -->
          <div>
            <h2 class="card-title text-lg font-semibold">
              Inventory Overview
            </h2>
            <p class="mt-1 text-sm text-base-content/60">
              Equipment status distribution
            </p>
          </div>

          <!-- Inventory Status -->
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

              <!-- Progress Bar -->
              <div class="h-2.5 w-full overflow-hidden rounded-full bg-base-300">
                <div
                  :class="item.color"
                  class="h-full rounded-full transition-all duration-500"
                  :style="{ width: `${(item.count / 128) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Total Equipment -->
          <div class="border-t border-base-300 pt-4">
            <div>
              <p class="text-sm text-base-content/60">
                Total equipment tracked
              </p>

              <p class="mt-1 text-2xl font-bold tracking-tight text-base-content">
                128
                <span class="text-sm font-normal text-base-content/50">
                  items
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>

      <!-- Recent Activities -->
      <div
        class="card border border-base-300 bg-base-100 shadow-sm transition-shadow duration-200 hover:shadow-md"
      >
        <div class="card-body gap-5 p-5 sm:p-6">

          <!-- Header -->
          <div>
            <h2 class="card-title text-lg font-semibold">
              Recent Activities
            </h2>
            <p class="mt-1 text-sm text-base-content/60">
              Latest inventory and transaction updates
            </p>
          </div>

          <!-- Activity List -->
          <div class="space-y-4">
            <div
              v-for="activity in recentActivities"
              :key="activity.title"
              class="flex items-start gap-3 border-b border-base-300 pb-4 last:border-0 last:pb-0"
            >
              <!-- Activity Indicator -->
              <div class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary"></div>

              <!-- Activity Details -->
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

      <!-- Header -->
      <div>
        <h2 class="text-lg font-semibold">
          Quick Actions
        </h2>
        <p class="text-sm text-base-content/60">
          Frequently used administrative functions
        </p>
      </div>

      <!-- Action Cards -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          v-for="action in quickActions"
          :key="action.title"
          class="card border border-base-300 bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="card-body gap-3 p-5">

            <!-- Action Title -->
            <h3 class="card-title text-base">
              {{ action.title }}
            </h3>

            <!-- Action Description -->
            <p class="text-sm leading-relaxed text-base-content/60">
              {{ action.description }}
            </p>

            <!-- Action Button -->
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
