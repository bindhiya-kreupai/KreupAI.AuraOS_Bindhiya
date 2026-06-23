# EPIC-15: Chapter 15 – Bahrain SIO Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 15 – Bahrain SIO Compliance
> **Module:** Social Insurance · **Labels:** `epic`, `gcc-compliance`, `social-insurance`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a complete Bahrain SIO (Social Insurance Organisation) compliance engine in AuraOS that registers the employer and employees, derives the SIO contribution salary from the salary structure, calculates employer and employee contributions for Bahraini and expatriate workers (including the SIO-administered expatriate end-of-service gratuity scheme) using configurable rates in the country rule engine, produces the monthly SIO submission, reconciles SIO to payroll, aligns with LMRA, and generates the monthly SIO compliance pack, certificate and variance register. The outcome keeps SIO in lock-step with payroll, LMRA and exits so the entity meets its social-insurance and expatriate-gratuity-funding obligations without manual reconciliation.

## Business Value

SIO under-registration, wage-base mismatches, late payment, or failure to fund the expatriate end-of-service gratuity scheme expose Bahrain entities to fines, back-contributions, and LMRA/work-permit complications. Automating contribution-salary derivation, dual-population contribution calculation (Bahraini insurance branches and expatriate gratuity funding), LMRA alignment, and monthly reconciliation removes spreadsheet risk, gives Compliance Officers an audit-ready monthly pack, and protects both the employer's standing and employees' insurance/gratuity entitlements.

## Requirements Covered (handbook sections)

- 15.1 Introduction
- 15.2 Purpose of SIO
- 15.3 Applicability of SIO
- 15.4 SIO Contribution Framework
- 15.5 Employer Responsibilities
- 15.6 Employer Registration and Access
- 15.7 Employee Registration
- 15.8 Contribution Salary
- 15.9 Monthly SIO Process
- 15.10 Salary Updates
- 15.11 Expatriate End-of-Service Gratuity Funding
- 15.12 Employee Exits and SIO
- 15.13 SIO and LMRA Alignment
- 15.14 SIO and Payroll Reconciliation
- 15.15 SIO Audit Checklist
- 15.16 SIO KPIs
- 15.17 SIO Risk Matrix
- 15.18 HRMS SIO Automation Design
- 15.19 SIO Dashboard
- 15.20 Monthly SIO Compliance Pack
- 15.21 Sample SIO Monthly Compliance Certificate
- 15.22 Sample SIO Variance Register
- 15.23 Key Takeaways

## Out of Scope

- Direct live API integration with the SIO portal (handled by a separate connectors epic); this epic produces submission-ready files and a guided upload workflow.
- LMRA work-permit issuance/renewal mechanics, covered in the Immigration epic — this epic models the SIO↔LMRA alignment only.
- End-of-service gratuity calculation/entitlement mechanics, covered in the EOSB epic — this epic models the SIO-administered expatriate-gratuity funding and interaction only.
- General payroll run mechanics, covered in the Payroll epic — this epic consumes payroll outputs and writes back SIO deductions.

## Dependencies

- EPIC-02 (Regulatory Framework — country rule engine baseline, SIO/LMRA references)
- EPIC-10 (Payroll Management & Processing — salary structure, deductions, payroll run)
- EPIC-06 (Employee Onboarding — social insurance onboarding handover)

## Epic Definition of Done

- [ ] Employer registration/access and employee registration are managed with status tracking and audit.
- [ ] SIO contribution salary is derived from configured components with floor/ceiling caps and recalculated on salary change.
- [ ] Employer/employee SIO rates and the expatriate-gratuity-funding rate are configurable per country/nationality with effective-dating.
- [ ] Monthly SIO process produces a validated submission file with maker-checker approval and deadline tracking.
- [ ] Expatriate end-of-service gratuity funding and exits update SIO correctly; SIO service feeds EOSB.
- [ ] SIO↔LMRA alignment, SIO↔payroll reconciliation, variance register, monthly pack, and certificate are delivered.
- [ ] SIO dashboard, KPIs, audit checklist and risk matrix are live with RBAC.

---

## User Stories

### EPIC-15-S01 — SIO Foundation, Applicability & Contribution Framework

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** SIO purpose, applicability and the contribution framework modelled as configurable reference data, **so that** AuraOS applies the correct SIO rules to Bahraini and expatriate populations.

