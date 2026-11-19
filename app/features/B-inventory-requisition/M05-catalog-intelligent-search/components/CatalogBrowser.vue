<script setup lang="ts">
import {
  Search,
  Plus,
  Eye,
  Pencil,
  RefreshCw,
  AlertCircle,
  Package,
} from "@lucide/vue";
import type {
  InventoryCategory,
  InventoryItem,
  InventoryTrackingMode,
} from "~~/shared/types/inventory";
import InventoryManagerModal from "../../M04-inventory-management/components/InventoryManagerModal.vue";

const { canManageInventory } = useIcamUser();

const search = ref("");
const category = ref<InventoryCategory | "">("");
const trackingMode = ref<InventoryTrackingMode | "">("");
const availableOnly = ref(false);

const items = ref<InventoryItem[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

const selectedDetailItem = ref<InventoryItem | null>(null);
const managerModalOpen = ref(false);
const editingItem = ref<InventoryItem | null>(null);

async function loadItems() {
  loading.value = true;
  errorMessage.value = null;

  try {
    const endpoint = canManageInventory.value
      ? "/api/v1/inventory"
      : "/api/v1/catalog";
    const response = await $fetch<{ items: InventoryItem[] }>(endpoint, {
      query: {
        search: search.value || undefined,
        category: category.value || undefined,
        trackingMode: trackingMode.value || undefined,
        availableOnly: availableOnly.value ? "true" : undefined,
      },
    });
    items.value = response.items;
  } catch (err: any) {
    items.value = [];
    errorMessage.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Unable to load laboratory inventory. Please sign in with an authorized SDCA account.";
  } finally {
    loading.value = false;
  }
}

let searchDebounce: ReturnType<typeof setTimeout> | null = null;
watch(search, () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    loadItems();
  }, 250);
});

watch([category, trackingMode, availableOnly], () => {
  loadItems();
});

onMounted(() => {
  loadItems();
});

function openCreateModal() {
  editingItem.value = null;
  managerModalOpen.value = true;
}

function openEditModal(item: InventoryItem) {
  editingItem.value = item;
  managerModalOpen.value = true;
}
</script>

