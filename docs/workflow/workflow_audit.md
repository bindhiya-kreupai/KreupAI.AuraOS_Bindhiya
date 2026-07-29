# AuraOS — Enterprise Workflow Discovery & Inventory Audit

> **Audit Type:** Read-Only Discovery | **Date:** 2026-07-29 | **Constraint:** Evidence-only. No inference. No code modification.

---

## SECTION 1 — MASTER WORKFLOW INVENTORY (29 Total)

| #   | Workflow Name                             | Module                | Status                |
| --- | ----------------------------------------- | --------------------- | --------------------- |
| 1   | Leave Request Approval                    | Leave Management      | Partially Implemented |
| 2   | Leave Encashment Approval                 | Leave Management      | Partially Implemented |
| 3   | Overtime Request Approval                 | Time & Attendance     | Partially Implemented |
| 4   | Attendance Regularization Approval        | Time & Attendance     | Partially Implemented |
| 5   | Comp-Off Workflow                         | Time & Attendance     | Partially Implemented |
| 6   | Shift Swap Approval                       | Shift Management      | **Fully Implemented** |
| 7   | Expense Claim Approval                    | Expense Management    | **Fully Implemented** |
| 8   | Employee Exit / Offboarding               | HR Operations         | **Fully Implemented** |
| 9   | Exit Clearance Process                    | HR Operations         | **Fully Implemented** |
| 10  | Full & Final Settlement                   | Payroll / Finance     | **Fully Implemented** |
| 11  | Payroll Run Processing                    | Payroll               | Partially Implemented |
| 12  | Payroll Run Approval                      | Payroll               | Partially Implemented |
| 13  | Payroll Adjustment Approval               | Payroll               | Partially Implemented |
| 14  | Tax Declaration Submission & Verification | Payroll               | Partially Implemented |
| 15  | GL Journal Posting & Reversal             | Finance               | Partially Implemented |
| 16  | Employee Onboarding Case                  | HR Operations         | **Fully Implemented** |
| 17  | Employee Master Data Activation           | HR Operations         | Partially Implemented |
| 18  | Payroll Onboarding Approval               | HR Operations         | Partially Implemented |
| 19  | Probation Period Management               | HR Operations         | Partially Implemented |
| 20  | Employee Confirmation                     | HR Operations         | Partially Implemented |
| 21  | Recruitment / Talent Acquisition Pipeline | Recruitment           | Partially Implemented |
| 22  | Job Requisition Maker-Checker             | Workforce Planning    | **Fully Implemented** |
| 23  | Position Control Approval                 | Org Compliance        | Partially Implemented |
| 24  | Profile Change Request Approval           | Employee Self-Service | **Fully Implemented** |
| 25  | Generic Workflow Engine (BPMN-Style)      | Platform              | Partially Implemented |
| 26  | FMLA Leave Workflow                       | Leave Management      | Partially Implemented |
| 27  | Data Subject Access Request (DSAR)        | Data Privacy          | Partially Implemented |
| 28  | Payroll Finalization Workflow             | Payroll               | Partially Implemented |
| 29  | Vendor Invoice Approval                   | Recruitment           | Partially Implemented |

**Summary: 8 Fully Implemented, 21 Partially Implemented, 0 Not Started**

---

## SECTION 2 — APPROVAL WORKFLOWS (20 Endpoints Confirmed)

| #   | Workflow                  | Approve Endpoint                                     | Reject Endpoint         | Evidence File                          |
| --- | ------------------------- | ---------------------------------------------------- | ----------------------- | -------------------------------------- |
| 1   | Leave Request             | POST /api/v1/leave-requests/[id]/approve             | [id]/reject             | leave.service.ts                       |
| 2   | Leave Request (Alt)       | POST /api/v1/leave/requests/[id]/approve             | —                       | leave/requests/[id]/approve/route.ts   |
| 3   | Overtime Approval         | POST /api/v1/overtime/[id]/approve                   | —                       | overtime.service.ts                    |
| 4   | Attendance Regularization | POST /api/v1/regularizations/[id]/approve            | —                       | overtime.service.ts                    |
| 5   | Shift Swap — Peer         | POST /api/v1/shift-swaps/[id]/peer-approve           | —                       | shift-swaps/[id]/peer-approve/route.ts |
| 6   | Shift Swap — Manager      | POST /api/v1/shift-swaps/[id]/manager-approve        | [id]/reject             | shift-management.service.ts            |
| 7   | Shifts (Alt Route)        | POST /api/v1/shifts/swaps/[id]/approve               | —                       | shifts/swaps/[id]/approve/route.ts     |
| 8   | Expense Claim             | ExpenseService.approve()                             | ExpenseService.reject() | expense.service.ts                     |
| 9   | Employee Exit             | POST /api/v1/exits/[id]/approve                      | —                       | exit.service.ts                        |
| 10  | Payroll Run               | POST /api/v1/payroll-runs/[id]/approve               | —                       | payroll.service.ts                     |
| 11  | Payroll Run (Alt)         | POST /api/v1/payroll/approve/[runId]                 | —                       | payroll/approve/[runId]/route.ts       |
| 12  | Full & Final Settlement   | POST /api/v1/payroll/full-final/[id]/approve         | —                       | full-final.service.ts                  |
| 13  | Payroll Onboarding        | POST /api/v1/onboarding/payroll/[id]/approve         | —                       | onboarding/payroll/[id]/approve/       |
| 14  | Profile Change            | POST /api/v1/profile-changes/[id]/approve            | [id]/reject             | profile-change.service.ts              |
| 15  | Confirmation — Manager    | POST /api/v1/confirmations/[id]/manager-approve      | [id]/reject             | confirmation.service.ts                |
| 16  | Confirmation — HR         | POST /api/v1/confirmations/[id]/hr-approve           | —                       | confirmations/[id]/hr-approve/         |
| 17  | Job Requisition           | POST /api/v1/workforce-planning/requisition-workflow | —                       | requisition-workflow/route.ts          |
| 18  | Position Control          | POST /api/v1/positions/[id]/approve                  | —                       | positions/[id]/approve/route.ts        |
| 19  | Offer Compliance          | POST /api/v1/offer-compliance/approvals              | —                       | offer-compliance/approvals/route.ts    |
| 20  | GL Journal Post           | POST /api/v1/payroll/gl/journals/[id]/post           | [id]/reverse            | payroll/gl/journals/[id]/post/         |