**Description**
Establishes the SIO domain in AuraOS: who is in scope (Bahraini nationals under the social-insurance branches; expatriates under the SIO-administered end-of-service gratuity scheme), the purpose/coverage notes, and the contribution framework distinguishing Bahraini insurance branches (e.g. old-age/disability/death, unemployment) from expatriate gratuity funding. Applicability is nationality-driven and anchors the calculation engine.

**Acceptance Criteria**

- [ ] Given a Bahrain legal entity, when SIO settings are opened, then scope can be enabled and applicability rules (Bahraini vs expatriate) configured.
- [ ] Given a Bahraini national, when configured, then the social-insurance branches apply; given an expatriate, then the expatriate gratuity-funding scheme applies per configuration.
- [ ] Given the contribution framework, when set up, then employer and employee shares per branch and the expatriate gratuity rate are modelled as distinct configurable components.
- [ ] Given contextual help, then purpose/scope guidance (15.1–15.3) is available inline from a configurable content table.
- [ ] Given any applicability/framework change, then it is versioned with effective date and audited.

**Tasks**

- [ ] Backend: `sio_establishment` + `sio_applicability_rule` entities (nationalityClass, branchSet, effectiveFrom)
- [ ] Backend: `sio_contribution_framework` config (branches + expat gratuity component)
- [ ] Backend: rule-engine loader resolving applicability + framework by date
- [ ] Frontend: SIO settings screen (scope, applicability matrix, framework)
- [ ] Rules/Config: Bahraini branch set + expatriate gratuity scheme seed
- [ ] Tests: unit tests for applicability resolution by nationality

**Covers:** 15.1, 15.2, 15.3, 15.4
**Dependencies:** EPIC-02

### EPIC-15-S02 — Employer Responsibilities & Compliance Calendar

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** SIO employer duties encoded as a recurring obligation calendar, **so that** registration, monthly contribution, updates, gratuity funding and exits are tracked to deadline.

**Description**
Models employer SIO obligations (register establishment/access, register employees on time, declare correct contribution salary, pay contributions and fund expatriate gratuity by the statutory monthly deadline, update salary changes, de-register leavers) as trackable obligations with owners, SLAs and alert schedules driving the worklist and dashboard.

**Acceptance Criteria**

- [ ] Given the SIO obligation set, when configured, then each duty has owner role, frequency and statutory due-day.
- [ ] Given a monthly cycle, when the deadline approaches, then alerts fire at 7/3/1 days to the Payroll Officer and Compliance Officer.
- [ ] Given an overdue obligation, then it is flagged red and escalated to HR Manager.
- [ ] Given any obligation change, then it is audited.
- [ ] Given RBAC, only Compliance Officer / System Administrator may edit the calendar.

**Tasks**

- [ ] Backend: `sio_obligation` entity (code, ownerRole, frequency, dueDayOfMonth, slaDays, alertOffsets[])
- [ ] Backend: scheduler emitting obligation events
- [ ] Frontend: SIO obligation calendar + worklist
- [ ] Alerts/Workflow: 7/3/1-day alerts + overdue escalation
- [ ] Tests: integration test for alerts/escalation

**Covers:** 15.5
**Dependencies:** EPIC-15-S01

### EPIC-15-S03 — Employer Registration & Portal Access

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** to register and maintain the employer's SIO establishment record and portal access, **so that** the entity is correctly enrolled and its SIO registration drives all employee filings.

**Description**
Captures and validates the employer SIO establishment registration: SIO establishment/employer number, registration date, status, portal-access details, and linkage to the Bahrain legal entity, with multi-establishment support. This record is the parent for all employee SIO registrations and monthly files.

**Acceptance Criteria**

- [ ] Given a Bahrain legal entity, when registered, then the SIO establishment number, registration date and portal-access reference are captured and format-validated.
- [ ] Given multiple legal entities, when each is registered, then each files independently under its own establishment.
- [ ] Given an establishment status change, when recorded, then dependent employee processing respects it.
- [ ] Given missing establishment registration, when employee registration is attempted, then it is blocked with a clear message.
- [ ] Given any establishment/access change, then it is audited.

**Tasks**

- [ ] Backend: extend `sio_establishment` (establishmentNo, registrationDate, status, portalAccessRef) + migration
- [ ] Backend: guard preventing employee registration without active establishment
- [ ] Frontend: employer SIO establishment + access management screen
- [ ] Rules/Config: per-entity establishment configuration
- [ ] Tests: unit tests for validation and block-without-establishment

**Covers:** 15.6
**Dependencies:** EPIC-15-S01

