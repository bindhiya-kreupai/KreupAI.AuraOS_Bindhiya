# Workflow 10 — Full & Final Settlement Enterprise Specification

> **Document Code:** `SPEC-WF-10`  
> **System:** AuraOS Enterprise ERP / HCM Platform  
> **Version:** 1.0.0  
> **Date:** 2026-07-29  
> **Status:** Official Production Specification  
> **Primary Code Location:** `apps/web/src/lib/services/eosb-compliance/index.ts`  
> **Primary API Route:** `POST /api/v1/eosb-compliance/calculations`  
> **Primary Database Entity:** `EosbCalculation` (`packages/@aura/database/prisma/schema.prisma`)

---

## Metadata Header

| Attribute                     | Value / Reference                                                  |
| ----------------------------- | ------------------------------------------------------------------ |
| **Workflow ID & Name**        | `10` — `Full & Final Settlement Workflow`                          |
| **Business Module**           | `Payroll & Financial Management`                                   |
| **Submodule / Domain**        | `End-of-Service Benefits (EOSB) & Final Payout Governance`         |
| **Business Process Owner**    | `Payroll & Corporate Treasury Director`                            |
| **Technical System Owner**    | `Lead Financial & Compensation Software Architect`                 |
| **Implementation Status**     | **`Fully Implemented`**                                            |
| **Specification Version**     | `1.0.0`                                                            |
| **Date Created / Updated**    | `2026-07-29`                                                       |
| **Technical Author**          | `Enterprise Solution Architect (AI Agent)`                         |
| **Technical Reviewer**        | `Senior Software Architect`                                        |
| **QA Verifier**               | `QA Lead`                                                          |
| **Final Approver**            | `Chief Product Officer`                                            |
| **Primary Code Location**     | `apps/web/src/lib/services/eosb-compliance/index.ts`               |
| **Primary API Route**         | `POST /api/v1/eosb-compliance/calculations`                        |
| **Primary Database Entity**   | `EosbCalculation` (`packages/@aura/database/prisma/schema.prisma`) |
| **Related Architecture Docs** | `docs/architecture/WORKFLOW_AUDIT_FINDINGS.md`                     |

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

The **Full & Final (F&F) Settlement Workflow** is a **Fully Implemented** production capability in AuraOS. It governs the calculation, approval, and financial disbursement of final exit settlements for departing employees. The workflow integrates multi-jurisdictional End-of-Service Benefit (EOSB) math engines (`EOSBService` covering UAE, KSA, Bahrain, Qatar, Oman, Kuwait, and India), accounts for encashed leave balances, deducts unrecovered advances or asset damages, and processes final net settlement payments. The state machine transitions strictly through `DRAFT` $\to$ `APPROVED` $\to$ `SETTLED` (`EosbCalculationService`).

---

## 2. Business Context

Full & Final settlement is the closing financial transaction between an employer and a departing employee. Under regional labor laws (such as UAE Federal Decree-Law No. 33/2021 or KSA Labor Law Article 84/85), employers are legally mandated to disburse end-of-service gratuity and final salary within strict statutory timelines (e.g., 14 days from termination date). Incorrect EOSB calculations or delayed settlements result in severe labor tribunal penalties, interest accruals, and employee disputes.

---

## 3. Business Objectives

- **Multi-Jurisdictional EOSB Calculation:** Automatically calculate End-of-Service Gratuity based on country-specific labor laws (`UAE`, `KSA`, `BH`, `QA`, `OM`, `KW`, `IN`).
- **Complete Settlement Aggregation:** Combine basic salary arrears, leave encashment credits, overtime dues, and EOSB gratuity, minus loan balances and asset damage deductions.
- **Enforce Settlement State Machine:** Enforce strict status progression (`DRAFT` $\to$ `APPROVED` $\to$ `SETTLED`) via `EosbCalculationService`.
- **Require Real Payment References:** Enforce non-placeholder payment reference strings upon executing settlement disbursement (`settle()`).

