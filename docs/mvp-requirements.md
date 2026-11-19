# MVP-1 Requirements & Institutional Policy Confirmation

- **Issue:** #3 — `[P0][REQUIREMENTS] Confirm MVP workflow, roles, forms, and inventory tracking`
- **Milestone:** MVP-1 — Foundation & Access
- **Institution:** St. Dominic College of Asia — Medical Laboratory Science (MLS) Department (ICAM)

---

## 1. MVP Role & Permission Matrix (M01)

Confirmed from Chapter III (User Roles) and Chapter IV (Table 4.1):

| Role | View Catalog & Availability (M05) | Submit Requisition (M06) | Approve / Reject Requisition (M06) | Manage Inventory (M04) | Scan QR & Release / Issue Items (M08, M09) | Inspect Returns (M10) | Record & Clear Liability (M11) | Paper Recovery & OCR Review (M14) | Configure Policies / Users / Backups (M15, M17) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Student / Designated Group Leader** | Yes | No *(Assigned as borrower)* | No | No | Present QR at counter | No | View Own | No | No |
| **Faculty Member** | Yes | Yes | No *(Physical signature on F-VPA-012)* | No | No | No | Attest on paper form | No | No |
| **Laboratory Custodian** | Yes | No | Yes | Yes | Yes | Yes | Yes | Yes | No |
| **Program / Laboratory Coordinator** | Yes | Yes *(Faculty role)* | Yes | Yes | Yes | Yes | Yes | Yes | Clarifies policy rules |
| **SDCA Technical Administrator** | Read-only | No | No | No | No | No | No | No | Yes |

- **External / Non-System Roles in Workflow:**
  - **Dean / Program Chair:** Department-level oversight only; does not fill forms or process counter transactions in MVP-1.
  - **Cashier:** External offline settlement; receives payment and issues an Official Receipt (OR) presented to the Laboratory Custodian for clearance.
- **Institutional Auth Policy:** Requires an eligible SDCA institutional account (Google OAuth via Supabase Auth) and an assigned ICAM role, subject to formal SDCA IT/administrative approval before production deployment.
- **Instructor Endorsement Rule:** Faculty members initiate/submit digital requisitions in MVP-1 and provide their required handwritten signature on the printed `F-VPA-012` form; no separate digital faculty approval stage exists between submission and custodian review.

---

## 2. Official Inventory Source Status (M04)

- **Status:** Received (Baseline confirmed — non-blocking)
- **Date Supplied:** October 26, 2026
- **Supplied By:** Aljin Gabriel R. Santos (Program/Laboratory Coordinator & Laboratory Custodian)
- **Source Files (Appendix D):**
  1. *Inventory of Equipment and Apparatus* (Second Semester, AY 2025–2026 — 91 serialized equipment records in `MT LAB 3`).
  2. *Inventory of Apparatus and Materials* (Second Semester, AY 2025–2026 — 86 bulk apparatus/material records across cabinets `C1`–`C14`, `ML2 C1`, `MTL 2`, `Ref`, and `Table Top`).
- **Scope Boundary:** Chemical inventory management, chemical-specific attributes, and chemical OCR are explicitly **excluded** from MVP-1.

---

## 3. MVP Item Tracking Approach (M04 & M08)

ICAM uses a **hybrid inventory model** (Chapter I & FR-03):

| Tracking Mode | Scope & Examples (Appendix D) | Source & System Fields |
| :--- | :--- | :--- |
| **Individually Tracked Assets (Serialized Equipment)** | Reusable instruments tracked per physical unit (e.g., Microscopes `MLS 001`–`MLS 059`, Centrifuges, Analytical Balance, pH Meters, Spectrophotometers, Hot Plates, Incubator, Water Bath, Venipuncture Arm Models) | `Name`, `Serial Number`, `Calibration` (date / `NEW` / `-`), `Issues` / Condition (`NONE`, `DEFECTIVE`, `FOR DEMONSTRATION ONLY`, `FO REPAIR`), `Location` (`MT LAB 3`), plus system `Availability Status` (`Available`, `Reserved`, `Issued`, `Unavailable`) |
| **Quantity-Tracked Items (Bulk Apparatus & Materials)** | Stock items tracked by count balances (e.g., Beakers, Erlenmeyer/Florence/Volumetric Flasks, Graduated Cylinders, Test Tubes, Pipettes, Petri Dishes, Glass Cuvettes, Alcohol Lamps, Bunsen Burners) | `Item`, `Specification` (e.g., `30 mL`, `10-100 ul`, `75 mm`), `Good (Quantity)` + Unit (`pcs`, `roll`, `box`, `box/set`), `Defective` count/notes, `Location`, plus system `On-Hand Qty` and `Reserved Qty` |