---

## SECTION 3 — MULTI-STAGE WORKFLOWS

### 3.1 Employee Onboarding Case

**Evidence:** `apps/web/src/lib/services/onboarding-case.service.ts`

Sequential Stages (enforced — must advance one stage at a time):

```
PRE_JOINING -> JOINING_DAY -> MASTER_DATA_ACTIVATION -> ENROLMENT -> PROBATION -> COMPLETED
```

| Stage                  | Owner Role      | SLA         | Escalation Role | Exit Criteria                                                 |
| ---------------------- | --------------- | ----------- | --------------- | ------------------------------------------------------------- |
| PRE_JOINING            | HR_ADMIN        | 72h         | HR_MANAGER      | Mandatory pre-joining tasks complete                          |
| JOINING_DAY            | HR_ADMIN        | 24h         | HR_MANAGER      | Joining-day record COMPLETED                                  |
| MASTER_DATA_ACTIVATION | HR_MANAGER      | 24h         | HR_DIRECTOR     | Employee master draft ACTIVATED                               |
| ENROLMENT              | PAYROLL_OFFICER | 72h         | HR_MANAGER      | Payroll READY + Benefits ISSUED + Social Insurance REGISTERED |
| PROBATION              | LINE_MANAGER    | 2160h (90d) | HR_MANAGER      | Probation plan created                                        |
| COMPLETED              | HR_MANAGER      | —           | —               | —                                                             |

Special Statuses: `OPEN`, `BLOCKED` (blockers present), `ESCALATED` (SLA breached)

---

### 3.2 Employee Exit Workflow

**Evidence:** `apps/web/src/lib/services/exit.service.ts`

```
PENDING -> APPROVED -> PROCESSING -> COMPLETED
         -> CANCELED   -> CANCELED   -> CANCELED
```

Guard: PROCESSING -> COMPLETED requires ALL ExitClearances to be `APPROVED`
Auto-trigger on COMPLETED: `fullFinalService.recordAndCalculate()` (UAE EOSB included)

---

### 3.3 Expense Claim Approval

**Evidence:** `apps/web/src/lib/services/expense.service.ts`

```
DRAFT -> SUBMITTED -> APPROVED -> PAID
       -> CANCELED   -> REJECTED -> DRAFT (re-draft allowed)
                    -> CANCELED
```

Policy fires on submit: `PolicyViolationError` blocks if receipt/cap failures. Approval lane (auto/manager/finance) determined by amount vs `ExpensePolicy` thresholds.

---

### 3.4 Profile Change Request

**Evidence:** `apps/web/src/lib/services/profile-change.service.ts`

```
DRAFT -> SUBMITTED -> APPROVED -> APPLIED
       -> CANCELED   -> REJECTED
                    -> CANCELED (from APPROVED too)
```

Categories: `bank`, `address`, `emergency_contact`, `dependent`, `personal`, `tax`

---

### 3.5 Full & Final Settlement

**Evidence:** `apps/web/src/lib/services/full-final.service.ts`

```
DRAFT -> CALCULATED -> APPROVED -> PROCESSED
       -> CANCELED   -> CANCELED
              CALCULATED -> DRAFT (recalculate allowed)
```

Country-specific EOSB supported: UAE (Federal Law 33/2021 — 21 days/year), KSA, BH, QA, OM, KW

---

### 3.6 Recruitment Pipeline

**Evidence:** `apps/web/src/app/api/v1/recruitment/applications/route.ts`

```
APPLIED -> [stage/] -> Interview -> Offer -> E-Sign -> [Offer accepted -> OnboardingCase created]
```

---

### 3.7 Employee Confirmation (Post-Probation)

**Evidence:** `apps/web/src/app/api/v1/confirmations/[id]/`

```
[Created] -> MANAGER APPROVE (/manager-approve)
           -> HR APPROVE (/hr-approve)
           -> CONFIRMED (/confirm)
           OR REJECTED (/reject)
```

---

### 3.8 Shift Swap (2-Level Approval)

**Evidence:** `shift-swaps/[id]/` + `shift-management.service.ts`

```
PENDING -> PEER APPROVE -> MANAGER APPROVE -> COMPLETED
                        -> REJECTED
         -> CANCELLED (any point)
```

Notification coverage: Full (5 events all wired)

---

### 3.9 Job Requisition Maker-Checker

**Evidence:** `apps/web/src/app/api/v1/workforce-planning/requisition-workflow/route.ts`

```
[Created] -> SUBMITTED (action=submit, justification required)
           -> APPROVED (action=approve) or REJECTED (action=reject, reason required)
```

