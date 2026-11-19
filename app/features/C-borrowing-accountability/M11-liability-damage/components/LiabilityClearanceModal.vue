<script setup lang="ts">
import type {
  LiabilityCase,
  LiabilityReplacementMode,
} from "~~/shared/types/borrowing";

const props = defineProps<{
  liabilityCase: LiabilityCase | null;
}>();

const emit = defineEmits<{
  close: [];
  cleared: [];
}>();

const form = reactive({
  replacementMode: "Payment at the cashier" as LiabilityReplacementMode,
  proofReference: "",
  acknowledgedByLiable: false,
  attestedByFaculty: false,
  restockReplaced: false,
  clearanceNotes: "",
});

const submitting = ref(false);
const actionError = ref<string | null>(null);

watch(
  () => props.liabilityCase,
  () => {
    actionError.value = null;
    form.replacementMode = "Payment at the cashier";
    form.proofReference = "";
    form.acknowledgedByLiable = false;
    form.attestedByFaculty = false;
    form.restockReplaced = false;
    form.clearanceNotes = "";
  },
  { immediate: true },
);

async function handleClearance() {
  if (!props.liabilityCase) return;
  submitting.value = true;
  actionError.value = null;

  try {
    await $fetch(`/api/v1/liability/${props.liabilityCase.id}/clear`, {
      method: "POST",
      body: {
        replacementMode: form.replacementMode,
        proofReference: form.proofReference,
        acknowledgedByLiable: form.acknowledgedByLiable,
        attestedByFaculty: form.attestedByFaculty,
        restockReplaced:
          form.replacementMode === "Replace the item"
            ? form.restockReplaced
            : false,
        clearanceNotes: form.clearanceNotes,
      },
    });

    emit("cleared");
    emit("close");
  } catch (err: any) {
    actionError.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Unable to certify liability clearance.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': !!liabilityCase }">
    <div v-if="liabilityCase" class="modal-box max-w-2xl">
      <h3 class="text-lg font-bold">
        Agreement of Liability Clearance (F-VPA-011 Rev.1) ·
        {{ liabilityCase.caseCode }}
      </h3>
      <p class="text-xs opacity-75 mt-1">
        Liable Person: {{ liabilityCase.liablePersonName }} ({{
          liabilityCase.schoolDepartment
        }}) · Linked Requisition: {{ liabilityCase.referenceCode }}
      </p>

      <div v-if="actionError" class="alert alert-error mt-3 text-sm">
        <span>{{ actionError }}</span>
      </div>

      <div class="overflow-x-auto border border-base-300 rounded-box mt-4">
        <table class="table table-xs">
          <thead>
            <tr>
              <th>Affected Item</th>
              <th>Remark</th>
              <th class="text-right">Qty</th>
              <th>Serials</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in liabilityCase.items" :key="line.id">
              <td>
                {{ line.itemName }}
                {{
                  line.itemSpecification ? `(${line.itemSpecification})` : ""
                }}
              </td>
              <td>
                <span class="badge badge-xs badge-error">{{
                  line.incidentRemark
                }}</span>
              </td>
              <td class="text-right font-mono">
                {{ line.quantity }} {{ line.itemUnit }}
              </td>
              <td class="font-mono text-xs">
                {{
                  line.affectedSerials.length
                    ? line.affectedSerials.join(", ")
                    : "—"
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <form class="space-y-3 mt-4" @submit.prevent="handleClearance">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium"
                >Mode of Replacement *</span
              ></label
            >
            <select
              v-model="form.replacementMode"
              class="select select-bordered select-sm w-full"
            >
              <option value="Payment at the cashier">
                Payment at the cashier
              </option>
              <option value="Replace the item">Replace the item</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">
                {{
                  form.replacementMode === "Payment at the cashier"
                    ? "Official Receipt (OR) Number *"
                    : "Replacement Verification Reference *"
                }}
              </span>
            </label>
            <input
              v-model="form.proofReference"
              type="text"
              :placeholder="
                form.replacementMode === 'Payment at the cashier'
                  ? 'e.g., SDCA-OR-2026-8841'
                  : 'e.g., Replaced exact 250 mL Pyrex beaker'
              "
              class="input input-bordered input-sm w-full"
              required
            />
          </div>
        </div>

        <label
          v-if="form.replacementMode === 'Replace the item'"
          class="label cursor-pointer justify-start gap-3 py-1"
        >
          <input
            v-model="form.restockReplaced"
            type="checkbox"
            class="checkbox checkbox-sm"
          />
          <span class="label-text text-xs">
            Return verified replacement item(s) directly to usable on-hand stock
          </span>
        </label>

        <div class="border border-base-300 rounded-box p-3 space-y-2">
          <label class="label cursor-pointer justify-start gap-3 py-1">
            <input
              v-model="form.acknowledgedByLiable"
              type="checkbox"
              class="checkbox checkbox-primary checkbox-sm"
              required
            />
            <span class="label-text text-xs">
              Liable person wet-ink acknowledgement verified on F-VPA-011 Rev.1
              (2 copies)
            </span>
          </label>

          <label class="label cursor-pointer justify-start gap-3 py-1">
            <input
              v-model="form.attestedByFaculty"
              type="checkbox"
              class="checkbox checkbox-primary checkbox-sm"
            />
            <span class="label-text text-xs">
              Attested by Faculty In-charge on printed form (required if
              student)
            </span>
          </label>
        </div>

        <div class="form-control">
          <label class="label"
            ><span class="label-text font-medium"
              >Clearance Remarks</span
            ></label
          >
          <input
            v-model="form.clearanceNotes"
            type="text"
            placeholder="Optional clearance notes"
            class="input input-bordered input-sm w-full"
          />
        </div>

        <div class="modal-action">
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            :disabled="submitting"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-success btn-sm"
            :disabled="submitting"
          >
            <span
              v-if="submitting"
              class="loading loading-spinner loading-xs"
            />
            Certify Clearance &amp; Return Student ID
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
