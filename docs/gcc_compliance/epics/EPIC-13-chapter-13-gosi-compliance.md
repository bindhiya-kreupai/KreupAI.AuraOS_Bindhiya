# EPIC-13: Chapter 13 – GOSI Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 13 – GOSI Compliance
> **Module:** Social Insurance · **Labels:** `epic`, `gcc-compliance`, `social-insurance`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an end-to-end GOSI (General Organization for Social Insurance, Saudi Arabia) compliance engine in AuraOS that registers employees, derives the GOSI contribution wage from the payroll salary structure, calculates employer and employee contributions for Annuities and Occupational Hazards branches using configurable, nationality-aware rates in the country rule engine, produces the monthly GOSI submission and contribution file, reconciles GOSI against payroll, and generates the monthly GOSI compliance pack, certificate and variance register. The outcome is a single source of truth that keeps GOSI in lock-step with payroll and exits so the entity never under-declares, over-pays, or misses a submission deadline.

## Business Value

GOSI underpayment, late submission, and wage-base mismatches expose Saudi entities to fines, retroactive contribution demands, and Nitaqat/government-service blocks (GOSI registration drives Saudization counts). Automating contribution-wage derivation, dual-rate calculation, and monthly reconciliation removes manual spreadsheet risk, gives Payroll and Compliance Officers an auditable monthly evidence pack, and ensures Saudi and non-Saudi employees are contributed correctly from day one — protecting both the employer's GOSI account standing and employee end-of-service/pension entitlements.

## Requirements Covered (handbook sections)

- 13.1 Introduction
- 13.2 Purpose of GOSI
- 13.3 Scope of GOSI Compliance
- 13.4 GOSI Branches Relevant to Employers
- 13.5 Employer Responsibilities
- 13.6 Employee Registration
- 13.7 Contribution Wage
- 13.8 Contribution Calculation
- 13.9 Monthly GOSI Process
- 13.10 Salary Changes and GOSI Updates
- 13.11 Employee Exits and GOSI
- 13.12 Occupational Hazards Compliance
- 13.13 GOSI and Payroll Reconciliation
- 13.14 GOSI Audit Checklist
- 13.15 GOSI KPIs
- 13.16 GOSI Risk Matrix
- 13.17 HRMS GOSI Automation Design
- 13.18 GOSI Dashboard
- 13.19 Monthly GOSI Compliance Pack
- 13.20 Sample GOSI Monthly Compliance Certificate
- 13.21 Sample GOSI Variance Register
- 13.22 Key Takeaways

## Out of Scope

- Direct system-to-system API integration with the live GOSI portal (handled by a separate connectors epic); this epic produces submission-ready files and a guided manual-upload workflow.
- End-of-service award (EOSB) calculation mechanics, covered in the EOSB epic — this epic only models the GOSI/exit interaction.
- Nitaqat/Saudization quota calculation logic, covered in the Nitaqat epic — this epic exposes the GOSI registration data it consumes.
- General payroll run mechanics, covered in the Payroll epic — this epic consumes payroll outputs and feeds GOSI deductions back.

## Dependencies

- EPIC-02 (Regulatory Framework — country rule engine baseline, GOSI references)
- EPIC-10 (Payroll Management & Processing — salary structure, deductions, payroll run)
- EPIC-06 (Employee Onboarding — social insurance onboarding handover)

## Epic Definition of Done

- [ ] GOSI contribution-wage formula is derived from configured salary components per the rule engine and recalculated on every salary change.
- [ ] Employer/employee Annuities and Occupational Hazards rates are configurable per country and nationality (Saudi vs non-Saudi) with effective-dating.
- [ ] Monthly GOSI process produces a validated, submission-ready contribution file plus an in-app worklist with maker-checker approval.
- [ ] Employee registration, salary-change, and exit events update the GOSI register and are written to the audit trail.
- [ ] GOSI-to-payroll reconciliation runs each cycle and posts variances to the variance register with red-flag thresholds.
- [ ] Monthly compliance pack, compliance certificate, and variance register export to PDF/Excel with management sign-off.
- [ ] GOSI dashboard and KPIs are live with RBAC, and the audit checklist + risk matrix are configurable and tracked.

---

## User Stories

### EPIC-13-S01 — GOSI Compliance Foundation, Scope & Branch Configuration

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** GOSI scope, purpose and the employer-relevant branches modelled as configurable reference data, **so that** the platform applies the correct GOSI rules to each Saudi legal entity and worker population.

