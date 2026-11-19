
<script setup lang="ts">
import {
  ArrowUpRight,
  Clock3,
  Package,
  ClipboardList,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Activity,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'lab-custodian',
  title: 'Lab Custodian Dashboard',
})

useSeoMeta({
  title: 'Lab Custodian Dashboard | ICAM',
  description: 'Manage laboratory equipment and requisitions.',
})

const summaryCards = [
  {
    title: 'Pending Requisitions',
    value: '08',
    description: 'Awaiting your review',
    icon: ClipboardList,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    title: 'Currently Borrowed',
    value: '12',
    description: 'Active transactions',
    icon: Package,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    title: 'Due for Return',
    value: '03',
    description: 'Due within 24 hours',
    icon: Clock3,
    color: 'text-error',
    bg: 'bg-error/10',
  },
  {
    title: 'Available Equipment',
    value: '86',
    description: 'Units ready for use',
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/10',
  },
]

const pendingRequisitions = [
  {
    id: 'REQ-2026-041',
    requester: 'Maria Santos',
    department: 'Medical Laboratory Science',
    equipment: 'Microscope',
    quantity: 2,
    date: 'Nov 20, 2026',
    status: 'Pending',
  },
  {
    id: 'REQ-2026-040',
    requester: 'John Reyes',
    department: 'Medical Laboratory Science',
    equipment: 'Centrifuge Tubes',
    quantity: 10,
    date: 'Nov 20, 2026',
    status: 'Pending',
  },
  {
    id: 'REQ-2026-039',
    requester: 'Angela Cruz',
    department: 'Medical Laboratory Science',
    equipment: 'Laboratory Glassware',
    quantity: 5,
    date: 'Nov 19, 2026',
    status: 'Pending',
  },
]

const returnMonitoring = [
  {
    borrower: 'Maria Santos',
    equipment: 'Compound Microscope',
    dueDate: 'Today, 2:00 PM',
    status: 'Due Today',
  },
  {
    borrower: 'John Reyes',
    equipment: 'Centrifuge',
    dueDate: 'Today, 4:30 PM',
    status: 'Due Today',
  },
  {
    borrower: 'Paolo Garcia',
    equipment: 'Test Tube Rack',
    dueDate: 'Nov 21, 2026',
    status: 'Upcoming',
  },
]

