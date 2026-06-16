# EPIC-11: Chapter 11 – Wage Protection System Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 11 – Wage Protection System Compliance
> **Module:** Payroll / WPS · **Labels:** `epic`, `gcc-compliance`, `wps`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a GCC-wide Wage Protection System (WPS) compliance module in AuraOS that generates country-correct wage files (UAE SIF, Saudi Mudad, Qatar WPS, plus Bahrain/Oman/Kuwait wage-payment controls), enforces statutory salary-payment timing, reconciles paid wages against WPS submissions, manages exceptions and salary-delay flags, and produces audit-ready compliance evidence. WPS becomes a controlled, automated extension of the payroll close that prevents wage-delay penalties and protects the establishment's standing.

## Business Value

Prevents WPS-related penalties, MOHRE/Qiwa/LMRA work-permit blocks and establishment downgrades by ensuring wages are paid and reported within statutory windows; eliminates manual SIF/Mudad file errors; gives Compliance and Finance reconciled proof that every employee was paid the registered amount on time; and provides regulators and auditors a complete, certified WPS evidence trail.

## Requirements Covered (handbook sections)

- 11.1 Introduction
- 11.2 Purpose of Wage Protection Systems
- 11.3 GCC WPS Landscape
- 11.4 UAE WPS Compliance
- 11.5 Saudi Arabia Wage Protection Program / Mudad
- 11.6 Qatar WPS Compliance
- 11.7 Bahrain Wage Payment Controls
- 11.8 Oman Wage Payment Controls
- 11.9 Kuwait Wage Payment Controls
- 11.10 Salary Information File / Wage File Controls
- 11.11 WPS Reconciliation
- 11.12 WPS Exception Management
- 11.13 Salary Delay Controls
- 11.14 WPS Penalties and Business Impact
- 11.15 WPS Audit Checklist
- 11.16 WPS KPIs
- 11.17 WPS Risk Matrix
- 11.18 HRMS WPS Automation Design
- 11.19 WPS Document Library
- 11.20 Sample WPS Compliance Policy
- 11.21 Sample WPS Monthly Compliance Certificate
- 11.22 Key Takeaways

## Out of Scope

- Net-pay/salary calculation and bank-file net amounts (produced by EPIC-10; this epic formats and submits the WPS/wage file and reconciles it).
- Social-insurance contribution computation (EPIC-13/14/15).
- Direct integration credentials/onboarding with each authority portal beyond the file/API adapter contract.
- Nationalization compliance (EPIC-16/17/18) — WPS only provides wage-payment evidence as a feed.

## Dependencies

- EPIC-02 (Country Rule Engine) · EPIC-10 (Payroll: net pay, bank details, pay dates) · EPIC-08 (Employee Records: IDs, IBANs)

## Epic Definition of Done

- [ ] Country-specific WPS/wage files (UAE SIF, Saudi Mudad, Qatar WPS, Bahrain/Oman/Kuwait controls) generate from locked payroll.
- [ ] Statutory submission/payment timing is tracked with alerts and salary-delay flagging (> statutory window).
- [ ] WPS reconciliation matches registered vs paid vs submitted wages and flags breaks.
- [ ] Exception and salary-delay management workflows are operational with audit trail.
- [ ] WPS penalty/business-impact tracking, KPIs, risk matrix and audit checklist are live.
- [ ] Monthly WPS compliance certificate, policy and document library are generated and stored.
- [ ] WPS automation runs the cycle from payroll close to submission with exception-only intervention.

---

## User Stories

### EPIC-11-S01 — WPS purpose, landscape & governance baseline

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** a configurable WPS landscape and governance model across the GCC, **so that** each legal entity's WPS obligations and controls are clearly defined.

**Description**
Establish the WPS foundation: per-country WPS scheme metadata (authority, channel, mandatory scope, statutory window), establishment-level WPS registration data, and governance roles/control points that the file-generation and submission stories build on, capturing the handbook's purpose and landscape content.

**Acceptance Criteria**

- [ ] Given the GCC landscape, when configured, then each country's WPS scheme (UAE WPS/MOHRE, Saudi Mudad/MHRSD, Qatar WPS, Bahrain LMRA, Oman, Kuwait) is represented with its channel and statutory window.
- [ ] Given a legal entity, when registered, then its WPS establishment/employer IDs and bank-agent details are captured and validated.
- [ ] Given WPS governance, when set, then control points (generate → validate → submit → reconcile → certify) are mandatory.
- [ ] Given any config change, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `wps_scheme` and `wps_establishment` schemas (country, authority, channel, statutory_window_days, employer_id)
- [ ] Backend: governance control-point service
- [ ] Frontend: WPS scheme & establishment configuration screen
- [ ] Rules/Config: per-country WPS scheme metadata
- [ ] Tests: unit tests for establishment-ID validation per country

