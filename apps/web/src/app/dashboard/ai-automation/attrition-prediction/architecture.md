# Attrition Prediction — Architecture

**Feature URL**: `/dashboard/ai-automation/attrition-prediction`  
**Module**: AI & Automation → Predictive Analytics  
**Document version**: 1.0  
**Last updated**: 2026-07-15  
**Related**: [requirements.md](./requirements.md) · [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md)

---

## 1. Context

Attrition Prediction is a **non-chat predictive feature**. Per the AI Automation guide, predictive features:

1. Authenticate + resolve tenant
2. Collect features from domain tables
3. Run inference against the tenant’s active `PredictiveModel`
4. Persist `Prediction` rows
5. Serve dashboards from persisted predictions (not ad-hoc mock arrays)

LLM providers are **optional** (narrative summaries only). Core scoring is **rules / weighted features** (v1), pluggable to ML artifacts later.

---

## 2. System context (C4 Level 0)

```text
┌──────────────┐     HTTPS      ┌─────────────────────────────────────┐
│ HR User      │ ─────────────► │ AuraOS Web (Next.js :3006)          │
│ (HRBP/Mgr)   │ ◄───────────── │  /dashboard/ai-automation/          │
└──────────────┘     JSON       │  attrition-prediction               │
                                └──────────────┬──────────────────────┘
                                               │ /api/ai/attrition/*
                                               ▼
                                ┌─────────────────────────────────────┐
                                │ Attrition API + Prediction Engine   │
                                │ (rules / PredictiveModel)           │
                                └──────────────┬──────────────────────┘
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
              │ Neon Postgres  │    │ Domain modules   │    │ Optional LLM    │
              │ Prediction,    │    │ Employee, Leave, │    │ (narrative only)│
              │ PredictiveModel│    │ Comp, Perf, …    │    │ via llm-client  │
              └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 3. Container / layering (Level 1)

| Layer         | Location                                                                    | Responsibility                                                  |
| ------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Presentation  | `apps/web/src/app/dashboard/ai-automation/attrition-prediction/page.tsx`    | KPIs, charts, simulator, at-risk table                          |
| Client        | `apps/web/src/lib/services/ai-automation-client.ts` → `predictiveAttrition` | Typed fetch to `/api/ai/attrition*`                             |
| API           | `apps/web/src/app/api/ai/attrition/**`                                      | Auth, validation, orchestration responses                       |
| Legacy API    | `apps/web/src/app/api/ai-automation/attrition/route.ts`                     | Heuristic batch (to converge into `/api/ai/attrition`)          |
| Domain AI     | `apps/web/src/lib/services/ai/attrition.service.ts`                         | Feature weights, score, factors, recommendations                |
| Target AI lib | `apps/web/src/lib/ai/attrition-*` (to introduce)                            | Align with 4-layer pattern for consistency with coaching/resume |
| Persistence   | Prisma `PredictiveModel`, `Prediction`, `AIRunRecord`                       | Model registry + prediction store + run audit                   |
| Shared auth   | `authenticateWithPermissions` / `withEnhancedAuth` + `ai-automation:*`      | Tenant + RBAC                                                   |

### Target 4-layer layout (recommended, matches guide)

Even though scoring is not LLM-first, use the same package shape for clarity:

| File                            | Role                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `lib/ai/attrition-types.ts`     | DTOs: risk score, distribution, drivers, simulation result                      |
| `lib/ai/attrition-rules.ts`     | Thresholds, feature weights, risk band cutovers, retention playbooks            |
| `lib/ai/attrition-retrieval.ts` | Tenant-scoped feature vectors from Employee / Leave / Comp / Perf / Recognition |
| `lib/ai/attrition-ai.ts`        | Orchestration: score → enrich → persist → optional LLM summary                  |
| `lib/ai/attrition-fallback.ts`  | Deterministic last-good predictions or degraded scoring when sources missing    |

`AttritionPredictionService` can be refactored _into_ these modules rather than rewritten from scratch.

---

## 4. Predictive request lifecycle

```text
Client (page)
   │  GET /api/ai/attrition
   ▼
Auth (session → tenantId, permissions)
   │
   ├── If fresh Prediction rows exist → aggregate + return
   │
   └── Else / on recompute POST
         │
         ├─ retrieval: build feature vectors (tenant-scoped)
         ├─ rules: weighted risk score + factors + recommendations
         ├─ persist: Prediction (+ AIRunRecord summary)
         └─ respond: rankings, distribution, drivers
```

**Simulator path** (`action: simulate`): apply feature deltas in-memory (e.g. compensation competitiveness += salaryBoost%), re-score without write, return projected distribution / saved headcount estimate.

---

## 5. Data model

### 5.1 Existing Prisma (authoritative)

**`PredictiveModel`** (`aura_predictive_model`)

- `tenantId`, `code` (unique per tenant), e.g. `ATTRITION_V1`
- `modelType`: `ATTRITION`
- `algorithm`: `WEIGHTED_RULES` | `LOGISTIC` | `EXTERNAL_ML`
- `features`, `parameters`, `version`, `accuracy`, `status`, `isActive`

**`Prediction`** (`aura_prediction`)

- `modelId`, `tenantId`
- `entityType`: `Employee`
- `entityId`: employee UUID
- `predictedValue`: risk score 0–100 (or probability 0–1 — **pick one and document in code**)
- `confidence`
- `predictedDate`, `inputFeatures` (JSON snapshot)
- Optional later: `actualValue` / `actualDate` for calibration

**`AIRunRecord`**

- `runType`: `attrition_prediction` | `attrition_prediction_batch`
- Run-level metadata (counts, duration); individual scores live on `Prediction`

### 5.2 Logical prediction payload (API `output` / JSON)

```ts
type AttritionEmployeePrediction = {
  employeeId: string;
  employeeName: string;
  department: string;
  role?: string;
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  horizonDays: 90 | 180 | 365;
  primaryFactor: string;
  factors: { name: string; impact: number; category: string }[];
  recommendations: { action: string; priority: string; estimatedImpact: number }[];
  modelVersion: string;
  predictedAt: string; // ISO
};
```

Unify with `AttritionPrediction` in `dashboard/ai-automation/types.ts` during implementation.

---

## 6. Scoring architecture (v1)

### 6.1 Feature weights (current service)

From `AttritionPredictionService` — industry-inspired weights totaling ~1.0:

| Family          | Approx weight | Examples                                     |
| --------------- | ------------- | -------------------------------------------- |
| Compensation    | 25%           | salary competitiveness, last increase, bonus |
| Engagement      | 20%           | engagement score, survey, feedback           |
| Performance     | 15%           | rating, trend                                |
| Tenure & growth | 15%           | tenure, promotions, training                 |
| Management      | 10%           | manager tenure, team size, manager rating    |
| Workload        | 10%           | OT, leave utilization, WLB                   |
| External        | 5%            | market demand, industry attrition            |

### 6.2 Heuristic subset (legacy route)

`/api/ai-automation/attrition` currently approximates risk from:

- Short tenure (&lt; 1 year)
- Zero recent recognition
- Recent leave request volume

Treat as **bootstrap** until full vector retrieval is wired.

### 6.3 Risk bands

Suggested cutovers (tune via `PredictiveModel.parameters`):

|  Score | Level    |
| -----: | -------- |
|   0–29 | LOW      |
|  30–59 | MEDIUM   |
|  60–79 | HIGH     |
| 80–100 | CRITICAL |

---

## 7. API design

### 7.1 Target contracts

**GET `/api/ai/attrition`**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEmployees": 300,
      "atRiskCount": 50,
      "atRiskPercentage": 16.6,
      "replacementCostEstimate": 1200000,
      "modelAccuracy": 0.94,
      "modelVersion": "ATTRITION_V1",
      "lastRunAt": "2026-07-15T12:00:00.000Z"
    },
    "distribution": [
      { "name": "High Risk", "value": 15 },
      { "name": "Medium Risk", "value": 35 },
      { "name": "Low Risk", "value": 250 }
    ],
    "drivers": [{ "factor": "Salary Gap", "count": 45, "impact": "High" }]
  }
}
```

**GET `/api/ai/attrition/at-risk?limit=50`**

Returns ranked `AttritionEmployeePrediction[]` with pagination meta.

**POST `/api/ai/attrition`**

| `action`              | Behavior                                       |
| --------------------- | ---------------------------------------------- |
| `predict`             | Single employee                                |
| `batch` / `recompute` | Score cohort; persist                          |
| `simulate`            | What-if salary (and future levers); no persist |
| `analytics`           | Dept rollups                                   |

### 7.2 Auth & tenancy

```text
authenticateWithPermissions(request)
  → require tenantId from session (ignore client tenantId)
  → canReadAiAutomation / canWriteAiAutomation
```

Do **not** accept `tenantId` from the client as the source of truth (current `/api/ai/attrition` GET requires query `tenantId` — this must change).

### 7.3 Client wiring

```text
page.tsx
  → predictiveAttrition.getRiskScores()
  → predictiveAttrition.getAtRiskEmployees()
  → predictiveAttrition.getRetentionActions(employeeId)  // wire action CTA
```

Implement missing `/at-risk` and `/actions/[id]` routes or change client paths to query params on the main route.

---

## 8. UI composition

```text
AttritionPredictionPage
├── KPI strip (from summary)
├── Workforce Risk Profile (Pie ← distribution)
├── Top Drivers (Bar ← drivers)
├── Retention Simulator (local slider → POST simulate)
└── Urgent Attention table (← at-risk list)
       └── Action → employee detail / create retention task (future)
```

Charts: Recharts (already used). Styling: existing Aura dashboard tokens (`ink-black`, `celestial-indigo`, etc.).

---

## 9. Security & compliance controls

| Control                                       | Implementation                                                             |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| RBAC                                          | `ai-automation:read` / `:write`                                            |
| Tenant isolation                              | All Prisma queries include `tenantId`                                      |
| No PII leakage to clients beyond need-to-know | Managers see direct reports only (phase G4)                                |
| AI Act / governance                           | Document intended use; human review before HR action; optional bias checks |
| Audit                                         | Write + action events → audit log                                          |
| Secrets                                       | Provider keys server-only                                                  |

---

## 10. Performance strategy

1. **Read path**: Serve dashboard from latest `Prediction` set (indexed by `tenantId`, `entityType`, `predictedDate`).
2. **Write path**: Batch recompute offline/async for large tenants; store `AIRunRecord` progress.
3. **Cache**: Optional Redis summary key `attrition:summary:{tenantId}` with TTL (respect `REDIS_ENABLED`).
4. **Concurrency**: Cap parallel scoring if enriching with LLM narrative.

---

## 11. Failure modes

| Failure                 | Behavior                                                                     |
| ----------------------- | ---------------------------------------------------------------------------- |
| Unauthenticated         | 401 bilingual                                                                |
| Forbidden               | 403                                                                          |
| Missing feature sources | Score with available features; flag `dataCompleteness` &lt; 1; still persist |
| DB down                 | 503; UI shows last successful client cache only if explicitly marked stale   |
| Partial batch           | Return succeeded + `failures[]` (same pattern as resume bulk screen)         |

---

## 12. Migration / convergence plan

| Step | Work                                                                     |
| ---- | ------------------------------------------------------------------------ |
| 1    | Introduce `lib/ai/attrition-*` types + retrieval; keep service weights   |
| 2    | Harden `/api/ai/attrition` GET/POST with session tenant + permissions    |
| 3    | Implement `/at-risk` (or fold into GET) matching client                  |
| 4    | Persist to `PredictiveModel`/`Prediction`; seed default model per tenant |
| 5    | Replace page mocks with API data; empty/error states                     |
| 6    | Wire simulator to server `simulate`                                      |
| 7    | Deprecate or proxy `/api/ai-automation/attrition`                        |
| 8    | Optional LLM executive summary behind `ai-automation:write`              |

---

## 13. Testing strategy

| Layer       | Cases                                                                   |
| ----------- | ----------------------------------------------------------------------- |
| Unit        | Feature weight math, band cutovers, factor ranking, simulator delta     |
| Integration | Authz, tenant isolation, Prediction persist/read round-trip             |
| UI          | Loading → populated; API fail → error (no celebrity mock names in prod) |
| Regression  | Batch run duration / count for 100 / 1k employees                       |

---

## 14. Key files (today)

| Path                                           | Role                                            |
| ---------------------------------------------- | ----------------------------------------------- |
| `.../attrition-prediction/page.tsx`            | Dashboard UI (still mock-heavy)                 |
| `lib/services/ai-automation-client.ts`         | `predictiveAttrition` client                    |
| `app/api/ai/attrition/route.ts`                | Primary AI attrition API (needs auth hardening) |
| `app/api/ai-automation/attrition/route.ts`     | Heuristic scoring + `AIRunRecord`               |
| `lib/services/ai/attrition.service.ts`         | Weighted prediction engine                      |
| `dashboard/ai-automation/types.ts`             | Frontend attrition types                        |
| `packages/@aura/database/prisma/schema.prisma` | `PredictiveModel`, `Prediction`                 |

---

## 15. Decision log

| Decision          | Choice                           | Rationale                                            |
| ----------------- | -------------------------------- | ---------------------------------------------------- |
| Primary inference | Rules/weighted features first    | GUIDE risk A4 — cost/latency for predictive at scale |
| Persistence       | `Prediction` + `PredictiveModel` | Already in schema; guide success criterion           |
| LLM               | Optional narrative only          | Scores must stay deterministic/auditable             |
| API base          | `/api/ai/attrition`              | Aligns with coaching/resume under `/api/ai/*`        |
