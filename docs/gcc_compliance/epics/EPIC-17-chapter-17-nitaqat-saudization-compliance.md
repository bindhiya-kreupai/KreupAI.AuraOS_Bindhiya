# EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 17 – Nitaqat / Saudization Compliance
> **Module:** Nationalization · **Labels:** `epic`, `gcc-compliance`, `nationalization`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a configurable Saudization/Nitaqat engine in AuraOS that calculates the Saudi workforce ratio against the correct denominator, classifies each entity into Nitaqat bands (Platinum/High-Green/Medium-Green/Low-Green/Yellow/Red), and projects the 2026–2028 direction. It must cross-check Qiwa contracts, GOSI registration and Mudad/payroll wage evidence to detect fake/artificial Saudization, drive Saudi recruitment, retention, profession-localization and workforce planning, and produce the Nitaqat certificate, evidence pack, gap register and artificial-Saudization risk register.

## Business Value

Protects access to Qiwa services (visa quotas, work-permit issuance/renewal, contract authentication) that degrade as the band falls toward Red, captures the operational privileges of higher bands, and prevents the severe penalties and Qiwa blocking that follow artificial Saudization. Automates band math, profession-localization tracking and evidence assembly, giving leadership a forward-looking, audit-ready Saudization position aligned to MHRSD's 2026–2028 tightening.

## Requirements Covered (handbook sections)

- 17.1 Introduction
- 17.2 Purpose of Saudization
- 17.3 Regulatory Authority and Key Platforms
- 17.4 Nitaqat Program Overview
- 17.5 2026–2028 Nitaqat Direction
- 17.6 Nitaqat Applicability
- 17.7 Saudi Workforce Calculation
- 17.8 Qiwa Contract Documentation Requirement
- 17.9 GOSI Linkage
- 17.10 Payroll and Mudad Evidence
- 17.11 Job Classification and Profession Localization
- 17.12 Saudization Workforce Planning
- 17.13 Saudi National Recruitment Strategy
- 17.14 Retention of Saudi Employees
- 17.15 Fake or Artificial Saudization Risk
- 17.16 Nitaqat Certificate and Business Use
- 17.17 Nitaqat Audit Checklist
- 17.18 Nitaqat KPIs
- 17.19 Nitaqat Risk Matrix
- 17.20 HRMS Nitaqat Automation Design
- 17.21 Nitaqat Dashboard
- 17.22 Nitaqat Evidence Pack
- 17.23 Sample Nitaqat Monthly Compliance Certificate
- 17.24 Sample Saudization Gap Register
- 17.25 Sample Artificial Saudization Risk Register
- 17.26 Key Takeaways

## Out of Scope

- Direct write-back automation to Qiwa, GOSI, Mudad and Nitaqat portals (read/evidence and manual submission only; API automation is a later epic).
- Full payroll engine (consumed from EPIC-10) and Mudad/WPS file internals (consumed from EPIC-11).
- GOSI contribution calculation internals (consumed from EPIC-13); this epic consumes/reconciles GOSI registration and wage data.
- Generic ATS workflow (owned by EPIC-04); only Saudization-specific overlays are in scope.

## Dependencies

- EPIC-02 (Country Rule Engine), EPIC-03 (Workforce Planning), EPIC-04 (Recruitment), EPIC-06 (Onboarding), EPIC-10 (Payroll), EPIC-11 (WPS/Mudad), EPIC-13 (GOSI), EPIC-31 (Compliance Dashboard)

## Epic Definition of Done

- [ ] Saudization applicability, denominator and band rules are fully configurable per activity/size in the country rule engine with effective dating.
- [ ] Saudi workforce ratio and Nitaqat band (Platinum/Green tiers/Yellow/Red) compute automatically with full traceability.
- [ ] 2026–2028 direction projections show how tightening targets move the band over time.
- [ ] Qiwa contract, GOSI registration and Mudad/payroll wage evidence are reconciled per counted Saudi.
- [ ] Artificial-Saudization detection runs Qiwa + GOSI + Mudad/payroll cross-checks and populates a risk register.
- [ ] Nitaqat certificate, gap register, artificial-Saudization risk register and evidence pack export with audit trail.
- [ ] KPIs, dashboard, audit checklist and risk matrix are live, RBAC-restricted and reconcile to source.

---

## User Stories

### EPIC-17-S01 — Saudization overview, purpose & regulatory framework knowledge base

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** an in-product Saudization reference covering purpose, authority and platforms, **so that** HR works from one authoritative source.

**Description**
A configurable, versioned knowledge module rendering Chapter 17 intro/purpose and a registry of authorities/platforms (MHRSD, Qiwa, Nitaqat, GOSI, Mudad, Tamheer/HRDF) with each entry linked to the operationalising AuraOS feature, country-tagged to KSA.

