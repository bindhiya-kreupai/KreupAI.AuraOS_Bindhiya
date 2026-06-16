# EPIC-38: Compliance KPI & Scorecard Library

> **Source:** GCC HR Compliance Handbook — Appendix A7 – Compliance KPI Library
> **Module:** analytics · **Labels:** `epic`, `gcc-compliance`, `analytics`
> **Status:** Backlog · **Priority:** Should

## Epic Goal

Deliver the canonical compliance KPI and scorecard library in AuraOS: a governed catalogue of HR-compliance KPIs with precise definitions, formulas, data sources and thresholds across every domain — governance, workforce, payroll, WPS, social insurance, nationalization, immigration, leave, attendance/OT, benefits, accommodation, HSE, employee relations, separation, document retention, audit and automation — rolled into an executive compliance scorecard, with a threshold library, KPI data-quality controls, dashboards, automation and a monthly KPI certificate.

## Business Value

Gives leadership a single, trusted definition of "are we compliant?" — every KPI computed the same way from the same sources, with red/amber/green thresholds tied to statutory limits, so an executive scorecard reflects real GCC compliance exposure rather than inconsistent local metrics. The threshold library and data-quality controls prevent gaming and bad-data decisions, automation keeps KPIs live, and the monthly KPI certificate makes compliance performance attestable to boards and regulators.

## Requirements Covered (handbook sections)

- A7.1 Introduction
- A7.2 KPI Governance Framework
- A7.3 HR Governance KPIs
- A7.4 Workforce and Headcount KPIs
- A7.5 Payroll KPIs
- A7.6 Wage Protection KPIs
- A7.7 Social Insurance KPIs
- A7.8 Nationalization KPIs
- A7.9 Immigration KPIs
- A7.10 Leave KPIs
- A7.11 Attendance and Overtime KPIs
- A7.12 Benefits KPIs
- A7.13 Accommodation KPIs
- A7.14 HSE KPIs
- A7.15 Employee Relations KPIs
- A7.16 Separation KPIs
- A7.17 Document Retention KPIs
- A7.18 Audit KPIs
- A7.19 HRMS and Automation KPIs
- A7.20 Executive Compliance Scorecard
- A7.21 KPI Threshold Library
- A7.22 KPI Dashboard Design
- A7.23 KPI Data Quality Checklist
- A7.24 KPI Automation in AuraOS
- A7.25 Monthly Compliance KPI Certificate
- A7.26 Key Takeaways

## Out of Scope

- The operational dashboards within each domain module (EPIC-31 and domain epics) — this epic defines the shared KPI catalogue and executive scorecard they draw on.
- The underlying transactional data capture (payroll runs, WPS, visas) — KPIs are computed from that data, not created here.
- Checklist/audit red-flag detection (EPIC-37) — its outputs feed audit KPIs.
- Country rule authoring (EPIC-36) — thresholds reference those statutory limits.

## Dependencies

- EPIC-34 (Audit/RBAC/integration config) · EPIC-36 (statutory thresholds) · EPIC-37 (audit/checklist outputs) · feeds EPIC-31 (Compliance Dashboard)

## Epic Definition of Done

- [ ] A governed KPI catalogue defines each KPI's formula, data source, owner, frequency and unit.
- [ ] Per-domain KPI sets (governance, workforce, payroll, WPS, social insurance, nationalization, immigration, leave, attendance/OT, benefits, accommodation, HSE, ER, separation, document retention, audit, automation) are implemented and computed.
- [ ] The KPI threshold library applies red/amber/green bands tied to statutory limits, tenant-configurable.
- [ ] The executive compliance scorecard rolls domain KPIs into a weighted compliance view with drill-down and RBAC.
- [ ] KPI data-quality controls validate completeness/timeliness/accuracy before publication.
- [ ] KPI automation computes and refreshes KPIs on schedule with no manual recompute.
- [ ] KPI dashboards and the monthly KPI certificate are produced and audit-logged.

---

## User Stories

### EPIC-38-S01 — KPI governance & catalogue model

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a governed KPI catalogue model, **so that** every compliance KPI has one authoritative definition, formula and owner.
**Description**
Establish the KPI catalogue: each KPI defined with name, business definition, formula, data source/lineage, unit, frequency, direction (higher/lower better), owner and domain, under a governance framework (definition approval, change control, review cadence). This is the single source of truth all KPI computation and scorecards consume.

**Acceptance Criteria**

- [ ] Given a KPI, when defined, then it carries formula, data source/lineage, unit, frequency, direction, owner and domain.
- [ ] Given governance, when configured, then a KPI definition requires approval and review cadence before it goes live.
- [ ] Given a definition change, when published, then it is versioned and prior definitions remain for historical values.
- [ ] Given any catalogue change, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `kpi_definition`, `kpi_governance` schemas with lineage and versioning
- [ ] Backend: definition approval/change-control service
- [ ] Frontend: KPI catalogue browser + definition editor
- [ ] Rules/Config: domain taxonomy and KPI ownership
- [ ] Tests: unit tests for definition versioning and approval gating

