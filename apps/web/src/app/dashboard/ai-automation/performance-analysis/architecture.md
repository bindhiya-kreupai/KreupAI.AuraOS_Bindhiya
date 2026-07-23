# Performance Analysis — Architecture

**Feature URL**: `/dashboard/ai-automation/performance-analysis`  
**Module**: AI & Automation → Predictive Analytics  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Related**: [requirements.md](./requirements.md) · [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md)

---

## 1. Context

Performance Analysis is a **non-chat predictive + analytics feature**. Per the AI Automation guide, predictive features:

1. Authenticate + resolve tenant
2. Collect features from domain tables
3. Run inference against the tenant’s active `PredictiveModel`
4. Persist `Prediction` rows
5. Serve dashboards from persisted predictions (not ad-hoc mock arrays)

The dashboard combines **retrospective analytics** (bell curve, fairness) with **forward predictions** (next-cycle success probability). Core scoring is **rules / weighted features** via `PerformancePredictionService` (v1); LLM optional for narrative only.

---

## 2. System context (C4 Level 0)

```text
┌──────────────┐     HTTPS      ┌─────────────────────────────────────┐
│ HR / Manager │ ─────────────► │ AuraOS Web (Next.js :3006)          │
│              │ ◄───────────── │  /dashboard/ai-automation/          │
└──────────────┘     JSON       │  performance-analysis               │
                                └──────────────┬──────────────────────┘
                                               │ /api/ai/performance/*
                                               ▼
                                ┌─────────────────────────────────────┐
                                │ Performance API + Prediction Engine │
                                │ (weighted rules + aggregates)       │
                                └──────────────┬──────────────────────┘
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
              │ Neon Postgres  │    │ Performance mod  │    │ Optional LLM    │
              │ Prediction,    │    │ Review, Goal,    │    │ (narrative only)│
              │ PredictiveModel│    │ Employee, Feedback│   │ via llm-client  │
              └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 3. Container / layering (Level 1)

| Layer         | Location                                                                    | Responsibility                             |
| ------------- | --------------------------------------------------------------------------- | ------------------------------------------ |
| Presentation  | `apps/web/src/app/dashboard/ai-automation/performance-analysis/page.tsx`    | Bell curve, top performers, fairness panel |
| Client        | `apps/web/src/lib/services/ai-automation-client.ts` → `performanceInsights` | Fetch `/api/ai/performance*`               |
| API           | `apps/web/src/app/api/ai/performance/**`                                    | Auth, orchestration                        |
| Legacy API    | `apps/web/src/app/api/ai-automation/performance-analysis/route.ts`          | Review/goal aggregates + `AIRunRecord`     |
| Domain AI     | `apps/web/src/lib/services/ai/performance-prediction.service.ts`            | Weighted score, factors, team insights     |
| Target AI lib | `apps/web/src/lib/ai/performance-*` (to introduce)                          | 4-layer pattern                            |
| Persistence   | Prisma `PredictiveModel`, `Prediction`, `AIRunRecord`                       | Model + scores + run audit                 |
| Shared auth   | `withEnhancedAuth` + `ai-automation:*`                                      | Tenant + RBAC                              |

### Target 4-layer layout (recommended)

| File                              | Role                                                                        |
| --------------------------------- | --------------------------------------------------------------------------- |
| `lib/ai/performance-types.ts`     | DTOs: bell curve bucket, top performer row, fairness metric, prediction     |
| `lib/ai/performance-rules.ts`     | Weights, ideal distribution, deviation thresholds, rating band mapping      |
| `lib/ai/performance-retrieval.ts` | Tenant-scoped reviews, goals, skills, attendance, demographics (aggregated) |
| `lib/ai/performance-ai.ts`        | Orchestration: aggregate → predict → fairness → persist                     |
| `lib/ai/performance-fallback.ts`  | Deterministic scoring when sparse data; last-good predictions               |

Refactor `PerformancePredictionService` _into_ these modules rather than duplicate logic.

---

## 4. Predictive request lifecycle

```text
Client (page)
   │  GET /api/ai/performance
   ▼
Auth (session → tenantId, permissions)
   │
   ├── If fresh Prediction rows exist → build dashboard
   │
   └── Else / on recompute POST
         │
         ├─ retrieval: reviews, goals, employee features per headcount
         ├─ analytics: histogram vs ideal bell curve; deviation flags
         ├─ rules: weighted predictPerformance per employee
         ├─ fairness: aggregated parity metrics (min group size)
         ├─ persist: Prediction (entityType Employee) + AIRunRecord summary
         └─ respond: distribution, topPerformers, fairness, summary KPIs
```

**Simulator path** (`action: simulate`): adjust target distribution; return projected histogram without persist.

---

## 5. Data model

### 5.1 Existing Prisma (authoritative)

**`PredictiveModel`**

- `tenantId`, `code` e.g. `PERFORMANCE_V1`
- `modelType`: `PERFORMANCE`
- `algorithm`: `WEIGHTED_RULES` | `LOGISTIC` | `EXTERNAL_ML`
- `parameters`: ideal distribution percentages, deviation tolerance

**`Prediction`**

- `modelId`, `tenantId`
- `entityType`: `Employee`
- `entityId`: employee UUID
- `predictedValue`: predicted next-cycle score 0–100
- `confidence`
- `predictedDate`, `inputFeatures` (JSON snapshot: history, goals, skills)
- Optional: `actualValue` after cycle closes

**`AIRunRecord`**

- `runType`: `performance_analysis` | `performance_prediction_batch`
- `output`: `{ reviewsCounted, averageRating, distribution, fairness, topPerformers[] }`

### 5.2 Logical payload (API)

```ts
type PerformanceBellCurveBucket = {
  rating: string; // '1'..'5' or band label
  count: number;
  ideal: number;
};

type PerformanceTopPerformer = {
  employeeId: string;
  employeeName: string;
  role: string;
  department?: string;
  predictedScore: number;
  successProbability: number; // 0-100 for UI
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  primaryFactor?: string;
};

type PerformanceFairnessMetric = {
  dimension: 'gender' | 'department' | 'location';
  label: string;
  status: 'WITHIN_RANGE' | 'REVIEW_REQUIRED';
  groupA: { label: string; avgRating: number; sharePct: number };
  groupB: { label: string; avgRating: number; sharePct: number };
  aiInsight?: string;
};

type PerformanceDashboard = {
  summary: {
    totalEmployees: number;
    reviewsCounted: number;
    averageRating: number;
    averageGoalProgress: number;
    deviationDetected: boolean;
    deviationDetail?: string;
    modelVersion: string;
    lastRunAt: string | null;
  };
  bellCurve: PerformanceBellCurveBucket[];
  topPerformers: PerformanceTopPerformer[];
  fairness: PerformanceFairnessMetric[];
};
```

---

## 6. Scoring architecture (v1)

### 6.1 Feature weights (existing service)

From `PerformancePredictionService`:

| Family                 | Approx weight | Examples                  |
| ---------------------- | ------------- | ------------------------- |
| Historical performance | 25%           | Past review ratings       |
| Goal completion        | 20%           | Goal achievement rate     |
| Skill development      | 15%           | Learning & assessments    |
| Attendance             | 10%           | Attendance patterns       |
| Collaboration          | 10%           | Team collaboration score  |
| Quality of work        | 10%           | Quality metrics           |
| Initiative             | 5%            | Proactive contributions   |
| Feedback               | 5%            | 360 / continuous feedback |

### 6.2 Rating bands

|  Score | Band              |
| -----: | ----------------- |
| 90–100 | EXCEPTIONAL       |
|  75–89 | EXCEEDS           |
|  60–74 | MEETS             |
|  40–59 | DEVELOPING        |
|   0–39 | NEEDS_IMPROVEMENT |

Map to 1–5 bell curve buckets for UI via `performance-rules.ts`.

### 6.3 Ideal bell curve (default calibration target)

| Rating | Ideal % |
| ------ | ------- |
| 5      | 5%      |
| 4      | 20%     |
| 3      | 60%     |
| 2      | 10%     |
| 1      | 5%      |

**Deviation detection**: flag when any bucket exceeds ideal ± tolerance (e.g. rating 2 actual 15% vs ideal 10% → “Slight Deviation Detected”).

### 6.4 Orphan route bootstrap

`/api/ai-automation/performance-analysis` currently:

```text
avgRating = mean(performanceReview.finalRating)
avgGoalProgress = mean(performanceGoal.progress)
→ AIRunRecord only (no Prediction rows)
```

Convergence must add full prediction pipeline and bell-curve histogram from review counts.

### 6.5 Fairness audit (aggregated)

```text
for dimension in [gender, department]:
  if each group count >= MIN_GROUP_SIZE:
    compute avgRating per group
    status = abs(delta) <= TOLERANCE ? WITHIN_RANGE : REVIEW_REQUIRED
```

Never return individual demographic attributes in API responses to unauthorized roles.

---

## 7. API design

### 7.1 Target contracts

**GET `/api/ai/performance?departmentId=&cycleId=`**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEmployees": 300,
      "reviewsCounted": 285,
      "averageRating": 3.4,
      "averageGoalProgress": 72,
      "deviationDetected": true,
      "deviationDetail": "Rating 2 over-represented (+5%)",
      "modelVersion": "PERFORMANCE_V1",
      "lastRunAt": "2026-07-16T09:00:00.000Z"
    },
    "bellCurve": [{ "rating": "3", "count": 55, "ideal": 60 }],
    "topPerformers": [
      {
        "employeeId": "uuid",
        "employeeName": "Real Name",
        "role": "Engineer",
        "successProbability": 92
      }
    ],
    "fairness": [
      {
        "dimension": "gender",
        "label": "Gender Parity (Ratings)",
        "status": "WITHIN_RANGE",
        "groupA": { "label": "Male", "avgRating": 4.2, "sharePct": 48 },
        "groupB": { "label": "Female", "avgRating": 4.3, "sharePct": 52 },
        "aiInsight": "No significant bias detected..."
      }
    ]
  }
}
```

**GET `/api/ai/performance/top-performers?limit=10`**

Paginated ranked list.

**GET `/api/ai/performance/employees/[id]`**

Full `PerformancePrediction` with factors.

**POST `/api/ai/performance`**

| `action`              | Behavior                                            |
| --------------------- | --------------------------------------------------- |
| `predict`             | Single employee (server retrieval, not client body) |
| `batch` / `recompute` | Score cohort; persist                               |
| `simulate`            | Calibration what-if                                 |
| `team-insights`       | Manager team rollup                                 |

### 7.2 Auth & tenancy

```text
withEnhancedAuth(request)
  → tenantId from session ONLY
  → ai-automation:read | :write
```

Current GET requires query `tenantId` — **broken for page** because `performanceInsights.getInsights()` does not pass it.

### 7.3 Client wiring

```text
page.tsx
  → performanceInsights.getInsights()     // must work without tenantId param
  → performanceInsights.getEmployeeInsights(id)  // drill-down (future)
  → performanceInsights.getTeamInsights(teamId)    // manager view (future)
```

Wire `insights.bellCurve` to chart; replace `BELL_CURVE_DATA` and static top-performer array.

---

## 8. UI composition

```text
PerformanceAnalysisPage
├── Header
├── Bell Curve (md:col-span-2 AreaChart ← bellCurve[])
│   └── Deviation badge ← summary.deviationDetected
├── AI Success Prediction card (← topPerformers[])
└── Fairness Audit (← fairness[])
```

Charts: Recharts `AreaChart`. Gradient card for top performers retains current visual design.

---

## 9. Security & compliance controls

| Control          | Implementation                                                   |
| ---------------- | ---------------------------------------------------------------- |
| RBAC             | `ai-automation:read` / `:write`                                  |
| Tenant isolation | All queries scoped by `tenantId`                                 |
| Fairness data    | Aggregates only; minimum group size                              |
| No auto-rating   | Predictions advisory                                             |
| AI Act alignment | Transparency on factors; human review before calibration changes |
| Audit            | Recompute logged                                                 |
| Secrets          | Server-only LLM                                                  |

---

## 10. Performance strategy

1. **Read path**: Latest `Prediction` set + cached `AIRunRecord.output` for histogram.
2. **Write path**: Batch recompute post-review-cycle import; async > 1k employees.
3. **Cache**: Redis optional `performance:summary:{tenantId}`.
4. **Indexes**: `PerformanceReview(tenantId, cycleId, finalRating)`.

---

## 11. Failure modes

| Failure                              | Behavior                                                |
| ------------------------------------ | ------------------------------------------------------- |
| Unauthenticated                      | 401 bilingual                                           |
| No reviews in cycle                  | Empty bell curve + message                              |
| Missing goal data                    | Score with reduced `dataCompleteness`; flag in response |
| DB down                              | 503; no static celebrity names                          |
| Insufficient group size for fairness | Omit dimension; note in summary                         |

---

## 12. Migration / convergence plan

| Step | Work                                                                |
| ---- | ------------------------------------------------------------------- |
| 1    | Introduce `lib/ai/performance-*`; extract weights from service      |
| 2    | Fix GET `/api/ai/performance` — session tenant, real histogram      |
| 3    | Wire retrieval: load employee features server-side for POST predict |
| 4    | Persist `PredictiveModel` (`PERFORMANCE_V1`) + `Prediction` rows    |
| 5    | Replace page mocks; bind bell curve + top performers                |
| 6    | Implement fairness aggregates with min group size                   |
| 7    | Proxy deprecate `/api/ai-automation/performance-analysis`           |
| 8    | Optional LLM cycle narrative                                        |

---

## 13. Testing strategy

| Layer       | Cases                                                                     |
| ----------- | ------------------------------------------------------------------------- |
| Unit        | Weight math, band mapping, deviation detection, ideal curve normalization |
| Integration | Authz, tenant isolation, Prediction round-trip                            |
| UI          | API success populates chart; failure shows error not mock names           |
| Fairness    | Suppressed when group &lt; MIN_GROUP_SIZE                                 |

---

## 14. Key files (today)

| Path                                                  | Role                                                 |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `.../performance-analysis/page.tsx`                   | Dashboard UI (mock bell curve + names)               |
| `lib/services/ai-automation-client.ts`                | `performanceInsights` client                         |
| `app/api/ai/performance/route.ts`                     | GET stub / POST via service                          |
| `app/api/ai-automation/performance-analysis/route.ts` | Real aggregates + auth                               |
| `lib/services/ai/performance-prediction.service.ts`   | Weighted prediction engine                           |
| `dashboard/ai-automation/services.ts`                 | Legacy `PerformanceAnalysisService`                  |
| `packages/@aura/database/prisma/schema.prisma`        | `PerformanceReview`, `PerformanceGoal`, `Prediction` |

---

## 15. Decision log

| Decision          | Choice                                          | Rationale                                  |
| ----------------- | ----------------------------------------------- | ------------------------------------------ |
| Primary inference | Weighted rules (`PerformancePredictionService`) | Already implemented; GUIDE A4              |
| Persistence       | `Prediction` + `AIRunRecord`                    | Schema ready                               |
| modelType         | `PERFORMANCE`                                   | User spec + registry clarity               |
| LLM               | Optional narrative                              | Scores must stay deterministic             |
| API base          | `/api/ai/performance`                           | Matches client `performanceInsights` paths |
| Client tenantId   | Remove requirement                              | Security + fix broken page load            |
