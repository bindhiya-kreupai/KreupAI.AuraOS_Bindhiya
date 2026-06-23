# EPIC-16: Chapter 16 – Emiratisation Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 16 – Emiratisation Compliance
> **Module:** Nationalization · **Labels:** `epic`, `gcc-compliance`, `nationalization`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a configurable Emiratisation compliance engine in AuraOS that computes UAE-national targets against the correct skilled-workforce denominator, tracks mid-year and year-end MOHRE checkpoints, and surfaces Nafis subsidy and non-compliance fine exposure in real time. The platform must cross-check GPSSA, payroll and WPS data to detect fake/artificial Emiratisation, drive UAE-national recruitment, onboarding, retention and training, and produce a defensible monthly evidence pack, certificate, gap register and fake-Emiratisation risk register.

## Business Value

Avoids AED 7,000/month-per-shortfall MOHRE fines and Tawteen escalations, protects company classification and work-permit privileges, captures Nafis incentives the company is entitled to, and proves "genuine" national employment to auditors. Automates target math and checkpoint alerts that are otherwise error-prone in spreadsheets, and gives leadership an audit-ready Emiratisation position at any point in the year.

## Requirements Covered (handbook sections)

- 16.1 Introduction
- 16.2 Purpose of Emiratisation
- 16.3 Regulatory Authority and Key Platforms
- 16.4 Emiratisation Applicability
- 16.5 Emiratisation Target Management
- 16.6 Mid-Year and Year-End Compliance
- 16.7 Financial Contributions and Penalty Risk
- 16.8 Fake Emiratisation
- 16.9 UAE National Recruitment Strategy
- 16.10 Job Design for Emiratisation
- 16.11 UAE National Onboarding Controls
- 16.12 GPSSA and Emiratisation Alignment
- 16.13 Payroll and WPS Evidence
- 16.14 Retention of UAE National Employees
- 16.15 Training and Development
- 16.16 Emiratisation Workforce Planning
- 16.17 Emiratisation Audit Checklist
- 16.18 Emiratisation KPIs
- 16.19 Emiratisation Risk Matrix
- 16.20 HRMS Emiratisation Automation Design
- 16.21 Emiratisation Dashboard
- 16.22 Emiratisation Evidence Pack
- 16.23 Sample Emiratisation Monthly Compliance Certificate
- 16.24 Sample Emiratisation Gap Register
- 16.25 Sample Fake Emiratisation Risk Register
- 16.26 Key Takeaways

## Out of Scope

- Direct write-back integration to MOHRE/Tawteen and Nafis portals (read/evidence and manual submission only; API automation is a later epic).
- Full payroll calculation engine (consumed from EPIC-10) and WPS file generation internals (consumed from EPIC-11).
- GPSSA contribution calculation internals (consumed from EPIC-14); this epic only consumes/reconciles GPSSA registration and salary data.
- Generic recruitment ATS workflow (owned by EPIC-04); only the Emiratisation-specific overlays are in scope.

## Dependencies

- EPIC-02 (Country Rule Engine), EPIC-03 (Workforce Planning), EPIC-04 (Recruitment), EPIC-06 (Onboarding), EPIC-10 (Payroll), EPIC-11 (WPS), EPIC-14 (GPSSA), EPIC-31 (Compliance Dashboard)

## Epic Definition of Done

- [ ] Emiratisation applicability and target rules are fully configurable per legal entity/sector in the country rule engine with effective-dated thresholds.
- [ ] Skilled-workforce denominator and UAE-national numerator compute automatically each cycle with full calculation traceability.
- [ ] Mid-year (Jun/Jul) and year-end (Dec/Jan) checkpoints raise tiered alerts and lock an evidence snapshot.
- [ ] Nafis subsidy and MOHRE non-compliance fine exposure are projected and shown on the dashboard.
- [ ] Fake-Emiratisation detection runs GPSSA + payroll + WPS cross-checks and populates a risk register.
- [ ] Monthly certificate, gap register, fake-Emiratisation risk register and evidence pack export to PDF/Excel with audit trail.
- [ ] KPIs, dashboard, audit checklist and risk matrix are live, RBAC-restricted and reconcile to source data.

---

## User Stories

### EPIC-16-S01 — Emiratisation overview, purpose & regulatory framework knowledge base

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** an in-product Emiratisation reference covering its purpose, governing authority and key platforms, **so that** HR teams act on a single authoritative source instead of scattered circulars.

**Description**
A configurable, versioned knowledge module rendering Chapter 16 intro/purpose content and a registry of authorities and platforms (MOHRE, Tawteen Gate / Tawteen Partners Club, Nafis, GPSSA, WPS). Each entry links to the AuraOS feature that operationalises it and is country-tagged so non-UAE entities are filtered out.

