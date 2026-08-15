# AuraOS Enterprise Workflow Architecture Audit & Cross-Cutting Findings

## Technical Assessment, Risk Analysis & Production Readiness Evaluation

> **Document Code:** `ARCH-FIND-001`  
> **System:** AuraOS Enterprise ERP / HCM Platform  
> **Version:** 1.0.0  
> **Date:** 2026-07-29  
> **Status:** Official Master Architectural Assessment  
> **Primary Source of Truth:** Codebase Audit & Workflow Discovery Matrix (`docs/workflow/workflow_audit.md`)  
> **Target Audience:** Enterprise Solution Architects, Chief Product Officer, Technical Architects, Engineering Managers

---

## 1. Executive Summary

During the AuraOS Enterprise Workflow Discovery Audit, an in-depth, read-only analysis of the entire codebase (`apps/web/`, `services/`, `packages/@aura/database/`) was conducted.

The audit identified **29 business workflows** spanning Human Capital Management (HCM), Payroll, Time & Attendance, Shift Management, Workforce Planning, Expense Management, and Platform Governance.

While AuraOS exhibits strong architectural foundations—including a stage-gated onboarding engine, regional GCC End-of-Service Benefit (EOSB) calculation logic, BullMQ async worker queues, and an embedded BPMN-style generic workflow engine—the platform currently displays significant **architectural decoupling** and **technical debt**. Most notably, domain-specific business workflows (Leave, Expense, Exit, Payroll) operate via hand-coded, isolated state machines rather than leveraging the platform's generic Workflow Engine. Furthermore, 5 critical backend service files contain `@ts-nocheck` annotations due to Prisma schema field drift, and several primary workflows expose duplicate API endpoint routes.

This document serves as the canonical master reference for all cross-cutting architectural observations, technical debt items, operational risks, and remediation roadmaps.

---

## 2. Audit Scope

The discovery audit examined all executable source code, schema files, service classes, API handlers, and UI dashboards within the AuraOS repository:

- **Frontend Application:** Next.js App Router UI pages and React components (`apps/web/src/app/dashboard/`).
- **REST API Routes:** Next.js Route Handlers (`apps/web/src/app/api/v1/`).
- **Domain Services:** Core TypeScript service classes (`apps/web/src/lib/services/`).
- **Standalone Microservices:** Workflow Service microservice (`services/workflow-service/`).
- **Database Schema:** Prisma ORM schema and entity models (`packages/@aura/database/prisma/schema.prisma`).

---

## 3. Audit Methodology

The audit followed a non-invasive, evidence-only static code analysis protocol:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Audit Discovery Flow                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
  1. API & Route Discovery   --> Scanned `apps/web/src/app/api/v1/` for endpoints
  2. Service Inspection       --> Inspected methods in `apps/web/src/lib/services/`
  3. Schema Mapping           --> Mapped entity models in `schema.prisma`
  4. Worker & Queue Check     --> Inspected BullMQ execution workers in `services/`
  5. UI Hydration Mapping     --> Cross-referenced Next.js dashboard pages in `app/dashboard/`
  6. Gap Verification         --> Identified missing wires, stubs (@ts-nocheck), and route conflicts
