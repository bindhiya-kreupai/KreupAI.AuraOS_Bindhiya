# Leave Forecasting — Architecture

**Feature URL**: `/dashboard/ai-automation/leave-forecasting`  
**Module**: AI & Automation → Predictive Analytics  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Related**: [requirements.md](./requirements.md) · [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md)

---

## 1. Context

Leave Forecasting is a **non-chat predictive feature**. Per the AI Automation guide, predictive features:

1. Authenticate + resolve tenant
2. Collect features from domain tables
3. Run inference against the tenant’s active `PredictiveModel`
4. Persist `Prediction` rows
5. Serve dashboards from persisted predictions (not ad-hoc mock arrays)

LLM providers are **optional** (narrative summaries only). Core forecasting is **rules / time-series heuristics** (v1: moving average + seasonal multipliers), pluggable to ML artifacts later.

---

## 2. System context (C4 Level 0)

```text
┌──────────────┐     HTTPS      ┌─────────────────────────────────────┐
│ HR / Planner │ ─────────────► │ AuraOS Web (Next.js :3006)          │
│              │ ◄───────────── │  /dashboard/ai-automation/          │
└──────────────┘     JSON       │  leave-forecasting                  │
                                └──────────────┬──────────────────────┘
                                               │ /api/ai/leave-forecasting/*
                                               ▼
                                ┌─────────────────────────────────────┐
                                │ Leave Forecast API + Engine         │
                                │ (moving avg / seasonal rules)       │
                                └──────────────┬──────────────────────┘
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
              │ Neon Postgres  │    │ Leave module     │    │ Optional LLM    │
              │ Prediction,    │    │ LeaveRequest,    │    │ (summary only)  │
              │ PredictiveModel│    │ Employee, Calendar│    │ via llm-client  │
              └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 3. Container / layering (Level 1)

| Layer         | Location                                                                           | Responsibility                                  |
| ------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------- |
| Presentation  | `apps/web/src/app/dashboard/ai-automation/leave-forecasting/page.tsx`              | Area chart, radar, peak alerts, recommendations |
| Client        | `apps/web/src/lib/services/ai-automation-client.ts` → `leaveForecasting`           | Typed fetch to `/api/ai/leave-forecasting*`     |
| API           | `apps/web/src/app/api/ai/leave-forecasting/**`                                     | Auth, validation, orchestration                 |
| Legacy API    | `apps/web/src/app/api/ai-automation/leave-forecasting/route.ts`                    | 12-month moving average + `AIRunRecord`         |
| Legacy client | `apps/web/src/app/dashboard/ai-automation/services.ts` → `LeaveForecastingService` | Orphaned `/ai-automation/*` paths               |
| Target AI lib | `apps/web/src/lib/ai/leave-forecasting-*` (to introduce)                           | 4-layer pattern                                 |
| Persistence   | Prisma `PredictiveModel`, `Prediction`, `AIRunRecord`                              | Model registry + forecast store                 |
| Shared auth   | `withEnhancedAuth` + `ai-automation:*`                                             | Tenant + RBAC                                   |

### Target 4-layer layout (recommended)

| File                                    | Role                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| `lib/ai/leave-forecasting-types.ts`     | DTOs: time series point, peak period, recommendation, seasonal slice          |
| `lib/ai/leave-forecasting-rules.ts`     | Horizon defaults, severity cutovers, seasonal multipliers, staffing playbooks |
| `lib/ai/leave-forecasting-retrieval.ts` | Tenant-scoped leave history, headcount, holidays, leave types                 |
| `lib/ai/leave-forecasting-ai.ts`        | Orchestration: aggregate → forecast → peaks → recommend → persist             |
| `lib/ai/leave-forecasting-fallback.ts`  | Degraded forecast when sparse history; last-good snapshot read                |

---

## 4. Predictive request lifecycle

```text
Client (page)
   │  GET /api/ai/leave-forecasting
   │  GET /api/ai/leave-forecasting/peak-periods
   │  GET /api/ai/leave-forecasting/recommendations
   ▼
Auth (session → tenantId, permissions)
   │
   ├── If fresh Prediction / AIRunRecord exists → aggregate + return
   │
   └── Else / on recompute POST
         │
         ├─ retrieval: monthly/weekly leave counts, headcount by dept
         ├─ rules: moving avg + seasonal adjustment + holiday spikes
         ├─ derive: capacity curve, peak periods, recommendations
         ├─ persist: Prediction (org/dept entity) + AIRunRecord
         └─ respond: forecast series, peaks, recommendations
```

**Simulator path** (`action: simulate`): adjust concurrent-leave cap or approval rate in-memory; return projected capacity without write.

---

## 5. Data model

### 5.1 Existing Prisma (authoritative)

**`PredictiveModel`** (`aura_predictive_model`)

- `tenantId`, `code` e.g. `LEAVE_FORECAST_V1`
- `modelType`: `LEAVE_FORECAST`
- `algorithm`: `MOVING_AVERAGE` | `SEASONAL_RULES` | `EXTERNAL_ML`
- `features`, `parameters` (horizon days, MA window, holiday boost factor)
- `version`, `accuracy`, `status`, `isActive`

**`Prediction`** (`aura_prediction`)

- `modelId`, `tenantId`
- `entityType`: `Organization` | `Department` | `Employee` (employee-level optional)
- `entityId`: org/dept UUID or sentinel for tenant-wide
- `predictedValue`: primary metric (e.g. predicted absence % or leave days)
- `confidence`
- `predictedDate`, `inputFeatures` (JSON: history window, headcount, leave-type mix)
- Optional: `actualValue` post-period for accuracy tracking

**`AIRunRecord`**

- `runType`: `leave_forecast` | `leave_forecast_batch`
- `output`: full dashboard payload snapshot (series, peaks, recommendations)

### 5.2 Logical forecast payload (API)

```ts
type LeaveForecastPoint = {
  date: string; // ISO date or display label
  actual: number | null; // historical absence % or count
  predicted: number;
  capacity: number; // available staffing %
};

type LeavePeakPeriod = {
  date: string;
  reason: string;
  shortage: string; // e.g. "-15 Staff"
  status: 'Warning' | 'Critical';
  departmentId?: string;
  predictedAbsentees?: number;
};

type LeaveForecastRecommendation = {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'staffing' | 'scheduling' | 'policy' | 'communication';
  text: string;
  linkedPeakDate?: string;
};

type LeaveForecastDashboard = {
  summary: {
    horizonDays: number;
    totalEmployees: number;
    modelVersion: string;
    lastRunAt: string | null;
    accuracy?: number;
  };
  forecast: LeaveForecastPoint[];
  seasonal: Array<{ subject: string; current: number; prior: number; fullMark: number }>;
  peakPeriods: LeavePeakPeriod[];
  recommendations: LeaveForecastRecommendation[];
};
```

Unify with `LeaveForecast` in `dashboard/ai-automation/types.ts` during implementation.

---

## 6. Forecasting architecture (v1)

### 6.1 Historical aggregation (retrieval)

From `leave-forecasting-retrieval.ts`:

1. Query `LeaveRequest` for tenant, approved status, last 12–24 months
2. Bucket by week or month; optionally by `leaveTypeId`
3. Load active `Employee` count by department
4. Load public holidays / tenant calendar events

### 6.2 Moving average + seasonal rules (current orphan route)

`/api/ai-automation/leave-forecasting` bootstrap:

```text
history = group leaveRequest by month (12 mo)
forecastNextMonth = mean(last 3 months)
```

Extend to weekly series for UI:

```text
for each future week w:
  predicted[w] = MA(recent_weeks) * seasonalFactor(month(w)) * holidayFactor(w)
  capacity[w] = 100 - (predictedAbsentees / headcount * 100)
```

Seasonal factors derived from same month last year vs overall mean.

### 6.3 Peak detection

| Condition                                  | Severity |
| ------------------------------------------ | -------- |
| `capacity < 70%`                           | Warning  |
| `capacity < 50%` OR holiday-adjacent spike | Critical |
| Shortage &gt; dept min coverage gap        | Critical |

Attach `reason` from rule engine: e.g. “High Vacation (Christmas)”, “Regional Holiday Bridge”.

### 6.4 Recommendation playbooks (rules)

| Trigger              | Recommendation template            |
| -------------------- | ---------------------------------- |
| Critical Dec peak    | Overtime bonus window; temp staff  |
| Support team warning | Limit discretionary leave approval |
| Q4 multiple peaks    | Activate on-call roster            |

Map to structured `LeaveForecastRecommendation[]`; UI replaces static HTML list.

---

## 7. API design

### 7.1 Target contracts

**GET `/api/ai/leave-forecasting?horizonDays=90&departmentId=`**

```json
{
  "success": true,
  "data": {
    "summary": {
      "horizonDays": 90,
      "totalEmployees": 420,
      "modelVersion": "LEAVE_FORECAST_V1",
      "lastRunAt": "2026-07-16T10:00:00.000Z",
      "accuracy": 0.87
    },
    "forecast": [{ "date": "2026-07-21", "actual": 12, "predicted": 14, "capacity": 95 }],
    "seasonal": [{ "subject": "Vacation", "current": 86, "prior": 130, "fullMark": 150 }]
  }
}
```

**GET `/api/ai/leave-forecasting/peak-periods`**

Returns `peakPeriods[]` ranked by severity then date.

**GET `/api/ai/leave-forecasting/recommendations`**

Returns `recommendations[]` linked to active peaks.

**POST `/api/ai/leave-forecasting`**

| `action`    | Behavior                     |
| ----------- | ---------------------------- |
| `forecast`  | Single dept or org forecast  |
| `recompute` | Full tenant refresh; persist |
| `simulate`  | What-if capacity; no persist |

### 7.2 Auth & tenancy

```text
withEnhancedAuth(request)
  → require tenantId from session (ignore client tenantId)
  → permissions includes ai-automation:read | :write
```

Mock `/api/ai/leave-forecasting` POST currently requires body `tenantId` — **must change**.

### 7.3 Client wiring

```text
page.tsx
  → leaveForecasting.getForecast()        // main series + seasonal
  → leaveForecasting.getPeakPeriods()
  → leaveForecasting.getRecommendations()
```

Implement missing sub-routes or consolidate into single GET with `sections=` query param (prefer explicit sub-routes to match existing client).

---

## 8. UI composition

```text
LeaveForecastingPage
├── Header
├── Grid (lg:2+1)
│   ├── Absence Forecast AreaChart (← forecast[])
│   └── Seasonal RadarChart (← seasonal[])
└── Grid (md:2)
    ├── Predicted Staff Shortages (← peakPeriods[])
    └── Capacity Optimization (← recommendations[] + CTA)
```

Charts: Recharts (`AreaChart`, `RadarChart`). Styling: Aura dashboard tokens.

**Mock removal checklist**:

- Remove fallback to `FORECAST_DATA` / `CRITICAL_DAYS` when API succeeds with empty arrays — show empty state instead
- Wire recommendations `ul` to `recommendations` state
- Replace static `SEASONAL_DATA` with API `seasonal`

---

## 9. Security & compliance controls

| Control                 | Implementation                               |
| ----------------------- | -------------------------------------------- |
| RBAC                    | `ai-automation:read` / `:write`              |
| Tenant isolation        | All Prisma queries include `tenantId`        |
| Employee-level forecast | Manager/HR role gates                        |
| Advisory only           | Auto-apply routes through workflow approval  |
| Audit                   | Recompute + recommendation acceptance logged |
| Secrets                 | LLM keys server-only                         |

---

## 10. Performance strategy

1. **Read path**: Serve from latest `AIRunRecord.output` or aggregated `Prediction` set.
2. **Write path**: Nightly scheduled recompute + manual refresh; async for large tenants.
3. **Cache**: Optional Redis `leave-forecast:summary:{tenantId}` TTL aligned with attrition pattern.
4. **Indexing**: `LeaveRequest(tenantId, startDate, status)` for aggregation queries.

---

## 11. Failure modes

| Failure                        | Behavior                                                    |
| ------------------------------ | ----------------------------------------------------------- |
| Unauthenticated                | 401 bilingual                                               |
| Forbidden                      | 403                                                         |
| Sparse history (&lt; 3 months) | Low-confidence forecast; flag in summary; rules fallback    |
| DB down                        | 503; UI error — no mock chart                               |
| Partial dept data              | Forecast available org-wide; dept filter shows partial flag |

---

## 12. Migration / convergence plan

| Step | Work                                                                                                 |
| ---- | ---------------------------------------------------------------------------------------------------- |
| 1    | Introduce `lib/ai/leave-forecasting-*` types + retrieval                                             |
| 2    | Port moving-average logic from `/api/ai-automation/leave-forecasting` into `leave-forecasting-ai.ts` |
| 3    | Harden `/api/ai/leave-forecasting` with session auth + sub-routes                                    |
| 4    | Seed `PredictiveModel` (`LEAVE_FORECAST_V1`) per tenant; persist `Prediction` + `AIRunRecord`        |
| 5    | Replace page mocks; wire recommendations list                                                        |
| 6    | Implement peak detection + playbook recommendations                                                  |
| 7    | Deprecate proxy `/api/ai-automation/leave-forecasting`                                               |
| 8    | Optional LLM executive summary                                                                       |

---

## 13. Testing strategy

| Layer       | Cases                                                                     |
| ----------- | ------------------------------------------------------------------------- |
| Unit        | MA calculation, seasonal multiplier, peak severity, capacity math         |
| Integration | Authz, tenant isolation, persist/read round-trip                          |
| UI          | Loading → populated; API fail → error (no Halloween mock spike as “live”) |
| Regression  | Forecast run for tenant with 12mo leave history                           |

---

## 14. Key files (today)

| Path                                               | Role                                            |
| -------------------------------------------------- | ----------------------------------------------- |
| `.../leave-forecasting/page.tsx`                   | Dashboard UI (mock-heavy)                       |
| `lib/services/ai-automation-client.ts`             | `leaveForecasting` client                       |
| `app/api/ai/leave-forecasting/route.ts`            | Mock/static JSON API                            |
| `app/api/ai-automation/leave-forecasting/route.ts` | Real moving-average + auth                      |
| `dashboard/ai-automation/services.ts`              | Legacy `LeaveForecastingService`                |
| `dashboard/ai-automation/types.ts`                 | `LeaveForecast` interface                       |
| `packages/@aura/database/prisma/schema.prisma`     | `PredictiveModel`, `Prediction`, `LeaveRequest` |

---

## 15. Decision log

| Decision          | Choice                          | Rationale                                                 |
| ----------------- | ------------------------------- | --------------------------------------------------------- |
| Primary inference | Moving average + seasonal rules | GUIDE risk A4 — cost/latency; orphan route already exists |
| Persistence       | `Prediction` + `AIRunRecord`    | Schema ready; dashboard snapshot in run output            |
| LLM               | Optional narrative only         | Forecast must stay auditable                              |
| API base          | `/api/ai/leave-forecasting`     | Aligns with attrition/performance under `/api/ai/*`       |
| modelType         | `LEAVE_FORECAST`                | Distinct from attrition/performance in registry           |
