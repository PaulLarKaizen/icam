
<script setup lang="ts">
import type { Component } from 'vue'
import {
  BookOpen,
  FlaskConical,
  GraduationCap,
  ShieldCheck,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'auth',
  title: 'Choose your ICAM portal',
})

type PortalOption = {
  title: string
  description: string
  href: string
  icon: Component
}

const portalOptions: PortalOption[] = [
  {
    title: 'Student',
    description: 'Sign in to your student account.',
    href: '/auth/student',
    icon: BookOpen,
  },
  {
    title: 'Lab Custodian',
    description: 'Sign in to your laboratory custodian account.',
    href: '/auth/lab-custodian',
    icon: FlaskConical,
  },
  {
    title: 'Admin',
    description: 'Sign in to your administrator account.',
    href: '/auth/admin',
    icon: ShieldCheck,
  },
]

</script>

<template>
  <main
    class="relative flex min-h-dvh flex-col overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-8 text-slate-900 sm:px-6 lg:py-12"
    style="background-image: url('/images/Main Page/main-sdcacampus.jpg')"
  >
    <!-- Background Overlay -->
    <div class="absolute inset-0 bg-white/70"></div>

    <!-- Portal Content -->
    <section
      class="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center"
    >
      <!-- SDCA and ICAM Branding -->
      <header class="mb-8 text-center sm:mb-10">
        <div class="mb-4 flex justify-center">
          <img
            src="/images/Login/login-sdca.jpg"
            alt="St. Dominic College of Asia"
            class="size-20 rounded-full bg-white object-contain p-1 shadow-md ring-1 ring-slate-200 sm:size-24"
          />
        </div>

        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#650c21]">
          St. Dominic College of Asia
        </p>

        <h1 class="mt-2 text-3xl font-bold tracking-tight text-[#650c21] sm:text-4xl">
          ICAM
        </h1>

        <p class="mt-1 text-sm font-medium text-slate-700 sm:text-base">
          Institutional Campus Asset Management
        </p>

        <p class="mt-4 text-sm text-slate-600">
          Select your account type to continue.
        </p>
      </header>

      <!-- Account Selection Cards -->
<nav
  aria-label="Account type"
  class="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3"
>
        <article
          v-for="option in portalOptions"
          :key="option.href"
          class="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white/95 p-5 text-center shadow-lg backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <!-- Account Icon -->
          <span
            class="mb-4 flex size-14 items-center justify-center rounded-xl border border-[#650c21]/15 bg-[#650c21]/5 text-[#650c21]"
          >
            <component
              :is="option.icon"
              :size="25"
              :stroke-width="1.8"
              aria-hidden="true"
            />
          </span>

          <!-- Account Information -->
          <h2 class="text-base font-semibold text-slate-900">
            {{ option.title }}
          </h2>

          <p class="mt-2 min-h-10 text-sm leading-5 text-slate-500">
            {{ option.description }}
          </p>

          <!-- Continue Button -->
          <NuxtLink
            :to="option.href"
            class="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-[#650c21] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#510918] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#650c21]"
          >
            Continue as {{ option.title }}
          </NuxtLink>
        </article>
      </nav>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 mt-8 text-center text-xs text-slate-600">
      St. Dominic College of Asia · ICAM Portal
    </footer>
  </main>
</template>