### EPIC-15-S04 — SIO Employee Registration

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** to register Bahraini and expatriate employees with SIO on hire into the correct scheme, **so that** every worker is enrolled from their join date with the right branches.

**Description**
On hire, AuraOS prepares an SIO registration using CPR/passport, nationality, occupation, join date and contribution salary, and enrols the worker into the correct scheme (Bahraini insurance branches vs expatriate gratuity funding). Generates the registration request/file and tracks the returned SIO registration number. Handles late-registration flagging.

**Acceptance Criteria**

- [ ] Given a new hire, when onboarding completes, then an SIO registration record is auto-created with validated mandatory fields (CPR for Bahrainis / passport for expats, nationality, occupation, join date, contribution salary).
- [ ] Given a Bahraini national, when registered, then social-insurance branches are enrolled; given an expatriate, then the gratuity-funding scheme is enrolled (per configurable rule).
- [ ] Given registration not completed within the configured window from join date, then it is flagged "late registration" and surfaced on the dashboard.
- [ ] Given a returned SIO number, when entered, then it is stored and the record marked Active.
- [ ] Given any registration action, then it is audited; RBAC restricts submission to HR Admin / Payroll Officer.

**Tasks**

- [ ] Backend: `sio_member_registration` entity (employeeId, cprOrPassport, nationality, occupation, joinDate, schemeEnrolment[], sioNumber, status)
- [ ] Backend: registration file builder + late-registration detector
- [ ] Backend: consumer on `employee.hired` creating registration draft
- [ ] Frontend: SIO registration worklist + detail screen with validation
- [ ] Rules/Config: scheme-enrolment-by-nationality rule (Bahraini vs expat)
- [ ] Alerts/Workflow: late-registration alert at join+N days
- [ ] Tests: unit tests for scheme enrolment; e2e hire→registration draft

**Covers:** 15.7
**Dependencies:** EPIC-15-S03, EPIC-06

### EPIC-15-S05 — SIO Contribution Salary Derivation

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** the SIO contribution salary derived automatically from the salary structure with floor/ceiling caps, **so that** contributions use the legally correct salary base.

**Description**
Defines the SIO contribution salary as a configurable composition of salary components (e.g. basic + social allowance + specified allowances) with statutory minimum and maximum ceilings. The rule engine maps eligible components, applies caps and rounding, and produces the contribution-salary snapshot that feeds the calculation engine for both Bahraini insurance and expatriate gratuity computations.

**Acceptance Criteria**

- [ ] Given a salary structure, when SIO salary rules are configured, then included components are selectable per country/nationality and the engine computes the contribution salary.
- [ ] Given the statutory floor and ceiling, when the computed salary is outside, then it is floored/capped and the adjustment shown.
- [ ] Given Bahraini vs expatriate, when their salary is derived, then the applicable component set and caps can differ per the configured rule.
- [ ] Given a component-eligibility change, then it is effective-dated and recalculates prospectively.
- [ ] Given any derivation, then the breakdown (components + caps) is stored and viewable for audit.

**Tasks**

- [ ] Backend: `sio_salary_rule` config (countryCode, nationalityClass, includedComponentCodes[], minSalary, maxSalary, rounding, effectiveFrom)
- [ ] Backend: contribution-salary service + `sio_contribution_salary` per-period snapshot with derivation JSON
- [ ] Frontend: salary-rule config + per-employee breakdown viewer
- [ ] Rules/Config: Bahrain floor/ceiling + component sets (Bahraini vs expat)
- [ ] Tests: unit tests for capping, inclusion, rounding

**Covers:** 15.8
**Dependencies:** EPIC-15-S01, EPIC-10

### EPIC-15-S06 — SIO Contribution Calculation Engine (Employer/Employee, Configurable Rates)

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 13
**As a** Payroll Officer, **I want** SIO employer and employee contributions calculated per branch using configurable nationality-specific rates, **so that** the correct amounts are deducted and remitted each month for both Bahrainis and expatriates.

**Description**
The engine takes the contribution salary and applies branch-specific employer and employee percentage rates that are fully configurable per country and nationality in the rule engine — Bahraini insurance branches (old-age/disability/death, unemployment) with employer/employee splits, and the expatriate gratuity-funding rate (employer-funded). All rates are effective-dated so historical periods recompute with the rate in force at the time. The employee portion flows back to payroll as a deduction.

**Acceptance Criteria**

