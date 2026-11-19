<script setup lang="ts">
import {
  QrCode,
  RefreshCw,
  AlertCircle,
  ClipboardCheck,
  ShieldAlert,
} from "@lucide/vue";
import type {
  BorrowingTransaction,
  LiabilityCase,
} from "~~/shared/types/borrowing";
import QrRetrievalReleaseModal from "../../M08-student-retrieval-qr/components/QrRetrievalReleaseModal.vue";
import ReturnInspectionModal from "../../M10-returns-inspection/components/ReturnInspectionModal.vue";
import LiabilityClearanceModal from "../../M11-liability-damage/components/LiabilityClearanceModal.vue";

const { canOperateCounter } = useIcamUser();

const transactions = ref<BorrowingTransaction[]>([]);
const liabilityCases = ref<LiabilityCase[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

const releaseModalOpen = ref(false);
const inspectTarget = ref<BorrowingTransaction | null>(null);
const clearTarget = ref<LiabilityCase | null>(null);

async function loadAll() {
  loading.value = true;
  errorMessage.value = null;

  try {
    const [txRes, liaRes] = await Promise.all([
      $fetch<{ transactions: BorrowingTransaction[] }>("/api/v1/borrowing"),
      $fetch<{ cases: LiabilityCase[] }>("/api/v1/liability"),
    ]);
    transactions.value = txRes.transactions;
    liabilityCases.value = liaRes.cases;
  } catch (err: any) {
    transactions.value = [];
    liabilityCases.value = [];
    errorMessage.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Unable to load borrowing records.";
  } finally {
    loading.value = false;
  }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

onMounted(() => {
  loadAll();
});
</script>

<template>
  <section class="space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div>
        <h1 class="text-2xl font-bold">
          Issuance, Returns &amp; Liability Clearance
        </h1>
        <p class="text-sm opacity-75">
          Counter QR retrieval (M08), physical release with Student ID
          collateral (M09), return inspection (M10), and F-VPA-011 Rev.1
          liability clearance (M11).
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="btn btn-ghost btn-sm"
          :disabled="loading"
          @click="loadAll"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          Refresh
        </button>

        <button
          v-if="canOperateCounter"
          class="btn btn-primary btn-sm"
          @click="releaseModalOpen = true"
        >
          <QrCode class="w-4 h-4" />
          Scan QR / Release Items
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="card bg-base-100 border border-base-300 p-12 text-center"
    >
      <span class="loading loading-spinner loading-lg mx-auto text-primary" />
      <p class="mt-3 text-sm opacity-75">
        Loading borrowing &amp; accountability records...
      </p>
    </div>

    <div v-else-if="errorMessage" class="alert alert-error">
      <AlertCircle class="w-5 h-5 shrink-0" />
      <div class="flex-1">
        <h3 class="font-semibold">Unable to Load Records</h3>
        <p class="text-xs">{{ errorMessage }}</p>
      </div>
      <button class="btn btn-sm" @click="loadAll">Retry</button>
    </div>

    <template v-else>
      <!-- Borrowing & Custody Ledger -->
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">
          Active &amp; Past Equipment Issuances
        </h2>

        <div
          v-if="transactions.length === 0"
          class="card bg-base-100 border border-base-300 p-8 text-center text-sm opacity-75"
        >
          No issued borrowing transactions recorded yet.
        </div>

        <div
          v-else
          class="card bg-base-100 border border-base-300 shadow-xs overflow-x-auto"
        >
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Borrower &amp; Activity</th>
                <th>Issued At</th>
                <th>Student ID Collateral</th>
                <th>Status</th>
                <th class="text-right">Counter Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in transactions" :key="tx.id">
                <td class="font-mono font-semibold text-xs">
                  {{ tx.referenceCode }}
                </td>
                <td>
                  <div class="font-medium">{{ tx.receivedByName }}</div>
                  <div class="text-xs opacity-70">
                    {{ tx.courseActivity }} ({{ tx.courseYearSection }}) ·
                    {{ tx.items.length }} item(s)
                  </div>
                </td>
                <td class="text-xs">{{ formatDateTime(tx.issuedAt) }}</td>
                <td>
                  <span
                    class="badge badge-sm"
                    :class="{
                      'badge-warning': tx.studentIdStatus === 'Held',
                      'badge-error': tx.studentIdStatus === 'Retained',
                      'badge-success': tx.studentIdStatus === 'Returned',
                    }"
                  >
                    ID: {{ tx.studentIdStatus }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge badge-sm"
                    :class="{
                      'badge-info': tx.status === 'Issued',
                      'badge-success':
                        tx.status === 'Returned' || tx.status === 'Cleared',
                      'badge-error': tx.status === 'Liability Pending',
                    }"
                  >
                    {{ tx.status }}
                  </span>
                </td>
                <td class="text-right">
                  <button
                    v-if="canOperateCounter && tx.status === 'Issued'"
                    class="btn btn-primary btn-xs"
                    @click="inspectTarget = tx"
                  >
                    <ClipboardCheck class="w-3.5 h-3.5" />
                    Inspect Return
                  </button>
                  <span v-else class="text-xs opacity-60">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Liability Cases (Form F-VPA-011 Rev.1) -->
      <div class="space-y-2">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <ShieldAlert class="w-5 h-5 text-error" />
          Agreement of Liability Cases (F-VPA-011 Rev.1)
        </h2>

        <div
          v-if="liabilityCases.length === 0"
          class="card bg-base-100 border border-base-300 p-8 text-center text-sm opacity-75"
        >
          No damaged or lost equipment liability cases recorded.
        </div>

        <div
          v-else
          class="card bg-base-100 border border-base-300 shadow-xs overflow-x-auto"
        >
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Case Code</th>
                <th>Liable Person</th>
                <th>Affected Items</th>
                <th>Settlement Proof</th>
                <th>Clearance</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in liabilityCases" :key="c.id">
                <td class="font-mono font-semibold text-xs">
                  <div>{{ c.caseCode }}</div>
                  <div class="opacity-60">{{ c.referenceCode }}</div>
                </td>
                <td>
                  <div class="font-medium">{{ c.liablePersonName }}</div>
                  <div class="text-xs opacity-70">{{ c.schoolDepartment }}</div>
                </td>
                <td class="text-xs">
                  <div v-for="item in c.items" :key="item.id">
                    {{ item.quantity }}× {{ item.itemName }} ({{
                      item.incidentRemark
                    }})
                  </div>
                </td>
                <td class="text-xs">
                  <div v-if="c.replacementMode">{{ c.replacementMode }}</div>
                  <div class="font-mono opacity-75">
                    {{ c.proofReference || "Pending settlement" }}
                  </div>
                </td>
                <td>
                  <span
                    class="badge badge-sm"
                    :class="
                      c.clearanceStatus === 'Cleared'
                        ? 'badge-success'
                        : 'badge-error'
                    "
                  >
                    {{ c.clearanceStatus }}
                  </span>
                </td>
                <td class="text-right">
                  <button
                    v-if="
                      canOperateCounter && c.clearanceStatus === 'Unresolved'
                    "
                    class="btn btn-success btn-xs"
                    @click="clearTarget = c"
                  >
                    Clear Liability
                  </button>
                  <span v-else class="text-xs opacity-60">Cleared</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <QrRetrievalReleaseModal
      :open="releaseModalOpen"
      @close="releaseModalOpen = false"
      @issued="loadAll"
    />

    <ReturnInspectionModal
      :transaction="inspectTarget"
      @close="inspectTarget = null"
      @inspected="loadAll"
    />

    <LiabilityClearanceModal
      :liability-case="clearTarget"
      @close="clearTarget = null"
      @cleared="loadAll"
    />
  </section>
</template>