**Acceptance Criteria**

- [ ] Given a KSA entity, when the module opens, then intro/purpose render with a version stamp.
- [ ] Given the authority registry, then MHRSD, Qiwa, Nitaqat, GOSI, Mudad and HRDF are listed with role, portal and linked feature.
- [ ] Given a non-KSA context, then Saudization content is hidden/disabled.
- [ ] Given a content edit, then prior versions are retained and changes are audited.

**Tasks**

- [ ] Backend: reuse `nationalization_reference` and `nationalization_authority` entities, country-tagged KSA.
- [ ] Frontend: Saudization reference screen with authority registry.
- [ ] Rules/Config: country scope filter (`SA`).
- [ ] Tests: unit tests for country gating and versioning.

**Covers:** 17.1, 17.2, 17.3
**Dependencies:** EPIC-02

### EPIC-17-S02 — Nitaqat program model & band configuration

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** System Administrator, **I want** the Nitaqat program model and band thresholds configured per activity and size category, **so that** band classification reflects current MHRSD rules.

**Description**
Models the Nitaqat program: activity (economic sector) and size category (entity-size tier), with configurable Saudization-ratio thresholds defining each band — Platinum, High/Medium/Low Green, Yellow, Red. All thresholds are effective-dated in the rule engine so updates apply without code changes.

**Acceptance Criteria**

- [ ] Given an activity + size category, when configured, then band thresholds (Red/Yellow/Green tiers/Platinum) are stored as effective-dated ranges.
- [ ] Given an entity's activity/size, when classified, then the correct threshold set is selected.
- [ ] Given overlapping or gapped thresholds, when validated, then a config error is raised before save.
- [ ] Given a threshold change, then it versions, is audited and applies from its effective date.

**Tasks**

- [ ] Backend: `nitaqat_band_config` entity (`activity`, `sizeCategory`, `band`, `minRatio`, `maxRatio`, `effectiveFrom`, `version`).
- [ ] Backend: config validation service (no gaps/overlaps).
- [ ] Frontend: band configuration admin screen.
- [ ] Rules/Config: per-activity/size band threshold sets.
- [ ] Tests: validation tests for threshold continuity.

**Covers:** 17.4
**Dependencies:** EPIC-02

### EPIC-17-S03 — 2026–2028 Nitaqat direction projection

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5
**As an** Executive, **I want** projections of how 2026–2028 Nitaqat tightening will move our band, **so that** we plan Saudi hiring ahead of rising targets.

**Description**
Applies the scheduled 2026–2028 threshold increases (configurable per activity/size) to the current workforce and projects the future band per year, highlighting where the entity would slip to Yellow/Red if hiring does not keep pace.

**Acceptance Criteria**

- [ ] Given configured future-year thresholds, when projected, then the band for 2026/2027/2028 is computed against the current ratio.
- [ ] Given a projected band drop, when detected, then the required additional Saudis to hold the band per year are shown.
- [ ] Given a hiring scenario, when applied, then the projected band per year recomputes.
- [ ] Given config, then future-year thresholds are editable and versioned.

**Tasks**

- [ ] Backend: projection service applying future-year thresholds to current/forecast ratio.
- [ ] Backend: `nitaqat_direction_projection` entity (`entityId`, `year`, `projectedRatio`, `projectedBand`, `saudisNeeded`).
- [ ] Frontend: direction-projection view with year-by-year band outlook.
- [ ] Rules/Config: effective-dated 2026–2028 threshold schedule.
- [ ] Tests: unit tests for multi-year band projection.

**Covers:** 17.5
**Dependencies:** EPIC-02, EPIC-03

### EPIC-17-S04 — Nitaqat applicability determination

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** AuraOS to determine whether each entity is in-scope for Nitaqat and which activity/size category applies, **so that** classification uses the right rule set.

**Description**
An applicability engine mapping each entity to its Nitaqat activity (economic activity code) and size category (by counted headcount), and determining whether minimum-size applicability is met, producing an effective-dated applicability record.

**Acceptance Criteria**

- [ ] Given entity activity and headcount, when applicability runs, then activity + size category and in-scope status are determined.
- [ ] Given a headcount change crossing a size-tier boundary, when recalculated, then the size category updates and Compliance is alerted.
- [ ] Given multi-activity entities, when configured, then the governing activity is resolved per rule and recorded.
- [ ] Given any determination, then inputs, matched rule version and result are audited.

**Tasks**

