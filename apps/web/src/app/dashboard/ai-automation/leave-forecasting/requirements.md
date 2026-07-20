# Leave Forecasting — Requirements

**Feature URL**: `/dashboard/ai-automation/leave-forecasting`  
**Module**: AI & Automation → Predictive Analytics  
**Document version**: 1.0  
**Last updated**: 2026-07-16  
**Status**: Spec for completion (UI exists; data mostly mock)  
**Related**: [GUIDE-AI-AUTOMATION-COMPLETION.md](../../../../../../docs/implementation/GUIDE-AI-AUTOMATION-COMPLETION.md) · [architecture.md](./architecture.md)

---

## 1. Purpose

Give HR operations and workforce planners a forward-looking view of **leave demand and staffing capacity** so they can anticipate peak absence periods, mitigate understaffing, and apply data-driven scheduling policies — with forecasts grounded in real tenant leave history, not demo chart arrays.

---

## 2. Current State (as of this document)

| Area            | Reality                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| UI              | Dashboard with 90-day area chart (actual/predicted/capacity), seasonal radar, critical shortage alerts, capacity optimization panel      |
| Data            | Hardcoded `FORECAST_DATA`, `SEASONAL_DATA`, `CRITICAL_DAYS`; recommendations list is static HTML, not wired to API state                 |
| Client          | `leaveForecasting.getForecast()` / `getPeakPeriods()` / `getRecommendations()` → `/api/ai/leave-forecasting*` (sub-routes unimplemented) |
| Mock API        | `/api/ai/leave-forecasting` returns static JSON; requires client `tenantId` on POST; no auth                                             |
| Real (orphaned) | `/api/ai-automation/leave-forecasting` — 12-month moving average over `leaveRequest` + `AIRunRecord`; auth + tenant from session         |
| Persistence     | Schema ready: `PredictiveModel` / `Prediction`; page does not read/write them                                                            |
| Auth            | Target standard: `ai-automation:read` / `ai-automation:write` (not applied on mock `/api/ai/*` routes)                                   |

---

## 3. Personas & Goals

| Persona               | Goals                                                          |
| --------------------- | -------------------------------------------------------------- |
| HR Operations Manager | See org-wide absence forecast; identify critical shortage days |
| Department Head       | Filter by team/dept; balance leave approvals against capacity  |
| Workforce Planner     | Seasonal pattern comparison; staffing recommendations          |
| CHRO / Exec           | Trend vs prior year; cost of understaffing visibility          |
| System Admin          | Model version, forecast accuracy, audit trail                  |

---

## 4. Functional Requirements

### 4.1 Mandatory

| ID  | Requirement                  | Acceptance criteria                                                                                                                            |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **Tenant-scoped forecasts**  | Authenticated user sees only their tenant’s leave data; no cross-tenant aggregates                                                             |
| M2  | **Time-series forecast**     | Weekly (or daily) predicted absence % for configurable horizon (default 90 days) with historical actuals where available                       |
| M3  | **Capacity overlay**         | Each forecast point includes available capacity % (headcount minus predicted absentees vs required staffing)                                   |
| M4  | **Peak period detection**    | Ranked list of dates/periods with predicted staffing shortfall, reason, severity (`Warning` / `Critical`)                                      |
| M5  | **Staffing recommendations** | Actionable mitigations (overtime, blackout windows, temp staff, on-call roster) tied to peak periods                                           |
| M6  | **Leave type breakdown**     | Forecast split by leave type (annual, sick, casual, etc.) from tenant leave configuration                                                      |
| M7  | **Permission gates**         | `ai-automation:read` for view; `ai-automation:write` for recompute / apply recommendations                                                     |
| M8  | **Persist predictions**      | Each forecast run writes `Prediction` rows linked to active `PredictiveModel` (`modelType` = `LEAVE_FORECAST`); `AIRunRecord` for run metadata |
| M9  | **Bilingual API errors**     | Error payloads include `error` + `errorAr`                                                                                                     |
| M10 | **No fabricated employees**  | Individual leave predictions only for real `Employee` records when employee-level detail is shown                                              |
| M11 | **Human-in-the-loop**        | “Auto-Apply Recommendations” does not mutate leave balances or schedules without explicit approval workflow                                    |

### 4.2 Essential

| ID  | Requirement                      | Acceptance criteria                                                                                          |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| E1  | **Seasonal pattern analysis**    | Radar or equivalent comparing leave-type volumes across seasons (e.g. winter vs summer) from historical data |
| E2  | **Department filter**            | Forecast and peaks scoped to selected department/team                                                        |
| E3  | **Holiday / calendar awareness** | Peak detection incorporates tenant public holidays and regional calendars                                    |
| E4  | **Accuracy metrics**             | Compare prior forecast vs actual for completed periods; surface model accuracy KPI                           |
| E5  | **Batch recompute**              | “Refresh forecast” triggers full tenant recompute; async for large headcount                                 |
| E6  | **Horizon selection**            | 30 / 60 / 90 / 180-day forecast windows                                                                      |
| E7  | **Drill-down**                   | Peak period row opens detail: affected roles, suggested actions, historical same-period comparison           |
| E8  | **Model metadata**               | UI shows model version, last run time, data window used                                                      |
| E9  | **Audit**                        | Recompute and recommendation acceptance emit audit events                                                    |

### 4.3 Good-to-Have

