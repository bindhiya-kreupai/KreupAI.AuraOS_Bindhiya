# EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls

> **Source:** GCC HR Compliance Handbook — Chapter 31 – HR Compliance Dashboard and Controls
> **Module:** Analytics · **Labels:** `epic`, `gcc-compliance`, `analytics`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver AuraOS's unified HR Compliance Command Centre: a governed analytics layer that aggregates compliance signals from every HRMS domain (payroll, WPS/Mudad, social insurance, nationalization, immigration, leave/attendance, benefits, accommodation, HSE, employee relations, separation, documents) into an executive scorecard, per-domain dashboards, a risk heatmap, and closed-loop corrective-action tracking. The epic turns scattered control data into a single RAG-rated compliance posture per legal entity and GCC country, with management certification, a review calendar, and RBAC-controlled access.

## Business Value

Gives Leadership and Compliance Officers a real-time, audit-ready view of GCC compliance exposure, so breaches (WPS salary delay, Emiratisation/Nitaqat shortfall, expired visas, missing GOSI contributions) are surfaced and remediated before they trigger MOHRE/MHRSD/LMRA fines, establishment downgrades, or work-permit blocks. Replaces manual monthly compliance packs with auto-generated, certified evidence, cutting reporting effort and giving auditors a defensible control trail.

## Requirements Covered (handbook sections)

- 31.1 Introduction
- 31.2 Objectives of HR Compliance Dashboards
- 31.3 HR Compliance Dashboard Governance Framework
- 31.4 Dashboard Design Principles
- 31.5 HR Compliance Scorecard
- 31.6 Executive HR Compliance Dashboard
- 31.7 Country-Wise Compliance Dashboard
- 31.8 Payroll Compliance Dashboard
- 31.9 WPS / Mudad Wage Protection Dashboard
- 31.10 Social Insurance Dashboard
- 31.11 Nationalization Dashboard
- 31.12 Immigration and Work Permit Dashboard
- 31.13 Leave and Attendance Dashboard
- 31.14 Benefits Dashboard
- 31.15 Accommodation and Welfare Dashboard
- 31.16 HSE Dashboard
- 31.17 Employee Relations Dashboard
- 31.18 Termination and Final Settlement Dashboard
- 31.19 Document Compliance Dashboard
- 31.20 Compliance Risk Heatmap
- 31.21 Corrective Action Tracking
- 31.22 Management Certification
- 31.23 Compliance Review Calendar
- 31.24 HR Compliance Audit Controls
- 31.25 HRMS Compliance Automation Design
- 31.26 Compliance Dashboard Access Control
- 31.27 Monthly HR Compliance Pack
- 31.28 Sample HR Compliance Scorecard
- 31.29 Sample Corrective Action Register
- 31.30 Sample Monthly HR Compliance Certificate
- 31.31 Key Takeaways

## Out of Scope

- The underlying domain calculation engines (payroll run, EOSB formula, GOSI/GPSSA contribution math) — consumed here, owned by their respective epics.
- Authority portal direct integrations (MOHRE/Qiwa/GOSI screen-scraping) — covered by domain epics; this epic ingests their outputs/exceptions.
- Statutory filing submission workflows; this layer only monitors and certifies their status.
- Ad-hoc BI / data-warehouse self-serve query tooling beyond the governed compliance KPI catalogue.

## Dependencies

- EPIC-10 (Payroll), EPIC-11 (WPS), EPIC-13/14/15 (Social Insurance), EPIC-16/17/18 (Nationalization), EPIC-07/29 (Immigration), EPIC-19/20 (Attendance/Leave), EPIC-22 (Benefits), EPIC-23 (Accommodation), EPIC-24 (HSE), EPIC-25/26 (Employee Relations), EPIC-27/28 (Separation/EOSB), EPIC-30 (Document Retention) — all feed KPI signals.
- Platform RBAC, audit trail, alerting, and country rule engine.

## Epic Definition of Done