**Covers:** 11.1, 11.2, 11.3
**Dependencies:** EPIC-02

### EPIC-11-S02 — UAE WPS (SIF) file generation

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** to generate the UAE WPS Salary Information File (SIF), **so that** wages are reported to MOHRE through the agent bank within the statutory window.

**Description**
Generate the UAE SIF in the prescribed layout (Employer Detail Record + Employee Detail Records: MOL/establishment ID, labour card/employee ID, IBAN, fixed/variable pay, days, pay period) from locked payroll, with structural and content validation before release.

**Acceptance Criteria**

- [ ] Given a locked UAE payroll period, when SIF is generated, then it produces the EDR/SCR records with correct MOL ID, labour card numbers, IBANs and pay amounts.
- [ ] Given the file, when validated, then format, mandatory fields, record counts and total-amount control are checked and errors block release.
- [ ] Given the statutory window, when the period closes, then the SIF must be submitted within the UAE WPS window and a salary-delay flag raises if exceeded.
- [ ] Given generation/release, when actioned, then it is audit-logged with file hash and totals.

**Tasks**

- [ ] Backend: UAE SIF generator (EDR + SCR layout) from locked payroll
- [ ] Backend: SIF structural/content validator with control totals
- [ ] Frontend: UAE WPS file generation + validation results screen
- [ ] Rules/Config: UAE SIF field rules and statutory window
- [ ] Alerts/Workflow: salary-delay flag on window breach
- [ ] Tests: integration tests for SIF layout and control-total validation

**Covers:** 11.4
**Dependencies:** EPIC-10, EPIC-11-S01

### EPIC-11-S03 — Saudi Arabia Wage Protection / Mudad file

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** to generate Saudi wage-protection data for Mudad, **so that** salaries comply with the Saudi Wage Protection Program and link to Qiwa/GOSI.

**Description**
Produce the Saudi Mudad payroll/wage file from locked payroll (national/Iqama IDs, IBAN, basic + allowances + deductions, GOSI-consistent wages) in the required Mudad format/API, validating against registered GOSI wages and the program's commitment/compliance rules.

**Acceptance Criteria**

- [ ] Given a locked Saudi payroll, when the Mudad file/payload is generated, then it includes Iqama/national IDs, IBANs and salary breakdown in the required format.
- [ ] Given wages, when validated, then they are checked for consistency with registered GOSI/Qiwa contract wages and discrepancies are flagged.
- [ ] Given the Mudad statutory timing, when due, then the submission window is tracked and a salary-delay flag raises on breach.
- [ ] Given generation, when complete, then it is audit-logged with totals and validation status.

**Tasks**

- [ ] Backend: Mudad file/API payload generator from locked payroll
- [ ] Backend: GOSI/Qiwa wage-consistency validation
- [ ] Frontend: Saudi Mudad generation + discrepancy view
- [ ] Rules/Config: Mudad format rules and statutory window
- [ ] Alerts/Workflow: wage-discrepancy and salary-delay alerts
- [ ] Tests: integration tests for Mudad payload and GOSI-consistency check

**Covers:** 11.5
**Dependencies:** EPIC-10, EPIC-11-S01

### EPIC-11-S04 — Qatar WPS file generation

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** to generate the Qatar WPS file, **so that** wages are reported to the MOL/Qatar WPS within the statutory window.

**Description**
Generate the Qatar WPS file (employer record + employee records: QID, IBAN, basic/allowances/net, working days, pay period) from locked payroll, with validation and statutory-timing tracking per Qatar requirements.

**Acceptance Criteria**

- [ ] Given a locked Qatar payroll, when generated, then the WPS file includes QID, IBAN and pay breakdown per the Qatar layout.
- [ ] Given the file, when validated, then mandatory fields, record counts and control totals are verified before release.
- [ ] Given the Qatar statutory window, when the period closes, then timing is tracked and a salary-delay flag raises on breach.
- [ ] Given generation/release, when actioned, then it is audit-logged.

**Tasks**

- [ ] Backend: Qatar WPS file generator from locked payroll
- [ ] Backend: validator with control totals
- [ ] Frontend: Qatar WPS generation screen
- [ ] Rules/Config: Qatar WPS layout and statutory window
- [ ] Alerts/Workflow: salary-delay flag on breach
- [ ] Tests: integration tests for Qatar layout validation

