# Performance Analysis — Requirements

**Feature URL**: `/dashboard/ai-automation/performance-analysis`  
**Module**: AI & Automation → Predictive Analytics  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Status**: Spec for completion (UI exists; inference mostly mock / heuristic)  
**Related**: [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md) · [architecture.md](./architecture.md)

---

## 1. Purpose

Give HR leaders and people managers an analytical view of **performance distribution, calibration health, and forward-looking success signals** so they can detect rating inflation/deflation, identify emerging top performers, and audit fairness — with insights grounded in real tenant performance data, not demo bell curves and celebrity names.

---

## 2. Current State (as of this document)

| Area            | Reality                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| UI              | Bell-curve area chart, AI success prediction card (hardcoded names), fairness audit panel                             |
| Data            | Hardcoded `BELL_CURVE_DATA`; top performers list is static (`Sarah Connor`, etc.)                                     |
| Client          | `performanceInsights.getInsights()` → GET `/api/ai/performance` (requires query `tenantId` — broken without it)       |
| Mock API        | `/api/ai/performance` GET returns zeros; POST uses `PerformancePredictionService` with client-supplied payloads       |
| Real (orphaned) | `/api/ai-automation/performance-analysis` — aggregates `performanceReview` + `performanceGoal`; auth + session tenant |
| Persistence     | Schema ready: `PredictiveModel` / `Prediction`; page does not read/write them                                         |
| Auth            | Target standard: `ai-automation:read` / `ai-automation:write` (not fully applied on `/api/ai/performance`)            |

---

## 3. Personas & Goals

| Persona                 | Goals                                                      |
| ----------------------- | ---------------------------------------------------------- |
| HRBP / People Analytics | Org-wide rating distribution; calibration deviation alerts |
| Department Head         | Team performance trends; identify high-potential employees |
| CHRO / Exec             | Fairness audit across demographics; bell-curve compliance  |
| Performance Admin       | Model version, cycle alignment, audit trail                |
| Employee (indirect)     | Fair, explainable process — no automated rating changes    |

---

## 4. Functional Requirements

### 4.1 Mandatory

| ID  | Requirement                 | Acceptance criteria                                                                                                               |
| --- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **Tenant-scoped analytics** | Authenticated user sees only their tenant’s performance records; no cross-tenant data                                             |
| M2  | **Rating distribution**     | Histogram/bell curve of current-cycle ratings (1–5 or tenant scale) vs ideal calibration curve                                    |
| M3  | **Deviation detection**     | Flag when actual distribution deviates from target (e.g. rating 2 over-represented) with severity                                 |
| M4  | **Aggregate KPIs**          | Average rating, review completion count, average goal progress — from live data                                                   |
| M5  | **Top performer shortlist** | Ranked employees with predicted next-cycle success probability (only real employees)                                              |
| M6  | **Explainable factors**     | Each predicted employee shows contributing factors (goals, history, skills, attendance)                                           |
| M7  | **Permission gates**        | `ai-automation:read` for view; `ai-automation:write` for recompute / drill-down exports                                           |
| M8  | **Persist predictions**     | Batch inference writes `Prediction` rows linked to active `PredictiveModel` (`modelType` = `PERFORMANCE`); optional `AIRunRecord` |
| M9  | **Bilingual API errors**    | Error payloads include `error` + `errorAr`                                                                                        |
| M10 | **No fabricated employees** | Never invent names in API, UI, or LLM output                                                                                      |
| M11 | **Human-in-the-loop**       | No automated performance rating changes; predictions are advisory                                                                 |

### 4.2 Essential

| ID  | Requirement                     | Acceptance criteria                                                               |
| --- | ------------------------------- | --------------------------------------------------------------------------------- |
| E1  | **Fairness audit panel**        | Gender/dept/location rating parity with “Within Range” / “Review Required” status |
| E2  | **Department filter**           | Distribution and predictions scoped to selected department                        |
| E3  | **Review cycle alignment**      | Analytics respect active performance review cycle dates                           |
| E4  | **Goal completion correlation** | Surface avg goal progress alongside rating distribution                           |
| E5  | **Drill-down**                  | Row action opens employee performance detail (history, factors, recommendations)  |
| E6  | **Batch recompute**             | “Refresh insights” for active headcount                                           |
| E7  | **Trend comparison**            | Prior cycle vs current cycle distribution overlay                                 |
| E8  | **Model metadata**              | UI shows model version, last run time, reviews counted                            |
| E9  | **Audit**                       | Recompute events logged                                                           |

### 4.3 Good-to-Have

