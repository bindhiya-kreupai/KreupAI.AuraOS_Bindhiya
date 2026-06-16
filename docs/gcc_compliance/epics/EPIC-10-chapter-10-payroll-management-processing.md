# EPIC-10: Chapter 10 – Payroll Management & Processing

> **Source:** GCC HR Compliance Handbook — Chapter 10 – Payroll Management & Processing (fills source gap)
> **Module:** Payroll · **Labels:** `epic`, `gcc-compliance`, `payroll`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an end-to-end, controls-first payroll engine in AuraOS for GCC employers: configurable salary structures, a governed payroll calendar, a deterministic calculation engine, maker-checker approval, period locking, payslips, bank/WPS-ready payment files, off-cycle runs, reconciliation, and GL/Finance integration — across multiple countries and currencies. Payroll becomes a fully auditable, automated process where no period closes with missing inputs and every figure is traceable.

## Business Value

Avoids salary-delay and WPS penalties through a calendar-driven, locked process; eliminates calculation errors and manual spreadsheets; gives Finance clean GL postings and reconciled control accounts; gives auditors a complete payroll audit trail; and gives employees accurate, on-time payslips, all while supporting multi-entity, multi-country, multi-currency operations from one platform.

## Requirements Covered (handbook sections)

- 10.1 Payroll Governance & Controls
- 10.2 Salary Structure & Components (Earnings)
- 10.3 Deductions (Statutory, Loans, Advances)
- 10.4 Payroll Calendar & Cut-off
- 10.5 Payroll Inputs Collection
- 10.6 Proration & New Joiner/Leaver Payroll
- 10.7 Payroll Run & Calculation Engine
- 10.8 Maker-Checker Approval
- 10.9 Payroll Locking & Period Close
- 10.10 Payslip Generation & Distribution
- 10.11 Bank/Payment File Generation
- 10.12 Off-Cycle & Supplementary Payroll
- 10.13 Payroll Reconciliation & Variance
- 10.14 Payroll & GL/Finance Integration
- 10.15 Multi-Country & Multi-Currency Payroll
- 10.16 Payroll Audit Trail
- 10.17 Payroll KPIs & Dashboard
- 10.18 Payroll Risk Matrix
- 10.19 HRMS Payroll Automation Design
- 10.20 Sample Payroll Register & Certificate

## Out of Scope

- WPS/Mudad statutory wage-file generation and authority submission (covered by EPIC-11; this epic produces the upstream net-pay/bank data WPS consumes).
- Social-insurance contribution computation rules (GOSI/GPSSA/SIO) detailed in EPIC-13/14/15 — payroll consumes these as deduction inputs.
- EOSB/gratuity final-settlement calculation (EPIC-28) — only routine monthly payroll and off-cycle runs are in scope.
- Overtime calculation rules (EPIC-12) — payroll ingests approved OT amounts as an input.

## Dependencies

- EPIC-02 (Country Rule Engine) · EPIC-08 (Employee Records) · EPIC-09 (Org/Position, cost centers, grades/bands)
- EPIC-11 (WPS) consumes outputs · EPIC-12/19/20 (OT, Attendance, Leave) feed inputs · EPIC-13/14/15 (Social Insurance) feed deductions

## Epic Definition of Done

- [ ] Configurable salary components (earnings/deductions) with country statutory tagging are live.
- [ ] Payroll calendar with cut-off drives input collection and blocks late changes after cut-off.
- [ ] Calculation engine handles gross-to-net, proration, joiners/leavers, and is fully re-runnable and traceable.
- [ ] Maker-checker (preparer ≠ approver) is enforced and a period cannot lock with mandatory inputs missing.
- [ ] Period close produces payslips, bank file, GL journal and a payroll register/certificate.
- [ ] Reconciliation/variance, off-cycle runs, and multi-country/currency are supported.
- [ ] Full payroll audit trail, KPI dashboard and risk register are operational.

---

## User Stories

### EPIC-10-S01 — Payroll governance & controls framework

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a payroll governance framework with segregation of duties, control points and policy parameters, **so that** every payroll runs under defined, auditable controls.