- [ ] A governed compliance KPI catalogue exists with definitions, thresholds, RAG bands, and owners, configurable per country and legal entity.
- [ ] Executive scorecard plus all 12 per-domain dashboards render live data with drill-down to source records and entity/country filters.
- [ ] Compliance risk heatmap aggregates domain × country severity and links each cell to underlying findings.
- [ ] Corrective-action tracking captures, assigns, SLA-tracks, and closes findings with full audit trail and overdue escalation.
- [ ] Management certification and the Monthly HR Compliance Pack generate, route for e-sign, and archive certified evidence.
- [ ] RBAC restricts dashboards/data by role, country, and legal entity; every view/export is audit-logged.
- [ ] Compliance review calendar drives scheduled reviews and auto-creates findings/certifications; all sample registers/certificates exportable.

---

## User Stories

### EPIC-31-S01 — Compliance dashboard governance, objectives & design principles

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a governed framework that defines what each compliance dashboard is for, who owns it, and how it must be designed, **so that** every dashboard is consistent, trustworthy, and audit-defensible rather than ad-hoc.

**Description**
Establishes the foundation: a documented governance model (data owners, refresh cadence, RAG definitions, single-source-of-truth rules) and design standards (consistent RAG colours, drill-down, country/entity filters, no vanity metrics) that all later dashboards inherit. Captured as configurable platform records, not just narrative.

**Acceptance Criteria**

- [ ] Given a new dashboard is created, when it is published, then it must reference a registered data owner, refresh cadence, and RAG band definition or publication is blocked.
- [ ] Given the design-principles config, when any dashboard renders, then it applies the standard RAG palette, country/legal-entity filter, and "as-of / last-refreshed" timestamp.
- [ ] Given the governance framework, when a KPI lacks a defined threshold and owner, then it is flagged as "ungoverned" and excluded from certified packs.
- [ ] Given a non-admin user, when they attempt to edit governance config, then RBAC denies it and the attempt is audit-logged.

**Tasks**

- [ ] Backend: `ComplianceDashboardGovernance` and `DashboardDesignStandard` entities (owner, cadence, ragBands, sourceOfTruth, dataClassification).
- [ ] Backend: governance validation service blocking publication of ungoverned dashboards/KPIs.
- [ ] Frontend: governance admin screen (owners, cadence, RAG band editor) and shared dashboard chrome component (filters, timestamp, RAG legend).
- [ ] Rules/Config: per-country/entity RAG band thresholds and refresh cadence defaults.
- [ ] Tests: unit tests for validation; e2e for blocked publication of ungoverned dashboard.

**Covers:** 31.1, 31.2, 31.3, 31.4
**Dependencies:** —

### EPIC-31-S02 — Compliance KPI engine, scorecard & sample scorecard export

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 13
**As a** Compliance Officer, **I want** a configurable KPI/scorecard engine that scores compliance per domain, country, and legal entity, **so that** I get a single weighted compliance posture and a printable scorecard.

**Description**
Core scoring engine: a KPI catalogue with definitions, weights, thresholds and RAG bands; a scorecard that rolls KPIs up by domain → country → entity into an overall compliance score. Includes a configurable digital "HR Compliance Scorecard" form with PDF/Excel export matching the handbook sample.

**Acceptance Criteria**

- [ ] Given the KPI catalogue, when KPI values refresh, then each KPI is rated Red/Amber/Green against its configured thresholds and timestamped.
- [ ] Given domain and entity weights, when the scorecard computes, then it produces a weighted 0–100 score with RAG status per domain, country, and overall.
- [ ] Given a UAE entity with WPS salary delay > 15 days, when the payroll KPI evaluates, then it is forced Red and drags the entity score per the configured override rule.
- [ ] Given a generated scorecard, when exported, then PDF/Excel matches the sample layout including as-of date, owner, and signature block, and the export is audit-logged.
- [ ] Given a KPI value, when a user drills in, then they see the contributing source records.

**Tasks**

