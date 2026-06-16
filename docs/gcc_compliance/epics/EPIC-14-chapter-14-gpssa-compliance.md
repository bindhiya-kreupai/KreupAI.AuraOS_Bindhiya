# EPIC-14: Chapter 14 – GPSSA Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 14 – GPSSA Compliance
> **Module:** Social Insurance · **Labels:** `epic`, `gcc-compliance`, `social-insurance`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a complete GPSSA (General Pension and Social Security Authority, UAE) compliance engine in AuraOS that registers the employer establishment and eligible employees (UAE and GCC nationals), derives the GPSSA contribution account salary from the salary structure, calculates employer, employee and government-share contributions using configurable rates in the country rule engine, produces the monthly GPSSA submission, reconciles GPSSA to payroll, links GPSSA registration to Emiratisation evidence and end-of-service, and generates the monthly GPSSA compliance pack, certificate and variance register. The outcome keeps GPSSA aligned with payroll, transfers and exits so the entity meets its pension obligations and Emiratisation evidence requirements with zero manual reconciliation.

## Business Value

GPSSA non-registration or under-contribution for UAE/GCC nationals triggers penalties, back-contributions, and undermines Emiratisation compliance (registered nationals are the basis for Emiratisation targets). Automating account-salary derivation, multi-share contribution calculation, transfer handling, and monthly reconciliation eliminates spreadsheet risk, gives Compliance Officers an audit-ready monthly pack, ensures correct employer/employee/government splits, and protects national employees' pension entitlements while feeding clean data to the Emiratisation module.

## Requirements Covered (handbook sections)

- 14.1 Introduction
- 14.2 Purpose of GPSSA
- 14.3 Applicability of GPSSA
- 14.4 GPSSA Contribution Framework
- 14.5 Employer Responsibilities
- 14.6 Employer Registration
- 14.7 Employee Registration
- 14.8 Contribution Account Salary
- 14.9 Monthly GPSSA Process
- 14.10 Salary Changes and GPSSA Updates
- 14.11 Employee Transfers and GPSSA
- 14.12 End of Service and GPSSA
- 14.13 GPSSA and Emiratisation
- 14.14 GPSSA and Payroll Reconciliation
- 14.15 GPSSA Audit Checklist
- 14.16 GPSSA KPIs
- 14.17 GPSSA Risk Matrix
- 14.18 HRMS GPSSA Automation Design
- 14.19 GPSSA Dashboard
- 14.20 Monthly GPSSA Compliance Pack
- 14.21 Sample GPSSA Monthly Compliance Certificate
- 14.22 Sample GPSSA Variance Register
- 14.23 Key Takeaways

## Out of Scope

- Direct live API integration with the GPSSA portal (handled by a separate connectors epic); this epic produces submission-ready files and a guided upload workflow.
- Emiratisation quota/target calculation, covered in the Emiratisation epic — this epic supplies the GPSSA registration/contribution evidence it consumes.
- End-of-service gratuity calculation mechanics, covered in the EOSB epic — this epic models the GPSSA/end-of-service interaction only.
- General payroll run mechanics, covered in the Payroll epic — this epic consumes payroll outputs and writes back GPSSA deductions.

## Dependencies

- EPIC-02 (Regulatory Framework — country rule engine baseline, GPSSA references)
- EPIC-10 (Payroll Management & Processing — salary structure, deductions, payroll run)
- EPIC-06 (Employee Onboarding — social insurance/pension onboarding handover)

## Epic Definition of Done

- [ ] Employer registration and eligible-employee (UAE/GCC national) registration are managed with status tracking and audit.
- [ ] GPSSA contribution account salary is derived from configured salary components with floor/ceiling caps and recalculated on salary change.
- [ ] Employer/employee/government contribution rates are configurable per country/nationality with effective-dating in the rule engine.
- [ ] Monthly GPSSA process produces a validated submission file with maker-checker approval and deadline tracking.
- [ ] Transfers and exits update GPSSA correctly and the GPSSA service period feeds Emiratisation and EOSB.
- [ ] GPSSA-to-payroll reconciliation, variance register, monthly pack, and compliance certificate are delivered.
- [ ] GPSSA dashboard, KPIs, audit checklist and risk matrix are live with RBAC.

---

## User Stories