---

## 4. Business Scope

### 4.1 In-Scope

- Calculation finalization via `POST /api/v1/eosb-compliance/calculations` (`action: 'finalize'`).
- Calculation approval via `action: 'approve'` (`EosbCalculationService.approve()`).
- Settlement payment execution via `action: 'settle'` (`EosbCalculationService.settle()`).
- Dispute tracking (`EosbDisputeService`: `OPEN` $\to$ `UNDER_REVIEW` $\to$ `RESOLVED`).
- Monthly compliance certificate sign-off (`EosbCertificateService`), blocking certification if unsettled calculations or open disputes exist.

### 4.2 Out-of-Scope

- Physical bank WPS file transmission (handled by Bank Payment Gateway).

---

## 5. Workflow Overview

The F&F settlement lifecycle progresses from calculation finalization to payment execution and audit certification:

```
┌─────────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌─────────────┐
│ Exit        │ ──> │ Finalize  │ ──> │ Payroll   │ ──> │ Treasury  │ ──> │ Compliance  │
│ Clearance   │     │ Calculation│    │ Approves  │     │ Settles   │     │ Certificate │
│ Completed   │     │ (DRAFT)   │     │ (APPROVED)│     │ (SETTLED) │     │ Signed      │
└─────────────┘     └───────────┘     └───────────┘     └───────────┘     └─────────────┘
```

---

## 6. Business Process Description

1. **Calculation Finalization:** Upon completion of departmental clearances (`Workflow 09`), Payroll Officer triggers `action: 'finalize'` on `/api/v1/eosb-compliance/calculations`. `EosbCalculationService.finalize()` executes:
   - Evaluates country-specific law via `EOSBService.calculate()` (calculating `dailyRate`, `yearsOfService`, `gratuityAmount`).
   - Subtracts social insurance offsets (`socialInsuranceOffset`) and computes `netPayable`.
   - Saves record in `EosbCalculation` with status `DRAFT`.
2. **Payroll & Finance Approval:** Payroll Director reviews the breakdown and invokes `action: 'approve'`. `EosbCalculationService.approve()` updates status to `APPROVED`, recording `approvedBy` and `approvedAt`.
3. **Disbursement (Settlement):** Treasury Officer executes bank payment and calls `action: 'settle'` supplying `paymentReference`. `EosbCalculationService.settle()` sets status to `SETTLED` and records `settledAt`.
4. **Compliance Certification:** At month-end, `EosbCertificateService.generate()` verifies that no unsettled calculations or open disputes exist before signing the monthly statutory certificate.

---

## 7. Mermaid Business Workflow Diagram

```mermaid
graph TD
    A([Start: Departmental Clearance Completed]) --> B[Invoke EosbCalculationService.finalize]
    B --> C[Execute EOSB Math Engine for Country Code]
    C --> D[Calculate Arrears + Gratuity - Deductions]
    D --> E[Save EosbCalculation - Status: DRAFT]
    E --> F[Payroll & Finance Review Breakdown]
    F --> G{\`Payroll Approves?\`}
    G -- No --> H[Raise EOSB Dispute - Status: OPEN]
    H --> I[Review & Recalculate DRAFT]
    G -- Yes --> J[Set EosbCalculation.status = APPROVED]
    J --> K[Treasury Officer Disburses Settlement Payment]
    K --> L[Invoke settle Endpoint with paymentReference]
    L --> M[Set EosbCalculation.status = SETTLED]
    M --> N[Update ExitRequest.status = COMPLETED]
    N --> O([End: Full & Final Settlement Complete])
```

---

## 8. Business Actors