**Description**
Establish payroll governance: roles (Payroll Officer preparer, approver, releaser), segregation-of-duties rules, mandatory control checkpoints (input freeze, reconciliation, approval, lock), and per-entity payroll policy parameters that the run engine enforces.

**Acceptance Criteria**

- [ ] Given payroll roles, when assigned, then the same user cannot hold conflicting roles (preparer ≠ approver ≠ releaser) for the same run.
- [ ] Given a payroll policy, when configured per legal entity, then control checkpoints are mandatory and cannot be skipped.
- [ ] Given any governance/parameter change, when saved, then it is maker-checker approved and audit-logged.
- [ ] Given a run, when started, then it inherits the active, effective-dated governance parameters.

**Tasks**

- [ ] Backend: `payroll_policy` and `payroll_role_assignment` schemas with SoD constraints
- [ ] Backend: control-checkpoint enforcement service
- [ ] Frontend: payroll governance & roles configuration screen
- [ ] Rules/Config: per-entity control parameters
- [ ] Tests: unit tests for SoD conflict rejection

**Covers:** 10.1
**Dependencies:** EPIC-09

### EPIC-10-S02 — Salary structure & earnings components

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** configurable earnings components and salary structures, **so that** basic, allowances and other earnings are defined consistently and country-correctly.

**Description**
Model a configurable component library (basic, HRA, transport, allowances, fixed/variable earnings) with calculation methods (fixed, percentage-of-basic, formula), taxability/statutory flags, proration behaviour, and grade-band linkage, assembled into per-employee salary structures.

**Acceptance Criteria**

- [ ] Given a component, when defined, then its type (fixed/%/formula), base, proratable flag and country statutory tags are captured.
- [ ] Given an employee, when a salary structure is assigned, then the sum of components is validated against the grade salary band (EPIC-09) with out-of-band flagging.
- [ ] Given a country, when a structure is built, then country-specific composition rules apply (e.g., basic must be ≥ defined % of gross for gratuity/WPS basis where required).
- [ ] Given any structure change, when saved, then it is effective-dated, versioned and audit-logged.

**Tasks**

- [ ] Backend: `pay_component` and `employee_salary_structure` schemas (`component_id`, `calc_method`, `base`, `proratable`, `statutory_tag`, `currency`)
- [ ] Backend: component calculation method resolver + band validation
- [ ] Frontend: component library + salary structure builder
- [ ] Rules/Config: per-country composition rules (basic %, gratuity basis)
- [ ] Tests: unit tests for fixed/%/formula evaluation and band validation

**Covers:** 10.2
**Dependencies:** EPIC-09

### EPIC-10-S03 — Deductions (statutory, loans, advances)

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** to manage statutory and voluntary deductions including loans and advances, **so that** net pay is accurate and recoveries are tracked to closure.

**Description**
Support deduction components: statutory (social insurance employee share — GOSI/GPSSA/SIO), loan instalments, salary-advance recovery, fines (within legal limits), and other deductions, with balances, schedules and legal deduction-cap enforcement.

**Acceptance Criteria**

- [ ] Given a loan/advance, when set up, then an instalment schedule with outstanding balance is created and recovered each period until closed.
- [ ] Given statutory deductions, when computed, then the employee share is pulled from the social-insurance modules (EPIC-13/14/15) per country.
- [ ] Given a period, when total deductions are applied, then they cannot exceed the legal maximum % of wage for that country (deduction-cap rule), else flagged/blocked.
- [ ] Given a leaver, when final period runs, then outstanding loan/advance balances are surfaced for recovery in settlement.
- [ ] Given deduction changes, when saved, then audit trail captures actor, amount and reason.

**Tasks**

- [ ] Backend: `deduction`, `loan`, `advance` schemas with schedule + outstanding balance
- [ ] Backend: deduction-cap rule + statutory-deduction integration service
- [ ] Frontend: deduction/loan/advance management screens with balances
- [ ] Rules/Config: per-country legal deduction-cap thresholds
- [ ] Alerts/Workflow: alert when deductions exceed cap or loan nears closure
- [ ] Tests: integration tests for instalment recovery and cap enforcement