Single endpoint dispatches all actions via Zod discriminated union schema.

---

### 3.10 Generic Workflow Engine (BPMN-Style)

**Evidence:** `services/workflow-service/`

```
INITIATED -> RUNNING -> paused (at approval/delay node) -> RUNNING (resolved) -> COMPLETED / FAILED / CANCELLED
```

Approval sub-loop: `pending -> approved / rejected / expired / cancelled`

---

## SECTION 4 — AUTOMATED WORKFLOWS

| #   | Trigger                                | Action                                              | Evidence                                                 |
| --- | -------------------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| 1   | BullMQ job dequeued                    | Workflow node execution loop runs                   | workflowExecutionWorker.ts                               |
| 2   | Parallel node encountered              | Sub-branches queued as separate BullMQ jobs         | workflowExecutionWorker.ts:200-214                       |
| 3   | ApprovalRequest dueDate reached        | Approval auto-expires (setTimeout)                  | approvalService.ts:86-99                                 |
| 4   | slaDueAt < now for onboarding          | escalateBreachedCases() moves to ESCALATED          | onboarding-case.service.ts                               |
| 5   | Leave request approved                 | Leave balance deducted automatically                | leave.service.ts:approveRequest()                        |
| 6   | Leave request cancelled                | Leave balance restored automatically                | leave.service.ts:cancelRequest()                         |
| 7   | Exit complete() called                 | F&F calculation triggered automatically             | exit.service.ts -> fullFinalService.recordAndCalculate() |
| 8   | Overtime approved + convertToCompOff() | CompOff record created, overtime marked compensated | overtime.service.ts                                      |
| 9   | Service method called                  | In-app WebSocket notification dispatched            | notification.service.ts                                  |

---

## SECTION 5 — WORKFLOW ENGINE ANALYSIS

### 5.1 Generic Workflow Engine

**Backend:** `services/workflow-service/` (standalone microservice)
**Frontend:** `apps/web/src/app/dashboard/workflow-engine/`

**Node Types:**

- `start`, `end`
- `action` — send_email, update_record, call_api
- `condition` — eq, neq, gt, gte, lt, lte, contains, in
- `approval` — single, unanimous, parallel, sequential
- `delay` — time-based pause
- `parallel` — spawn sub-branches (separate BullMQ jobs)

**Infrastructure:** Redis + BullMQ, concurrency=10
**DB Persistence:** `WorkflowDefinition`, `WorkflowInstance` (Prisma)

**Frontend Services (`workflow-engine/services.ts`):**

- `WorkflowService` — CRUD definitions
- `WorkflowExecutionService` — Start/pause/resume
- `ApprovalService` — Submit decisions, delegate
- `TaskService` — Inbox, complete, reassign
- `ApprovalChainService`, `FormBuilderService`, `IntegrationService`
- `WorkflowAnalyticsService`, `WorkflowSettingsService`

**Workflow Categories (from type system):**
`hr_onboarding`, `hr_offboarding`, `leave_request`, `expense_approval`, `purchase_requisition`, `document_approval`, `employee_transfer`, `performance_review`, `recruitment`, `training_approval`, `incident_management`, `change_request`, `custom`

**UI Pages Confirmed:** designer/, workflow-designer/, approval-chains/, form-builder/, integration-points/, escalation-rules/, conditional-logic/, email-notifications/, testing-mode/, audit-log/, workflow-analytics/, workflow-templates/, version-control/, hooks/

### 5.2 Engine-Domain Relationship

> [!IMPORTANT]
> Domain workflows (Leave, Expense, Exit, Payroll, Onboarding) are **NOT wired to the generic WorkflowEngine**. They use hand-coded state machines with direct Prisma calls. The generic engine is a separate configurable platform tool.

---

## SECTION 6 — WORKFLOW STATUS MATRIX

| Workflow         | Draft   | Pending/Submitted | Approved  | Rejected | Processing     | Completed  | Cancelled         |
| ---------------- | ------- | ----------------- | --------- | -------- | -------------- | ---------- | ----------------- |
| Leave Request    | —       | PENDING           | APPROVED  | REJECTED | —              | —          | CANCELLED         |
| Leave Encashment | —       | PENDING           | APPROVED  | —        | —              | —          | —                 |
| Overtime         | —       | PENDING           | APPROVED  | REJECTED | —              | COMPLETED  | —                 |
| Regularization   | —       | PENDING           | APPROVED  | REJECTED | —              | —          | —                 |
| Comp-Off         | —       | EARNED/APPLIED    | APPROVED  | —        | —              | AVAILED    | —                 |
| Shift Swap       | PENDING | —                 | —         | REJECTED | —              | COMPLETED  | CANCELLED         |
| Expense Claim    | DRAFT   | SUBMITTED         | APPROVED  | REJECTED | —              | PAID       | CANCELED          |
| Exit Request     | PENDING | —                 | APPROVED  | —        | PROCESSING     | COMPLETED  | CANCELED          |
| Exit Clearance   | —       | PENDING           | APPROVED  | —        | IN_PROGRESS    | COMPLETED  | —                 |
| Full & Final     | DRAFT   | CALCULATED        | APPROVED  | —        | —              | PROCESSED  | CANCELED          |
| Payroll Run      | DRAFT   | —                 | APPROVED  | —        | PROCESSING     | CALCULATED | —                 |
| Tax Declaration  | DRAFT   | SUBMITTED         | —         | —        | —              | VERIFIED   | —                 |
| Onboarding Case  | —       | OPEN/BLOCKED      | —         | —        | —              | COMPLETED  | ESCALATED         |
| Profile Change   | DRAFT   | SUBMITTED         | APPROVED  | REJECTED | —              | APPLIED    | CANCELED          |
| Confirmation     | —       | PENDING           | CONFIRMED | REJECTED | —              | —          | —                 |
| Probation        | —       | ACTIVE            | CONFIRMED | —        | EXTENDED       | —          | —                 |
| Recruitment App  | —       | applied           | —         | —        | —              | —          | —                 |
| Requisition      | —       | SUBMITTED         | APPROVED  | REJECTED | —              | —          | —                 |
| DSAR             | —       | PENDING           | —         | —        | IN_PROGRESS    | COMPLETED  | —                 |
| Generic Instance | —       | —                 | —         | —        | RUNNING/PAUSED | COMPLETED  | CANCELLED/FAILED  |
| Generic Approval | —       | pending           | approved  | rejected | —              | —          | cancelled/expired |

