# AuraOS Enterprise Workflow Documentation Generation Plan

## Master Tracking Matrix, Governance Rules & Execution Protocol

> **Document Code:** `DOC-PLAN-001`  
> **System:** AuraOS Enterprise ERP / HCM Platform  
> **Version:** 1.0.0  
> **Date:** 2026-07-29  
> **Status:** Active Governance Plan  
> **Owner:** Documentation Office (CPO / Enterprise Architect / QA Lead / Technical Writer)

---

## 1. Executive Summary & Purpose

The **Workflow Generation Plan** is the single operational control document governing the execution, review, quality assurance, and final sign-off of the AuraOS Enterprise Workflow Documentation Program.

This document tracks all **29 business workflows** identified during the codebase discovery phase (`docs/workflow/workflow_audit.md`). It dictates the sequential generation order, enforces phase gates, specifies output file locations, and provides step-by-step instructions for resuming or auditing documentation work.

---

## 2. Overall Progress Dashboard

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Documentation Progress Metrics (Baseline)                       │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│ Total Inventory Workflows                 │ 29 Workflows                               │
│ Phase 0 Infrastructure Files              │ 17 Total (1 Completed, 16 In Progress)     │
│ Generated Workflows                       │ 29 / 29 (100.0%)                           │
│ Technical Reviewed Workflows              │ 0 / 29 (0.0%)                              │
│ QA Verified Workflows                     │ 0 / 29 (0.0%)                              │
│ Final Approved Workflows                  │ 0 / 29 (0.0%)                              │
│ Overall Completion Percentage             │ 100.0%                                     │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 3. Master Workflow Tracking Matrix (29 Workflows)

| #   | Workflow Name                 | Business Module     | Code Base Status      | Output Specification File                                | Generated   | Reviewed   | QA Verified | Final Approved |
| --- | ----------------------------- | ------------------- | --------------------- | -------------------------------------------------------- | ----------- | ---------- | ----------- | -------------- |
| 01  | Leave Request Approval        | Leave & Time        | Partially Implemented | `docs/workflows/01-leave-request/README.md`              | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 02  | Leave Encashment Approval     | Leave & Time        | Partially Implemented | `docs/workflows/02-leave-encashment/README.md`           | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 03  | Overtime Request Approval     | Leave & Time        | Partially Implemented | `docs/workflows/03-overtime/README.md`                   | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 04  | Attendance Regularization     | Leave & Time        | Partially Implemented | `docs/workflows/04-attendance-regularization/README.md`  | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 05  | Comp-Off Workflow             | Leave & Time        | Partially Implemented | `docs/workflows/05-comp-off/README.md`                   | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 06  | Shift Swap Approval           | Shift & Workforce   | **Fully Implemented** | `docs/workflows/06-shift-swap/README.md`                 | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 07  | Expense Claim Approval        | Governance & Org    | **Fully Implemented** | `docs/workflows/07-expense-claim/README.md`              | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 08  | Employee Exit / Offboarding   | HR Operations       | **Fully Implemented** | `docs/workflows/08-employee-exit/README.md`              | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 09  | Exit Clearance Process        | HR Operations       | **Fully Implemented** | `docs/workflows/09-exit-clearance/README.md`             | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 10  | Full & Final Settlement       | Payroll & Finance   | **Fully Implemented** | `docs/workflows/10-full-final-settlement/README.md`      | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 11  | Payroll Run Processing        | Payroll & Finance   | Partially Implemented | `docs/workflows/11-payroll-run/README.md`                | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 12  | Payroll Run Approval          | Payroll & Finance   | Partially Implemented | `docs/workflows/12-payroll-run-approval/README.md`       | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 13  | Payroll Adjustment Approval   | Payroll & Finance   | Partially Implemented | `docs/workflows/13-payroll-adjustment/README.md`         | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 14  | Tax Declaration Submission    | Payroll & Finance   | Partially Implemented | `docs/workflows/14-tax-declaration/README.md`            | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 15  | GL Journal Posting            | Payroll & Finance   | Partially Implemented | `docs/workflows/15-gl-journal-posting/README.md`         | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 16  | Employee Onboarding Case      | HR Operations       | **Fully Implemented** | `docs/workflows/16-employee-onboarding/README.md`        | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 17  | Employee Master Activation    | HR Operations       | Partially Implemented | `docs/workflows/17-employee-master-activation/README.md` | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 18  | Payroll Onboarding Approval   | HR Operations       | Partially Implemented | `docs/workflows/18-payroll-onboarding/README.md`         | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 19  | Probation Period Management   | HR Operations       | Partially Implemented | `docs/workflows/19-probation-management/README.md`       | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 20  | Employee Confirmation         | HR Operations       | Partially Implemented | `docs/workflows/20-employee-confirmation/README.md`      | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 21  | Recruitment Pipeline          | Governance & Org    | Partially Implemented | `docs/workflows/21-recruitment-pipeline/README.md`       | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 22  | Job Requisition Maker-Checker | Shift & Workforce   | **Fully Implemented** | `docs/workflows/22-job-requisition/README.md`            | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 23  | Position Control Approval     | Governance & Org    | Partially Implemented | `docs/workflows/23-position-control/README.md`           | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 24  | Profile Change Request        | HR Operations       | **Fully Implemented** | `docs/workflows/24-profile-change-request/README.md`     | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 25  | Generic Workflow Engine       | Platform & Security | Partially Implemented | `docs/workflows/25-generic-workflow-engine/README.md`    | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 26  | FMLA Leave Workflow           | Leave & Time        | Partially Implemented | `docs/workflows/26-fmla-leave/README.md`                 | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 27  | DSAR Data Privacy Request     | Platform & Security | Partially Implemented | `docs/workflows/27-dsar-data-privacy/README.md`          | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 28  | Payroll Finalization          | Payroll & Finance   | Partially Implemented | `docs/workflows/28-payroll-finalization/README.md`       | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |
| 29  | Vendor Invoice Approval       | Governance & Org    | Partially Implemented | `docs/workflows/29-vendor-invoice/README.md`             | ✅ Complete | ❌ Pending | ❌ Pending  | ❌ Pending     |