- [ ] Given a contribution salary and active rate set, when calculation runs, then employer and employee amounts are computed per branch and summed per employee.
- [ ] Given a Bahraini national, when calculated, then the insurance-branch employer% + employee% are applied per configuration; given an expatriate, then the gratuity-funding employer rate applies.
- [ ] Given effective-dated rates, when a historical period is recomputed, then the rate in force for that period is used.
- [ ] Given calculation completes, then the employee contribution is posted back to payroll as a statutory deduction for the period.
- [ ] Given a new country/nationality rate added in config, then the engine uses it with no code change.
- [ ] Given any calculation, then inputs and outputs are persisted for audit and reconciliation.

**Tasks**

- [ ] Backend: `sio_rate_config` (countryCode, nationalityClass, branchCode, employerRate, employeeRate, effectiveFrom/To)
- [ ] Backend: calculation service producing `sio_contribution_line` per employee/period/branch
- [ ] Backend: employee-deduction write-back to payroll
- [ ] Frontend: rate config grid with effective-dating and Bahraini/expat tabs
- [ ] Rules/Config: seed Bahrain insurance branches + expat gratuity rate
- [ ] Tests: unit tests for per-branch/per-nationality math, effective-date selection, payroll write-back

**Covers:** 15.4 (calculation aspect)
**Dependencies:** EPIC-15-S05

### EPIC-15-S07 — Monthly SIO Process & Submission File

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 13
**As a** Payroll Officer, **I want** a guided monthly SIO cycle that compiles members, validates data, and produces the submission file with maker-checker approval, **so that** the monthly declaration is accurate, on time and auditable.

**Description**
Orchestrates the monthly SIO run: snapshot active members, pull contribution salaries and calculated contributions (insurance + expat gratuity funding), run pre-submission validations (missing SIO numbers, salary anomalies, unregistered joiners, exited-still-listed), and generate the SIO-format submission file. Maker-checker enforces preparer ≠ approver, and the deadline is tracked.

**Acceptance Criteria**

- [ ] Given an open SIO period, when started, then a member snapshot is created and validations flag missing numbers, zero/negative salaries, unregistered active employees, and exited-still-listed members.
- [ ] Given validations pass, when the preparer submits, then maker-checker requires an approver different from the preparer.
- [ ] Given approval, then the submission file is generated in the prescribed format and the period locked.
- [ ] Given the statutory deadline, when within 7/3/1 days, then alerts fire; unapproved periods are flagged overdue.
- [ ] Given the file is generated, then a guided upload step records confirmation and reference.
- [ ] Given any step, then state transitions are audited.

**Tasks**

- [ ] Backend: `sio_monthly_run` entity (period, status, snapshotAt, preparedBy, approvedBy, fileRef, uploadRef)
- [ ] Backend: validation set + submission-file builder (insurance + gratuity)
- [ ] Backend: maker-checker state machine via workflow engine
- [ ] Frontend: monthly SIO run dashboard (snapshot→validate→approve→generate→upload)
- [ ] Alerts/Workflow: deadline countdown + overdue escalation
- [ ] Tests: integration test for full cycle incl. preparer≠approver and period lock

**Covers:** 15.9
**Dependencies:** EPIC-15-S04, EPIC-15-S06, EPIC-15-S02

### EPIC-15-S08 — Salary Updates & SIO Wage Changes

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** SIO contribution salaries to update automatically on salary change with an SIO update record, **so that** declared salaries always match current pay and we avoid under/over-declaration.

**Description**
When a salary change is recorded, the SIO contribution salary is recalculated, the delta detected, and an SIO update entry queued for the next monthly process (or amendment). Effective dating ensures the change applies from the correct period; backdated changes flag prior periods for adjustment.

**Acceptance Criteria**

- [ ] Given a salary change, when saved, then the SIO contribution salary is recalculated and compared to the last declared salary.
- [ ] Given a material delta, when detected, then an SIO update record is created with effective date and queued.
- [ ] Given a backdated change, when processed, then prior periods are flagged for amendment rather than silently changed.
- [ ] Given a queued update, then Payroll Officer is notified and it appears in the salary-change log.
- [ ] Given any update, then before/after salary and effective date are audited.

**Tasks**

- [ ] Backend: consumer on `employee.salaryChanged` → recompute contribution salary + create `sio_salary_update`
- [ ] Backend: delta detection + backdated amendment flagging
- [ ] Frontend: SIO salary-change log + queued updates view
- [ ] Alerts/Workflow: notify Payroll Officer of pending updates
- [ ] Tests: unit tests for delta detection and effective-date handling

