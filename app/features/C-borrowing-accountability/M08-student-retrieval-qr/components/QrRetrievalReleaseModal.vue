<script setup lang="ts">
import { QrCode, ShieldCheck } from "@lucide/vue";
import type { RequisitionRecord } from "~~/shared/types/requisition";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  issued: [];
}>();

const tokenInput = ref("");
const lookingUp = ref(false);
const retrievedReq = ref<RequisitionRecord | null>(null);
const lookupError = ref<string | null>(null);

const releaseForm = reactive({
  receivedByName: "",
  receivedByStudentId: "",
  facultySignatureVerified: false,
  borrowerSignatureVerified: false,
  studentIdHeld: false,
  preReleaseNotes: "",
});

const releasing = ref(false);
const releaseError = ref<string | null>(null);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      tokenInput.value = "";
      retrievedReq.value = null;
      lookupError.value = null;
      releaseError.value = null;
      releaseForm.receivedByName = "";
      releaseForm.receivedByStudentId = "";
      releaseForm.facultySignatureVerified = false;
      releaseForm.borrowerSignatureVerified = false;
      releaseForm.studentIdHeld = false;
      releaseForm.preReleaseNotes = "";
    }
  },
);

async function handleLookup() {
  if (!tokenInput.value.trim()) return;
  lookingUp.value = true;
  lookupError.value = null;
  releaseError.value = null;
  retrievedReq.value = null;

  try {
    const encoded = encodeURIComponent(tokenInput.value.trim());
    const res = await $fetch<{ requisition: RequisitionRecord }>(
      `/api/v1/borrowing/qr/${encoded}`,
    );
    retrievedReq.value = res.requisition;
    releaseForm.receivedByName = res.requisition.borrowerName;
    releaseForm.receivedByStudentId = res.requisition.borrowerStudentId;
  } catch (err: any) {
    lookupError.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Unable to retrieve requisition.";
  } finally {
    lookingUp.value = false;
  }
}