**Description**
Establishes the GOSI domain model in AuraOS: which entities/establishments are in scope, which GOSI branches apply (Annuities/Pensions branch and Occupational Hazards branch), and the purpose/coverage notes surfaced as in-product guidance. Branch applicability differs by nationality (e.g. Occupational Hazards applies to all workers; Annuities primarily to Saudi nationals), so this is the anchor configuration the calculation engine reads.

**Acceptance Criteria**

- [ ] Given a Saudi legal entity, when an admin opens GOSI settings, then they can enable GOSI scope and see the establishment's GOSI registration number captured and validated for format.
- [ ] Given GOSI branches, when configured, then the Annuities branch and Occupational Hazards branch are each modelled with applicability rules keyed by nationality (Saudi / GCC national / expatriate).
- [ ] Given an out-of-scope (non-KSA) entity, when GOSI settings are opened, then GOSI is disabled and the module hidden, with rationale shown.
- [ ] Given contextual help, when a user views any GOSI screen, then purpose/scope guidance (13.1–13.3) is available as inline tooltips sourced from a configurable content table.
- [ ] Given any change to branch applicability, then the change is versioned with effective date and written to the audit trail (who/when/old/new).

**Tasks**

- [ ] Backend: `gosi_establishment` entity (id, legalEntityId, gosiRegistrationNumber, status, scopeEnabled, effectiveFrom) + migration
- [ ] Backend: `gosi_branch_config` entity (branchCode = ANNUITIES|OCC_HAZARDS, applicabilityByNationality JSONB, effectiveFrom/To)
- [ ] Backend: rule-engine loader that resolves active GOSI branches for an entity at a given date
- [ ] Frontend: GOSI Settings admin screen (scope toggle, registration number, branch applicability matrix)
- [ ] Rules/Config: nationality classification mapping (Saudi / GCC / Expat) feeding branch applicability
- [ ] Tests: unit tests for branch resolution by nationality and effective date

**Covers:** 13.1, 13.2, 13.3, 13.4
**Dependencies:** EPIC-02

### EPIC-13-S02 — Employer Responsibilities & Compliance Calendar

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** GOSI employer responsibilities encoded as a recurring obligation calendar with owners and deadlines, **so that** nothing (registration, monthly contribution, salary updates, exits) is missed.

**Description**
Models the employer's statutory GOSI duties as trackable obligations: register new joiners promptly, declare correct wages, pay contributions by the statutory monthly deadline, update salary changes, and de-register leavers. Each obligation has an owner, SLA, and alert schedule that drives the worklist and dashboard.

**Acceptance Criteria**

- [ ] Given the GOSI obligation set, when configured, then each duty (register, declare, pay, update, exit) has an owner role, frequency, and statutory due-day.
- [ ] Given a monthly cycle, when the due-day approaches, then alerts fire at 7/3/1 days before the GOSI payment deadline to the assigned Payroll Officer and Compliance Officer.
- [ ] Given an overdue obligation, when the deadline passes, then it is flagged red on the dashboard and escalated to HR Manager.
- [ ] Given any obligation status change, then it is captured in the audit trail.
- [ ] Given RBAC, only Compliance Officer / System Administrator may edit the obligation calendar.

**Tasks**

- [ ] Backend: `gosi_obligation` entity (code, ownerRole, frequency, dueDayOfMonth, slaDays, alertOffsets[])
- [ ] Backend: scheduler job emitting obligation events to the event bus
- [ ] Frontend: GOSI obligation calendar + worklist component
- [ ] Alerts/Workflow: 7/3/1-day notifications and overdue escalation to HR Manager
- [ ] Tests: integration test for alert firing and escalation

**Covers:** 13.5
**Dependencies:** EPIC-13-S01

### EPIC-13-S03 — GOSI Employee Registration & De-registration

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** to register new Saudi and expatriate employees with GOSI and capture their registration outcome, **so that** every in-scope worker is enrolled in the correct branches from their join date.

**Description**
On hire, AuraOS prepares a GOSI registration record using the employee's Iqama/National ID, nationality, occupation, join date and contribution wage, and applies the correct branch enrolment. Generates a registration request/file for the GOSI portal and tracks the returned GOSI subscription number. Also handles late registration flagging.