**Covers:** 10.3
**Dependencies:** EPIC-10-S02

### EPIC-10-S04 — Payroll calendar & cut-off control

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** a per-entity payroll calendar with cut-off dates, **so that** inputs freeze on time and salaries are paid within statutory windows.

**Description**
Define payroll periods, cut-off dates, processing dates and pay dates per legal entity/frequency, with cut-off enforcement that locks input changes after cut-off and tracks the statutory pay-by date (to support WPS salary-delay prevention).

**Acceptance Criteria**

- [ ] Given a payroll calendar, when configured, then each period has cut-off, processing and pay dates per legal entity.
- [ ] Given the cut-off has passed, when a user attempts to change inputs, then changes are blocked or routed as exceptions to the next period/off-cycle.
- [ ] Given a country statutory pay window, when the projected pay date approaches the limit (e.g., flag if salary would be delayed > 15 days after period end), then an alert is raised.
- [ ] Given calendar changes, when saved, then they are versioned and audit-logged.

**Tasks**

- [ ] Backend: `payroll_calendar`/`payroll_period` schema (`cutoff_date`, `processing_date`, `pay_date`, `statutory_paydue_date`)
- [ ] Backend: cut-off enforcement service on input changes
- [ ] Frontend: payroll calendar configuration + period status view
- [ ] Rules/Config: per-country statutory pay-window thresholds
- [ ] Alerts/Workflow: salary-delay risk alert at 60/30/7-day style thresholds before statutory due date
- [ ] Tests: unit tests for post-cut-off change blocking

**Covers:** 10.4
**Dependencies:** EPIC-10-S01

### EPIC-10-S05 — Payroll inputs collection

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** all variable inputs collected and validated before the run, **so that** payroll is calculated on complete, approved data.

**Description**
Aggregate period inputs — attendance/LWP (EPIC-19), leave (EPIC-20), approved overtime (EPIC-12), one-time earnings/deductions, new joiners/leavers, salary changes — with a completeness checklist and mandatory-input validation that gates the run.

**Acceptance Criteria**

- [ ] Given a period, when input collection runs, then attendance, leave, OT, joiners/leavers and one-time payments are ingested from source modules.
- [ ] Given mandatory inputs, when any are missing (e.g., unposted attendance, unapproved OT, pending bank details), then the run is blocked and the gaps are listed.
- [ ] Given an input source change after ingest but before cut-off, when synced, then inputs refresh and the completeness status updates.
- [ ] Given any manual input entry, when saved, then it is captured with source and audit trail.

**Tasks**

- [ ] Backend: input-aggregation service pulling from attendance/leave/OT modules + `payroll_input` store
- [ ] Backend: mandatory-input completeness checklist + run-gate
- [ ] Frontend: input collection dashboard with per-employee completeness
- [ ] Rules/Config: configurable mandatory-input list per entity
- [ ] Alerts/Workflow: missing-input alerts to Payroll Officer before cut-off
- [ ] Tests: integration tests for run-block on missing mandatory inputs

**Covers:** 10.5
**Dependencies:** EPIC-10-S04

### EPIC-10-S06 — Proration & new joiner/leaver payroll

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** automatic proration for mid-period joiners, leavers and salary changes, **so that** part-period pay is accurate per country day-count rules.

**Description**
Compute prorated earnings/deductions for joiners, leavers, mid-period transfers, unpaid leave and salary revisions, using configurable day-count basis (calendar days, 30-day, actual working days) per country, and split components by proratable flag.

**Acceptance Criteria**

- [ ] Given a joiner mid-period, when calculated, then proratable components are prorated from the join date using the configured day-count basis.
- [ ] Given a leaver, when their last period runs, then earnings are prorated to last working day and outstanding recoveries and leave encashment are flagged.
- [ ] Given a mid-period salary change, when applied, then the period splits at the effective date and each portion uses the correct rate.
- [ ] Given a country, when proration runs, then the correct day-count convention (e.g., 30-day vs calendar) is applied via the rule engine.
- [ ] Given a non-proratable component, when present, then it is paid in full regardless of part-period.

