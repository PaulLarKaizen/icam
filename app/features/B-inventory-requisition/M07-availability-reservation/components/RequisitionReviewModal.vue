<script setup lang="ts">
import type { RequisitionRecord } from "~~/shared/types/requisition";

const props = defineProps<{
  requisition: RequisitionRecord | null;
}>();

const emit = defineEmits<{
  close: [];
  decided: [];
}>();

const remarks = ref("");
const approvedQtys = ref<Record<string, number>>({});
const submitting = ref(false);
const actionError = ref<string | null>(null);

watch(
  () => props.requisition,
  (req) => {
    actionError.value = null;
    remarks.value = "";
    const nextMap: Record<string, number> = {};
    if (req) {
      for (const line of req.items) {
        nextMap[line.id] = line.requestedQty;
      }
    }
    approvedQtys.value = nextMap;
  },
  { immediate: true },
);

async function submitDecision(decision: "approve" | "reject") {
  if (!props.requisition) return;
  submitting.value = true;
  actionError.value = null;

  try {
    await $fetch(`/api/v1/requisitions/${props.requisition.id}/review`, {
      method: "POST",
      body: {
        decision,
        remarks: remarks.value,
        itemDecisions:
          decision === "approve"
            ? props.requisition.items.map((line) => ({
                requisitionItemId: line.id,
                approvedQty: Number(approvedQtys.value[line.id] ?? 0),
              }))
            : undefined,
      },
    });

    emit("decided");
    emit("close");
  } catch (err: any) {
    actionError.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Unable to record requisition decision.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': !!requisition }">
    <div v-if="requisition" class="modal-box max-w-2xl">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h3 class="text-lg font-bold">
            Review Requisition · {{ requisition.referenceCode }}
          </h3>
          <p class="text-xs opacity-75">
            Faculty: {{ requisition.requesterName || "Faculty" }} · Borrower:
            {{ requisition.borrowerName }} ({{ requisition.courseYearSection }})
          </p>
        </div>
        <span
          v-if="requisition.isLateRequest"
          class="badge badge-warning badge-sm"
        >
          Late Request
        </span>
      </div>

      <div v-if="actionError" class="alert alert-error mt-3 text-sm">
        <span>{{ actionError }}</span>
      </div>

      <div class="overflow-x-auto border border-base-300 rounded-box mt-4">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Item</th>
              <th>Mode</th>
              <th class="text-right">Requested</th>
              <th class="text-right w-28">Approve Qty</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in requisition.items" :key="line.id">
              <td>
                <div class="font-medium">{{ line.itemName }}</div>
                <div class="text-xs opacity-70">
                  {{ line.itemSpecification || "Standard" }}
                </div>
              </td>
              <td>
                <span class="badge badge-xs badge-outline">{{
                  line.trackingMode
                }}</span>
              </td>
              <td class="text-right font-mono">
                {{ line.requestedQty }} {{ line.itemUnit }}
              </td>
              <td class="text-right">
                <input
                  v-model.number="approvedQtys[line.id]"
                  type="number"
                  min="0"
                  :max="line.requestedQty"
                  step="1"
                  class="input input-bordered input-xs w-20 text-right font-mono"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="form-control mt-3">
        <label class="label"
          ><span class="label-text font-medium"
            >Custodian Remarks / Substitution Notes</span
          ></label
        >
        <textarea
          v-model="remarks"
          rows="2"
          placeholder="Optional approval notes or reason for rejection"
          class="textarea textarea-bordered w-full"
        />
      </div>

      <div class="modal-action">
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          :disabled="submitting"
          @click="emit('close')"
        >
          Close
        </button>
        <button
          type="button"
          class="btn btn-error btn-outline btn-sm"
          :disabled="submitting"
          @click="submitDecision('reject')"
        >
          Reject Request
        </button>
        <button
          type="button"
          class="btn btn-primary btn-sm"
          :disabled="submitting"
          @click="submitDecision('approve')"
        >
          <span v-if="submitting" class="loading loading-spinner loading-xs" />
          Approve &amp; Reserve Stock
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
