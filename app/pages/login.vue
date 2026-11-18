
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

          <div class="flex flex-col items-center justify-center bg-secondary p-8 text-secondary-content">
            <h1 class="text-4xl font-bold tracking-wide">
              ICAM
            </h1>

            <p class="mt-3 text-center text-sm">
              Laboratory Inventory and Custodial
              Accountability Management
            </p>

            <p class="mt-8 text-center text-xs opacity-70">
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
                Login form will be added in the next step.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  </main>
</template>