- **Stock State Separation (FR-03):**
  - **Submission (`Submitted`):** Does **not** reserve or deduct inventory.
  - **Approval (`Approved`):** Increases `Reserved Qty` (or locks the specific serialized asset) and reduces `Available Qty` for other requests; `On-Hand Qty` remains unchanged.
  - **Physical Release (`Issued`):** Deducts `On-Hand Qty` based on actual verified release and converts the reservation into an active loan.
- **QR Code Scope in MVP (M08):** Transaction-specific QR codes are generated per approved requisition to retrieve the record at the counter. Scanning a QR code alone **cannot** authorize release—custodians must verify borrower identity, collect physical Student ID collateral, and capture wet-ink signatures.

---

## 4. Core Workflow Steps & Minimum Fields (M06, M09, M10, M11)

1. **Advance Requisition (M06 — FR-01, FR-02):**
   - **Rule:** Routine practice is 3–5 days before the lab activity. Late requests preserve the actual server-recorded submission timestamp, display a late-request warning, and are flagged for custodian review (never backdated or auto-rejected).
   - **Minimum Fields:** `Requester (Faculty ID)`, `Designated Borrower / Group Leader`, `School/Department (SMLS)`, `Course, Year & Section`, `Course / Activity`, `Date & Time Needed`, `Expected Return Date/Time`, `Requested Items, Specifications & Quantities`, `Server Submission Timestamp`, `Late-Request Flag`, `Status` (`Submitted`).
2. **Custodian Review & Reservation (M06, M07 — FR-02, FR-03):**
   - **Rule:** Custodian checks stock availability and approves or rejects. Approval reserves stock (`Approved`); rejection or cancellation releases reservations (`Rejected` / `Cancelled`).
   - **Minimum Fields:** `Reviewer (Custodian ID)`, `Decision Status`, `Decision Timestamp`, `Approved Quantities / Assigned Asset Serials`, `Remarks / Substitution Notes`.
3. **Physical Release / Issuance (M09 — FR-03, FR-05, FR-06):**
   - **Rule:** Group leader presents transaction QR code and printed `F-VPA-012` (with faculty wet-ink signature) and surrenders physical Student ID as collateral. Custodian verifies items, signs `Issued by`, borrower signs `Received by`, and system deducts `On-Hand Qty`.
   - **Minimum Fields:** `Issued By (Custodian ID)`, `Received By (Borrower ID)`, `Actual Release Timestamp`, `Released Quantities / Asset Serials`, `Pre-Release Condition`, `Student ID Custody Status` (`Held` — tracked separately from liability status).
4. **Return Inspection (M10 — FR-05):**
   - **Rule:** Borrower returns items clean and dry. Custodian inspects items against `F-VPA-012`. Both sign `Returned by` and `Received by`. If complete and undamaged, Student ID is returned (`Completed`).
   - **Minimum Fields:** `Returned Timestamp`, `Inspected By (Custodian ID)`, `Returned Quantities / Asset Serials`, `Item Condition` (`Clean & Good`, `Damaged`, `Lost/Missing`), `Student ID Custody Status` (`Returned` or `Retained`).
5. **Liability Recording & Clearance (M11 — FR-05):**
   - **Rule:** Triggered when items are lost, broken, or damaged. Custodian prepares two copies of `F-VPA-011 Rev.1`. Liable person settles via Cashier payment (presenting Official Receipt) or exact item replacement before clearance is certified and Student ID is returned.
   - **Minimum Fields:** `Linked Requisition/Issuance ID`, `Liable Person (Name & Role)`, `Department/School`, `Affected Item Description, Specification & Quantity`, `Incident Remark` (`Lost`, `Broken`, `Others`), `Mode of Replacement` (`Payment at the cashier`, `Replace the item`), `Official Receipt / Replacement Proof Reference`, `Clearance Status` (`Unresolved`, `Cleared`), `Cleared By (Custodian ID)`, `Cleared Timestamp`.