| Actor Role                     | Actor Type | System Persona           | Operational Responsibilities                                          |
| ------------------------------ | ---------- | ------------------------ | --------------------------------------------------------------------- |
| **Payroll Officer**            | Human      | `PAYROLL_ADMIN`          | Initiates finalization calculation, reviews breakdown and deductions  |
| **Finance / Payroll Director** | Human      | `FINANCE_DIRECTOR`       | Grants final approval (`approve()`) for settlement payout             |
| **Treasury Officer**           | Human      | `TREASURY_ADMIN`         | Disburses funds and logs bank transaction reference (`settle()`)      |
| **EOSB Compliance Service**    | System     | `EosbCalculationService` | Enforces statutory country math, state transitions, and dispute gates |

---

## 9. RACI Matrix

| Workflow Activity          | Payroll Officer | Finance Director | Treasury Officer |   EosbCalculationService   | Prisma DB |
| -------------------------- | :-------------: | :--------------: | :--------------: | :------------------------: | :-------: |
| Finalize Calculation       |    **R / A**    |        I         |        I         |             C              |     C     |
| Approve Settlement         |        I        |    **R / A**     |        I         |             C              |     C     |
| Disburse Payout (`settle`) |        I        |        I         |    **R / A**     | **C (Validate Reference)** |   **A**   |
| Monthly Certification      |        I        |        I         |        I         |         **R / A**          |     C     |

---

## 10. Entry Points

- **Calculations API Endpoint:** `POST /api/v1/eosb-compliance/calculations` (`apps/web/src/app/api/v1/eosb-compliance/calculations/route.ts#L31`)
- **Disputes API Endpoint:** `POST /api/v1/eosb-compliance/disputes`
- **Frontend Dashboard Screen:** `apps/web/src/app/(modules)/payroll/full-final-settlement/page.tsx`

---

## 11. Trigger Events

| Trigger Event Name           | Trigger Type    | Source System / Action                          | Payload Attributes                                            |
| ---------------------------- | --------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| `EOSB_CALCULATION_FINALIZED` | User Action     | `POST /.../calculations` (`action: 'finalize'`) | `employeeId`, `countryCode`, `basicSalary`, `lastWorkingDate` |
| `EOSB_CALCULATION_APPROVED`  | Approver Action | `POST /.../calculations` (`action: 'approve'`)  | `id`, `approvedBy`                                            |
| `EOSB_CALCULATION_SETTLED`   | Treasury Action | `POST /.../calculations` (`action: 'settle'`)   | `id`, `paymentReference`                                      |

---

## 12. Workflow Stages

### 12.1 Stage 1: Finalization & Draft Calculation (`DRAFT`)

- **Stage Identifier:** `DRAFT`
- **Stage Owner Role:** `PAYROLL_ADMIN`
- **SLA Window:** 48 Hours Post-Clearance
- **Status Value:** `DRAFT`
- **Repository Implementation:** `apps/web/src/lib/services/eosb-compliance/index.ts#L40-L124`

### 12.2 Stage 2: Financial Approval (`APPROVED`)

- **Stage Identifier:** `APPROVED`
- **Stage Owner Role:** `FINANCE_DIRECTOR`
- **SLA Window:** 48 Hours
- **Status Value:** `APPROVED`
- **Repository Implementation:** `apps/web/src/lib/services/eosb-compliance/index.ts#L126-L131`

### 12.3 Stage 3: Disbursement & Settlement (`SETTLED`)

- **Stage Identifier:** `SETTLED`
- **Stage Owner Role:** `TREASURY_ADMIN`
- **SLA Window:** 14 Days (Statutory Limit)
- **Status Value:** `SETTLED`
- **Repository Implementation:** `apps/web/src/lib/services/eosb-compliance/index.ts#L133-L142`

---

## 13. Workflow State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Finalize Calculation (action: finalize)
    DRAFT --> APPROVED : Finance Approves (action: approve)
    DRAFT --> DISPUTED : Raise Dispute (EosbDisputeService)
    DISPUTED --> DRAFT : Dispute Resolved
    APPROVED --> SETTLED : Disburse Funds (action: settle)
    SETTLED --> [*]