**Covers:** 11.6
**Dependencies:** EPIC-10, EPIC-11-S01

### EPIC-11-S05 — Bahrain, Oman & Kuwait wage-payment controls

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** wage-payment controls and wage files for Bahrain, Oman and Kuwait, **so that** wage-protection obligations in those countries are met.

**Description**
Implement the wage-payment/WPS controls for Bahrain (LMRA-linked wage protection), Oman (wage payment via approved channels) and Kuwait, generating each country's required wage file/evidence from locked payroll with bank-channel validation and statutory-timing tracking, configured via the rule engine.

**Acceptance Criteria**

- [ ] Given a locked payroll for Bahrain/Oman/Kuwait, when processed, then the country's required wage file/evidence is generated with CPR/Civil ID/IBAN and pay data.
- [ ] Given each country's wage-payment rules, when validated, then bank-channel and mandatory-field controls are enforced before release.
- [ ] Given statutory timing for each country, when the period closes, then payment/reporting windows are tracked and salary-delay flags raise on breach.
- [ ] Given generation, when complete, then per-country output is audit-logged.

**Tasks**

- [ ] Backend: per-country (BH/OM/KW) wage-file/evidence generators
- [ ] Backend: bank-channel + mandatory-field validators per country
- [ ] Frontend: country wage-control generation screens
- [ ] Rules/Config: BH/OM/KW wage-payment rules and windows
- [ ] Alerts/Workflow: salary-delay flags per country
- [ ] Tests: integration tests for each country's validation

**Covers:** 11.7, 11.8, 11.9
**Dependencies:** EPIC-10, EPIC-11-S01

### EPIC-11-S06 — Salary Information File / wage file controls

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** common pre-submission wage-file controls, **so that** every WPS file is complete, valid and matched to payroll before it leaves AuraOS.

**Description**
Provide a shared validation/control layer for all wage files: missing-IBAN/ID checks, amount-vs-payroll matching, duplicate-record detection, employee-coverage completeness (all paid employees present, no extras), control-total reconciliation, and a release gate (releaser ≠ preparer).

**Acceptance Criteria**

- [ ] Given any generated wage file, when controls run, then missing IBAN/ID, duplicate records, and amount mismatches vs payroll are detected and block release.
- [ ] Given coverage, when validated, then every WPS-eligible paid employee appears exactly once and non-eligible records are excluded.
- [ ] Given control totals, when checked, then file total = payroll net/wage total for the period, else flagged.
- [ ] Given release, when actioned, then it requires a separate authorized releaser and is audit-logged with file hash.

**Tasks**

- [ ] Backend: shared wage-file control engine (coverage, duplicates, totals) + release gate
- [ ] Backend: file-hash + control-total capture
- [ ] Frontend: pre-submission control summary + release screen
- [ ] Rules/Config: per-country eligibility/coverage rules
- [ ] Tests: integration tests for coverage and control-total enforcement

**Covers:** 11.10
**Dependencies:** EPIC-11-S02, EPIC-11-S03, EPIC-11-S04, EPIC-11-S05

### EPIC-11-S07 — WPS reconciliation

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** WPS reconciliation across registered, paid and submitted wages, **so that** I can prove every employee was paid the correct registered amount.

**Description**
Reconcile three views per period — registered/contract wage, payroll-paid amount, and WPS-submitted/authority-confirmed amount — at employee and aggregate level, flagging mismatches, unpaid-but-active employees and paid-but-unreported cases, with documented resolution.

**Acceptance Criteria**

- [ ] Given a period, when reconciliation runs, then registered vs paid vs submitted wages are compared per employee and in total.
- [ ] Given a mismatch (amount, missing employee, extra record), when detected, then it is flagged with type and routed to exception management.
- [ ] Given an authority confirmation/return, when ingested, then submitted-vs-confirmed status updates per employee.
- [ ] Given reconciliation, when completed, then a reconciliation pack is stored and audit-logged for the period.

**Tasks**

- [ ] Backend: three-way reconciliation engine (registered/paid/submitted) + break classification
- [ ] Backend: authority-confirmation ingest adapter
- [ ] Frontend: WPS reconciliation dashboard with break drill-down
- [ ] Rules/Config: match tolerance and country rules
- [ ] Tests: integration tests for break detection and pack generation

**Covers:** 11.11
**Dependencies:** EPIC-11-S06

### EPIC-11-S08 — WPS exception management

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** a WPS exception workflow, **so that** rejected records, mismatches and delays are tracked to resolution.

