# EPIC-18: Chapter 18 – Bahrainization Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 18 – Bahrainization Compliance
> **Module:** Nationalization · **Labels:** `epic`, `gcc-compliance`, `nationalization`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a configurable Bahrainization engine in AuraOS that calculates the Bahraini-employee ratio against the correct workforce denominator, links it to expatriate work-permit (LMRA) quotas, and tracks the Bahrainization certificate used for tenders and permit issuance. It must cross-check SIO registration and payroll wage evidence to detect artificial Bahrainization, drive Bahraini recruitment, job design, onboarding, retention, training and workforce planning, and produce the certificate, evidence pack, gap register and artificial-Bahrainization risk register.

## Business Value

Protects the ability to obtain and renew expatriate work permits through LMRA (which depends on meeting Bahrainization ratios), preserves eligibility for government tenders and contracts that mandate a minimum Bahraini percentage, and prevents penalties and permit blocking from artificial Bahrainization. Automates ratio math, SIO/payroll evidence and certificate tracking, giving leadership an audit-ready Bahrainization position at any time.

## Requirements Covered (handbook sections)

- 18.1 Introduction
- 18.2 Purpose of Bahrainization
- 18.3 Regulatory Authorities and Key Platforms
- 18.4 Bahrainization Applicability
- 18.5 Bahrainization and Expatriate Work Permits
- 18.6 Bahrainization Calculation
- 18.7 Bahraini Employee Eligibility for Counting
- 18.8 Genuine Employment Evidence
- 18.9 Bahraini Recruitment Strategy
- 18.10 Job Design for Bahrainization
- 18.11 Bahraini Employee Onboarding Controls
- 18.12 SIO and Bahrainization Alignment
- 18.13 Payroll Evidence
- 18.14 Bahrainization Certificate
- 18.15 Government Tender and Contracting Considerations
- 18.16 Retention of Bahraini Employees
- 18.17 Training and Development
- 18.18 Bahrainization Workforce Planning
- 18.19 Bahrainization Audit Checklist
- 18.20 Bahrainization KPIs
- 18.21 Bahrainization Risk Matrix
- 18.22 HRMS Bahrainization Automation Design
- 18.23 Bahrainization Dashboard
- 18.24 Bahrainization Evidence Pack
- 18.25 Sample Bahrainization Monthly Compliance Certificate
- 18.26 Sample Bahrainization Gap Register
- 18.27 Sample Artificial Bahrainization Risk Register
- 18.28 Key Takeaways

## Out of Scope

- Direct write-back automation to LMRA, SIO and tender portals (read/evidence and manual submission only; API automation is a later epic).
- Full payroll engine (consumed from EPIC-10) and wage-file internals (consumed from EPIC-11).
- SIO contribution calculation internals (consumed from EPIC-15); this epic consumes/reconciles SIO registration and wage data.
- Generic ATS workflow (owned by EPIC-04); only Bahrainization-specific overlays are in scope.

## Dependencies

- EPIC-02 (Country Rule Engine), EPIC-03 (Workforce Planning), EPIC-04 (Recruitment), EPIC-06 (Onboarding), EPIC-07 (Immigration/Work Permits), EPIC-10 (Payroll), EPIC-15 (Bahrain SIO), EPIC-31 (Compliance Dashboard)

## Epic Definition of Done

- [ ] Bahrainization applicability, denominator and ratio-target rules are fully configurable per sector/size in the country rule engine with effective dating.
- [ ] Bahraini ratio and target compute automatically with full traceability, linked to LMRA work-permit quota impact.
- [ ] Bahraini-employee eligibility-for-counting rules are enforced (genuine, SIO-registered, paid).
- [ ] SIO registration and payroll wage evidence are reconciled per counted Bahraini.
- [ ] Artificial-Bahrainization detection runs SIO + payroll cross-checks and populates a risk register.
- [ ] Bahrainization certificate, gap register, artificial-Bahrainization risk register and evidence pack export with audit trail.
- [ ] KPIs, dashboard, audit checklist and risk matrix are live, RBAC-restricted and reconcile to source.

---

## User Stories

### EPIC-18-S01 — Bahrainization overview, purpose & regulatory framework knowledge base

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** an in-product Bahrainization reference covering purpose, authorities and platforms, **so that** HR works from one authoritative source.

**Description**
A configurable, versioned knowledge module rendering Chapter 18 intro/purpose and a registry of authorities/platforms (LMRA, MOL/Ministry of Labour, SIO, Tamkeen) with each entry linked to the operationalising AuraOS feature, country-tagged to Bahrain.

**Acceptance Criteria**

