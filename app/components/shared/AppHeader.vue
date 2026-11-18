<script setup lang="ts">
import { computed } from 'vue'
import { Menu, UserRound, X } from 'lucide-vue-next'

defineProps<{
  navigationOpen: boolean
}>()

const emit = defineEmits<{
  toggleNavigation: []
}>()

const route = useRoute()
const pageTitle = computed(() => {
  const title = route.meta.title
  return typeof title === 'string' && title.trim() ? title : 'Workspace'
})
</script>

<template>
  <header
    class="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-base-300 bg-base-100 px-4 sm:px-6 lg:px-8"
  >
    <button
      type="button"
      class="btn btn-ghost btn-square btn-sm shrink-0 lg:hidden"
      :aria-label="navigationOpen ? 'Close navigation' : 'Open navigation'"
      aria-controls="app-sidebar"
      :aria-expanded="navigationOpen"
      @click="emit('toggleNavigation')"
    >
      <X v-if="navigationOpen" :size="20" aria-hidden="true" />
      <Menu v-else :size="20" aria-hidden="true" />
    </button>

    <div class="min-w-0 flex-1">
      <p class="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-primary">
        ICAM <span class="px-1 text-base-content/35">/</span> Laboratory operations
      </p>
      <h1 class="truncate text-sm font-semibold leading-6 tracking-tight sm:text-base">
        {{ pageTitle }}
      </h1>
    </div>

    <div
      class="flex shrink-0 items-center gap-2 rounded-lg border border-base-300 bg-base-100 py-1 pl-1.5 pr-2.5"
      role="group"
      aria-label="User profile placeholder"
    >
      <span class="flex size-7 items-center justify-center rounded-md bg-base-200 text-base-content/70">
        <UserRound :size="17" :stroke-width="1.8" aria-hidden="true" />
      </span>
      <span class="hidden text-sm font-medium sm:inline">Profile</span>
      <span class="sr-only">User profile placeholder</span>
    </div>
  </header>
</template>
