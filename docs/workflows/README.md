# AuraOS Enterprise Workflow Specification Library

## Master Workflow Documentation Index & Architecture Guide

> **Document Type:** Master Enterprise Specification Index  
> **System:** AuraOS Enterprise ERP / HCM Platform  
> **Version:** 1.0.0  
> **Date:** 2026-07-29  
> **Status:** Official Master Specification Index  
> **Primary Source of Truth:** Codebase Audit & Workflow Discovery Matrix (`docs/workflow/workflow_audit.md`)

---

## 1. Project Overview

**AuraOS** is an integrated multi-tenant Enterprise Resource Planning (ERP) and Human Capital Management (HCM) platform built to handle end-to-end enterprise workforce operations, compliance, recruitment, payroll, and business approvals across global jurisdictions.

The **AuraOS Enterprise Workflow Specification Library** serves as the authoritative, definitive reference for every business process implemented or planned within the platform. Every business workflow in AuraOS represents a state-machine or orchestrated process governing critical business operations—ranging from basic leave applications to multi-country end-of-service benefits (EOSB) calculation and automated BPMN orchestration.

This documentation library bridges business operations, functional requirements, technical implementation details, and future enterprise architecture roadmaps into a standardized specification framework.

---

## 2. Documentation Purpose

The primary objectives of this specification library are to:

1. **Provide Single Source of Truth:** Establish a standardized specification for product managers, business analysts, solutions architects, developers, QA engineers, and auditors.
2. **Bridge Business & Code:** Formally map high-level enterprise business requirements directly to underlying API endpoints, database schemas, frontend components, and state-machine services.
3. **Establish Implementation Integrity:** Explicitly segregate **CURRENT PRODUCTION IMPLEMENTATION** from **PROPOSED ENTERPRISE IMPLEMENTATION** to eliminate ambiguity regarding existing capabilities versus planned enhancements.
4. **Enable Enterprise Onboarding & Auditability:** Facilitate rapid technical onboarding for implementation partners, enterprise customer auditors, and software engineering teams.
5. **Guide Product Roadmap & Refactoring:** Serve as the functional baseline for fixing technical debt, eliminating dual-route API redundancies, and wiring disconnected services.

---

## 3. Audience & Stakeholders

This documentation library is tailored for diverse enterprise stakeholders:

| Audience Role                            | Primary Focus & Usage                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Product Leadership & CPO**             | Strategic roadmap alignment, functional completeness review, capability coverage analysis              |
| **Enterprise Solution Architects**       | Cross-module integration design, data flow validation, service boundaries, engine separation analysis  |
| **BPM & ERP Functional Consultants**     | Business process verification, stage exit criteria, RACI assignments, SLA enforcement                  |
| **Software & Technical Architects**      | State transition validation, schema design, API contract enforcement, performance & scalability        |
| **Software Engineers & Developers**      | Exact file path references, service class methods, Zod schema validation, Prisma models                |
| **QA Leads & Test Automation Engineers** | Test scenario generation, edge case validation, acceptance criteria verification                       |
| **Compliance Officers & DPOs**           | Audit trail verification, DSAR handling, regulatory alignment (UAE Federal Law, FMLA, statutory taxes) |
| **Customers & Implementation Partners**  | System configuration guides, role-based permission mapping, business process validation                |

---

## 4. Implementation Status Definitions

To maintain absolute clarity, all workflows documented in this library are categorized into standard implementation statuses:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 Workflow Status Taxonomy                │
                  └────────────────────────────┬────────────────────────────┘
                                               │
       ┌───────────────────────────────────────┼───────────────────────────────────────┐
       ▼                                       ▼                                       ▼
┌──────────────┐                       ┌──────────────┐                       ┌──────────────┐
│  FULLY       │                       │  PARTIALLY   │                       │  NOT         │
│  IMPLEMENTED │                       │  IMPLEMENTED │                       │  STARTED     │
└──────┬───────┘                       └──────┬───────┘                       └──────┬───────┘
       │                                      │                                      │
       ├─ Complete UI Screen                  ├─ API or Service exists               └─ Specification only
       ├─ Validated API Route                 ├─ Schema drift (@ts-nocheck)             (No code present)
       ├─ Dedicated Service Class             ├─ Disconnected notifications
       ├─ Prisma Model & State                ├─ Dual API endpoints
       └─ Active Notifications                └─ Manual cron triggers