**Covers:** 15.10
**Dependencies:** EPIC-15-S05, EPIC-15-S07

### EPIC-15-S09 — Expatriate End-of-Service Gratuity Funding

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** the SIO-administered expatriate end-of-service gratuity funding modelled and remitted monthly, **so that** the employer meets the statutory monthly gratuity-funding obligation for expatriate workers.

**Description**
Under Bahrain's reform, expatriate end-of-service gratuity is funded through monthly SIO contributions rather than a lump sum at exit. This story computes the monthly employer gratuity-funding amount per expatriate from the contribution salary at the configured rate, includes it in the monthly SIO file, tracks accumulated funded gratuity per employee, and exposes the funded balance to the EOSB module so the final settlement reflects what SIO has already funded.

**Acceptance Criteria**

- [ ] Given an expatriate, when the monthly SIO run executes, then the employer gratuity-funding amount is computed from the contribution salary at the configured (effective-dated) rate and included in the file.
- [ ] Given monthly funding, when accumulated, then a per-employee funded-gratuity balance is maintained and viewable.
- [ ] Given the funding rate varies by service tenure (if configured), then the correct band is applied per the rule engine.
- [ ] Given an EOSB calculation request, then the SIO-funded gratuity balance is exposed so final settlement nets it correctly.
- [ ] Given any funding entry, then it is persisted for audit and reconciliation.

**Tasks**

- [ ] Backend: gratuity-funding calculation in the engine producing `sio_gratuity_funding_line` per expat/period
- [ ] Backend: per-employee `sio_funded_gratuity_balance` accumulator
- [ ] Backend: expose funded-gratuity API for EOSB
- [ ] Frontend: expat gratuity-funding view (monthly + accumulated balance)
- [ ] Rules/Config: expat gratuity-funding rate (optionally tenure-banded), effective-dated
- [ ] Tests: unit tests for funding calc, accumulation, tenure bands

**Covers:** 15.11
**Dependencies:** EPIC-15-S06, EPIC-15-S07

### EPIC-15-S10 — Employee Exits & SIO De-registration / Settlement Interaction

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** SIO exits handled — de-registration, final-period contribution, and the gratuity/end-of-service interaction — **so that** leavers are removed correctly and SIO data feeds the final settlement.

**Description**
On separation, AuraOS computes the final-period SIO contribution and gratuity funding, triggers de-registration with the correct reason, excludes the leaver from the next file, and exposes the SIO service period and funded-gratuity balance to the EOSB/final-settlement module. Prevents continued contribution for exited employees.

**Acceptance Criteria**

- [ ] Given an exit, when the leaving date is set, then the final-period SIO contribution and gratuity funding are prorated and de-registration queued with the correct reason code.
- [ ] Given the leaver, when the next monthly snapshot runs, then they are excluded after their leaving date and flagged if still active.
- [ ] Given SIO history, when an end-of-service/settlement calculation is requested, then the SIO service period and funded-gratuity balance are exposed to the EOSB epic.
- [ ] Given a de-registration deadline, then alerts fire if not completed on time.
- [ ] Given any exit action, then it is audited.

**Tasks**

- [ ] Backend: consumer on `employee.separationInitiated` → final SIO + gratuity proration + de-registration
- [ ] Backend: snapshot exclusion + "exited but still contributing" red-flag
- [ ] Backend: expose SIO service-period + funded-gratuity API for EOSB
- [ ] Frontend: SIO exit/de-registration panel in separation flow
- [ ] Alerts/Workflow: de-registration deadline alert
- [ ] Tests: unit tests for proration and exclusion

**Covers:** 15.12
**Dependencies:** EPIC-15-S06, EPIC-15-S07, EPIC-15-S09

### EPIC-15-S11 — SIO ↔ LMRA Alignment

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** SIO registrations reconciled against LMRA work-permit records, **so that** every SIO-registered worker has a valid LMRA permit and discrepancies are caught.

**Description**
SIO membership and LMRA work-permit status must align for expatriates (and the active workforce generally). This story cross-checks the SIO member list against LMRA permit data, flags workers in SIO without a valid LMRA permit (or vice versa), aligns leaving/cancellation events between SIO de-registration and LMRA permit cancellation, and surfaces mismatches for action.

**Acceptance Criteria**