**Acceptance Criteria**

- [ ] Given a new in-scope hire, when onboarding completes, then a GOSI registration record is auto-created with nationality-correct branch enrolment and validated mandatory fields (National ID/Iqama, occupation, join date, contribution wage).
- [ ] Given a Saudi national, when registered, then both Annuities and Occupational Hazards branches are enrolled; given an expatriate, then only Occupational Hazards is enrolled (per configurable rule).
- [ ] Given registration is not completed within the configured window from join date, then the record is flagged "late registration" and raised on the dashboard.
- [ ] Given a returned GOSI subscription number, when entered, then it is stored against the employee and the record marked Active.
- [ ] Given any registration/de-registration action, then it is written to the audit trail with actor and timestamp.
- [ ] Given RBAC, only HR Admin / Payroll Officer may submit registrations.

**Tasks**

- [ ] Backend: `gosi_member_registration` entity (employeeId, nationalId, nationality, occupation, joinDate, branchEnrolment[], gosiSubscriptionNo, status, registeredAt)
- [ ] Backend: registration request file/export builder + late-registration detector
- [ ] Backend: event consumer on `employee.hired` to auto-create registration draft
- [ ] Frontend: GOSI registration worklist + detail screen with validation
- [ ] Rules/Config: branch-enrolment-by-nationality rule (Saudi vs expat)
- [ ] Alerts/Workflow: late-registration alert at configurable join+N days
- [ ] Tests: unit tests for branch enrolment, e2e for hire→registration draft

**Covers:** 13.6
**Dependencies:** EPIC-13-S01, EPIC-06

### EPIC-13-S04 — GOSI Contribution Wage Derivation

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** the GOSI contribution wage derived automatically from the salary structure with min/max caps, **so that** contributions are based on the legally correct wage base, not the gross or net pay.

**Description**
Defines the GOSI contribution wage as a configurable composition of salary components (typically basic + housing for Saudis, with rules for the wage cap and floor). The rule engine maps which payroll earnings count toward the GOSI wage, applies statutory minimum and maximum ceilings, and rounds per GOSI conventions. This derived wage is the single input to the calculation engine.

**Acceptance Criteria**

- [ ] Given a salary structure, when GOSI wage rules are configured, then the included components (e.g. basic, housing) are selectable per country/nationality and the engine computes the contribution wage.
- [ ] Given the statutory minimum and maximum GOSI wage caps, when the computed wage falls outside, then it is floored/capped accordingly and the capping is shown.
- [ ] Given a Saudi vs an expatriate, when their wage is derived, then the applicable component set and caps can differ per the configured rule.
- [ ] Given a change to which components are GOSI-eligible, then it is effective-dated and recalculates wages prospectively.
- [ ] Given any derived contribution wage, then the derivation breakdown (components + caps applied) is stored and viewable for audit.

**Tasks**

- [ ] Backend: `gosi_wage_rule` config (countryCode, nationalityClass, includedComponentCodes[], minWage, maxWage, rounding, effectiveFrom)
- [ ] Backend: contribution-wage calculation service reading payroll components + caps
- [ ] Backend: store `gosi_contribution_wage` snapshot per employee per period with derivation JSON
- [ ] Frontend: wage-rule config screen + per-employee wage breakdown viewer
- [ ] Rules/Config: KSA min/max GOSI ceiling and Saudi/expat component sets
- [ ] Tests: unit tests for capping, component inclusion, rounding

**Covers:** 13.7
**Dependencies:** EPIC-13-S01, EPIC-10

### EPIC-13-S05 — GOSI Contribution Calculation Engine (Employer/Employee, Configurable Rates)

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 13
**As a** Payroll Officer, **I want** GOSI employer and employee contributions calculated per branch using configurable nationality-specific rates, **so that** the correct amounts are deducted and remitted every month.

**Description**
The calculation engine takes the GOSI contribution wage and applies branch-specific employer and employee percentage rates that are fully configurable per country and nationality in the rule engine (e.g. for Saudis the Annuities split plus Occupational Hazards employer-only; for expatriates Occupational Hazards employer-only). All rates are effective-dated so historical periods recompute with the rate that applied at the time. The employee portion flows back as a payroll deduction.

**Acceptance Criteria**