---

## SECTION 7 — WORKFLOW ACTOR MATRIX

| #   | Workflow           | Actors                                                                           |
| --- | ------------------ | -------------------------------------------------------------------------------- |
| 1   | Leave Request      | Employee (submit), Manager/HR (approve), System (balance deduction)              |
| 2   | Leave Encashment   | Employee (submit), HR/Payroll (approve)                                          |
| 3   | Overtime           | Employee (submit), Manager (approve), HR/Finance (verify)                        |
| 4   | Regularization     | Employee (submit), Manager (approve), System (attendance update)                 |
| 5   | Comp-Off           | Employee (earn/apply), Manager (approve)                                         |
| 6   | Shift Swap         | Employee/Requestor, Peer Employee, Manager (both must approve)                   |
| 7   | Expense Claim      | Employee (submit), Manager (if >threshold), Finance (if >higher threshold)       |
| 8   | Exit               | Employee (submit), HR Manager (approve), Dept Heads (clearances), Payroll (F&F)  |
| 9   | Exit Clearance     | Department Heads (per clearance), HR Manager (overall)                           |
| 10  | Full & Final       | HR Manager (approve), Payroll/Finance (process), System (EOSB calc)              |
| 11  | Payroll Run        | Payroll Officer (initiate), HR Manager (approve), System (calc)                  |
| 12  | Payroll Adjustment | HR/Payroll (submit), Manager (approve)                                           |
| 13  | Tax Declaration    | Employee (submit), HR/Payroll (verify)                                           |
| 14  | Onboarding         | HR Admin -> HR Manager -> Payroll Officer -> Line Manager; System (SLA/escalate) |
| 15  | Employee Master    | HR Manager (actor), System (transition guard)                                    |
| 16  | Payroll Onboarding | Payroll Officer (submit), HR Manager (approve)                                   |
| 17  | Confirmation       | Manager (L1 approve), HR (L2 approve), System                                    |
| 18  | Probation          | Line Manager (review/recommend), HR Manager (decide)                             |
| 19  | Recruitment        | Recruiter, Hiring Manager, HR, Candidate (e-sign)                                |
| 20  | Job Requisition    | Workforce Planner (maker), HR Director (checker)                                 |
| 21  | Profile Change     | Employee (draft/submit), HR Manager (approve/apply)                              |
| 22  | Position Control   | HR Admin (submit), HR Director/Management (approve)                              |
| 23  | DSAR               | Data Subject (request), DPO/HR (process), System                                 |
| 24  | Generic Engine     | Configured roles/users, System (worker)                                          |
| 25  | GL Journal         | Payroll Officer (initiate), Finance Manager (post/reverse)                       |

---

## SECTION 8 — WORKFLOW ENTRY POINTS (26 Confirmed)

| #   | Workflow              | Method  | Endpoint / Entry                                |
| --- | --------------------- | ------- | ----------------------------------------------- |
| 1   | Leave Request         | POST    | /api/v1/leave-requests                          |
| 2   | Leave Request (alt)   | POST    | /api/v1/leave/apply                             |
| 3   | Leave Encashment      | POST    | /api/v1/leave/encash                            |
| 4   | Overtime Request      | POST    | /api/v1/overtime                                |
| 5   | Comp-Off              | POST    | /api/v1/comp-offs                               |
| 6   | Regularization        | POST    | /api/v1/regularizations                         |
| 7   | Shift Swap            | POST    | /api/v1/shift-swaps                             |
| 8   | Expense Claim         | Service | ExpenseService.createDraft()                    |
| 9   | Exit Request          | POST    | /api/v1/exits                                   |
| 10  | Payroll Run v1        | POST    | /api/v1/payroll/run                             |
| 11  | Payroll Run v2        | POST    | /api/v1/payroll/runs                            |
| 12  | Onboarding (event)    | Event   | consumeOfferAccepted()                          |
| 13  | Onboarding (API)      | POST    | /api/v1/onboarding/cases                        |
| 14  | Profile Change        | POST    | /api/v1/profile-changes                         |
| 15  | Confirmation          | POST    | /api/v1/confirmations                           |
| 16  | Probation             | POST    | /api/v1/probation                               |
| 17  | Candidate Application | POST    | /api/v1/recruitment/applications                |
| 18  | Job Requisition       | POST    | /api/v1/recruitment/requisitions                |
| 19  | Requisition Workflow  | POST    | /api/v1/workforce-planning/requisition-workflow |
| 20  | Position Control      | POST    | /api/v1/positions                               |
| 21  | DSAR                  | POST    | /api/v1/privacy/dsar                            |
| 22  | Generic Workflow      | POST    | /api/v1/workflow-engine/instances               |
| 23  | Generic (BullMQ)      | Queue   | enqueueWorkflowExecution()                      |
| 24  | GL Journal            | POST    | /api/v1/payroll/gl/journals                     |
| 25  | FMLA Leave            | POST    | /api/v1/leave/fmla                              |
| 26  | Tax Declaration       | POST    | /api/v1/tax-declarations                        |