- [ ] Given SIO members and LMRA permit data, when alignment runs, then workers in SIO without a valid LMRA permit (and permitted workers missing from SIO) are flagged.
- [ ] Given an exit, when SIO de-registration occurs, then the corresponding LMRA permit cancellation status is checked and a mismatch flagged if inconsistent.
- [ ] Given expired/cancelled LMRA permits, then affected SIO records are flagged for review.
- [ ] Given the alignment results, then they feed the dashboard, audit checklist, and variance handling.
- [ ] Given any alignment flag, then it is audited.

**Tasks**

- [ ] Backend: SIO↔LMRA alignment service comparing member list vs permit data
- [ ] Backend: mismatch classification (SIO-only, LMRA-only, exit-cancellation mismatch)
- [ ] Frontend: SIO–LMRA alignment panel with drill-down
- [ ] Rules/Config: alignment thresholds and exit-event matching window
- [ ] Tests: unit tests for mismatch detection across scenarios

**Covers:** 15.13
**Dependencies:** EPIC-15-S04, EPIC-15-S07

### EPIC-15-S12 — SIO ↔ Payroll Reconciliation

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** an automated reconciliation between the SIO declaration and the payroll run, **so that** every deduction, employer cost and gratuity-funding amount ties out before submission.

**Description**
Each cycle, AuraOS reconciles SIO contributions against payroll: employee SIO deduction in payroll vs engine, employer cost and expat gratuity funding vs GL accrual, SIO headcount vs active payroll headcount, and per-employee contribution salary vs payroll salary. Discrepancies are categorised and pushed to the variance register with materiality thresholds.

**Acceptance Criteria**

- [ ] Given a closed SIO run and payroll run, when reconciliation executes, then it compares employee deduction, employer cost, gratuity funding, headcount, and per-employee contribution salary.
- [ ] Given a variance above threshold, when found, then it is classified (missing member, salary mismatch, rate mismatch, gratuity-funding mismatch, exited-still-listed) and written to the variance register.
- [ ] Given a clean reconciliation, then a "reconciled" status is set and required for monthly pack sign-off.
- [ ] Given an unreconciled variance, when the pack is generated, then it is blocked or requires explicit override with reason.
- [ ] Given any reconciliation/override, then it is audited.

**Tasks**

- [ ] Backend: reconciliation service comparing SIO lines (incl. gratuity) vs payroll vs GL accrual
- [ ] Backend: `sio_variance` entity with category and threshold-breach flag
- [ ] Backend: materiality-threshold config
- [ ] Frontend: reconciliation results screen with employee drill-down
- [ ] Alerts/Workflow: block/override gate on unreconciled variances
- [ ] Tests: integration test across matched/mismatched scenarios

**Covers:** 15.14
**Dependencies:** EPIC-15-S06, EPIC-15-S07, EPIC-15-S09, EPIC-10

### EPIC-15-S13 — SIO Audit Checklist & Risk Matrix

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable SIO audit checklist and risk matrix with red-flag detection, **so that** I can verify compliance and track risks to closure.

**Description**
Provides a configurable SIO audit checklist (registration timeliness, contribution-salary correctness, rate accuracy, submission timeliness, expat gratuity-funding completeness, LMRA alignment, exit de-registration, reconciliation completeness) and a risk matrix seeded with common SIO risks (under-declaration, late registration, unfunded gratuity, LMRA mismatch, late payment). System red-flags auto-populate findings; risks are tracked with owners and mitigation.

**Acceptance Criteria**

- [ ] Given the checklist, when run for a period, then each item is scored Pass/Fail/NA with evidence links.
- [ ] Given system red-flags (late registration, unreconciled variance, LMRA mismatch, exited-still-listed), when present, then they auto-create findings.
- [ ] Given the risk matrix, then each risk has likelihood, impact, score, owner, mitigation, with a heatmap.
- [ ] Given a failed item, then a corrective action can be raised and tracked.
- [ ] Given RBAC, only Internal Auditor / Compliance Officer may edit templates and risks.

**Tasks**

- [ ] Backend: `sio_audit_checklist_template` + `sio_audit_result` + `sio_risk` entities
- [ ] Backend: red-flag-to-finding generator
- [ ] Frontend: checklist runner + risk heatmap
- [ ] Alerts/Workflow: corrective-action raise and reminders
- [ ] Tests: unit tests for scoring and auto-findings

**Covers:** 15.15, 15.17
**Dependencies:** EPIC-15-S04, EPIC-15-S07, EPIC-15-S11, EPIC-15-S12

### EPIC-15-S14 — SIO KPIs & Dashboard

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership user, **I want** an SIO KPI dashboard, **so that** I can see social-insurance compliance health, contribution/gratuity trends and exceptions at a glance.