<template>
  <section class="space-y-4">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div>
        <h1 class="text-2xl font-bold">
          Laboratory Equipment & Apparatus Catalog
        </h1>
        <p class="text-sm opacity-75">
          Real-time on-hand, reserved, and available stock across SMLS
          laboratories (M04 &amp; M05).
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="btn btn-ghost btn-sm"
          :disabled="loading"
          @click="loadItems"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          Refresh
        </button>

        <button
          v-if="canManageInventory"
          class="btn btn-primary btn-sm"
          @click="openCreateModal"
        >
          <Plus class="w-4 h-4" />
          Add Item
        </button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="card bg-base-100 border border-base-300 shadow-xs">
      <div class="card-body p-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label
            class="input input-bordered flex items-center gap-2 md:col-span-5"
          >
            <Search class="w-4 h-4 opacity-60" />
            <input
              v-model="search"
              type="text"
              class="grow"
              placeholder="Search name, specification (e.g. 250 mL), or location..."
            />
          </label>

          <select
            v-model="category"
            class="select select-bordered md:col-span-2"
          >
            <option value="">All Categories</option>
            <option value="Equipment">Equipment</option>
            <option value="Apparatus">Apparatus</option>
            <option value="Material">Material</option>
          </select>

          <select
            v-model="trackingMode"
            class="select select-bordered md:col-span-3"
          >
            <option value="">All Tracking Modes</option>
            <option value="quantity">Quantity-Tracked</option>
            <option value="serialized">Serialized Assets</option>
          </select>

          <label class="label cursor-pointer justify-start gap-2 md:col-span-2">
            <input
              v-model="availableOnly"
              type="checkbox"
              class="checkbox checkbox-primary checkbox-sm"
            />
            <span class="label-text text-sm">Available only</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="card bg-base-100 border border-base-300 p-12 text-center"
    >
      <span class="loading loading-spinner loading-lg mx-auto text-primary" />
      <p class="mt-3 text-sm opacity-75">
        Loading laboratory catalog from Supabase...
      </p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="alert alert-error">
      <AlertCircle class="w-5 h-5 shrink-0" />
      <div class="flex-1">
        <h3 class="font-semibold">Unable to Load Catalog</h3>
        <p class="text-xs">{{ errorMessage }}</p>
      </div>
      <button class="btn btn-sm" @click="loadItems">Retry</button>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="items.length === 0"
      class="card bg-base-100 border border-base-300 p-12 text-center"
    >
      <Package class="w-10 h-10 mx-auto opacity-40" />
      <h3 class="mt-3 font-semibold">No matching laboratory items found</h3>
      <p class="text-sm opacity-70 mt-1">
        Try clearing your search filters or add baseline equipment records in
        Supabase.
      </p>
    </div>

    <!-- Inventory Table -->
    <div
      v-else
      class="card bg-base-100 border border-base-300 shadow-xs overflow-x-auto"
    >
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Item &amp; Specification</th>
            <th>Category / Mode</th>
            <th>Location</th>
            <th class="text-right">On-Hand</th>
            <th class="text-right">Reserved</th>
            <th class="text-right">Available</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            :class="{ 'opacity-50': !item.isActive }"
          >
            <td>
              <div class="font-semibold">{{ item.name }}</div>
              <div class="text-xs opacity-70">
                {{ item.specification || "Standard" }} · Unit: {{ item.unit }}
              </div>
            </td>

            <td>
              <div class="flex flex-wrap gap-1">
                <span class="badge badge-outline badge-sm">{{
                  item.category
                }}</span>
                <span
                  class="badge badge-sm"
                  :class="
                    item.trackingMode === 'serialized'
                      ? 'badge-info'
                      : 'badge-ghost'
                  "
                >
                  {{
                    item.trackingMode === "serialized"
                      ? "Serialized"
                      : "Quantity"
                  }}
                </span>
              </div>
            </td>

            <td class="text-sm">{{ item.location }}</td>

            <td class="text-right font-mono">{{ item.onHandQty }}</td>
            <td class="text-right font-mono text-warning">
              {{ item.reservedQty }}
            </td>
            <td class="text-right font-mono font-bold">
              <span
                :class="item.availableQty > 0 ? 'text-success' : 'text-error'"
              >
                {{ item.availableQty }}
              </span>
            </td>

            <td class="text-right">
              <div class="join">
                <button
                  class="btn btn-ghost btn-xs join-item"
                  title="View item details"
                  @click="selectedDetailItem = item"
                >
                  <Eye class="w-4 h-4" />
                </button>
                <button
                  v-if="canManageInventory"
                  class="btn btn-ghost btn-xs join-item"
                  title="Edit stock"
                  @click="openEditModal(item)"
                >
                  <Pencil class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Item & Serialized Units Detail Modal -->
    <dialog class="modal" :class="{ 'modal-open': !!selectedDetailItem }">
      <div v-if="selectedDetailItem" class="modal-box max-w-2xl">
        <h3 class="text-lg font-bold">{{ selectedDetailItem.name }}</h3>
        <p class="text-xs opacity-70">
          {{ selectedDetailItem.category }} ·
          {{ selectedDetailItem.specification || "No spec" }} · Location:
          {{ selectedDetailItem.location }}
        </p>

        <div
          class="stats stats-horizontal shadow-xs border border-base-300 w-full mt-4"
        >
          <div class="stat py-3">
            <div class="stat-title text-xs">On-Hand</div>
            <div class="stat-value text-xl">
              {{ selectedDetailItem.onHandQty }}
            </div>
          </div>
          <div class="stat py-3">
            <div class="stat-title text-xs">Reserved</div>
            <div class="stat-value text-xl text-warning">
              {{ selectedDetailItem.reservedQty }}
            </div>
          </div>
          <div class="stat py-3">
            <div class="stat-title text-xs">Available</div>
            <div class="stat-value text-xl text-success">
              {{ selectedDetailItem.availableQty }}
            </div>
          </div>
          <div class="stat py-3">
            <div class="stat-title text-xs">Defective</div>
            <div class="stat-value text-xl text-error">
              {{ selectedDetailItem.defectiveQty }}
            </div>
          </div>
        </div>

        <div
          v-if="selectedDetailItem.defectiveNotes"
          class="alert mt-3 text-xs"
        >
          <span
            ><strong>Condition Notes:</strong>
            {{ selectedDetailItem.defectiveNotes }}</span
          >
        </div>

        <!-- Individual Serialized Units -->
        <div
          v-if="selectedDetailItem.trackingMode === 'serialized'"
          class="mt-4"
        >
          <h4 class="font-semibold text-sm mb-2">
            Individual Serialized Units
          </h4>
          <div
            v-if="!selectedDetailItem.assets?.length"
            class="text-xs opacity-70"
          >
            No individual asset serials registered yet.
          </div>
          <div
            v-else
            class="overflow-x-auto max-h-60 border border-base-300 rounded-box"
          >
            <table class="table table-xs">
              <thead>
                <tr>
                  <th>Serial #</th>
                  <th>Calibration</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="asset in selectedDetailItem.assets" :key="asset.id">
                  <td class="font-mono font-semibold">
                    {{ asset.serialNumber }}
                  </td>
                  <td>{{ asset.calibration }}</td>
                  <td>{{ asset.conditionIssue }}</td>
                  <td>
                    <span
                      class="badge badge-xs"
                      :class="{
                        'badge-success':
                          asset.availabilityStatus === 'Available',
                        'badge-warning':
                          asset.availabilityStatus === 'Reserved',
                        'badge-info': asset.availabilityStatus === 'Issued',
                        'badge-error':
                          asset.availabilityStatus === 'Unavailable',
                      }"
                    >
                      {{ asset.availabilityStatus }}
                    </span>
                  </td>
                  <td>{{ asset.location }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-sm" @click="selectedDetailItem = null">
            Close
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" @click="selectedDetailItem = null">close</button>
      </form>
    </dialog>

    <!-- Custodian Create/Edit Modal -->
    <InventoryManagerModal
      :open="managerModalOpen"
      :edit-item="editingItem"
      @close="managerModalOpen = false"
      @saved="loadItems"
    />
  </section>
</template>