**Acceptance Criteria**

- [ ] Given a UAE legal entity, when a user opens the Emiratisation module, then intro and purpose content render with a "last reviewed" version stamp.
- [ ] Given the authority registry, when displayed, then MOHRE, Tawteen, Nafis, GPSSA and WPS are listed with role, platform URL and the linked AuraOS feature.
- [ ] Given a non-UAE entity context, when the module loads, then Emiratisation content is hidden/disabled per country scope.
- [ ] Given a content edit, when saved, then the prior version is retained and the change is written to the audit trail with editor and timestamp.

**Tasks**

- [ ] Backend: `nationalization_reference` entity (`countryCode`, `section`, `title`, `body`, `version`, `lastReviewedAt`, `authorityRefs[]`).
- [ ] Backend: `nationalization_authority` entity (`code`, `name`, `role`, `portalUrl`, `linkedFeature`, `countryCode`).
- [ ] Frontend: Emiratisation reference screen with authority registry cards and version badge.
- [ ] Rules/Config: country scope filter (`UAE`) gating module visibility.
- [ ] Tests: unit tests for country gating and version retention.

**Covers:** 16.1, 16.2, 16.3
**Dependencies:** EPIC-02

### EPIC-16-S02 — Emiratisation applicability determination

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** AuraOS to determine whether each legal entity is in-scope for Emiratisation and at what threshold, **so that** we only chase targets where the law actually applies.

**Description**
A rules-driven applicability engine evaluating entity attributes (sector, private/semi-government, total headcount, skilled-worker count) against configurable MOHRE applicability bands (e.g., private firms with 50+ employees subject to annual skilled-Emiratisation growth; smaller-firm targeted-sector rules). Output is an effective-dated applicability record per entity per period.

**Acceptance Criteria**

- [ ] Given an entity with ≥50 skilled employees, when applicability runs, then it is flagged in-scope with the applicable annual growth target band.
- [ ] Given a sub-threshold entity in a targeted sector, when applicability runs, then the targeted-sector rule is applied and the basis is recorded.
- [ ] Given a headcount change crossing the threshold mid-year, when recalculated, then applicability is re-evaluated and an alert is raised to Compliance.
- [ ] Given any determination, then inputs, matched rule version and result are stored for audit.
- [ ] Given RBAC, then only Compliance/HR Manager roles can override an applicability result, with reason captured.

**Tasks**

- [ ] Backend: `emiratisation_applicability` entity (`entityId`, `period`, `inScope`, `thresholdBand`, `basis`, `ruleVersion`, `overrideReason`).
- [ ] Backend: applicability evaluation service consuming headcount/skilled-worker counts.
- [ ] Frontend: applicability panel with in-scope flag, basis and override action.
- [ ] Rules/Config: configurable applicability bands (headcount thresholds, sector lists) per country.
- [ ] Alerts/Workflow: threshold-crossing alert to Compliance.
- [ ] Tests: integration tests across threshold and targeted-sector scenarios.

**Covers:** 16.4
**Dependencies:** EPIC-02, EPIC-03

### EPIC-16-S03 — Target calculation against skilled-workforce denominator

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** the system to compute the required number of UAE nationals against the skilled-workforce denominator, **so that** I always know the exact target and current gap.

**Description**
The core target engine. It builds the denominator (skilled-category employees per MOHRE skill-level rules), the numerator (eligible counted UAE nationals), and computes required count, current count, achievement % and headcount gap. Targets/rates are configurable per country and per period in the rule engine (e.g., +2% skilled-national growth per year, fractional rounding rules).

**Acceptance Criteria**

- [ ] Given an in-scope entity, when target runs, then denominator = skilled employees per configured skill-level classification, excluding non-counting categories.
- [ ] Given the configured growth rate and rounding rule, when computed, then required UAE-national count and the gap (required − current) are produced.
- [ ] Given a fractional requirement, when rounded, then the configured rounding rule (e.g., round up at 0.5) is applied and shown.
- [ ] Given a recalculation, then numerator/denominator membership lists are persisted so any number can be drilled to employee level.
- [ ] Given country config, then target rate and denominator definition are read from the rule engine, not hard-coded.

**Tasks**

- [ ] Backend: `emiratisation_target` entity (`entityId`, `period`, `denominator`, `requiredCount`, `currentCount`, `gap`, `achievementPct`, `ruleVersion`).
- [ ] Backend: denominator/numerator builder with skilled-category classification logic.
- [ ] Backend: target calculation service with configurable rate + rounding.
- [ ] Frontend: target summary card with drill-down to counted-employee lists.
- [ ] Rules/Config: per-country growth rate, denominator definition, rounding rule.
- [ ] Tests: unit tests for rounding/edge cases; golden-file test of denominator membership.