**Description**
Delivers SIO KPIs (registration timeliness %, on-time submission %, reconciliation pass rate, contribution-salary coverage, gratuity-funding completeness, LMRA-alignment exceptions, variance count/value, late-registration count, exited-still-listed count, employer/employee totals) and a role-based dashboard with trend charts and drill-down, filterable by entity, nationality and period.

**Acceptance Criteria**

- [ ] Given SIO data, when the dashboard loads, then KPIs render with value, target and trend.
- [ ] Given filters (entity, nationality, period), when applied, then tiles and charts update consistently.
- [ ] Given a KPI breaching target, then it is red with drill-down to records.
- [ ] Given RBAC, Executives see summary tiles; Payroll/Compliance see operational drill-downs.
- [ ] Given export, then KPI snapshots export for the monthly pack.

**Tasks**

- [ ] Backend: KPI aggregation service + materialized views
- [ ] Backend: KPI definition config (target, formula, direction)
- [ ] Frontend: SIO dashboard with tiles, charts, drill-down, filters
- [ ] Rules/Config: KPI targets per entity
- [ ] Tests: unit tests for KPI calculations and filters

**Covers:** 15.16, 15.19
**Dependencies:** EPIC-15-S07, EPIC-15-S12

### EPIC-15-S15 — HRMS SIO Automation Design (Events, Rule Engine, Workflow)

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** the SIO module wired into the event bus, country rule engine and workflow engine, **so that** SIO runs straight-through and is fully configurable per country/nationality.

**Description**
Defines end-to-end automation: hire/salary-change/exit events trigger SIO actions; the rule engine holds all SIO parameters (applicability, contribution-salary rules, employer/employee rates, expat gratuity-funding rate, caps, deadlines) configurable per country and nationality with effective-dating; the workflow engine drives maker-checker and approvals; notifications/audit are standardised. This is the integration backbone made explicit and testable.

**Acceptance Criteria**

- [ ] Given the rule engine, when an SIO parameter changes, then no deployment is needed and it is effective-dated.
- [ ] Given domain events (`employee.hired`, `employee.salaryChanged`, `employee.separationInitiated`, `payroll.run.completed`), then SIO handlers react idempotently.
- [ ] Given the workflow engine, then SIO maker-checker/escalation paths are reusable and configurable.
- [ ] Given an unconfigured country/nationality, when SIO runs, then it fails safe with a clear error rather than wrong numbers.
- [ ] Given all SIO actions, then a standardised audit envelope is recorded.

**Tasks**

- [ ] Backend: SIO event handlers with idempotency keys
- [ ] Backend: rule-engine namespace `sio.*` with effective-dated parameter store
- [ ] Backend: workflow templates for SIO approvals
- [ ] Backend: fail-safe guard for missing config
- [ ] Rules/Config: parameterise applicability, salary rules, rates, gratuity rate, caps, deadlines per country/nationality
- [ ] Tests: integration tests for idempotency and fail-safe

**Covers:** 15.18
**Dependencies:** EPIC-15-S06, EPIC-15-S07

### EPIC-15-S16 — Monthly SIO Compliance Pack

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** a one-click Monthly SIO Compliance Pack, **so that** I have a complete sign-off-ready evidence bundle each month.

**Description**
Compiles the period's SIO artefacts into one downloadable pack: submission file reference + upload confirmation, reconciliation summary, variance register, KPI snapshot, gratuity-funding summary, LMRA-alignment exceptions, and the compliance certificate. Requires sign-off, is versioned and archived for retention.

**Acceptance Criteria**

- [ ] Given a closed and reconciled SIO period, when the pack is generated, then it includes file ref/upload confirmation, reconciliation summary, variance register, KPI snapshot, gratuity-funding summary, and LMRA-alignment exceptions.
- [ ] Given the pack, then it requires Compliance Officer sign-off before Final.
- [ ] Given an unreconciled period, when generation is attempted, then it is blocked or flagged with outstanding items.
- [ ] Given a finalised pack, then it is archived immutably with version/retention metadata.
- [ ] Given export, then PDF and Excel outputs are produced.

**Tasks**

- [ ] Backend: compliance-pack assembler aggregating run/recon/variance/KPI/gratuity/LMRA artefacts
- [ ] Backend: immutable archive + retention metadata
- [ ] Frontend: pack preview + sign-off
- [ ] Alerts/Workflow: sign-off request to Compliance Officer
- [ ] Tests: integration test for pack contents and block-on-unreconciled

