<script setup lang="ts">
import {
  FileText,
  History,
  WifiOff,
  DatabaseBackup,
  RefreshCw,
  CheckCircle2,
  Download,
  Upload,
} from "@lucide/vue";
import type {
  ActivityLogRecord,
  BackupExportBundle,
  BackupSnapshotRecord,
  OutageFormType,
  OutageRecoveryRecord,
  OutageReconciliationStatus,
} from "~~/shared/types/resilience";
import PrintableFormModal from "../../M12-document-form-management/components/PrintableFormModal.vue";

const { canManageOutageRecovery, canManageBackups } = useIcamUser();

const activeTab = ref<"forms" | "activity" | "outage" | "backups">("forms");
const printTemplate = ref<"F-VPA-012" | "F-VPA-011" | null>(null);

// M13 Activity Logs
const activityLogs = ref<ActivityLogRecord[]>([]);
const moduleFilter = ref("");
const loadingActivity = ref(false);

// M14 Outage Paper Recovery & OCR
const outageRecords = ref<OutageRecoveryRecord[]>([]);
const loadingOutage = ref(false);
const ocrProcessing = ref(false);
const savingOutage = ref(false);
const outageError = ref<string | null>(null);

const outageForm = reactive({
  outageReference: "",
  formType: "F-VPA-012" as OutageFormType,
  incidentOccurredAt: "",
  borrowerName: "",
  courseActivity: "",
  ocrRawText: "",
  verifiedSummary: "",
  reconciliationStatus: "Reconciled" as OutageReconciliationStatus,
  humanVerified: false,
});

// M15 Backups
const snapshots = ref<BackupSnapshotRecord[]>([]);
const loadingBackups = ref(false);
const backupNotes = ref("");
const exportingBackup = ref(false);
const backupMessage = ref<string | null>(null);
const backupError = ref<string | null>(null);

async function loadActivity() {
  loadingActivity.value = true;
  try {
    const res = await $fetch<{ logs: ActivityLogRecord[] }>(
      "/api/v1/activity",
      {
        query: { module: moduleFilter.value || undefined, limit: 100 },
      },
    );
    activityLogs.value = res.logs;
  } catch {
    activityLogs.value = [];
  } finally {
    loadingActivity.value = false;
  }
}

async function loadOutageRecords() {
  loadingOutage.value = true;
  try {
    const res = await $fetch<{ records: OutageRecoveryRecord[] }>(
      "/api/v1/outage-recovery",
    );
    outageRecords.value = res.records;
  } catch {
    outageRecords.value = [];
  } finally {
    loadingOutage.value = false;
  }
}

async function handleOcrImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  ocrProcessing.value = true;
  outageError.value = null;
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");
    const result = await worker.recognize(file);
    outageForm.ocrRawText = result.data.text.trim();
    if (!outageForm.verifiedSummary && outageForm.ocrRawText) {
      outageForm.verifiedSummary = outageForm.ocrRawText.slice(0, 400);
    }
    await worker.terminate();
  } catch (err: any) {
    outageError.value =
      err?.message || "OCR scan failed. You may transcribe the form manually.";
  } finally {
    ocrProcessing.value = false;
    input.value = "";
  }
}

async function submitOutageRecord() {
  savingOutage.value = true;
  outageError.value = null;

  try {
    await $fetch("/api/v1/outage-recovery", {
      method: "POST",
      body: {
        outageReference: outageForm.outageReference,
        formType: outageForm.formType,
        incidentOccurredAt: new Date(
          outageForm.incidentOccurredAt,
        ).toISOString(),
        borrowerName: outageForm.borrowerName,
        courseActivity: outageForm.courseActivity,
        ocrRawText: outageForm.ocrRawText,
        verifiedSummary: outageForm.verifiedSummary,
        reconciliationStatus: outageForm.reconciliationStatus,
        humanVerified: outageForm.humanVerified,
      },
    });

    outageForm.outageReference = "";
    outageForm.incidentOccurredAt = "";
    outageForm.borrowerName = "";
    outageForm.courseActivity = "";
    outageForm.ocrRawText = "";
    outageForm.verifiedSummary = "";
    outageForm.humanVerified = false;

    await Promise.all([loadOutageRecords(), loadActivity()]);
  } catch (err: any) {
    outageError.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Unable to save outage recovery log.";
  } finally {
    savingOutage.value = false;
  }
}