**Description**
Manage WPS exceptions (file rejections, returned records, reconciliation breaks, missing bank details, salary delays) as tracked cases with owner, root cause, corrective action, re-submission linkage and SLA, ensuring nothing falls through before certification.

**Acceptance Criteria**

- [ ] Given a rejected/returned record or reconciliation break, when raised, then a WPS exception case is created with type, owner and due date.
- [ ] Given an exception, when resolved, then root cause, corrective action and (where applicable) the re-submission reference are captured.
- [ ] Given open exceptions, when a period is certified, then certification is blocked until critical exceptions are closed or formally accepted.
- [ ] Given any exception action, when performed, then it is audit-logged.

**Tasks**

- [ ] Backend: `wps_exception` schema with lifecycle, SLA and re-submission link
- [ ] Backend: certification-gate on open critical exceptions
- [ ] Frontend: WPS exception register/board with SLA aging
- [ ] Alerts/Workflow: SLA-breach and unresolved-exception alerts
- [ ] Tests: integration tests for certification gating on open exceptions

**Covers:** 11.12
**Dependencies:** EPIC-11-S07

### EPIC-11-S09 — Salary delay controls

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** automated salary-delay detection and escalation, **so that** wages are never paid beyond the statutory window without warning.

**Description**
Track each entity's statutory pay/report window per country, project pay/submission dates from the payroll calendar, and raise tiered alerts and escalations as the window approaches and on breach (e.g., flag salary delay when wages unpaid/unreported beyond the statutory limit, typically > 15 days for UAE WPS), with management visibility.

**Acceptance Criteria**

- [ ] Given a payroll period, when the projected pay/report date nears the statutory window, then tiered alerts fire (e.g., 7/3/1 days before, and on breach).
- [ ] Given wages unpaid or unreported beyond the country's statutory limit, when detected, then a salary-delay flag is set and escalated to management.
- [ ] Given a country, when evaluated, then the correct statutory window per country drives the calculation.
- [ ] Given a salary-delay event, when raised, then it is logged for the penalty/business-impact tracker and audit trail.

**Tasks**

- [ ] Backend: salary-delay projection + breach-detection service over payroll calendar
- [ ] Backend: tiered escalation engine
- [ ] Frontend: salary-delay monitor with status per entity
- [ ] Rules/Config: per-country statutory windows and alert tiers
- [ ] Alerts/Workflow: tiered alerts + management escalation
- [ ] Tests: unit tests for window projection and breach flagging per country

**Covers:** 11.13
**Dependencies:** EPIC-11-S01, EPIC-10

### EPIC-11-S10 — WPS penalties & business-impact tracking

**Labels:** `user-story`, `wps` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** to track WPS penalties and their business impact, **so that** the cost and consequences of non-compliance are visible and managed.

**Description**
Record WPS non-compliance events and their consequences (fines, work-permit/new-visa blocks, establishment downgrades, file-rejection counts) per country, with monetary impact, status and linkage to the originating exception/delay, to inform remediation and management reporting.

**Acceptance Criteria**

- [ ] Given a non-compliance event, when logged, then its penalty type, amount, authority consequence and affected establishment are recorded.
- [ ] Given a salary delay or rejection, when it leads to a penalty, then the penalty links back to the source event for traceability.
- [ ] Given the tracker, when reviewed, then cumulative penalty cost and active business impacts (e.g., blocked permits) are shown per entity/country.
- [ ] Given any entry, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `wps_penalty` schema with impact, amount and source linkage
- [ ] Frontend: penalty & business-impact tracker view
- [ ] Rules/Config: per-country penalty/consequence reference data
- [ ] Tests: unit tests for penalty-to-source linkage

**Covers:** 11.14
**Dependencies:** EPIC-11-S08, EPIC-11-S09

### EPIC-11-S11 — WPS KPIs & dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3
**As an** Executive / Leadership user, **I want** a WPS KPI dashboard, **so that** I can monitor wage-protection compliance across countries at a glance.

**Description**
Build a WPS dashboard with on-time submission %, salary-delay incidents, file-rejection rate, reconciliation-break count, exception aging, coverage % and penalty exposure, broken down by legal entity and country with drill-down and RBAC.

**Acceptance Criteria**

- [ ] Given the dashboard, when loaded, then on-time submission %, delay incidents, rejection rate and open exceptions show per entity/country.
- [ ] Given a KPI tile, when clicked, then it drills to the underlying files/employees/exceptions.
- [ ] Given RBAC, when a user views, then only in-scope entities are visible.
- [ ] Given a period filter, when applied, then metrics recompute for that period.

**Tasks**

