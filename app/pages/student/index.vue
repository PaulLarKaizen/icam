
<script setup lang="ts">
import {
  Package,
  ClipboardList,
  Clock,
  CheckCircle2,
  PackageSearch,
  ArrowRight,
  CalendarClock,
  Activity,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'student',
  title: 'Student Dashboard',
})

useSeoMeta({
  title: 'Student Dashboard | ICAM',
  description: 'Student laboratory equipment requisition and borrowing dashboard.',
})

const summaryCards = [
  {
    title: 'Available Equipment',
    value: '86',
    description: 'Equipment available for requisition',
    icon: Package,
    color: 'text-success',
    background: 'bg-success/10',
  },
  {
    title: 'My Active Borrowings',
    value: '2',
    description: 'Currently borrowed equipment',
    icon: Clock,
    color: 'text-warning',
    background: 'bg-warning/10',
  },
  {
    title: 'Pending Requests',
    value: '1',
    description: 'Waiting for custodian approval',
    icon: ClipboardList,
    color: 'text-info',
    background: 'bg-info/10',
  },
  {
    title: 'Completed Requests',
    value: '5',
    description: 'Successfully processed requests',
    icon: CheckCircle2,
    color: 'text-primary',
    background: 'bg-primary/10',
  },
]

const activeBorrowings = [
  {
    equipment: 'Compound Microscope',
    borrowId: 'BOR-2026-024',
    borrowedDate: 'Nov 18, 2026',
    dueDate: 'Nov 23, 2026',
    status: 'Active',
  },
  {
    equipment: 'Analytical Balance',
    borrowId: 'BOR-2026-025',
    borrowedDate: 'Nov 19, 2026',
    dueDate: 'Nov 24, 2026',
    status: 'Active',
  },
]