---

## 5. Institutional Form Mapping (M12 — Appendix E)

Both forms retain physical wet-ink signatures for department filing and quality-audit compliance (FR-06). ICAM generates printable forms pre-populated with digital transaction data and tracking IDs without forging or embedding copied signature images.

### Form F-VPA-012 (01-06-14) — Requisition Form
- **Workflow Stage:** Advance Requisition, Physical Issuance, and Return Sign-off
- **Required MVP Fields:**
  - **Header:** `Date`, `Name`, `School/Department`, `Course, year & section`, `Date & Time needed`, `Course/Activity`, `Borrower Classification` (`Student`, `Faculty`, `Others`), `Name of Faculty In-charge` (required if student).
  - **Line Items:** `Quantity`, `Item / Specification`, `Remarks: Released`, `Remarks: Returned`.
  - **Physical Signature Blocks (Printed for wet-ink sign-off):** `Signature of Faculty In-charge`, `Issued by (Laboratory Custodian/Technician / Date)`, `Received by (Requisitioner / Date)`, `Returned by (Requisitioner / Date)`, `Received by (Laboratory Custodian/Technician / Date)`.
  - **Standard Form Notes:** (1) Lost/damaged items require a liability form; (2) All items must be returned clean & dry.

### Form F-VPA-011 Rev.1 (10-02-23) — Agreement of Liability
- **Workflow Stage:** Loss/Damage Incident Recording and Departmental Clearance
- **Required MVP Fields:**
  - **Incident Header:** `Date`, `Liable Person Name`, `Role` (`student/faculty/staff`), `Department/School`.
  - **Line Items:** `Item Description`, `Specification`, `Quantity`, `Remarks` (`Lost`, `Broken`, `Others`).
  - **Settlement & Sign-off Blocks (Printed for wet-ink sign-off):** `Mode of Replacement` (`Payment at the cashier` / `Replace the item`), `Acknowledged by (Liable person)`, `Attested by (Faculty in-charge, if student)`, `Received by (Laboratory Custodian/Technician)`.
  - **Clearance Certification Block:** `Cleared Person (Mr./Ms.)`, `Certified by (Laboratory Manager/Custodian/Technician)`, `Acknowledged by (Liable person)`.
  - **Standard Form Note:** Accomplished in two (2) copies (1 student copy, 1 laboratory file).

---

## 6. Configurable & Out-of-Scope Policies (M17)

The following rules are **not hard-coded** in MVP-1 and remain configurable or out of scope until formally finalized:
- **Advance Request Lead-Time Threshold & Warning Wording:** Existing lab notices show differing lead times (1 week vs. 1–3 days vs. observed 3–5 days routine). Stored as a configurable setting in `M17` pending Program/Laboratory Coordinator confirmation.
- **Outage Recovery & Reconciliation (M14 — FR-07):** During network/service outages, custodians log paper transactions using unique `Outage Reference` IDs and reconcile them post-outage via Tesseract.js OCR + mandatory human verification (no offline local database or auto-sync).
- **Out of Scope in MVP-1:** Chemical inventory/OCR, online payment processing, SIS/LMS/accounting API integration, RFID/smart lockers, and automated digital signature embedding.

---

## 7. Remaining Open Confirmations & Action Owners

| # | Question | Owner | Status |
| :--- | :--- | :--- | :--- |
| 1 | Confirm exact late-request lead-time threshold (e.g., 3 days vs. 5 days vs. 7 days) and warning message text | Sir Aljin Gabriel R. Santos (Program/Lab Coordinator) | Pending Coordinator Sign-off |
| 2 | Confirm whether a Student ID may ever be returned before a pending liability case is settled | Sir Aljin Gabriel R. Santos (Program/Lab Coordinator) | Pending Coordinator Sign-off |
| 3 | Confirm scope of separate hard-copy equipment-use logbook vs. `F-VPA-012` transaction history | Sir Aljin Gabriel R. Santos / Sir Daniel Joseph G. Masigan | Pending Clarification |
| 4 | Obtain SDCA administrative approval for Google OAuth configuration, hosting account ownership, and data retention | SDCA Administration / Adviser | Pending Deployment Gate |