- [ ] Backend: `nitaqat_applicability` entity (`entityId`, `activity`, `sizeCategory`, `inScope`, `basis`, `ruleVersion`).
- [ ] Backend: applicability/size-tier resolution service.
- [ ] Frontend: applicability panel with activity/size and basis.
- [ ] Rules/Config: size-tier boundaries and activity mapping per country.
- [ ] Alerts/Workflow: size-tier-change alert to Compliance.
- [ ] Tests: integration tests across size-boundary and multi-activity cases.

**Covers:** 17.6
**Dependencies:** EPIC-02, EPIC-03

### EPIC-17-S05 — Saudi workforce ratio calculation & band classification

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** the Saudi workforce ratio computed against the correct denominator and mapped to a Nitaqat band, **so that** I always know our exact band and the distance to the next one.

**Description**
The core engine: builds the denominator (total counted employees per Nitaqat counting rules, applying part-time weighting and counted/non-counted categories), the numerator (eligible counted Saudis with weighting where applicable), computes the Saudization ratio, classifies the band, and shows headcount needed to reach/hold the next band. Denominator rules, weightings and bands are configurable per country in the rule engine.

**Acceptance Criteria**

- [ ] Given an in-scope entity, when calculated, then the denominator applies Nitaqat counting rules (e.g., part-time weighting, excluded categories) and is drillable to employee level.
- [ ] Given the numerator and denominator, when computed, then the Saudization ratio and resulting band (Platinum/Green tier/Yellow/Red) are produced.
- [ ] Given the current band, when classified, then the additional/at-risk Saudi headcount to move up or avoid dropping a band is shown.
- [ ] Given weighting rules (e.g., special counting for certain Saudi categories), then they apply per config.
- [ ] Given country config, then denominator definition, weightings and bands are read from the rule engine, not hard-coded.

**Tasks**

- [ ] Backend: `saudization_calculation` entity (`entityId`, `period`, `denominator`, `numerator`, `ratio`, `band`, `nextBandGap`, `ruleVersion`).
- [ ] Backend: denominator/numerator builder with weighting and counted-category logic.
- [ ] Backend: band classification service against `nitaqat_band_config`.
- [ ] Frontend: ratio + band card with drill-down and next-band distance.
- [ ] Rules/Config: per-country denominator/weighting/band rules.
- [ ] Tests: golden-file tests for denominator membership and band boundaries.

**Covers:** 17.7
**Dependencies:** EPIC-02, EPIC-03

### EPIC-17-S06 — Qiwa contract documentation reconciliation

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** each counted Saudi reconciled to an authenticated Qiwa contract, **so that** only Saudis with valid, documented contracts count toward the band.

**Description**
A reconciliation engine matching counted Saudis to authenticated Qiwa contracts, validating job title, wage and status, and flagging missing, unauthenticated or mismatched contracts. Unauthenticated/missing contracts exclude the Saudi from genuine counting and feed artificial-Saudization detection.

**Acceptance Criteria**

- [ ] Given a counted Saudi, when reconciled, then a matching authenticated Qiwa contract is required or the Saudi is flagged "no valid Qiwa contract."
- [ ] Given a Qiwa contract title/wage differing from HRMS beyond tolerance, when detected, then a mismatch flag with details is raised.
- [ ] Given a missing/unauthenticated contract, when detected, then the Saudi is excluded from genuine counting and the exception is logged.
- [ ] Given reconciliation results, then they are exportable and linked to the evidence pack and artificial-Saudization engine.
- [ ] Given config, then match tolerances are configurable.

**Tasks**

- [ ] Backend: `qiwa_contract_recon` entity (`employeeId`, `qiwaContractId`, `qiwaStatus`, `titleMatch`, `wageVariance`, `flag`).
- [ ] Backend: Qiwa contract reconciliation service (import/manual evidence based).
- [ ] Frontend: contract reconciliation grid with mismatch highlights.
- [ ] Rules/Config: configurable title/wage match tolerances.
- [ ] Tests: integration tests for missing/unauthenticated/mismatch cases.

**Covers:** 17.8
**Dependencies:** EPIC-02

### EPIC-17-S07 — GOSI linkage & reconciliation

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** counted Saudis reconciled to GOSI registrations and contribution wages, **so that** the numerator matches what GOSI/Nitaqat see.

**Description**
Matches each counted Saudi to a GOSI registration (which underpins official Nitaqat counting), compares GOSI contribution wage vs. payroll, and flags unregistered, salary-mismatched or recently de-registered Saudis. Feeds the genuineness score and gap register.

**Acceptance Criteria**