### EPIC-14-S01 — GPSSA Foundation, Applicability & Contribution Framework

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** GPSSA purpose, applicability and the contribution framework modelled as configurable reference data, **so that** AuraOS applies GPSSA only to eligible national employees with the correct contribution structure.

**Description**
Establishes the GPSSA domain in AuraOS: who is in scope (UAE nationals, and GCC nationals working in the UAE under the unified GCC insurance protection extension), the purpose/coverage notes, and the contribution framework defining the employer, employee and government shares. Applicability is nationality-driven and is the anchor the calculation engine reads.

**Acceptance Criteria**

- [ ] Given a UAE legal entity, when GPSSA settings are opened, then scope can be enabled and applicability rules (UAE national / GCC national / expatriate-excluded) configured.
- [ ] Given an expatriate, when evaluated, then GPSSA does not apply and the employee is excluded from GPSSA processing.
- [ ] Given a GCC national working in the UAE, when configured, then the GCC unified-extension rule routes them to their home-country share structure where applicable.
- [ ] Given the contribution framework, when set up, then employer, employee and government shares are modelled as distinct, configurable components.
- [ ] Given any applicability/framework change, then it is versioned with effective date and audited.

**Tasks**

- [ ] Backend: `gpssa_establishment` + `gpssa_applicability_rule` entities (nationalityClass, included, effectiveFrom)
- [ ] Backend: `gpssa_contribution_framework` config (shares: employer/employee/government)
- [ ] Backend: rule-engine loader resolving applicability + framework by date
- [ ] Frontend: GPSSA settings screen (scope, applicability matrix, framework)
- [ ] Rules/Config: UAE-national + GCC-national applicability seed
- [ ] Tests: unit tests for applicability resolution incl. GCC unified-extension

**Covers:** 14.1, 14.2, 14.3, 14.4
**Dependencies:** EPIC-02

### EPIC-14-S02 — Employer Responsibilities & Compliance Calendar

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** GPSSA employer duties encoded as a recurring obligation calendar, **so that** registration, monthly contribution, updates, transfers and exits are tracked to deadline.

**Description**
Models employer GPSSA obligations (register establishment, register eligible nationals on time, declare correct account salary, pay contributions by the statutory monthly deadline, update salary changes, handle transfers and exits) as trackable obligations with owners, SLAs, and alert schedules driving the worklist and dashboard.

**Acceptance Criteria**

- [ ] Given the GPSSA obligation set, when configured, then each duty has owner role, frequency, and statutory due-day.
- [ ] Given a monthly cycle, when the deadline approaches, then alerts fire at 7/3/1 days to the Payroll Officer and Compliance Officer.
- [ ] Given an overdue obligation, then it is flagged red and escalated to HR Manager.
- [ ] Given any obligation change, then it is written to the audit trail.
- [ ] Given RBAC, only Compliance Officer / System Administrator may edit the calendar.

**Tasks**

- [ ] Backend: `gpssa_obligation` entity (code, ownerRole, frequency, dueDayOfMonth, slaDays, alertOffsets[])
- [ ] Backend: scheduler emitting obligation events
- [ ] Frontend: GPSSA obligation calendar + worklist
- [ ] Alerts/Workflow: 7/3/1-day alerts + overdue escalation
- [ ] Tests: integration test for alerts/escalation

**Covers:** 14.5
**Dependencies:** EPIC-14-S01

### EPIC-14-S03 — Employer Registration & Establishment Setup

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** to register and maintain the employer's GPSSA establishment record, **so that** the entity is correctly enrolled and its GPSSA establishment number drives all employee registrations and filings.

**Description**
Captures and validates the employer GPSSA establishment registration: establishment number, registration date, status, and linkage to the UAE legal entity, including multi-establishment support where a group has several registered entities. This record is the parent for all employee GPSSA registrations and monthly files.

**Acceptance Criteria**

- [ ] Given a UAE legal entity, when registered, then the GPSSA establishment number and registration date are captured and format-validated.
- [ ] Given multiple legal entities, when each is registered, then each has its own establishment record and files independently.
- [ ] Given an establishment status change (active/suspended), when recorded, then dependent employee processing respects the status.
- [ ] Given missing establishment registration, when employee registration is attempted, then it is blocked with a clear message.
- [ ] Given any establishment change, then it is written to the audit trail.

**Tasks**