**Tasks**

- [ ] Backend: proration engine with configurable day-count basis + period-split logic
- [ ] Backend: joiner/leaver detection from employee lifecycle events
- [ ] Frontend: proration preview per affected employee
- [ ] Rules/Config: per-country day-count convention
- [ ] Tests: unit tests for joiner/leaver/mid-change proration across day-count bases

**Covers:** 10.6
**Dependencies:** EPIC-10-S05

### EPIC-10-S07 — Payroll run & calculation engine

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 13
**As a** Payroll Officer, **I want** a deterministic, re-runnable calculation engine, **so that** gross-to-net is computed consistently with full traceability.

**Description**
Build the core engine that, for each employee, evaluates earnings, proration, statutory and voluntary deductions and net pay in a defined order, producing per-employee payroll results with a calculation trace, supporting trial runs, recalculation and rollback before lock.

**Acceptance Criteria**

- [ ] Given a period with complete inputs, when a trial run executes, then per-employee gross, deductions and net are computed with a step-by-step calculation trace.
- [ ] Given the same inputs, when re-run, then results are identical (deterministic) and the prior trial result is superseded, not overwritten silently.
- [ ] Given a calculation, when inspected, then each component shows its formula, base, proration factor and resulting amount.
- [ ] Given an error in inputs, when detected, then the affected employee is flagged with the reason and excluded from approval until resolved.
- [ ] Given a completed run, when results exist, then totals roll up by cost center, department and legal entity.

**Tasks**

- [ ] Backend: `payroll_run` and `payroll_result` schemas (`run_id`, `period_id`, `employee_id`, `gross`, `net`, `status`, `calc_trace`)
- [ ] Backend: ordered calculation engine (earnings → proration → deductions → net) with trace capture
- [ ] Backend: trial-run, recalculate and rollback services
- [ ] Frontend: run console with per-employee result and calculation-trace drill-down
- [ ] Rules/Config: calculation order and rounding rules per country
- [ ] Tests: unit + e2e tests for deterministic recompute and error-flagging

**Covers:** 10.7
**Dependencies:** EPIC-10-S06

### EPIC-10-S08 — Maker-checker payroll approval

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** payroll results approved through maker-checker before payment, **so that** no run is paid without independent review.

**Description**
Route the calculated run for approval where the preparer cannot approve their own run; the approver reviews totals, variances and exceptions, and can approve, reject (with comments) or send back, gated by DoA thresholds for total payroll value.

**Acceptance Criteria**

- [ ] Given a completed run, when submitted for approval, then the preparer (maker) cannot be the approver (checker).
- [ ] Given the approver view, when opened, then variance vs prior period, exception list and total-by-entity are shown for sign-off.
- [ ] Given a run total exceeding a DoA threshold, when submitted, then it routes to the higher authority per EPIC-09 DoA.
- [ ] Given a rejection, when returned, then the run is unlocked for correction and the rejection reason is audit-logged.
- [ ] Given approval, when granted, then the run is marked approved and becomes eligible for lock/payment.

**Tasks**

- [ ] Backend: approval-state machine on `payroll_run` with maker≠checker rule
- [ ] Backend: DoA-threshold routing integration (EPIC-09)
- [ ] Frontend: approval screen with variance and exception summary
- [ ] Alerts/Workflow: approval notifications + escalation on delay
- [ ] Tests: integration tests for maker≠checker and DoA routing

**Covers:** 10.8
**Dependencies:** EPIC-10-S07, EPIC-10-S13

### EPIC-10-S09 — Payroll locking & period close

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** to lock and close an approved payroll period, **so that** results are frozen, immutable and ready for payslips, bank file and GL.

**Description**
Provide period locking that freezes all inputs and results after approval, prevents any further change without a controlled re-open, and transitions the period to "closed", triggering downstream payslip/bank/GL generation.