**Covers:** A7.1, A7.2
**Dependencies:** EPIC-34

### EPIC-38-S02 — Governance, workforce & payroll KPI sets

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**As an** Executive / Leadership user, **I want** governance, workforce/headcount and payroll KPI sets, **so that** core HR-compliance performance is measured consistently.
**Description**
Implement the HR governance KPIs (e.g., policy acknowledgement %, control-completion rate), workforce/headcount KPIs (headcount accuracy, position-control adherence, attrition) and payroll KPIs (on-time payroll %, payroll error rate, off-cycle %, maker-checker adherence) from the catalogue against live data.

**Acceptance Criteria**

- [ ] Given the catalogue, when computed, then governance, workforce and payroll KPIs return values per entity/country and period.
- [ ] Given a KPI, when computed, then it uses the defined formula and data source exactly.
- [ ] Given RBAC, when a user views, then only in-scope entities' KPI values are shown.
- [ ] Given a computation, when run, then inputs and results are audit-logged.

**Tasks**

- [ ] Backend: computation services for governance/workforce/payroll KPIs
- [ ] Backend: KPI value store keyed by entity/country/period
- [ ] Frontend: domain KPI views
- [ ] Rules/Config: KPI formulas for these domains
- [ ] Tests: integration tests for formula correctness and RBAC scoping

**Covers:** A7.3, A7.4, A7.5
**Dependencies:** EPIC-38-S01

### EPIC-38-S03 — Statutory-compliance KPI sets (WPS, social insurance, nationalization, immigration)

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** WPS, social-insurance, nationalization and immigration KPI sets, **so that** the highest-penalty compliance areas are measured against statutory limits.
**Description**
Implement the wage-protection KPIs (on-time WPS submission %, salary-delay incidents), social-insurance KPIs (GOSI/GPSSA/SIO filing timeliness, contribution-match %), nationalization KPIs (Emiratisation/Nitaqat/Bahrainization/Omanisation rate vs target, band status) and immigration KPIs (valid-document %, expiry-breach count, renewal-on-time %) from the catalogue, with thresholds tied to statutory limits.

**Acceptance Criteria**

- [ ] Given the catalogue, when computed, then WPS/social-insurance/nationalization/immigration KPIs return values per entity/country.
- [ ] Given nationalization KPIs, when computed, then rate-vs-target and band status derive from the country rule pack.
- [ ] Given statutory-linked KPIs, when a value breaches a statutory limit, then it is flagged.
- [ ] Given a computation, when run, then it is audit-logged.

**Tasks**

- [ ] Backend: computation services for WPS/SI/nationalization/immigration KPIs
- [ ] Backend: statutory-limit linkage from rule engine
- [ ] Frontend: statutory-compliance KPI views
- [ ] Rules/Config: KPI formulas and statutory thresholds
- [ ] Tests: integration tests for statutory-breach flagging per country

**Covers:** A7.6, A7.7, A7.8, A7.9
**Dependencies:** EPIC-38-S01, EPIC-36

### EPIC-38-S04 — Operational compliance KPI sets (leave, attendance/OT, benefits, accommodation, HSE)

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** leave, attendance/OT, benefits, accommodation and HSE KPI sets, **so that** operational-compliance performance is measured consistently.
**Description**
Implement leave KPIs (leave-liability, encashment, statutory-minimum adherence), attendance/overtime KPIs (absenteeism, OT-over-cap %, missing-punch rate), benefits KPIs (mandatory-cover %, vendor-SLA), accommodation KPIs (occupancy/inspection compliance) and HSE KPIs (incident/LTIFR, training-completion, heat-stress adherence) from the catalogue.

**Acceptance Criteria**

- [ ] Given the catalogue, when computed, then leave/attendance/benefits/accommodation/HSE KPIs return values per entity/country.
- [ ] Given each KPI, when computed, then it uses the defined formula and source exactly.
- [ ] Given RBAC, when a user views, then only in-scope data is shown.
- [ ] Given a computation, when run, then it is audit-logged.

**Tasks**

- [ ] Backend: computation services for operational-domain KPIs
- [ ] Frontend: operational KPI views
- [ ] Rules/Config: KPI formulas for these domains
- [ ] Tests: integration tests for formula correctness

**Covers:** A7.10, A7.11, A7.12, A7.13, A7.14
**Dependencies:** EPIC-38-S01

### EPIC-38-S05 — Lifecycle & assurance KPI sets (ER, separation, document retention, audit, automation)

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3
**As an** Internal Auditor, **I want** ER, separation, document-retention, audit and automation KPI sets, **so that** lifecycle and assurance compliance are measured.
**Description**
Implement employee-relations KPIs (grievance SLA, resolution rate), separation KPIs (final-settlement timeliness, exit-clearance completion), document-retention KPIs (file completeness, expiry-breach), audit KPIs (finding-closure rate, corrective-action overdue %) and HRMS/automation KPIs (automation coverage, straight-through rate) from the catalogue.

**Acceptance Criteria**