- [ ] Given a Bahrain entity, when the module opens, then intro/purpose render with a version stamp.
- [ ] Given the authority registry, then LMRA, MOL, SIO and Tamkeen are listed with role, portal and linked feature.
- [ ] Given a non-Bahrain context, then Bahrainization content is hidden/disabled.
- [ ] Given a content edit, then prior versions are retained and changes are audited.

**Tasks**

- [ ] Backend: reuse `nationalization_reference` and `nationalization_authority` entities, country-tagged BH.
- [ ] Frontend: Bahrainization reference screen with authority registry.
- [ ] Rules/Config: country scope filter (`BH`).
- [ ] Tests: unit tests for country gating and versioning.

**Covers:** 18.1, 18.2, 18.3
**Dependencies:** EPIC-02

### EPIC-18-S02 — Bahrainization applicability determination

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** AuraOS to determine whether each entity is in-scope for Bahrainization and at what target ratio, **so that** we apply the right sector/size rule.

**Description**
A rules-driven applicability engine mapping each entity to its sector and size, and selecting the applicable Bahrainization target ratio (configurable per sector/size band), producing an effective-dated applicability record.

**Acceptance Criteria**

- [ ] Given entity sector and headcount, when applicability runs, then in-scope status and applicable target ratio are determined.
- [ ] Given a sector with a specific Bahrainization percentage, when matched, then that percentage governs and the basis is recorded.
- [ ] Given a headcount/sector change, when recalculated, then applicability is re-evaluated and Compliance is alerted.
- [ ] Given any determination, then inputs, matched rule version and result are audited.

**Tasks**

- [ ] Backend: `bahrainization_applicability` entity (`entityId`, `period`, `inScope`, `sector`, `targetRatio`, `basis`, `ruleVersion`).
- [ ] Backend: applicability evaluation service.
- [ ] Frontend: applicability panel with target ratio and basis.
- [ ] Rules/Config: configurable sector/size target-ratio bands per country.
- [ ] Alerts/Workflow: applicability-change alert to Compliance.
- [ ] Tests: integration tests across sector/size scenarios.

**Covers:** 18.4
**Dependencies:** EPIC-02, EPIC-03

### EPIC-18-S03 — Bahrainization & expatriate work-permit (LMRA) linkage

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** PRO / Immigration Officer, **I want** the Bahrainization ratio linked to LMRA expatriate work-permit quota eligibility, **so that** I know whether we can issue or renew expat permits before applying.

**Description**
Connects the Bahrainization ratio to LMRA work-permit quotas: evaluates whether the current/projected ratio supports requested expatriate permit issuance/renewals, flags permit actions that would be blocked or constrained by a shortfall, and shows the Bahrainis needed to unlock a permit quota.

**Acceptance Criteria**

- [ ] Given the current ratio and target, when a permit issuance/renewal is requested, then eligibility (permitted/blocked/constrained) is shown with the reason.
- [ ] Given a shortfall, when evaluated, then the additional Bahrainis required to unlock the requested quota are computed.
- [ ] Given a pending permit batch, when the ratio would drop below target after hiring expats, then a warning is raised before submission.
- [ ] Given config, then the permit-quota rules linking ratio to allowance are configurable.
- [ ] Given audit, then each eligibility evaluation is logged with inputs.

**Tasks**

- [ ] Backend: `bahrainization_permit_eligibility` entity (`entityId`, `requestedPermits`, `ratioAtCheck`, `eligibility`, `bahrainisNeeded`).
- [ ] Backend: ratio-to-quota eligibility service linked to immigration permit requests.
- [ ] Frontend: permit-eligibility indicator within the permit request flow.
- [ ] Rules/Config: configurable ratio-to-permit-quota rules.
- [ ] Alerts/Workflow: pre-submission warning on quota-impacting permit batches.
- [ ] Tests: integration tests for permitted/blocked/constrained outcomes.

**Covers:** 18.5
**Dependencies:** EPIC-07

### EPIC-18-S04 — Bahrainization ratio calculation against workforce denominator

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** the Bahraini-employee ratio computed against the correct workforce denominator with the gap to target, **so that** I always know our exact position.

**Description**
The core engine: builds the denominator (total counted employees per Bahrainization counting rules, applying excluded categories), the numerator (eligible counted Bahrainis), computes the ratio, compares to the target, and shows the headcount gap to reach/hold the target. Denominator rules and targets are configurable per country in the rule engine.

**Acceptance Criteria**

- [ ] Given an in-scope entity, when calculated, then denominator = counted employees per configured rules (excluded categories removed) and is drillable to employee level.
- [ ] Given numerator and denominator, when computed, then the Bahrainization ratio, target comparison and headcount gap are produced.
- [ ] Given a fractional requirement, when rounded, then the configured rounding rule is applied and shown.
- [ ] Given a recalculation, then numerator/denominator membership lists are persisted for drill-down.
- [ ] Given country config, then denominator definition and target are read from the rule engine, not hard-coded.