**Covers:** 15.20
**Dependencies:** EPIC-15-S07, EPIC-15-S09, EPIC-15-S11, EPIC-15-S12, EPIC-15-S14

### EPIC-15-S17 — Sample SIO Monthly Compliance Certificate (Configurable Form)

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** a configurable SIO Monthly Compliance Certificate auto-populated from period data with attestation, **so that** I can certify and evidence SIO compliance.

**Description**
Provides a digital, template-driven SIO certificate auto-populated from the period (entity, establishment number, period, member count by population, total contribution salary, employer/employee totals, gratuity-funding total, submission reference, reconciliation status) with an e-attestation block. Configurable per entity, exports to PDF.

**Acceptance Criteria**

- [ ] Given a finalised SIO period, when generated, then the certificate auto-populates entity, establishment number, period, member count, salary base, employer/employee totals, gratuity-funding total, submission reference, and reconciliation status.
- [ ] Given the template, when configured, then header/footer/clauses/logo are editable per entity without code.
- [ ] Given the certifying user, when they attest, then an e-signature with name, role and timestamp is recorded.
- [ ] Given generation, then it exports to PDF and attaches to the monthly pack.
- [ ] Given any certificate, then it is audited and versioned.

**Tasks**

- [ ] Backend: certificate template engine + period data-binding
- [ ] Backend: e-attestation capture and versioning
- [ ] Frontend: template editor + generate/attest screen
- [ ] Rules/Config: per-entity template configuration
- [ ] Tests: unit test for data-binding and PDF export

**Covers:** 15.21
**Dependencies:** EPIC-15-S16

### EPIC-15-S18 — Sample SIO Variance Register (Configurable Register)

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 3
**As a** Payroll Officer, **I want** a configurable SIO Variance Register capturing every reconciliation discrepancy with status tracking, **so that** variances are explained, actioned and closed with an audit trail.

**Description**
A digital register listing each SIO variance (employee, type, declared vs payroll value, amount, period, root cause, action, owner, status) fed automatically from reconciliation and LMRA-alignment, editable for resolution. Supports filtering, ageing and export, feeding the monthly pack and audit checklist.

**Acceptance Criteria**

- [ ] Given reconciliation/alignment variances, when generated, then each is recorded with type, amounts, period, owner and Open status.
- [ ] Given a variance, when resolved, then root cause, corrective action and resolution date are captured and status moves to Closed.
- [ ] Given ageing beyond threshold, then it is escalated and flagged.
- [ ] Given filters (type, status, period, entity, owner), then the register updates and exports to Excel/PDF.
- [ ] Given any edit, then it is audited.

**Tasks**

- [ ] Backend: `sio_variance_register` view/entity with resolution fields (incl. LMRA-mismatch type)
- [ ] Backend: ageing + escalation logic
- [ ] Frontend: register grid with filters, status workflow, export
- [ ] Alerts/Workflow: ageing escalation to HR/Compliance Manager
- [ ] Tests: unit tests for ageing/escalation and status transitions

**Covers:** 15.22
**Dependencies:** EPIC-15-S12, EPIC-15-S11

### EPIC-15-S19 — SIO Key Takeaways & In-Product Guidance

**Labels:** `user-story`, `social-insurance` · **Priority:** Could · **Estimate:** 2
**As an** HR Admin, **I want** SIO key takeaways and best-practice guidance surfaced in-product, **so that** users understand obligations and avoid common SIO mistakes.

**Description**
Surfaces the chapter's key takeaways as a configurable guidance panel and a short readiness checklist for new SIO module users (register on time, declare correct salary, fund expat gratuity monthly, align with LMRA, reconcile before submit, de-register leavers). Content is admin-editable, versioned, EN/AR.

**Acceptance Criteria**

- [ ] Given the SIO module home, when opened, then a key-takeaways panel shows configurable guidance.
- [ ] Given a first-time user, then a short readiness checklist of SIO essentials is shown.
- [ ] Given guidance content, when edited, then it is versioned and effective-dated.
- [ ] Given localisation, then guidance supports English/Arabic.

**Tasks**

- [ ] Backend: `sio_guidance_content` table (key, body, locale, version)
- [ ] Frontend: key-takeaways panel + first-run checklist
- [ ] Rules/Config: admin-editable guidance EN/AR
- [ ] Tests: unit test for versioning and locale fallback

**Covers:** 15.23
**Dependencies:** EPIC-15-S01