- [ ] Backend: `ComplianceKpi`, `KpiResult`, `Scorecard`, `ScorecardLine` schema (weight, threshold, ragBand, score, period).
- [ ] Backend: scoring/rollup service (KPI → domain → country → entity) with override rules.
- [ ] Backend: scorecard export service (PDF/Excel) from a configurable template.
- [ ] Frontend: scorecard screen with RAG gauges, weighting view, drill-down, and "Sample HR Compliance Scorecard" export button.
- [ ] Rules/Config: KPI weights, thresholds, and country override rules (e.g. WPS delay → forced Red).
- [ ] Tests: unit tests for weighted rollup and overrides; snapshot test for export.

**Covers:** 31.5, 31.28
**Dependencies:** EPIC-31-S01

### EPIC-31-S03 — Executive HR Compliance Dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 8
**As an** Executive / Leadership user, **I want** a top-level compliance dashboard, **so that** I can see overall GCC compliance health and the biggest exposures at a glance.

**Description**
The C-suite landing view: overall score, RAG by domain and country, top open risks, overdue corrective actions, and statutory deadlines at risk, with trend lines. Read-mostly, fast-loading, and drillable into domain dashboards.

**Acceptance Criteria**

- [ ] Given an executive logs in, when the dashboard loads, then it shows overall compliance score, domain RAG tiles, country tiles, trend, and top-5 open risks.
- [ ] Given a domain tile, when clicked, then it drills to that domain's dashboard pre-filtered to the same entity/country.
- [ ] Given a statutory deadline within its alert window, when the dashboard renders, then it surfaces it in a "deadlines at risk" widget.
- [ ] Given an executive without entity X access, when the dashboard loads, then entity X data is excluded per RBAC and the exclusion is consistent across tiles.

**Tasks**

- [ ] Backend: executive aggregation API consolidating scorecard, risk, corrective-action, and deadline feeds.
- [ ] Backend: trend snapshot job persisting period-over-period scores.
- [ ] Frontend: executive dashboard (score header, RAG tiles, trend, top-risks, deadlines widget) with drill-through.
- [ ] Alerts/Workflow: surface deadline-at-risk and newly-Red domains.
- [ ] Tests: integration test for aggregation; e2e for drill-through and RBAC filtering.

**Covers:** 31.6
**Dependencies:** EPIC-31-S02

### EPIC-31-S04 — Country-wise compliance dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a per-country compliance dashboard, **so that** I can manage UAE, KSA, Bahrain, Qatar, Oman and Kuwait obligations against each country's specific authorities.

**Description**
A country lens showing each GCC country's compliance posture mapped to its authorities/platforms (MOHRE/ICP, MHRSD/Qiwa/Mudad/GOSI, LMRA/SIO, etc.), with country-specific obligations and localisation/WPS status.

**Acceptance Criteria**

- [ ] Given a country is selected, when the dashboard loads, then it shows that country's domains, authorities, and RAG status only.
- [ ] Given KSA, when rendered, then Nitaqat band, GOSI, Qiwa contracts, and Mudad wage status appear; given UAE, then Emiratisation, GPSSA, MOHRE/WPS appear.
- [ ] Given a country obligation breach, when detected, then it links to the responsible legal entities driving it.
- [ ] Given multi-entity countries, when filtered, then entity-level breakdown is available within the country view.

**Tasks**

- [ ] Backend: country-dimension aggregation API keyed to authority mapping per country.
- [ ] Frontend: country selector + country dashboard with authority-grouped tiles.
- [ ] Rules/Config: country→authority→obligation mapping in the country rule engine.
- [ ] Tests: integration tests asserting correct authority/obligation set per GCC country.

**Covers:** 31.7
**Dependencies:** EPIC-31-S02

### EPIC-31-S05 — Payroll, WPS/Mudad & Social Insurance compliance dashboards

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** payroll, WPS/Mudad, and social-insurance compliance dashboards, **so that** I can prove wages are paid correctly, on time, through the protected channels, and that statutory contributions reconcile.

**Description**
Three linked financial-compliance dashboards consuming payroll, WPS/Mudad, and GOSI/GPSSA/SIO feeds: on-time pay %, salary-delay alerts, WPS file submission status and rejections, contribution vs payroll reconciliation variances, and missing registrations.

**Acceptance Criteria**