**Tasks**

- [ ] Backend: `bahrainization_calculation` entity (`entityId`, `period`, `denominator`, `numerator`, `ratio`, `target`, `gap`, `ruleVersion`).
- [ ] Backend: denominator/numerator builder with counted-category logic.
- [ ] Backend: ratio + gap calculation service with configurable rounding.
- [ ] Frontend: ratio + target card with drill-down to counted-employee lists.
- [ ] Rules/Config: per-country denominator definition, target and rounding.
- [ ] Tests: golden-file tests for denominator membership and gap edge cases.

**Covers:** 18.6
**Dependencies:** EPIC-02, EPIC-03

### EPIC-18-S05 — Bahraini employee eligibility-for-counting rules

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** strict eligibility rules governing which Bahrainis count toward the ratio, **so that** only genuinely employed, SIO-registered, paid Bahrainis are counted.

**Description**
A counting-eligibility gate evaluating each Bahraini against configurable criteria — active status, SIO registration, real wage above any minimum counting threshold, genuine role, minimum working hours — and including only those that pass in the numerator, with reasons for any exclusion.

**Acceptance Criteria**

- [ ] Given a Bahraini, when evaluated, then they count only if active, SIO-registered, paid above the minimum counting threshold and in a genuine role.
- [ ] Given a Bahraini failing any criterion, when evaluated, then they are excluded from the numerator with the failed criterion recorded.
- [ ] Given a wage below the minimum counting threshold, when detected, then the Bahraini is flagged non-counting and routed to detection.
- [ ] Given the numerator, then the included/excluded breakdown is exportable for audit.
- [ ] Given config, then eligibility criteria and thresholds are editable per country.

**Tasks**

- [ ] Backend: counting-eligibility service producing included/excluded numerator with reasons.
- [ ] Backend: `bahraini_counting_eligibility` entity (`employeeId`, `criteriaResults`, `counted`, `exclusionReason`).
- [ ] Frontend: eligibility breakdown view (included vs. excluded).
- [ ] Rules/Config: configurable eligibility criteria and minimum-wage counting threshold.
- [ ] Tests: unit tests for each exclusion path.

**Covers:** 18.7
**Dependencies:** EPIC-02, EPIC-15

### EPIC-18-S06 — Genuine employment evidence & artificial-Bahrainization detection (SIO + payroll cross-checks)

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 13
**As a** Compliance Officer, **I want** automated genuine-employment evidence and artificial-Bahrainization detection cross-checking SIO and payroll, **so that** we never count ghost Bahrainis and avoid LMRA penalties and permit blocking.

**Description**
A red-flag engine scoring each counted Bahraini for genuineness using cross-source signals: SIO registration present and wage-matched, payroll shows a real wage transfer consistent with role/grade, attendance/active status, and no clustering anomalies (mass same-day SIO registrations before a permit/tender check, identical near-minimum wages, "phantom" Bahrainis with no attendance/system access or registered only to unlock expat permits). Flags feed the artificial-Bahrainization risk register (S18).

**Acceptance Criteria**

- [ ] Given a counted Bahraini with no matching SIO registration, when scanned, then a high-severity artificial-Bahrainization flag is raised.
- [ ] Given a Bahraini whose payroll/SIO wage is absent or far below declared, when scanned, then a flag with the variance is raised.
- [ ] Given mass same-day SIO registrations shortly before a permit/tender check with no attendance, when detected, then a clustering/phantom-Bahrainization pattern flag is raised.
- [ ] Given a Bahraini with no attendance or system access over a sustained period, when detected, then a phantom-employee flag is raised.
- [ ] Given each flag, then a risk score, evidence references (SIO/payroll/attendance) and a recommended action are stored.
- [ ] Given a resolved/false-positive flag, then dispositioning with reason and approver is captured in the audit trail.
- [ ] Given country config, then thresholds (variance %, cluster size, timing window) are configurable.

**Tasks**

- [ ] Backend: reuse/extend `fake_nationalization_flag` entity (`employeeId`, `countryCode='BH'`, `signalType`, `severity`, `score`, `evidenceRefs[]`, `status`, `disposition`).
- [ ] Backend: cross-source reconciliation service joining SIO registration, payroll wage and attendance.
- [ ] Backend: anomaly/clustering rules (mass same-day SIO registration before permit/tender check, identical wages, no attendance/access).
- [ ] Frontend: detection results screen with evidence drill-down and disposition.
- [ ] Rules/Config: configurable variance/cluster/timing thresholds per country.
- [ ] Alerts/Workflow: high-severity flags routed to Compliance for investigation.
- [ ] Tests: integration tests for missing-SIO, wage-variance, clustering and phantom-employee scenarios.