- [ ] Backend: WPS KPI aggregation endpoints
- [ ] Frontend: WPS KPI dashboard with drill-down + export
- [ ] Rules/Config: KPI definitions/thresholds
- [ ] Tests: integration tests for KPI computation and RBAC scoping

**Covers:** 11.16
**Dependencies:** EPIC-11-S07, EPIC-11-S08

### EPIC-11-S12 — WPS audit checklist & risk matrix

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 3
**As an** Internal Auditor, **I want** a configurable WPS audit checklist and risk matrix, **so that** wage-protection control gaps and risks are detected and remediated.

**Description**
Provide a configurable WPS audit checklist (e.g., coverage completeness, on-time submission, reconciliation closed, bank details valid, registered-vs-paid match) and a risk matrix of WPS risks (salary delay, partial payment, ghost/unreported employees, mismatched wages) with likelihood × impact scoring and remediation tracking.

**Acceptance Criteria**

- [ ] Given the checklist, when run for a period, then it flags red-flag conditions (late submission, uncovered employees, open reconciliation breaks, invalid bank data).
- [ ] Given a risk, when registered, then it carries likelihood, impact, score, owner and linked control.
- [ ] Given a finding, when raised, then it is tracked to remediation with due date and status.
- [ ] Given checklist/risk items, when configured, then they are tenant-editable.

**Tasks**

- [ ] Backend: WPS audit-rule engine + `wps_risk_register`
- [ ] Frontend: WPS audit checklist runner + risk heatmap
- [ ] Rules/Config: configurable red-flag rules and scoring
- [ ] Alerts/Workflow: overdue-remediation alerts
- [ ] Tests: integration tests for red-flag detection

**Covers:** 11.15, 11.17
**Dependencies:** EPIC-11-S07

### EPIC-11-S13 — HRMS WPS automation design

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**As a** System Administrator, **I want** WPS automation wired to payroll close, **so that** wage files generate, validate and submit with exception-only intervention.

**Description**
Implement the WPS automation design: on payroll lock, auto-generate the country wage file, auto-run controls, auto-submit (or stage for release) via the authority/bank adapter, ingest confirmations, auto-trigger reconciliation, and notify on exceptions/delays — all event-driven and configurable per entity.

**Acceptance Criteria**

- [ ] Given a payroll lock event, when received, then the correct country wage file is auto-generated and validated.
- [ ] Given a clean file, when controls pass, then it auto-submits or stages for authorized release per config; on failure it halts with exceptions.
- [ ] Given an authority confirmation/return, when received, then reconciliation auto-triggers and statuses update.
- [ ] Given automation config, when changed, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: WPS orchestrator consuming payroll-lock events + submission/confirmation adapters
- [ ] Backend: event-driven generate→validate→submit→reconcile pipeline
- [ ] Frontend: WPS automation configuration console
- [ ] Alerts/Workflow: stage notifications + exception halts
- [ ] Tests: e2e test of automated WPS cycle with and without exceptions

**Covers:** 11.18
**Dependencies:** EPIC-10, EPIC-11-S06, EPIC-11-S07

### EPIC-11-S14 — WPS document library, policy & monthly certificate

**Labels:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** a WPS document library, compliance policy and monthly compliance certificate, **so that** wage-protection evidence and governance are standardized and auditable.

**Description**
Maintain a WPS document library (per-period files, confirmations, reconciliation packs, exception logs), a configurable WPS compliance policy template, and a monthly WPS compliance certificate attesting timely payment, full coverage, reconciliation and exception closure, with the key-takeaways reference; all versioned and exportable.

**Acceptance Criteria**

- [ ] Given a period, when closed, then all WPS artifacts (files, confirmations, reconciliation pack, exceptions) are filed in the document library against the period/entity.
- [ ] Given the policy template, when configured, then it can be versioned, published and acknowledged.
- [ ] Given the monthly certificate, when generated, then it attests on-time payment, coverage %, reconciliation status and exception closure, signed off by the authorized role.
- [ ] Given export, when requested, then policy, certificate and library items export to PDF and are audit-logged.

**Tasks**

- [ ] Backend: WPS document-library store keyed by period/entity + certificate generator
- [ ] Backend: configurable WPS policy template with versioning
- [ ] Frontend: WPS document library + policy editor + certificate view with e-sign/export
- [ ] Rules/Config: certificate attestation fields per country
- [ ] Tests: integration tests for certificate attestation gating on reconciliation/exceptions

**Covers:** 11.19, 11.20, 11.21, 11.22
**Dependencies:** EPIC-11-S07, EPIC-11-S08