- [ ] Given a payroll period, when the payroll dashboard loads, then it shows on-time-pay %, locked/unlocked status, and any salary delay > 15 days flagged Red.
- [ ] Given WPS/Mudad files, when the dashboard renders, then submission status, statutory-window adherence, and rejection/exception counts are shown per entity/country.
- [ ] Given GOSI/GPSSA/SIO data, when reconciled to payroll, then contribution variance and unregistered-employee counts are displayed with drill-down.
- [ ] Given any breach (delayed wage, rejected WPS file, contribution mismatch), when detected, then a corrective-action item can be raised directly from the dashboard.

**Tasks**

- [ ] Backend: payroll/WPS/social-insurance KPI feeds and reconciliation aggregation services.
- [ ] Frontend: three dashboard views (payroll, WPS/Mudad, social insurance) with shared drill-down.
- [ ] Rules/Config: salary-delay threshold (15 days), WPS statutory window, contribution-variance tolerance per country.
- [ ] Alerts/Workflow: raise finding on WPS rejection / salary delay / contribution mismatch.
- [ ] Tests: integration tests for reconciliation variance and salary-delay flagging.

**Covers:** 31.8, 31.9, 31.10
**Dependencies:** EPIC-31-S02

### EPIC-31-S06 — Nationalization & immigration/work-permit dashboards

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** nationalization and immigration dashboards, **so that** I can track Emiratisation/Nitaqat/Bahrainization/Omanisation targets and visa/permit expiries before they breach.

**Description**
Two dashboards: nationalization (actual vs target ratio, band/colour, gap to target, fake-nationalization risk flags) and immigration (visa, work permit, Iqama/CPR/QID expiry pipeline with 60/30/7-day alerting, renewal status, grace-period tracking).

**Acceptance Criteria**

- [ ] Given an entity's nationalization data, when the dashboard loads, then it shows current ratio, target, band (e.g. Nitaqat colour), and gap with RAG status.
- [ ] Given a localisation shortfall, when detected, then projected penalty/risk is displayed and a finding can be raised.
- [ ] Given immigration documents, when the dashboard renders, then expiries are bucketed and alerts fire at 60/30/7 days before expiry.
- [ ] Given an expired or in-grace-period permit, when listed, then it is flagged Red with PRO action status and days remaining.

**Tasks**

- [ ] Backend: nationalization KPI feed (ratio, target, band, gap) and immigration expiry pipeline feed.
- [ ] Frontend: nationalization dashboard (gauge + gap) and immigration dashboard (expiry buckets, renewal tracker).
- [ ] Rules/Config: localisation targets/bands per country; visa/permit/Iqama/CPR/QID alert thresholds 60/30/7.
- [ ] Alerts/Workflow: expiry alerts and shortfall findings.
- [ ] Tests: unit tests for expiry bucketing and ratio/band computation.

**Covers:** 31.11, 31.12
**Dependencies:** EPIC-31-S02

### EPIC-31-S07 — Leave/attendance & benefits compliance dashboards

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As an** HR Manager, **I want** leave/attendance and benefits compliance dashboards, **so that** I can monitor statutory leave usage, attendance integrity, and benefits coverage gaps.

**Description**
Leave/attendance view (statutory leave compliance, negative balances, unauthorized absence, regularization backlog, missing punches) and benefits view (medical insurance coverage %, expiring policies, missing mandatory enrolments).

**Acceptance Criteria**

- [ ] Given attendance/leave data, when the dashboard loads, then it shows unauthorized-absence, missing-punch backlog, and statutory-leave compliance with RAG.
- [ ] Given negative or non-compliant leave balances, when detected, then they are listed with employee drill-down.
- [ ] Given benefits data, when rendered, then medical-insurance coverage %, uninsured mandatory employees, and policies expiring within the alert window are shown.
- [ ] Given an uninsured employee where coverage is statutory, when detected, then it is flagged Red and a finding can be raised.

**Tasks**

- [ ] Backend: leave/attendance and benefits KPI feeds.
- [ ] Frontend: leave/attendance dashboard and benefits dashboard with drill-down.
- [ ] Rules/Config: statutory-leave rules, mandatory-insurance rules, policy-expiry alert window per country.
- [ ] Alerts/Workflow: raise finding on mandatory coverage gap / unauthorized absence threshold.
- [ ] Tests: integration tests for coverage % and absence flagging.

