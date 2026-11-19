<script setup lang="ts">
import type {
  InventoryCategory,
  InventoryItem,
  InventoryTrackingMode,
} from "~~/shared/types/inventory";

const props = defineProps<{
  open: boolean;
  editItem: InventoryItem | null;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const submitting = ref(false);
const formError = ref<string | null>(null);

const form = reactive({
  name: "",
  category: "Apparatus" as InventoryCategory,
  trackingMode: "quantity" as InventoryTrackingMode,
  specification: "",
  unit: "pcs",
  location: "",
  onHandQty: 0,
  defectiveQty: 0,
  defectiveNotes: "",
  isActive: true,
});

watch(
  () => [props.open, props.editItem],
  () => {
    formError.value = null;
    if (props.editItem) {
      form.name = props.editItem.name;
      form.category = props.editItem.category;
      form.trackingMode = props.editItem.trackingMode;
      form.specification = props.editItem.specification;
      form.unit = props.editItem.unit;
      form.location = props.editItem.location;
      form.onHandQty = props.editItem.onHandQty;
      form.defectiveQty = props.editItem.defectiveQty;
      form.defectiveNotes = props.editItem.defectiveNotes;
      form.isActive = props.editItem.isActive;
    } else {
      form.name = "";
      form.category = "Apparatus";
      form.trackingMode = "quantity";
      form.specification = "";
      form.unit = "pcs";
      form.location = "";
      form.onHandQty = 0;
      form.defectiveQty = 0;
      form.defectiveNotes = "";
      form.isActive = true;
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  submitting.value = true;
  formError.value = null;

  try {
    if (props.editItem) {
      const payload: Record<string, unknown> = {
        location: form.location,
        defectiveNotes: form.defectiveNotes,
        isActive: form.isActive,
      };

      if (props.editItem.trackingMode === "quantity") {
        payload.onHandQty = Number(form.onHandQty);
        payload.defectiveQty = Number(form.defectiveQty);
      }

      await $fetch(`/api/v1/inventory/${props.editItem.id}`, {
        method: "PATCH",
        body: payload,
      });
    } else {
      await $fetch("/api/v1/inventory", {
        method: "POST",
        body: {
          name: form.name,
          category: form.category,
          trackingMode: form.trackingMode,
          specification: form.specification,
          unit: form.unit,
          location: form.location,
          onHandQty:
            form.trackingMode === "quantity" ? Number(form.onHandQty) : 0,
          defectiveQty:
            form.trackingMode === "quantity" ? Number(form.defectiveQty) : 0,
          defectiveNotes: form.defectiveNotes,
        },
      });
    }

    emit("saved");
    emit("close");
  } catch (err: any) {
    formError.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Unable to save inventory record.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box max-w-lg">
      <h3 class="text-lg font-bold">
        {{
          editItem
            ? `Update Stock: ${editItem.name}`
            : "Add Laboratory Inventory Item"
        }}
      </h3>
      <p class="text-xs opacity-70 mt-1">
        All stock updates are validated server-side and recorded in the Activity
        Log.
      </p>

      <div v-if="formError" class="alert alert-error mt-4 text-sm">
        <span>{{ formError }}</span>
      </div>

      <form class="space-y-3 mt-4" @submit.prevent="handleSubmit">
        <template v-if="!editItem">
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium">Item Name *</span></label
            >
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g., Beaker or Compound Microscope"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label"
                ><span class="label-text font-medium">Category *</span></label
              >
              <select
                v-model="form.category"
                class="select select-bordered w-full"
              >
                <option value="Equipment">Equipment</option>
                <option value="Apparatus">Apparatus</option>
                <option value="Material">Material</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label"
                ><span class="label-text font-medium"
                  >Tracking Mode *</span
                ></label
              >
              <select
                v-model="form.trackingMode"
                class="select select-bordered w-full"
              >
                <option value="quantity">Quantity-Tracked (Bulk)</option>
                <option value="serialized">
                  Serialized Asset (Unit Serials)
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label"
                ><span class="label-text font-medium"
                  >Specification</span
                ></label
              >
              <input
                v-model="form.specification"
                type="text"
                placeholder="e.g., 250 mL, 10-100 uL"
                class="input input-bordered w-full"
              />
            </div>

            <div class="form-control">
              <label class="label"
                ><span class="label-text font-medium">Unit *</span></label
              >
              <input
                v-model="form.unit"
                type="text"
                placeholder="pcs, box, roll"
                class="input input-bordered w-full"
                required
              />
            </div>
          </div>
        </template>

        <div class="form-control">
          <label class="label"
            ><span class="label-text font-medium"
              >Storage Location *</span
            ></label
          >
          <input
            v-model="form.location"
            type="text"
            placeholder="e.g., MT LAB 3 or Cabinet C1"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div
          v-if="form.trackingMode === 'quantity'"
          class="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">
                On-Hand Qty
                <span v-if="editItem" class="text-xs opacity-60">
                  (Min: {{ editItem.reservedQty }} reserved)
                </span>
              </span>
            </label>
            <input
              v-model.number="form.onHandQty"
              type="number"
              :min="editItem ? editItem.reservedQty : 0"
              step="1"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium">Defective Qty</span></label
            >
            <input
              v-model.number="form.defectiveQty"
              type="number"
              min="0"
              step="1"
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <div v-else class="alert text-xs">
          <span>
            Serialized equipment counts are automatically derived from
            individual unit serial records.
          </span>
        </div>

        <div class="form-control">
          <label class="label"
            ><span class="label-text font-medium"
              >Defective / Condition Notes</span
            ></label
          >
          <textarea
            v-model="form.defectiveNotes"
            rows="2"
            placeholder="Optional notes on damaged or quarantined units"
            class="textarea textarea-bordered w-full"
          />
        </div>

        <div v-if="editItem" class="form-control">
          <label class="label cursor-pointer justify-start gap-3">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="checkbox checkbox-sm"
            />
            <span class="label-text">Active in catalog</span>
          </label>
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
            {{ editItem ? "Save Changes" : "Create Item" }}
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