**Covers:** 18.8
**Dependencies:** EPIC-10, EPIC-15

### EPIC-18-S07 — Bahraini recruitment strategy & pipeline overlay

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** a Bahrainization recruitment overlay with Tamkeen/MOL sourcing and a Bahraini-candidate pipeline, **so that** we close the ratio gap with genuine hires.

**Description**
Adds Bahraini-national tagging, a dedicated Bahraini pipeline, Tamkeen/MOL/referral sourcing channels and gap-driven requisition targeting, with the ability to flag roles as Bahrainization-priority and link them to the current gap and any permit/tender requirement.

**Acceptance Criteria**

- [ ] Given a ratio gap, when requisitions are created, then roles can be flagged Bahrainization-priority and linked to the gap.
- [ ] Given a Bahraini candidate, when sourced, then channel (Tamkeen/MOL/referral) and eligibility are tagged.
- [ ] Given the pipeline view, then Bahraini candidates by stage and projected ratio impact are shown.
- [ ] Given a Bahraini hire, then ratio/gap dashboards update on recalculation.
- [ ] Given RBAC, then recruiters see only their entity's Bahraini pipeline.

**Tasks**

- [ ] Backend: extend candidate/requisition with `isBahrainiNational`, `sourcingChannel`, `bahrainizationPriority`, `linkedGapId`.
- [ ] Backend: pipeline aggregation service vs. ratio gap.
- [ ] Frontend: Bahrainization recruitment board with ratio-impact indicator.
- [ ] Rules/Config: configurable sourcing channels (Tamkeen, MOL, referral).
- [ ] Tests: integration test linking a Bahraini hire to gap reduction.

**Covers:** 18.9
**Dependencies:** EPIC-04

### EPIC-18-S08 — Job design for Bahrainization

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**As an** HR Manager, **I want** to design and tag Bahrainization-suitable positions with genuine job content, **so that** counted roles are real and defensible.

**Description**
Position-management overlay marking roles as Bahrainization-target with required skill, genuine duties, grade and wage band aligned to counting thresholds, preventing counting against shell or below-threshold roles.

**Acceptance Criteria**

- [ ] Given a position, when designed for Bahrainization, then skill, duties, grade and wage band are captured and validated against counting thresholds.
- [ ] Given a wage band below the counting threshold, when saved, then a warning is shown and the role is flagged non-counting-risk.
- [ ] Given a target position, when linked to a Bahraini hire, then it contributes to the numerator only if genuineness criteria are met.
- [ ] Given changes to a target position, then they are versioned and audited.

**Tasks**

- [ ] Backend: extend `position` with `bahrainizationTarget`, `skillLevel`, `genuineDutiesText`, `wageBandRef`.
- [ ] Backend: validation service against counting wage thresholds.
- [ ] Frontend: job-design panel with threshold warnings.
- [ ] Rules/Config: configurable wage/skill counting thresholds.
- [ ] Tests: validation tests for below-threshold roles.

**Covers:** 18.10
**Dependencies:** EPIC-09

### EPIC-18-S09 — Bahraini employee onboarding controls

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** Bahrainization-specific onboarding controls enforcing SIO registration, wage setup and document capture at joining, **so that** every counted Bahraini is genuinely employed from day one.

**Description**
An onboarding checklist overlay for Bahrainis enforcing mandatory steps — CPR capture, SIO registration trigger, compliant bank/wage setup, contract on MOL terms — and blocking "counted" status until controls pass.

**Acceptance Criteria**

- [ ] Given a Bahraini new hire, when onboarding starts, then the Bahrainization checklist (CPR, SIO, wage/bank, contract) is enforced.
- [ ] Given any mandatory control incomplete, when the Bahraini would be counted, then counting is blocked and the reason is shown.
- [ ] Given SIO registration initiated, then the linkage is recorded for reconciliation (S10).
- [ ] Given completion, then a "genuine onboarding" evidence record is created and added to the evidence pack.
- [ ] Given audit, then each control's completion is timestamped and attributed.

**Tasks**

- [ ] Backend: `bahrainization_onboarding_control` entity (`employeeId`, `controlType`, `status`, `evidenceRef`, `completedAt`).
- [ ] Backend: counting-gate service blocking numerator inclusion until controls pass.
- [ ] Frontend: Bahraini onboarding checklist with blocking states.
- [ ] Rules/Config: configurable mandatory control set per country.
- [ ] Alerts/Workflow: incomplete-control reminders to HR Admin.
- [ ] Tests: e2e test that incomplete controls block counting.

**Covers:** 18.11
**Dependencies:** EPIC-06, EPIC-15

### EPIC-18-S10 — SIO & Bahrainization alignment / reconciliation

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** counted Bahrainis reconciled against SIO registrations and contribution wages, **so that** the numerator matches what SIO/LMRA see.