---

## SECTION 9 — WORKFLOW CODE PATHS

### 9.1 Leave Request Approval

```
CREATE:
  POST /api/v1/leave-requests -> LeaveService.createRequest()
  -> prisma.leaveRequest.create()   [status: PENDING by default]

APPROVE:
  POST /api/v1/leave-requests/[id]/approve -> LeaveService.approveRequest()
  -> prisma.leaveRequest.update({status:APPROVED, approvedBy, approvedAt})
  -> prisma.leaveBalance.update({taken:+days, currentBalance:-days})
  -> prisma.leaveRequest.update({balanceDeducted:true})

REJECT:
  POST /api/v1/leave-requests/[id]/reject -> LeaveService.rejectRequest()
  -> prisma.leaveRequest.update({status:REJECTED, rejectedBy, rejectionReason})

CANCEL:
  LeaveService.cancelRequest()
  -> Restores balance if balanceDeducted=true
  -> prisma.leaveRequest.update({status:CANCELLED})
```

DB Models: LeaveRequest, LeaveBalance, LeavePolicy
Notifications: notifyLeaveRequestSubmitted (manager), notifyLeaveRequestApproved/Rejected (employee)

---

### 9.2 Expense Claim Approval

```
CREATE: ExpenseService.createDraft()
  -> prisma.expenseClaim.create({status:DRAFT})

SUBMIT: ExpenseService.submit()
  -> evaluatePolicy() [receipt thresholds, category caps]
  -> PolicyViolationError if failures > 0 [blocked]
  -> prisma.expenseClaim.update({status:SUBMITTED, submittedAt})

APPROVE: ExpenseService.approve()
  -> assertTransition(SUBMITTED -> APPROVED)
  -> prisma.expenseClaim.update({status:APPROVED, approvedBy, approvedAt})

PAID: ExpenseService.markPaid()
  -> Requires real paidReference (enforced in code)
  -> prisma.expenseClaim.update({status:PAID, paidAt, paidReference})

REJECT: ExpenseService.reject()
  -> prisma.expenseClaim.update({status:REJECTED, rejectionReason})
```

DB Models: ExpenseClaim, ExpenseItem, ExpensePolicy

---

### 9.3 Employee Exit / Offboarding

```
CREATE: POST /api/v1/exits -> ExitService.create()
  -> prisma.exitRequest.create({status:PENDING, clearanceStatus:PENDING})

APPROVE: POST /api/v1/exits/[id]/approve -> ExitService.approve()
  -> assertTransition(PENDING -> APPROVED)

PROCESS: POST /api/v1/exits/[id]/process -> ExitService.startProcessing()
  -> assertTransition(APPROVED -> PROCESSING)
  -> prisma.exitRequest.update({status:PROCESSING, clearanceStatus:IN_PROGRESS})

CLEARANCES:
  POST /api/v1/exits/[id]/clearances -> ExitService.addClearance()
  POST /api/v1/exits/[id]/clearances/[id]/complete -> ExitService.completeClearance()
  -> prisma.exitClearance.update({status:APPROVED, clearedBy, clearedAt})
  -> Rollup: if all APPROVED -> exitRequest.clearanceStatus=COMPLETED

COMPLETE: POST /api/v1/exits/[id]/complete -> ExitService.complete()
  -> Guard: all clearances must be APPROVED
  -> fullFinalService.recordAndCalculate() [auto-triggered]
  -> prisma.exitRequest.update({status:COMPLETED, settlementAmount})
```

DB Models: ExitRequest, ExitClearance, FullFinalSettlement

---

### 9.4 Payroll Run Processing

```
CREATE: POST /api/v1/payroll/run
  -> Validates: companyId, month (YYYY-MM), countryCode
  -> Checks PayrollConfiguration exists; 409 if duplicate run for month
  -> prisma.payrollRun.create({status:PROCESSING}) -> 202 Accepted

CALCULATE: POST /api/v1/payroll/runs/[id]/calculate
  -> PayrollService.processPayroll()
  -> prisma.payrollRun.update({status:CALCULATED, processedAt})

FINALIZE: POST /api/v1/payroll/runs/[id]/finalize [partially traced]

APPROVE: POST /api/v1/payroll-runs/[id]/approve (or /payroll/approve/[runId])
  -> PayrollService.approveRun()
  -> prisma.payrollRun.update({status:APPROVED, approvedBy, approvedAt})

GL POSTING:
  POST /api/v1/payroll/gl/journals -> generate journals
  POST /api/v1/payroll/gl/journals/[id]/post -> post to GL
  POST /api/v1/payroll/gl/journals/[id]/reverse -> reversal
```

DB Models: PayrollRun, PayrollConfiguration, Payslip, PayrollAdjustment, StatutoryPayment
Notifications: notifyPayrollRunStarted/Completed/Failed, notifyPayslipGenerated

---

### 9.5 Employee Onboarding Case

