
<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { ref } from 'vue'

definePageMeta({
  layout: 'auth'
})

const showPassword = ref(false)
</script>

<template>
  <main
    class="relative min-h-screen bg-cover bg-center bg-no-repeat"
    style="background-image: url('/images/Login/login-test2.png')"
  >
    <!-- Background Overlay -->
    <div class="absolute inset-0 bg-black/40"></div>

    <!-- Login Container -->
    <section
      class="relative z-10 container mx-auto flex min-h-screen items-center justify-center px-4 py-10"
    >
      <div class="mx-auto w-full max-w-5xl">

        <div
          class="grid min-h-[600px] overflow-hidden rounded-2xl bg-base-100 shadow-xl md:grid-cols-2"
        >

          <!-- Left Side: ICAM and SDCA Branding -->
          <div
            class="flex flex-col items-center justify-center bg-[#650c21] p-8 text-center text-white"
          >
            <!-- Application Title -->
            <h1 class="text-5xl font-bold tracking-wider">
              ICAM
            </h1>

            <!-- SDCA Official Logo -->
            <img
              src="/images/Login/login-sdca.jpg"
              alt="St. Dominic College of Asia Logo"
              class="mt-6 mb-6 h-56 w-56 rounded-full object-contain shadow-md"
            />

            <!-- Application Description -->
            <p class="max-w-sm text-sm leading-relaxed">
              Institutional Campus Asset Management
            </p>

            <!-- Institution Name -->
            <p class="mt-3 text-xs opacity-80">
              St. Dominic College of Asia
            </p>
          </div>

          <!-- Right Side: Login Form -->
          <div class="flex flex-col justify-center p-8 sm:p-12">

            <NuxtLink
              to="/portal"
              class="mb-5 inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#650c21] transition-colors hover:bg-[#650c21]/5 hover:text-[#510918] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#650c21]"
            >
              <ArrowLeft :size="17" :stroke-width="2" aria-hidden="true" />
              <span>Back to Portal</span>
            </NuxtLink>

            <h2 class="text-3xl font-bold">
              Welcome Back!
            </h2>

            <p class="mt-2 text-sm text-base-content/60">
              Sign in to access your ICAM account.
            </p>

            <!-- Login Form -->
            <div class="mt-8 space-y-5">

              <!-- Email Address -->
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text font-medium">
                    Email Address
                  </span>
                </label>

                <input
                  type="email"
                  placeholder="Enter your email address"
                  class="input input-bordered w-full"
                  autocomplete="username"
                />
              </div>

              <!-- Password -->
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text font-medium">
                    Password
                  </span>
                </label>

                <div class="relative">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Enter your password"
                    class="input input-bordered w-full pr-20"
                    autocomplete="current-password"
                  />

                  <button
                    type="button"
                    class="btn btn-ghost btn-sm absolute right-2 top-1/2 -translate-y-1/2"
                    @click="showPassword = !showPassword"
                  >
                    {{ showPassword ? 'Hide' : 'Show' }}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  </main>
</template>