**Covers:** 16.5
**Dependencies:** EPIC-02, EPIC-03

### EPIC-16-S04 — Mid-year and year-end compliance checkpoints

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** automated mid-year and year-end checkpoint tracking with escalating alerts, **so that** we never miss a MOHRE compliance date and can act before penalties trigger.

**Description**
Configurable checkpoint calendar (mid-year and year-end statutory dates) that, at each checkpoint, snapshots the target/achievement position, evaluates pass/shortfall, and raises tiered alerts at 90/60/30/7 days before the date. A locked, immutable snapshot is stored as evidence at each checkpoint.

**Acceptance Criteria**

- [ ] Given the configured checkpoint dates, when 90/60/30/7 days remain, then tiered alerts go to Compliance/HR Manager/Executive per escalation rules.
- [ ] Given a checkpoint date is reached, when processed, then an immutable snapshot of denominator, target, current count and gap is stored.
- [ ] Given a shortfall at a checkpoint, when detected, then the gap and projected fine exposure are flagged and a corrective action is auto-created.
- [ ] Given a passed checkpoint, then the snapshot is marked compliant and linked to the evidence pack.
- [ ] Given checkpoint dates change by regulation, then they are updated in config without code change.

**Tasks**

- [ ] Backend: `emiratisation_checkpoint` entity (`entityId`, `period`, `checkpointType`, `dueDate`, `snapshotId`, `status`).
- [ ] Backend: checkpoint scheduler + immutable snapshot writer (event-bus driven).
- [ ] Frontend: checkpoint timeline with status and countdown.
- [ ] Rules/Config: configurable checkpoint calendar and 90/60/30/7-day alert tiers.
- [ ] Alerts/Workflow: escalating notifications + auto corrective-action creation on shortfall.
- [ ] Tests: scheduler tests for alert tiers and snapshot immutability.

**Covers:** 16.6
**Dependencies:** EPIC-02

### EPIC-16-S05 — Nafis contributions, fines & financial exposure projection

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** Executive, **I want** projected Nafis subsidy entitlement and MOHRE non-compliance fine exposure, **so that** I understand the financial stakes of the current Emiratisation position.

**Description**
A financial model that, from the gap and counted nationals, computes (a) MOHRE non-compliance fines for shortfall (configurable per-shortfall monthly amount with annual escalation) and (b) Nafis subsidy entitlement/risk for counted nationals. Outputs feed the dashboard and certificate.

**Acceptance Criteria**

- [ ] Given a shortfall of N nationals, when projected, then monthly and annualised fine exposure = N × configured rate (with year-on-year escalation) is shown.
- [ ] Given counted nationals on Nafis-eligible terms, when computed, then projected subsidy is shown with eligibility caveats.
- [ ] Given a salary below a Nafis/registration threshold, when detected, then the national is flagged as at-risk of non-counting/clawback.
- [ ] Given config changes to rates, then projections recompute without code change and the rate version is recorded.
- [ ] Given RBAC, then financial-exposure figures are visible only to Compliance/Finance/Executive roles.

**Tasks**

- [ ] Backend: `emiratisation_financials` entity (`entityId`, `period`, `fineExposureMonthly`, `fineExposureAnnual`, `nafisProjected`, `rateVersion`).
- [ ] Backend: exposure projection service consuming gap + counted-national data.
- [ ] Frontend: financial-exposure widget with fine vs. subsidy breakdown.
- [ ] Rules/Config: per-country fine rate, escalation schedule, Nafis parameters and salary thresholds.
- [ ] Tests: unit tests for fine escalation and subsidy edge cases.

**Covers:** 16.7
**Dependencies:** EPIC-02, EPIC-10

### EPIC-16-S06 — Fake/artificial Emiratisation detection (GPSSA + payroll + WPS cross-checks)

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 13
**As a** Compliance Officer, **I want** automated detection of fake/artificial Emiratisation by cross-checking GPSSA, payroll and WPS, **so that** we never count ghost or non-genuine nationals and avoid Tawteen blacklisting.

**Description**
A red-flag engine scoring each counted UAE national for genuineness using cross-source signals: GPSSA registration present and salary-matched, WPS shows an actual monthly wage transfer to the employee's account, payroll shows a real salary consistent with role/grade, attendance/active status, and no clustering anomalies (e.g., many nationals registered same day, identical low salaries, no system access). Flags feed the fake-Emiratisation risk register (S20).

**Acceptance Criteria**