```
CREATE: consumeOfferAccepted() [triggered by offer accepted event]
  -> Resolves governance template (country/legalEntity/employmentType)
  -> prisma.onboardingCase.create({currentStage:PRE_JOINING, status:OPEN})
  -> prisma.onboardingStageHistory.create({toStage:PRE_JOINING})

ADVANCE: POST /api/v1/onboarding/cases/[id]/transition
  -> OnboardingCaseService.advance(caseId, targetStage, reason)
  -> Validates ownership role + sequential stage (currentIndex+1)
  -> blockersForStage() checks mandatory exit criteria
  -> If blocked: status=BLOCKED, blockingItems logged
  -> If clear: prisma.onboardingCase.update({currentStage})
  -> prisma.onboardingStageHistory.create({fromStage, toStage})

SLA ESCALATION (automated):
  -> OnboardingCaseService.escalateBreachedCases()
  -> Finds status IN [OPEN,BLOCKED] AND slaDueAt < now
  -> prisma.onboardingCase.update({status:ESCALATED, escalatedToRole})
```

DB Models: OnboardingCase, OnboardingStageHistory, OnboardingGovernanceTemplate, OnboardingTask, EmployeeMasterDataDraft, BenefitEnrollment, EmployeePayrollProfile, SocialInsuranceRegistration, ProbationTracking

---

### 9.6 Shift Swap (2-Level Approval)

```
CREATE: POST /api/v1/shift-swaps -> ShiftManagementService.createShiftSwap()
  -> prisma.shiftSwap.create({status:PENDING})
  -> notifyShiftSwapRequested() [to peer employee]

PEER APPROVE: POST /api/v1/shift-swaps/[id]/peer-approve
  -> prisma.shiftSwap.update({peerApprovedAt})
  -> notifyShiftSwapPeerApproved() [to requestor]

MANAGER APPROVE: POST /api/v1/shift-swaps/[id]/manager-approve
  -> Updates ShiftRoster for both employees
  -> prisma.shiftSwap.update({managerApprovedAt, status:COMPLETED})
  -> notifyShiftSwapCompleted() [to both parties]

REJECT/CANCEL: POST /api/v1/shift-swaps/[id]/reject or /cancel
  -> notifyShiftSwapRejected() / notifyShiftSwapCancelled()
```

DB Models: ShiftSwap, ShiftRoster
Notifications: Full coverage (all 5 events wired)

---

### 9.7 Job Requisition Maker-Checker

```
SUBMIT: POST /api/v1/workforce-planning/requisition-workflow
  Body: {action:submit, requisitionId, justification}
  -> requisitionMakerCheckerService.submit()

APPROVE: Body: {action:approve, requisitionId}
  -> requisitionMakerCheckerService.approve()

REJECT: Body: {action:reject, requisitionId, reason}
  -> requisitionMakerCheckerService.reject()

Permission check: workforce_planning:manage OR workforce_planning:approve
```

Service: apps/web/src/lib/services/workforce-planning/workforce-planning.service.ts

---

### 9.8 Profile Change Request

```
CREATE: POST /api/v1/profile-changes -> ProfileChangeService.create()
  -> prisma.profileChangeRequest.create({status:DRAFT})

SUBMIT: POST .../submit -> ProfileChangeService.submit()
  -> prisma.profileChangeRequest.update({status:SUBMITTED, submittedAt})

APPROVE: POST .../approve -> ProfileChangeService.approve()
  -> prisma.profileChangeRequest.update({status:APPROVED, reviewedById, reviewedAt})

APPLY: POST .../apply -> ProfileChangeService.markApplied()
  -> prisma.profileChangeRequest.update({status:APPLIED, appliedAt})
  [Note: actual field mutation owned by target domain service]

REJECT: POST .../reject -> ProfileChangeService.reject()
  -> prisma.profileChangeRequest.update({status:REJECTED, reviewNotes})
```

DB Models: ProfileChangeRequest

---

### 9.9 Generic Workflow Engine

```
DESIGN:
  WorkflowService.createWorkflow() -> POST /api/v1/workflow-engine/definitions
  WorkflowService.publishWorkflow() -> PATCH definitions/[id]/activate

EXECUTE:
  WorkflowExecutionService.startExecution() -> POST /api/v1/workflow-engine/instances
  -> enqueueWorkflowExecution() -> BullMQ queue 'workflow-execution'

WORKER (services/workflow-service):
  -> prisma.workflowInstance.upsert({status:RUNNING})
  -> Loop: engine.executeNode() for each node
  -> On approval/delay: returns status:paused
  -> persistFinalState() -> prisma.workflowInstance.update({status:COMPLETED/FAILED/PAUSED})

APPROVAL RESOLUTION:
  -> ApprovalService.submitApproval()
  -> POST /api/v1/workflow-engine/tasks/[taskId]/action {action:APPROVE/REJECT, comment}
  -> Workflow re-queued and resumes

TASK MANAGEMENT:
  -> TaskService.getInbox() -> GET /api/v1/workflow-engine/tasks/inbox
  -> TaskService.reassignTask(), ApprovalService.delegateApproval()
```

DB Models: WorkflowDefinition, WorkflowInstance
Infrastructure: Redis + BullMQ, concurrency=10

---

## SECTION 10 — NOTIFICATIONS MATRIX (30 Events)

