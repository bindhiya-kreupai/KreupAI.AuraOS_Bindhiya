# Attrition Prediction — Requirements

**Feature URL**: `/dashboard/ai-automation/attrition-prediction`  
**Module**: AI & Automation → Predictive Analytics  
**Document version**: 1.0  
**Last updated**: 2026-07-15  
**Status**: Spec for completion (UI exists; inference mostly mock / heuristic)  
**Related**: [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md) · [architecture.md](./architecture.md)

---

## 1. Purpose

Give HR leaders and people managers an early, explainable view of **employee flight risk** so they can intervene with retention actions before resignations happen — with scores grounded in real tenant workforce data, not demo mock arrays.

---

## 2. Current State (as of this document)

| Area        | Reality                                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| UI          | Presentational dashboard with KPIs, pie chart, risk-factor bar chart, salary simulator, high-risk employee table                 |
| Data        | Hardcoded `RISK_DISTRIBUTION`, `RISK_FACTORS`, `HIGH_RISK_EMPLOYEES`; table falls back to mocks when API fails                   |
| Client      | `predictiveAttrition.getRiskScores()` / `getAtRiskEmployees()` → `/api/ai/attrition` (and `/at-risk` which may be unimplemented) |
| Service     | `AttritionPredictionService` (weighted feature model) + heuristic route under `/api/ai-automation/attrition`                     |
| Persistence | Schema ready: `PredictiveModel` / `Prediction`; page does not consistently read/write them                                       |
| Auth        | Target standard: `ai-automation:read` / `ai-automation:write` (not fully applied on all attrition routes)                        |

---

## 3. Personas & Goals

| Persona                 | Goals                                                     |
| ----------------------- | --------------------------------------------------------- |
| HRBP / People Analytics | See org-wide risk mix, top drivers, replace cost estimate |
| Department Head         | Filter by team/dept; prioritize interventions             |
| CHRO / Exec             | Trend vs prior period; fairness / bias visibility         |
| System Admin            | Model version, retention of predictions, audit trail      |

---

## 4. Functional Requirements

### 4.1 Mandatory

| ID  | Requirement                     | Acceptance criteria                                                                                                                                           |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **Tenant-scoped risk list**     | Authenticated user sees only their tenant’s active employees; no cross-tenant IDs or names                                                                    |
| M2  | **Per-employee risk score**     | Score 0–100 with level: `LOW` / `MEDIUM` / `HIGH` / `CRITICAL` (or mapped UI bands)                                                                           |
| M3  | **Explainable factors**         | Each scored employee shows top contributing factors (e.g. compensation gap, tenure stagnation, engagement, overtime) with relative impact                     |
| M4  | **At-risk shortlist**           | Dashboard lists employees above a configurable risk threshold, sorted by score desc                                                                           |
| M5  | **Workforce risk distribution** | Aggregate counts (or %) by risk band for KPI cards and pie chart — from live predictions, not mocks                                                           |
| M6  | **Top attrition drivers**       | Org-level bar chart of factor frequency/impact derived from latest prediction run                                                                             |
| M7  | **Permission gates**            | `ai-automation:read` for view/list; `ai-automation:write` for recompute / what-if / action logging                                                            |
| M8  | **Persist predictions**         | Each batch/single inference writes `Prediction` rows linked to an active `PredictiveModel` (`modelType` = attrition); optional `AIRunRecord` for run metadata |
| M9  | **Bilingual API errors**        | Error payloads include `error` + `errorAr`                                                                                                                    |
| M10 | **No fabricated employees**     | Scores only for real `Employee` records; never invent names in API or LLM summarization                                                                       |
| M11 | **Human-in-the-loop**           | No automated termination, demotion, or compensation change; recommendations are advisory until a human acts                                                   |

### 4.2 Essential

| ID  | Requirement                       | Acceptance criteria                                                                                                                                 |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | **Replacement cost estimate**     | KPI of estimated replacement cost for at-risk cohort (rules: e.g. N × salary × cost factor), documented and tenant-configurable                     |
| E2  | **Retention recommendations**     | Per employee: prioritized actions (comp review, career path, workload balance, 1:1) with estimated risk reduction band                              |
| E3  | **Retention simulator (what-if)** | Salary % adjustment (and preferably one non-salary lever) recalculates projected risk reduction without mutating live scores until “Apply scenario” |
| E4  | **Filters**                       | Department, location, manager, risk level, tenure band                                                                                              |
| E5  | **Drill-down**                    | Row action opens employee risk detail (metrics snapshot, history sparkline, recommended actions)                                                    |
| E6  | **Batch recompute**               | “Refresh predictions” job for active headcount (async or queued if > N employees)                                                                   |
| E7  | **Time horizon**                  | Predict voluntary exit likelihood for windows: 90 / 180 / 365 days (selectable)                                                                     |
| E8  | **Model metadata**                | UI shows model version, last trained/run time, evaluation accuracy if available                                                                     |
| E9  | **Audit**                         | Recompute and “accept retention plan” emit audit events                                                                                             |

### 4.3 Good-to-Have

