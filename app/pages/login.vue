
<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <main class="min-h-screen bg-base-200">
    <section class="container mx-auto px-4 py-10">
      <div class="mx-auto max-w-5xl">
        <div class="grid min-h-[600px] overflow-hidden rounded-2xl bg-base-100 shadow-sm md:grid-cols-2">

    <!-- ICAM and SDCA Branding -->
    <div
    class="flex flex-col items-center justify-center bg-[#650c21] p-8 text-white text-center"
    >
    <!-- Application Title -->
    <h1 class="text-5xl font-bold tracking-wider">
        ICAM
    </h1>
    <!-- SDCA Official Logo -->
    <img
        src="/images/SDCA.jpg"
        alt="St. Dominic College of Asia Logo"
        class="mt-6 mb-6 h-56 w-56 rounded-full object-contain shadow-md"
        />
        <p class="max-w-sm text-center text-sm leading-relaxed">
            Laboratory Inventory and Custodial
            Accountability Management
        </p>

        <p class="mt-5 text-xs opacity-80">
            St. Dominic College of Asia
            </p>
    </div>
          <div class="flex flex-col justify-center p-8 sm:p-12">

            <h2 class="text-3xl font-bold">
              Welcome Back
            </h2>

            <p class="mt-2 text-sm text-base-content/60">
              Sign in to access your ICAM account.
            </p>

            <div class="mt-8">
              <p class="text-sm text-base-content/60">
                
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  </main>
</template>