- [ ] Backend: extend `gpssa_establishment` (establishmentNo, registrationDate, status) + migration
- [ ] Backend: guard preventing employee registration without active establishment
- [ ] Frontend: employer GPSSA establishment management screen
- [ ] Rules/Config: per-entity establishment configuration
- [ ] Tests: unit tests for validation and block-without-establishment

**Covers:** 14.6
**Dependencies:** EPIC-14-S01

### EPIC-14-S04 — GPSSA Employee Registration

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** to register eligible UAE/GCC national employees with GPSSA on hire, **so that** every eligible national is enrolled from their join date and their GPSSA number is tracked.

**Description**
On hire of an eligible national, AuraOS prepares a GPSSA registration using Emirates ID, nationality, occupation, join date and account salary, generates the registration request/file, and stores the returned GPSSA registration/insurance number. Handles late registration flagging and excludes expatriates automatically.

**Acceptance Criteria**

- [ ] Given a new eligible national hire, when onboarding completes, then a GPSSA registration record is auto-created with validated mandatory fields (Emirates ID, nationality, occupation, join date, account salary).
- [ ] Given an expatriate hire, when onboarding completes, then no GPSSA registration is created.
- [ ] Given registration not completed within the configured window from join date, then it is flagged "late registration" and surfaced on the dashboard.
- [ ] Given a returned GPSSA number, when entered, then it is stored and the record marked Active.
- [ ] Given any registration action, then it is written to the audit trail; RBAC restricts submission to HR Admin / Payroll Officer.

**Tasks**

- [ ] Backend: `gpssa_member_registration` entity (employeeId, emiratesId, nationality, occupation, joinDate, gpssaNumber, status)
- [ ] Backend: registration file builder + late-registration detector + expat exclusion
- [ ] Backend: consumer on `employee.hired` creating registration draft for eligible nationals
- [ ] Frontend: GPSSA registration worklist + detail screen with validation
- [ ] Alerts/Workflow: late-registration alert at join+N days
- [ ] Tests: unit tests for eligibility filter; e2e hire→registration draft

**Covers:** 14.7
**Dependencies:** EPIC-14-S03, EPIC-06

### EPIC-14-S05 — Contribution Account Salary Derivation

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** the GPSSA contribution account salary derived automatically from the salary structure with floor/ceiling caps, **so that** contributions use the legally correct salary base.

**Description**
Defines the GPSSA contribution account salary as a configurable composition of salary components (e.g. basic + housing + specified allowances) with statutory minimum and maximum ceilings. The rule engine maps eligible components, applies caps and rounding, and produces the account-salary snapshot that feeds the calculation engine.

**Acceptance Criteria**

- [ ] Given a salary structure, when GPSSA account-salary rules are configured, then included components are selectable per country/nationality and the engine computes the account salary.
- [ ] Given the statutory floor and ceiling, when the computed salary is outside, then it is floored/capped and the adjustment shown.
- [ ] Given a component-eligibility change, then it is effective-dated and recalculates prospectively.
- [ ] Given any account-salary derivation, then the breakdown (components + caps) is stored and viewable for audit.
- [ ] Given a GCC national under the unified extension, then their home-country account-salary rule can differ per configuration.

**Tasks**

- [ ] Backend: `gpssa_account_salary_rule` config (countryCode, nationalityClass, includedComponentCodes[], minSalary, maxSalary, rounding, effectiveFrom)
- [ ] Backend: account-salary service + `gpssa_account_salary` per-period snapshot with derivation JSON
- [ ] Frontend: account-salary rule config + per-employee breakdown viewer
- [ ] Rules/Config: UAE floor/ceiling + component sets (UAE national vs GCC national)
- [ ] Tests: unit tests for capping, inclusion, rounding

**Covers:** 14.8
**Dependencies:** EPIC-14-S01, EPIC-10

### EPIC-14-S06 — GPSSA Contribution Calculation Engine (Employer/Employee/Government, Configurable Rates)

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 13
**As a** Payroll Officer, **I want** GPSSA employer, employee and government contributions calculated using configurable nationality-specific rates, **so that** the correct shares are deducted and remitted each month.

**Description**
The engine takes the account salary and applies employer%, employee% and government-share% that are fully configurable per country and nationality in the rule engine, all effective-dated so historical periods recompute with the rate in force at the time. The employee portion flows back to payroll as a deduction; employer and government shares are tracked for remittance and GL.