- [ ] Given a contribution wage and the active rate set, when calculation runs, then employer and employee amounts are computed per branch and summed per employee.
- [ ] Given a Saudi national, when calculated, then Annuities employer% + employee% and Occupational Hazards employer% are applied per configuration; given an expatriate, then only Occupational Hazards (employer-only) applies.
- [ ] Given rates are effective-dated, when a historical period is recomputed, then the rate in force for that period is used (not the current rate).
- [ ] Given calculation completes, then the employee contribution is posted back to payroll as a statutory deduction tied to the period.
- [ ] Given a configuration with a new country/nationality rate, when added, then no code change is required and the engine picks it up.
- [ ] Given any calculation, then inputs (wage, rates, branch) and outputs are persisted for audit and reconciliation.

**Tasks**

- [ ] Backend: `gosi_rate_config` (countryCode, nationalityClass, branchCode, employerRate, employeeRate, effectiveFrom/To)
- [ ] Backend: calculation service producing `gosi_contribution_line` per employee/period/branch
- [ ] Backend: write-back of employee deduction to payroll period
- [ ] Frontend: rate configuration admin grid with effective-dating and Saudi/expat tabs
- [ ] Rules/Config: seed KSA Annuities + Occupational Hazards rate sets for Saudi and expat
- [ ] Tests: unit tests for per-branch/per-nationality math, effective-date selection, payroll write-back

**Covers:** 13.8
**Dependencies:** EPIC-13-S04

### EPIC-13-S06 — Monthly GOSI Process & Contribution File Generation

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 13
**As a** Payroll Officer, **I want** a guided monthly GOSI cycle that compiles all members, validates the data, and produces the submission-ready contribution file with maker-checker approval, **so that** the monthly declaration is accurate, on time, and auditable.

**Description**
Orchestrates the monthly GOSI run: snapshot active members, pull contribution wages and calculated contributions, run pre-submission validations (missing subscription numbers, wage anomalies, unregistered joiners), and generate the GOSI-format contribution/declaration file. A maker-checker workflow enforces preparer ≠ approver before the file is released for upload, and the deadline is tracked against the obligation calendar.

**Acceptance Criteria**

- [ ] Given an open GOSI period, when the cycle is started, then a member snapshot is created and validation runs (flagging missing subscription numbers, zero/negative wages, unregistered active employees, exited-but-still-listed members).
- [ ] Given validations pass, when the preparer submits, then the file enters maker-checker; the approver must differ from the preparer.
- [ ] Given approval, then the GOSI contribution file is generated in the prescribed format and the period is locked from edits.
- [ ] Given the statutory deadline, when within 7/3/1 days, then alerts fire; if the period is not approved by the deadline it is flagged overdue.
- [ ] Given the file is generated, then a download/manual-upload guided step records the upload confirmation and reference.
- [ ] Given any step, then actor, timestamp, and state transitions are written to the audit trail.

**Tasks**

- [ ] Backend: `gosi_monthly_run` entity (period, status, snapshotAt, preparedBy, approvedBy, fileRef, uploadRef)
- [ ] Backend: validation rule set + contribution-file builder service
- [ ] Backend: maker-checker state machine integrated with workflow engine
- [ ] Frontend: monthly GOSI run dashboard (snapshot → validate → approve → generate → upload)
- [ ] Alerts/Workflow: deadline countdown + overdue escalation
- [ ] Tests: integration test for full cycle incl. preparer≠approver enforcement and period lock

**Covers:** 13.9
**Dependencies:** EPIC-13-S03, EPIC-13-S05, EPIC-13-S02

### EPIC-13-S07 — Salary Changes & GOSI Wage Updates

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** GOSI contribution wages to update automatically when an employee's salary changes, with a GOSI wage-update record for submission, **so that** declared wages always match the current salary and we avoid under/over declaration penalties.

**Description**
When a salary change (increment, promotion, component change) is recorded, the GOSI contribution wage is recalculated, the delta is detected, and a GOSI wage-update entry is queued for the next monthly process or as an immediate amendment. Effective dating ensures the change applies from the correct GOSI period.

**Acceptance Criteria**

- [ ] Given a recorded salary change, when saved, then the GOSI contribution wage is recalculated and compared to the last declared wage.
- [ ] Given a material wage delta, when detected, then a GOSI wage-update record is created with effective date and queued into the next monthly run.
- [ ] Given the change is backdated, when processed, then prior periods are flagged for amendment/adjustment rather than silently changed.
- [ ] Given an update is queued, then Payroll Officer is notified and the change is visible in the wage-change log.
- [ ] Given any wage update, then before/after wage and effective date are written to the audit trail.