**Description**
A reconciliation engine matching each counted Bahraini to an SIO registration, comparing SIO contribution wage vs. payroll, and flagging unregistered, wage-mismatched or de-registered Bahrainis. Feeds the genuineness score and gap register.

**Acceptance Criteria**

- [ ] Given counted Bahrainis, when reconciled, then each is matched to an SIO registration or flagged "not registered."
- [ ] Given an SIO contribution wage differing from payroll beyond tolerance, when detected, then a variance flag with amounts is raised.
- [ ] Given an SIO de-registration, when detected, then the Bahraini is removed from the numerator and an alert is raised.
- [ ] Given a Bahraini registered very recently before a permit/tender check, when detected, then a timing red flag is raised.
- [ ] Given config, then salary-match tolerance and timing thresholds are configurable.

**Tasks**

- [ ] Backend: SIO reconciliation service joining numerator to SIO registration/contribution data.
- [ ] Backend: `bahrainization_sio_recon` entity (`employeeId`, `sioStatus`, `sioWage`, `payrollWage`, `variance`, `timingFlag`, `flag`).
- [ ] Frontend: SIO reconciliation grid with variance/timing highlights.
- [ ] Rules/Config: configurable tolerance and registration-timing window.
- [ ] Tests: integration tests for unregistered/mismatch/timing cases.

**Covers:** 18.12
**Dependencies:** EPIC-15

### EPIC-18-S11 — Payroll wage evidence linkage

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As an** Internal Auditor, **I want** payroll wage evidence linked to each counted Bahraini, **so that** I can prove genuine, on-time wage payment.

**Description**
Links each counted Bahraini to monthly payroll records and wage-transfer confirmations, flags salary delays, missing transfers and wage < declared, and assembles the wage-evidence section of the monthly pack.

**Acceptance Criteria**

- [ ] Given a counted Bahraini, when the month closes, then payroll net pay and the wage transfer are linked as evidence.
- [ ] Given a salary delay beyond the statutory window or a missing transfer, when detected, then a wage-evidence exception is raised.
- [ ] Given a transfer amount < declared payroll wage beyond tolerance, when detected, then a variance flag is raised and fed to artificial-Bahrainization detection.
- [ ] Given the monthly pack, then per-Bahraini wage evidence with transfer reference and date is included.
- [ ] Given the period lock, then evidence links become immutable.

**Tasks**

- [ ] Backend: `bahrainization_wage_evidence` entity (`employeeId`, `period`, `payrollNet`, `transferAmount`, `transferRef`, `transferDate`, `exceptionFlag`).
- [ ] Backend: payroll linkage service with delay and variance detection.
- [ ] Frontend: wage-evidence view per Bahraini and period.
- [ ] Rules/Config: configurable salary-delay window and variance tolerance.
- [ ] Tests: integration tests for delay/missing/variance scenarios.

**Covers:** 18.13
**Dependencies:** EPIC-10

### EPIC-18-S12 — Bahrainization certificate generation & tracking

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** the Bahrainization certificate captured with ratio, status and expiry plus renewal alerts, **so that** we never lose permit or tender eligibility to an expired certificate.

**Description**
Stores the current Bahrainization certificate (ratio, status, issue/expiry), tracks its business-use dependencies (LMRA permit issuance/renewal, tender prequalification), and alerts at 60/30/7 days before expiry or when the ratio falls below the level required to maintain the certificate.

**Acceptance Criteria**

- [ ] Given a Bahrainization certificate, when stored, then ratio, status, issue and expiry dates and document are captured.
- [ ] Given 60/30/7 days before expiry, when reached, then tiered renewal alerts go to Compliance/PRO.
- [ ] Given the ratio falling below the maintenance level, when detected, then a certificate-risk flag with impacted business uses is raised.
- [ ] Given a permit or tender requiring the certificate, when checked, then eligibility is shown.
- [ ] Given config, then certificate fields and maintenance thresholds are configurable.

**Tasks**

- [ ] Backend: `bahrainization_certificate` entity (`entityId`, `ratio`, `status`, `issueDate`, `expiryDate`, `documentRef`).
- [ ] Backend: certificate-risk + eligibility service.
- [ ] Frontend: certificate panel with expiry/status and business-use impacts.
- [ ] Rules/Config: configurable maintenance thresholds and alert tiers (60/30/7).
- [ ] Alerts/Workflow: expiry and ratio-drop alerts to Compliance/PRO.
- [ ] Tests: integration tests for expiry alerts and eligibility checks.

**Covers:** 18.14
**Dependencies:** EPIC-07

### EPIC-18-S13 — Government tender & contracting considerations

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**As an** Executive, **I want** to check Bahrainization eligibility against government tender/contract requirements, **so that** we only bid where we qualify and don't risk disqualification.