- [ ] Given the catalogue, when computed, then ER/separation/document/audit/automation KPIs return values per entity/country.
- [ ] Given audit KPIs, when computed, then they draw from the EPIC-37 finding/corrective-action data.
- [ ] Given RBAC, when a user views, then only in-scope data is shown.
- [ ] Given a computation, when run, then it is audit-logged.

**Tasks**

- [ ] Backend: computation services for ER/separation/document/audit/automation KPIs
- [ ] Frontend: lifecycle & assurance KPI views
- [ ] Rules/Config: KPI formulas for these domains
- [ ] Tests: integration tests for audit-data sourcing

**Covers:** A7.15, A7.16, A7.17, A7.18, A7.19
**Dependencies:** EPIC-38-S01, EPIC-37

### EPIC-38-S06 — KPI threshold library & data-quality controls

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a KPI threshold library and data-quality controls, **so that** KPI values are banded consistently and trusted before publication.
**Description**
Build the KPI threshold library (red/amber/green bands per KPI, tied to statutory limits where relevant, tenant-configurable and country-aware) and the KPI data-quality checklist (completeness, timeliness, accuracy, source-reconciliation) that must pass before a KPI value is published to scorecards.

**Acceptance Criteria**

- [ ] Given a KPI, when thresholds are configured, then red/amber/green bands apply and statutory-linked bands derive from the rule engine.
- [ ] Given thresholds, when configured, then they are tenant-editable and country-aware.
- [ ] Given a KPI value, when data-quality controls run, then completeness/timeliness/accuracy/source-reconciliation are checked and failures block publication with a flag.
- [ ] Given any threshold/data-quality change, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `kpi_threshold`, `kpi_data_quality_check` schemas + banding and validation services
- [ ] Backend: publication gate on data-quality pass
- [ ] Frontend: threshold library editor + data-quality results view
- [ ] Rules/Config: statutory-linked threshold bands per country
- [ ] Tests: integration tests for banding and data-quality gating

**Covers:** A7.21, A7.23
**Dependencies:** EPIC-38-S02, EPIC-38-S03, EPIC-36

### EPIC-38-S07 — Executive compliance scorecard & KPI dashboards

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**As an** Executive / Leadership user, **I want** an executive compliance scorecard and KPI dashboards, **so that** I can see overall and per-domain compliance health at a glance.
**Description**
Build the executive compliance scorecard that rolls weighted domain KPIs into an overall compliance score with red/amber/green status, and the supporting KPI dashboards designed per the dashboard-design principles — per domain/entity/country, with trend, drill-down to underlying KPIs and records, and RBAC.

**Acceptance Criteria**

- [ ] Given the scorecard, when loaded, then weighted domain KPIs roll into an overall compliance score with RAG status per entity/country.
- [ ] Given a scorecard tile, when clicked, then it drills to the domain KPIs and underlying records.
- [ ] Given dashboards, when designed, then they follow the dashboard-design principles (clarity, trend, exception focus) and respect RBAC.
- [ ] Given a period filter, when applied, then scorecard and KPIs recompute for that period.

**Tasks**

- [ ] Backend: scorecard weighting/roll-up service + dashboard aggregation endpoints
- [ ] Frontend: executive compliance scorecard + KPI dashboards with drill-down and trend
- [ ] Rules/Config: domain weightings and dashboard layout config
- [ ] Tests: integration tests for roll-up weighting and RBAC scoping

**Covers:** A7.20, A7.22
**Dependencies:** EPIC-38-S02, EPIC-38-S03, EPIC-38-S04, EPIC-38-S05, EPIC-38-S06

### EPIC-38-S08 — KPI automation, monthly KPI certificate & key takeaways

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 3
**As a** System Administrator, **I want** KPI automation and a monthly KPI certificate, **so that** KPIs refresh on schedule and compliance performance is attestable.
**Description**
Implement KPI automation (scheduled computation/refresh of all KPIs, data-quality gating, scorecard recompute, alerts on RAG status change) and the monthly compliance KPI certificate attesting that KPIs were computed, data-quality passed and red KPIs were actioned, with the chapter key-takeaways as reference.

**Acceptance Criteria**

- [ ] Given the schedule, when due, then all KPIs auto-compute, pass data-quality and refresh the scorecard without manual action.
- [ ] Given a KPI moving to red, when detected, then an alert fires to the KPI owner/management.
- [ ] Given the monthly certificate, when generated, then it attests computation, data-quality pass and red-KPI action, blocked while critical data-quality failures remain.
- [ ] Given the certificate, when exported, then it produces a PDF and is audit-logged.

**Tasks**

- [ ] Backend: KPI automation orchestrator on the event bus + certificate generator with gating
- [ ] Backend: RAG-change alerting
- [ ] Frontend: KPI automation console + certificate view with e-sign/export and key-takeaways reference
- [ ] Rules/Config: refresh schedule and certificate attestation fields
- [ ] Tests: e2e test of scheduled compute → data-quality → scorecard refresh and certificate gating

**Covers:** A7.24, A7.25, A7.26
**Dependencies:** EPIC-38-S06, EPIC-38-S07