**Acceptance Criteria**

- [ ] Given an account salary and active rate set, when calculation runs, then employer, employee and government amounts are computed and summed per employee.
- [ ] Given different nationalities (UAE national vs GCC national), when calculated, then the applicable rate set is used per configuration.
- [ ] Given effective-dated rates, when a historical period is recomputed, then the rate in force for that period is applied.
- [ ] Given calculation completes, then the employee contribution is posted back to payroll as a statutory deduction for the period.
- [ ] Given a new country/nationality rate added in config, then the engine uses it with no code change.
- [ ] Given any calculation, then inputs and outputs are persisted for audit and reconciliation.

**Tasks**

- [ ] Backend: `gpssa_rate_config` (countryCode, nationalityClass, employerRate, employeeRate, governmentRate, effectiveFrom/To)
- [ ] Backend: calculation service producing `gpssa_contribution_line` per employee/period/share
- [ ] Backend: employee-deduction write-back to payroll
- [ ] Frontend: rate config grid with effective-dating and nationality tabs
- [ ] Rules/Config: seed UAE employer/employee/government shares for UAE & GCC nationals
- [ ] Tests: unit tests for three-share math, effective-date selection, payroll write-back

**Covers:** 14.4 (calculation aspect), 14.8 (consumes)
**Dependencies:** EPIC-14-S05

### EPIC-14-S07 — Monthly GPSSA Process & Submission File

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 13
**As a** Payroll Officer, **I want** a guided monthly GPSSA cycle that compiles members, validates data, and produces the submission file with maker-checker approval, **so that** the monthly declaration is accurate, on time and auditable.

**Description**
Orchestrates the monthly GPSSA run: snapshot active eligible members, pull account salaries and calculated contributions, run pre-submission validations (missing GPSSA numbers, salary anomalies, unregistered eligible nationals, exited-still-listed), and generate the GPSSA-format submission file. Maker-checker enforces preparer ≠ approver, and the deadline is tracked.

**Acceptance Criteria**

- [ ] Given an open GPSSA period, when started, then a member snapshot is created and validations flag missing numbers, zero/negative salaries, unregistered eligible nationals, and exited-still-listed members.
- [ ] Given validations pass, when the preparer submits, then maker-checker requires an approver different from the preparer.
- [ ] Given approval, then the submission file is generated in the prescribed format and the period locked.
- [ ] Given the statutory deadline, when within 7/3/1 days, then alerts fire; unapproved periods are flagged overdue.
- [ ] Given the file is generated, then a guided upload step records confirmation and reference.
- [ ] Given any step, then state transitions are written to the audit trail.

**Tasks**

- [ ] Backend: `gpssa_monthly_run` entity (period, status, snapshotAt, preparedBy, approvedBy, fileRef, uploadRef)
- [ ] Backend: validation set + submission-file builder
- [ ] Backend: maker-checker state machine via workflow engine
- [ ] Frontend: monthly GPSSA run dashboard (snapshot→validate→approve→generate→upload)
- [ ] Alerts/Workflow: deadline countdown + overdue escalation
- [ ] Tests: integration test for full cycle incl. preparer≠approver and period lock

**Covers:** 14.9
**Dependencies:** EPIC-14-S04, EPIC-14-S06, EPIC-14-S02

### EPIC-14-S08 — Salary Changes & GPSSA Updates

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** GPSSA account salaries to update automatically on salary change with a GPSSA update record, **so that** declared salaries always match current pay and we avoid under/over-declaration.

**Description**
When a salary change is recorded, the GPSSA account salary is recalculated, the delta detected, and a GPSSA update entry queued for the next monthly process (or amendment). Effective dating ensures the change applies from the correct period; backdated changes flag prior periods for adjustment.

**Acceptance Criteria**

- [ ] Given a salary change, when saved, then the GPSSA account salary is recalculated and compared to the last declared salary.
- [ ] Given a material delta, when detected, then a GPSSA update record is created with effective date and queued.
- [ ] Given a backdated change, when processed, then prior periods are flagged for amendment rather than silently changed.
- [ ] Given a queued update, then Payroll Officer is notified and it appears in the salary-change log.
- [ ] Given any update, then before/after salary and effective date are audited.

**Tasks**