**Covers:** 31.13, 31.14
**Dependencies:** EPIC-31-S02

### EPIC-31-S08 — Accommodation/welfare & HSE compliance dashboards

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** accommodation/welfare and HSE dashboards, **so that** I can monitor worker-welfare, camp inspection status, and safety/incident compliance.

**Description**
Accommodation/welfare view (occupancy vs capacity, overdue inspections, open complaints, hygiene/fire-safety status) and HSE view (incident rates, overdue corrective actions, training/PTW status, heat-stress mid-day-break-window compliance).

**Acceptance Criteria**

- [ ] Given accommodation data, when the dashboard loads, then it shows occupancy compliance, overdue inspections, and open complaints with RAG.
- [ ] Given HSE data, when rendered, then incident frequency, open safety actions, and training/PTW compliance appear.
- [ ] Given a seasonal heat-stress period, when active, then mid-day work-ban / break-window compliance is surfaced for the relevant country.
- [ ] Given an overdue inspection or open high-severity incident, when detected, then it is flagged Red and linkable to corrective action.

**Tasks**

- [ ] Backend: accommodation/welfare and HSE KPI feeds.
- [ ] Frontend: accommodation/welfare dashboard and HSE dashboard with drill-down.
- [ ] Rules/Config: inspection cadence, occupancy limits, heat-stress period/window per country.
- [ ] Alerts/Workflow: raise finding on overdue inspection / high-severity incident.
- [ ] Tests: integration tests for overdue-inspection and incident-rate computation.

**Covers:** 31.15, 31.16
**Dependencies:** EPIC-31-S02

### EPIC-31-S09 — Employee relations, termination/final-settlement & document compliance dashboards

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** employee-relations, termination/final-settlement, and document-compliance dashboards, **so that** I can track grievance SLAs, timely & correct settlements, and employee-file completeness.

**Description**
Three dashboards: employee relations (open grievances, SLA breaches, harassment/retaliation case aging), termination/final settlement (settlement on-time %, EOSB accuracy, pending clearances, immigration-closure status), and document compliance (mandatory-document completeness score, expiring/missing documents, retention overdue).

**Acceptance Criteria**

- [ ] Given grievance data, when the ER dashboard loads, then open cases, SLA breaches, and aging buckets are shown with confidentiality-aware masking.
- [ ] Given separations, when the termination dashboard renders, then final-settlement on-time %, EOSB variance, and pending exit clearances are displayed.
- [ ] Given employee files, when the document dashboard loads, then completeness score, missing mandatory documents, and overdue-retention items appear with drill-down.
- [ ] Given a settlement breaching statutory payment timelines, when detected, then it is flagged Red and a finding can be raised.

**Tasks**

- [ ] Backend: ER, termination/final-settlement, and document KPI feeds (with confidentiality masking on ER).
- [ ] Frontend: three dashboard views with drill-down and masked ER detail.
- [ ] Rules/Config: grievance SLA timelines, settlement statutory window, mandatory-document matrix per country.
- [ ] Alerts/Workflow: raise finding on SLA breach / late settlement / missing mandatory document.
- [ ] Tests: integration tests for completeness score and settlement-timeliness flagging.

**Covers:** 31.17, 31.18, 31.19
**Dependencies:** EPIC-31-S02

### EPIC-31-S10 — Compliance risk heatmap

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**As an** Executive / Leadership user, **I want** a compliance risk heatmap, **so that** I can instantly see which domain × country combinations carry the highest compliance risk.

**Description**
A configurable heatmap scoring risk = likelihood × impact per domain and country/entity, colour-graded, with each cell drilling into the findings and KPIs driving its score. Backed by a risk register so heatmap cells trace to recorded risks.

**Acceptance Criteria**

- [ ] Given KPI and findings data, when the heatmap computes, then each domain × country cell shows a graded risk score (likelihood × impact).
- [ ] Given a heatmap cell, when clicked, then it lists the contributing risks, findings, and KPIs.
- [ ] Given a risk's likelihood or impact changes, when recalculated, then the cell colour and overall heatmap update.
- [ ] Given a high-residual-risk cell, when it has no open corrective action, then it is flagged for attention.