- [ ] Given counted Saudis, when reconciled, then each is matched to a GOSI registration or flagged "not registered."
- [ ] Given a GOSI contribution wage differing from payroll beyond tolerance, when detected, then a variance flag is raised.
- [ ] Given a GOSI de-registration, when detected, then the Saudi is removed from the numerator and an alert is raised.
- [ ] Given a Saudi registered in GOSI very recently before a band check, when detected, then a timing red flag is raised (potential artificial counting).
- [ ] Given config, then salary-match tolerance and timing thresholds are configurable.

**Tasks**

- [ ] Backend: GOSI reconciliation service joining numerator to GOSI registration/contribution data.
- [ ] Backend: `saudization_gosi_recon` entity (`employeeId`, `gosiStatus`, `gosiWage`, `payrollWage`, `variance`, `registrationTimingFlag`, `flag`).
- [ ] Frontend: GOSI reconciliation grid with variance/timing highlights.
- [ ] Rules/Config: configurable tolerance and registration-timing window.
- [ ] Tests: integration tests for unregistered/mismatch/timing cases.

**Covers:** 17.9
**Dependencies:** EPIC-13

### EPIC-17-S08 — Payroll & Mudad wage evidence linkage

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** Internal Auditor, **I want** payroll and Mudad wage-transfer evidence linked to each counted Saudi, **so that** I can prove genuine, on-time wage payment.

**Description**
Links each counted Saudi to monthly payroll and Mudad wage-file transfer confirmations, flags salary delays, missing transfers and Mudad amount < declared salary, and assembles the wage-evidence section of the monthly pack.

**Acceptance Criteria**

- [ ] Given a counted Saudi, when the month closes, then payroll net pay and the Mudad transfer are linked as evidence.
- [ ] Given a salary delay beyond the statutory window or a missing Mudad transfer, when detected, then a wage-evidence exception is raised.
- [ ] Given Mudad amount < declared payroll wage beyond tolerance, when detected, then a variance flag is raised and fed to artificial-Saudization detection.
- [ ] Given the monthly pack, then per-Saudi wage evidence with transfer reference and date is included.
- [ ] Given the period lock, then evidence links become immutable.

**Tasks**

- [ ] Backend: `saudization_wage_evidence` entity (`employeeId`, `period`, `payrollNet`, `mudadAmount`, `mudadTransferRef`, `transferDate`, `exceptionFlag`).
- [ ] Backend: payroll/Mudad linkage service with delay and variance detection.
- [ ] Frontend: wage-evidence view per Saudi and period.
- [ ] Rules/Config: configurable salary-delay window and variance tolerance.
- [ ] Tests: integration tests for delay/missing/variance scenarios.

**Covers:** 17.10
**Dependencies:** EPIC-10, EPIC-11

### EPIC-17-S09 — Job classification & profession localization

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** to track localized/reserved professions and ensure those roles are held by Saudis, **so that** we comply with profession-localization decisions and don't lose work permits for reserved jobs.

**Description**
Maintains a configurable register of localized/reserved professions (per MHRSD decisions), maps positions and job titles to them, and flags reserved roles occupied by expatriates or below the required localization percentage for a profession.

**Acceptance Criteria**

- [ ] Given the localized-profession register, when a position is mapped to a reserved profession, then a Saudi-only or minimum-localization rule is applied.
- [ ] Given a reserved role occupied by an expatriate, when detected, then a localization-breach flag is raised.
- [ ] Given a profession with a required localization %, when below target, then the shortfall is shown.
- [ ] Given a recruitment requisition for a reserved profession, when created, then a Saudi-priority/Saudi-only control is enforced.
- [ ] Given config, then the reserved-profession list and percentages are editable and versioned.

**Tasks**

- [ ] Backend: `localized_profession` entity (`professionCode`, `localizationPct`, `saudiOnly`, `effectiveFrom`) and position mapping.
- [ ] Backend: profession-localization evaluation service.
- [ ] Frontend: profession-localization register and breach view.
- [ ] Rules/Config: editable reserved-profession list and required percentages.
- [ ] Alerts/Workflow: breach alerts and recruitment-control enforcement.
- [ ] Tests: integration tests for breach detection and recruitment control.

**Covers:** 17.11
**Dependencies:** EPIC-04, EPIC-09

### EPIC-17-S10 — Saudization workforce planning

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5
**As an** Executive, **I want** multi-period Saudization planning that projects ratio and band vs. planned Saudi hires/attrition under 2026–2028 thresholds, **so that** we hold or improve our band.

**Description**
A forward-looking planner modelling headcount growth, planned Saudi hires and attrition, and rising 2026–2028 thresholds, projecting ratio and band per period and showing the hires needed to reach a target band.

**Acceptance Criteria**

- [ ] Given growth and hire/attrition assumptions, when projected, then ratio and band per future period are forecast under the configured thresholds.
- [ ] Given a target band, when set, then the additional Saudi hires needed per period are computed.
- [ ] Given a scenario, when saved, then it compares against baseline.
- [ ] Given a projected band drop, then it is highlighted with the corrective hiring requirement.