- [ ] Backend: consumer on `employee.salaryChanged` → recompute account salary + create `gpssa_salary_update`
- [ ] Backend: delta detection + backdated amendment flagging
- [ ] Frontend: GPSSA salary-change log + queued updates view
- [ ] Alerts/Workflow: notify Payroll Officer of pending updates
- [ ] Tests: unit tests for delta detection and effective-date handling

**Covers:** 14.10
**Dependencies:** EPIC-14-S05, EPIC-14-S07

### EPIC-14-S09 — Employee Transfers & GPSSA Continuity

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** GPSSA to handle inter-entity and inter-employer transfers with service continuity, **so that** a national's pension service is preserved and not double-counted or broken on transfer.

**Description**
Handles transfer scenarios: between group legal entities (establishments) and transfers in/out from other employers. AuraOS ensures the GPSSA registration moves to the new establishment, service continuity is preserved, the prior establishment de-registers and the new one registers without a contribution gap or overlap, and GCC unified-extension transfers are supported.

**Acceptance Criteria**

- [ ] Given an inter-establishment transfer, when processed, then the member is de-registered from the source and registered to the target establishment with continuous service dates.
- [ ] Given a transfer, when monthly runs execute, then there is no double contribution or gap for the transfer month (per configurable rule).
- [ ] Given a transfer in from another employer, when recorded, then prior GPSSA service can be captured for continuity.
- [ ] Given a GCC national transfer under the unified extension, then home-country handling rules apply per configuration.
- [ ] Given any transfer, then source/target establishment, dates, and actor are audited.

**Tasks**

- [ ] Backend: transfer service handling de-register/register across establishments with continuity
- [ ] Backend: gap/overlap guard in monthly snapshot for transfer month
- [ ] Frontend: GPSSA transfer panel in mobility/transfer flow
- [ ] Rules/Config: transfer-month contribution rule + GCC unified-extension handling
- [ ] Tests: unit tests for continuity, no double/gap, GCC transfer

**Covers:** 14.11
**Dependencies:** EPIC-14-S04, EPIC-14-S07

### EPIC-14-S10 — End of Service & GPSSA Interaction

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** GPSSA exits handled — de-registration, final-period contribution, and the end-of-service interaction — **so that** leavers are removed correctly and GPSSA service feeds the end-of-service/pension settlement.

**Description**
On separation of a national, AuraOS computes the final-period GPSSA contribution, triggers de-registration with the correct end-of-service reason, excludes the leaver from the next file, and exposes the GPSSA contribution/service period as an input to the EOSB/pension settlement. Prevents continued contribution for exited nationals.

**Acceptance Criteria**

- [ ] Given an exit, when the leaving date is set, then the final-period GPSSA contribution is prorated and de-registration queued with the correct reason code.
- [ ] Given the leaver, when the next monthly snapshot runs, then they are excluded after their leaving date and flagged if still active.
- [ ] Given GPSSA service history, when an end-of-service/pension calculation is requested, then the GPSSA service period is exposed to the EOSB epic.
- [ ] Given a de-registration deadline, then alerts fire if not completed on time.
- [ ] Given any exit action, then it is written to the audit trail.

**Tasks**

- [ ] Backend: consumer on `employee.separationInitiated` → final GPSSA proration + de-registration
- [ ] Backend: snapshot exclusion + "exited but still contributing" red-flag
- [ ] Backend: expose GPSSA service-period API for EOSB
- [ ] Frontend: GPSSA exit/de-registration panel in separation flow
- [ ] Alerts/Workflow: de-registration deadline alert
- [ ] Tests: unit tests for proration and exclusion

**Covers:** 14.12
**Dependencies:** EPIC-14-S06, EPIC-14-S07

### EPIC-14-S11 — GPSSA ↔ Emiratisation Evidence Linkage

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** GPSSA registration and contribution data linked to Emiratisation evidence, **so that** counted UAE nationals are genuinely registered and contributing, and fake-Emiratisation risk is detected.

**Description**
GPSSA registration plus active contribution is the proof that a UAE national is genuinely employed for Emiratisation purposes. This story exposes GPSSA registration/contribution status to the Emiratisation module, flags nationals counted for Emiratisation but not registered or not contributing in GPSSA, and surfaces inconsistencies (e.g. registered but zero/near-zero salary) as fake-Emiratisation red-flags.