**Acceptance Criteria**

- [ ] Given an approved run, when lock is attempted, then it is blocked if any mandatory input or approval is missing.
- [ ] Given a locked period, when any user attempts to edit results/inputs, then the change is rejected and only a controlled re-open (elevated approval) can unlock it.
- [ ] Given a re-open, when granted, then it is audit-logged with reason and the period must be re-approved before re-lock.
- [ ] Given period close, when completed, then payslip, bank-file and GL-journal generation events are emitted.

**Tasks**

- [ ] Backend: lock/close state on `payroll_period` + re-open workflow
- [ ] Backend: immutability guard on locked results
- [ ] Frontend: period-close screen with pre-close checklist
- [ ] Alerts/Workflow: emit close events to payslip/bank/GL services
- [ ] Tests: e2e tests for lock-block-on-missing-input and re-open re-approval

**Covers:** 10.9
**Dependencies:** EPIC-10-S08

### EPIC-10-S10 — Payslip generation & distribution

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 5
**As an** Employee (Self-Service), **I want** an accurate, on-time payslip, **so that** I can see my earnings, deductions and net pay each period.

**Description**
Generate per-employee payslips from locked results with configurable, multilingual (Arabic/English) templates, secure self-service distribution and download, and optional email/notification, with full earnings/deductions breakdown and YTD figures.

**Acceptance Criteria**

- [ ] Given a closed period, when payslips generate, then each employee gets a payslip with earnings, deductions, net and YTD, in the configured language(s).
- [ ] Given self-service, when an employee logs in, then they can view/download only their own payslips (RBAC-scoped).
- [ ] Given a country, when the template renders, then required statutory fields for that country are included.
- [ ] Given a re-opened/re-run period, when re-closed, then payslips are re-issued with a clear version indicator.
- [ ] Given distribution, when triggered, then access and downloads are audit-logged.

**Tasks**

- [ ] Backend: payslip generation service from locked results + `payslip` store
- [ ] Backend: multilingual configurable template engine (PDF)
- [ ] Frontend: ESS payslip viewer/download with RBAC
- [ ] Rules/Config: per-country payslip required fields
- [ ] Alerts/Workflow: payslip-ready notification
- [ ] Tests: integration tests for RBAC scoping and re-issue versioning

**Covers:** 10.10
**Dependencies:** EPIC-10-S09

### EPIC-10-S11 — Bank/payment file generation

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** to generate validated bank/payment files from locked payroll, **so that** salaries are paid through the correct bank/WPS-ready channel.

**Description**
Produce per-bank, per-entity payment files in required formats (including WPS-compatible SIF where applicable) from locked net-pay results, with IBAN/account validation, beneficiary checks, currency handling and a release step separate from approval.

**Acceptance Criteria**

- [ ] Given a locked run, when a bank file is generated, then it includes validated IBAN/account, amount, currency and value date per beneficiary.
- [ ] Given invalid bank details, when validation runs, then those employees are blocked from the file and flagged for correction.
- [ ] Given a country, when generating, then the correct file format/layout is produced and the net-pay data is made available for the WPS module (EPIC-11).
- [ ] Given file release, when actioned, then it is a separate authorized step (releaser ≠ preparer) and is audit-logged.
- [ ] Given totals, when the file is produced, then the file control total reconciles to the approved run net total.

**Tasks**

- [ ] Backend: payment-file generator with per-country layout templates + control totals
- [ ] Backend: IBAN/account validation service
- [ ] Frontend: bank-file generation + release screen with validation results
- [ ] Rules/Config: per-country/bank file format and value-date rules
- [ ] Alerts/Workflow: release authorization step + exception list
- [ ] Tests: integration tests for control-total reconciliation and invalid-IBAN exclusion

**Covers:** 10.11
**Dependencies:** EPIC-10-S09

### EPIC-10-S12 — Off-cycle & supplementary payroll

**Labels:** `user-story`, `payroll` · **Priority:** Should · **Estimate:** 5
**As a** Payroll Officer, **I want** to run off-cycle and supplementary payrolls, **so that** corrections, late inputs and ad-hoc payments are processed outside the main run.