**Tasks**

- [ ] Backend: `saudization_plan_scenario` entity (`entityId`, `horizon`, `assumptions`, `projectedRatio[]`, `projectedBand[]`).
- [ ] Backend: projection engine over denominator growth + thresholds + hires/attrition.
- [ ] Frontend: scenario planner with baseline vs. scenario.
- [ ] Rules/Config: configurable growth and threshold assumptions.
- [ ] Tests: unit tests for multi-period ratio/band projection.

**Covers:** 17.12
**Dependencies:** EPIC-03

### EPIC-17-S11 — Saudi national recruitment strategy & pipeline overlay

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** a Saudization recruitment overlay with Qiwa/Tamheer/HRDF sourcing and a Saudi-candidate pipeline, **so that** we close the band gap with genuine hires.

**Description**
Adds Saudi-national tagging, a dedicated Saudi pipeline, HRDF/Tamheer/Qiwa sourcing channels and band-gap-driven requisition targeting, with reserved-profession requisitions enforced as Saudi-priority.

**Acceptance Criteria**

- [ ] Given a band gap, when requisitions are created, then roles can be flagged Saudization-priority and linked to the gap.
- [ ] Given a Saudi candidate, when sourced, then channel (HRDF/Tamheer/Qiwa/referral) and eligibility are tagged.
- [ ] Given the pipeline view, then Saudi candidates by stage and projected band impact are shown.
- [ ] Given a Saudi hire, then ratio/band dashboards update on recalculation.
- [ ] Given a reserved-profession requisition, then a Saudi-priority control is enforced.

**Tasks**

- [ ] Backend: extend candidate/requisition with `isSaudiNational`, `sourcingChannel`, `saudizationPriority`, `linkedBandGapId`.
- [ ] Backend: pipeline aggregation service vs. band gap.
- [ ] Frontend: Saudization recruitment board with band-impact indicator.
- [ ] Rules/Config: configurable sourcing channels (HRDF, Tamheer, Qiwa).
- [ ] Tests: integration test linking a Saudi hire to band-gap reduction.

**Covers:** 17.13
**Dependencies:** EPIC-04

### EPIC-17-S12 — Retention of Saudi employees

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5
**As an** HR Manager, **I want** to monitor Saudi retention risk and tenure, **so that** we keep counted Saudis and protect our band.

**Description**
Tracks Saudi tenure, attrition, flight-risk indicators and HRDF/Tamheer commitments, alerting when a counted Saudi resigns or trips a risk indicator and quantifying the band/financial impact.

**Acceptance Criteria**

- [ ] Given Saudi employees, when computed, then Saudi attrition rate and at-risk Saudis are shown.
- [ ] Given a counted Saudi resignation, when recorded, then projected band impact and any HRDF-support effect are surfaced.
- [ ] Given an HRDF/Tamheer commitment at risk, when detected, then an alert is raised.
- [ ] Given interventions, then they are logged and linked to the employee.
- [ ] Given RBAC, then retention-risk data is restricted to HR Manager/Compliance.

**Tasks**

- [ ] Backend: Saudi retention analytics service (tenure, attrition, flight-risk).
- [ ] Backend: `saudization_retention_event` entity (`employeeId`, `eventType`, `bandImpact`, `financialImpact`).
- [ ] Frontend: retention-risk panel with at-risk list.
- [ ] Alerts/Workflow: resignation/risk alerts to HR Manager.
- [ ] Tests: unit tests for band-impact on attrition.

**Covers:** 17.14
**Dependencies:** EPIC-03

### EPIC-17-S13 — Fake/artificial Saudization detection (Qiwa + GOSI + Mudad/payroll cross-checks)

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 13
**As a** Compliance Officer, **I want** automated detection of artificial Saudization by cross-checking Qiwa, GOSI and Mudad/payroll, **so that** we never count ghost Saudis and avoid Qiwa penalties and band downgrade.

**Description**
A red-flag engine scoring each counted Saudi for genuineness: GOSI registration present and wage-matched, authenticated Qiwa contract present, Mudad shows a real monthly wage transfer matching declared salary, attendance/active status, and no clustering anomalies (mass same-day GOSI registrations before a band check, identical near-minimum wages, no attendance/access, Saudis "parked" with no genuine role). Flags feed the artificial-Saudization risk register (S20).

**Acceptance Criteria**