```

---

## 4. Overall Statistics & Maturity Summary

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           Workflow Implementation Maturity                             │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│ Total Business Workflows Discovered       │ 29 Workflows                               │
│ Fully Implemented Workflows               │ 8 Workflows (27.6%)                        │
│ Partially Implemented Workflows          │ 21 Workflows (72.4%)                       │
│ Missing / Uncoded Workflows               │ 0 Workflows (0.0%)                         │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

### Maturity Breakdown

- **Fully Implemented (8):** `Shift Swap Approval`, `Expense Claim Approval`, `Employee Exit`, `Exit Clearance Process`, `Full & Final Settlement`, `Employee Onboarding Case`, `Job Requisition Maker-Checker`, `Profile Change Request`.
- **Partially Implemented (21):** Workflows with complete state models or API endpoints, but exhibiting `@ts-nocheck` schema drift, un-wired email/SMS notifications, duplicate route handlers, or manual cron escalation triggers.

---

## 5. Workflow Completion Matrix

| #   | Workflow Name                 | Business Module     | Codebase Artifact Evidence                              | Maturity Rating       |
| --- | ----------------------------- | ------------------- | ------------------------------------------------------- | --------------------- |
| 01  | Leave Request Approval        | Leave & Time        | `apps/web/src/lib/services/leave.service.ts`            | Partially Implemented |
| 02  | Leave Encashment Approval     | Leave & Time        | `apps/web/src/app/api/v1/leave/encash/`                 | Partially Implemented |
| 03  | Overtime Request Approval     | Leave & Time        | `apps/web/src/lib/services/overtime.service.ts`         | Partially Implemented |
| 04  | Attendance Regularization     | Leave & Time        | `apps/web/src/lib/services/overtime.service.ts`         | Partially Implemented |
| 05  | Comp-Off Workflow             | Leave & Time        | `apps/web/src/lib/services/overtime.service.ts`         | Partially Implemented |
| 06  | Shift Swap Approval           | Shift & Workforce   | `apps/web/src/lib/services/shift-management.service.ts` | **Fully Implemented** |
| 07  | Expense Claim Approval        | Governance & Org    | `apps/web/src/lib/services/expense.service.ts`          | **Fully Implemented** |
| 08  | Employee Exit / Offboarding   | HR Operations       | `apps/web/src/lib/services/exit.service.ts`             | **Fully Implemented** |
| 09  | Exit Clearance Process        | HR Operations       | `apps/web/src/lib/services/exit.service.ts`             | **Fully Implemented** |
| 10  | Full & Final Settlement       | Payroll & Finance   | `apps/web/src/lib/services/full-final.service.ts`       | **Fully Implemented** |
| 11  | Payroll Run Processing        | Payroll & Finance   | `apps/web/src/lib/services/payroll.service.ts`          | Partially Implemented |
| 12  | Payroll Run Approval          | Payroll & Finance   | `apps/web/src/app/api/v1/payroll-runs/[id]/approve/`    | Partially Implemented |
| 13  | Payroll Adjustment Approval   | Payroll & Finance   | `apps/web/src/lib/services/payroll.service.ts`          | Partially Implemented |
| 14  | Tax Declaration Submission    | Payroll & Finance   | `apps/web/src/app/api/v1/tax-declarations/`             | Partially Implemented |
| 15  | GL Journal Posting & Reversal | Payroll & Finance   | `apps/web/src/app/api/v1/payroll/gl/journals/`          | Partially Implemented |
| 16  | Employee Onboarding Case      | HR Operations       | `apps/web/src/lib/services/onboarding-case.service.ts`  | **Fully Implemented** |
| 17  | Employee Master Activation    | HR Operations       | `apps/web/src/app/api/v1/onboarding/employee-master/`   | Partially Implemented |
| 18  | Payroll Onboarding Approval   | HR Operations       | `apps/web/src/app/api/v1/onboarding/payroll/`           | Partially Implemented |
| 19  | Probation Period Management   | HR Operations       | `apps/web/src/lib/services/probation.service.ts`        | Partially Implemented |
| 20  | Employee Confirmation         | HR Operations       | `apps/web/src/lib/services/confirmation.service.ts`     | Partially Implemented |
| 21  | Recruitment Pipeline          | Governance & Org    | `apps/web/src/app/api/v1/recruitment/applications/`     | Partially Implemented |
| 22  | Job Requisition Maker-Checker | Shift & Workforce   | `apps/web/src/app/api/v1/workforce-planning/`           | **Fully Implemented** |
| 23  | Position Control Approval     | Governance & Org    | `apps/web/src/app/api/v1/positions/`                    | Partially Implemented |
| 24  | Profile Change Request        | HR Operations       | `apps/web/src/lib/services/profile-change.service.ts`   | **Fully Implemented** |
| 25  | Generic Workflow Engine       | Platform & Security | `services/workflow-service/src/`                        | Partially Implemented |
| 26  | FMLA Leave Workflow           | Leave & Time        | `apps/web/src/app/api/v1/leave/fmla/`                   | Partially Implemented |
| 27  | DSAR Data Privacy Request     | Platform & Security | `apps/web/src/app/api/v1/privacy/dsar/`                 | Partially Implemented |
| 28  | Payroll Finalization          | Payroll & Finance   | `apps/web/src/app/api/v1/payroll/runs/[id]/finalize/`   | Partially Implemented |
| 29  | Vendor Invoice Approval       | Governance & Org    | `apps/web/src/app/api/v1/recruitment/vendors/`          | Partially Implemented |

---

## 6. Architecture Overview & Engine Separation

AuraOS operates a **hybrid workflow architecture**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              AuraOS Dual-Layer Workflow Architecture                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
     LAYER 1: DOMAIN STATE MACHINES                 LAYER 2: GENERIC BPMN ENGINE
     (Used by core ERP/HCM business modules)        (Platform capability — decoupled)

  ┌────────────────────────────────────────┐     ┌──────────────────────────────────────┐
  │  Leave / Expense / Exit / Onboarding   │     │  services/workflow-service/          │
  │  Hand-coded state transitions          │     │  BullMQ Queue ('workflow-execution') │
  │  Direct Prisma ORM mutations           │     │  Visual BPMN Designer (14 UI pages)  │
  │  State transition maps in TypeScript   │     │  Dynamic Approval & Node Execution   │
  └────────────────────────────────────────┘     └──────────────────────────────────────┘
```