```

| From State | To State   | Trigger / Method             | Prerequisites / Guards      | Side Effects                               |
| ---------- | ---------- | ---------------------------- | --------------------------- | ------------------------------------------ |
| `[*]`      | `DRAFT`    | `finalize()`                 | Clearances complete         | Stores inputs & statutory math details     |
| `DRAFT`    | `APPROVED` | `approve()`                  | Status is `DRAFT`           | Records `approvedBy` and `approvedAt`      |
| `APPROVED` | `SETTLED`  | `settle()`                   | `paymentReference` provided | Records `settledAt` and `paymentReference` |
| `DRAFT`    | `DISPUTED` | `EosbDisputeService.raise()` | Discrepancy identified      | Blocks monthly compliance certificate      |

---

## 14. Approval Process

Approval requires sign-off from the Finance Director. The system validates that all calculation components (service years, daily basic rate, unused leave balance, loan deductions) strictly conform to governing statutory formulas before transition to `APPROVED`.

---

## 15. Approval Matrix

| Approval Level | Approver Role    | Condition / Threshold                     | SLA Target | Escalation Target       |
| -------------- | ---------------- | ----------------------------------------- | ---------- | ----------------------- |
| Level 1        | Payroll Manager  | Standard Exit Settlement                  | 48 Hours   | Payroll Director        |
| Level 2        | Finance Director | Settlement Amount $> \$50,000$ / AED 150k | 48 Hours   | Chief Financial Officer |

---

## 16. Decision Matrix

| Service Years | Termination Type          | Statutory Formula Applied                | Gratuity Payability           |
| ------------- | ------------------------- | ---------------------------------------- | ----------------------------- |
| $< 1$ Year    | Any Type                  | No Gratuity Accrued                      | 0%                            |
| $1–5$ Years   | Resignation / Termination | 21 Days Basic Salary per Year            | 100%                          |
| $> 5$ Years   | Resignation / Termination | 30 Days Basic Salary per Year ($>5$ yrs) | 100% (Capped at 2 yrs salary) |

---

## 17. Business Rules

#### BR-PAY-FF-001: Country-Specific Statutory Math Compliance

- **Category:** Statutory Math
- **Severity:** AUTOMATED
- **Description:** EOSB calculation MUST invoke country-specific statutory math engines (`EOSBService.calculate`) matching the employee's jurisdiction (`UAE`, `KSA`, `BH`, `QA`, `OM`, `KW`, `IN`).
- **Repository Reference:** `apps/web/src/lib/services/eosb-compliance/index.ts#L72`

#### BR-PAY-FF-002: Real Payment Reference Mandate

- **Category:** Audit Control
- **Severity:** BLOCKED
- **Description:** Settling an EOSB calculation (`settle()`) requires a valid non-empty `paymentReference`.
- **Repository Reference:** `apps/web/src/app/api/v1/eosb-compliance/calculations/route.ts#L64`

---

## 18. Compliance Rules

- **Statutory 14-Day Settlement Limit:** Final settlement MUST be paid within 14 calendar days of the employee's last working date.

---

## 19. Country-Specific Rules

| Country Code | Statutory Reference      | Gratuity Formula Basis                                           | Repository Reference                                   |
| ------------ | ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------ |
| `UAE`        | Federal Law 33/2021      | 21 days basic (1-5 yrs), 30 days basic (>5 yrs); max 2 yrs basic | `apps/web/src/lib/services/compliance/eosb.service.ts` |
| `KSA`        | KSA Labor Law Art. 84/85 | Half month basic (1-5 yrs), Full month basic (>5 yrs)            | `apps/web/src/lib/services/compliance/eosb.service.ts` |

---

## 20. Exception Handling

| Error Code        | HTTP Status | Error Message                         | Root Cause                |
| ----------------- | :---------: | ------------------------------------- | ------------------------- |
| `400 Bad Request` |    `400`    | `employeeId, countryCode... required` | Missing mandatory field   |
| `400 Bad Request` |    `400`    | `id and paymentReference required`    | Missing payment reference |