```

1. **Fully Implemented (`Fully Implemented`):**
   - End-to-end functionality exists in code (UI screen, API route, dedicated business service class, database model, state transition enforcement).
   - Core notification events are wired to runtime triggers.
   - Requires no structural refactoring for baseline production operation; documentation focuses on **CURRENT PRODUCTION IMPLEMENTATION**.

2. **Partially Implemented (`Partially Implemented`):**
   - Core state machine, database model, or API routes exist, but exhibit known technical gaps (e.g., `@ts-nocheck` schema drift, missing notification dispatches, dual route paths, unhandled edge cases).
   - Requires dual-section documentation: **CURRENT IMPLEMENTATION** vs. **PROPOSED ENTERPRISE IMPLEMENTATION**.

3. **Not Started (`Not Started`):**
   - Workflow concept exists in product scope or architectural design, but no codebase artifacts currently exist.

---

## 5. Workflow Categories & Taxonomy

AuraOS business workflows are organized across 6 core Enterprise Modules:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          AuraOS Enterprise Workflow Taxonomy                           │
└────────────────────────────────────────────────────────────────────────────────────────┘
  ├── 1. Leave & Time Management (Leave, Encashment, Overtime, Regularization, Comp-Off, FMLA)
  ├── 2. HR Operations & Lifecycle (Exit, Clearance, Onboarding, Activation, Probation, Confirmation, Profile)
  ├── 3. Payroll, Compensation & Finance (Payroll Run, Adjustments, Tax, Full & Final, GL Posting, Finalization)
  ├── 4. Shift & Workforce Management (Shift Swap, Job Requisition Maker-Checker)
  ├── 5. Organization, Recruitment & Governance (Expense, Recruitment Pipeline, Position Control, Vendor Invoice)
  └── 6. Platform, Data Privacy & Security (Generic BPMN Engine, DSAR Data Privacy)
```

---

## 6. Master Workflow Inventory

The following table indexes all 29 business workflows discovered within the AuraOS repository:

| #   | Workflow Name                      | Business Module              | Primary Service / Endpoint Reference                    | Implementation Status |
| --- | ---------------------------------- | ---------------------------- | ------------------------------------------------------- | --------------------- |
| 01  | Leave Request Approval             | Leave & Time Management      | `apps/web/src/lib/services/leave.service.ts`            | Partially Implemented |
| 02  | Leave Encashment Approval          | Leave & Time Management      | `apps/web/src/app/api/v1/leave/encash/route.ts`         | Partially Implemented |
| 03  | Overtime Request Approval          | Leave & Time Management      | `apps/web/src/lib/services/overtime.service.ts`         | Partially Implemented |
| 04  | Attendance Regularization Approval | Leave & Time Management      | `apps/web/src/lib/services/overtime.service.ts`         | Partially Implemented |
| 05  | Comp-Off Workflow                  | Leave & Time Management      | `apps/web/src/lib/services/overtime.service.ts`         | Partially Implemented |
| 06  | Shift Swap Approval                | Shift & Workforce Management | `apps/web/src/lib/services/shift-management.service.ts` | **Fully Implemented** |
| 07  | Expense Claim Approval             | Organization & Governance    | `apps/web/src/lib/services/expense.service.ts`          | **Fully Implemented** |
| 08  | Employee Exit / Offboarding        | HR Operations & Lifecycle    | `apps/web/src/lib/services/exit.service.ts`             | **Fully Implemented** |
| 09  | Exit Clearance Process             | HR Operations & Lifecycle    | `apps/web/src/lib/services/exit.service.ts`             | **Fully Implemented** |
| 10  | Full & Final Settlement            | Payroll & Finance            | `apps/web/src/lib/services/full-final.service.ts`       | **Fully Implemented** |
| 11  | Payroll Run Processing             | Payroll & Finance            | `apps/web/src/lib/services/payroll.service.ts`          | Partially Implemented |
| 12  | Payroll Run Approval               | Payroll & Finance            | `apps/web/src/app/api/v1/payroll-runs/[id]/approve/`    | Partially Implemented |
| 13  | Payroll Adjustment Approval        | Payroll & Finance            | `apps/web/src/lib/services/payroll.service.ts`          | Partially Implemented |
| 14  | Tax Declaration Submission         | Payroll & Finance            | `apps/web/src/app/api/v1/tax-declarations/`             | Partially Implemented |
| 15  | GL Journal Posting & Reversal      | Payroll & Finance            | `apps/web/src/app/api/v1/payroll/gl/journals/`          | Partially Implemented |
| 16  | Employee Onboarding Case           | HR Operations & Lifecycle    | `apps/web/src/lib/services/onboarding-case.service.ts`  | **Fully Implemented** |
| 17  | Employee Master Data Activation    | HR Operations & Lifecycle    | `apps/web/src/app/api/v1/onboarding/employee-master/`   | Partially Implemented |
| 18  | Payroll Onboarding Approval        | HR Operations & Lifecycle    | `apps/web/src/app/api/v1/onboarding/payroll/`           | Partially Implemented |
| 19  | Probation Period Management        | HR Operations & Lifecycle    | `apps/web/src/lib/services/probation.service.ts`        | Partially Implemented |
| 20  | Employee Confirmation              | HR Operations & Lifecycle    | `apps/web/src/lib/services/confirmation.service.ts`     | Partially Implemented |
| 21  | Recruitment Pipeline               | Organization & Governance    | `apps/web/src/app/api/v1/recruitment/applications/`     | Partially Implemented |
| 22  | Job Requisition Maker-Checker      | Shift & Workforce Management | `apps/web/src/app/api/v1/workforce-planning/`           | **Fully Implemented** |
| 23  | Position Control Approval          | Organization & Governance    | `apps/web/src/app/api/v1/positions/`                    | Partially Implemented |
| 24  | Profile Change Request             | HR Operations & Lifecycle    | `apps/web/src/lib/services/profile-change.service.ts`   | **Fully Implemented** |
| 25  | Generic Workflow Engine            | Platform & Security          | `services/workflow-service/src/`                        | Partially Implemented |
| 26  | FMLA Leave Workflow                | Leave & Time Management      | `apps/web/src/app/api/v1/leave/fmla/`                   | Partially Implemented |
| 27  | DSAR Data Privacy Request          | Platform & Security          | `apps/web/src/app/api/v1/privacy/dsar/`                 | Partially Implemented |
| 28  | Payroll Finalization Workflow      | Payroll & Finance            | `apps/web/src/app/api/v1/payroll/runs/[id]/finalize/`   | Partially Implemented |
| 29  | Vendor Invoice Approval            | Organization & Governance    | `apps/web/src/app/api/v1/recruitment/vendors/`          | Partially Implemented |