### Major Architectural Finding: Engine Disconnection

The BPMN-style generic workflow engine (`services/workflow-service/`) and its corresponding frontend module (`apps/web/src/app/dashboard/workflow-engine/`) are **NOT connected to domain-specific workflows** (Leave, Expense, Exit, Payroll, Onboarding). Domain workflows rely on direct, imperative TypeScript service code (`LeaveService`, `ExitService`).

---

## 7. Cross-Cutting Findings by Architectural Area

### 7.1 Workflow Engine Findings

- **Generic Engine Architecture:** Built with Node.js, Redis, and BullMQ (`services/workflow-service/src/workers/workflowExecutionWorker.ts`). Supports 7 node types (`start`, `end`, `action`, `condition`, `approval`, `delay`, `parallel`).
- **Task Delegation & Inbox:** Includes dynamic task inbox services (`TaskService`) and task reassignment (`ApprovalService.delegateApproval()`), but these are only accessible within the generic engine dashboard.

### 7.2 Approval Engine Findings

- **Pattern Variation:** Approval logic is implemented inconsistently across services:
  - `ExpenseService`: Implements dynamic policy evaluation (`evaluatePolicy()`) with threshold-based routing.
  - `ExitService`: Implements multi-departmental clearance rollup (`addClearance()`, `completeClearance()`).
  - `ShiftManagementService`: Implements 2-level peer and manager approval (`peer-approve`, `manager-approve`).
  - `requisitionMakerCheckerService`: Implements Maker-Checker discriminated action payloads.

### 7.3 Notification Findings

- **WebSocket In-App Active:** Real-time notifications are actively dispatched via WebSocket (`notification.service.ts` $\to$ `wsServer`).
- **Notification Stub:** `apps/web/src/lib/services/notification.service.ts` contains `@ts-nocheck` and is flagged as a stub service. Email transport (`email.service.ts`, ~15KB) exists but is not wired to approval workflow lifecycle triggers.

### 7.4 Scheduler Findings

- **Unbound SLA Escalations:** `OnboardingCaseService.escalateBreachedCases()` contains logic to scan and escalate overdue cases where `slaDueAt < now`. However, no active cron job binding in `packages/@aura/scheduler/` was found wired to invoke this method automatically.

### 7.5 API Findings & Dual Route Conflicts

- **Duplicate Leave Routes:** Both `/api/v1/leave-requests/[id]/approve` and `/api/v1/leave/requests/[id]/approve` exist and execute approval logic.
- **Duplicate Payroll Routes:** Both `/api/v1/payroll-runs/[id]/approve` and `/api/v1/payroll/approve/[runId]` exist.

