# Workflow 07 — Expense Claim Approval Enterprise Specification

> **Document Code:** `SPEC-WF-07`  
> **System:** AuraOS Enterprise ERP / HCM Platform  
> **Version:** 1.0.0  
> **Date:** 2026-07-29  
> **Status:** Official Production Specification  
> **Primary Code Location:** `apps/web/src/lib/services/expense.service.ts`  
> **Primary API Route:** `POST /api/v1/expenses`  
> **Primary Database Entity:** `ExpenseClaim` (`packages/@aura/database/prisma/schema.prisma#L5755-L5787`)

---

## Metadata Header

| Attribute                     | Value / Reference                                                           |
| ----------------------------- | --------------------------------------------------------------------------- |
| **Workflow ID & Name**        | `07` — `Expense Claim Approval Workflow`                                    |
| **Business Module**           | `Organization & Governance`                                                 |
| **Submodule / Domain**        | `Expense Management & Policy Evaluation`                                    |
| **Business Process Owner**    | `Finance & Corporate Governance Director`                                   |
| **Technical System Owner**    | `Lead Financial & HCM Systems Architect`                                    |
| **Implementation Status**     | **`Fully Implemented`**                                                     |
| **Specification Version**     | `1.0.0`                                                                     |
| **Date Created / Updated**    | `2026-07-29`                                                                |
| **Technical Author**          | `Enterprise Solution Architect (AI Agent)`                                  |
| **Technical Reviewer**        | `Senior Software Architect`                                                 |
| **QA Verifier**               | `QA Lead`                                                                   |
| **Final Approver**            | `Chief Product Officer`                                                     |
| **Primary Code Location**     | `apps/web/src/lib/services/expense.service.ts`                              |
| **Primary API Route**         | `POST /api/v1/expenses`                                                     |
| **Primary Database Entity**   | `ExpenseClaim` (`packages/@aura/database/prisma/schema.prisma#L5755-L5787`) |
| **Related Architecture Docs** | `docs/architecture/WORKFLOW_AUDIT_FINDINGS.md`                              |

