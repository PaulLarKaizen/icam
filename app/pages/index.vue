
<script setup lang="ts">
import type { Component } from 'vue'
import {
  Activity,
  CalendarClock,
  ClipboardList,
  Package,
  PackageSearch,
  RotateCcw,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Dashboard',
})

type SummaryMetric = {
  label: string
  icon: Component
}

const summaryMetrics: SummaryMetric[] = [
  { label: 'Total equipment', icon: Package },
  { label: 'Availability', icon: CalendarClock },
  { label: 'Open requisitions', icon: ClipboardList },
  { label: 'Returns due', icon: RotateCcw },
]

const workspaceStatus = [
  { label: 'Inventory data', value: 'Not connected' },
  { label: 'Operational workflows', value: 'Not implemented' },
  { label: 'Authentication', value: 'Not configured' },
]
</script>

<template>
  <div class="space-y-6">
    <section
      class="flex flex-col gap-4 border-b border-base-300 pb-5 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <p class="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary">
          St. Dominic College of Asia <span class="px-1 text-base-content/35">/</span> ICAM
        </p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
          Laboratory inventory overview
        </h2>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-base-content/65">
          Equipment, availability, and custodial accountability in one workspace.
        </p>
      </div>

      <span class="badge badge-outline h-7 gap-2 border-base-300 px-3 text-base-content/70">
        <span class="size-1.5 rounded-full bg-primary" />
        MVP foundation
      </span>
    </section>

    <section aria-labelledby="inventory-summary-title">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="inventory-summary-title" class="text-sm font-semibold tracking-tight">
          Inventory summary
        </h2>
        <p class="text-xs text-base-content/55">Figures appear when inventory data is available</p>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="metric in summaryMetrics"
          :key="metric.label"
          class="card border border-base-300 bg-base-100 shadow-sm"
        >
          <div class="card-body gap-3 p-4">
            <div class="flex items-start justify-between gap-3">
              <p class="text-xs font-medium text-base-content/65">
                {{ metric.label }}
              </p>
              <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <component :is="metric.icon" :size="17" :stroke-width="1.8" aria-hidden="true" />
              </span>
            </div>
            <div class="flex items-end justify-between gap-2">
              <span class="font-mono text-3xl font-medium leading-none tracking-tight text-base-content/75">
                —
              </span>
              <span class="text-right text-[0.65rem] leading-4 text-base-content/45">
                No records yet
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <div class="grid gap-4 xl:grid-cols-3">
      <section class="card border border-base-300 bg-base-100 shadow-sm xl:col-span-2">
        <div class="flex items-start justify-between gap-4 px-5 py-4">
          <div>
            <h2 class="text-sm font-semibold tracking-tight">Inventory activity</h2>
            <p class="mt-1 text-xs text-base-content/55">
              Requisition, issuance, and return activity
            </p>
          </div>
          <span class="badge badge-ghost badge-sm shrink-0 text-base-content/55">No data</span>
        </div>

        <div class="mx-5 border-t border-base-200" />

        <div class="flex min-h-52 flex-col items-center justify-center px-6 py-8 text-center">
          <span class="mb-3 flex size-10 items-center justify-center rounded-xl bg-base-200 text-base-content/55">
            <Activity :size="20" :stroke-width="1.8" aria-hidden="true" />
          </span>
          <h3 class="text-sm font-medium">Activity will appear here</h3>
          <p class="mt-1 max-w-md text-xs leading-5 text-base-content/55">
            No inventory transactions are available. Activity summaries will be shown when approved
            data sources are connected.
          </p>
        </div>
      </section>

      <section class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="px-5 py-4">
          <h2 class="text-sm font-semibold tracking-tight">Workspace status</h2>
          <p class="mt-1 text-xs text-base-content/55">Current foundation readiness</p>
        </div>

        <ul class="divide-y divide-base-200 px-5">
          <li
            v-for="status in workspaceStatus"
            :key="status.label"
            class="flex items-center justify-between gap-3 py-3"
          >
            <span class="text-xs font-medium">{{ status.label }}</span>
            <span class="text-right text-[0.65rem] text-base-content/55">{{ status.value }}</span>
          </li>
        </ul>

        <div class="mx-5 mt-1 border-t border-base-200" />
        <p class="px-5 py-3 text-[0.65rem] leading-5 text-base-content/50">
          No authentication or operational inventory actions are enabled.
        </p>
      </section>
    </div>

    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-3 border-b border-base-200 px-5 py-4">
        <div>
          <h2 class="text-sm font-semibold tracking-tight">Equipment catalog</h2>
          <p class="mt-1 text-xs text-base-content/55">
            Laboratory equipment records will be available here when implemented.
          </p>
        </div>
        <span class="badge badge-ghost badge-sm text-base-content/55">Not connected</span>
      </div>

      <div class="flex min-h-40 flex-col items-center justify-center px-6 py-8 text-center">
        <span class="mb-3 flex size-10 items-center justify-center rounded-xl bg-base-200 text-primary">
          <PackageSearch :size="20" :stroke-width="1.8" aria-hidden="true" />
        </span>
        <h3 class="text-sm font-medium">No equipment records</h3>
        <p class="mt-1 max-w-lg text-xs leading-5 text-base-content/55">
          The catalog is an empty state; no sample or institutional inventory data is included.
        </p>
      </div>
    </section>
  </div>
</template>