- [ ] Given a counted national with no matching GPSSA registration, when scanned, then a high-severity fake-Emiratisation flag is raised.
- [ ] Given a national whose WPS transfer is absent or far below declared payroll salary, when scanned, then a flag with the variance is raised.
- [ ] Given multiple nationals onboarded the same day with identical near-minimum salaries and no attendance, when detected, then a clustering/ghost-employment pattern flag is raised.
- [ ] Given each flag, then a risk score, evidence references (GPSSA/payroll/WPS records) and a recommended action are stored.
- [ ] Given a resolved/false-positive flag, then dispositioning with reason and approver is captured in the audit trail.
- [ ] Given country config, then detection thresholds (variance %, cluster size) are configurable.

**Tasks**

- [ ] Backend: `fake_nationalization_flag` entity (`employeeId`, `countryCode`, `signalType`, `severity`, `score`, `evidenceRefs[]`, `status`, `disposition`).
- [ ] Backend: cross-source reconciliation service joining GPSSA registration, payroll salary and WPS transfer data.
- [ ] Backend: anomaly/clustering rules (same-day onboarding, identical salary, no attendance/access).
- [ ] Frontend: detection results screen with evidence drill-down and disposition action.
- [ ] Rules/Config: configurable variance/cluster thresholds and severity mapping per country.
- [ ] Alerts/Workflow: high-severity flags routed to Compliance for investigation.
- [ ] Tests: integration tests covering missing-GPSSA, WPS-variance and clustering scenarios.

**Covers:** 16.8
**Dependencies:** EPIC-10, EPIC-11, EPIC-14

### EPIC-16-S07 — UAE national recruitment strategy & pipeline overlay

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** an Emiratisation recruitment overlay on the ATS with Tawteen/Nafis sourcing and a national-candidate pipeline, **so that** we close the gap with genuine hires.

**Description**
Adds UAE-national tagging, a dedicated national-candidate pipeline, Nafis/Tawteen sourcing channels, and gap-driven requisition targeting to the recruitment flow. Open requisitions can be flagged "Emiratisation priority" and linked to the current gap.

**Acceptance Criteria**

- [ ] Given an open gap, when requisitions are created, then HR can flag roles as Emiratisation-priority and link them to the gap target.
- [ ] Given a national candidate, when sourced, then channel (Nafis/Tawteen/referral) and eligibility are tagged for later evidence.
- [ ] Given the pipeline view, then national candidates by stage and the projected impact on the gap are shown.
- [ ] Given a national hire, then the gap and target dashboards update on the next recalculation.
- [ ] Given RBAC, then recruiters see only their entity's national pipeline.

**Tasks**

- [ ] Backend: extend candidate/requisition with `isUaeNational`, `sourcingChannel`, `emiratisationPriority`, `linkedGapTargetId`.
- [ ] Backend: pipeline aggregation service for national candidates vs. gap.
- [ ] Frontend: Emiratisation recruitment board with gap-impact indicator.
- [ ] Rules/Config: configurable sourcing channel list (Nafis, Tawteen, referral).
- [ ] Tests: integration test linking a national hire to gap reduction.

**Covers:** 16.9
**Dependencies:** EPIC-04

### EPIC-16-S08 — Job design for Emiratisation

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**As an** HR Manager, **I want** to design and tag Emiratisation-suitable positions with genuine job content, **so that** counted roles are real, skilled and defensible.

**Description**
Position-management overlay marking roles as Emiratisation-target with required skill level, genuine duties, grade and salary band aligned to counting/Nafis thresholds. Prevents counting against artificially designed or below-threshold "shell" roles.

**Acceptance Criteria**

- [ ] Given a position, when designed for Emiratisation, then skill level, duties, grade and salary band are captured and validated against counting/Nafis thresholds.
- [ ] Given a salary band below the counting/subsidy threshold, when saved, then a warning is shown and the role is flagged non-counting-risk.
- [ ] Given a target position, when linked to a national hire, then it contributes to the numerator only if genuineness criteria are met.
- [ ] Given changes to a target position, then changes are versioned and audited.

**Tasks**

- [ ] Backend: extend `position` with `emiratisationTarget`, `skillLevel`, `genuineDutiesText`, `salaryBandRef`.
- [ ] Backend: validation service against counting/Nafis salary thresholds.
- [ ] Frontend: job-design panel with threshold warnings.
- [ ] Rules/Config: configurable salary/skill thresholds for counting.
- [ ] Tests: validation tests for below-threshold roles.

**Covers:** 16.10
**Dependencies:** EPIC-09

### EPIC-16-S09 — UAE national onboarding controls

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** Emiratisation-specific onboarding controls that enforce GPSSA registration, WPS-eligible bank setup and document capture at joining, **so that** every counted national is genuinely employed from day one.

