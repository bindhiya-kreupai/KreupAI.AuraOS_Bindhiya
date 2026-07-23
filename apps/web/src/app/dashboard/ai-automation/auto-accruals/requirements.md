# Auto Accruals — Requirements

**Feature URL**: `/dashboard/ai-automation/auto-accruals`  
**Module**: AI & Automation → Process Automation  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Status**: Spec for completion (UI exists; calculation entirely mock / static)  
**Related**: [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md) · [architecture.md](./architecture.md)

---

## 1. Purpose

Give HR administrators and leave operations teams a **rules-based accrual engine dashboard** to preview the next leave accrual cycle per employee and leave type, detect anomalies (cap breaches, double accrual, expiry), and **commit** accrual postings to real balances — grounded in tenant leave policies, not demo arrays or LLM inference.

---

## 2. Current State (as of this document)

| Area           | Reality                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| UI             | Rules panel + projected balances table with status badges (Normal / Warning / Anomaly / Expired)        |
| Data           | Hardcoded local `RULES` and `PROJECTIONS` arrays in page; fictional employee names                      |
| Client         | **No API client import** — page does not call `ai-automation-client` or `ai-client`                     |
| Run cycle      | `handleRunCycle` uses `setTimeout(1500)` only; no server round-trip                                     |
| Primary API    | `/api/ai/auto-accruals` — static JSON; requires client-supplied `tenantId` (security gap); no auth      |
| Legacy API     | `/api/ai-automation/auto-accruals` GET — lists real `leaveAccrual` rows (orphan; page does not call)    |
| Domain service | `LeaveAccrualService` in `lib/services/leave/leave-accrual.service.ts` — real policy-based logic exists |
| Scheduler      | `leaveAccrualJob` / `processLeaveAccruals` in init scheduler — separate from this page                  |
| LLM            | **Not applicable** — GUIDE explicitly states rules-based, not LLM                                       |
| Auth           | Target: `ai-automation:read` / `ai-automation:write` (legacy list route has auth; primary API has none) |

---

## 3. Personas & Goals

| Persona           | Goals                                                      |
| ----------------- | ---------------------------------------------------------- |
| HR Admin          | Run monthly accrual cycle; review anomalies before posting |
| Leave Operations  | See per-employee projected balances by leave type          |
| Payroll / Finance | Understand leave liability from accrual projections        |
| System Admin      | Configure accrual schedule, tie to leave policies          |
| Auditor           | Trace each accrual posting to policy, run id, and approver |

---

## 4. Functional Requirements

### 4.1 Mandatory

| ID  | Requirement                       | Acceptance criteria                                                                                                                       |
| --- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **Tenant-scoped accrual preview** | Projections only for session tenant’s active employees and policies                                                                       |
| M2  | **Policy-driven calculation**     | Accrual amounts derived from `LeavePolicy` / entitlements — not hardcoded “1.25 days/month” strings                                       |
| M3  | **Dry-run projection**            | “Run Cycle” produces preview table (current, +accrued, projected, status) **without** writing balances                                    |
| M4  | **Explicit commit**               | Separate action posts accruals to `LeaveAccrual` + updates `LeaveBalance`; requires `ai-automation:write`                                 |
| M5  | **Anomaly detection**             | Flag cap proximity, double accrual, expiry, inactive employee — rules in `auto-accruals-rules.ts`                                         |
| M6  | **Permission gates**              | `ai-automation:read` for preview/list; `ai-automation:write` for commit / configure schedule                                              |
| M7  | **Persist accrual runs**          | Each dry-run/commit creates run metadata (`AIRunRecord` `runType: accrual_preview` \| `accrual_commit`) and `LeaveAccrual` rows on commit |
| M8  | **Bilingual API errors**          | Error payloads include `error` + `errorAr`                                                                                                |
| M9  | **No fabricated employees**       | Table rows map to real `Employee` records; never invent Alice/Bob demo names in API                                                       |
| M10 | **Reuse domain engine**           | Calculation delegates to `LeaveAccrualService` (or extracted shared module) — no duplicate accrual math                                   |
| M11 | **Human-in-the-loop**             | No silent background commit from this UI without explicit “Apply accruals” confirmation                                                   |

### 4.2 Essential

| ID  | Requirement                  | Acceptance criteria                                                                                |
| --- | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| E1  | **Active rules display**     | UI lists effective policies/rules per leave type (tenure tiers, caps, pro-rata) from tenant config |
| E2  | **Multi leave-type support** | Vacation, sick, comp-off, personal — per tenant policy catalog                                     |
| E3  | **Pro-rata handling**        | New joiners, leavers, unpaid leave pause — match `LeaveAccrualService` behavior                    |
| E4  | **Batch scope**              | Run for all active employees or filtered subset (dept, location, policy)                           |
| E5  | **Run history**              | Show last N committed cycles with counts, totals, status                                           |
| E6  | **Simulation timeframe**     | Optional 12-month liability projection (`action: simulate`) from real balances                     |
| E7  | **Schedule configuration**   | Monthly/quarterly auto-run config stored tenant-side (integrate with existing scheduler job)       |
| E8  | **Error reporting**          | Partial batch returns `failures[]` with employeeId + reason (inactive, missing policy)             |
| E9  | **Reset / discard**          | Discard dry-run preview without commit                                                             |

### 4.3 Good-to-Have