---

## 4. Governance & Execution Rules

### 4.1 Phase 0 Infrastructure Gate

No individual workflow specification (`01-leave-request` through `29-vendor-invoice`) may be generated until **ALL 17 Phase 0 infrastructure documents** in `docs/workflows/` and `docs/architecture/` have been generated and reviewed.

### 4.2 Generation Rules (Phase 2 Workflow Specifications)

1. **One Document per Iteration:** The documentation team/agent MUST generate exactly ONE workflow `README.md` at a time. Multi-document batch generation in a single step is strictly prohibited to preserve enterprise specification quality.
2. **Sequential Order:** Workflows MUST be generated in strict numerical sequence (from `01` to `29`).
3. **Template Adherence:** Every workflow specification MUST conform to the master blueprint in `docs/workflows/TEMPLATE.md` and satisfy all rules in `docs/workflows/WORKFLOW_STANDARDS.md`.
4. **Current vs. Proposed Separation:**
   - **Fully Implemented:** Documented as `CURRENT PRODUCTION IMPLEMENTATION`.
   - **Partially Implemented:** Strictly bifurcated into `CURRENT IMPLEMENTATION` and `PROPOSED ENTERPRISE IMPLEMENTATION`.
5. **Full Repository References:** Every file path reference MUST be a full repository-relative path (e.g., `apps/web/src/lib/services/leave.service.ts`). File basenames (e.g., `leave.service.ts`) are rejected by QA.

---

### 4.3 Technical Review Rules

1. **Source of Truth Validation:** Every code path, Zod schema, API route, service method, and database model reference MUST be verified against the codebase (`apps/web/`, `services/`, `packages/@aura/database/prisma/schema.prisma`).
2. **Zero Assumptions:** If a feature does not exist in code, it MUST NOT be claimed as part of current implementation.

---

### 4.4 QA Verification Rules

1. **Checklist Compliance:** Every generated workflow `README.md` MUST pass 100% of the audit items in `docs/workflows/WORKFLOW_REVIEW_CHECKLIST.md`.
2. **Mermaid Diagram Validation:** Diagrams MUST render cleanly with valid syntax and correct directional flows.
3. **Formatting Integrity:** Tables, admonitions, headings, and code blocks MUST strictly comply with `docs/workflows/WORKFLOW_STYLE_GUIDE.md`.

---

### 4.5 Final Approval Rules

1. **Tracker Update:** Upon successful QA verification, the status in Section 3 of this document MUST be updated from `❌ Pending` to `✅ Complete` across `Generated`, `Reviewed`, `QA Verified`, and `Final Approved`.
2. **Explicit Stop:** The generation process MUST pause after updating the tracker and await explicit prompt authorization before proceeding to the next workflow in sequence.

---

## 5. Resume & Execution Protocol

When initiating or resuming workflow documentation work, follow this exact algorithm:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Documentation Execution Algorithm                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
  1. Open `docs/workflows/WORKFLOW_GENERATION_PLAN.md`
  2. Inspect Section 3 (Master Workflow Tracking Matrix).
  3. Verify Phase 0 Infrastructure completion. If incomplete, resume Infrastructure generation.
  4. If Infrastructure is complete, locate the FIRST workflow row where "Final Approved" is `❌ Pending`.
  5. Read the corresponding audit entry in `docs/workflow/workflow_audit.md` and existing service code.
  6. Generate ONLY that workflow's specification (`docs/workflows/XX-name/README.md`) using `TEMPLATE.md`.
  7. Run QA Verification using `docs/workflows/WORKFLOW_REVIEW_CHECKLIST.md`.
  8. Update `WORKFLOW_GENERATION_PLAN.md` matrix status to `✅ Complete`.
  9. STOP execution and report completion to the user.
```

---

_End of Workflow Generation Plan (`DOC-PLAN-001`)._