**Tasks**

- [ ] Backend: consumer on `employee.salaryChanged` → recompute GOSI wage and create `gosi_wage_update`
- [ ] Backend: delta detection + backdated-change amendment flagging
- [ ] Frontend: GOSI wage-change log + queued-updates view
- [ ] Alerts/Workflow: notify Payroll Officer of pending wage updates
- [ ] Tests: unit tests for delta detection and effective-date handling

**Covers:** 13.10
**Dependencies:** EPIC-13-S04, EPIC-13-S06

### EPIC-13-S08 — Employee Exits & GOSI De-registration / Settlement Interaction

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** GOSI to handle employee exits — de-registration, final-period contribution, and the end-of-service interaction — **so that** leavers are removed correctly and the final GOSI declaration matches the actual leaving date.

**Description**
On termination/resignation, AuraOS computes the final GOSI contribution for the partial period, triggers GOSI de-registration with the correct end-of-service reason code, ensures the leaver drops off the next monthly file, and surfaces the GOSI/EOSB interaction (GOSI subscription period feeds the end-of-service calculation). Prevents the common error of continuing to contribute for exited employees.

**Acceptance Criteria**

- [ ] Given an exit is initiated, when the leaving date is set, then the final-period GOSI contribution is prorated and de-registration is queued with the correct reason code.
- [ ] Given the leaver, when the next monthly run snapshots members, then the exited employee is excluded after their leaving date and flagged if erroneously still active.
- [ ] Given GOSI subscription history, when an end-of-service calculation is requested, then the GOSI contribution period is exposed as an input to the EOSB epic.
- [ ] Given de-registration is required by a deadline, then alerts fire if it is not completed on time.
- [ ] Given any exit/de-registration action, then it is captured in the audit trail.

**Tasks**

- [ ] Backend: consumer on `employee.separationInitiated` → final GOSI proration + de-registration record
- [ ] Backend: exclusion rule in monthly snapshot + "exited but still contributing" red-flag
- [ ] Backend: expose GOSI subscription-period API for EOSB consumption
- [ ] Frontend: GOSI exit/de-registration panel in separation flow
- [ ] Alerts/Workflow: de-registration deadline alert
- [ ] Tests: unit tests for proration and snapshot exclusion

**Covers:** 13.11
**Dependencies:** EPIC-13-S05, EPIC-13-S06

### EPIC-13-S09 — Occupational Hazards Branch Compliance

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** the Occupational Hazards branch fully modelled — applicable to all workers, employer-funded — with work-injury linkage, **so that** every worker is covered and injury claims reference the correct GOSI registration.

**Description**
The Occupational Hazards (OH) branch covers all employees (Saudi and expatriate) and is employer-funded at a configurable rate. This story ensures OH enrolment is universal, the OH contribution is calculated and remitted even when Annuities does not apply (expats), and that work-injury/HSE incidents can be linked to the GOSI OH coverage for claim handling.

**Acceptance Criteria**

- [ ] Given any in-scope employee regardless of nationality, when registered, then Occupational Hazards enrolment is mandatory and cannot be disabled per-employee.
- [ ] Given an expatriate with no Annuities branch, when contributions are calculated, then the OH employer contribution is still computed and included in the monthly file.
- [ ] Given a recorded work injury (from HSE), when linked, then the employee's GOSI OH registration reference is attached for claim purposes.
- [ ] Given the OH rate, when changed, then it is effective-dated and applies to all workers per the rule engine.
- [ ] Given any OH coverage change, then it is written to the audit trail.

**Tasks**

- [ ] Backend: enforce mandatory OH enrolment in registration service
- [ ] Backend: ensure OH contribution line generated for expats even without Annuities
- [ ] Backend: link `work_injury` records to GOSI OH registration reference
- [ ] Frontend: OH coverage indicator on employee GOSI profile + injury link
- [ ] Rules/Config: OH employer rate (all nationalities) effective-dated
- [ ] Tests: unit tests for universal OH enrolment and expat OH contribution

**Covers:** 13.12
**Dependencies:** EPIC-13-S03, EPIC-13-S05

