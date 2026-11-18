<script setup lang="ts">
import LoginPage from '../login.vue'

definePageMeta({
  layout: 'auth',
  title: 'Student sign in',
})
</script>

<template>
  <div class="relative">
    <span
      class="absolute right-4 top-4 z-20 rounded-full border border-base-300 bg-base-100 px-3 py-1 text-xs font-semibold tracking-wide text-base-content shadow-sm sm:right-6 sm:top-6"
    >
      Student account
    </span>
    <LoginPage />
  </div>
</template>