const recentActivity = [
  {
    title: 'Requisition submitted',
    description: 'Glassware Set',
    date: 'Nov 20, 2026',
    status: 'Pending',
  },
  {
    title: 'Equipment returned',
    description: 'Pipette Set',
    date: 'Nov 18, 2026',
    status: 'Completed',
  },
  {
    title: 'Requisition approved',
    description: 'Compound Microscope',
    date: 'Nov 17, 2026',
    status: 'Approved',
  },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome -->
    <section class="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm sm:p-8">
      <div class="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p class="text-sm font-medium text-primary">Student Workspace</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back! 👋
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-base-content/60">
            Browse laboratory equipment, submit requisitions, and keep track of your borrowed items.
          </p>
        </div>

        <NuxtLink
          to="/student/equipment"
          class="btn btn-primary"
        >
          <PackageSearch class="size-4" />
          Browse Equipment
        </NuxtLink>
      </div>
    </section>

    <!-- Summary Cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in summaryCards"
        :key="card.title"
        class="card border border-base-300 bg-base-100 shadow-sm"
      >
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">{{ card.title }}</p>
            <div class="rounded-xl p-2.5" :class="card.background">
              <component :is="card.icon" class="size-5" :class="card.color" />
            </div>
          </div>

          <h2 class="text-3xl font-bold tracking-tight">{{ card.value }}</h2>
          <p class="text-xs text-base-content/50">{{ card.description }}</p>
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="space-y-3">
      <div>
        <h2 class="text-lg font-semibold">Quick Actions</h2>
        <p class="text-sm text-base-content/60">
          What would you like to do today?
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          to="/student/equipment"
          class="card border border-base-300 bg-base-100 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <div class="card-body flex-row items-center gap-4 p-5">
            <div class="rounded-xl bg-primary/10 p-3 text-primary">
              <PackageSearch class="size-6" />
            </div>

            <div class="flex-1">
              <h3 class="font-semibold">Browse Equipment</h3>
              <p class="text-xs text-base-content/60">
                Explore available laboratory equipment
              </p>
            </div>

            <ArrowRight class="size-4 text-base-content/40" />
          </div>
        </NuxtLink>

        <NuxtLink
          to="/student/requisitions"
          class="card border border-base-300 bg-base-100 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <div class="card-body flex-row items-center gap-4 p-5">
            <div class="rounded-xl bg-info/10 p-3 text-info">
              <ClipboardList class="size-6" />
            </div>

            <div class="flex-1">
              <h3 class="font-semibold">My Requisitions</h3>
              <p class="text-xs text-base-content/60">
                View and track your equipment requests
              </p>
            </div>

            <ArrowRight class="size-4 text-base-content/40" />
          </div>
        </NuxtLink>

        <NuxtLink
          to="/student/borrowing"
          class="card border border-base-300 bg-base-100 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <div class="card-body flex-row items-center gap-4 p-5">
            <div class="rounded-xl bg-warning/10 p-3 text-warning">
              <Clock class="size-6" />
            </div>

            <div class="flex-1">
              <h3 class="font-semibold">My Borrowings</h3>
              <p class="text-xs text-base-content/60">
                Check your borrowed items and return dates
              </p>
            </div>

            <ArrowRight class="size-4 text-base-content/40" />
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Active Borrowings and Recent Activity -->
    <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <!-- Active Borrowings -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="card-title text-base">Active Borrowings</h2>
              <p class="text-xs text-base-content/60">
                Equipment currently under your account
              </p>
            </div>

            <div class="rounded-xl bg-warning/10 p-2.5 text-warning">
              <CalendarClock class="size-5" />
            </div>
          </div>

          <div
            v-for="item in activeBorrowings"
            :key="item.borrowId"
            class="rounded-xl border border-base-300 p-4"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 class="font-semibold">{{ item.equipment }}</h3>
                <p class="mt-1 text-xs text-base-content/50">
                  {{ item.borrowId }}
                </p>
              </div>

              <span class="badge badge-warning badge-outline">Active</span>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-xs text-base-content/50">Borrowed</p>
                <p class="mt-1 font-medium">{{ item.borrowedDate }}</p>
              </div>

              <div>
                <p class="text-xs text-base-content/50">Due Date</p>
                <p class="mt-1 font-medium">{{ item.dueDate }}</p>
              </div>
            </div>
          </div>

          <NuxtLink
            to="/student/borrowing"
            class="btn btn-ghost btn-sm justify-between"
          >
            View all borrowings
            <ArrowRight class="size-4" />
          </NuxtLink>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="card-title text-base">Recent Activity</h2>
              <p class="text-xs text-base-content/60">
                Your latest equipment transactions
              </p>
            </div>

            <div class="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Activity class="size-5" />
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-for="(activity, index) in recentActivity"
              :key="index"
              class="flex gap-3"
            >
              <div class="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-base-200">
                <CheckCircle2
                  v-if="activity.status === 'Completed' || activity.status === 'Approved'"
                  class="size-4 text-success"
                />
                <Clock
                  v-else
                  class="size-4 text-warning"
                />
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <p class="text-sm font-medium">{{ activity.title }}</p>

                  <span
                    class="badge badge-sm"
                    :class="{
                      'badge-warning': activity.status === 'Pending',
                      'badge-success': activity.status === 'Completed' || activity.status === 'Approved',
                    }"
                  >
                    {{ activity.status }}
                  </span>
                </div>

                <p class="mt-0.5 text-sm text-base-content/60">
                  {{ activity.description }}
                </p>

                <p class="mt-1 text-xs text-base-content/40">
                  {{ activity.date }}
                </p>
              </div>
            </div>
          </div>

          <div class="border-t border-base-300 pt-3">
            <NuxtLink
              to="/student/requisitions"
              class="btn btn-ghost btn-sm w-full justify-between"
            >
              View request history
              <ArrowRight class="size-4" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Reminder -->
    <div class="alert border border-warning/20 bg-warning/5">
      <CalendarClock class="size-5 shrink-0 text-warning" />
      <div>
        <p class="font-medium">Borrowing Reminder</p>
        <p class="text-xs text-base-content/60">
          Remember to return laboratory equipment on or before its scheduled due date.
          Keep borrowed items in good condition.
        </p>
      </div>
    </div>

    <!-- Sample Data Notice -->
    <p class="text-center text-xs text-base-content/40">
      Dashboard information is currently displayed using sample data.
    </p>
  </div>
</template>