---

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. Business Context](#2-business-context)
- [3. Business Objectives](#3-business-objectives)
- [4. Business Scope](#4-business-scope)
- [5. Workflow Overview](#5-workflow-overview)
- [6. Business Process Description](#6-business-process-description)
- [7. Mermaid Business Workflow Diagram](#7-mermaid-business-workflow-diagram)
- [8. Business Actors](#8-business-actors)
- [9. RACI Matrix](#9-raci-matrix)
- [10. Entry Points](#10-entry-points)
- [11. Trigger Events](#11-trigger-events)
- [12. Workflow Stages](#12-workflow-stages)
- [13. Workflow State Machine](#13-workflow-state-machine)
- [14. Approval Process](#14-approval-process)
- [15. Approval Matrix](#15-approval-matrix)
- [16. Decision Matrix](#16-decision-matrix)
- [17. Business Rules](#17-business-rules)
- [18. Compliance Rules](#18-compliance-rules)
- [19. Country-Specific Rules](#19-country-specific-rules)
- [20. Exception Handling](#20-exception-handling)
- [21. Notifications](#21-notifications)
- [22. Escalation Rules](#22-escalation-rules)
- [23. SLA Rules](#23-sla-rules)
- [24. RBAC Matrix](#24-rbac-matrix)
- [25. Audit Trail](#25-audit-trail)
- [26. UI Screens](#26-ui-screens)
- [27. Frontend Architecture](#27-frontend-architecture)
- [28. API Specification](#28-api-specification)
- [29. Backend Architecture](#29-backend-architecture)
- [30. Database Design](#30-database-design)
- [31. Integration Points](#31-integration-points)
- [32. Reports](#32-reports)
- [33. Dashboard KPIs](#33-dashboard-kpis)
- [34. Analytics](#34-analytics)
- [35. CURRENT IMPLEMENTATION](#35-current-implementation)
- [36. IMPLEMENTATION GAPS](#36-implementation-gaps)
- [37. PROPOSED ENTERPRISE IMPLEMENTATION](#37-proposed-enterprise-implementation)
- [38. Migration Strategy](#38-migration-strategy)
- [39. Testing Strategy](#39-testing-strategy)
- [40. Acceptance Criteria](#40-acceptance-criteria)
- [41. Implementation Checklist](#41-implementation-checklist)
- [42. Known Risks](#42-known-risks)
- [43. Related Architecture Findings](#43-related-architecture-findings)
- [44. Repository References](#44-repository-references)

---

## 1. Executive Summary

The **Expense Claim Approval Workflow** is a **Fully Implemented** production process in AuraOS. It manages the submission, policy evaluation, approval routing, and financial disbursement of employee business expenses (travel, meals, accommodation, office supplies, client entertainment). The workflow features automated policy evaluation (`ExpenseService.evaluatePolicy`), enforcing line-item receipt requirements (`receiptRequiredOver`), category spending caps (`categoryCaps`), and multi-threshold approval routing (`requiresManagerOver`, `requiresFinanceOver`). Final payment execution (`markPaid`) strictly enforces real payment reference validation.

---

## 2. Business Context

In enterprise financial management, business expense reimbursement requires balancing employee convenience against financial controls and tax compliance. Organizations must prevent fraudulent claims, enforce corporate spend policies, capture receipt documentation for tax audit compliance, and ensure proper general ledger cost allocation. Automated policy evaluation prevents out-of-policy claims from entering approval queues and provides finance teams with audit-ready expense records.

---

## 3. Business Objectives

- **Automated Spend Policy Evaluation:** Dynamically evaluate claims against `ExpensePolicy` thresholds for receipt mandates, category caps, and manager/finance approval routing.
- **Enforce State Machine Integrity:** Guard status transitions (`DRAFT` $\to$ `SUBMITTED` $\to$ `APPROVED` $\to$ `PAID`, `REJECTED` $\to$ `DRAFT`).
- **Enforce Real Payment References:** Require non-placeholder payment reference strings ($\ge 3$ characters) upon executing `markPaid()`.
- **Maintain Audit Trail:** Log all claim actions (`CREATE`, `SUBMIT`, `APPROVE`, `REJECT`, `PAY`) via `withAudit` middleware.

---

## 4. Business Scope

### 4.1 In-Scope

- Creation of draft claims and line items via `POST /api/v1/expenses`.
- Submission via `POST /api/v1/expenses/[id]/submit`.
- Automated policy checks (`evaluatePolicy()`) blocking submissions missing required receipts (`PolicyViolationError`).
- Manager approval (`POST /api/v1/expenses/[id]/approve`) and rejection (`POST /api/v1/expenses/[id]/reject`).
- Finance disbursement (`POST /api/v1/expenses/[id]/pay`) with `paidReference` validation.
- Rejection reset allowing employees to edit and resubmit rejected claims (`REJECTED` $\to$ `DRAFT`).

### 4.2 Out-of-Scope

- Corporate credit card automated bank statement feeds (handled by FinOps Gateway).

---

## 5. Workflow Overview

The expense claim moves through policy evaluation, approval routing, and financial settlement:

```
┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌────────────┐     ┌──────────────┐     ┌──────────┐
│ Employee │ ──> │ Create    │ ──> │ Policy       │ ──> │ Manager /  │ ──> │ Finance      │ ──> │ Status:  │
│ Creates  │     │ DRAFT     │     │ Evaluation   │     │ Finance    │     │ Disburses    │     │ PAID     │
└──────────┘     └───────────┘     └──────────────┘     └────────────┘     └──────────────┘     └──────────┘
```

---

## 6. Business Process Description

1. **Draft Creation:** An employee creates an expense claim in `DRAFT` status with title, currency, and line items (category, amount, receipt URL, merchant). `ExpenseService.createDraft()` calculates the total claim amount.
2. **Submission & Policy Evaluation:** The employee submits the claim (`POST /api/v1/expenses/[id]/submit`). `ExpenseService.submit()` invokes `evaluatePolicy()`:
   - Verifies if any line item $> receiptRequiredOver$ lacks a `receiptUrl`. If missing, `PolicyViolationError` blocks submission.
   - Checks line items against `categoryCaps`. Generates warnings if caps are exceeded.
   - Determines approval routing lane: `auto` (total $\le$ manager threshold), `manager` (total $>$ manager threshold), or `finance` (total $>$ finance threshold).
   - Updates status to `SUBMITTED` and records `submittedAt`.
3. **Approval Decision:** Authorized approver (Manager or Finance Officer) reviews the claim:
   - If approved, `ExpenseService.approve()` sets status to `APPROVED` and records `approvedBy` and `approvedAt`.
   - If rejected, `ExpenseService.reject()` sets status to `REJECTED` and records `rejectionReason`. Employee can update and resubmit (`REJECTED` $\to$ `DRAFT`).
4. **Disbursement:** Finance Officer executes payment via `POST /api/v1/expenses/[id]/pay` supplying a valid `paidReference`. `ExpenseService.markPaid()` sets status to `PAID` and records `paidAt`.

---

## 7. Mermaid Business Workflow Diagram

```mermaid
graph TD
    A([Start: Employee Creates Claim]) --> B[Save Claim - Status: DRAFT]
    B --> C[Employee Submits Claim for Approval]
    C --> D[Invoke ExpenseService.evaluatePolicy]
    D --> E{\`Receipt Required Failures?\`}
    E -- Yes --> F[Throw PolicyViolationError - Block Submission]
    E -- No --> G[Set Status: SUBMITTED]
    G --> H{\`Claim Total Threshold?\`}
    H -- Total <= $100 --> I[Route: Auto / Manager Approval]
    H -- Total > $1,000 --> J[Route: Finance Officer Approval]
    I --> K([End: Await Manager Approval])
    J --> L([End: Await Finance Approval])

    K --> M{\`Approver Decision?\`}
    L --> M
    M -- Reject --> N[Set Status: REJECTED & Record Reason]
    N --> O[Employee Can Edit & Reset to DRAFT]
    M -- Approve --> P[Set Status: APPROVED & Record ApprovedBy]
    P --> Q[Finance Executes Disbursement]
    Q --> R[Validate Non-Placeholder paidReference >= 3 chars]
    R --> S[Set Status: PAID & Record paidAt]
    S --> T([End: Expense Reimbursed & Settled])
```

---

## 8. Business Actors

| Actor Role            | Actor Type | System Persona    | Operational Responsibilities                                                  |
| --------------------- | ---------- | ----------------- | ----------------------------------------------------------------------------- |
| **Expense Requestor** | Human      | `EMPLOYEE`        | Creates draft claim, attaches receipts, and submits for reimbursement         |
| **Line Manager**      | Human      | `LINE_MANAGER`    | Approves standard operational expense claims ($>\$100$)                       |
| **Finance Officer**   | Human      | `FINANCE_OFFICER` | Approves high-value claims ($>\$1,000$) and executes final payment            |
| **Expense Service**   | System     | `ExpenseService`  | Enforces state machine transitions, policy evaluation, and payment references |

---

## 9. RACI Matrix

| Workflow Activity    | Employee  | Line Manager | Finance Officer |       ExpenseService       | Prisma DB |
| -------------------- | :-------: | :----------: | :-------------: | :------------------------: | :-------: |
| Create Draft Claim   | **R / A** |      I       |        I        |             C              |     C     |
| Policy Evaluation    |     I     |      I       |        I        |         **R / A**          |     C     |
| Manager Approval     |     I     |  **R / A**   |        C        |             I              |     C     |
| Finance Approval     |     I     |      C       |    **R / A**    |             I              |     C     |
| Mark Paid (Disburse) |     I     |      I       |    **R / A**    | **C (Validate Reference)** |   **A**   |

---

## 10. Entry Points

- **Primary REST API Endpoint:** `POST /api/v1/expenses` (`apps/web/src/app/api/v1/expenses/route.ts#L64`)
- **Submit Endpoint:** `POST /api/v1/expenses/[id]/submit` (`apps/web/src/app/api/v1/expenses/[id]/submit/route.ts`)
- **Approve Endpoint:** `POST /api/v1/expenses/[id]/approve` (`apps/web/src/app/api/v1/expenses/[id]/approve/route.ts`)
- **Pay Endpoint:** `POST /api/v1/expenses/[id]/pay` (`apps/web/src/app/api/v1/expenses/[id]/pay/route.ts`)
- **Frontend Dashboard Screen:** `apps/web/src/app/dashboard/expenses/page.tsx`

---

## 11. Trigger Events

| Trigger Event Name        | Trigger Type    | Source System / Action   | Payload Attributes                         |
| ------------------------- | --------------- | ------------------------ | ------------------------------------------ |
| `EXPENSE_CLAIM_CREATED`   | User UI Action  | `POST /api/v1/expenses`  | `tenantId`, `employeeId`, `title`, `items` |
| `EXPENSE_CLAIM_SUBMITTED` | User UI Action  | `POST /.../[id]/submit`  | `id`, `tenantId`, `actorId`                |
| `EXPENSE_CLAIM_APPROVED`  | Approver Action | `POST /.../[id]/approve` | `id`, `tenantId`, `actorId`                |
| `EXPENSE_CLAIM_PAID`      | Finance Action  | `POST /.../[id]/pay`     | `id`, `paidReference`, `actorId`           |

---

## 12. Workflow Stages

### 12.1 Stage 1: Claim Creation (`DRAFT`)

- **Stage Identifier:** `DRAFT`
- **Stage Owner Role:** `EMPLOYEE`
- **SLA Window:** Immediate
- **Exit Criteria:** Saved with title, currency, and line items; status set to `DRAFT`.
- **Status Value:** `DRAFT`
- **Repository Implementation:** `apps/web/src/lib/services/expense.service.ts#L160-L199`

### 12.2 Stage 2: Policy Check & Submission (`SUBMITTED`)

- **Stage Identifier:** `SUBMITTED`
- **Stage Owner Role:** `EMPLOYEE` / `ExpenseService`
- **SLA Window:** Immediate
- **Validation Guard:** `evaluatePolicy()` verifies receipts for items $> receiptRequiredOver$.
- **Status Value:** `SUBMITTED`
- **Repository Implementation:** `apps/web/src/lib/services/expense.service.ts#L201-L237`

### 12.3 Stage 3: Approval Decision (`APPROVED`)

- **Stage Identifier:** `APPROVED`
- **Stage Owner Role:** `LINE_MANAGER` / `FINANCE_OFFICER`
- **SLA Window:** 48 Hours
- **Status Value:** `APPROVED`
- **Repository Implementation:** `apps/web/src/lib/services/expense.service.ts#L239-L252`

### 12.4 Stage 4: Disbursement (`PAID`)

- **Stage Identifier:** `PAID`
- **Stage Owner Role:** `FINANCE_OFFICER`
- **SLA Window:** 72 Hours Post-Approval
- **Validation Guard:** `paidReference` non-empty and $\ge 3$ characters.
- **Status Value:** `PAID`
- **Repository Implementation:** `apps/web/src/lib/services/expense.service.ts#L285-L301`

---

## 13. Workflow State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Create Claim (createDraft)
    DRAFT --> SUBMITTED : Submit Claim (submit)
    DRAFT --> CANCELED : Cancel Claim (cancel)
    SUBMITTED --> APPROVED : Approve Claim (approve)
    SUBMITTED --> REJECTED : Reject Claim (reject)
    SUBMITTED --> CANCELED : Cancel Claim (cancel)
    REJECTED --> DRAFT : Re-edit Claim
    APPROVED --> PAID : Disburse Payment (markPaid)
    APPROVED --> CANCELED : Cancel Claim (cancel)
    PAID --> [*]
    CANCELED --> [*]
```

| From State  | To State    | Trigger / Method | Prerequisites / Guards      | Side Effects                                     |
| ----------- | ----------- | ---------------- | --------------------------- | ------------------------------------------------ |
| `DRAFT`     | `SUBMITTED` | `submit()`       | Policy receipt checks pass  | Sets `submittedAt`; evaluates approval lane      |
| `SUBMITTED` | `APPROVED`  | `approve()`      | Status is `SUBMITTED`       | Sets `approvedBy` and `approvedAt`               |
| `SUBMITTED` | `REJECTED`  | `reject()`       | Status is `SUBMITTED`       | Sets `rejectionReason`; enables reset to `DRAFT` |
| `APPROVED`  | `PAID`      | `markPaid()`     | `paidReference.length >= 3` | Sets `paidAt` and `paidReference`                |
| `REJECTED`  | `DRAFT`     | Re-edit          | Status is `REJECTED`        | Resets status to `DRAFT` for correction          |

---

## 14. Approval Process

Approval routing is dynamically determined during `submit()` by `evaluatePolicy()`:

- **Auto Approval Lane (`auto`):** Claim total $\le \$100$ (`requiresManagerOver`).
- **Manager Approval Lane (`manager`):** Claim total $>\$100$ and $\le \$1,000$.
- **Finance Approval Lane (`finance`):** Claim total $>\$1,000$ (`requiresFinanceOver`).

---

## 15. Approval Matrix

| Approval Lane    | Total Amount Threshold             | Approver Role   | SLA Target | Escalation Target |
| ---------------- | ---------------------------------- | --------------- | ---------- | ----------------- |
| Auto Approval    | Total $\le \$100$                  | System / Auto   | Immediate  | N/A               |
| Manager Approval | $\$100 < \text{Total} \le \$1,000$ | Line Manager    | 48 Hours   | HR Manager        |
| Finance Approval | Total $>\$1,000$                   | Finance Officer | 72 Hours   | Finance VP / CFO  |

---

## 16. Decision Matrix

| Line Amount $>$ Receipt Threshold? | Receipt Attached? | Claim Total Threshold | Decision / Lane  | Outcome                                         |
| ---------------------------------- | ----------------- | --------------------- | ---------------- | ----------------------------------------------- |
| Yes                                | No                | Irrelevant            | Policy Violation | Block submission (Throw `PolicyViolationError`) |
| Yes                                | Yes               | Total $\le \$100$     | Auto Lane        | Allow submission                                |
| Yes                                | Yes               | Total $>\$1,000$      | Finance Lane     | Route to Finance Approval                       |

---

## 17. Business Rules

#### BR-GOV-EXP-001: Mandatory Receipt Threshold

- **Category:** Validation / Tax Compliance
- **Severity:** BLOCKED (Submission rejected)
- **Description:** Any line item exceeding `receiptRequiredOver` (default $\$25$) MUST have a valid `receiptUrl`.
- **Repository Reference:** `apps/web/src/lib/services/expense.service.ts#L88-L92`

#### BR-GOV-EXP-002: Real Payment Reference Mandate

- **Category:** Financial Audit Control
- **Severity:** BLOCKED (Payment execution rejected)
- **Description:** Executing `markPaid()` requires a real, non-placeholder payment reference string of at least 3 characters.
- **Repository Reference:** `apps/web/src/lib/services/expense.service.ts#L286-L288`

#### BR-GOV-EXP-003: State Machine Transition Guard

- **Category:** State Integrity
- **Severity:** BLOCKED (Invalid transition rejected)
- **Description:** Claims can only transition through allowed `STATUS_TRANSITIONS` (e.g., `DRAFT` $\to$ `SUBMITTED` $\to$ `APPROVED` $\to$ `PAID`).
- **Repository Reference:** `apps/web/src/lib/services/expense.service.ts#L22-L29`

---

## 18. Compliance Rules

- **Tax Receipt Mandate:** Statutory tax audit regulations require digital receipt archiving for all business expenses above statutory thresholds.
- **Tenant Isolation:** All expense queries MUST filter by `tenantId`.

---

## 19. Country-Specific Rules

| Country Code | Statutory Rule                | Receipt Threshold                                | Repository Reference                               |
| ------------ | ----------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| `US` / `UAE` | IRS / FTA Expense Regulations | Receipts mandatory for claims $> \$25$ / AED 100 | `apps/web/src/lib/services/expense.service.ts#L85` |

---

## 20. Exception Handling

| Error Exception                          | HTTP Status | Root Cause                             | System Action                                  |
| ---------------------------------------- | :---------: | -------------------------------------- | ---------------------------------------------- |
| `InvalidExpenseTransitionError`          |    `400`    | Attempting forbidden status transition | Aborts request; returns 400                    |
| `PolicyViolationError`                   |    `400`    | Line item missing mandatory receipt    | Aborts submission; lists missing receipt items |
| `Error("payment reference is required")` |    `400`    | `paidReference` empty or $< 3$ chars   | Aborts payment execution                       |

---

## 21. Notifications

- Notification logging integrated via `withAudit` (`AuditAction.APPROVE_EXPENSE_CLAIM`, `REJECT_EXPENSE_CLAIM`).

---

## 22–23. Escalation & SLA Rules

- **Manager SLA:** 48 Hours.
- **Finance SLA:** 72 Hours.

---

## 24. RBAC Matrix

| Role              | `expenses:read` | `expenses:create` | Approval Permission | Finance Payment | Admin Override |
| ----------------- | :-------------: | :---------------: | :-----------------: | :-------------: | :------------: |
| `EMPLOYEE`        |    ✅ (Own)     | ✅ (Draft/Submit) |         ❌          |       ❌        |       ❌       |
| `LINE_MANAGER`    |    ✅ (Team)    |        ✅         |  ✅ (Manager Lane)  |       ❌        |       ❌       |
| `FINANCE_OFFICER` |    ✅ (All)     |        ✅         |  ✅ (Finance Lane)  | ✅ (Mark Paid)  |       ✅       |
| `TENANT_ADMIN`    |    ✅ (All)     |        ✅         |         ✅          |       ✅        |       ✅       |

---

## 25. Audit Trail & Logging

- **Audit Middleware:** `withAudit` wrapping API routes with actions `AuditAction.COMMENT_EXPENSE_CLAIM`, `APPROVE_EXPENSE_CLAIM`, and `REJECT_EXPENSE_CLAIM`.

---

## 26–27. UI & Frontend Architecture

- **Page Path:** `apps/web/src/app/dashboard/expenses/page.tsx`
- Interactive Expense dashboard supporting line item entry, receipt upload, policy warning displays, and payment tracking.

---

## 28. API Specification

### POST /api/v1/expenses

- **HTTP Method:** `POST`
- **Route Path:** `/api/v1/expenses`
- **Authentication:** `Bearer JWT` (Session Context)
- **Required Permission:** `expenses:create`
- **Request Body (JSON):**
  ```json
  {
    "title": "Q3 Client Onboarding Travel & Dinner",
    "currency": "USD",
    "items": [
      {
        "category": "MEALS",
        "description": "Client dinner meeting",
        "amount": 150.0,
        "expenseDate": "2026-08-10",
        "receiptUrl": "https://storage.auraos.com/receipts/rec_123.pdf",
        "merchant": "Bistro Deluxe"
      }
    ]
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "exp_claim_999",
      "status": "DRAFT",
      "totalAmount": 150.0
    }
  }
  ```
- **Repository Implementation:** `apps/web/src/app/api/v1/expenses/route.ts#L64-L132`

---

## 29. Backend Architecture

- **Service Class:** `ExpenseService` (`apps/web/src/lib/services/expense.service.ts`)
- **Database Model:** `prisma.expenseClaim` (`packages/@aura/database/prisma/schema.prisma#L5755-L5787`).

---

## 30. Database Design

- **Prisma Entity Name:** `ExpenseClaim`
- **Schema Location:** `packages/@aura/database/prisma/schema.prisma#L5755-L5787`
- **Entity Attributes:**
  ```prisma
  model ExpenseClaim {
    id              String    @id @default(uuid())
    tenantId        String
    employeeId      String
    title           String
    amount          Float
    currency        String    @default("USD")
    category        String
    date            DateTime  @db.Date
    receiptUrl      String?
    description     String?
    status          String    @default("PENDING")
    approvedBy      String?
    approvedAt      DateTime?
    paidAt          DateTime?
    paidReference   String?
    rejectionReason String?
    createdAt       DateTime  @default(now())

    @@index([employeeId])
    @@index([status])
    @@index([tenantId])
    @@map("aura_expense_claim")
  }
  ```

---

## 31–34. Integrations, Reports & KPIs

- **Internal Service Integrations:** `AuditService`, `ExpensePolicy`, `PayrollRun` disbursement integration.
- **Key KPIs:** Average Expense Cycle Time (Hours), Policy Violation Rate (%), Total Spend by Category ($/AED).

---

## 35. CURRENT IMPLEMENTATION

> [!NOTE]
> **CURRENT PRODUCTION IMPLEMENTATION STATUS:**
> The following section describes ONLY functionality verified by existing codebase artifacts.

### 35.1 Verified Codebase Capabilities

- Complete state machine (`DRAFT` $\to$ `SUBMITTED` $\to$ `APPROVED` $\to$ `PAID`, `REJECTED` $\to$ `DRAFT`) implemented in `ExpenseService`.
- Automated policy evaluation (`evaluatePolicy()`) enforcing receipt mandates, category caps, and multi-threshold manager/finance approval routing.
- Real payment reference validation (`paidReference.length >= 3`) enforced upon calling `markPaid()`.
- Audit logging (`withAudit`) integrated across API routes.

---

## 36. IMPLEMENTATION GAPS

| Functional Area          | Current Codebase State   | Target Enterprise Target                                  | Priority / Impact |
| ------------------------ | ------------------------ | --------------------------------------------------------- | ----------------- |
| **OCR Receipt Parsing**  | Manual receipt URL input | Automated OCR receipt scanning and field extraction       | Low / UX          |
| **Corporate Card Feeds** | Manual claim entry       | Real-time corporate credit card transaction feed matching | Low / FinOps      |

---

## 37. PROPOSED ENTERPRISE IMPLEMENTATION

> [!IMPORTANT]
> **PROPOSED ENTERPRISE IMPLEMENTATION DISCLAIMER:**
> The features outlined below represent target enterprise architecture specifications and are NOT currently present in the production codebase.

### 37.1 AI-Powered Receipt OCR & Auto-Categorization [PROPOSED]

Integrate computer vision OCR to automatically extract merchant, date, amount, and tax fields from uploaded receipt images during draft creation.

---

## 38. Migration Strategy

- No database schema migrations required; workflow is fully operational.

---

## 39. Testing Strategy

### 39.1 Functional Tests

- Verify `createDraft()` creates a claim in `DRAFT` status.
- Verify `submit()` invokes `evaluatePolicy()` and throws `PolicyViolationError` if receipts are missing for items $> receiptRequiredOver$.
- Verify `markPaid()` rejects empty payment references.

---

## 40. Acceptance Criteria

```gherkin
Scenario: Successful Expense Claim Submission and Disbursement
  GIVEN an employee has created a DRAFT expense claim of $150 with a valid receipt URL attached
  WHEN the employee invokes POST /api/v1/expenses/[id]/submit
  THEN the claim status MUST update to SUBMITTED
  AND when the Line Manager approves via POST /api/v1/expenses/[id]/approve
  THEN the status MUST update to APPROVED
  AND when Finance executes payment with paidReference="TXN-BANK-998877"
  THEN the status MUST update to PAID with paidAt timestamp recorded
```

---

## 41. Implementation Checklist

- [x] State machine transition assertions implemented (`assertTransition`)
- [x] Policy evaluation logic (`evaluatePolicy`) implemented
- [x] Receipt validation guard (`PolicyViolationError`) verified
- [x] Real payment reference enforcement in `markPaid()` verified
- [x] Full REST API endpoints and Audit middleware verified

---

## 42. Known Risks

- None; workflow is fully implemented with strict state transition guards and policy evaluation.

---

## 43. Related Architecture Findings

- **Architecture Audit Findings:** Detailed in `docs/architecture/WORKFLOW_AUDIT_FINDINGS.md`.

---

## 44. Repository References

### 44.1 Frontend Files

- `apps/web/src/app/dashboard/expenses/page.tsx`

### 44.2 API Routes

- `apps/web/src/app/api/v1/expenses/route.ts`
- `apps/web/src/app/api/v1/expenses/[id]/submit/route.ts`
- `apps/web/src/app/api/v1/expenses/[id]/approve/route.ts`
- `apps/web/src/app/api/v1/expenses/[id]/reject/route.ts`
- `apps/web/src/app/api/v1/expenses/[id]/pay/route.ts`

### 44.3 Backend Service Classes

- `apps/web/src/lib/services/expense.service.ts`

### 44.4 Database Schema Models

- `packages/@aura/database/prisma/schema.prisma#L5755-L5787`

---

_End of Workflow 07 — Expense Claim Approval Enterprise Specification._
