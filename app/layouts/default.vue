<script setup lang="ts">
const { user, fetchCurrentUser, canViewResilience } = useIcamUser();

onMounted(() => {
  fetchCurrentUser();
});
</script>

<template>
  <div class="min-h-screen bg-base-200 text-base-content">
    <header class="navbar bg-base-100 border-b border-base-300 px-4 lg:px-8">
      <div class="flex-1 gap-4">
        <NuxtLink to="/" class="font-bold text-lg tracking-tight">
          ICAM <span class="text-xs font-normal opacity-70">SDCA - MLS</span>
        </NuxtLink>
        <nav class="hidden sm:flex items-center gap-1">
          <NuxtLink
            to="/"
            class="btn btn-ghost btn-sm"
            active-class="btn-active"
          >
            Catalog &amp; Inventory
          </NuxtLink>
          <NuxtLink
            to="/requisitions"
            class="btn btn-ghost btn-sm"
            active-class="btn-active"
          >
            Requisitions
          </NuxtLink>
          <NuxtLink
            to="/borrowing"
            class="btn btn-ghost btn-sm"
            active-class="btn-active"
          >
            Issuance &amp; Returns
          </NuxtLink>
          <NuxtLink
            v-if="canViewResilience"
            to="/resilience"
            class="btn btn-ghost btn-sm"
            active-class="btn-active"
          >
            Forms &amp; Resilience
          </NuxtLink>
        </nav>
      </div>

      <div class="flex-none">
        <div v-if="user" class="flex items-center gap-2">
          <span class="text-xs hidden md:inline">{{
            user.fullName || user.email
          }}</span>
          <span class="badge badge-primary badge-sm uppercase">{{
            user.role
          }}</span>
        </div>
        <span v-else class="badge badge-ghost badge-sm">Unauthenticated</span>
      </div>
    </header>

    <main class="max-w-7xl mx-auto p-4 lg:p-8">
      <slot />
    </main>
  </div>
</template>