**Description**
A tender-eligibility module holding tender Bahrainization requirements (minimum ratio/certificate) and evaluating the entity's current position against each, flagging shortfalls and the additional Bahrainis needed to qualify.

**Acceptance Criteria**

- [ ] Given a tender with a minimum Bahrainization requirement, when checked, then meets/does-not-meet status is shown with the gap.
- [ ] Given a shortfall, when evaluated, then the additional Bahrainis needed to qualify are computed.
- [ ] Given a won/active contract with an ongoing requirement, when the ratio drops below it, then a contract-compliance alert is raised.
- [ ] Given config, then tender requirements are configurable per tender/contract.
- [ ] Given audit, then each eligibility evaluation is logged.

**Tasks**

- [ ] Backend: `tender_bahrainization_requirement` entity (`tenderId`, `minRatio`, `certificateRequired`) + eligibility evaluation.
- [ ] Frontend: tender-eligibility view with meets/gap status.
- [ ] Rules/Config: configurable per-tender requirements.
- [ ] Alerts/Workflow: ratio-drop alert on active contracts.
- [ ] Tests: integration tests for meets/shortfall and active-contract drop.

**Covers:** 18.15
**Dependencies:** EPIC-31

### EPIC-18-S14 — Retention of Bahraini employees

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5
**As an** HR Manager, **I want** to monitor Bahraini retention risk and tenure, **so that** we keep counted Bahrainis and protect our ratio and permit/tender eligibility.

**Description**
Tracks Bahraini tenure, attrition, flight-risk indicators and Tamkeen-support commitments, alerting when a counted Bahraini resigns or trips a risk indicator and quantifying the ratio/permit impact.

**Acceptance Criteria**

- [ ] Given Bahraini employees, when computed, then Bahraini attrition rate and at-risk Bahrainis are shown.
- [ ] Given a counted Bahraini resignation, when recorded, then projected ratio impact and any permit/tender effect are surfaced.
- [ ] Given a Tamkeen commitment at risk, when detected, then an alert is raised.
- [ ] Given interventions, then they are logged and linked to the employee.
- [ ] Given RBAC, then retention-risk data is restricted to HR Manager/Compliance.

**Tasks**

- [ ] Backend: Bahraini retention analytics service (tenure, attrition, flight-risk).
- [ ] Backend: `bahrainization_retention_event` entity (`employeeId`, `eventType`, `ratioImpact`, `permitImpact`).
- [ ] Frontend: retention-risk panel with at-risk list.
- [ ] Alerts/Workflow: resignation/risk alerts to HR Manager.
- [ ] Tests: unit tests for ratio-impact on attrition.

**Covers:** 18.16
**Dependencies:** EPIC-03

### EPIC-18-S15 — Training & development for Bahraini employees

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 3
**As an** HR Manager, **I want** to plan and track training/development for Bahrainis, **so that** development obligations and Tamkeen upskilling expectations are evidenced.

**Description**
Captures development plans, training completion and competency progression for counted Bahrainis, linking to onboarding and retention, and producing a training-evidence section for the pack.

**Acceptance Criteria**

- [ ] Given a counted Bahraini, when a development plan is created, then training items, target dates and status are tracked.
- [ ] Given completed training, then completion records and certificates are stored as evidence.
- [ ] Given overdue mandatory training, when detected, then a reminder is raised.
- [ ] Given the evidence pack, then a training-and-development summary per Bahraini is included.

**Tasks**

- [ ] Backend: reuse `national_development_plan` entity for Bahraini employees.
- [ ] Frontend: development-plan view with completion tracking.
- [ ] Alerts/Workflow: overdue-training reminders.
- [ ] Tests: unit tests for overdue detection.

**Covers:** 18.17
**Dependencies:** EPIC-06

### EPIC-18-S16 — Bahrainization workforce planning

**Labels:** `user-story`, `nationalization` · **Priority:** Should · **Estimate:** 5
**As an** Executive, **I want** multi-period Bahrainization planning that projects ratio vs. planned Bahraini hires/attrition and expat permit growth, **so that** we hold our ratio and permit eligibility.

**Description**
A forward-looking planner modelling headcount growth (including planned expat permits, which raise the denominator), planned Bahraini hires and attrition, projecting ratio per period and the Bahrainis needed to maintain target while accommodating expat growth.

**Acceptance Criteria**

- [ ] Given growth and hire/attrition assumptions (including expat permit additions), when projected, then ratio per future period is forecast.
- [ ] Given a target ratio, when set, then additional Bahraini hires needed per period are computed.
- [ ] Given a scenario, when saved, then it compares against baseline.
- [ ] Given a projected drop below target, then it is highlighted with the corrective hiring requirement.

**Tasks**

