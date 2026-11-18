
<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '~/components/shared/AppHeader.vue'
import AppSidebar from '~/components/shared/AppSidebar.vue'

const isMobileNavigationOpen = ref(false)

function toggleMobileNavigation() {
  isMobileNavigationOpen.value = !isMobileNavigationOpen.value
}

function closeMobileNavigation() {
  isMobileNavigationOpen.value = false
}
</script>

<template>
  <div class="min-h-dvh bg-base-200 text-base-content">
    <AppSidebar
      :open="isMobileNavigationOpen"
      @close="closeMobileNavigation"
    />

    <div class="min-h-dvh lg:pl-64">
      <AppHeader
        :navigation-open="isMobileNavigationOpen"
        @toggle-navigation="toggleMobileNavigation"
      />

      <main
        id="main-content"
        class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