| ID  | Requirement                  | Acceptance criteria                                                        |
| --- | ---------------------------- | -------------------------------------------------------------------------- |
| G1  | **Calibration simulator**    | Adjust target distribution → projected rating shifts (what-if, no persist) |
| G2  | **Manager view**             | Restricted to direct reports                                               |
| G3  | **Bias deep-dive**           | Statistical tests on protected attributes (AI governance aligned)          |
| G4  | **Export**                   | CSV/PDF of distribution and top-performer list                             |
| G5  | **Succession link**          | High-potential flag links to succession planning                           |
| G6  | **LLM narrative**            | Optional cycle summary for executives (server-side only)                   |
| G7  | **360 feedback integration** | Incorporate peer/manager feedback scores into prediction                   |

---

## 5. Non-Functional Requirements

| ID  | Category      | Requirement                                                     |
| --- | ------------- | --------------------------------------------------------------- |
| N1  | Performance   | Dashboard GET &lt; 3s for tenants ≤ 5k employees                |
| N2  | Scalability   | Batch score via background job for large tenants                |
| N3  | Security      | Inference server-side only; no client `tenantId` trust          |
| N4  | Privacy       | Sensitive ratings visible only to authorized roles              |
| N5  | Reliability   | Explicit error or last-known snapshot — no silent mock fallback |
| N6  | Observability | Log run id, tenantId, reviewsCounted, durationMs                |
| N7  | Compliance    | High-stakes HR AI: transparency, human oversight, auditability  |

---

## 6. Data Inputs (feature sources)

| Feature family | Sources (examples)                                   |
| -------------- | ---------------------------------------------------- |
| Ratings        | `PerformanceReview.finalRating`, cycle, reviewer     |
| Goals          | `PerformanceGoal.progress`, status, due dates        |
| History        | Prior review ratings (trend)                         |
| Skills         | Skill assessments / L&D completions (when available) |
| Attendance     | Attendance rate patterns                             |
| Demographics   | For fairness audit only — role-gated, aggregated     |
| Feedback       | `ContinuousFeedback`, 360 scores (optional)          |

Initial **v1** uses weighted rules from `PerformancePredictionService` after tenant-scoped retrieval replaces client-supplied `employeeData`.

---

## 7. API Surface (target)

| Method | Path                                 | Purpose                                                               |
| ------ | ------------------------------------ | --------------------------------------------------------------------- |
| GET    | `/api/ai/performance`                | Summary, bell curve, deviation flags, fairness audit (session tenant) |
| GET    | `/api/ai/performance/at-risk`        | Underperformers / declining trend (optional)                          |
| GET    | `/api/ai/performance/top-performers` | Ranked success predictions                                            |
| GET    | `/api/ai/performance/employees/[id]` | Single employee detail + factors                                      |
| GET    | `/api/ai/performance/team/[teamId]`  | Team-scoped insights                                                  |
| POST   | `/api/ai/performance`                | `action: predict \| batch \| recompute \| simulate`                   |
| GET    | `/api/ai/performance/runs/[runId]`   | Batch job status                                                      |

**Deprecation note**: Align `/api/ai-automation/performance-analysis` with `/api/ai/performance`. Remove mandatory query `tenantId`.

---

## 8. UI Requirements (page)

Must continue to support (wired to real data):

1. **Rating Distribution (Bell Curve)** — actual vs ideal; deviation badge from API
2. **AI Success Prediction** — dynamic top-performer list with probability %
3. **Fairness Audit** — gender parity bars + AI insight text from live aggregates

UX constraints:

- Loading/empty when no reviews in active cycle
- Error banner on auth/inference failure
- Remove hardcoded celebrity names from production path
- Wire `insights` state to populate bell curve when API returns real distribution

---

## 9. Out of Scope

- Replacing the full Performance Management module review workflow UI
- Auto-submitting ratings to payroll or compensation systems
- Building a separate ML training pipeline in v1
- Individual development plan authoring (link to L&D module)

---

## 10. Success Metrics

| Metric                | Target                                                       |
| --------------------- | ------------------------------------------------------------ |
| Mock dependency       | 0 hardcoded bell-curve points / employee names in production |
| Predictions persisted | ≥ 95% of active employees scored after refresh               |
| Calibration accuracy  | Deviation flags align with HR calibration sessions           |
| Fairness visibility   | Parity metrics available before cycle sign-off               |

---

## 11. Traceability

| Product statement                                     | Requirement IDs |
| ----------------------------------------------------- | --------------- |
| FEATURES-GUIDE: “Performance Forecasting / Analytics” | M2–M5, E1–E4    |
| GUIDE Phase 2 Predictive Analytics                    | M8, E6, N1      |
| Marketing: calibration & bias detection               | M3, E1, G3      |

---

## 12. Open Decisions

1. Rating scale mapping: 1–5 UI vs `EXCEPTIONAL…NEEDS_IMPROVEMENT` service bands — unify in `performance-types.ts`.
2. Ideal bell curve targets: fixed 5-15-60-20-5 vs tenant-configurable.
3. Whether top-performer list is top N by score or all above threshold.
4. Fairness audit: minimum group size before displaying demographic breakdown.