| ID  | Requirement                       | Acceptance criteria                                                       |
| --- | --------------------------------- | ------------------------------------------------------------------------- |
| G1  | **What-if simulator**             | Adjust concurrent leave cap or approval rate → projected capacity curve   |
| G2  | **Integration with Leave module** | Link recommendations to leave policy rules or blackout date configuration |
| G3  | **Alerting**                      | Notify HR when forecast crosses critical capacity threshold               |
| G4  | **Export**                        | CSV/PDF of forecast series and peak periods                               |
| G5  | **Multi-site**                    | Location-specific forecasts when tenant has multiple sites                |
| G6  | **LLM narrative summary**         | Optional plain-language summary of peak risks (server-side only)          |
| G7  | **Attendance correlation**        | Incorporate unplanned absence (sick patterns) from attendance module      |

---

## 5. Non-Functional Requirements

| ID  | Category      | Requirement                                                                                                                |
| --- | ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| N1  | Performance   | Dashboard GET &lt; 3s for tenants ≤ 5k employees (cached or precomputed `Prediction` reads)                                |
| N2  | Scalability   | Batch forecast up to 10k employees via background job; UI polls run status                                                 |
| N3  | Security      | All inference server-side; API keys never sent to browser                                                                  |
| N4  | Privacy       | Aggregate forecasts default; employee-level predictions restricted by RBAC                                                 |
| N5  | Reliability   | If model/DB unavailable, return last-known `Prediction` snapshot or explicit error — no silent mock fallback in production |
| N6  | Observability | Log run id, tenantId, durationMs, forecastHorizonDays; no employee PII in unstructured logs                                |
| N7  | Compliance    | Advisory recommendations only; capacity decisions remain human-owned                                                       |

---

## 6. Data Inputs (feature sources)

Inference must pull from tenant sources of truth (not page mock arrays):

| Feature family | Sources (examples)                                        |
| -------------- | --------------------------------------------------------- |
| Leave history  | `LeaveRequest` (approved/pending by date, type, duration) |
| Headcount      | `Employee` (active count by dept/location)                |
| Leave types    | Tenant leave type configuration                           |
| Calendar       | Public holidays, tenant blackout dates                    |
| Seasonality    | Historical monthly/weekly aggregates (12–24 months)       |
| Staffing rules | Min coverage per team/role (config)                       |
| Attendance     | Unplanned absence patterns (optional v2)                  |

Initial **v1** may use moving-average + seasonal multipliers as in `/api/ai-automation/leave-forecasting`, then expand toward full retrieval in `lib/ai/leave-forecasting-retrieval.ts`.

---

## 7. API Surface (target)

| Method | Path                                        | Purpose                                                     |
| ------ | ------------------------------------------- | ----------------------------------------------------------- |
| GET    | `/api/ai/leave-forecasting`                 | Summary + time series + seasonal breakdown (session tenant) |
| GET    | `/api/ai/leave-forecasting/peak-periods`    | Ranked critical/warning shortage periods                    |
| GET    | `/api/ai/leave-forecasting/recommendations` | Staffing mitigations for detected peaks                     |
| POST   | `/api/ai/leave-forecasting`                 | `action: forecast \| recompute \| simulate`                 |
| GET    | `/api/ai/leave-forecasting/runs/[runId]`    | Batch job status                                            |

**Deprecation note**: Converge `/api/ai-automation/leave-forecasting` into `/api/ai/leave-forecasting`. Remove client-supplied `tenantId`; resolve from session.

---

## 8. UI Requirements (page)

Must continue to support (wired to real data):

1. **Absence Forecast (Next 90 Days)** — Recharts area chart: `actual`, `predicted`, `capacity`
2. **Seasonal Pattern Analysis** — radar chart by leave type (winter vs summer or YoY comparison)
3. **Predicted Staff Shortages** — card list with date, reason, shortage, status badge
4. **Capacity Optimization** — dynamic recommendations from API; CTA triggers approval flow (not silent auto-apply)

UX constraints (product):

- Loading and empty states when insufficient leave history
- Error banner when permissions or inference fail
- `recommendations` state from API replaces hardcoded bullet list
- Seasonal radar uses live aggregates, not static `SEASONAL_DATA`

---

## 9. Out of Scope

- Full ML time-series platform (ARIMA/Prophet) in v1 — use rules + moving average; optional external model via `PredictiveModel.modelArtifactUrl` later
- Auto-denying leave requests without workflow approval
- Duplicating Leave module’s approval queue UI (link out instead)
- Payroll cost modeling for overtime (may share with Analytics module later)

---

## 10. Success Metrics

| Metric                       | Target                                                                  |
| ---------------------------- | ----------------------------------------------------------------------- |
| Mock dependency on page load | 0 hardcoded forecast points in production path                          |
| Predictions persisted        | Latest org-level + dept-level forecasts newer than 7 days after refresh |
| Peak detection accuracy      | ≥ 70% of flagged critical days match actual understaffing (post-hoc)    |
| Recommendation adoption      | Track accepted vs dismissed staffing actions                            |

---

## 11. Traceability

| Product statement                                        | Requirement IDs |
| -------------------------------------------------------- | --------------- |
| FEATURES-GUIDE: “Leave Forecasting — Absence prediction” | M1–M6, E1–E3    |
| GUIDE Phase 2 Predictive Analytics                       | M8, E5, N1      |
| GUIDE success criterion: real `Prediction` rows          | M8, N5          |

---

## 12. Open Decisions

1. Forecast granularity: daily vs weekly buckets for the area chart.
2. Entity type for org-level forecast: `Prediction.entityType` = `Organization` vs `Department` vs JSON-only on `AIRunRecord.output`.
3. Whether seasonal radar compares calendar seasons or rolling 6-month windows.
4. “Auto-Apply Recommendations” — workflow template vs navigate-only CTA in v1.