### 7.6 Technical Debt & Schema Drift (@ts-nocheck)

Five primary backend files carry `@ts-nocheck` comments due to Prisma schema field drift:

1. `apps/web/src/lib/services/workflowService.ts` (Stub file)
2. `apps/web/src/lib/services/notification.service.ts` (Stub service)
3. `apps/web/src/lib/services/confirmation.service.ts` (Schema drift against `ConfirmationRequest`)
4. `apps/web/src/lib/services/overtime.service.ts` (Schema drift against `AttendanceRecord`)
5. `apps/web/src/app/api/v1/payroll/run/route.ts` (Schema drift against `PayrollRun`)

---

## 8. Business, Technical & Operational Risks

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Enterprise Risk Matrix                                    │
├──────────────────┬──────────┬──────────────────────────────────────────────────────────┤
│ Risk Description │ Severity │ Root Cause & Impact                                      │
├──────────────────┼──────────┼──────────────────────────────────────────────────────────┤
│ Runtime Failures │ CRITICAL │ `@ts-nocheck` schema drift may crash production APIs     │
│ API Confusion    │ HIGH     │ Duplicate routes lead to inconsistent state updates      │
│ SLA Breaches     │ HIGH     │ Missing cron triggers cause silent SLA escalations       │
│ Unsent Alerts    │ MEDIUM   │ Unwired email service leaves approvers unaware of tasks   │
│ Code Churn       │ MEDIUM   │ Hard-coded state machines require code changes for rules │
└──────────────────┴──────────┴──────────────────────────────────────────────────────────┘
```

---

## 9. Priority Remediation Matrix

```
  CRITICAL (Fix Immediately)
  ├── 1. Resolve `@ts-nocheck` schema drift in 5 core service files
  └── 2. Deprecate and consolidate duplicate API routes (Leave & Payroll)

  HIGH (Next Release Cycle)
  ├── 3. Wire `packages/@aura/scheduler/` cron to `escalateBreachedCases()`
  └── 4. Wire `email.service.ts` to workflow approval events

  MEDIUM (Mid-Term Enhancements)
  ├── 5. Refactor hand-coded domain state machines into unified event-bus architecture
  └── 6. Wire generic BPMN Workflow Engine to domain workflow events

  LOW (Future Enterprise Improvements)
  └── 7. Implement AI-driven workflow bottleneck analytics and automated routing
```

---

## 10. Categorized Implementation Recommendations

### 10.1 Backend & Schema

- Remove all `@ts-nocheck` directives and align service interfaces with `packages/@aura/database/prisma/schema.prisma`.
- Consolidate dual API endpoints into canonical REST routes (`/api/v1/leave-requests` and `/api/v1/payroll-runs`).

### 10.2 Notifications & Scheduling

- Connect `email.service.ts` to `notification.service.ts` so approval events trigger both WebSocket and Email alerts.
- Configure a 15-minute cron job in `@aura/scheduler` to invoke `OnboardingCaseService.escalateBreachedCases()`.

### 10.3 Architecture & Workflow Engine

- Introduce an Event Bus layer (e.g., `EventEmitter` or Redis Pub/Sub) allowing domain service transitions to publish events that the generic Workflow Engine can observe and execute.

---

## 11. Key Repository References

- **Core Engine Worker:** `services/workflow-service/src/workers/workflowExecutionWorker.ts`
- **Generic Engine Frontend:** `apps/web/src/app/dashboard/workflow-engine/services.ts`
- **Onboarding Stage Engine:** `apps/web/src/lib/services/onboarding-case.service.ts`
- **Exit & Clearance Service:** `apps/web/src/lib/services/exit.service.ts`
- **Full & Final EOSB Service:** `apps/web/src/lib/services/full-final.service.ts`
- **Notification Service:** `apps/web/src/lib/services/notification.service.ts`
- **Prisma Data Models:** `packages/@aura/database/prisma/schema.prisma`

---

_End of Workflow Architecture Audit Findings (`ARCH-FIND-001`)._