**Description**
Support off-cycle runs (corrections, missed payments, leaver settlements) and supplementary runs (bonuses, arrears) that reuse the engine, approval, lock and payment flow, with linkage back to the affected main period and YTD/statutory accumulation.

**Acceptance Criteria**

- [ ] Given an off-cycle need, when a run is created, then it links to the relevant employee(s) and main period and reuses the standard calc/approval/lock flow.
- [ ] Given a supplementary payment (e.g., arrears/bonus), when processed, then it accumulates to YTD and feeds statutory/GL correctly.
- [ ] Given an off-cycle run, when approved and locked, then it produces its own payslip, bank file and GL entry, clearly marked off-cycle.
- [ ] Given any off-cycle action, when performed, then it is fully audit-logged with reason.

**Tasks**

- [ ] Backend: off-cycle/supplementary run type on `payroll_run` with main-period linkage
- [ ] Backend: YTD/statutory accumulation across run types
- [ ] Frontend: off-cycle run creation + reason capture
- [ ] Alerts/Workflow: reuse maker-checker and release flow
- [ ] Tests: integration tests for YTD accumulation across off-cycle runs

**Covers:** 10.12
**Dependencies:** EPIC-10-S09, EPIC-10-S11

### EPIC-10-S13 — Payroll reconciliation & variance analysis

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** automated reconciliation and variance analysis before approval, **so that** anomalies are caught before payment.

**Description**
Provide period-over-period variance (headcount, gross, net, deductions) at employee and aggregate level, threshold-based exception flagging, control-total reconciliation (inputs vs results vs bank file vs GL), and a documented sign-off of variance explanations.

**Acceptance Criteria**

- [ ] Given a run, when variance analysis runs, then employees/components with variance beyond configurable thresholds (e.g., > 10% or new/dropped pay items) are flagged.
- [ ] Given each flagged variance, when reviewed, then an explanation must be recorded before approval can proceed.
- [ ] Given control totals, when reconciled, then run net = sum of payslips = bank-file total = GL net, with any break flagged.
- [ ] Given the reconciliation, when completed, then a reconciliation pack is stored and audit-logged for the period.

**Tasks**

- [ ] Backend: variance engine (period-over-period + threshold) + control-total reconciliation service
- [ ] Backend: variance-explanation capture gating approval
- [ ] Frontend: variance & reconciliation dashboard with sign-off
- [ ] Rules/Config: variance thresholds per component/entity
- [ ] Tests: integration tests for threshold flagging and control-total breaks

**Covers:** 10.13
**Dependencies:** EPIC-10-S07

### EPIC-10-S14 — Payroll & GL/Finance integration

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** payroll to post a balanced journal to Finance, **so that** labour cost and liabilities are recorded accurately by cost center and entity.

**Description**
Map pay components to GL accounts and cost centers, generate a balanced (debit/credit) journal per locked period including accruals (EOSB/leave provisions feed where applicable), and integrate with the ERP/GL via API/file with posting confirmation and reconciliation.

**Acceptance Criteria**

- [ ] Given mapped components, when a period closes, then a balanced journal (total debits = total credits) is generated per legal entity.
- [ ] Given cost centers (EPIC-09), when posting, then costs are split by cost center/department.
- [ ] Given the GL system, when the journal is sent, then a posting confirmation/reference is captured, or failure is flagged for retry.
- [ ] Given multi-currency, when posting, then amounts post in entity base currency with FX rate captured.
- [ ] Given any posting, when completed, then it is audit-logged and reconciles to the payroll register.

**Tasks**

- [ ] Backend: `gl_mapping` (component → account) + journal-generation service with balance check
- [ ] Backend: ERP/GL integration adapter (API/file) with posting status
- [ ] Frontend: GL mapping configuration + posting status screen
- [ ] Rules/Config: per-entity chart-of-accounts mapping + FX source
- [ ] Tests: integration tests for balanced-journal generation and posting confirmation
- [ ] Alerts/Workflow: posting-failure alert and retry