Transport: In-App via WebSocket (notification.service.ts -> wsServer)
Note: notification.service.ts carries @ts-nocheck (schema drift, tracked #29)

| Event                     | Recipient     |
| ------------------------- | ------------- |
| Leave Request Submitted   | Manager       |
| Leave Request Approved    | Employee      |
| Leave Request Rejected    | Employee      |
| Leave Balance Low         | Employee      |
| Attendance Marked         | Employee      |
| Late Arrival              | Employee      |
| Missing Attendance        | Employee      |
| Regularization Approved   | Employee      |
| Payroll Run Started       | HR/Payroll    |
| Payroll Run Completed     | HR/Payroll    |
| Payroll Run Failed        | HR/Payroll    |
| Payslip Generated         | Employee      |
| Report Generation Started | Requester     |
| Report Ready              | Requester     |
| Report Generation Failed  | Requester     |
| System Maintenance        | All Company   |
| System Update             | All Company   |
| Employee Onboarded        | All Company   |
| Shift Swap Requested      | Peer Employee |
| Shift Swap Peer Approved  | Requestor     |
| Shift Swap Completed      | Both Parties  |
| Shift Swap Cancelled      | Both Parties  |
| Shift Swap Rejected       | Requestor     |
| Shift Assigned            | Employee      |
| Shift Assignment Removed  | Employee      |
| Shift Roster Assigned     | Employee      |
| Shift Roster Confirmed    | Employee      |
| Shift Roster Cancelled    | Employee      |
| Open Shift Claimed        | Employee      |
| Shift Roster Published    | Employee      |

Email service exists (email.service.ts, ~15KB) but not confirmed wired to domain workflow approvals.
Generic Engine supports: email, sms, push, in_app, webhook — SMS/Push defined in type system only.

---

## SECTION 11 — DATABASE MODELS (43 Confirmed)

| Model                        | Used By                            | Evidence                                         |
| ---------------------------- | ---------------------------------- | ------------------------------------------------ |
| LeaveRequest                 | Leave Request Approval             | leave.service.ts                                 |
| LeaveBalance                 | Leave Approval, Encashment         | leave.service.ts                                 |
| LeavePolicy                  | Leave Request                      | leave.service.ts                                 |
| LeaveEncashment              | Leave Encashment                   | leave.service.ts                                 |
| OvertimeRequest              | Overtime Approval                  | overtime.service.ts                              |
| CompOffRequest               | Comp-Off Workflow                  | overtime.service.ts                              |
| AttendanceRegularization     | Regularization                     | overtime.service.ts                              |
| AttendanceRecord             | Regularization (update on approve) | overtime.service.ts                              |
| ShiftSwap                    | Shift Swap                         | shift-management.service.ts                      |
| ShiftRoster                  | Shift Swap, Assignment             | shift-management.service.ts                      |
| ExpenseClaim                 | Expense Claim                      | expense.service.ts                               |
| ExpenseItem                  | Expense Claim                      | expense.service.ts                               |
| ExpensePolicy                | Expense Policy Evaluation          | expense.service.ts                               |
| ExitRequest                  | Exit Workflow                      | exit.service.ts                                  |
| ExitClearance                | Exit Clearance                     | exit.service.ts                                  |
| FullFinalSettlement          | F&F Settlement                     | full-final.service.ts                            |
| PayrollRun                   | Payroll Run                        | payroll.service.ts                               |
| PayrollConfiguration         | Payroll Run                        | payroll/run/route.ts                             |
| Payslip                      | Payroll                            | payroll.service.ts                               |
| PayrollAdjustment            | Payroll Adjustment                 | payroll.service.ts                               |
| StatutoryPayment             | Statutory Payments                 | payroll.service.ts                               |
| TaxDeclaration               | Tax Declaration                    | payroll.service.ts                               |
| EmployeeSalaryStructure      | Payroll                            | payroll.service.ts                               |
| EmployeeBenefit              | Payroll                            | payroll.service.ts                               |
| OnboardingCase               | Onboarding                         | onboarding-case.service.ts                       |
| OnboardingStageHistory       | Onboarding                         | onboarding-case.service.ts                       |
| OnboardingGovernanceTemplate | Onboarding                         | onboarding-case.service.ts                       |
| OnboardingTask               | Onboarding pre-joining blocker     | onboarding-case.service.ts                       |
| EmployeeMasterDataDraft      | Master Data Activation             | onboarding-case.service.ts                       |
| BenefitEnrollment            | Onboarding ENROLMENT stage         | onboarding-case.service.ts                       |
| SocialInsuranceRegistration  | Onboarding ENROLMENT stage         | onboarding-case.service.ts                       |
| EmployeePayrollProfile       | Onboarding ENROLMENT stage         | onboarding-case.service.ts                       |
| ProbationTracking            | Probation, Onboarding              | probation.service.ts, onboarding-case.service.ts |
| ConfirmationRequest          | Employee Confirmation              | confirmation.service.ts                          |
| ProfileChangeRequest         | Profile Change                     | profile-change.service.ts                        |
| CandidateApplication         | Recruitment                        | recruitment/applications/route.ts                |
| Candidate                    | Recruitment                        | recruitment/applications/route.ts                |
| JobPosting                   | Recruitment                        | recruitment/applications/route.ts                |
| JobOffer                     | Recruitment, Onboarding trigger    | onboarding-case.service.ts                       |
| WorkflowDefinition           | Generic Engine                     | workflowService.ts                               |
| WorkflowInstance             | Generic Engine                     | workflowExecutionWorker.ts                       |
| AuditLog                     | All workflows (cross-cutting)      | audit.middleware.ts                              |
| User                         | All workflows (auth/actor)         | Cross-cutting                                    |

---

## SECTION 12 — IMPLEMENTATION COMPLETENESS

| #   | Workflow                      | FE  | API | Service | DB  | Approval | Notify  | Status                |
| --- | ----------------------------- | --- | --- | ------- | --- | -------- | ------- | --------------------- |
| 1   | Leave Request Approval        | Y   | Y   | Y       | Y   | Y        | Partial | Partially Implemented |
| 2   | Leave Encashment              | Y   | Y   | Y       | Y   | Y        | None    | Partially Implemented |
| 3   | Overtime Approval             | Y   | Y   | Y*      | Y   | Y        | None    | Partially Implemented |
| 4   | Regularization Approval       | Y   | Y   | Y*      | Y   | Y        | Partial | Partially Implemented |
| 5   | Comp-Off Workflow             | Y   | Y   | Y*      | Y   | Y        | None    | Partially Implemented |
| 6   | Shift Swap Approval           | Y   | Y   | Y       | Y   | Y        | Full    | **Fully Implemented** |
| 7   | Expense Claim Approval        | Y   | Y   | Y       | Y   | Y        | None    | **Fully Implemented** |
| 8   | Employee Exit                 | Y   | Y   | Y       | Y   | Y        | None    | **Fully Implemented** |
| 9   | Exit Clearance                | Y   | Y   | Y       | Y   | Y        | None    | **Fully Implemented** |
| 10  | Full & Final Settlement       | Y   | Y   | Y       | Y   | Y        | None    | **Fully Implemented** |
| 11  | Payroll Run Processing        | Y   | Y*  | Y       | Y   | Y        | Partial | Partially Implemented |
| 12  | GL Journal Posting            | Y   | Y   | Y       | ?   | Y        | None    | Partially Implemented |
| 13  | Onboarding Case               | Y   | Y   | Y       | Y   | Y        | None    | **Fully Implemented** |
| 14  | Employee Master Activation    | Y   | Y   | Y       | Y   | Y        | None    | Partially Implemented |
| 15  | Payroll Onboarding Approval   | Y   | Y   | ?       | Y   | Y        | None    | Partially Implemented |
| 16  | Probation Management          | Y   | Y   | Y*      | Y   | Partial  | None    | Partially Implemented |
| 17  | Employee Confirmation         | Y   | Y   | Y*      | Y   | Y        | None    | Partially Implemented |
| 18  | Recruitment Pipeline          | Y   | Y   | Y       | Y   | Partial  | None    | Partially Implemented |
| 19  | Job Requisition Maker-Checker | Y   | Y   | Y       | ?   | Y        | None    | **Fully Implemented** |
| 20  | Profile Change Request        | Y   | Y   | Y       | Y   | Y        | None    | **Fully Implemented** |
| 21  | Position Control Approval     | Y   | Y   | Y       | Y   | Y        | None    | Partially Implemented |
| 22  | FMLA Leave                    | Y   | Y   | Y       | Y   | Partial  | None    | Partially Implemented |
| 23  | DSAR Workflow                 | Y   | Y   | Y       | Y   | Partial  | None    | Partially Implemented |
| 24  | Generic Workflow Engine       | Y   | Y   | Y       | Y   | Y        | Partial | Partially Implemented |

Legend: Y=Confirmed | Partial=Partially confirmed | None=Not confirmed | ?=Unclear | *=@ts-nocheck schema drift

---

## SECTION 13 — CRITICAL FINDINGS

> [!CAUTION]
> **FINDING 1 — DUAL ROUTE PATHS (Leave)**
> Both `/api/v1/leave-requests/[id]/approve` and `/api/v1/leave/requests/[id]/approve` expose approve/reject endpoints. Both appear to call `LeaveService`. Potential conflict or deprecated path — requires audit to identify canonical route.

> [!CAUTION]
> **FINDING 2 — DUAL ROUTE PATHS (Payroll Approval)**
> Both `/api/v1/payroll-runs/[id]/approve` and `/api/v1/payroll/approve/[runId]` exist. Unknown if both are active or one is deprecated.

> [!WARNING]
> **FINDING 3 — SCHEMA DRIFT (@ts-nocheck Services)**
> Services with admitted Prisma schema drift (tracked under issue #29): `workflowService.ts` (stub), `notification.service.ts` (stub), `confirmation.service.ts`, `overtime.service.ts`, `payroll/run/route.ts`. These may not function correctly at runtime.

> [!WARNING]
> **FINDING 4 — GENERIC ENGINE DISCONNECTED FROM DOMAIN WORKFLOWS**
> The BPMN-style workflow engine (workflow-service microservice + dashboard module) is NOT connected to domain workflows. Domain workflows use hand-coded state machines. The generic engine is a separate configurable platform tool.

> [!NOTE]
> **FINDING 5 — ONBOARDING SLA ESCALATION NOT CONFIRMED SCHEDULED**
> `escalateBreachedCases()` exists in `OnboardingCaseService` but no cron job binding was found. Must be called externally. Scheduler infrastructure exists at `packages/@aura/scheduler/` but the specific binding was not confirmed.

> [!NOTE]
> **FINDING 6 — NOTIFICATION SERVICE IS A STUB**
> `notification.service.ts` is marked `@ts-nocheck — Stub service...not wired to any API route`. In-app notifications dispatch via WebSocket (confirmed wired for Shift and Payroll events). Email (`email.service.ts`, ~15KB) exists but not confirmed wired to approval workflows.