**Acceptance Criteria**

- [ ] Given a UAE national counted for Emiratisation, when cross-checked, then their GPSSA registration and current-period contribution status are exposed.
- [ ] Given a counted national with no GPSSA registration or no contribution, when detected, then a fake-Emiratisation red-flag is raised.
- [ ] Given a registered national with anomalously low GPSSA salary vs role, when detected, then it is flagged for review.
- [ ] Given the linkage, when consumed by the Emiratisation epic, then a stable API/event provides per-national GPSSA evidence.
- [ ] Given any flag, then it is written to the audit trail and surfaced on the dashboard.

**Tasks**

- [ ] Backend: GPSSA evidence API/event for Emiratisation (registration + contribution status)
- [ ] Backend: fake-Emiratisation red-flag rules (unregistered / non-contributing / anomalous salary)
- [ ] Frontend: GPSSA–Emiratisation consistency panel
- [ ] Rules/Config: anomaly thresholds
- [ ] Tests: unit tests for red-flag detection

**Covers:** 14.13
**Dependencies:** EPIC-14-S04, EPIC-14-S06

### EPIC-14-S12 — GPSSA ↔ Payroll Reconciliation

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** an automated reconciliation between the GPSSA declaration and the payroll run, **so that** every deduction and employer/government cost ties out before submission.

**Description**
Each cycle, AuraOS reconciles GPSSA contributions against payroll: employee GPSSA deduction in payroll vs engine, employer/government cost vs GL accrual, GPSSA headcount vs active national headcount, and per-employee account salary vs payroll salary. Discrepancies are categorised and pushed to the variance register with materiality thresholds.

**Acceptance Criteria**

- [ ] Given a closed GPSSA run and payroll run, when reconciliation executes, then it compares employee deduction, employer/government cost, headcount, and per-employee account salary.
- [ ] Given a variance above threshold, when found, then it is classified (missing member, salary mismatch, rate mismatch, exited-still-listed) and written to the variance register.
- [ ] Given a clean reconciliation, then a "reconciled" status is set and required for monthly pack sign-off.
- [ ] Given an unreconciled variance, when the pack is generated, then it is blocked or requires explicit override with reason.
- [ ] Given any reconciliation/override, then it is audited.

**Tasks**

- [ ] Backend: reconciliation service comparing GPSSA lines vs payroll vs GL accrual
- [ ] Backend: `gpssa_variance` entity with category and threshold-breach flag
- [ ] Backend: materiality-threshold config
- [ ] Frontend: reconciliation results screen with employee drill-down
- [ ] Alerts/Workflow: block/override gate on unreconciled variances
- [ ] Tests: integration test across matched/mismatched scenarios

**Covers:** 14.14
**Dependencies:** EPIC-14-S06, EPIC-14-S07, EPIC-10

### EPIC-14-S13 — GPSSA Audit Checklist & Risk Matrix

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable GPSSA audit checklist and risk matrix with red-flag detection, **so that** I can verify compliance and track risks to closure.

**Description**
Provides a configurable GPSSA audit checklist (registration timeliness, account-salary correctness, rate accuracy, submission timeliness, transfer continuity, exit de-registration, reconciliation completeness, Emiratisation linkage) and a risk matrix seeded with common GPSSA risks (non-registration of nationals, under-declaration, fake Emiratisation, late payment). System red-flags auto-populate findings; risks are tracked with owners and mitigation.

**Acceptance Criteria**

- [ ] Given the checklist, when run for a period, then each item is scored Pass/Fail/NA with evidence links.
- [ ] Given system red-flags (late registration, unreconciled variance, fake-Emiratisation), when present, then they auto-create findings.
- [ ] Given the risk matrix, then each risk has likelihood, impact, score, owner, mitigation, with a heatmap.
- [ ] Given a failed item, then a corrective action can be raised and tracked.
- [ ] Given RBAC, only Internal Auditor / Compliance Officer may edit templates and risks.

**Tasks**

- [ ] Backend: `gpssa_audit_checklist_template` + `gpssa_audit_result` + `gpssa_risk` entities
- [ ] Backend: red-flag-to-finding generator
- [ ] Frontend: checklist runner + risk heatmap
- [ ] Alerts/Workflow: corrective-action raise and reminders
- [ ] Tests: unit tests for scoring and auto-findings