- [ ] Given a counted Saudi with no matching GOSI registration, when scanned, then a high-severity artificial-Saudization flag is raised.
- [ ] Given a Saudi with no authenticated Qiwa contract or with a wage far below declared, when scanned, then a flag with variance is raised.
- [ ] Given a Mudad transfer absent or far below payroll salary, when scanned, then a flag is raised.
- [ ] Given mass same-day GOSI registrations shortly before a band check with no attendance, when detected, then a clustering/ghost-Saudization pattern flag is raised.
- [ ] Given each flag, then a risk score, evidence references (Qiwa/GOSI/Mudad/payroll) and recommended action are stored.
- [ ] Given a resolved/false-positive flag, then dispositioning with reason and approver is captured in the audit trail.
- [ ] Given country config, then thresholds (variance %, cluster size, timing window) are configurable.

**Tasks**

- [ ] Backend: reuse/extend `fake_nationalization_flag` entity (`employeeId`, `countryCode='SA'`, `signalType`, `severity`, `score`, `evidenceRefs[]`, `status`, `disposition`).
- [ ] Backend: cross-source reconciliation service joining Qiwa contract, GOSI registration, Mudad transfer and payroll wage.
- [ ] Backend: anomaly/clustering rules (mass same-day GOSI registration, identical wages, no attendance/access, registration-timing before band check).
- [ ] Frontend: detection results screen with evidence drill-down and disposition.
- [ ] Rules/Config: configurable variance/cluster/timing thresholds per country.
- [ ] Alerts/Workflow: high-severity flags routed to Compliance for investigation.
- [ ] Tests: integration tests for missing-GOSI, no-Qiwa-contract, Mudad-variance and clustering scenarios.

**Covers:** 17.15
**Dependencies:** EPIC-10, EPIC-11, EPIC-13

### EPIC-17-S14 — Nitaqat certificate generation & business use controls

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** the Nitaqat certificate captured with its band and expiry, plus controls tied to its business uses, **so that** we don't lose tenders, visa quotas or permit services because of an expired or downgraded certificate.

**Description**
Stores the current Nitaqat certificate (band, ratio, issue/expiry), tracks its business-use dependencies (visa quota issuance, work-permit renewal, contract authentication, government tenders/contracting prequalification), and alerts at 60/30/7 days before expiry or on a band downgrade that would impair those services.

**Acceptance Criteria**

- [ ] Given a Nitaqat certificate, when stored, then band, ratio, issue and expiry dates and document are captured.
- [ ] Given 60/30/7 days before expiry, when reached, then tiered renewal alerts are raised to Compliance/PRO.
- [ ] Given a band downgrade to Yellow/Red, when detected, then impacted business uses (visa quota, permit renewals, tenders) are flagged with impact.
- [ ] Given a tender requiring a minimum band, when checked, then eligibility (meets/does-not-meet) is shown.
- [ ] Given config, then business-use thresholds and certificate fields are configurable.

**Tasks**

- [ ] Backend: `nitaqat_certificate` entity (`entityId`, `band`, `ratio`, `issueDate`, `expiryDate`, `documentRef`).
- [ ] Backend: business-use impact + tender-eligibility service.
- [ ] Frontend: certificate panel with expiry/band status and business-use impacts.
- [ ] Rules/Config: configurable business-use band thresholds and alert tiers (60/30/7).
- [ ] Alerts/Workflow: expiry and downgrade alerts to Compliance/PRO.
- [ ] Tests: integration tests for expiry alerts and tender-eligibility checks.

**Covers:** 17.16
**Dependencies:** EPIC-07

### EPIC-17-S15 — Nitaqat audit checklist & red-flag controls

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 3
**As an** Internal Auditor, **I want** a configurable Nitaqat audit checklist with automated red-flag controls, **so that** I can verify band integrity and genuineness consistently.

**Description**
A digital, configurable checklist covering denominator/ratio accuracy, band classification, Qiwa/GOSI/Mudad evidence completeness, profession localization and artificial-Saudization flags, with auto-evaluated and manual sign-off items.

**Acceptance Criteria**

- [ ] Given an audit cycle, when the checklist runs, then auto-evaluated items (e.g., "every counted Saudi has GOSI + Qiwa + Mudad evidence") return pass/fail with drill-down.
- [ ] Given a failed control, when raised, then a corrective action is created and tracked.
- [ ] Given manual items, then auditors record outcome, comments and evidence.
- [ ] Given completion, then a signed checklist is archived in the evidence pack.
- [ ] Given config, then items/thresholds are editable per country.

**Tasks**

- [ ] Backend: `nitaqat_audit_checklist` + `checklist_item` entities with auto/manual flags.
- [ ] Backend: auto-evaluation service binding to live signals.
- [ ] Frontend: checklist runner with pass/fail and sign-off.
- [ ] Alerts/Workflow: corrective-action creation on failure.
- [ ] Tests: integration tests for auto-evaluated items.