**Description**
An onboarding checklist overlay for UAE nationals enforcing mandatory steps — Emirates ID/family book, GPSSA registration trigger, WPS-compliant bank account, contract on MOHRE terms, Nafis registration where applicable — and blocking "counted" status until controls pass.

**Acceptance Criteria**

- [ ] Given a UAE-national new hire, when onboarding starts, then the Emiratisation checklist (GPSSA, WPS bank, Emirates ID, contract, Nafis) is enforced.
- [ ] Given any mandatory onboarding control is incomplete, when the national would be counted, then counting is blocked and the reason is shown.
- [ ] Given GPSSA registration is initiated, then the linkage is recorded for later reconciliation (S11).
- [ ] Given completion, then a "genuine onboarding" evidence record is created and added to the evidence pack.
- [ ] Given audit, then each control's completion is timestamped and attributed.

**Tasks**

- [ ] Backend: `emiratisation_onboarding_control` entity (`employeeId`, `controlType`, `status`, `evidenceRef`, `completedAt`).
- [ ] Backend: counting-gate service that blocks numerator inclusion until controls pass.
- [ ] Frontend: national onboarding checklist with blocking states.
- [ ] Rules/Config: configurable mandatory control set per country.
- [ ] Alerts/Workflow: incomplete-control reminders to HR Admin.
- [ ] Tests: e2e test that incomplete controls block counting.

**Covers:** 16.11
**Dependencies:** EPIC-06, EPIC-14

### EPIC-16-S10 — GPSSA & Emiratisation alignment / reconciliation

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** counted UAE nationals reconciled against GPSSA registrations and contribution salaries, **so that** the numerator matches what the pension authority sees.

**Description**
A reconciliation engine matching each counted national to a GPSSA record, comparing contribution-account salary vs. payroll salary, and flagging unregistered, salary-mismatched or de-registered nationals. Feeds both the genuineness score (S06) and the gap register.

**Acceptance Criteria**

- [ ] Given counted nationals, when reconciled, then each is matched to a GPSSA registration or flagged "not registered."
- [ ] Given a GPSSA contribution salary differing from payroll salary beyond tolerance, when detected, then a variance flag with amounts is raised.
- [ ] Given a GPSSA de-registration, when detected, then the national is removed from the numerator and a checkpoint alert is raised.
- [ ] Given reconciliation results, then they are exportable and linked to the evidence pack and fake-Emiratisation engine.
- [ ] Given tolerance config, then the salary-match tolerance is configurable per country.

**Tasks**

- [ ] Backend: GPSSA reconciliation service joining numerator to GPSSA registration/contribution data.
- [ ] Backend: `emiratisation_gpssa_recon` entity (`employeeId`, `gpssaStatus`, `gpssaSalary`, `payrollSalary`, `variance`, `flag`).
- [ ] Frontend: reconciliation grid with variance highlights.
- [ ] Rules/Config: configurable salary-match tolerance.
- [ ] Tests: integration tests for unregistered/mismatch/de-registration cases.

**Covers:** 16.12
**Dependencies:** EPIC-14

### EPIC-16-S11 — Payroll & WPS evidence linkage

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** Internal Auditor, **I want** payroll and WPS wage-transfer evidence linked to each counted national, **so that** I can prove genuine, on-time salary payment to UAE nationals.

**Description**
Links each counted national to monthly payroll records and WPS wage-file transfer confirmations, flags salary delays (> statutory window), missing transfers, and salary < declared, and assembles the wage-evidence section of the monthly pack.

**Acceptance Criteria**

- [ ] Given a counted national, when the month closes, then payroll net pay and the corresponding WPS transfer are linked as evidence.
- [ ] Given a salary delay > 15 days or a missing WPS transfer, when detected, then a wage-evidence exception is raised.
- [ ] Given WPS amount < declared payroll salary beyond tolerance, when detected, then a variance flag is raised and fed to fake-Emiratisation detection.
- [ ] Given the monthly pack, then per-national wage evidence is included with transfer reference and date.
- [ ] Given audit, then evidence links are immutable once the period is locked.

**Tasks**

- [ ] Backend: `emiratisation_wage_evidence` entity (`employeeId`, `period`, `payrollNet`, `wpsAmount`, `wpsTransferRef`, `transferDate`, `exceptionFlag`).
- [ ] Backend: payroll/WPS linkage service with delay and variance detection.
- [ ] Frontend: wage-evidence view per national and per period.
- [ ] Rules/Config: configurable salary-delay window and variance tolerance.
- [ ] Tests: integration tests for delay/missing/variance scenarios.

**Covers:** 16.13
**Dependencies:** EPIC-10, EPIC-11

### EPIC-16-S12 — Retention of UAE national employees

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5
**As an** HR Manager, **I want** to monitor UAE-national retention risk and tenure, **so that** we keep counted nationals and avoid losing target achievement and Nafis support.

