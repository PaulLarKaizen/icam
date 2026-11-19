<script setup lang="ts">
import {
  Plus,
  RefreshCw,
  AlertCircle,
  ClipboardList,
  CheckSquare,
  XCircle,
  Eye,
} from "@lucide/vue";
import type {
  RequisitionRecord,
  RequisitionStatus,
} from "~~/shared/types/requisition";
import RequisitionFormModal from "./RequisitionFormModal.vue";
import RequisitionReviewModal from "../../M07-availability-reservation/components/RequisitionReviewModal.vue";

const { user, canSubmitRequisition, canReviewRequisition } = useIcamUser();

const requisitions = ref<RequisitionRecord[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);
const statusFilter = ref<RequisitionStatus | "">("");

const createModalOpen = ref(false);
const reviewTarget = ref<RequisitionRecord | null>(null);
const detailTarget = ref<RequisitionRecord | null>(null);

const filteredRequisitions = computed(() => {
  if (!statusFilter.value) return requisitions.value;
  return requisitions.value.filter((r) => r.status === statusFilter.value);
});

async function loadRequisitions() {
  loading.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<{ requisitions: RequisitionRecord[] }>(
      "/api/v1/requisitions",
    );
    requisitions.value = res.requisitions;
  } catch (err: any) {
    requisitions.value = [];
    errorMessage.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Unable to load requisitions.";
  } finally {
    loading.value = false;
  }
}

async function cancelRequisition(req: RequisitionRecord) {
  try {
    await $fetch(`/api/v1/requisitions/${req.id}/review`, {
      method: "POST",
      body: { decision: "cancel", remarks: "Cancelled via ICAM portal." },
    });
    await loadRequisitions();
  } catch (err: any) {
    errorMessage.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Unable to cancel requisition.";
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
  loadRequisitions();
});
</script>

