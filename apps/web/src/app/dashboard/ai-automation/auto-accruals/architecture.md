# Auto Accruals — Architecture

**Feature URL**: `/dashboard/ai-automation/auto-accruals`  
**Module**: AI & Automation → Process Automation  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Related**: [requirements.md](./requirements.md) · [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md)

---

## 1. Context

Auto Accruals is a **non-LLM rules engine feature**. Per the AI Automation guide (Phase 4):

> Auto Accruals: rules-based, tied to existing Leave accrual logic — **not a new LLM feature**.

Lifecycle:

1. Authenticate + resolve tenant
2. Load employees, policies, balances
3. **Preview** accrual amounts (dry-run)
4. Detect anomalies via deterministic rules
5. **Commit** postings to `LeaveAccrual` + update balances on human approval
6. Audit run metadata

The `ai.ts` layer is **orchestration only** (batch loop, persist, schedule) — not LLM inference.

---

## 2. System context (C4 Level 0)

```text
┌──────────────┐     HTTPS      ┌─────────────────────────────────────┐
│ HR Admin     │ ─────────────► │ AuraOS Web (Next.js :3006)          │
│              │ ◄───────────── │  /dashboard/ai-automation/          │
└──────────────┘     JSON       │  auto-accruals                      │
                                │  (alias: /leave/accrual-engine)     │
                                └──────────────┬──────────────────────┘
                                               │ /api/ai/auto-accruals/*
                                               ▼
                                ┌─────────────────────────────────────┐
                                │ Auto Accruals API + Rules Engine    │
                                │ (LeaveAccrualService orchestration) │
                                └──────────────┬──────────────────────┘
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
              │ Neon Postgres  │    │ LeaveAccrual     │    │ Scheduler       │
              │ LeaveAccrual,  │    │ Service +        │    │ leaveAccrualJob │
              │ LeaveBalance,  │    │ LabourLawService │    │ (scheduled runs)│
              │ AIRunRecord    │    │                  │    │                 │
              └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 3. Container / layering (Level 1)

| Layer         | Location                                                                           | Responsibility                            |
| ------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| Presentation  | `apps/web/src/app/dashboard/ai-automation/auto-accruals/page.tsx`                  | Rules list, projections table, run/commit |
| Alias route   | `apps/web/src/app/(modules)/leave/accrual-engine/page.tsx`                         | Re-export same page                       |
| Client        | `apps/web/src/lib/services/ai-automation-client.ts` → `autoAccruals` (**to wire**) | Typed fetch to `/api/ai/auto-accruals*`   |
| API           | `apps/web/src/app/api/ai/auto-accruals/**`                                         | Auth, preview/commit orchestration        |
| Legacy API    | `apps/web/src/app/api/ai-automation/auto-accruals/route.ts`                        | Lists `leaveAccrual` (orphan)             |
| Domain        | `apps/web/src/lib/services/leave/leave-accrual.service.ts`                         | Authoritative accrual math                |
| Target AI lib | `apps/web/src/lib/ai/auto-accruals-*` (to introduce)                               | 4-layer shape; **ai = orchestration**     |
| Scheduler     | `apps/web/src/lib/jobs/leaveAccrualJob.ts`                                         | Production scheduled accrual              |
| Shared auth   | `canReadAiAutomation` / `canWriteAiAutomation`                                     | Tenant + RBAC                             |

### Target 4-layer layout (recommended)

| File                                | Role                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `lib/ai/auto-accruals-types.ts`     | DTOs: projection row, rule summary, run result, anomaly status              |
| `lib/ai/auto-accruals-rules.ts`     | Cap thresholds, double-accrual detection, expiry rules, status enum         |
| `lib/ai/auto-accruals-retrieval.ts` | Tenant employees, policies, balances, prior accruals for period             |
| `lib/ai/auto-accruals-ai.ts`        | **Orchestration**: preview batch → anomaly pass → commit via domain service |
| `lib/ai/auto-accruals-fallback.ts`  | Degraded preview when policy missing; explicit errors not mock data         |

Note: No LLM calls in this package. Name `*-ai.ts` matches guide convention for the orchestration entry point.

---

## 4. Accrual request lifecycle

```text
Client (page)
   │  POST /api/ai/auto-accruals  action=preview
   ▼
Auth (session → tenantId, permissions)
   │
   ├─ retrieval: employees + policies + balances + prior accruals
   ├─ rules: effective policy rules for display
   ├─ calculate: LeaveAccrualService.calculateEmployeeAccrual (per employee × policy)
   ├─ anomalies: cap / double / expiry / inactive checks
   ├─ persist: AIRunRecord (runType: accrual_preview, output: projections[])
   └─ respond: rules summary + projections + anomalyCount

Commit path (action=commit, ai-automation:write):
   ├─ reload preview run or re-calculate
   ├─ domain: updateLeaveBalance + leaveAccrual.create (via service)
   ├─ persist: AIRunRecord (runType: accrual_commit)
   └─ audit event
```

**Scheduled path** (`leaveAccrualJob`): same calculation function; UI manual commit is override/review path for ops.

---

## 5. Data model

### 5.1 Existing Prisma (authoritative)

**`LeaveAccrual`** (`aura_leave_accrual`)

- `tenantId`, `employeeId`, `policyId`, `leaveYear`, `accrualMonth`, `accrualDate`
- `accruedDays`, `runId`, `proRataFactor`, `calculationNote`

**`LeaveBalance`** — updated on commit via domain service.

**`AIRunRecord`**

- `runType`: `accrual_preview` \| `accrual_commit` \| `accrual_simulate`
- `output`: projections array, summary stats, errors

### 5.2 Logical projection payload (API `output` / JSON)

```ts
type AccrualAnomalyStatus = 'Normal' | 'Warning' | 'Anomaly' | 'Expired';

type AccrualProjectionRow = {
  employeeId: string;
  employeeName: string;
  employeeNumber?: string;
  leaveTypeCode: string;
  leaveTypeLabel: string;
  currentBalance: number;
  accruedAmount: number;
  projectedBalance: number;
  status: AccrualAnomalyStatus;
  reason?: string;
  policyId: string;
  policyName: string;
};

type AccrualPreviewResult = {
  runId: string;
  processDate: string;
  totalEmployees: number;
  totalAccruedDays: number;
  anomalyCount: number;
  projections: AccrualProjectionRow[];
  rules: { id: string; name: string; logic: string }[];
  status: 'PREVIEW' | 'COMMITTED' | 'FAILED' | 'PARTIAL';
};
```

Unify with `AutoAccrual` in `dashboard/ai-automation/types.ts` during implementation.

---

## 6. Rules engine architecture (v1)

### 6.1 Calculation (domain)

Delegate to `LeaveAccrualService`:

- `processMonthlyAccrual` / `calculateEmployeeAccrual`
- Policy filter by employee `countryCode`, accrual type `MONTHLY`
- Pro-rata for joiners; stop for leavers

### 6.2 Anomaly rules (`auto-accruals-rules.ts`)

| Rule              | Condition                                        | Status                          |
| ----------------- | ------------------------------------------------ | ------------------------------- |
| Cap proximity     | projected ≥ 90% of policy max                    | `Warning`                       |
| Cap exceeded      | projected &gt; max carry/accrual cap             | `Anomaly`                       |
| Double accrual    | `LeaveAccrual` exists same employee/policy/month | `Anomaly`                       |
| Expiry            | comp-off / time-limited balance past expiry rule | `Expired`                       |
| Inactive employee | employee status ≠ active                         | `Anomaly` (exclude from commit) |

### 6.3 Display rules panel

Map active `LeavePolicy` records to human-readable strings (not hardcoded `RULES` array):

```text
"If Tenure > 5 years, Add 0.5 days/month"  ← derived from entitlement tiers
```

---

## 7. API design

### 7.1 Target contracts

**GET `/api/ai/auto-accruals`**

```json
{
  "success": true,
  "data": {
    "currentPeriod": "2026-07",
    "status": "PREVIEW_READY",
    "lastRun": "2026-06-01T00:00:00.000Z",
    "nextScheduledRun": "2026-08-01T00:00:00.000Z",
    "stats": {
      "employeesProcessed": 300,
      "totalDaysAccrued": 375.0,
      "anomalyCount": 2
    },
    "history": [
      { "runId": "...", "date": "2026-06-01", "employees": 298, "days": 372.5, "status": "SUCCESS" }
    ]
  }
}
```

**POST `/api/ai/auto-accruals`**

| `action`    | Behavior                                                          |
| ----------- | ----------------------------------------------------------------- |
| `preview`   | Dry-run projections; persist `AIRunRecord`                        |
| `commit`    | Apply accruals for preview runId (skip anomalies unless override) |
| `simulate`  | Multi-month liability projection                                  |
| `configure` | Save schedule / notification thresholds                           |

**Security fix**: Remove `tenantId` from required body; use session.

### 7.2 Auth & tenancy

```text
authenticateWithPermissions(request)
  → require tenantId from session
  → canReadAiAutomation / canWriteAiAutomation
```

### 7.3 Client wiring

```text
page.tsx  (currently NO imports — must add)
  → autoAccruals.getStatus()
  → autoAccruals.previewCycle()
  → autoAccruals.commitCycle(runId)
```

Replace `handleRunCycle` `setTimeout` with `previewCycle()` call.

---

## 8. UI composition

```text
AutoAccrualsPage
├── Header (Reset | Run Cycle | Apply Accruals)
├── Active Logic Rules (col 1)
└── Projected Balances table (col 2-3)
       ├── anomaly badge (live count)
       └── status pills (Normal / Warning / Anomaly / Expired)
```

Styling: existing table and card patterns; no change required for v1 wiring.

---

## 9. Security & compliance controls

| Control            | Implementation                        |
| ------------------ | ------------------------------------- |
| RBAC               | `ai-automation:read` / `:write`       |
| Tenant isolation   | All Prisma queries include `tenantId` |
| No client tenantId | Session only                          |
| Deterministic math | No LLM                                |
| Audit              | Commit + balance change events        |
| Human approval     | Commit button explicit                |

---

## 10. Performance strategy

1. **Sync preview**: ≤ 500 employees inline.
2. **Async commit**: &gt; 500 → job + poll `/runs/[runId]`.
3. **Indexing**: Use existing `LeaveAccrual` indexes on `employeeId`, `accrualDate`.
4. **Caching**: Optional summary cache for GET status.

---

## 11. Failure modes

| Failure                     | Behavior                                           |
| --------------------------- | -------------------------------------------------- |
| Unauthenticated             | 401 bilingual                                      |
| Forbidden                   | 403                                                |
| Missing policy for employee | Row in `failures[]`; skip commit for that row      |
| Partial commit              | `PARTIAL` status + error list                      |
| Double commit same period   | Reject with `Anomaly` unless override flag + audit |
| DB down                     | 503; no mock projections                           |

---

## 12. Migration / convergence plan

| Step | Work                                                                   |
| ---- | ---------------------------------------------------------------------- |
| 1    | Introduce `lib/ai/auto-accruals-*`; wrap `LeaveAccrualService`         |
| 2    | Harden `/api/ai/auto-accruals` — auth, session tenant, real preview    |
| 3    | Wire page to `autoAccruals` client; remove `RULES`/`PROJECTIONS` mocks |
| 4    | Replace `setTimeout` with API preview                                  |
| 5    | Implement commit → `LeaveAccrual` + balance update                     |
| 6    | Merge orphan `/api/ai-automation/auto-accruals` list into history GET  |
| 7    | Align scheduled job with same orchestration function                   |
| 8    | Document relationship to `/api/leave/accrual`                          |

---

## 13. Testing strategy

| Layer       | Cases                                                                |
| ----------- | -------------------------------------------------------------------- |
| Unit        | Anomaly rules, cap math, double-accrual detection                    |
| Integration | Preview → commit → `LeaveAccrual` row + balance delta                |
| Auth        | Tenant isolation; reject body `tenantId` spoofing                    |
| UI          | Run Cycle calls API; loading state; no fictional names               |
| Regression  | Same result as `LeaveAccrualService` unit tests for sample employees |

---

## 14. Key files (today)

| Path                                           | Role                                    |
| ---------------------------------------------- | --------------------------------------- |
| `.../auto-accruals/page.tsx`                   | Dashboard UI (local mocks + setTimeout) |
| `(modules)/leave/accrual-engine/page.tsx`      | Re-export alias                         |
| `lib/services/ai-automation-client.ts`         | `autoAccruals` client (**unwired**)     |
| `lib/services/ai-client.ts`                    | Alternate `autoAccruals` fetch helpers  |
| `app/api/ai/auto-accruals/route.ts`            | Static mock API                         |
| `app/api/ai-automation/auto-accruals/route.ts` | Real `leaveAccrual` list (orphan)       |
| `lib/services/leave/leave-accrual.service.ts`  | Domain accrual engine                   |
| `lib/jobs/leaveAccrualJob.ts`                  | Scheduled processing                    |
| `dashboard/ai-automation/types.ts`             | `AutoAccrual` interface                 |

---

## 15. Decision log

| Decision              | Choice                         | Rationale                        |
| --------------------- | ------------------------------ | -------------------------------- |
| Inference             | Rules / domain service only    | GUIDE Phase 4 — not LLM          |
| Authoritative math    | `LeaveAccrualService`          | Avoid duplicate accrual logic    |
| Persistence           | `LeaveAccrual` + `AIRunRecord` | Schema ready; audit trail        |
| Preview before commit | Required                       | Financial/HR impact              |
| API base              | `/api/ai/auto-accruals`        | AI Automation module consistency |
| `*-ai.ts` role        | Orchestration only             | Guide 4-layer naming without LLM |