| ID  | Requirement                | Acceptance criteria                                           |
| --- | -------------------------- | ------------------------------------------------------------- |
| G1  | **Compare to prior run**   | Highlight delta vs last committed cycle                       |
| G2  | **Export**                 | CSV of projections for finance                                |
| G3  | **Approval workflow**      | Large batches require manager/HR approval via Workflow Engine |
| G4  | **Country-specific rules** | Surface labour-law constraints from compliance service        |
| G5  | **Notifications**          | Alert HR when anomalies &gt; threshold                        |
| G6  | **ESS read-only view**     | Employees see accrual explanation (separate ESS route)        |
| G7  | **Carry-forward preview**  | Tie to year-end carry-forward run                             |

---

## 5. Non-Functional Requirements

| ID  | Category      | Requirement                                                           |
| --- | ------------- | --------------------------------------------------------------------- |
| N1  | Performance   | Dry-run preview &lt; 10s for tenants ≤ 5k employees (or async + poll) |
| N2  | Scalability   | Batch commit up to 10k employees via background job                   |
| N3  | Security      | Session-resolved `tenantId` only; never trust body `tenantId`         |
| N4  | Determinism   | Same inputs → same accrual amounts (no LLM randomness)                |
| N5  | Reliability   | DB/policy failure → explicit error; no silent mock projections        |
| N6  | Observability | Log runId, tenantId, employeeCount, totalDaysAccrued, durationMs      |
| N7  | Compliance    | Accrual postings auditable; align with leave compliance guide         |

---

## 6. Data Inputs (feature sources)

| Input          | Sources (examples)                                           |
| -------------- | ------------------------------------------------------------ |
| Employees      | Active `Employee` (tenant, country, join date, status)       |
| Policies       | `LeavePolicy`, entitlements, accrual frequency, caps         |
| Balances       | `LeaveBalance` current balances by leave type                |
| Prior accruals | `LeaveAccrual` history (detect double accrual)               |
| Calendar       | Process date, leave year, accrual month                      |
| Compliance     | Country labour rules via `LabourLawService` (optional hints) |

Initial **v1** uses monthly accrual path already in `LeaveAccrualService.processMonthlyAccrual`.

---

## 7. API Surface (target)

| Method | Path                                 | Purpose                                              |
| ------ | ------------------------------------ | ---------------------------------------------------- |
| GET    | `/api/ai/auto-accruals`              | Run status, history, active rules summary            |
| GET    | `/api/ai/auto-accruals/projections`  | Paginated dry-run results for latest preview run     |
| POST   | `/api/ai/auto-accruals`              | `action: preview \| commit \| simulate \| configure` |
| GET    | `/api/ai/auto-accruals/runs/[runId]` | Async batch job status                               |

**Deprecation note**: Remove client-supplied `tenantId` requirement from POST body. Converge orphan GET on `/api/ai-automation/auto-accruals` (lists `leaveAccrual`) into primary API history endpoint.

Also available (domain): `/api/leave/accrual` — coordinate to avoid duplicate commit paths.

---

## 8. UI Requirements (page)

Must continue to support (wired to real data):

1. Active Logic Rules panel (from tenant policies)
2. Projected Balances table: employee, leave type, current, +accrued, projected, status
3. Anomaly count badge (from real detection, not hardcoded “2 Anomalies”)
4. **Run Cycle** → dry-run preview (replace `setTimeout` stub)
5. **Apply Accruals** commit button (write permission)
6. Reset / discard preview

UX constraints (product):

- Wire page to API client (`autoAccruals` in `ai-automation-client.ts`)
- Loading and empty states when no policies/employees
- Error banner on permission or calculation failure
- Module also mounted at `/leave/accrual-engine` — behavior must stay consistent

---

## 9. Out of Scope

- LLM-based accrual “recommendations” (explicitly not this feature)
- Replacing payroll leave encashment engine (separate leave module scope)
- Building a second scheduler — integrate with `leaveAccrualJob` instead
- Employee self-service accrual disputes (future ESS)

---

## 10. Success Metrics

| Metric                       | Target                                                   |
| ---------------------------- | -------------------------------------------------------- |
| Mock dependency on page load | 0 hardcoded `RULES` / `PROJECTIONS` in production path   |
| Calculation source           | 100% amounts from `LeaveAccrualService` / policy engine  |
| Committed accruals           | Each commit writes `LeaveAccrual` + balance update       |
| Anomaly precision            | Zero false “Normal” on cap-exceeded balances in test set |
| API auth coverage            | 100% routes use session tenant + permissions             |

---

## 11. Traceability

| Product statement                                                                  | Requirement IDs |
| ---------------------------------------------------------------------------------- | --------------- |
| FEATURES-GUIDE: “Auto Accruals — Intelligent leave accrual”                        | M2–M5, E1–E2    |
| GUIDE Phase 4 Process Automation                                                   | M10, E7, N4     |
| GUIDE: “rules-based, tied to existing Leave accrual logic — not a new LLM feature” | M10, N4         |
| Leave Accrual Engine route alias                                                   | E1, UI §8       |

---

## 12. Open Decisions

1. Single API under `/api/ai/auto-accruals` vs extend `/api/leave/accrual` as canonical write path.
2. Whether preview results live in `AIRunRecord.output` only or a staging table before commit.
3. Default async threshold (e.g. &gt; 500 employees → background job).
4. Anomaly rules: tenant-configurable vs platform defaults.
5. Relationship to scheduled `processLeaveAccruals` — same code path or manual override only.