| ID  | Requirement               | Acceptance criteria                                                                                  |
| --- | ------------------------- | ---------------------------------------------------------------------------------------------------- |
| G1  | **Bias / fairness panel** | Disparate impact checks by protected attributes available to the tenant (aligned with AI governance) |
| G2  | **Alerting**              | Notify HRBP when employee crosses HIGH/CRITICAL                                                      |
| G3  | **Outcome feedback**      | Capture actual exit → set `Prediction.actualValue` for future model calibration                      |
| G4  | **Manager view**          | Restricted to direct reports only                                                                    |
| G5  | **Export**                | CSV/PDF of at-risk shortlist                                                                         |
| G6  | **LLM narrative summary** | Optional executive summary of drivers (server-side LLM only); scores remain rules/ML                 |
| G7  | **Succession link**       | High-risk + key-role flag links to succession / nationalization retention flows                      |

---

## 5. Non-Functional Requirements

| ID  | Category      | Requirement                                                                                                      |
| --- | ------------- | ---------------------------------------------------------------------------------------------------------------- |
| N1  | Performance   | Dashboard GET (aggregated summary) &lt; 3s for tenants ≤ 5k employees (cached or precomputed `Prediction` reads) |
| N2  | Scalability   | Batch score up to 10k employees via background job; UI polls run status                                          |
| N3  | Security      | All LLM calls (if any) server-side only; API keys never sent to browser                                          |
| N4  | Privacy       | Minimize PII in prompts/logs; store feature snapshots without unnecessary secrets                                |
| N5  | Reliability   | If model/DB unavailable, return explicit error or last-known `Prediction` snapshot — no silent fiction-as-live   |
| N6  | Observability | Log run id, tenantId, durationMs, scoredCount; no employee PII in unstructured logs                              |
| N7  | Compliance    | Treat as **high-stakes HR AI** (EU AI Act–aligned thinking): transparency, human oversight, auditability         |

---

## 6. Data Inputs (feature sources)

Inference must pull from tenant sources of truth (not `data.ts` mocks):

| Feature family  | Sources (examples)                                |
| --------------- | ------------------------------------------------- |
| Compensation    | Salary, last raise date, market/comp ratio        |
| Engagement      | Surveys, recognition counts, feedback cadence     |
| Performance     | Latest rating, trend                              |
| Tenure / growth | Join date, promotions, training hours             |
| Management      | Manager changes, span of control, manager rating  |
| Workload        | OT hours, leave utilization, attendance anomalies |
| External        | Optional: industry attrition benchmark (config)   |

Initial **v1** may use a subset (tenure, leave volume, recognition) as in `/api/ai-automation/attrition`, then expand toward full weighted model in `AttritionPredictionService`.

---

## 7. API Surface (target)

| Method | Path                               | Purpose                                                                                       |
| ------ | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| GET    | `/api/ai/attrition`                | Summary + risk distribution + top drivers (auth from session, not client-supplied `tenantId`) |
| GET    | `/api/ai/attrition/at-risk`        | Paginated high-risk employees                                                                 |
| GET    | `/api/ai/attrition/employees/[id]` | Single employee detail + recommendations                                                      |
| POST   | `/api/ai/attrition`                | `action: predict \| batch \| simulate \| recompute`                                           |
| GET    | `/api/ai/attrition/runs/[runId]`   | Batch job status                                                                              |

**Deprecation note**: Prefer session-resolved `tenantId` over body/query `tenantId` (security). Align legacy `/api/ai-automation/attrition` with `/api/ai/attrition` or redirect.

---

## 8. UI Requirements (page)

Must continue to support (wired to real data):

1. KPI strip: at-risk count/%, replacement cost, model accuracy (when available)
2. Workforce risk profile (pie)
3. Top drivers of attrition (bar)
4. Retention simulator (salary % → risk reduction estimate)
5. “Urgent Attention Required” table: employee, dept, score, primary factor, AI recommendation, CTA

UX constraints (product):

- Loading and empty states when no predictions exist
- Error banner when permissions or LLM/DB fail
- Never show inventorial celebrity mock names in production mode

---

## 9. Out of Scope

- Building a separate ML training platform (use rules/heuristic v1; optional later artifact via `PredictiveModel.modelArtifactUrl`)
- Auto-firing or auto-issuing raises without workflow approval
- Duplicating Workforce Planning / People Analytics attrition _historical_ reporting (predictive vs retrospective stay distinct; may share charts)

---

## 10. Success Metrics

| Metric                       | Target                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Mock dependency on page load | 0 hardcoded employees in production path                                           |
| Predictions persisted        | ≥ 95% of active employees have a prediction newer than 7 days after refresh        |
| Intervention lead time       | Median days between HIGH score and exit (for leavers) measurable via feedback loop |
| Fairness                     | Bias flags reviewable before mass retention campaigns                              |

---

## 11. Traceability

| Product statement                                                   | Requirement IDs |
| ------------------------------------------------------------------- | --------------- |
| FEATURES-GUIDE: “Attrition Prediction — Flight risk identification” | M1–M6, E4–E5    |
| GUIDE Phase 2 Predictive Analytics                                  | M8, E6, N1      |
| Marketing: predict attrition 3–6 months ahead                       | E7              |

---

## 12. Open Decisions

1. Authoritative risk level enum: UI `very_low…very_high` vs service `LOW…CRITICAL` — unify in types package.
2. Simulator: recompute client-side vs server `simulate` action.
3. Whether Org Health / Anomaly Detection share feature-vector builders with attrition.
