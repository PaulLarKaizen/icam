<script setup lang="ts">
import { Plus, Trash2, AlertTriangle } from "@lucide/vue";
import { DEFAULT_ADVANCE_NOTICE_HOURS } from "~~/shared/constants/requisition";
import type { InventoryItem } from "~~/shared/types/inventory";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submitted: [];
}>();

const catalogItems = ref<InventoryItem[]>([]);
const loadingCatalog = ref(false);
const submitting = ref(false);
const formError = ref<string | null>(null);

interface DraftLine {
  itemId: string;
  requestedQty: number;
  remarks: string;
}

const form = reactive({
  borrowerName: "",
  borrowerStudentId: "",
  schoolDepartment: "SMLS",
  courseYearSection: "",
  courseActivity: "",
  neededAt: "",
  expectedReturnAt: "",
  lateRequestReason: "",
  items: [{ itemId: "", requestedQty: 1, remarks: "" }] as DraftLine[],
});

const isLatePreview = computed(() => {
  if (!form.neededAt) return false;
  const diffMs = new Date(form.neededAt).getTime() - Date.now();
  return diffMs < DEFAULT_ADVANCE_NOTICE_HOURS * 60 * 60 * 1000;
});

async function loadCatalogOptions() {
  loadingCatalog.value = true;
  try {
    const res = await $fetch<{ items: InventoryItem[] }>("/api/v1/catalog");
    catalogItems.value = res.items;
  } catch {
    catalogItems.value = [];
  } finally {
    loadingCatalog.value = false;
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      formError.value = null;
      loadCatalogOptions();
    }
  },
);

function addLine() {
  form.items.push({ itemId: "", requestedQty: 1, remarks: "" });
}

function removeLine(index: number) {
  if (form.items.length > 1) {
    form.items.splice(index, 1);
  }
}

async function handleSubmit() {
  submitting.value = true;
  formError.value = null;

  try {
    await $fetch("/api/v1/requisitions", {
      method: "POST",
      body: {
        borrowerName: form.borrowerName,
        borrowerStudentId: form.borrowerStudentId,
        schoolDepartment: form.schoolDepartment,
        courseYearSection: form.courseYearSection,
        courseActivity: form.courseActivity,
        neededAt: new Date(form.neededAt).toISOString(),
        expectedReturnAt: new Date(form.expectedReturnAt).toISOString(),
        lateRequestReason: isLatePreview.value ? form.lateRequestReason : "",
        items: form.items.map((line) => ({
          itemId: line.itemId,
          requestedQty: Number(line.requestedQty),
          remarks: line.remarks,
        })),
      },
    });

    form.borrowerName = "";
    form.borrowerStudentId = "";
    form.courseYearSection = "";
    form.courseActivity = "";
    form.neededAt = "";
    form.expectedReturnAt = "";
    form.lateRequestReason = "";
    form.items = [{ itemId: "", requestedQty: 1, remarks: "" }];

    emit("submitted");
    emit("close");
  } catch (err: any) {
    formError.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Failed to submit requisition.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box max-w-3xl">
      <h3 class="text-lg font-bold">New Laboratory Requisition (F-VPA-012)</h3>
      <p class="text-xs opacity-70 mt-1">
        Submitting creates a pending request without deducting stock. Inventory
        is reserved upon custodian approval.
      </p>

      <div v-if="formError" class="alert alert-error mt-3 text-sm">
        <span>{{ formError }}</span>
      </div>

      <form class="space-y-4 mt-4" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium"
                >Designated Group Leader / Borrower *</span
              ></label
            >
            <input
              v-model="form.borrowerName"
              type="text"
              placeholder="Student full name"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium"
                >Borrower Student ID</span
              ></label
            >
            <input
              v-model="form.borrowerStudentId"
              type="text"
              placeholder="e.g., 2023-00145"
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium">Department *</span></label
            >
            <input
              v-model="form.schoolDepartment"
              type="text"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium"
                >Course, Year &amp; Section *</span
              ></label
            >
            <input
              v-model="form.courseYearSection"
              type="text"
              placeholder="e.g., BSMLS 3-A"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium"
                >Course / Activity *</span
              ></label
            >
            <input
              v-model="form.courseActivity"
              type="text"
              placeholder="e.g., Hematology Lab 2"
              class="input input-bordered w-full"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium"
                >Date &amp; Time Needed *</span
              ></label
            >
            <input
              v-model="form.neededAt"
              type="datetime-local"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium"
                >Expected Return Date &amp; Time *</span
              ></label
            >
            <input
              v-model="form.expectedReturnAt"
              type="datetime-local"
              class="input input-bordered w-full"
              required
            />
          </div>
        </div>

        <!-- Late Request Warning (Never blocks submission) -->
        <div v-if="isLatePreview" class="alert alert-warning text-xs">
          <AlertTriangle class="w-4 h-4 shrink-0" />
          <div class="flex-1 space-y-2">
            <p>
              <strong>Late-Request Notice:</strong> Standard advance notice is
              {{ DEFAULT_ADVANCE_NOTICE_HOURS }} hours before the activity. Your
              actual server timestamp will be preserved and flagged for
              custodian review.
            </p>
            <input
              v-model="form.lateRequestReason"
              type="text"
              placeholder="Optional note/reason for custodian review"
              class="input input-bordered input-xs w-full bg-base-100 text-base-content"
            />
          </div>
        </div>

        <!-- Requested Items -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-sm"
              >Requested Equipment &amp; Apparatus *</span
            >
            <button
              type="button"
              class="btn btn-outline btn-xs"
              @click="addLine"
            >
              <Plus class="w-3.5 h-3.5" />
              Add Item Line
            </button>
          </div>

          <div
            v-for="(line, idx) in form.items"
            :key="idx"
            class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-base-200 p-2 rounded-box"
          >
            <select
              v-model="line.itemId"
              class="select select-bordered select-sm sm:col-span-6"
              required
            >
              <option value="" disabled>
                {{
                  loadingCatalog
                    ? "Loading catalog..."
                    : "Select laboratory item..."
                }}
              </option>
              <option
                v-for="item in catalogItems"
                :key="item.id"
                :value="item.id"
              >
                {{ item.name }}
                {{ item.specification ? `(${item.specification})` : "" }} —
                Avail: {{ item.availableQty }} {{ item.unit }}
              </option>
            </select>

            <input
              v-model.number="line.requestedQty"
              type="number"
              min="1"
              step="1"
              class="input input-bordered input-sm sm:col-span-2"
              placeholder="Qty"
              required
            />

            <input
              v-model="line.remarks"
              type="text"
              class="input input-bordered input-sm sm:col-span-3"
              placeholder="Line note (optional)"
            />

            <button
              type="button"
              class="btn btn-ghost btn-xs text-error sm:col-span-1"
              :disabled="form.items.length === 1"
              @click="removeLine(idx)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="modal-action">
          <button
            type="button"
            class="btn btn-ghost"
            :disabled="submitting"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span
              v-if="submitting"
              class="loading loading-spinner loading-xs"
            />
            Submit Requisition
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
