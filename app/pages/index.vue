<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  title: 'ICAM Portal',
})

await navigateTo('/portal', {
  redirectCode: 302,
})
</script>

<template>
  <main class="min-h-dvh">
    <div class="sr-only">Redirecting to ICAM portal...</div>
  </main>
</template>