**Tasks**

- [ ] Backend: `ComplianceRisk` register (domain, country, likelihood, impact, residualRisk, linkedFindings) and heatmap aggregation service.
- [ ] Frontend: interactive heatmap grid with drill-into-cell panel.
- [ ] Rules/Config: likelihood/impact scales and risk-band thresholds.
- [ ] Tests: unit tests for risk scoring; e2e for cell drill-down.

**Covers:** 31.20
**Dependencies:** EPIC-31-S02

### EPIC-31-S11 — Corrective action tracking & sample corrective-action register

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** closed-loop corrective-action tracking with a register, **so that** every compliance finding is owned, SLA-tracked, and closed with evidence.

**Description**
A CAPA module: findings (raised from any dashboard or review) become corrective actions with owner, due date, severity, root cause, status, and evidence. SLA-driven escalation on overdue items, and a configurable digital "Corrective Action Register" with export matching the handbook sample.

**Acceptance Criteria**

- [ ] Given a finding, when a corrective action is created, then it captures owner, severity, due date, root cause, and links to the source finding/risk.
- [ ] Given an action past its due date, when the SLA job runs, then it escalates to the owner's manager and is flagged overdue on dashboards.
- [ ] Given an action moved to Closed, when saved, then closure requires evidence and a verifier, and the change is audit-logged.
- [ ] Given the register, when exported, then it matches the sample layout (ID, finding, owner, due, status, closure date) and respects RBAC.

**Tasks**

- [ ] Backend: `CorrectiveAction` schema (sourceFindingId, owner, severity, dueDate, rootCause, status, evidenceRefs, verifier).
- [ ] Backend: SLA/escalation job and closure-validation service.
- [ ] Frontend: corrective-action board/list, action detail with evidence upload, and register export.
- [ ] Alerts/Workflow: overdue escalation and assignment notifications.
- [ ] Rules/Config: SLA windows by severity.
- [ ] Tests: unit tests for SLA/escalation; e2e for create→close-with-evidence flow.

**Covers:** 31.21, 31.29
**Dependencies:** EPIC-31-S02

### EPIC-31-S12 — Management certification, monthly compliance pack & monthly certificate

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 8
**As an** Executive / Leadership user, **I want** to certify compliance and auto-generate the monthly compliance pack and certificate, **so that** there is signed, archived evidence of management oversight.

**Description**
Period-end certification: management attests to the compliance posture, with a configurable Monthly HR Compliance Certificate and an auto-assembled Monthly HR Compliance Pack (scorecard, domain summaries, heatmap, open corrective actions). E-sign routing and immutable archival.

**Acceptance Criteria**

- [ ] Given a closed period, when certification is initiated, then the system assembles the pack (scorecard, heatmap, domain dashboards, open actions) for that period and entity.
- [ ] Given a certifier, when they review and sign, then the certificate captures signatory, role, date, and a content hash, and is locked.
- [ ] Given unresolved Red items, when certifying, then the certifier must explicitly acknowledge them with comments.
- [ ] Given a generated certificate/pack, when exported, then it matches the sample layouts and is stored immutably with audit trail.

**Tasks**

- [ ] Backend: `ComplianceCertification` and `CompliancePack` schema (period, entity, contents, signatory, hash, lockedAt).
- [ ] Backend: pack-assembly service and certificate generation from configurable templates.
- [ ] Frontend: certification workflow screen with pack preview and acknowledgements.
- [ ] Alerts/Workflow: e-sign routing and certification-due reminders.
- [ ] Tests: integration test for pack assembly; e2e for sign-and-lock with content hash.

**Covers:** 31.22, 31.27, 31.30
**Dependencies:** EPIC-31-S02, EPIC-31-S10, EPIC-31-S11

### EPIC-31-S13 — Compliance review calendar & audit controls

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a compliance review calendar with embedded audit controls, **so that** reviews happen on schedule and the control framework itself is testable.