**Description**
A retention module tracking national tenure, attrition, flight-risk indicators and Nafis-linked tenure commitments, alerting when a counted national resigns or trips a risk indicator, and quantifying the gap/financial impact of attrition.

**Acceptance Criteria**

- [ ] Given national employees, when tenure/attrition is computed, then national attrition rate and at-risk nationals are shown.
- [ ] Given a counted national submits resignation, when recorded, then the projected gap impact and fine/subsidy effect are surfaced.
- [ ] Given a Nafis tenure commitment, when at risk of breach, then an alert is raised.
- [ ] Given retention actions, then interventions are logged and linked to the employee.
- [ ] Given RBAC, then retention-risk data is restricted to HR Manager/Compliance.

**Tasks**

- [ ] Backend: national retention analytics service (tenure, attrition, flight-risk).
- [ ] Backend: `emiratisation_retention_event` entity (`employeeId`, `eventType`, `gapImpact`, `financialImpact`).
- [ ] Frontend: retention-risk panel with at-risk list.
- [ ] Alerts/Workflow: resignation/risk alerts to HR Manager.
- [ ] Tests: unit tests for gap-impact calculation on attrition.

**Covers:** 16.14
**Dependencies:** EPIC-03

### EPIC-16-S13 — Training & development for UAE nationals

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**As an** HR Manager, **I want** to plan and track training/development for UAE nationals, **so that** development obligations and Nafis upskilling expectations are evidenced.

**Description**
Captures development plans, training completion and competency progression for counted nationals, linking to onboarding and retention, and producing a training-evidence section for the pack.

**Acceptance Criteria**

- [ ] Given a counted national, when a development plan is created, then training items, target dates and status are tracked.
- [ ] Given completed training, then completion records and certificates are stored as evidence.
- [ ] Given overdue mandatory training, when detected, then a reminder is raised.
- [ ] Given the evidence pack, then a training-and-development summary per national is included.

**Tasks**

- [ ] Backend: `national_development_plan` entity (`employeeId`, `items[]`, `status`, `evidenceRefs[]`).
- [ ] Frontend: development-plan view with completion tracking.
- [ ] Alerts/Workflow: overdue-training reminders.
- [ ] Tests: unit tests for overdue detection.

**Covers:** 16.15
**Dependencies:** EPIC-06

### EPIC-16-S14 — Emiratisation workforce planning

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5
**As an** Executive, **I want** multi-period Emiratisation workforce planning that projects future targets vs. planned national hires/attrition, **so that** we plan ahead instead of reacting at checkpoints.

**Description**
A forward-looking planner that projects target growth across upcoming years, models planned national hires, attrition and headcount growth, and shows the projected gap and fine exposure per future period so leadership can fund the right hiring plan.

**Acceptance Criteria**

- [ ] Given current state and growth assumptions, when projected, then required nationals and gap are forecast for the next 1–3 years.
- [ ] Given planned hires and attrition, when modelled, then the projected achievement % and residual gap per period are shown.
- [ ] Given a scenario, when saved, then it can be compared against the baseline.
- [ ] Given a projected shortfall, then the projected fine exposure is shown to support budgeting.

**Tasks**

- [ ] Backend: `emiratisation_plan_scenario` entity (`entityId`, `horizon`, `assumptions`, `projectedGap[]`, `projectedExposure[]`).
- [ ] Backend: projection engine over denominator growth + hire/attrition assumptions.
- [ ] Frontend: scenario planner with baseline vs. scenario comparison.
- [ ] Rules/Config: configurable growth-rate assumptions per period.
- [ ] Tests: unit tests for multi-period projection math.

**Covers:** 16.16
**Dependencies:** EPIC-03

### EPIC-16-S15 — Emiratisation audit checklist & red-flag controls

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 3
**As an** Internal Auditor, **I want** a configurable Emiratisation audit checklist with automated red-flag controls, **so that** I can verify compliance and genuineness consistently.

**Description**
A digital, configurable checklist covering target accuracy, denominator correctness, GPSSA/WPS/payroll evidence completeness, onboarding controls and fake-Emiratisation flags, with auto-evaluated items pulling live data and manual sign-off items.

**Acceptance Criteria**

- [ ] Given an audit cycle, when the checklist runs, then auto-evaluated items (e.g., "every counted national has GPSSA + WPS evidence") return pass/fail with drill-down.
- [ ] Given a failed control, when raised, then a corrective action is created and tracked to closure.
- [ ] Given manual items, then auditors record outcome, comments and evidence.
- [ ] Given completion, then a signed checklist is archived in the evidence pack.
- [ ] Given config, then checklist items and thresholds are editable per country.