**Covers:** 17.17
**Dependencies:** EPIC-31

### EPIC-17-S16 — Nitaqat KPIs

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**As an** Executive, **I want** Nitaqat KPIs computed from live data, **so that** I can track Saudization performance over time.

**Description**
Computes Saudization ratio, current band, distance to next band, Saudi headcount, Saudi attrition, profession-localization compliance %, % counted Saudis with full evidence and artificial-Saudization flag count, per entity and consolidated, period-comparable.

**Acceptance Criteria**

- [ ] Given a period, when KPIs compute, then ratio, band, next-band distance, Saudi headcount/attrition and evidence-completeness % are produced.
- [ ] Given multiple entities, then KPIs roll up and drill back to entity.
- [ ] Given period-over-period, then trend deltas are shown.
- [ ] Given each KPI, then its definition and source are documented in-product.

**Tasks**

- [ ] Backend: KPI aggregation service with period snapshots.
- [ ] Backend: `nitaqat_kpi_snapshot` entity.
- [ ] Frontend: KPI tiles with band and trend indicators.
- [ ] Tests: unit tests for KPI formulas.

**Covers:** 17.18
**Dependencies:** EPIC-31

### EPIC-17-S17 — Nitaqat risk matrix

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** a configurable Nitaqat risk matrix scoring likelihood × impact, **so that** I can prioritise mitigation of band/compliance risks.

**Description**
A configurable risk register/matrix capturing Nitaqat risks (band downgrade, artificial-Saudization exposure, Saudi attrition, evidence/profession-localization gaps, certificate expiry) with likelihood, impact, owner, mitigation and residual risk, rendered as a heatmap.

**Acceptance Criteria**

- [ ] Given a risk, when scored, then likelihood × impact yields a rating on the heatmap.
- [ ] Given mitigations, then residual risk recomputes and is tracked.
- [ ] Given linked data (e.g., open artificial-Saudization flags, projected band drop), then relevant risks update automatically.
- [ ] Given config, then scales/thresholds are editable.

**Tasks**

- [ ] Backend: `nitaqat_risk` entity (`title`, `likelihood`, `impact`, `owner`, `mitigation`, `residual`).
- [ ] Frontend: risk matrix heatmap with drill-down.
- [ ] Rules/Config: configurable scales/thresholds.
- [ ] Tests: unit tests for rating/residual.

**Covers:** 17.19
**Dependencies:** EPIC-31

### EPIC-17-S18 — HRMS Nitaqat automation design (rule engine & events)

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** Nitaqat rules, schedules and cross-checks wired into the country rule engine and event bus, **so that** ratio, band, projections and detection run automatically and are configurable per country.

**Description**
The automation backbone: event-driven recalculation on hires/exits/payroll close/Mudad submission/GOSI/Qiwa updates, scheduled band/projection/detection jobs, and all parameters (bands, denominator/weighting rules, future thresholds, tolerances, alert tiers) exposed in the country rule engine with effective dating and versioning, making targets/bands configurable per country.

**Acceptance Criteria**

- [ ] Given a hire/exit/payroll-close/Mudad/GOSI/Qiwa event, when published, then the relevant Nitaqat recalculation triggers and is audited.
- [ ] Given scheduled jobs, then band evaluation, 2026–2028 projection and artificial-Saudization detection run on cadence with run logs.
- [ ] Given the rule engine, then bands, denominator/weighting rules, future thresholds, tolerances and alert tiers are configurable per country and effective-dated.
- [ ] Given a config change, then it versions, is audited and applies from its effective date without code change.
- [ ] Given a failed job, then it alerts System Admin and is retryable idempotently.

**Tasks**

- [ ] Backend: event consumers for hire/exit/payroll/Mudad/GOSI/Qiwa topics.
- [ ] Backend: scheduled job runners for band/projection/detection with run-log table.
- [ ] Backend: rule-engine schema for Nitaqat parameters (effective-dated, versioned).
- [ ] Frontend: admin config UI for country Nitaqat parameters.
- [ ] Rules/Config: per-country parameter sets with validation.
- [ ] Tests: integration tests for event-driven recalculation and idempotent retries.

**Covers:** 17.20
**Dependencies:** EPIC-02, EPIC-10, EPIC-11, EPIC-13

### EPIC-17-S19 — Nitaqat dashboard

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** Executive, **I want** a Nitaqat dashboard showing ratio, band, distance to next band, projections, certificate status and artificial-Saudization flags, **so that** I see our position at a glance.

**Description**
A consolidated, RBAC-aware dashboard with a band indicator (Platinum/Green tiers/Yellow/Red), ratio gauge, next-band distance, 2026–2028 outlook, certificate/expiry status, evidence-completeness and open artificial-Saudization flags, filterable by entity/period and drillable to source.