<template>
  <section class="space-y-4">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div>
        <h1 class="text-2xl font-bold">
          Digital Laboratory Requisitions (F-VPA-012)
        </h1>
        <p class="text-sm opacity-75">
          Submit advance lab requests (M06) and manage custodian stock
          reservations (M07).
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="btn btn-ghost btn-sm"
          :disabled="loading"
          @click="loadRequisitions"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          Refresh
        </button>
        <button
          v-if="canSubmitRequisition"
          class="btn btn-primary btn-sm"
          @click="createModalOpen = true"
        >
          <Plus class="w-4 h-4" />
          New Requisition
        </button>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="flex flex-wrap gap-1.5">
      <button
        class="btn btn-xs"
        :class="statusFilter === '' ? 'btn-neutral' : 'btn-ghost'"
        @click="statusFilter = ''"
      >
        All ({{ requisitions.length }})
      </button>
      <button
        v-for="st in [
          'Submitted',
          'Approved',
          'Rejected',
          'Cancelled',
          'Issued',
          'Completed',
        ] as RequisitionStatus[]"
        :key="st"
        class="btn btn-xs"
        :class="statusFilter === st ? 'btn-neutral' : 'btn-ghost'"
        @click="statusFilter = st"
      >
        {{ st }}
      </button>
    </div>

    <div
      v-if="loading"
      class="card bg-base-100 border border-base-300 p-12 text-center"
    >
      <span class="loading loading-spinner loading-lg mx-auto text-primary" />
      <p class="mt-3 text-sm opacity-75">Loading laboratory requisitions...</p>
    </div>

    <div v-else-if="errorMessage" class="alert alert-error">
      <AlertCircle class="w-5 h-5 shrink-0" />
      <div class="flex-1">
        <h3 class="font-semibold">Unable to Load Requisitions</h3>
        <p class="text-xs">{{ errorMessage }}</p>
      </div>
      <button class="btn btn-sm" @click="loadRequisitions">Retry</button>
    </div>

    <div
      v-else-if="filteredRequisitions.length === 0"
      class="card bg-base-100 border border-base-300 p-12 text-center"
    >
      <ClipboardList class="w-10 h-10 mx-auto opacity-40" />
      <h3 class="mt-3 font-semibold">No requisitions found</h3>
      <p class="text-sm opacity-70 mt-1">
        {{
          canSubmitRequisition
            ? 'Click "New Requisition" to submit an F-VPA-012 request.'
            : "No requisitions match the current filter."
        }}
      </p>
    </div>

    <div
      v-else
      class="card bg-base-100 border border-base-300 shadow-xs overflow-x-auto"
    >
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Course / Activity</th>
            <th>Borrower &amp; Faculty</th>
            <th>Needed Schedule</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in filteredRequisitions" :key="req.id">
            <td>
              <div class="font-mono font-semibold text-xs">
                {{ req.referenceCode }}
              </div>
              <span
                v-if="req.isLateRequest"
                class="badge badge-warning badge-xs mt-1"
              >
                Late Request
              </span>
            </td>
            <td>
              <div class="font-semibold">{{ req.courseActivity }}</div>
              <div class="text-xs opacity-70">
                {{ req.courseYearSection }} · {{ req.items.length }} item(s)
              </div>
            </td>
            <td>
              <div class="text-sm font-medium">{{ req.borrowerName }}</div>
              <div class="text-xs opacity-70">
                Faculty: {{ req.requesterName || "Faculty" }}
              </div>
            </td>
            <td class="text-xs">
              <div>Needed: {{ formatDateTime(req.neededAt) }}</div>
              <div class="opacity-70">
                Return: {{ formatDateTime(req.expectedReturnAt) }}
              </div>
            </td>
            <td>
              <span
                class="badge badge-sm"
                :class="{
                  'badge-info': req.status === 'Submitted',
                  'badge-success': req.status === 'Approved',
                  'badge-error': req.status === 'Rejected',
                  'badge-ghost': req.status === 'Cancelled',
                  'badge-warning': req.status === 'Issued',
                  'badge-neutral': req.status === 'Completed',
                }"
              >
                {{ req.status }}
              </span>
            </td>
            <td class="text-right">
              <div class="join">
                <button
                  class="btn btn-ghost btn-xs join-item"
                  title="View details & reserved serials"
                  @click="detailTarget = req"
                >
                  <Eye class="w-4 h-4" />
                </button>
                <button
                  v-if="canReviewRequisition && req.status === 'Submitted'"
                  class="btn btn-primary btn-xs join-item"
                  @click="reviewTarget = req"
                >
                  <CheckSquare class="w-3.5 h-3.5" />
                  Review
                </button>
                <button
                  v-if="
                    (canReviewRequisition &&
                      (req.status === 'Submitted' ||
                        req.status === 'Approved')) ||
                    (req.requesterId === user?.id && req.status === 'Submitted')
                  "
                  class="btn btn-ghost btn-xs text-error join-item"
                  title="Cancel requisition"
                  @click="cancelRequisition(req)"
                >
                  <XCircle class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <dialog class="modal" :class="{ 'modal-open': !!detailTarget }">
      <div v-if="detailTarget" class="modal-box max-w-2xl">
        <h3 class="text-lg font-bold">
          {{ detailTarget.referenceCode }} — {{ detailTarget.courseActivity }}
        </h3>
        <p class="text-xs opacity-70 mt-1">
          Submitted: {{ formatDateTime(detailTarget.submittedAt) }} · Status:
          {{ detailTarget.status }}
        </p>

        <div
          v-if="detailTarget.isLateRequest"
          class="alert alert-warning mt-3 text-xs"
        >
          <span>
            <strong>Late Request Flagged:</strong>
            {{
              detailTarget.lateRequestReason ||
              "Submitted within 72 hours of lab schedule."
            }}
          </span>
        </div>

        <div class="overflow-x-auto border border-base-300 rounded-box mt-4">
          <table class="table table-xs">
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Requested</th>
                <th class="text-right">Approved</th>
                <th>Assigned Serials</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in detailTarget.items" :key="line.id">
                <td>
                  {{ line.itemName }}
                  {{
                    line.itemSpecification ? `(${line.itemSpecification})` : ""
                  }}
                </td>
                <td class="text-right font-mono">{{ line.requestedQty }}</td>
                <td class="text-right font-mono font-bold">
                  {{ line.approvedQty }}
                </td>
                <td class="font-mono text-xs">
                  {{
                    line.assignedSerials.length
                      ? line.assignedSerials.join(", ")
                      : "—"
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-if="detailTarget.decisionRemarks" class="text-xs mt-3">
          <strong>Custodian Remarks:</strong> {{ detailTarget.decisionRemarks }}
        </p>

        <div class="modal-action">
          <button class="btn btn-sm" @click="detailTarget = null">Close</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" @click="detailTarget = null">close</button>
      </form>
    </dialog>

    <RequisitionFormModal
      :open="createModalOpen"
      @close="createModalOpen = false"
      @submitted="loadRequisitions"
    />

    <RequisitionReviewModal
      :requisition="reviewTarget"
      @close="reviewTarget = null"
      @decided="loadRequisitions"
    />
  </section>
</template>
