<script setup lang="ts">
import { Printer } from "@lucide/vue";
import type { RequisitionRecord } from "~~/shared/types/requisition";
import type { LiabilityCase } from "~~/shared/types/borrowing";

const props = defineProps<{
  formType: "F-VPA-012" | "F-VPA-011" | null;
  requisition?: RequisitionRecord | null;
  liabilityCase?: LiabilityCase | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

function printSheet() {
  window.print();
}

function formatDate(iso?: string | null) {
  if (!iso) return "____________________";
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "____________________";
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': !!formType }">
    <div v-if="formType" class="modal-box max-w-4xl">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs opacity-70">
          Official SDCA Printable Template (Wet-ink signatures required upon
          printing)
        </span>
        <div class="flex gap-2">
          <button class="btn btn-primary btn-sm" @click="printSheet">
            <Printer class="w-4 h-4" />
            Print Form
          </button>
          <button class="btn btn-ghost btn-sm" @click="emit('close')">
            Close
          </button>
        </div>
      </div>

      <!-- Printable Sheet -->
      <div
        id="icam-printable-sheet"
        class="bg-white text-black border border-black p-6 text-xs space-y-4"
      >
        <!-- FORM F-VPA-012 -->
        <template v-if="formType === 'F-VPA-012'">
          <div
            class="flex items-start justify-between border-b border-black pb-2"
          >
            <div>
              <div class="font-bold text-sm uppercase">
                St. Dominic College of Asia
              </div>
              <div>School of Medical Laboratory Science - Laboratory Unit</div>
              <div class="font-bold text-base mt-1">REQUISITION FORM</div>
            </div>
            <div class="text-right font-mono text-[11px]">
              <div><strong>Form No.:</strong> F-VPA-012 (01-06-14)</div>
              <div>
                <strong>Tracking Ref:</strong>
                {{ requisition?.referenceCode || "BLANK TEMPLATE" }}
              </div>
              <div>
                <strong>QR Token:</strong>
                {{ requisition?.qrToken || "____________________" }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-x-6 gap-y-1.5">
            <div>
              <strong>Date Filed:</strong>
              {{ formatDate(requisition?.submittedAt) }}
            </div>
            <div>
              <strong>School/Department:</strong>
              {{ requisition?.schoolDepartment || "SMLS" }}
            </div>
            <div>
              <strong>Name (Borrower / Group Leader):</strong>
              {{ requisition?.borrowerName || "__________________________" }}
            </div>
            <div>
              <strong>Course, Year &amp; Section:</strong>
              {{
                requisition?.courseYearSection || "__________________________"
              }}
            </div>
            <div>
              <strong>Date &amp; Time Needed:</strong>
              {{ formatDateTime(requisition?.neededAt) }}
            </div>
            <div>
              <strong>Expected Return:</strong>
              {{ formatDateTime(requisition?.expectedReturnAt) }}
            </div>
            <div>
              <strong>Course / Activity:</strong>
              {{ requisition?.courseActivity || "__________________________" }}
            </div>
            <div>
              <strong>Name of Faculty In-charge:</strong>
              {{ requisition?.requesterName || "__________________________" }}
            </div>
          </div>

          <table class="w-full border-collapse border border-black text-xs">
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-black p-1.5 text-center w-16">Qty</th>
                <th class="border border-black p-1.5 text-left">
                  Item / Specification &amp; Assigned Serials
                </th>
                <th class="border border-black p-1.5 text-left w-36">
                  Remarks: Released
                </th>
                <th class="border border-black p-1.5 text-left w-36">
                  Remarks: Returned
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-if="requisition?.items?.length">
                <tr v-for="line in requisition.items" :key="line.id">
                  <td class="border border-black p-1.5 text-center font-mono">
                    {{ line.approvedQty || line.requestedQty }}
                    {{ line.itemUnit }}
                  </td>
                  <td class="border border-black p-1.5">
                    {{ line.itemName }}
                    {{
                      line.itemSpecification
                        ? `(${line.itemSpecification})`
                        : ""
                    }}
                    <span
                      v-if="line.assignedSerials.length"
                      class="font-mono text-[11px]"
                    >
                      [Serials: {{ line.assignedSerials.join(", ") }}]
                    </span>
                  </td>
                  <td class="border border-black p-1.5">
                    {{ line.remarks || "" }}
                  </td>
                  <td class="border border-black p-1.5" />
                </tr>
              </template>
              <template v-else>
                <tr v-for="n in 6" :key="n">
                  <td class="border border-black p-3" />
                  <td class="border border-black p-3" />
                  <td class="border border-black p-3" />
                  <td class="border border-black p-3" />
                </tr>
              </template>
            </tbody>
          </table>

          <div class="text-[11px] italic">
            Notes: (1) Lost or damaged items require accomplishment of Form
            F-VPA-011 Rev.1 (Agreement of Liability). (2) All items must be
            returned clean and dry.
          </div>

          <div class="grid grid-cols-2 gap-6 pt-4">
            <div class="border-t border-black pt-1">
              Signature of Faculty In-charge (Wet-ink) / Date
            </div>
            <div class="border-t border-black pt-1">
              Issued by: Laboratory Custodian / Technician / Date
            </div>
            <div class="border-t border-black pt-1">
              Received by: Requisitioner (Wet-ink) / Date
            </div>
            <div class="border-t border-black pt-1">
              Returned by: Requisitioner / Received by Custodian / Date
            </div>
          </div>
        </template>

        <!-- FORM F-VPA-011 Rev.1 -->
        <template v-else-if="formType === 'F-VPA-011'">
          <div
            class="flex items-start justify-between border-b border-black pb-2"
          >
            <div>
              <div class="font-bold text-sm uppercase">
                St. Dominic College of Asia
              </div>
              <div>School of Medical Laboratory Science - Laboratory Unit</div>
              <div class="font-bold text-base mt-1">AGREEMENT OF LIABILITY</div>
            </div>
            <div class="text-right font-mono text-[11px]">
              <div><strong>Form No.:</strong> F-VPA-011 Rev.1 (10-02-23)</div>
              <div>
                <strong>Case Code:</strong>
                {{ liabilityCase?.caseCode || "BLANK TEMPLATE" }}
              </div>
              <div>
                <strong>Linked Req:</strong>
                {{ liabilityCase?.referenceCode || "____________________" }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-x-6 gap-y-1.5">
            <div>
              <strong>Date Recorded:</strong>
              {{ formatDate(liabilityCase?.createdAt) }}
            </div>
            <div>
              <strong>Department / School:</strong>
              {{ liabilityCase?.schoolDepartment || "SMLS" }}
            </div>
            <div>
              <strong>Liable Person Name:</strong>
              {{
                liabilityCase?.liablePersonName || "__________________________"
              }}
            </div>
            <div>
              <strong>Role:</strong>
              {{
                liabilityCase?.liablePersonRole || "Student / Faculty / Staff"
              }}
            </div>
          </div>

          <table class="w-full border-collapse border border-black text-xs">
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-black p-1.5 text-left">
                  Item Description &amp; Specification
                </th>
                <th class="border border-black p-1.5 text-center w-20">Qty</th>
                <th class="border border-black p-1.5 text-left w-32">Remark</th>
                <th class="border border-black p-1.5 text-left">
                  Affected Serials / Notes
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-if="liabilityCase?.items?.length">
                <tr v-for="item in liabilityCase.items" :key="item.id">
                  <td class="border border-black p-1.5">
                    {{ item.itemName }}
                    {{
                      item.itemSpecification
                        ? `(${item.itemSpecification})`
                        : ""
                    }}
                  </td>
                  <td class="border border-black p-1.5 text-center font-mono">
                    {{ item.quantity }} {{ item.itemUnit }}
                  </td>
                  <td class="border border-black p-1.5 font-semibold">
                    {{ item.incidentRemark }}
                  </td>
                  <td class="border border-black p-1.5 font-mono text-[11px]">
                    {{
                      item.affectedSerials.length
                        ? item.affectedSerials.join(", ")
                        : item.notes || "-"
                    }}
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="n in 4" :key="n">
                  <td class="border border-black p-3" />
                  <td class="border border-black p-3" />
                  <td class="border border-black p-3" />
                  <td class="border border-black p-3" />
                </tr>
              </template>
            </tbody>
          </table>

          <div class="border border-black p-2 space-y-1">
            <div>
              <strong>Mode of Replacement:</strong>
              [
              {{
                liabilityCase?.replacementMode === "Payment at the cashier"
                  ? "X"
                  : " "
              }}
              ] Payment at the cashier &nbsp;&nbsp;&nbsp; [
              {{
                liabilityCase?.replacementMode === "Replace the item"
                  ? "X"
                  : " "
              }}
              ] Replace the item
            </div>
            <div>
              <strong>Official Receipt (OR) / Verification Ref:</strong>
              {{
                liabilityCase?.proofReference ||
                "______________________________"
              }}
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <strong>Status:</strong>
              {{ liabilityCase?.clearanceStatus || "Unresolved" }}
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 pt-4">
            <div class="border-t border-black pt-1">
              Acknowledged by (Liable Person)
            </div>
            <div class="border-t border-black pt-1">
              Attested by (Faculty In-charge)
            </div>
            <div class="border-t border-black pt-1">
              Received by (Lab Custodian)
            </div>
          </div>

          <div class="border-t border-black pt-3 mt-2 space-y-3">
            <div class="font-bold uppercase">Clearance Certification</div>
            <div>
              This certifies that Mr./Ms.
              <strong>{{
                liabilityCase?.liablePersonName || "________________________"
              }}</strong>
              has settled the above laboratory accountability.
            </div>
            <div class="grid grid-cols-2 gap-6 pt-3">
              <div class="border-t border-black pt-1">
                Certified by: Laboratory Manager / Custodian / Date
              </div>
              <div class="border-t border-black pt-1">
                Acknowledged by: Liable Person / Date
              </div>
            </div>
          </div>

          <div class="text-[11px] italic">
            Note: Accomplished in two (2) copies (1 Student Copy, 1 Laboratory
            File).
          </div>
        </template>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