async function handleRelease() {
  if (!retrievedReq.value) return;
  releasing.value = true;
  releaseError.value = null;

  try {
    await $fetch("/api/v1/issuance", {
      method: "POST",
      body: {
        requisitionId: retrievedReq.value.id,
        receivedByName: releaseForm.receivedByName,
        receivedByStudentId: releaseForm.receivedByStudentId,
        facultySignatureVerified: releaseForm.facultySignatureVerified,
        borrowerSignatureVerified: releaseForm.borrowerSignatureVerified,
        studentIdHeld: releaseForm.studentIdHeld,
        preReleaseNotes: releaseForm.preReleaseNotes,
      },
    });

    emit("issued");
    emit("close");
  } catch (err: any) {
    releaseError.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Failed to record physical release.";
  } finally {
    releasing.value = false;
  }
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box max-w-2xl">
      <h3 class="text-lg font-bold flex items-center gap-2">
        <QrCode class="w-5 h-5 text-primary" />
        Counter QR Retrieval &amp; Physical Release (M08 &amp; M09)
      </h3>
      <p class="text-xs opacity-70 mt-1">
        Scanning/entering a QR token retrieves the requisition only. Physical
        release requires Student ID collateral and wet-ink F-VPA-012 sign-off.
      </p>

      <!-- Step 1: Retrieve by QR Token or Reference Code -->
      <form class="join w-full mt-4" @submit.prevent="handleLookup">
        <input
          v-model="tokenInput"
          type="text"
          placeholder="Scan or enter ICAM-QR-... or REQ-..."
          class="input input-bordered join-item w-full font-mono text-sm"
          required
        />
        <button
          type="submit"
          class="btn btn-primary join-item"
          :disabled="lookingUp"
        >
          <span v-if="lookingUp" class="loading loading-spinner loading-xs" />
          Retrieve
        </button>
      </form>

      <div v-if="lookupError" class="alert alert-error mt-3 text-sm">
        <span>{{ lookupError }}</span>
      </div>

      <!-- Step 2: Retrieved Requisition & Counter Verification -->
      <div v-if="retrievedReq" class="mt-4 space-y-4">
        <div class="bg-base-200 p-3 rounded-box text-xs space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-mono font-bold">{{
              retrievedReq.referenceCode
            }}</span>
            <span
              class="badge badge-sm"
              :class="
                retrievedReq.status === 'Approved'
                  ? 'badge-success'
                  : 'badge-warning'
              "
            >
              {{ retrievedReq.status }}
            </span>
          </div>
          <div>
            <strong>Activity:</strong> {{ retrievedReq.courseActivity }} ({{
              retrievedReq.courseYearSection
            }})
          </div>
          <div>
            <strong>Faculty In-Charge:</strong>
            {{ retrievedReq.requesterName || "Faculty" }}
          </div>
          <div>
            <strong>Designated Borrower:</strong>
            {{ retrievedReq.borrowerName }}
          </div>
        </div>

        <div class="overflow-x-auto border border-base-300 rounded-box">
          <table class="table table-xs">
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Approved Qty</th>
                <th>Reserved Serials</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="line in retrievedReq.items.filter(
                  (i) => i.approvedQty > 0,
                )"
                :key="line.id"
              >
                <td>
                  {{ line.itemName }}
                  {{
                    line.itemSpecification ? `(${line.itemSpecification})` : ""
                  }}
                </td>
                <td class="text-right font-mono font-bold">
                  {{ line.approvedQty }} {{ line.itemUnit }}
                </td>
                <td class="font-mono text-xs">
                  {{
                    line.assignedSerials.length
                      ? line.assignedSerials.join(", ")
                      : "Bulk stock"
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="retrievedReq.status !== 'Approved'"
          class="alert alert-warning text-xs"
        >
          <span>
            Only <strong>Approved</strong> requisitions can be released at the
            counter (current status: {{ retrievedReq.status }}).
          </span>
        </div>

        <form v-else class="space-y-3" @submit.prevent="handleRelease">
          <div v-if="releaseError" class="alert alert-error text-sm">
            <span>{{ releaseError }}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label"
                ><span class="label-text font-medium"
                  >Received By (Borrower) *</span
                ></label
              >
              <input
                v-model="releaseForm.receivedByName"
                type="text"
                class="input input-bordered input-sm w-full"
                required
              />
            </div>

            <div class="form-control">
              <label class="label"
                ><span class="label-text font-medium"
                  >Student ID Number</span
                ></label
              >
              <input
                v-model="releaseForm.receivedByStudentId"
                type="text"
                class="input input-bordered input-sm w-full"
              />
            </div>
          </div>

          <div
            class="border border-base-300 rounded-box p-3 space-y-2 bg-base-100"
          >
            <div class="text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck class="w-4 h-4 text-primary" />
              Mandatory Counter Safeguards (F-VPA-012)
            </div>

            <label class="label cursor-pointer justify-start gap-3 py-1">
              <input
                v-model="releaseForm.studentIdHeld"
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                required
              />
              <span class="label-text text-xs">
                Physical Student ID collected as collateral (Status:
                <strong>Held</strong>)
              </span>
            </label>

            <label class="label cursor-pointer justify-start gap-3 py-1">
              <input
                v-model="releaseForm.facultySignatureVerified"
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                required
              />
              <span class="label-text text-xs">
                Faculty In-charge wet-ink signature verified on printed
                F-VPA-012
              </span>
            </label>

            <label class="label cursor-pointer justify-start gap-3 py-1">
              <input
                v-model="releaseForm.borrowerSignatureVerified"
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                required
              />
              <span class="label-text text-xs">
                Borrower wet-ink "Received by" signature captured on printed
                F-VPA-012
              </span>
            </label>
          </div>

          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium"
                >Pre-Release Condition Notes</span
              ></label
            >
            <input
              v-model="releaseForm.preReleaseNotes"
              type="text"
              placeholder="Optional pre-release inspection notes"
              class="input input-bordered input-sm w-full"
            />
          </div>

          <div class="modal-action">
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="releasing"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary btn-sm"
              :disabled="releasing"
            >
              <span
                v-if="releasing"
                class="loading loading-spinner loading-xs"
              />
              Confirm Release &amp; Deduct Stock
            </button>
          </div>
        </form>
      </div>

      <div
        v-if="!retrievedReq || retrievedReq.status !== 'Approved'"
        class="modal-action"
      >
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          @click="emit('close')"
        >
          Close
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