**Description**
A calendar of recurring compliance reviews/certifications per domain and country that auto-creates review tasks, links to required dashboards, and records outcomes. Plus a control-register that maps each compliance control to its owner, frequency, test method, and last-tested status for internal audit.

**Acceptance Criteria**

- [ ] Given a recurring review schedule, when a review date arrives, then a review task is auto-created and assigned with links to the relevant dashboards.
- [ ] Given a completed review, when recorded, then outcome, findings, and certification status are captured and feed corrective action.
- [ ] Given the audit-controls register, when an auditor opens it, then each control shows owner, frequency, test method, last-tested date, and pass/fail.
- [ ] Given a control overdue for testing, when the calendar runs, then it is flagged and escalated.

**Tasks**

- [ ] Backend: `ComplianceReviewSchedule`, `ReviewInstance`, and `ComplianceControl` register schema.
- [ ] Backend: scheduler job creating review tasks and overdue-control flags.
- [ ] Frontend: review calendar view and audit-controls register screen.
- [ ] Alerts/Workflow: review-due and control-overdue notifications.
- [ ] Tests: unit tests for schedule generation; integration for review→finding linkage.

**Covers:** 31.23, 31.24
**Dependencies:** EPIC-31-S11

### EPIC-31-S14 — Compliance automation design & dashboard access control

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** the compliance-automation data pipeline and RBAC-based dashboard access control, **so that** dashboards refresh reliably from source domains and only authorised users see permitted data.

**Description**
Defines the automation architecture (event-driven ingestion from domain epics via the event bus, scheduled refresh jobs, KPI computation pipeline) and the access-control model (role + country + legal-entity scoping for every dashboard, KPI, and export), with full audit logging of access.

**Acceptance Criteria**

- [ ] Given a domain event (e.g. WPS rejection, visa expiry), when published to the event bus, then the relevant KPI is refreshed within the configured SLA and timestamped.
- [ ] Given a scheduled refresh, when it runs or fails, then success/failure and freshness are visible and alerting fires on stale data.
- [ ] Given a user role, when they open a dashboard, then RBAC scopes visible entities/countries/KPIs and hides unauthorised exports.
- [ ] Given any dashboard view or export, when performed, then it is captured in the audit trail with user, scope, and timestamp.

**Tasks**

- [ ] Backend: event-bus consumers and scheduled refresh jobs feeding the KPI store; freshness tracking.
- [ ] Backend: RBAC policy enforcement (role × country × entity) across dashboard/KPI/export APIs.
- [ ] Frontend: data-freshness/health indicator and access-scoped rendering.
- [ ] Alerts/Workflow: stale-data and refresh-failure alerts.
- [ ] Rules/Config: access-policy matrix and refresh SLAs.
- [ ] Tests: integration tests for event-driven refresh; security tests for RBAC scoping and audit logging.

**Covers:** 31.25, 31.26
**Dependencies:** EPIC-31-S01

### EPIC-31-S15 — Compliance dashboard key takeaways & adoption guide

**Labels:** `user-story`, `analytics` · **Priority:** Could · **Estimate:** 1
**As an** HR Manager, **I want** an in-product key-takeaways/help layer for the compliance dashboards, **so that** users understand how to read RAG status, act on findings, and certify.

**Description**
A lightweight, configurable in-app guidance panel summarising the chapter's key takeaways (what each dashboard means, how RAG/scoring works, the corrective-action and certification loop), surfaced contextually on each dashboard.

**Acceptance Criteria**

- [ ] Given a dashboard, when the help panel is opened, then it shows that dashboard's purpose, RAG meaning, and recommended actions.
- [ ] Given the key-takeaways content, when updated by an admin, then changes are versioned and reflected without code change.
- [ ] Given a first-time user, when they land on the executive dashboard, then a short guided overview is offered.

**Tasks**

- [ ] Backend: configurable `DashboardGuidance` content store (versioned).
- [ ] Frontend: contextual help/takeaways panel and first-time overview.
- [ ] Tests: unit test for guidance versioning; e2e for help-panel display.

**Covers:** 31.31
**Dependencies:** EPIC-31-S03