**Tasks**

- [ ] Backend: `emiratisation_audit_checklist` + `checklist_item` entities with auto/manual evaluation flags.
- [ ] Backend: auto-evaluation service binding items to live data signals.
- [ ] Frontend: checklist runner with pass/fail and sign-off.
- [ ] Alerts/Workflow: corrective-action creation on failure.
- [ ] Tests: integration tests for auto-evaluated items.

**Covers:** 16.17
**Dependencies:** EPIC-31

### EPIC-16-S16 — Emiratisation KPIs

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**As an** Executive, **I want** Emiratisation KPIs computed from live data, **so that** I can track performance against target over time.

**Description**
A KPI service computing achievement %, gap, national headcount, national attrition, time-to-fill national roles, % counted nationals with full evidence, and fake-Emiratisation flag count — all per entity and consolidated, period-comparable.

**Acceptance Criteria**

- [ ] Given a period, when KPIs compute, then achievement %, gap, national headcount, national attrition and evidence-completeness % are produced.
- [ ] Given multiple entities, then KPIs roll up to a consolidated view and drill back to entity.
- [ ] Given period-over-period, then trend deltas are shown.
- [ ] Given each KPI, then its definition and source are documented in-product.

**Tasks**

- [ ] Backend: KPI aggregation service with period snapshots.
- [ ] Backend: `emiratisation_kpi_snapshot` entity.
- [ ] Frontend: KPI tiles with trend indicators.
- [ ] Tests: unit tests for KPI formulas.

**Covers:** 16.18
**Dependencies:** EPIC-31

### EPIC-16-S17 — Emiratisation risk matrix

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** a configurable Emiratisation risk matrix scoring likelihood × impact, **so that** I can prioritise mitigation of the biggest compliance risks.

**Description**
A configurable risk register/matrix capturing Emiratisation risks (shortfall at checkpoint, fake-Emiratisation exposure, national attrition, evidence gaps) with likelihood, impact, owner, mitigation and residual risk, rendered as a heatmap.

**Acceptance Criteria**

- [ ] Given a risk, when scored, then likelihood × impact yields a rating placed on the heatmap.
- [ ] Given mitigations, then residual risk recomputes and is tracked.
- [ ] Given linked data (e.g., open fake-Emiratisation flags), then relevant risks update automatically.
- [ ] Given config, then likelihood/impact scales and thresholds are editable.

**Tasks**

- [ ] Backend: `emiratisation_risk` entity (`title`, `likelihood`, `impact`, `owner`, `mitigation`, `residual`).
- [ ] Frontend: risk matrix heatmap with drill-down.
- [ ] Rules/Config: configurable scales/thresholds.
- [ ] Tests: unit tests for rating/residual calculation.

**Covers:** 16.19
**Dependencies:** EPIC-31

### EPIC-16-S18 — HRMS Emiratisation automation design (rule engine & events)

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** Emiratisation rules, schedules and cross-checks wired into the country rule engine and event bus, **so that** targets, checkpoints and detection run automatically and are fully configurable per country.

**Description**
The automation backbone: event-driven recalculation on hires/exits/payroll close/WPS submission/GPSSA updates, scheduled checkpoint and detection jobs, and all thresholds (targets, fines, tolerances, alert tiers) exposed in the country rule engine with effective dating and versioning. This makes targets/bands configurable per country (UAE here, extensible to others).

**Acceptance Criteria**

- [ ] Given a hire/exit/payroll-close/WPS/GPSSA event, when published, then the relevant Emiratisation recalculation is triggered and audited.
- [ ] Given scheduled jobs, then checkpoint evaluation and fake-Emiratisation detection run on cadence with run logs.
- [ ] Given the rule engine, then targets, fine rates, tolerances and alert tiers are configurable per country and effective-dated.
- [ ] Given a config change, then it versions, is audited, and applies from its effective date without code change.
- [ ] Given a failed job, then it alerts System Admin and is retryable idempotently.

**Tasks**

- [ ] Backend: event consumers for hire/exit/payroll/WPS/GPSSA topics.
- [ ] Backend: scheduled job runners for checkpoints and detection with run-log table.
- [ ] Backend: rule-engine schema for Emiratisation parameters (effective-dated, versioned).
- [ ] Frontend: admin config UI for country Emiratisation parameters.
- [ ] Rules/Config: per-country parameter sets with validation.
- [ ] Tests: integration tests for event-driven recalculation and idempotent retries.

**Covers:** 16.20
**Dependencies:** EPIC-02, EPIC-10, EPIC-11, EPIC-14

### EPIC-16-S19 — Emiratisation dashboard

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** Executive, **I want** an Emiratisation dashboard showing target vs. achievement, gap, checkpoint status, financial exposure and fake-Emiratisation flags, **so that** I see our position at a glance.