**Acceptance Criteria**

- [ ] Given a KSA entity, when the dashboard loads, then ratio, band, next-band distance and certificate status render from live data.
- [ ] Given multi-entity, then a consolidated roll-up with per-entity drill-down is available.
- [ ] Given a tile, when clicked, then it drills to underlying employee/evidence records.
- [ ] Given RBAC, then risk/financial tiles respect role visibility.
- [ ] Given a period filter, then tiles recompute for that period.

**Tasks**

- [ ] Backend: dashboard aggregation API.
- [ ] Frontend: Nitaqat dashboard with band indicator, gauges, projections, drill-downs.
- [ ] Rules/Config: configurable colour states aligned to bands.
- [ ] Tests: e2e test of dashboard data and drill-downs.

**Covers:** 17.21
**Dependencies:** EPIC-31

### EPIC-17-S20 — Nitaqat evidence pack + monthly certificate, gap register & artificial-Saudization risk register

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** a one-click Nitaqat evidence pack containing the monthly compliance certificate, Saudization gap register and artificial-Saudization risk register, **so that** we are inspection-ready and can certify our band.

**Description**
Assembles a period evidence pack: ratio/band calculation with denominator, per-Saudi Qiwa/GOSI/Mudad/payroll evidence, profession-localization status, certificate, audit checklist and KPIs — plus three configurable digital artefacts exporting to PDF/Excel: (1) **Monthly Nitaqat Compliance Certificate** (entity, activity/size, period, denominator, numerator, ratio, band, distance-to-next-band, status, authorised signatory), (2) **Saudization Gap Register** (per department/profession gap, required vs. current Saudis, root cause, planned action, owner, due date), and (3) **Artificial Saudization Risk Register** (flagged Saudi, signal type, Qiwa/GOSI/Mudad/payroll evidence, severity, disposition, owner).

**Acceptance Criteria**

- [ ] Given a closed period, when the pack is generated, then it bundles ratio/band calc, per-Saudi evidence, profession-localization, certificate, checklist and KPIs into one export.
- [ ] Given the certificate, when produced, then it shows denominator, numerator, ratio, band, next-band distance, status and a maker-checker signatory (preparer ≠ approver) with date.
- [ ] Given the gap register, then each line shows required vs. current Saudis, root cause, planned action, owner and due date, editable as a configurable digital form.
- [ ] Given the artificial-Saudization risk register, then each line links to its detection flag and evidence and records severity, disposition and owner.
- [ ] Given any artefact, then it exports to PDF and Excel and is archived immutably with the audit trail.
- [ ] Given config, then certificate/register fields and layout are configurable per country.

**Tasks**

- [ ] Backend: `nitaqat_evidence_pack`, `nitaqat_certificate_doc`, `saudization_gap_register`, `artificial_saudization_risk_register` entities.
- [ ] Backend: pack assembly service pulling ratio/band/evidence/certificate/KPI data.
- [ ] Backend: PDF/Excel export service with immutable archival.
- [ ] Frontend: certificate + gap register + artificial-Saudization risk register as configurable digital forms with export.
- [ ] Alerts/Workflow: maker-checker approval on certificate (preparer ≠ approver).
- [ ] Rules/Config: configurable certificate/register templates per country.
- [ ] Tests: e2e test generating pack and verifying maker-checker + exports.

**Covers:** 17.22, 17.23, 17.24, 17.25
**Dependencies:** EPIC-31

### EPIC-17-S21 — Nitaqat key takeaways & guidance summary

**Labels:** `user-story`, `nationalization` · **Priority:** Could · **Estimate:** 1
**As an** HR Admin, **I want** an in-product key-takeaways summary of Saudization/Nitaqat obligations and AuraOS controls, **so that** new users quickly grasp what good compliance looks like.

**Description**
A concise, versioned summary distilling Chapter 17 takeaways (band integrity, GOSI/Qiwa/Mudad evidence-first, profession localization, artificial-Saudization avoidance, 2026–2028 readiness) with deep links to the relevant AuraOS features.

**Acceptance Criteria**

- [ ] Given the module, when a user opens key takeaways, then a summary with deep links to ratio/band, evidence, detection and dashboard renders.
- [ ] Given a content update, then it is versioned and audited.
- [ ] Given country scope, then it shows only for KSA entities.

**Tasks**

- [ ] Backend: reuse `nationalization_reference` for takeaways content.
- [ ] Frontend: key-takeaways page with feature deep links.
- [ ] Tests: smoke test for rendering and links.

**Covers:** 17.26
**Dependencies:** —