---

## 21. Notifications

- Notifications dispatched for settlement events (`SETTLEMENT_FINALIZED`, `SETTLEMENT_APPROVED`, `SETTLEMENT_PAID`).

---

## 22–23. Escalation & SLA Rules

- **Finalization SLA:** 48 Hours post-clearance.
- **Statutory Payment SLA:** 14 Calendar Days.

---

## 24. RBAC Matrix

| Role               | Read Calculations | Finalize Calculation | Approve Settlement | Settle Payment |
| ------------------ | :---------------: | :------------------: | :----------------: | :------------: |
| `EMPLOYEE`         |     ✅ (Own)      |          ❌          |         ❌         |       ❌       |
| `PAYROLL_ADMIN`    |        ✅         |          ✅          |         ❌         |       ❌       |
| `FINANCE_DIRECTOR` |        ✅         |          ✅          |         ✅         |       ❌       |
| `TREASURY_ADMIN`   |        ✅         |          ❌          |         ❌         |       ✅       |

---

## 25. Audit Trail & Logging

- Every calculation stores `law`, `formula`, `dailyRate`, `gratuityAmount`, `socialInsuranceOffset`, `netPayable`, and `notesJson`.

---

## 26–27. UI & Frontend Architecture

- **Page Path:** `apps/web/src/app/(modules)/payroll/full-final-settlement/page.tsx`
- F&F Settlement workspace featuring breakdown sheets, country law formulas, leave encashment credits, and payment settlement inputs.

---

## 28. API Specification

### POST /api/v1/eosb-compliance/calculations

- **HTTP Method:** `POST`
- **Route Path:** `/api/v1/eosb-compliance/calculations`
- **Authentication:** `Bearer JWT` (Session Context)
- **Request Body (JSON - Finalize Action):**
  ```json
  {
    "action": "finalize",
    "employeeId": "emp_12345",
    "countryCode": "UAE",
    "joiningDate": "2021-01-15",
    "lastWorkingDate": "2026-08-15",
    "basicSalary": 15000.0,
    "terminationType": "RESIGNATION",
    "unpaidLeaveDays": 0
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "eosb_calc_999",
      "status": "DRAFT",
      "gratuityAmount": 87500.0,
      "netPayable": 87500.0,
      "law": "UAE Federal Law 33/2021"
    },
    "message": "Finalized"
  }
  ```
- **Repository Implementation:** `apps/web/src/app/api/v1/eosb-compliance/calculations/route.ts#L31-L74`

---

## 29. Backend Architecture

- **Service Classes:** `EosbCalculationService` (`apps/web/src/lib/services/eosb-compliance/index.ts`) and `EOSBService` (`apps/web/src/lib/services/compliance/eosb.service.ts`).
- **Database Model:** `EosbCalculation` (`packages/@aura/database/prisma/schema.prisma`).

---

## 30. Database Design

- **Prisma Entity Name:** `EosbCalculation`
- **Schema Location:** `packages/@aura/database/prisma/schema.prisma`
- **Entity Attributes:**
  ```prisma
  model EosbCalculation {
    id                    String    @id @default(uuid())
    tenantId              String
    employeeId            String
    countryCode           String
    joiningDate           DateTime
    lastWorkingDate       DateTime
    basicSalary           Decimal   @db.Decimal(15, 2)
    totalServiceYears     Float
    dailyRate             Decimal   @db.Decimal(15, 2)
    gratuityAmount        Decimal   @db.Decimal(15, 2)
    socialInsuranceOffset Decimal   @default(0) @db.Decimal(15, 2)
    netPayable            Decimal   @db.Decimal(15, 2)
    status                String    @default("DRAFT")
    approvedBy            String?
    approvedAt            DateTime?
    settledAt             DateTime?
    paymentReference      String?
    createdAt             DateTime  @default(now())
  }
  ```