- [ ] Backend: `bahrainization_plan_scenario` entity (`entityId`, `horizon`, `assumptions`, `projectedRatio[]`).
- [ ] Backend: projection engine over denominator growth (incl. expats) + hires/attrition.
- [ ] Frontend: scenario planner with baseline vs. scenario.
- [ ] Rules/Config: configurable growth and target assumptions.
- [ ] Tests: unit tests for multi-period ratio projection.

**Covers:** 18.18
**Dependencies:** EPIC-03

### EPIC-18-S17 — Bahrainization audit checklist & red-flag controls

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 3
**As an** Internal Auditor, **I want** a configurable Bahrainization audit checklist with automated red-flag controls, **so that** I can verify ratio integrity and genuineness consistently.

**Description**
A digital, configurable checklist covering denominator/ratio accuracy, counting-eligibility, SIO/payroll evidence completeness, onboarding controls and artificial-Bahrainization flags, with auto-evaluated and manual sign-off items.

**Acceptance Criteria**

- [ ] Given an audit cycle, when the checklist runs, then auto-evaluated items (e.g., "every counted Bahraini has SIO + payroll evidence") return pass/fail with drill-down.
- [ ] Given a failed control, when raised, then a corrective action is created and tracked.
- [ ] Given manual items, then auditors record outcome, comments and evidence.
- [ ] Given completion, then a signed checklist is archived in the evidence pack.
- [ ] Given config, then items/thresholds are editable per country.

**Tasks**

- [ ] Backend: `bahrainization_audit_checklist` + `checklist_item` entities with auto/manual flags.
- [ ] Backend: auto-evaluation service binding to live signals.
- [ ] Frontend: checklist runner with pass/fail and sign-off.
- [ ] Alerts/Workflow: corrective-action creation on failure.
- [ ] Tests: integration tests for auto-evaluated items.

**Covers:** 18.19
**Dependencies:** EPIC-31

### EPIC-18-S18 — Bahrainization KPIs, risk matrix & dashboard

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**As an** Executive, **I want** Bahrainization KPIs, a risk matrix and a dashboard from live data, **so that** I can track performance and prioritise mitigation at a glance.

**Description**
Combines (a) KPIs (ratio, gap to target, Bahraini headcount, Bahraini attrition, permit-quota headroom, % counted Bahrainis with full evidence, artificial-Bahrainization flag count), (b) a configurable likelihood × impact risk matrix (shortfall, artificial-Bahrainization exposure, attrition, certificate expiry, permit-block risk) rendered as a heatmap, and (c) an RBAC-aware dashboard showing ratio vs. target, permit/tender eligibility, certificate status and open flags, filterable by entity/period and drillable to source.

**Acceptance Criteria**

- [ ] Given a period, when KPIs compute, then ratio, gap, Bahraini headcount/attrition, permit-quota headroom and evidence-completeness % are produced with trend deltas.
- [ ] Given a risk, when scored, then likelihood × impact yields a rating on the heatmap, and linked data (open flags, projected shortfall) updates risks automatically.
- [ ] Given the dashboard, then ratio vs. target, permit/tender eligibility, certificate status and open artificial-Bahrainization flags render from live data with per-entity roll-up and drill-down.
- [ ] Given RBAC, then risk/permit tiles respect role visibility.
- [ ] Given config, then KPI thresholds, risk scales and dashboard colour states are editable.

**Tasks**

- [ ] Backend: KPI aggregation service + `bahrainization_kpi_snapshot` entity.
- [ ] Backend: `bahrainization_risk` entity (`title`, `likelihood`, `impact`, `owner`, `mitigation`, `residual`) and dashboard aggregation API.
- [ ] Frontend: KPI tiles, risk heatmap and Bahrainization dashboard with drill-downs.
- [ ] Rules/Config: configurable KPI thresholds, risk scales and colour states.
- [ ] Tests: unit tests for KPI/risk formulas; e2e test of dashboard data and drill-downs.

**Covers:** 18.20, 18.21, 18.23
**Dependencies:** EPIC-31

### EPIC-18-S19 — HRMS Bahrainization automation design (rule engine & events)

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** Bahrainization rules, schedules and cross-checks wired into the country rule engine and event bus, **so that** ratio, permit linkage and detection run automatically and are configurable per country.

**Description**
The automation backbone: event-driven recalculation on hires/exits/payroll close/SIO updates/permit requests, scheduled detection and certificate-expiry jobs, and all parameters (targets, denominator rules, counting-eligibility thresholds, tolerances, permit-quota rules, alert tiers) exposed in the country rule engine with effective dating and versioning, making targets/ratios configurable per country.

**Acceptance Criteria**

