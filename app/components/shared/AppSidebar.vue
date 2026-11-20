
<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import {
  ArrowLeftRight,
  BarChart3,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Package,
  PackageSearch,
  RotateCcw,
  Settings,
  X,
} from 'lucide-vue-next'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

type SidebarItem = {
  label: string
  icon: Component
  to: string
}

const route = useRoute()

const isDashboard = computed(() => route.path === '/admin')

const navigationGroups: { label: string; items: SidebarItem[] }[] = [
  {
    label: 'Laboratory',
    items: [
      { label: 'Inventory', icon: Package, to: '/admin/inventory' },
      {
        label: 'Equipment catalog',
        icon: PackageSearch,
        to: '/admin/equipment-catalog',
      },
      {
        label: 'Requisitions',
        icon: ClipboardList,
        to: '/admin/requisitions',
      },
      {
        label: 'Availability',
        icon: CalendarClock,
        to: '/admin/availability',
      },
      {
        label: 'Borrowing',
        icon: ArrowLeftRight,
        to: '/admin/borrowing',
      },
      {
        label: 'Returns',
        icon: RotateCcw,
        to: '/admin/returns',
      },
    ],
  },
  {
    label: 'Oversight',
    items: [
      { label: 'Reports', icon: BarChart3, to: '/admin/reports' },
      { label: 'Administration', icon: Settings, to: '/admin/administration' },
    ],
  },
]

function isActive(item: SidebarItem) {
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}
</script>

<template>
  <!-- Mobile Backdrop -->
  <Transition name="sidebar-backdrop">
    <button
      v-if="open"
      type="button"
      class="fixed inset-0 z-40 cursor-default bg-neutral/50 lg:hidden"
      aria-label="Close navigation"
      @click="emit('close')"
    ></button>
  </Transition>

  <!-- Sidebar -->
  <aside
    id="app-sidebar"
    class="fixed inset-y-0 left-0 z-50 flex h-dvh w-64 max-w-[calc(100vw-2rem)] flex-col border-r border-secondary-content/10 bg-secondary text-secondary-content shadow-xl transition-[transform,visibility] duration-200 ease-out motion-reduce:transition-none lg:translate-x-0"
    :class="open ? 'visible translate-x-0' : 'invisible -translate-x-full lg:visible'"
    aria-label="Application sidebar"
  >
    <!-- Sidebar Header -->
    <div class="flex items-center justify-between border-b border-white/10 px-5 py-5">
      <div class="min-w-0">
        <p class="truncate text-xl font-bold tracking-[0.12em] text-white">
          ICAM
        </p>

        <p class="mt-1 truncate text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/60">
          St. Dominic College of Asia
        </p>
      </div>

      <button
        type="button"
        class="btn btn-ghost btn-square btn-sm text-white hover:bg-white/10 lg:hidden"
        aria-label="Close navigation"
        @click="emit('close')"
      >
        <X :size="19" aria-hidden="true" />
      </button>
    </div>

    <!-- Navigation -->
    <nav
      class="min-h-0 flex-1 overflow-y-auto px-3 py-5"
      aria-label="Primary navigation"
    >
      <!-- Workspace -->
      <p class="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/45">
        Workspace
      </p>

      <!-- Dashboard -->
      <NuxtLink
        to="/admin"
        class="flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors"
        :class="isDashboard
          ? 'border-primary bg-white/10 text-white'
          : 'border-transparent text-white/75 hover:bg-white/10 hover:text-white'"
        :aria-current="isDashboard ? 'page' : undefined"
        @click="emit('close')"
      >
        <LayoutDashboard :size="17" :stroke-width="1.8" aria-hidden="true" />
        <span>Dashboard</span>
      </NuxtLink>

      <!-- Navigation Groups -->
      <div
        v-for="group in navigationGroups"
        :key="group.label"
        class="mt-7"
      >
        <div class="mb-2 flex items-center justify-between px-3">
          <p class="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/45">
            {{ group.label }}
          </p>
        </div>

        <ul class="space-y-1">
          <li
            v-for="item in group.items"
            :key="item.label"
          >
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors"
              :class="isActive(item)
                ? 'border-primary bg-white/10 text-white'
                : 'border-transparent text-white/75 hover:bg-white/10 hover:text-white'"
              :aria-current="isActive(item) ? 'page' : undefined"
              @click="emit('close')"
            >
              <component
                :is="item.icon"
                :size="17"
                :stroke-width="1.8"
                aria-hidden="true"
              />

              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Sidebar Footer -->
    <div class="border-t border-white/10 px-5 py-4">
      <p class="text-xs font-medium text-white/85">
        Laboratory inventory
      </p>

      <p class="mt-1 text-xs text-white/50">
        Custodial accountability workspace
      </p>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-backdrop-enter-active,
.sidebar-backdrop-leave-active {
  transition: opacity 180ms ease;
}

.sidebar-backdrop-enter-from,
.sidebar-backdrop-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-backdrop-enter-active,
  .sidebar-backdrop-leave-active {
    transition: none;
  }
}
</style>