const recentActivities = [
  {
    title: 'Equipment returned',
    detail: 'Compound Microscope was returned by Maria Santos.',
    time: '10 minutes ago',
    icon: RotateCcw,
    color: 'text-success',
  },
  {
    title: 'New requisition submitted',
    detail: 'John Reyes submitted a borrowing request.',
    time: '35 minutes ago',
    icon: ClipboardList,
    color: 'text-primary',
  },
  {
    title: 'Inventory updated',
    detail: 'Laboratory Glassware quantity was updated.',
    time: '1 hour ago',
    icon: Package,
    color: 'text-info',
  },
  {
    title: 'Return reminder',
    detail: 'A borrowing transaction is approaching its due date.',
    time: '2 hours ago',
    icon: AlertTriangle,
    color: 'text-warning',
  },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome -->
    <section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p class="text-sm text-base-content/50">Thursday, November 20, 2026</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Laboratory Dashboard
        </h1>
        <p class="mt-1 text-sm text-base-content/60">
          Monitor requisitions, equipment, and laboratory transactions.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <NuxtLink
          to="/lab-custodian/requisitions"
          class="btn btn-primary btn-sm sm:btn-md"
        >
          <ClipboardList :size="17" />
          Review Requisitions
        </NuxtLink>
      </div>
    </section>

    <!-- Summary cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in summaryCards"
        :key="card.title"
        class="card border border-base-300 bg-base-100 shadow-sm"
      >
        <div class="card-body p-5">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-base-content/60">
                {{ card.title }}
              </p>
              <p class="mt-2 text-3xl font-bold tracking-tight">
                {{ card.value }}
              </p>
            </div>

            <div class="rounded-xl p-3" :class="card.bg">
              <component :is="card.icon" :size="21" :class="card.color" />
            </div>
          </div>

          <p class="mt-2 text-xs text-base-content/50">
            {{ card.description }}
          </p>
        </div>
      </div>
    </section>

    <!-- Main dashboard sections -->
    <section class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Pending requisitions -->
      <div class="card border border-base-300 bg-base-100 shadow-sm xl:col-span-2">
        <div class="card-body p-0">
          <div class="flex items-center justify-between border-b border-base-300 p-5">
            <div>
              <h2 class="font-semibold">Pending Requisitions</h2>
              <p class="mt-1 text-xs text-base-content/50">
                Requests requiring your attention
              </p>
            </div>

            <NuxtLink
              to="/lab-custodian/requisitions"
              class="btn btn-ghost btn-sm text-primary"
            >
              View All
              <ArrowUpRight :size="16" />
            </NuxtLink>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr class="text-base-content/50">
                  <th>Request</th>
                  <th>Equipment</th>
                  <th>Qty.</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="request in pendingRequisitions" :key="request.id">
                  <td>
                    <div class="font-medium">{{ request.requester }}</div>
                    <div class="text-xs text-base-content/50">
                      {{ request.id }}
                    </div>
                  </td>

                  <td>
                    <div class="text-sm">{{ request.equipment }}</div>
                    <div class="text-xs text-base-content/50">
                      {{ request.date }}
                    </div>
                  </td>

                  <td>{{ request.quantity }}</td>

                  <td>
                    <span class="badge badge-warning badge-sm badge-outline">
                      {{ request.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="border-t border-base-300 p-4">
            <NuxtLink
              to="/lab-custodian/requisitions"
              class="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:opacity-70"
            >
              Manage requisitions
              <ArrowRight :size="16" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Return monitoring -->
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-semibold">Return Monitoring</h2>
              <p class="mt-1 text-xs text-base-content/50">
                Upcoming equipment returns
              </p>
            </div>

            <div class="rounded-lg bg-warning/10 p-2 text-warning">
              <Clock3 :size="19" />
            </div>
          </div>

          <div class="mt-3 space-y-4">
            <div
              v-for="item in returnMonitoring"
              :key="item.borrower + item.equipment"
              class="border-b border-base-300 pb-4 last:border-none last:pb-0"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-sm font-medium">{{ item.equipment }}</p>
                  <p class="mt-1 text-xs text-base-content/50">
                    {{ item.borrower }}
                  </p>
                </div>

                <span
                  class="badge badge-sm whitespace-nowrap"
                  :class="item.status === 'Due Today' ? 'badge-warning' : 'badge-ghost'"
                >
                  {{ item.status }}
                </span>
              </div>

              <p class="mt-2 flex items-center gap-1.5 text-xs text-base-content/60">
                <Clock3 :size="13" />
                {{ item.dueDate }}
              </p>
            </div>
          </div>

          <NuxtLink
            to="/lab-custodian/returns"
            class="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:opacity-70"
          >
            View return records
            <ArrowRight :size="16" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Recent activities -->
    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body p-0">
        <div class="flex items-center justify-between border-b border-base-300 p-5">
          <div>
            <h2 class="font-semibold">Recent Laboratory Activities</h2>
            <p class="mt-1 text-xs text-base-content/50">
              Latest recorded activity in the laboratory
            </p>
          </div>

          <div class="rounded-lg bg-base-200 p-2 text-base-content/60">
            <Activity :size="18" />
          </div>
        </div>

        <div class="divide-y divide-base-300">
          <div
            v-for="activity in recentActivities"
            :key="activity.title + activity.time"
            class="flex items-start gap-4 p-5"
          >
            <div class="mt-0.5 rounded-lg bg-base-200 p-2">
              <component :is="activity.icon" :size="18" :class="activity.color" />
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium">{{ activity.title }}</p>
              <p class="mt-1 text-sm text-base-content/60">
                {{ activity.detail }}
              </p>
            </div>

            <p class="whitespace-nowrap text-xs text-base-content/40">
              {{ activity.time }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Notice -->
    <div class="alert border border-base-300 bg-base-100 text-base-content shadow-sm">
      <CircleAlert :size="20" class="text-info" />
      <div>
        <p class="text-sm font-medium">Dashboard overview</p>
        <p class="text-xs text-base-content/60">
          Dashboard information is currently displayed using sample data for interface development.
        </p>
      </div>
    </div>
  </div>
</template>