async function loadSnapshots() {
  if (!canManageBackups.value) return;
  loadingBackups.value = true;
  try {
    const res = await $fetch<{ snapshots: BackupSnapshotRecord[] }>(
      "/api/v1/backups",
    );
    snapshots.value = res.snapshots;
  } catch {
    snapshots.value = [];
  } finally {
    loadingBackups.value = false;
  }
}

async function handleExportBackup() {
  exportingBackup.value = true;
  backupError.value = null;
  backupMessage.value = null;

  try {
    const res = await $fetch<{ bundle: BackupExportBundle }>(
      "/api/v1/backups/export",
      {
        method: "POST",
        body: { notes: backupNotes.value },
      },
    );

    const blob = new Blob([JSON.stringify(res.bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${res.bundle.snapshot.snapshotCode}.json`;
    a.click();
    URL.revokeObjectURL(url);

    backupNotes.value = "";
    backupMessage.value = `Exported snapshot ${res.bundle.snapshot.snapshotCode}.`;
    await Promise.all([loadSnapshots(), loadActivity()]);
  } catch (err: any) {
    backupError.value =
      err?.data?.statusMessage || err?.statusMessage || "Backup export failed.";
  } finally {
    exportingBackup.value = false;
  }
}

async function handleVerifyBackupFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  backupError.value = null;
  backupMessage.value = null;

  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    const res = await $fetch<{ snapshot: BackupSnapshotRecord }>(
      "/api/v1/backups/verify",
      {
        method: "POST",
        body: {
          snapshotCode: parsed?.snapshot?.snapshotCode ?? parsed?.snapshotCode,
          exportedAt: parsed?.exportedAt,
          tables: parsed?.tables,
        },
      },
    );
    backupMessage.value = res.snapshot.notes;
    await Promise.all([loadSnapshots(), loadActivity()]);
  } catch (err: any) {
    backupError.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Invalid backup JSON file.";
  } finally {
    input.value = "";
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
  loadActivity();
  loadOutageRecords();
  loadSnapshots();
});
</script>

<template>
  <section class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold">
        Documentation, Audit Logs &amp; Resilience (M12 - M15)
      </h1>
      <p class="text-sm opacity-75">
        Printable institutional forms (M12), immutable server activity trail
        (M13), post-outage paper reconciliation with OCR (M14), and database
        backup snapshots (M15).
      </p>
    </div>

    <!-- Module Tabs -->
    <div role="tablist" class="tabs tabs-boxed w-fit">
      <button
        role="tab"
        class="tab gap-1.5"
        :class="{ 'tab-active': activeTab === 'forms' }"
        @click="activeTab = 'forms'"
      >
        <FileText class="w-4 h-4" />
        M12 Printable Forms
      </button>
      <button
        role="tab"
        class="tab gap-1.5"
        :class="{ 'tab-active': activeTab === 'activity' }"
        @click="activeTab = 'activity'"
      >
        <History class="w-4 h-4" />
        M13 Activity Logs
      </button>
      <button
        role="tab"
        class="tab gap-1.5"
        :class="{ 'tab-active': activeTab === 'outage' }"
        @click="activeTab = 'outage'"
      >
        <WifiOff class="w-4 h-4" />
        M14 Outage Recovery
      </button>
      <button
        v-if="canManageBackups"
        role="tab"
        class="tab gap-1.5"
        :class="{ 'tab-active': activeTab === 'backups' }"
        @click="activeTab = 'backups'"
      >
        <DatabaseBackup class="w-4 h-4" />
        M15 Backups
      </button>
    </div>

    <!-- M12: Printable Institutional Forms -->
    <div
      v-if="activeTab === 'forms'"
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div class="card bg-base-100 border border-base-300 shadow-xs">
        <div class="card-body">
          <h2 class="card-title text-base">
            Form F-VPA-012 (01-06-14) - Requisition Form
          </h2>
          <p class="text-xs opacity-75">
            Generates a blank outage contingency sheet or pre-populated
            requisition sheet with wet-ink signature blocks for Faculty
            In-charge, Custodian, and Borrower.
          </p>
          <div class="card-actions justify-end mt-2">
            <button
              class="btn btn-primary btn-sm"
              @click="printTemplate = 'F-VPA-012'"
            >
              Open Printable F-VPA-012
            </button>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-300 shadow-xs">
        <div class="card-body">
          <h2 class="card-title text-base">
            Form F-VPA-011 Rev.1 (10-02-23) - Agreement of Liability
          </h2>
          <p class="text-xs opacity-75">
            Official two-copy accountability and clearance certificate for
            damaged or lost laboratory equipment settled via Cashier OR or exact
            item replacement.
          </p>
          <div class="card-actions justify-end mt-2">
            <button
              class="btn btn-primary btn-sm"
              @click="printTemplate = 'F-VPA-011'"
            >
              Open Printable F-VPA-011 Rev.1
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- M13: Transaction History & Activity Logs -->
    <div v-else-if="activeTab === 'activity'" class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <select
            v-model="moduleFilter"
            class="select select-bordered select-sm"
            @change="loadActivity"
          >
            <option value="">All Modules</option>
            <option value="M04">M04 Inventory</option>
            <option value="M06">M06 Requisitions</option>
            <option value="M07">M07 Reservations</option>
            <option value="M09">M09 Issuance</option>
            <option value="M10">M10 Returns</option>
            <option value="M11">M11 Liability</option>
            <option value="M14">M14 Outage Recovery</option>
            <option value="M15">M15 Backups</option>
          </select>
        </div>

        <button
          class="btn btn-ghost btn-sm"
          :disabled="loadingActivity"
          @click="loadActivity"
        >
          <RefreshCw
            class="w-4 h-4"
            :class="{ 'animate-spin': loadingActivity }"
          />
          Refresh
        </button>
      </div>

      <div
        class="card bg-base-100 border border-base-300 shadow-xs overflow-x-auto"
      >
        <table class="table table-zebra table-sm">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Module</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="activityLogs.length === 0">
              <td colspan="5" class="text-center py-8 opacity-70">
                No activity logs recorded yet.
              </td>
            </tr>
            <tr v-for="log in activityLogs" :key="log.id">
              <td class="text-xs whitespace-nowrap">
                {{ formatDateTime(log.createdAt) }}
              </td>
              <td>
                <span class="badge badge-outline badge-xs font-mono">{{
                  log.moduleCode
                }}</span>
              </td>
              <td class="text-xs">
                <div class="font-medium">{{ log.actorName }}</div>
                <div class="opacity-60 uppercase text-[10px]">
                  {{ log.actorRole }}
                </div>
              </td>
              <td class="font-mono text-xs">{{ log.action }}</td>
              <td class="text-xs">{{ log.summary }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- M14: Outage & Paper Recovery -->
    <div v-else-if="activeTab === 'outage'" class="space-y-4">
      <div
        v-if="canManageOutageRecovery"
        class="card bg-base-100 border border-base-300 shadow-xs"
      >
        <div class="card-body space-y-3">
          <h2 class="card-title text-base">
            Reconcile Paper Outage Form (OCR + Mandatory Human Verification)
          </h2>
          <p class="text-xs opacity-75">
            Upload a photo/scan of an accomplished F-VPA-012 or F-VPA-011 Rev.1
            sheet to extract text via Tesseract.js OCR, verify all fields, and
            log with a unique Outage Reference ID. (Chemical OCR is excluded.)
          </p>

          <div v-if="outageError" class="alert alert-error text-xs">
            <span>{{ outageError }}</span>
          </div>

          <form class="space-y-3" @submit.prevent="submitOutageRecord">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="form-control">
                <label class="label py-1"
                  ><span class="label-text text-xs font-medium"
                    >Outage Reference ID *</span
                  ></label
                >
                <input
                  v-model="outageForm.outageReference"
                  type="text"
                  placeholder="e.g., OUT-20261119-001"
                  class="input input-bordered input-sm font-mono"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label py-1"
                  ><span class="label-text text-xs font-medium"
                    >Form Type *</span
                  ></label
                >
                <select
                  v-model="outageForm.formType"
                  class="select select-bordered select-sm"
                >
                  <option value="F-VPA-012">F-VPA-012 (Requisition)</option>
                  <option value="F-VPA-011 Rev.1">
                    F-VPA-011 Rev.1 (Liability)
                  </option>
                </select>
              </div>

              <div class="form-control">
                <label class="label py-1"
                  ><span class="label-text text-xs font-medium"
                    >Outage Transaction Time *</span
                  ></label
                >
                <input
                  v-model="outageForm.incidentOccurredAt"
                  type="datetime-local"
                  class="input input-bordered input-sm"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="form-control">
                <label class="label py-1"
                  ><span class="label-text text-xs font-medium"
                    >Borrower / Liable Person</span
                  ></label
                >
                <input
                  v-model="outageForm.borrowerName"
                  type="text"
                  placeholder="Full name on paper form"
                  class="input input-bordered input-sm"
                />
              </div>

              <div class="form-control">
                <label class="label py-1"
                  ><span class="label-text text-xs font-medium"
                    >Course / Activity</span
                  ></label
                >
                <input
                  v-model="outageForm.courseActivity"
                  type="text"
                  placeholder="e.g., Clinical Chemistry Lab"
                  class="input input-bordered input-sm"
                />
              </div>

              <div class="form-control">
                <label class="label py-1"
                  ><span class="label-text text-xs font-medium"
                    >Scan Paper Form Image (Optional OCR)</span
                  ></label
                >
                <input
                  type="file"
                  accept="image/*"
                  class="file-input file-input-bordered file-input-sm w-full"
                  :disabled="ocrProcessing"
                  @change="handleOcrImageUpload"
                />
              </div>
            </div>

            <div v-if="ocrProcessing" class="text-xs flex items-center gap-2">
              <span class="loading loading-spinner loading-xs text-primary" />
              Running Tesseract.js OCR on paper form image...
            </div>

            <div v-if="outageForm.ocrRawText" class="form-control">
              <label class="label py-1"
                ><span class="label-text text-xs font-medium"
                  >Raw OCR Output (Read-only Reference)</span
                ></label
              >
              <textarea
                :value="outageForm.ocrRawText"
                rows="2"
                readonly
                class="textarea textarea-bordered textarea-xs font-mono bg-base-200"
              />
            </div>

            <div class="form-control">
              <label class="label py-1"
                ><span class="label-text text-xs font-medium"
                  >Human-Verified Transaction Summary *</span
                ></label
              >
              <textarea
                v-model="outageForm.verifiedSummary"
                rows="2"
                placeholder="Verified items, quantities/serials, and wet-ink sign-offs from physical form"
                class="textarea textarea-bordered textarea-sm"
                required
              />
            </div>

            <label class="label cursor-pointer justify-start gap-3">
              <input
                v-model="outageForm.humanVerified"
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                required
              />
              <span class="label-text text-xs font-medium">
                I certify that I have manually inspected the physical paper form
                and verified all fields above.
              </span>
            </label>

            <div class="flex justify-end">
              <button
                type="submit"
                class="btn btn-primary btn-sm"
                :disabled="savingOutage"
              >
                <span
                  v-if="savingOutage"
                  class="loading loading-spinner loading-xs"
                />
                Save Reconciled Outage Record
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Reconciled Outage Logs Table -->
      <div
        class="card bg-base-100 border border-base-300 shadow-xs overflow-x-auto"
      >
        <table class="table table-zebra table-sm">
          <thead>
            <tr>
              <th>Outage Ref</th>
              <th>Form</th>
              <th>Occurred At</th>
              <th>Borrower / Activity</th>
              <th>Verified Summary</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="outageRecords.length === 0">
              <td colspan="6" class="text-center py-8 opacity-70">
                No post-outage paper recovery logs recorded.
              </td>
            </tr>
            <tr v-for="rec in outageRecords" :key="rec.id">
              <td class="font-mono font-semibold text-xs">
                {{ rec.outageReference }}
              </td>
              <td>
                <span class="badge badge-outline badge-xs">{{
                  rec.formType
                }}</span>
              </td>
              <td class="text-xs">
                {{ formatDateTime(rec.incidentOccurredAt) }}
              </td>
              <td class="text-xs">
                <div class="font-medium">{{ rec.borrowerName || "-" }}</div>
                <div class="opacity-70">{{ rec.courseActivity }}</div>
              </td>
              <td class="text-xs max-w-md">{{ rec.verifiedSummary }}</td>
              <td>
                <span class="badge badge-success badge-xs gap-1">
                  <CheckCircle2 class="w-3 h-3" />
                  {{ rec.reconciliationStatus }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- M15: Backup & Restoration (Admin Only) -->
    <div
      v-else-if="activeTab === 'backups' && canManageBackups"
      class="space-y-4"
    >
      <div v-if="backupMessage" class="alert alert-success text-xs">
        <span>{{ backupMessage }}</span>
      </div>
      <div v-if="backupError" class="alert alert-error text-xs">
        <span>{{ backupError }}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card bg-base-100 border border-base-300 shadow-xs">
          <div class="card-body space-y-2">
            <h2 class="card-title text-base">Export JSON Backup Snapshot</h2>
            <p class="text-xs opacity-75">
              Exports all 11 core ICAM PostgreSQL tables into a timestamped JSON
              snapshot and records an audit trail entry.
            </p>
            <input
              v-model="backupNotes"
              type="text"
              placeholder="Optional snapshot label (e.g., End of Midterm Week)"
              class="input input-bordered input-sm"
            />
            <div class="card-actions justify-end mt-2">
              <button
                class="btn btn-primary btn-sm"
                :disabled="exportingBackup"
                @click="handleExportBackup"
              >
                <Download class="w-4 h-4" />
                Export &amp; Download Snapshot
              </button>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 border border-base-300 shadow-xs">
          <div class="card-body space-y-2">
            <h2 class="card-title text-base">Verify Backup Bundle Integrity</h2>
            <p class="text-xs opacity-75">
              Validates a previously exported ICAM backup JSON file against
              required schema tables prior to disaster recovery restoration.
            </p>
            <label class="btn btn-outline btn-sm w-fit mt-2">
              <Upload class="w-4 h-4" />
              Select Snapshot JSON to Verify
              <input
                type="file"
                accept="application/json"
                class="hidden"
                @change="handleVerifyBackupFile"
              />
            </label>
          </div>
        </div>
      </div>

      <div
        class="card bg-base-100 border border-base-300 shadow-xs overflow-x-auto"
      >
        <table class="table table-zebra table-sm">
          <thead>
            <tr>
              <th>Snapshot Code</th>
              <th>Type</th>
              <th>Created At</th>
              <th>Notes &amp; Table Counts</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="snapshots.length === 0">
              <td colspan="4" class="text-center py-8 opacity-70">
                No backup snapshots recorded yet.
              </td>
            </tr>
            <tr v-for="snap in snapshots" :key="snap.id">
              <td class="font-mono text-xs font-semibold">
                {{ snap.snapshotCode }}
              </td>
              <td>
                <span class="badge badge-sm badge-outline">{{
                  snap.snapshotType
                }}</span>
              </td>
              <td class="text-xs">{{ formatDateTime(snap.createdAt) }}</td>
              <td class="text-xs">
                <div>{{ snap.notes || "Full table export" }}</div>
                <div class="font-mono text-[11px] opacity-70">
                  Items: {{ snap.tableCounts.inventory_items ?? 0 }} | Reqs:
                  {{ snap.tableCounts.requisitions ?? 0 }} | Logs:
                  {{ snap.tableCounts.activity_logs ?? 0 }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <PrintableFormModal
      :form-type="printTemplate"
      @close="printTemplate = null"
    />
  </section>
</template>