**Covers:** 14.15, 14.17
**Dependencies:** EPIC-14-S04, EPIC-14-S07, EPIC-14-S11, EPIC-14-S12

### EPIC-14-S14 — GPSSA KPIs & Dashboard

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership user, **I want** a GPSSA KPI dashboard, **so that** I can see pension-compliance health, contribution trends and exceptions at a glance.

**Description**
Delivers GPSSA KPIs (registration timeliness %, on-time submission %, reconciliation pass rate, national-coverage %, variance count/value, late-registration count, exited-still-listed count, Emiratisation-linkage exceptions, employer/employee/government totals) and a role-based dashboard with trend charts and drill-down, filterable by entity and period.

**Acceptance Criteria**

- [ ] Given GPSSA data, when the dashboard loads, then KPIs render with value, target, and trend.
- [ ] Given filters (entity, nationality, period), when applied, then tiles and charts update consistently.
- [ ] Given a KPI breaching target, then it is red with drill-down to records.
- [ ] Given RBAC, Executives see summary tiles; Payroll/Compliance see operational drill-downs.
- [ ] Given export, then KPI snapshots export for the monthly pack.

**Tasks**

- [ ] Backend: KPI aggregation service + materialized views
- [ ] Backend: KPI definition config (target, formula, direction)
- [ ] Frontend: GPSSA dashboard with tiles, charts, drill-down, filters
- [ ] Rules/Config: KPI targets per entity
- [ ] Tests: unit tests for KPI calculations and filters

**Covers:** 14.16, 14.19
**Dependencies:** EPIC-14-S07, EPIC-14-S12

### EPIC-14-S15 — HRMS GPSSA Automation Design (Events, Rule Engine, Workflow)

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** the GPSSA module wired into the event bus, country rule engine and workflow engine, **so that** GPSSA runs straight-through and is fully configurable per country/nationality.

**Description**
Defines end-to-end automation: hire/salary-change/transfer/exit events trigger GPSSA actions; the rule engine holds all GPSSA parameters (applicability, account-salary rules, employer/employee/government rates, caps, deadlines) configurable per country and nationality with effective-dating; the workflow engine drives maker-checker and approvals; notifications/audit are standardised. This is the integration backbone made explicit and testable.

**Acceptance Criteria**

- [ ] Given the rule engine, when a GPSSA parameter changes, then no deployment is needed and it is effective-dated.
- [ ] Given domain events (`employee.hired`, `employee.salaryChanged`, `employee.transferred`, `employee.separationInitiated`, `payroll.run.completed`), then GPSSA handlers react idempotently.
- [ ] Given the workflow engine, then GPSSA maker-checker/escalation paths are reusable and configurable.
- [ ] Given an unconfigured country/nationality, when GPSSA runs, then it fails safe with a clear error rather than wrong numbers.
- [ ] Given all GPSSA actions, then a standardised audit envelope is recorded.

**Tasks**

- [ ] Backend: GPSSA event handlers with idempotency keys
- [ ] Backend: rule-engine namespace `gpssa.*` with effective-dated parameter store
- [ ] Backend: workflow templates for GPSSA approvals
- [ ] Backend: fail-safe guard for missing config
- [ ] Rules/Config: parameterise applicability, account-salary, rates, caps, deadlines per country/nationality
- [ ] Tests: integration tests for idempotency and fail-safe

**Covers:** 14.18
**Dependencies:** EPIC-14-S06, EPIC-14-S07

### EPIC-14-S16 — Monthly GPSSA Compliance Pack

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** a one-click Monthly GPSSA Compliance Pack, **so that** I have a complete sign-off-ready evidence bundle each month.

**Description**
Compiles the period's GPSSA artefacts into one downloadable pack: submission file reference + upload confirmation, reconciliation summary, variance register, KPI snapshot, Emiratisation-linkage exceptions, and the compliance certificate. Requires sign-off, is versioned and archived for retention.

**Acceptance Criteria**

- [ ] Given a closed and reconciled GPSSA period, when the pack is generated, then it includes file ref/upload confirmation, reconciliation summary, variance register, KPI snapshot, and Emiratisation-linkage exceptions.
- [ ] Given the pack, then it requires Compliance Officer sign-off before Final.
- [ ] Given an unreconciled period, when generation is attempted, then it is blocked or flagged with outstanding items.
- [ ] Given a finalised pack, then it is archived immutably with version/retention metadata.
- [ ] Given export, then PDF and Excel outputs are produced.

