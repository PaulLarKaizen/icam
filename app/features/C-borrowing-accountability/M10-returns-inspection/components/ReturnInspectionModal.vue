<script setup lang="ts">
import type { BorrowingTransaction } from "~~/shared/types/borrowing";

const props = defineProps<{
  transaction: BorrowingTransaction | null;
}>();

const emit = defineEmits<{
  close: [];
  inspected: [];
}>();

interface LineInspectionState {
  returnedGoodQty: number;
  damagedQty: number;
  lostQty: number;
  damagedSerials: string[];
  lostSerials: string[];
  conditionNotes: string;
}

const inspections = ref<Record<string, LineInspectionState>>({});
const returnNotes = ref("");
const submitting = ref(false);
const formError = ref<string | null>(null);

watch(
  () => props.transaction,
  (tx) => {
    formError.value = null;
    returnNotes.value = "";
    const next: Record<string, LineInspectionState> = {};
    if (tx) {
      for (const line of tx.items) {
        next[line.id] = {
          returnedGoodQty: line.issuedQty,
          damagedQty: 0,
          lostQty: 0,
          damagedSerials: [],
          lostSerials: [],
          conditionNotes: "",
        };
      }
    }
    inspections.value = next;
  },
  { immediate: true },
);

function toggleSerial(
  lineId: string,
  serial: string,
  target: "damaged" | "lost",
) {
  const entry = inspections.value[lineId];
  if (!entry) return;

  if (target === "damaged") {
    entry.lostSerials = entry.lostSerials.filter((s) => s !== serial);
    if (entry.damagedSerials.includes(serial)) {
      entry.damagedSerials = entry.damagedSerials.filter((s) => s !== serial);
    } else {
      entry.damagedSerials.push(serial);
    }
  } else {
    entry.damagedSerials = entry.damagedSerials.filter((s) => s !== serial);
    if (entry.lostSerials.includes(serial)) {
      entry.lostSerials = entry.lostSerials.filter((s) => s !== serial);
    } else {
      entry.lostSerials.push(serial);
    }
  }
}

async function handleInspect() {
  if (!props.transaction) return;
  submitting.value = true;
  formError.value = null;

  try {
    await $fetch(`/api/v1/returns/${props.transaction.id}`, {
      method: "POST",
      body: {
        returnNotes: returnNotes.value,
        itemInspections: props.transaction.items.map((line) => {
          const state = inspections.value[line.id]!;
          return {
            transactionItemId: line.id,
            returnedGoodQty: Number(state.returnedGoodQty),
            damagedQty: Number(state.damagedQty),
            lostQty: Number(state.lostQty),
            damagedSerials:
              line.trackingMode === "serialized" ? state.damagedSerials : [],
            lostSerials:
              line.trackingMode === "serialized" ? state.lostSerials : [],
            conditionNotes: state.conditionNotes,
          };
        }),
      },
    });

    emit("inspected");
    emit("close");
  } catch (err: any) {
    formError.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Unable to complete return inspection.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': !!transaction }">
    <div v-if="transaction" class="modal-box max-w-3xl">
      <h3 class="text-lg font-bold">
        Return Inspection · {{ transaction.referenceCode }}
      </h3>
      <p class="text-xs opacity-75">
        Borrower: {{ transaction.receivedByName }} · Verify items are clean
        &amp; dry. Damaged or lost items automatically open Form F-VPA-011 Rev.1
        and retain the Student ID.
      </p>

      <div v-if="formError" class="alert alert-error mt-3 text-sm">
        <span>{{ formError }}</span>
      </div>

      <form class="space-y-4 mt-4" @submit.prevent="handleInspect">
        <div
          v-for="line in transaction.items"
          :key="line.id"
          class="border border-base-300 rounded-box p-3 space-y-2 bg-base-100"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="font-semibold text-sm">{{ line.itemName }}</span>
              <span class="text-xs opacity-70 ml-1">
                {{
                  line.itemSpecification ? `(${line.itemSpecification})` : ""
                }}
              </span>
            </div>
            <span class="badge badge-sm badge-outline font-mono">
              Issued: {{ line.issuedQty }} {{ line.itemUnit }}
            </span>
          </div>

          <div
            v-if="inspections[line.id]"
            class="grid grid-cols-1 sm:grid-cols-4 gap-2"
          >
            <div class="form-control">
              <label class="label py-0.5"
                ><span class="label-text text-xs">Good Returned</span></label
              >
              <input
                v-model.number="inspections[line.id]!.returnedGoodQty"
                type="number"
                min="0"
                :max="line.issuedQty"
                class="input input-bordered input-xs font-mono"
                required
              />
            </div>

            <div class="form-control">
              <label class="label py-0.5"
                ><span class="label-text text-xs text-warning"
                  >Damaged / Broken</span
                ></label
              >
              <input
                v-model.number="inspections[line.id]!.damagedQty"
                type="number"
                min="0"
                :max="line.issuedQty"
                class="input input-bordered input-xs font-mono"
                required
              />
            </div>

            <div class="form-control">
              <label class="label py-0.5"
                ><span class="label-text text-xs text-error"
                  >Lost / Missing</span
                ></label
              >
              <input
                v-model.number="inspections[line.id]!.lostQty"
                type="number"
                min="0"
                :max="line.issuedQty"
                class="input input-bordered input-xs font-mono"
                required
              />
            </div>

            <div class="form-control">
              <label class="label py-0.5"
                ><span class="label-text text-xs">Inspection Note</span></label
              >
              <input
                v-model="inspections[line.id]!.conditionNotes"
                type="text"
                placeholder="Clean & dry / chipped..."
                class="input input-bordered input-xs"
              />
            </div>
          </div>

          <!-- Serial selection if serialized item has damaged or lost units -->
          <div
            v-if="
              line.trackingMode === 'serialized' &&
              inspections[line.id] &&
              (inspections[line.id]!.damagedQty > 0 ||
                inspections[line.id]!.lostQty > 0)
            "
            class="bg-base-200 p-2 rounded text-xs space-y-1.5"
          >
            <div class="font-semibold">
              Select exact affected serial numbers ({{
                line.issuedSerials.join(", ")
              }}):
            </div>
            <div class="flex flex-wrap gap-3">
              <div
                v-for="serial in line.issuedSerials"
                :key="serial"
                class="flex items-center gap-1.5 border border-base-300 bg-base-100 px-2 py-1 rounded"
              >
                <span class="font-mono font-semibold">{{ serial }}</span>
                <button
                  type="button"
                  class="btn btn-xs"
                  :class="
                    inspections[line.id]!.damagedSerials.includes(serial)
                      ? 'btn-warning'
                      : 'btn-ghost'
                  "
                  @click="toggleSerial(line.id, serial, 'damaged')"
                >
                  Damaged
                </button>
                <button
                  type="button"
                  class="btn btn-xs"
                  :class="
                    inspections[line.id]!.lostSerials.includes(serial)
                      ? 'btn-error'
                      : 'btn-ghost'
                  "
                  @click="toggleSerial(line.id, serial, 'lost')"
                >
                  Lost
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-control">
          <label class="label"
            ><span class="label-text font-medium"
              >Overall Return Notes</span
            ></label
          >
          <textarea
            v-model="returnNotes"
            rows="2"
            placeholder="General condition or F-VPA-012 return remarks"
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
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary btn-sm"
            :disabled="submitting"
          >
            <span
              v-if="submitting"
              class="loading loading-spinner loading-xs"
            />
            Record Return Inspection
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