### EPIC-13-S10 — GOSI ↔ Payroll Reconciliation

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** an automated reconciliation between the GOSI declaration and the payroll run, **so that** every employee deduction and employer cost ties out and discrepancies are caught before submission.

**Description**
Each cycle, AuraOS reconciles the GOSI calculated contributions against payroll: employee GOSI deduction in payroll vs GOSI engine, employer GOSI cost vs GL accrual, headcount on GOSI file vs active payroll headcount, and per-employee wage base vs payroll wage. Discrepancies are categorised and pushed to the variance register with configurable materiality thresholds.

**Acceptance Criteria**

- [ ] Given a closed GOSI run and the payroll run, when reconciliation executes, then it compares employee deduction, employer cost, headcount, and per-employee wage base.
- [ ] Given a variance above the configured threshold (absolute or %), when found, then it is classified (missing member, wage mismatch, rate mismatch, exited-still-listed) and written to the variance register.
- [ ] Given a clean reconciliation, when complete, then a "reconciled" status is set and required for monthly pack sign-off.
- [ ] Given an unreconciled variance, when the monthly pack is generated, then it is blocked or requires explicit override with reason.
- [ ] Given any reconciliation, then results and overrides are written to the audit trail.

**Tasks**

- [ ] Backend: reconciliation service comparing GOSI lines vs payroll lines vs GL accrual
- [ ] Backend: `gosi_variance` entity with category, amount, threshold breach flag
- [ ] Backend: materiality-threshold config (per country)
- [ ] Frontend: reconciliation results screen with drill-down to employee
- [ ] Alerts/Workflow: block/override gate on unreconciled variances
- [ ] Tests: integration test across matched/mismatched scenarios

**Covers:** 13.13
**Dependencies:** EPIC-13-S05, EPIC-13-S06, EPIC-10

### EPIC-13-S11 — GOSI Audit Checklist & Risk Matrix

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable GOSI audit checklist and risk matrix with red-flag detection, **so that** I can verify GOSI compliance and track risks to closure.

**Description**
Provides a configurable GOSI audit checklist (registration timeliness, wage-base correctness, rate accuracy, submission timeliness, exit de-registration, reconciliation completeness) and a risk matrix (likelihood × impact) seeded with common GOSI risks (under-declaration, late registration, ghost members, late payment). Red-flags from runs auto-populate findings; risks are tracked with owners and mitigation status.

**Acceptance Criteria**

- [ ] Given the audit checklist, when an auditor runs it for a period, then each item is scored Pass/Fail/NA with evidence links to the underlying GOSI records.
- [ ] Given system red-flags (late registration, unreconciled variance, exited-still-listed), when present, then they auto-create checklist findings.
- [ ] Given the risk matrix, when configured, then each risk has likelihood, impact, score, owner, and mitigation status with a heatmap view.
- [ ] Given a failed checklist item, then a corrective action can be raised and tracked to closure.
- [ ] Given RBAC, only Internal Auditor / Compliance Officer may edit checklist templates and risk entries.

**Tasks**

- [ ] Backend: `gosi_audit_checklist_template` + `gosi_audit_result` entities
- [ ] Backend: `gosi_risk` entity (likelihood, impact, score, owner, mitigation, status)
- [ ] Backend: red-flag-to-finding generator
- [ ] Frontend: audit checklist runner + risk matrix heatmap
- [ ] Alerts/Workflow: corrective-action raise and reminders
- [ ] Tests: unit tests for scoring and auto-finding creation

**Covers:** 13.14, 13.16
**Dependencies:** EPIC-13-S03, EPIC-13-S06, EPIC-13-S10

### EPIC-13-S12 — GOSI KPIs & Dashboard

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership user, **I want** a GOSI KPI dashboard, **so that** I can see compliance health, contribution trends, and exceptions at a glance with country/entity filters.

**Description**
Delivers GOSI KPIs (registration timeliness %, on-time submission %, reconciliation pass rate, contribution-wage coverage, variance count/value, late-registration count, exited-still-listed count, employer vs employee contribution totals) and a role-based dashboard with trend charts and drill-down, filterable by entity, nationality, and period.

**Acceptance Criteria**