---

## 7. Workflow Status Summary Matrix

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Implementation Status Breakdown                           │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│ Total Workflows Discovered                │ 29                                         │
│ Fully Implemented Production Workflows    │ 8 (27.6%)                                  │
│ Partially Implemented Workflows           │ 21 (72.4%)                                 │
│ Not Started / Uncoded Workflows           │ 0 (0.0%)                                   │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

```
Fully Implemented (8):
  [06] Shift Swap Approval
  [07] Expense Claim Approval
  [08] Employee Exit / Offboarding
  [09] Exit Clearance Process
  [10] Full & Final Settlement (UAE/GCC EOSB)
  [16] Employee Onboarding Case (Stage-Gated Governance)
  [22] Job Requisition Maker-Checker Workflow
  [24] Profile Change Request Approval

Partially Implemented (21):
  [01] Leave Request Approval           [02] Leave Encashment Approval
  [03] Overtime Request Approval        [04] Attendance Regularization Approval
  [05] Comp-Off Workflow               [11] Payroll Run Processing
  [12] Payroll Run Approval             [13] Payroll Adjustment Approval
  [14] Tax Declaration Submission       [15] GL Journal Posting & Reversal
  [17] Employee Master Activation       [18] Payroll Onboarding Approval
  [19] Probation Period Management      [20] Employee Confirmation
  [21] Recruitment Pipeline             [23] Position Control Approval
  [25] Generic BPMN Workflow Engine     [26] FMLA Leave Workflow
  [27] Data Subject Access Request      [28] Payroll Finalization Workflow
  [29] Vendor Invoice Approval
```

---

## 8. Directory & Folder Structure

All documentation artifacts are organized hierarchically within the repository root under `docs/`:

```
docs/
├── architecture/
│   ├── WORKFLOW_AUDIT_FINDINGS.md         # Cross-cutting architectural technical debt & analysis
│   ├── WORKFLOW_TRACEABILITY_MATRIX.md   # End-to-end trace from UI to Database & Audit Logs
│   └── WORKFLOW_IMPLEMENTATION_ROADMAP.md # Refactoring, completion & enhancement priorities
│
└── workflows/
    ├── README.md                          # Master Specification Index (This File)
    ├── 01-leave-request/
    │   └── README.md                      # Specification: Leave Request Approval Workflow
    ├── 02-leave-encashment/
    │   └── README.md                      # Specification: Leave Encashment Approval Workflow
    ├── 03-overtime/
    │   └── README.md                      # Specification: Overtime Request Approval Workflow
    ├── 04-attendance-regularization/
    │   └── README.md                      # Specification: Attendance Regularization Workflow
    ├── 05-comp-off/
    │   └── README.md                      # Specification: Comp-Off Generation & Application Workflow
    ├── 06-shift-swap/
    │   └── README.md                      # Specification: Shift Swap Peer & Manager Approval Workflow
    ├── 07-expense-claim/
    │   └── README.md                      # Specification: Expense Claim Policy Evaluation & Approval
    ├── 08-employee-exit/
    │   └── README.md                      # Specification: Employee Exit Request & Offboarding Workflow
    ├── 09-exit-clearance/
    │   └── README.md                      # Specification: Departmental Exit Clearance Rollup Process
    ├── 10-full-final-settlement/
    │   └── README.md                      # Specification: Full & Final Settlement & EOSB Calculation
    ├── 11-payroll-run/
    │   └── README.md                      # Specification: Multi-Step Payroll Calculation Run Processing
    ├── 12-payroll-run-approval/
    │   └── README.md                      # Specification: Payroll Run Governance & Approval Workflow
    ├── 13-payroll-adjustment/
    │   └── README.md                      # Specification: Payroll Adjustment Request & Verification
    ├── 14-tax-declaration/
    │   └── README.md                      # Specification: Employee Tax Declaration & Verification
    ├── 15-gl-journal-posting/
    │   └── README.md                      # Specification: General Ledger Journal Posting & Reversal
    ├── 16-employee-onboarding/
    │   └── README.md                      # Specification: Stage-Gated Onboarding Case Management
    ├── 17-employee-master-activation/
    │   └── README.md                      # Specification: Draft Employee Master Activation Workflow
    ├── 18-payroll-onboarding/
    │   └── README.md                      # Specification: Payroll Profile & Benefits Onboarding Setup
    ├── 19-probation-management/
    │   └── README.md                      # Specification: Probation Period Evaluation & Review Workflow
    ├── 20-employee-confirmation/
    │   └── README.md                      # Specification: Post-Probation Confirmation Dual-Approval
    ├── 21-recruitment-pipeline/
    │   └── README.md                      # Specification: Candidate Lifecycle, Interview & Offer E-Sign
    ├── 22-job-requisition/
    │   └── README.md                      # Specification: Workforce Planning Maker-Checker Workflow
    ├── 23-position-control/
    │   └── README.md                      # Specification: Organizational Hierarchy Position Control
    ├── 24-profile-change-request/
    │   └── README.md                      # Specification: Employee Profile Field Change Approval
    ├── 25-generic-workflow-engine/
    │   └── README.md                      # Specification: BPMN-Style Asynchronous BullMQ Engine
    ├── 26-fmla-leave/
    │   └── README.md                      # Specification: FMLA Leave Eligibility & State Transition
    ├── 27-dsar-data-privacy/
    │   └── README.md                      # Specification: Data Subject Access Request (DSAR) Workflow
    ├── 28-payroll-finalization/
    │   └── README.md                      # Specification: Payroll Post-Approval Lock & Finalization
    └── 29-vendor-invoice/
        └── README.md                      # Specification: Recruitment Vendor Invoice Verification
```

---

## 9. Naming Conventions & Repository References

To ensure consistency across all documentation specifications:

1. **Folder Naming:** Standardized two-digit zero-padded prefix followed by lower-case kebab-case slug (`01-leave-request`, `10-full-final-settlement`, `25-generic-workflow-engine`).
2. **File Naming:** Every workflow specification folder MUST contain a single primary `README.md` file.
3. **Repository References:** All code references MUST use full repository-relative file paths. Absolute paths or truncated file basenames are prohibited.
   - **Correct:** `apps/web/src/lib/services/leave.service.ts`
   - **Incorrect:** `leave.service.ts` or `C:/Users/.../leave.service.ts`
   - **Line-specific link format:** `apps/web/src/lib/services/leave.service.ts#L45-L89`

---

## 10. Standardized Specification Template (40-Section Framework)

Every individual workflow specification (`docs/workflows/XX-name/README.md`) follows a rigorous, uniform 40-section enterprise template:

```
 1. Executive Summary               15. Decision Matrix             29. Reports
 2. Business Purpose                16. State Diagram (Mermaid)     30. Dashboards
 3. Business Scope                  17. Exception Handling          31. Analytics
 4. Business Process Overview       18. Notifications               32. KPIs
 5. Mermaid Workflow Diagram        19. Escalation Rules            33. Edge Cases
 6. Business Actors                 20. SLA Rules                   34. Current Implementation
 7. Roles & Responsibilities (RACI) 21. RBAC Matrix               35. Gap Analysis
 8. Workflow Trigger Events         22. Audit Trail & Logging       36. Proposed Enterprise Workflow
 9. Entry Points                    23. UI Screens                  37. Testing Scenarios
10. Detailed Workflow Stages        24. Frontend Components         38. Acceptance Criteria
11. Stage Responsibilities          25. API Endpoints               39. Implementation Checklist
12. Stage Validation Rules          26. Backend Services            40. Repository References
13. Business Rules                  27. Database Models
14. Approval Matrix                 28. Integration Points
```

---

## 11. Traceability Strategy

The documentation library guarantees 100% bidirectional traceability between functional business rules and runtime software artifacts through a structured 8-tier hierarchy:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             8-Tier Traceability Hierarchy                              │
└────────────────────────────────────────────────────────────────────────────────────────┘
  [1. Business Requirement]  --> Policy definition & regulatory constraint
         │
         ▼
  [2. UI Screen / Page]      --> Frontend page (`apps/web/src/app/dashboard/...`)
         │
         ▼
  [3. API Endpoint Route]    --> REST API handler (`apps/web/src/app/api/v1/...`)
         │
         ▼
  [4. Validation Schema]     --> Zod Input contract (`z.object({...})`)
         │
         ▼
  [5. Business Service]      --> Domain logic class (`apps/web/src/lib/services/...`)
         │
         ▼
  [6. Database Model]        --> Prisma entity & enum (`packages/@aura/database/schema.prisma`)
         │
         ▼
  [7. Notification Trigger]  --> Event notification dispatch (`notification.service.ts` / WS)
         │
         ▼
  [8. Audit & Security]      --> RBAC guard & AuditLog persistence (`AuditLog`)
```

Every specification details the exact file locations, function names, database schema fields, and status transitions associated with each step in this hierarchy.

---

## 12. Cross-Cutting Architecture & Technical Debt Summary

During codebase discovery, six critical cross-cutting architectural observations were identified across the AuraOS workflow landscape. These findings are formally analyzed in `docs/architecture/WORKFLOW_AUDIT_FINDINGS.md`:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Summary of Key Architectural Observations                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. API Route Duplication      │ Competing routes for Leave & Payroll approval          │
│ 2. Schema Drift (@ts-nocheck) │ 5 key services bypass TypeScript validation (#29)      │
│ 3. Engine Separation          │ Generic BPMN engine disconnected from domain services   │
│ 4. Notification Stubs         │ WebSocket in-app active, email/SMS stubs unwired       │
│ 5. Unbound SLA Escalations    │ Escalation logic present but missing cron schedule      │
│ 6. Hardcoded State Machines   │ Domain modules duplicate status transition maps         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Documentation Execution Roadmap & Next Steps

This project is executed across five structured phases:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             Documentation Execution Sequence                           │
└────────────────────────────────────────────────────────────────────────────────────────┘
  Phase 1: Project Initialization & Master Index [COMPLETED — docs/workflows/README.md]
     │
     ▼
  Phase 2: Sequential Workflow README Generation [IN PROGRESS — 01 through 29]
     ├── 01-leave-request  ──────>  02-leave-encashment  ──────>  03-overtime
     ├── ...
     └── 29-vendor-invoice
     │
     ▼
  Phase 3: Architecture Audit Findings Documentation [`WORKFLOW_AUDIT_FINDINGS.md`]
     │
     ▼
  Phase 4: Workflow Traceability Matrix Documentation [`WORKFLOW_TRACEABILITY_MATRIX.md`]
     │
     ▼
  Phase 5: Implementation Roadmap & Prioritization [`WORKFLOW_IMPLEMENTATION_ROADMAP.md`]
```

### Next Action:

Proceed to **PHASE 2: Sequential Workflow Documentation**, starting with:
**Workflow 01 — Leave Request Approval Specification (`docs/workflows/01-leave-request/README.md`)**.

---

_End of Master Workflow Documentation Index._
