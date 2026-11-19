
<script setup lang="ts">
import {
  LayoutDashboard,
  PackageSearch,
  ClipboardList,
  History,
  UserRound,
  Menu,
  GraduationCap,
  X,
} from 'lucide-vue-next'

const route = useRoute()
const sidebarOpen = ref(false)

const navigation = [
  {
    label: 'Dashboard',
    to: '/student',
    icon: LayoutDashboard,
  },
  {
    label: 'Equipment Catalog',
    to: '/student/equipment',
    icon: PackageSearch,
  },
  {
    label: 'My Requisitions',
    to: '/student/requisitions',
    icon: ClipboardList,
  },
  {
    label: 'My Borrowings',
    to: '/student/borrowing',
    icon: History,
  },
  {
    label: 'My Profile',
    to: '/student/profile',
    icon: UserRound,
  },
]

function isActive(item: typeof navigation[number]) {
  if (item.to === '/student') {
    return route.path === '/student' || route.path === '/student/'
  }

  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-dvh bg-base-200 text-base-content">

    <!-- Mobile Overlay -->
    <Transition name="sidebar-backdrop">
      <button
        v-if="sidebarOpen"
        type="button"
        class="fixed inset-0 z-40 bg-black/40 lg:hidden"
        aria-label="Close navigation"
        @click="closeSidebar"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex h-dvh w-64 flex-col border-r border-base-300 bg-base-100 shadow-xl transition-transform duration-200 ease-out lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >

      <!-- Brand -->
      <div class="flex h-20 shrink-0 items-center justify-between border-b border-base-300 px-5">
        <div class="flex items-center gap-3">
          <div class="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-content">
            <GraduationCap class="size-6" />
          </div>

          <div>
            <h1 class="text-lg font-bold tracking-tight">ICAM</h1>
            <p class="text-xs text-base-content/50">Student Portal</p>
          </div>
        </div>

        <button
          type="button"
          class="btn btn-ghost btn-square btn-sm lg:hidden"
          aria-label="Close sidebar"
          @click="closeSidebar"
        >
          <X class="size-5" />
        </button>
      </div>

      <!-- Navigation -->
      <nav
        class="min-h-0 flex-1 overflow-y-auto px-4 py-6"
        aria-label="Student navigation"
      >
        <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-base-content/40">
          Student Workspace
        </p>

        <ul class="space-y-1">
          <li
            v-for="item in navigation"
            :key="item.to"
          >
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 rounded-xl border-l-2 px-3 py-3 text-sm font-medium transition-colors"
              :class="isActive(item)
                ? 'border-primary bg-primary text-primary-content shadow-sm'
                : 'border-transparent text-base-content/70 hover:bg-base-200 hover:text-base-content'"
              :aria-current="isActive(item) ? 'page' : undefined"
              @click="closeSidebar"
            >
              <component
                :is="item.icon"
                class="size-5 shrink-0"
              />

              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Student Info -->
      <div class="shrink-0 border-t border-base-300 p-4">
        <div class="flex items-center gap-3 rounded-xl bg-base-200 p-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound class="size-5" />
          </div>

          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">
              Student Account
            </p>

            <p class="truncate text-xs text-base-content/50">
              Student Portal
            </p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="min-h-dvh min-w-0 lg:pl-64">

      <!-- Header -->
      <header class="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-base-300 bg-base-100/95 px-4 backdrop-blur sm:px-6 lg:px-8">

        <div class="flex min-w-0 items-center gap-3">

          <!-- Mobile Menu Button -->
          <button
            type="button"
            class="btn btn-ghost btn-square lg:hidden"
            aria-label="Toggle sidebar"
            @click="sidebarOpen = !sidebarOpen"
          >
            <Menu class="size-5" />
          </button>

          <div class="min-w-0">
            <p class="text-xs text-base-content/50">
              ICAM Student Portal
            </p>

            <h2 class="truncate text-sm font-semibold sm:text-base">
              Laboratory Equipment Management
            </h2>
          </div>
        </div>

        <!-- Student Badge -->
        <div class="hidden items-center gap-2 sm:flex">
          <div class="badge badge-primary badge-outline gap-1 px-3 py-3">
            <GraduationCap class="size-4" />
            Student
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main
        id="main-content"
        class="mx-auto w-full max-w-[1600px] min-w-0 p-4 sm:p-6 lg:p-8"
      >
        <slot />
      </main>
    </div>
  </div>
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