- [ ] Given GOSI data, when the dashboard loads, then KPIs render with current value, target, and trend vs prior periods.
- [ ] Given filters (entity, nationality, period), when applied, then all tiles and charts update consistently.
- [ ] Given a KPI breaching its target, when displayed, then it is shown in red with drill-down to the underlying records.
- [ ] Given RBAC, then Executives see summary tiles while Payroll/Compliance see operational drill-downs.
- [ ] Given exported data, when requested, then KPI snapshots export to Excel/PDF for the monthly pack.

**Tasks**

- [ ] Backend: KPI aggregation service + materialized views per period/entity
- [ ] Backend: KPI definition config (target, formula, direction)
- [ ] Frontend: GOSI dashboard with tiles, trend charts, drill-down, filters
- [ ] Rules/Config: KPI targets per entity
- [ ] Tests: unit tests for KPI calculations and filter integrity

**Covers:** 13.15, 13.18
**Dependencies:** EPIC-13-S06, EPIC-13-S10

### EPIC-13-S13 — HRMS GOSI Automation Design (Events, Rule Engine, Workflow)

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** the GOSI module wired into the event bus, country rule engine, and workflow/approval engine, **so that** GOSI runs straight-through with minimal manual intervention and is fully configurable per country/nationality.

**Description**
Defines the end-to-end automation: hire/salary-change/exit events trigger GOSI actions; the country rule engine holds all GOSI parameters (branches, wage rules, rates, caps, deadlines) configurable per country and nationality with effective-dating; the workflow engine drives maker-checker and approvals; and notifications/audit are standardised. This is the integration backbone the other stories depend on, made explicit and testable.

**Acceptance Criteria**

- [ ] Given the rule engine, when a GOSI parameter changes (rate, cap, included component, deadline), then no deployment is needed and changes are effective-dated.
- [ ] Given domain events (`employee.hired`, `employee.salaryChanged`, `employee.separationInitiated`, `payroll.run.completed`), when published, then GOSI handlers react idempotently.
- [ ] Given the workflow engine, when GOSI approvals are configured, then maker-checker and escalation paths are reusable and configurable.
- [ ] Given a country/nationality not yet configured, when GOSI runs, then it fails safe with a clear "missing configuration" error rather than wrong numbers.
- [ ] Given all GOSI actions, then a standardised audit envelope (actor, entity, before/after, correlationId) is recorded.

**Tasks**

- [ ] Backend: GOSI event handlers + idempotency keys on the event bus
- [ ] Backend: rule-engine namespace `gosi.*` with effective-dated parameter store
- [ ] Backend: workflow templates for GOSI maker-checker/approvals
- [ ] Backend: fail-safe guard for missing country/nationality config
- [ ] Rules/Config: parameterise branches, wage rules, rates, caps, deadlines per country/nationality
- [ ] Tests: integration tests for event idempotency and fail-safe behaviour

**Covers:** 13.17
**Dependencies:** EPIC-13-S05, EPIC-13-S06

### EPIC-13-S14 — Monthly GOSI Compliance Pack

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** a one-click Monthly GOSI Compliance Pack assembling the file, reconciliation, certificate, variance register and KPI snapshot, **so that** I have a complete, sign-off-ready evidence bundle each month.

**Description**
Compiles the period's GOSI artefacts into a single downloadable pack: contribution file reference + upload confirmation, reconciliation summary, variance register, KPI snapshot, exceptions log, and the compliance certificate. The pack requires sign-off and is versioned and archived for audit retention.

**Acceptance Criteria**

- [ ] Given a closed and reconciled GOSI period, when the pack is generated, then it includes file ref/upload confirmation, reconciliation summary, variance register, KPI snapshot, and exceptions.
- [ ] Given the pack, when assembled, then it requires Compliance Officer sign-off before being marked Final.
- [ ] Given an unreconciled period, when pack generation is attempted, then it is blocked or flagged with outstanding items.
- [ ] Given a finalised pack, then it is archived (immutable) with version and retention metadata.
- [ ] Given export, then PDF and Excel outputs are produced.

**Tasks**

- [ ] Backend: compliance-pack assembler aggregating run/recon/variance/KPI artefacts
- [ ] Backend: immutable archive + retention metadata
- [ ] Frontend: pack preview + sign-off action
- [ ] Alerts/Workflow: sign-off request to Compliance Officer
- [ ] Tests: integration test verifying pack contents and block-on-unreconciled

**Covers:** 13.19
**Dependencies:** EPIC-13-S06, EPIC-13-S10, EPIC-13-S12