**Covers:** 10.14
**Dependencies:** EPIC-10-S09, EPIC-10-S15

### EPIC-10-S15 — Multi-country & multi-currency payroll

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** to run payroll across GCC countries and currencies from one platform, **so that** each legal entity is processed under its own rules and currency.

**Description**
Enable per-legal-entity, per-country payroll execution where the rule engine resolves statutory deductions, proration conventions, pay components, file formats and rounding by country, and each entity processes in its base currency with FX handling for cross-currency elements and consolidated reporting.

**Acceptance Criteria**

- [ ] Given multiple legal entities across UAE/Saudi/Bahrain/Qatar/Oman/Kuwait, when payroll runs, then each resolves its own statutory rules, components and currency via the rule engine.
- [ ] Given a cross-currency element, when calculated, then the FX rate and source are captured and stored on the result.
- [ ] Given consolidated reporting, when requested, then figures convert to a chosen reporting currency with rates shown.
- [ ] Given country file/format differences, when generating outputs, then the correct payslip, bank/WPS file and GL format per country is produced.

**Tasks**

- [ ] Backend: country/entity context resolution in run engine + `fx_rate` store
- [ ] Backend: reporting-currency consolidation service
- [ ] Frontend: multi-entity run dashboard + currency display
- [ ] Rules/Config: bind per-country rule packs (deductions, proration, formats) to entities
- [ ] Tests: integration tests for two-country, two-currency run isolation

**Covers:** 10.15
**Dependencies:** EPIC-02, EPIC-10-S07

### EPIC-10-S16 — Payroll audit trail

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As an** Internal Auditor, **I want** a complete, immutable payroll audit trail, **so that** every input, calculation, approval and payment can be traced end-to-end.

**Description**
Capture an append-only audit log of all payroll events — input changes, run executions, recalculations, approvals/rejections, locks/re-opens, file releases, GL postings — with before/after values, actor, timestamp and reason, queryable for any period or employee.

**Acceptance Criteria**

- [ ] Given any payroll change, when it occurs, then an immutable audit record with actor, timestamp, before/after and reason is written.
- [ ] Given an employee and period, when queried, then the full chain from input to net pay to payment is reconstructable.
- [ ] Given audit records, when accessed, then they are read-only and cannot be edited or deleted, even by admins.
- [ ] Given an auditor request, when run, then audit data is exportable for the period with integrity assurance.

**Tasks**

- [ ] Backend: append-only `payroll_audit_log` with before/after + reason capture across services
- [ ] Backend: trace-reconstruction query API per employee/period
- [ ] Frontend: audit log viewer with filters and export
- [ ] Tests: integration tests asserting immutability and full-chain reconstruction

**Covers:** 10.16
**Dependencies:** EPIC-10-S07, EPIC-10-S09

### EPIC-10-S17 — Payroll KPIs & dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership user, **I want** a payroll KPI dashboard, **so that** I can monitor payroll cost, accuracy, timeliness and compliance.

**Description**
Build a dashboard covering total payroll cost by entity/cost center, payroll accuracy (error/off-cycle rate), on-time payment %, salary-delay risk, processing cycle time, variance trend and exception counts, with drill-down and RBAC scoping.

**Acceptance Criteria**

- [ ] Given the dashboard, when loaded, then it shows payroll cost, on-time-payment %, error rate, off-cycle %, and variance trend per entity.
- [ ] Given a salary-delay risk, when the projected pay date breaches the statutory window, then a compliance KPI flags it.
- [ ] Given a KPI tile, when clicked, then it drills down to the contributing runs/employees.
- [ ] Given RBAC, when a leader logs in, then they see only their in-scope entities.

**Tasks**

- [ ] Backend: KPI aggregation endpoints (cost, timeliness, accuracy, variance)
- [ ] Frontend: payroll KPI dashboard with drill-down + export
- [ ] Rules/Config: KPI definitions and threshold configuration
- [ ] Tests: integration tests for KPI computation and RBAC scoping

