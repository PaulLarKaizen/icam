
<script setup lang="ts">
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Boxes,
  ArrowLeftRight,
  RotateCcw,
  CalendarClock,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  FlaskConical,
} from 'lucide-vue-next'

const navigation = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/lab-custodian', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Laboratory Management',
    items: [
      { name: 'Inventory', path: '/lab-custodian/inventory', icon: Package },
      { name: 'Equipment Catalog', path: '/lab-custodian/equipment-catalog', icon: Boxes },
      { name: 'Requisitions', path: '/lab-custodian/requisitions', icon: ClipboardList },
      { name: 'Availability', path: '/lab-custodian/availability', icon: CalendarClock },
    ],
  },
  {
    label: 'Transactions',
    items: [
      { name: 'Borrowing', path: '/lab-custodian/borrowing', icon: ArrowLeftRight },
      { name: 'Returns', path: '/lab-custodian/returns', icon: RotateCcw },
    ],
  },
  {
    label: 'Other',
    items: [
      { name: 'Reports', path: '/lab-custodian/reports', icon: BarChart3 },
      { name: 'Settings', path: '/lab-custodian/settings', icon: Settings },
    ],
  },
]

const route = useRoute()
</script>

<template>
  <div class="flex min-h-screen w-full bg-base-200/60">
    <!-- Sidebar -->
    <aside class="flex w-64 min-h-screen shrink-0 flex-col border-r border-base-300 bg-base-100">
      <!-- Brand -->
      <div class="flex h-20 shrink-0 items-center gap-3 border-b border-base-300 px-6">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-content">
          <FlaskConical :size="22" />
        </div>

        <div>
          <h1 class="text-lg font-bold tracking-tight">ICAM</h1>
          <p class="text-xs text-base-content/50">Laboratory Management</p>
        </div>
      </div>

      <!-- Workspace -->
      <div class="mx-4 mt-5 rounded-xl bg-base-200 p-3">
        <p class="text-xs font-medium text-base-content/50">WORKSPACE</p>
        <p class="mt-1 text-sm font-semibold">Lab Custodian</p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        <div v-for="group in navigation" :key="group.label">
          <p class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-base-content/40">
            {{ group.label }}
          </p>

          <ul class="space-y-1">
            <li v-for="item in group.items" :key="item.path">
              <NuxtLink
                :to="item.path"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                :class="route.path === item.path
                  ? 'bg-primary text-primary-content font-medium shadow-sm'
                  : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'"
              >
                <component :is="item.icon" :size="18" />
                <span>{{ item.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Profile -->
      <div class="shrink-0 border-t border-base-300 p-4">
        <div class="flex items-center gap-3 rounded-xl p-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FlaskConical :size="20" />
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">Lab Custodian</p>
            <p class="text-xs text-base-content/50">Laboratory Staff</p>
          </div>

          <ChevronDown :size="16" class="text-base-content/40" />
        </div>
      </div>
    </aside>

    <!-- Main workspace -->
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Topbar -->
      <header class="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-base-300 bg-base-100/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
        <div>
          <p class="text-xs text-base-content/50">ICAM / Laboratory</p>
          <p class="text-sm font-semibold">Lab Custodian Workspace</p>
        </div>

        <div class="flex items-center gap-3">
          <button class="btn btn-ghost btn-sm btn-circle" aria-label="Search">
            <Search :size="19" />
          </button>

          <button class="btn btn-ghost btn-sm btn-circle relative" aria-label="Notifications">
            <Bell :size="19" />
            <span class="absolute right-1 top-1 h-2 w-2 rounded-full bg-error"></span>
          </button>

          <div class="hidden items-center gap-2 border-l border-base-300 pl-3 sm:flex">
            <div class="avatar placeholder">
              <div class="flex w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span class="text-xs font-bold">LC</span>
              </div>
            </div>

            <div>
              <p class="text-sm font-semibold">Lab Custodian</p>
              <p class="text-xs text-base-content/50">Staff Account</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