**Tasks**

- [ ] Backend: compliance-pack assembler aggregating run/recon/variance/KPI/linkage artefacts
- [ ] Backend: immutable archive + retention metadata
- [ ] Frontend: pack preview + sign-off
- [ ] Alerts/Workflow: sign-off request to Compliance Officer
- [ ] Tests: integration test for pack contents and block-on-unreconciled

**Covers:** 14.20
**Dependencies:** EPIC-14-S07, EPIC-14-S11, EPIC-14-S12, EPIC-14-S14

### EPIC-14-S17 — Sample GPSSA Monthly Compliance Certificate (Configurable Form)

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** a configurable GPSSA Monthly Compliance Certificate auto-populated from period data with attestation, **so that** I can certify and evidence GPSSA compliance.

**Description**
Provides a digital, template-driven GPSSA certificate auto-populated from the period (entity, establishment number, period, eligible national count, total account salary, employer/employee/government totals, submission reference, reconciliation status) with an e-attestation block. Configurable per entity, exports to PDF.

**Acceptance Criteria**

- [ ] Given a finalised GPSSA period, when generated, then the certificate auto-populates entity, establishment number, period, member count, account-salary base, employer/employee/government totals, submission reference, and reconciliation status.
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

**Covers:** 14.21
**Dependencies:** EPIC-14-S16

### EPIC-14-S18 — Sample GPSSA Variance Register (Configurable Register)

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 3
**As a** Payroll Officer, **I want** a configurable GPSSA Variance Register capturing every reconciliation discrepancy with status tracking, **so that** variances are explained, actioned and closed with an audit trail.

**Description**
A digital register listing each GPSSA variance (employee, type, declared vs payroll value, amount, period, root cause, action, owner, status) fed automatically from reconciliation and editable for resolution. Supports filtering, ageing and export, feeding the monthly pack and audit checklist.

**Acceptance Criteria**

- [ ] Given reconciliation variances, when generated, then each is recorded with type, amounts, period, owner and Open status.
- [ ] Given a variance, when resolved, then root cause, corrective action and resolution date are captured and status moves to Closed.
- [ ] Given ageing beyond threshold, then it is escalated and flagged.
- [ ] Given filters (type, status, period, entity, owner), then the register updates and exports to Excel/PDF.
- [ ] Given any edit, then it is audited.

**Tasks**

- [ ] Backend: `gpssa_variance_register` view/entity with resolution fields
- [ ] Backend: ageing + escalation logic
- [ ] Frontend: register grid with filters, status workflow, export
- [ ] Alerts/Workflow: ageing escalation to HR/Compliance Manager
- [ ] Tests: unit tests for ageing/escalation and status transitions

**Covers:** 14.22
**Dependencies:** EPIC-14-S12

### EPIC-14-S19 — GPSSA Key Takeaways & In-Product Guidance

**Labels:** `user-story`, `social-insurance` · **Priority:** Could · **Estimate:** 2
**As an** HR Admin, **I want** GPSSA key takeaways and best-practice guidance surfaced in-product, **so that** users understand obligations and avoid common GPSSA mistakes.

**Description**
Surfaces the chapter's key takeaways as a configurable guidance panel and a short readiness checklist for new GPSSA module users (register nationals on time, declare correct account salary, reconcile before submit, handle transfers/exits, keep Emiratisation evidence). Content is admin-editable, versioned, EN/AR.

**Acceptance Criteria**

- [ ] Given the GPSSA module home, when opened, then a key-takeaways panel shows configurable guidance.
- [ ] Given a first-time user, then a short readiness checklist of GPSSA essentials is shown.
- [ ] Given guidance content, when edited, then it is versioned and effective-dated.
- [ ] Given localisation, then guidance supports English/Arabic.

**Tasks**

- [ ] Backend: `gpssa_guidance_content` table (key, body, locale, version)
- [ ] Frontend: key-takeaways panel + first-run checklist
- [ ] Rules/Config: admin-editable guidance EN/AR
- [ ] Tests: unit test for versioning and locale fallback

**Covers:** 14.23
**Dependencies:** EPIC-14-S01