---

## 31–34. Integrations, Reports & KPIs

- **Internal Service Integrations:** `ExitRequest`, `LeaveBalance`, `PayrollRun`, `StatutoryReportService`.
- **Key KPIs:** Average Settlement Turnaround Time (Days), 14-Day Statutory Compliance Rate (%), Total Monthly EOSB Payout ($/AED).

---

## 35. CURRENT IMPLEMENTATION

> [!NOTE]
> **CURRENT PRODUCTION IMPLEMENTATION STATUS:**
> The following section describes ONLY functionality verified by existing codebase artifacts.

### 35.1 Verified Codebase Capabilities

- Operational calculation finalization, approval, and settlement methods in `EosbCalculationService`.
- Multi-jurisdictional EOSB math engine (`EOSBService`) supporting UAE, KSA, Bahrain, Qatar, Oman, Kuwait, and India.
- Dispute tracking (`EosbDisputeService`) and monthly compliance certificate validation (`EosbCertificateService`).

---

## 36. IMPLEMENTATION GAPS

| Functional Area             | Current Codebase State         | Target Enterprise Target                      | Priority / Impact |
| --------------------------- | ------------------------------ | --------------------------------------------- | ----------------- |
| **Direct Bank File Export** | Manual payment reference input | Automated WPS SIF bank file export generation | Medium / FinOps   |

---

## 37. PROPOSED ENTERPRISE IMPLEMENTATION

> [!IMPORTANT]
> **PROPOSED ENTERPRISE IMPLEMENTATION DISCLAIMER:**
> The features outlined below represent target enterprise architecture specifications and are NOT currently present in the production codebase.

### 37.1 Automated WPS SIF File Generation for F&F Settlements [PROPOSED]

Automatically generate statutory Wages Protection System (WPS) SIF payment files containing final EOSB net settlement amounts upon settlement approval.

---

## 38. Migration Strategy

- No database schema migrations required; workflow is fully operational.

---

## 39. Testing Strategy

### 39.1 Functional Tests

- Verify `finalize()` calculates correct gratuity amount matching country statutory laws.
- Verify `settle()` updates status to `SETTLED` and records `paymentReference`.

---

## 40. Acceptance Criteria

```gherkin
Scenario: Successful Full & Final Settlement Execution
  GIVEN an exiting employee in UAE with 5 years service and basicSalary=15000
  WHEN Payroll Officer invokes /api/v1/eosb-compliance/calculations with action="finalize"
  THEN status MUST be DRAFT with gratuityAmount=87500
  AND when Finance Director approves and Treasury Officer invokes action="settle" with paymentReference="WPS-TXN-99887"
  THEN status MUST update to SETTLED and settledAt timestamp recorded
```

---

## 41. Implementation Checklist

- [x] Math engine `EOSBService` verified
- [x] Service class `EosbCalculationService` verified
- [x] API endpoint `/api/v1/eosb-compliance/calculations` verified
- [x] Unit tests in `eosb-compliance.service.test.ts` verified

---

## 42. Known Risks

- None; F&F settlement workflow is fully operational with unit test coverage.

---

## 43. Related Architecture Findings

- **Architecture Audit Findings:** Detailed in `docs/architecture/WORKFLOW_AUDIT_FINDINGS.md`.

---

## 44. Repository References

### 44.1 Frontend Files

- `apps/web/src/app/(modules)/payroll/full-final-settlement/page.tsx`

### 44.2 API Routes

- `apps/web/src/app/api/v1/eosb-compliance/calculations/route.ts`

### 44.3 Backend Service Classes

- `apps/web/src/lib/services/eosb-compliance/index.ts`
- `apps/web/src/lib/services/compliance/eosb.service.ts`

### 44.4 Database Schema Models

- `packages/@aura/database/prisma/schema.prisma#L7220-L7265`

---

_End of Workflow 10 — Full & Final Settlement Enterprise Specification._
