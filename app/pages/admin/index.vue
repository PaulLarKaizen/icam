
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
  },
  {
    title: 'Available Equipment',
    value: '96',
    description: 'Ready for requisition',
  },
  {
    title: 'Pending Requests',
    value: '8',
    description: 'Awaiting review',
  },
  {
    title: 'Total Users',
    value: '42',
    description: 'Registered system users',
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
    <section class="space-y-2">
      <h1 class="text-2xl font-bold tracking-tight">
        Welcome back, Admin!
      </h1>

      <p class="text-base-content/60">
        Here's an overview of your laboratory inventory and equipment activity.
      </p>
    </section>

    <!-- Summary Cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in summaryCards"
        :key="card.title"
        class="card border border-base-300 bg-base-100 shadow-sm"
      >
        <div class="card-body gap-2">
          <h2 class="text-sm font-medium text-base-content/60">
            {{ card.title }}
          </h2>

          <p class="text-3xl font-bold tracking-tight">
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
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body space-y-4">
          <div>
            <h2 class="card-title text-lg">
              Inventory Overview
            </h2>
            <p class="text-sm text-base-content/60">
              Equipment status distribution
            </p>
          </div>

          <div class="space-y-4">
            <div
              v-for="item in inventoryOverview"
              :key="item.label"
              class="space-y-2"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium">{{ item.label }}</span>
                <span class="text-base-content/60">{{ item.count }}</span>
              </div>

              <div class="h-2 w-full overflow-hidden rounded-full bg-base-300">
                <div
                  :class="item.color"
                  class="h-full rounded-full"
                  :style="{ width: `${(item.count / 128) * 100}%` }"
                />
              </div>
            </div>
          </div>

          <div class="border-t border-base-300 pt-4">
            <p class="text-sm text-base-content/60">
              Total equipment tracked
            </p>
            <p class="text-2xl font-bold">
              128 <span class="text-sm font-normal text-base-content/50">items</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body space-y-4">
          <div>
            <h2 class="card-title text-lg">
              Recent Activities
            </h2>
            <p class="text-sm text-base-content/60">
              Latest inventory and transaction updates
            </p>
          </div>

          <div class="space-y-4">
            <div
              v-for="activity in recentActivities"
              :key="activity.title"
              class="flex items-start gap-3 border-b border-base-300 pb-4 last:border-0 last:pb-0"
            >
              <div class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />

              <div class="min-w-0 flex-1 space-y-1">
                <p class="text-sm font-medium">
                  {{ activity.title }}
                </p>

                <p class="text-sm text-base-content/60">
                  {{ activity.description }}
                </p>

                <p class="text-xs text-base-content/40">
                  {{ activity.time }}
                </p>
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
      class="card border border-base-300 bg-base-100 shadow-sm"
    >
      <div class="card-body gap-2">
        <h3 class="card-title text-base">
          {{ action.title }}
        </h3>

        <p class="text-sm text-base-content/60">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