### EPIC-13-S15 — Sample GOSI Monthly Compliance Certificate (Configurable Form)

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** a configurable GOSI Monthly Compliance Certificate generated from period data with management attestation, **so that** I can certify and evidence GOSI compliance for management and auditors.

**Description**
Provides a digital, template-driven GOSI compliance certificate auto-populated from the period (entity, GOSI registration number, period, total members, total contribution wage, employer/employee totals, submission date/reference, reconciliation status) with an e-attestation block. Template is configurable per entity and exports to PDF.

**Acceptance Criteria**

- [ ] Given a finalised GOSI period, when a certificate is generated, then it auto-populates entity, registration number, period, member count, wage base, employer/employee totals, submission reference, and reconciliation status.
- [ ] Given the certificate template, when configured, then header/footer/clauses/logo are editable per entity without code changes.
- [ ] Given the certifying user, when they attest, then an e-signature/attestation with name, role, and timestamp is recorded.
- [ ] Given generation, then the certificate exports to PDF and attaches to the monthly pack.
- [ ] Given any certificate issued, then it is logged in the audit trail and versioned.

**Tasks**

- [ ] Backend: certificate template engine + data-binding from period
- [ ] Backend: e-attestation capture and versioning
- [ ] Frontend: certificate template editor + generate/attest screen
- [ ] Rules/Config: per-entity template configuration
- [ ] Tests: unit test for data-binding and PDF export

**Covers:** 13.20
**Dependencies:** EPIC-13-S14

### EPIC-13-S16 — Sample GOSI Variance Register (Configurable Register)

**Labels:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 3
**As a** Payroll Officer, **I want** a configurable GOSI Variance Register capturing every reconciliation discrepancy with status tracking, **so that** variances are explained, actioned, and closed with an audit trail.

**Description**
A digital register listing each GOSI variance (employee, type, declared vs payroll value, amount, period, root cause, action, owner, status) fed automatically from reconciliation and editable for resolution notes. Supports filtering, ageing, and export, and feeds the monthly compliance pack and audit checklist.

**Acceptance Criteria**

- [ ] Given reconciliation variances, when generated, then each is recorded in the register with type, amounts, period, owner, and Open status.
- [ ] Given a variance, when resolved, then root cause, corrective action, and resolution date are captured and status moves to Closed.
- [ ] Given ageing, when a variance stays Open beyond the threshold, then it is escalated and flagged.
- [ ] Given filters (type, status, period, entity, owner), when applied, then the register updates and exports to Excel/PDF.
- [ ] Given any register edit, then it is written to the audit trail.

**Tasks**

- [ ] Backend: `gosi_variance_register` view/entity linking to `gosi_variance` with resolution fields
- [ ] Backend: ageing + escalation logic
- [ ] Frontend: variance register grid with filters, status workflow, export
- [ ] Alerts/Workflow: ageing escalation to HR/Compliance Manager
- [ ] Tests: unit tests for ageing/escalation and status transitions

**Covers:** 13.21
**Dependencies:** EPIC-13-S10

### EPIC-13-S17 — GOSI Key Takeaways & In-Product Guidance

**Labels:** `user-story`, `social-insurance` · **Priority:** Could · **Estimate:** 2
**As an** HR Admin, **I want** GOSI key takeaways and best-practice guidance surfaced in-product, **so that** users understand obligations and avoid common GOSI mistakes.

**Description**
Surfaces the chapter's key takeaways as a configurable guidance panel and a short onboarding checklist for new GOSI module users (register on time, declare correct wage, reconcile before submit, de-register leavers). Content is editable by admins and versioned.

**Acceptance Criteria**

- [ ] Given the GOSI module home, when opened, then a key-takeaways panel displays configurable best-practice guidance.
- [ ] Given a first-time user, when they enter the module, then a short readiness checklist of GOSI essentials is shown.
- [ ] Given guidance content, when edited by an admin, then it is versioned and effective-dated.
- [ ] Given localisation, then guidance supports English/Arabic content.

**Tasks**

- [ ] Backend: `gosi_guidance_content` table (key, body, locale, version)
- [ ] Frontend: key-takeaways panel + first-run checklist
- [ ] Rules/Config: admin-editable guidance with EN/AR
- [ ] Tests: unit test for versioning and locale fallback

**Covers:** 13.22
**Dependencies:** EPIC-13-S01