**Covers:** 10.17
**Dependencies:** EPIC-10-S13

### EPIC-10-S18 — Payroll risk matrix & controls register

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** a configurable payroll risk matrix and controls register, **so that** payroll risks are identified, scored and mitigated.

**Description**
Provide a risk register of common payroll risks (ghost employees, duplicate payments, unauthorized changes, salary delay, deduction-cap breach, reconciliation breaks) with likelihood × impact scoring, linked controls, red-flag detection rules and remediation tracking.

**Acceptance Criteria**

- [ ] Given the risk matrix, when configured, then each risk has likelihood, impact, score, owner and linked control.
- [ ] Given red-flag rules, when run against a period, then conditions like duplicate IBAN, ghost/no-attendance pay, or post-lock change attempts are detected and logged.
- [ ] Given a flagged risk, when raised, then it is tracked to remediation with due date and status.
- [ ] Given the register, when configured, then risks and scoring are tenant-editable.

**Tasks**

- [ ] Backend: `payroll_risk_register` + red-flag detection rules engine
- [ ] Frontend: risk matrix/heatmap + remediation board
- [ ] Rules/Config: configurable red-flag rules and scoring
- [ ] Alerts/Workflow: red-flag alerts to Compliance Officer
- [ ] Tests: integration tests for duplicate-IBAN/ghost-pay detection

**Covers:** 10.18
**Dependencies:** EPIC-10-S13, EPIC-10-S16

### EPIC-10-S19 — HRMS payroll automation design

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**As a** System Administrator, **I want** payroll workflow automation and scheduling, **so that** the cycle runs end-to-end with minimal manual intervention.

**Description**
Implement the handbook's payroll automation design: scheduled cut-off enforcement, auto-ingest of inputs, auto trial-run, exception-only intervention, automated payslip/bank/GL emission on close, and event-driven notifications across the cycle, all configurable per entity.

**Acceptance Criteria**

- [ ] Given a configured schedule, when the cut-off date arrives, then inputs auto-freeze and a trial run is auto-triggered.
- [ ] Given a clean run, when no exceptions exist, then it proceeds to the approval step automatically; otherwise it halts on exceptions.
- [ ] Given period close, when locked, then payslip, bank-file and GL events fire automatically.
- [ ] Given automation config, when changed, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: payroll scheduler/orchestrator + event-driven step transitions
- [ ] Backend: exception-only halt logic
- [ ] Frontend: automation/schedule configuration console
- [ ] Alerts/Workflow: cycle-stage notifications via event bus
- [ ] Tests: e2e test of an automated cycle with and without exceptions

**Covers:** 10.19
**Dependencies:** EPIC-10-S05, EPIC-10-S09

### EPIC-10-S20 — Payroll register & compliance certificate

**Labels:** `user-story`, `payroll` · **Priority:** Should · **Estimate:** 3
**As a** Payroll Officer, **I want** a payroll register and monthly compliance certificate, **so that** I have the statutory record and management sign-off for each period.

**Description**
Generate the sample payroll register (per-employee earnings/deductions/net with totals by entity/cost center) and a monthly payroll compliance certificate confirming completeness, approval, reconciliation and on-time payment, both exportable and stored as period evidence.

**Acceptance Criteria**

- [ ] Given a closed period, when the register is generated, then it lists every employee's earnings, deductions and net with totals by cost center and legal entity.
- [ ] Given the certificate, when produced, then it attests completeness, maker-checker approval, reconciliation status and pay-on-time, signed off by the authorized role.
- [ ] Given export, when requested, then register and certificate export to PDF/Excel and are stored against the period.
- [ ] Given generation, when completed, then it is audit-logged as period evidence.

**Tasks**

- [ ] Backend: payroll-register builder + certificate generator from locked results
- [ ] Frontend: register & certificate view with PDF/Excel export and e-sign
- [ ] Rules/Config: configurable certificate attestation fields
- [ ] Tests: integration tests for register totals reconciling to run net

**Covers:** 10.20
**Dependencies:** EPIC-10-S09, EPIC-10-S13
