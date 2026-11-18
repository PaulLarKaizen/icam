<script setup lang="ts">
import type { Component } from 'vue'
import {
  ArrowRight,
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
    title: 'Admin',
    description: 'Administrative account access',
    href: '/auth/admin',
    icon: ShieldCheck,
  },
  {
    title: 'Faculty',
    description: 'Faculty account access',
    href: '/auth/faculty',
    icon: BookOpen,
  },
  {
    title: 'Lab Custodian',
    description: 'Laboratory custodian account access',
    href: '/auth/lab-custodian',
    icon: FlaskConical,
  },
  {
    title: 'Student',
    description: 'Student account access',
    href: '/auth/student',
    icon: GraduationCap,
  },
]
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-base-200 px-4 py-8 sm:px-6">
    <section
      class="w-full max-w-4xl overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-lg"
    >
      <header class="bg-secondary px-6 py-6 text-secondary-content sm:px-8 sm:py-7">
        <div class="flex items-center gap-4">
          <img
            src="/images/Login/login-sdca.jpg"
            alt="St. Dominic College of Asia"
            class="size-14 shrink-0 rounded-full bg-white object-contain p-1 shadow-sm sm:size-16"
          />
          <div>
            <p class="text-[0.65rem] font-semibold uppercase tracking-[0.16em] opacity-80">
              St. Dominic College of Asia
            </p>
            <h1 class="mt-1 text-2xl font-bold tracking-wide sm:text-3xl">ICAM</h1>
            <p class="mt-0.5 text-xs opacity-85 sm:text-sm">
              Institutional Campus Asset Management
            </p>
          </div>
        </div>
      </header>

      <div class="px-5 py-6 sm:px-8 sm:py-8">
        <div class="mb-5">
          <h2 class="text-lg font-semibold tracking-tight sm:text-xl">Choose your portal</h2>
          <p class="mt-1 text-sm text-base-content/65">
            Select your account type to continue to sign in.
          </p>
        </div>

        <nav aria-label="Account type" class="grid gap-3 sm:grid-cols-2">
          <NuxtLink
            v-for="option in portalOptions"
            :key="option.href"
            :to="option.href"
            class="group flex min-h-24 items-center gap-4 rounded-xl border border-base-300 bg-base-100 p-4 transition-colors hover:border-primary/50 hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span
              class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <component :is="option.icon" :size="21" :stroke-width="1.8" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold">{{ option.title }}</span>
              <span class="mt-1 block text-xs leading-5 text-base-content/60">
                {{ option.description }}
              </span>
            </span>
            <ArrowRight
              :size="18"
              :stroke-width="1.8"
              class="shrink-0 text-base-content/45 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </NuxtLink>
        </nav>
      </div>
    </section>
  </main>
</template>