- [ ] Given a hire/exit/payroll-close/SIO/permit event, when published, then the relevant Bahrainization recalculation triggers and is audited.
- [ ] Given scheduled jobs, then artificial-Bahrainization detection and certificate-expiry checks run on cadence with run logs.
- [ ] Given the rule engine, then targets, denominator/eligibility rules, tolerances, permit-quota rules and alert tiers are configurable per country and effective-dated.
- [ ] Given a config change, then it versions, is audited and applies from its effective date without code change.
- [ ] Given a failed job, then it alerts System Admin and is retryable idempotently.

**Tasks**

- [ ] Backend: event consumers for hire/exit/payroll/SIO/permit topics.
- [ ] Backend: scheduled job runners for detection and certificate expiry with run-log table.
- [ ] Backend: rule-engine schema for Bahrainization parameters (effective-dated, versioned).
- [ ] Frontend: admin config UI for country Bahrainization parameters.
- [ ] Rules/Config: per-country parameter sets with validation.
- [ ] Tests: integration tests for event-driven recalculation and idempotent retries.

**Covers:** 18.22
**Dependencies:** EPIC-02, EPIC-10, EPIC-15

### EPIC-18-S20 — Bahrainization evidence pack + monthly certificate, gap register & artificial-Bahrainization risk register

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** a one-click Bahrainization evidence pack containing the monthly compliance certificate, gap register and artificial-Bahrainization risk register, **so that** we are inspection-ready and can certify our ratio.

**Description**
Assembles a period evidence pack: ratio calculation with denominator, per-Bahraini SIO/payroll evidence, counting-eligibility, onboarding controls, certificate, permit/tender eligibility, audit checklist and KPIs — plus three configurable digital artefacts exporting to PDF/Excel: (1) **Monthly Bahrainization Compliance Certificate** (entity, sector, period, denominator, numerator, ratio, target, gap, status, authorised signatory), (2) **Bahrainization Gap Register** (per department/role gap, required vs. current Bahrainis, root cause, planned action, owner, due date), and (3) **Artificial Bahrainization Risk Register** (flagged Bahraini, signal type, SIO/payroll/attendance evidence, severity, disposition, owner).

**Acceptance Criteria**

- [ ] Given a closed period, when the pack is generated, then it bundles ratio calc, per-Bahraini evidence, counting-eligibility, certificate, checklist and KPIs into one export.
- [ ] Given the certificate, when produced, then it shows denominator, numerator, ratio, target, gap, status and a maker-checker signatory (preparer ≠ approver) with date.
- [ ] Given the gap register, then each line shows required vs. current Bahrainis, root cause, planned action, owner and due date, editable as a configurable digital form.
- [ ] Given the artificial-Bahrainization risk register, then each line links to its detection flag and evidence and records severity, disposition and owner.
- [ ] Given any artefact, then it exports to PDF and Excel and is archived immutably with the audit trail.
- [ ] Given config, then certificate/register fields and layout are configurable per country.

**Tasks**

- [ ] Backend: `bahrainization_evidence_pack`, `bahrainization_certificate_doc`, `bahrainization_gap_register`, `artificial_bahrainization_risk_register` entities.
- [ ] Backend: pack assembly service pulling ratio/evidence/certificate/KPI data.
- [ ] Backend: PDF/Excel export service with immutable archival.
- [ ] Frontend: certificate + gap register + artificial-Bahrainization risk register as configurable digital forms with export.
- [ ] Alerts/Workflow: maker-checker approval on certificate (preparer ≠ approver).
- [ ] Rules/Config: configurable certificate/register templates per country.
- [ ] Tests: e2e test generating pack and verifying maker-checker + exports.

**Covers:** 18.24, 18.25, 18.26, 18.27
**Dependencies:** EPIC-31

### EPIC-18-S21 — Bahrainization key takeaways & guidance summary

**Labels:** `user-story`, `nationalization` · **Priority:** Could · **Estimate:** 1
**As an** HR Admin, **I want** an in-product key-takeaways summary of Bahrainization obligations and AuraOS controls, **so that** new users quickly grasp what good compliance looks like.

**Description**
A concise, versioned summary distilling Chapter 18 takeaways (genuine employment, SIO/payroll evidence-first, permit/tender linkage, artificial-Bahrainization avoidance) with deep links to the relevant AuraOS features.

**Acceptance Criteria**

- [ ] Given the module, when a user opens key takeaways, then a summary with deep links to ratio, evidence, detection and dashboard renders.
- [ ] Given a content update, then it is versioned and audited.
- [ ] Given country scope, then it shows only for Bahrain entities.

**Tasks**

- [ ] Backend: reuse `nationalization_reference` for takeaways content.
- [ ] Frontend: key-takeaways page with feature deep links.
- [ ] Tests: smoke test for rendering and links.

**Covers:** 18.28
**Dependencies:** —