**Description**
A consolidated, RBAC-aware dashboard with target/achievement gauge, gap trend, checkpoint countdown, Nafis/fine exposure, evidence-completeness and open fake-Emiratisation flags, filterable by entity and period and drillable to source.

**Acceptance Criteria**

- [ ] Given a UAE entity, when the dashboard loads, then achievement %, gap, checkpoint status and financial exposure render from live data.
- [ ] Given multi-entity, then a consolidated roll-up with per-entity drill-down is available.
- [ ] Given a tile, when clicked, then it drills to underlying employee/evidence records.
- [ ] Given RBAC, then financial and risk tiles respect role visibility.
- [ ] Given a period filter, then all tiles recompute for that period.

**Tasks**

- [ ] Backend: dashboard aggregation API.
- [ ] Frontend: Emiratisation dashboard with gauges, trends, drill-downs.
- [ ] Rules/Config: configurable thresholds for tile colour states (green/amber/red).
- [ ] Tests: e2e test of dashboard data and drill-downs.

**Covers:** 16.21
**Dependencies:** EPIC-31

### EPIC-16-S20 — Emiratisation evidence pack + monthly certificate, gap register & fake-Emiratisation risk register

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** a one-click Emiratisation evidence pack containing the monthly compliance certificate, gap register and fake-Emiratisation risk register, **so that** we are inspection-ready and can certify our position.

**Description**
Assembles a period evidence pack: target calculation with denominator, per-national GPSSA/payroll/WPS evidence, onboarding controls, checkpoint snapshots, audit checklist, KPIs — plus three configurable digital artefacts that export to PDF/Excel: (1) **Monthly Emiratisation Compliance Certificate** (entity, period, denominator, target, achieved, gap, status, authorised signatory), (2) **Emiratisation Gap Register** (per role/department gap, required vs. current, planned action, owner, due date), and (3) **Fake Emiratisation Risk Register** (flagged national, signal type, GPSSA/payroll/WPS evidence, severity, disposition, owner).

**Acceptance Criteria**

- [ ] Given a closed period, when the pack is generated, then it bundles target calc, per-national evidence, checkpoint snapshots, checklist and KPIs into one export.
- [ ] Given the certificate, when produced, then it shows denominator, target, achieved, gap, status and a maker-checker signatory (preparer ≠ approver) with date.
- [ ] Given the gap register, then each gap line shows required vs. current, root cause, planned action, owner and due date, and is editable as a configurable digital form.
- [ ] Given the fake-Emiratisation risk register, then each line links to its detection flag and evidence and records severity, disposition and owner.
- [ ] Given any artefact, then it exports to PDF and Excel and is archived immutably with the audit trail.
- [ ] Given config, then certificate/register fields and layout are configurable per country.

**Tasks**

- [ ] Backend: `emiratisation_evidence_pack`, `emiratisation_certificate`, `emiratisation_gap_register`, `fake_emiratisation_risk_register` entities.
- [ ] Backend: pack assembly service pulling target/evidence/checkpoint/KPI data.
- [ ] Backend: PDF/Excel export service with immutable archival.
- [ ] Frontend: certificate + gap register + fake-Emiratisation risk register as configurable digital forms with export.
- [ ] Alerts/Workflow: maker-checker approval on certificate (preparer ≠ approver).
- [ ] Rules/Config: configurable certificate/register templates per country.
- [ ] Tests: e2e test generating pack and verifying maker-checker + exports.

**Covers:** 16.22, 16.23, 16.24, 16.25
**Dependencies:** EPIC-31

### EPIC-16-S21 — Emiratisation key takeaways & guidance summary

**Labels:** `user-story`, `nationalization` · **Priority:** Could · **Estimate:** 1
**As an** HR Admin, **I want** an in-product key-takeaways summary of Emiratisation obligations and AuraOS controls, **so that** new users quickly understand what good compliance looks like.

**Description**
A concise, versioned summary page distilling Chapter 16 takeaways (genuine employment, evidence-first, checkpoint discipline, fake-Emiratisation avoidance) with links to the relevant AuraOS features and dashboards.

**Acceptance Criteria**

- [ ] Given the module, when a user opens key takeaways, then a summary with deep links to target, evidence, detection and dashboard features renders.
- [ ] Given a content update, then it is versioned and audited.
- [ ] Given country scope, then it shows only for UAE entities.

**Tasks**

- [ ] Backend: reuse `nationalization_reference` for takeaways content.
- [ ] Frontend: key-takeaways page with feature deep links.
- [ ] Tests: smoke test for rendering and links.

**Covers:** 16.26
**Dependencies:** —
