# EPIC-12: Chapter 12 – Overtime Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 12 – Overtime Compliance
> **Module:** Time & Attendance · **Labels:** `epic`, `gcc-compliance`, `time-attendance`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an end-to-end overtime compliance module in AuraOS that governs eligibility, request/approval workflow, attendance-driven OT detection, country-specific calculation rules (including Ramadan hours, rest-day and public-holiday premiums), compensatory off, budget control, fatigue/HSE safeguards and fraud controls, and feeds approved overtime cleanly into payroll. Overtime becomes a controlled, auditable, country-correct process rather than a manual, error-prone spreadsheet activity.

## Business Value

Prevents labour-law breaches on maximum working hours and OT premiums, avoids underpayment/overpayment disputes and penalties, controls overtime cost against budget, protects workers from fatigue-related HSE risk, blocks OT fraud (ghost hours, unapproved OT), and gives payroll accurate, pre-approved OT inputs with a full audit trail across all GCC countries.

## Requirements Covered (handbook sections)

- 12.1 Introduction
- 12.2 Purpose of Overtime Compliance
- 12.3 GCC Working Hours Overview
- 12.4 Overtime Governance Framework
- 12.5 Overtime Eligibility
- 12.6 Types of Overtime
- 12.7 Overtime Approval Workflow
- 12.8 Attendance Integration
- 12.9 Overtime Calculation Principles
- 12.10 Country-Specific Overtime Controls
- 12.11 Ramadan Working Hours
- 12.12 Shift Workers and Rotational Staff
- 12.13 Rest Day and Public Holiday Work
- 12.14 Compensatory Off
- 12.15 Overtime Budget Control
- 12.16 Fatigue and Health & Safety Risk
- 12.17 Overtime Fraud and Abuse Risks
- 12.18 Payroll Integration
- 12.19 Overtime Audit Checklist
- 12.20 Overtime KPIs
- 12.21 HRMS Overtime Automation Design
- 12.22 Sample Overtime Request Form
- 12.23 Sample Overtime Exception Register
- 12.24 Key Takeaways

## Out of Scope

- Core attendance capture/punch processing (EPIC-19) — this epic consumes attendance data and pushes OT back.
- Payroll calculation engine and payslip generation (EPIC-10) — only approved OT amounts/hours are handed to payroll.
- Public-holiday calendar governance (EPIC-21) — consumed as input for holiday-work premium.
- Leave management (EPIC-20) — comp-off balances may integrate but leave rules live there.

## Dependencies

- EPIC-02 (Country Rule Engine) · EPIC-19 (Attendance) · EPIC-21 (Public Holidays) · EPIC-10 (Payroll) · EPIC-09 (Org/Position for eligibility & budget)

## Epic Definition of Done

- [ ] OT eligibility, types and governance are configurable per country/grade/role.
- [ ] OT requests run through approval before attendance-based OT is payable.
- [ ] Attendance integration auto-detects OT and matches it to approvals.
- [ ] Country-specific calculation (rates, caps, Ramadan, rest-day/holiday premiums) is correct via the rule engine.
- [ ] Compensatory off, budget control and fatigue/HSE limits are enforced.
- [ ] Fraud controls flag ghost/unapproved/duplicate OT.
- [ ] Approved OT feeds payroll; KPIs, audit checklist and exception register are live.

---

## User Stories

### EPIC-12-S01 — Working-hours, purpose & OT governance framework

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a configurable working-hours and overtime governance framework per country, **so that** OT operates within statutory hour limits and defined controls.

**Description**
Establish standard/maximum working hours per country (daily/weekly), define the OT governance model (policy, roles, control points, statutory caps) and capture the handbook's purpose/working-hours context, forming the rule baseline all OT stories consume.

**Acceptance Criteria**

- [ ] Given each GCC country, when configured, then standard and maximum daily/weekly working hours and OT caps are defined (e.g., max 2 OT hours/day where applicable).
- [ ] Given OT governance, when set, then policy, approval roles and control points are mandatory before OT is payable.
- [ ] Given a country, when working hours are evaluated, then the rule engine resolves the correct limits per legal entity.
- [ ] Given any config change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `working_hours_rule` and `ot_policy` schemas (country, std_hours, max_hours, daily_ot_cap)
- [ ] Backend: governance control-point service
- [ ] Frontend: working-hours & OT policy configuration screen
- [ ] Rules/Config: per-country statutory hour limits and OT caps
- [ ] Tests: unit tests for hour-limit resolution per country

**Covers:** 12.1, 12.2, 12.3, 12.4
**Dependencies:** EPIC-02

### EPIC-12-S02 — Overtime eligibility

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** configurable OT eligibility rules, **so that** only eligible employees can earn overtime.

**Description**
Define eligibility by grade, role, employment type, exemption status (e.g., senior/managerial exemptions per labour law) and country, so OT requests and attendance-derived OT are only valid for eligible employees.

**Acceptance Criteria**

- [ ] Given eligibility rules, when an OT request or detection occurs for an ineligible employee, then it is blocked/flagged with the reason.
- [ ] Given country exemptions, when applied, then exempt categories (e.g., certain senior roles) are excluded from OT pay per the rule engine.
- [ ] Given an employee, when their grade/role changes, then eligibility re-evaluates effective-dated.
- [ ] Given eligibility config, when changed, then it is audit-logged.

**Tasks**

- [ ] Backend: `ot_eligibility_rule` schema (grade/role/type/country/exempt flag)
- [ ] Backend: eligibility resolver used by request and detection flows
- [ ] Frontend: eligibility configuration screen
- [ ] Rules/Config: per-country exemption categories
- [ ] Tests: unit tests for ineligible-employee blocking

**Covers:** 12.5
**Dependencies:** EPIC-12-S01, EPIC-09

### EPIC-12-S03 — Types of overtime

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 3
**As a** Payroll Officer, **I want** distinct overtime types defined, **so that** each is approved, calculated and paid at the correct rate.

**Description**
Model OT types (normal weekday OT, night OT, rest-day/weekend OT, public-holiday OT, Ramadan OT) each with its own premium-rate basis and approval/calculation behaviour, used across request, calculation and payroll.

**Acceptance Criteria**

- [ ] Given OT types, when configured, then each carries its rate basis and the conditions under which it applies.
- [ ] Given an OT event, when classified, then it is assigned exactly one type based on day/time/holiday context.
- [ ] Given a country, when types are applied, then country-specific type availability and rates are resolved.
- [ ] Given type config, when changed, then it is audit-logged.

**Tasks**

- [ ] Backend: `ot_type` schema with rate basis and applicability conditions
- [ ] Backend: OT-type classification service (day/time/holiday context)
- [ ] Frontend: OT type configuration screen
- [ ] Rules/Config: per-country OT type/rate availability
- [ ] Tests: unit tests for correct type classification

**Covers:** 12.6
**Dependencies:** EPIC-12-S01

### EPIC-12-S04 — Overtime approval workflow

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**As a** Line Manager, **I want** to request and approve overtime before it is worked, **so that** only authorized OT is performed and paid.

**Description**
Provide pre-authorization OT requests (employee/manager-initiated) with estimated hours, type, reason and cost estimate, routed through approval per delegation of authority (EPIC-09), with pre-approval the default control and post-facto approval as a tracked exception.

**Acceptance Criteria**

- [ ] Given an OT request, when submitted, then it captures employee, date, estimated hours, type and reason and routes to the authorized approver per DoA.
- [ ] Given approval thresholds, when hours/cost exceed a limit, then it escalates to a higher approver.
- [ ] Given OT worked without prior approval, when detected from attendance, then it is flagged as post-facto and requires exception approval before payment.
- [ ] Given an approval/rejection, when actioned, then it is captured with comments and audit-logged.
- [ ] Given a budget breach (EPIC-12-S11), when requesting, then the approver is warned/blocked per config.

**Tasks**

- [ ] Backend: `ot_request` schema with state machine + DoA routing
- [ ] Backend: post-facto OT exception handling
- [ ] Frontend: OT request + manager approval screens (and ESS)
- [ ] Alerts/Workflow: approval routing, escalation and notifications
- [ ] Rules/Config: approval thresholds per grade/cost
- [ ] Tests: integration tests for DoA routing and post-facto exception path

**Covers:** 12.7
**Dependencies:** EPIC-12-S03, EPIC-09

### EPIC-12-S05 — Attendance integration & OT detection

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** OT auto-detected from attendance and matched to approvals, **so that** payable OT reflects actual hours worked against authorization.

**Description**
Ingest attendance/punch data (EPIC-19), compute hours worked beyond schedule, classify into OT types, and reconcile detected OT against approved requests — paying only approved-and-worked hours, flagging worked-but-unapproved and approved-but-not-worked discrepancies.

**Acceptance Criteria**

- [ ] Given attendance data, when processed, then hours beyond the scheduled shift are computed and classified into OT types by day/time context.
- [ ] Given approved OT requests, when matched, then payable OT = min(approved, actually worked) unless an exception is approved.
- [ ] Given worked-but-unapproved OT, when found, then it is flagged for exception approval and not auto-paid.
- [ ] Given approved-but-not-worked OT, when found, then it is dropped and logged.
- [ ] Given any detection, when computed, then it is audit-logged with source punches.

**Tasks**

- [ ] Backend: OT-detection service over attendance + request-matching engine
- [ ] Backend: discrepancy classification (unapproved/not-worked)
- [ ] Frontend: OT reconciliation view (detected vs approved vs payable)
- [ ] Rules/Config: schedule/shift definitions and tolerance
- [ ] Tests: integration tests for min(approved,worked) and discrepancy flagging

**Covers:** 12.8
**Dependencies:** EPIC-12-S04, EPIC-19

### EPIC-12-S06 — Overtime calculation principles & country-specific controls

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** country-correct OT calculation, **so that** OT pay matches each GCC country's statutory rates and caps.

**Description**
Implement the OT calculation engine using configurable hourly-rate basis and country-specific premium multipliers and caps (e.g., UAE ~1.25× normal / 1.5× night, rest-day and holiday premiums; Saudi 1.5×; similar rules for Bahrain/Qatar/Oman/Kuwait), with hourly-rate derivation from the correct salary basis per country.

**Acceptance Criteria**

- [ ] Given OT hours and type, when calculated, then the correct country premium multiplier and hourly-rate basis are applied via the rule engine.
- [ ] Given a country cap (e.g., max OT hours/day), when exceeded, then excess hours are flagged and handled per policy.
- [ ] Given different OT types, when present in a period, then each is calculated at its own rate and summed.
- [ ] Given a country, when the hourly rate is derived, then it uses that country's prescribed salary base (e.g., basic vs gross).
- [ ] Given a calculation, when produced, then a trace of rate, multiplier and hours is captured.

**Tasks**

- [ ] Backend: OT calculation engine with hourly-rate derivation + premium application
- [ ] Backend: per-country rate/multiplier/cap rule pack
- [ ] Frontend: OT calculation preview with rate trace
- [ ] Rules/Config: UAE/Saudi/Bahrain/Qatar/Oman/Kuwait OT rates, bases and caps
- [ ] Tests: unit tests for each country's multiplier and cap handling

**Covers:** 12.9, 12.10
**Dependencies:** EPIC-12-S05

### EPIC-12-S07 — Ramadan working hours

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** Ramadan reduced-hours rules applied automatically, **so that** OT during Ramadan is computed against the correct reduced baseline.

**Description**
Apply Ramadan reduced standard hours (e.g., 2-hour daily reduction per applicable country rules) for the configured Ramadan period, recompute the OT threshold/baseline, and handle whether the reduction applies to all staff or fasting Muslims per country, integrating with the holiday/Ramadan calendar.

**Acceptance Criteria**

- [ ] Given the configured Ramadan period, when active, then the standard daily hours are reduced per the country rule and OT is measured against the reduced baseline.
- [ ] Given a country, when Ramadan rules apply, then applicability scope (all staff vs Muslim/fasting staff) is resolved per configuration.
- [ ] Given the Ramadan period boundaries, when set, then they bind to the holiday calendar (EPIC-21) and the rule engine.
- [ ] Given Ramadan OT, when calculated, then the reduced-baseline computation is reflected in the calculation trace.

**Tasks**

- [ ] Backend: Ramadan-period reduced-hours service feeding OT baseline
- [ ] Backend: applicability-scope resolution per country
- [ ] Frontend: Ramadan rules configuration + period binding
- [ ] Rules/Config: per-country Ramadan hour reduction and scope
- [ ] Tests: unit tests for reduced-baseline OT during Ramadan

**Covers:** 12.11
**Dependencies:** EPIC-12-S06, EPIC-21

### EPIC-12-S08 — Shift workers & rotational staff

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As an** HR Admin, **I want** OT handled correctly for shift and rotational workers, **so that** night shifts, rotations and shift differentials compute accurately.

**Description**
Support shift patterns and rotations in OT detection/calculation: define shift schedules, night-shift windows, rotation cycles and rest requirements, so OT beyond rostered shifts (including cross-midnight) is detected and classified correctly.

**Acceptance Criteria**

- [ ] Given a rostered shift, when actual hours exceed it, then OT is measured against the roster, not a fixed day window.
- [ ] Given a cross-midnight or night shift, when worked, then hours are attributed to the correct day/type and night-OT rules apply.
- [ ] Given a rotation cycle, when evaluated, then minimum rest between shifts is checked and breaches flagged.
- [ ] Given shift config, when changed, then it is effective-dated and audit-logged.

**Tasks**

- [ ] Backend: shift/roster-aware OT detection (cross-midnight handling)
- [ ] Backend: minimum-rest-between-shifts check
- [ ] Frontend: shift/rotation configuration screen
- [ ] Rules/Config: night-window and rest-period rules per country
- [ ] Tests: integration tests for cross-midnight OT attribution

**Covers:** 12.12
**Dependencies:** EPIC-12-S05

### EPIC-12-S09 — Rest-day & public-holiday work

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** rest-day and public-holiday work computed at premium rates, **so that** weekend/holiday work is compensated per labour law.

**Description**
Detect work on weekly rest days and public holidays (via holiday calendar EPIC-21), apply the statutory premium and/or compensatory-off entitlement per country, and route holiday-work approval, distinguishing rest-day vs gazetted-holiday treatment.

**Acceptance Criteria**

- [ ] Given work on a rest day or public holiday, when detected, then the country's premium rate and/or comp-off entitlement is applied.
- [ ] Given holiday work, when performed, then prior approval is required and post-facto cases are flagged as exceptions.
- [ ] Given a country, when computing, then rest-day vs public-holiday rules are distinguished and resolved via the rule engine.
- [ ] Given the calculation, when produced, then premium and/or comp-off accrual is recorded with a trace.

**Tasks**

- [ ] Backend: rest-day/holiday-work detection against holiday calendar + premium/comp-off application
- [ ] Backend: holiday-work approval gate
- [ ] Frontend: holiday-work approval + result view
- [ ] Rules/Config: per-country rest-day and holiday premium/comp-off rules
- [ ] Alerts/Workflow: holiday-work approval routing
- [ ] Tests: integration tests for premium vs comp-off per country

**Covers:** 12.13
**Dependencies:** EPIC-12-S06, EPIC-21

### EPIC-12-S10 — Compensatory off

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As an** Employee (Self-Service), **I want** to accrue and use compensatory off for eligible OT/holiday work, **so that** I can take time off instead of OT pay where the policy allows.

**Description**
Manage comp-off as an alternative to OT pay: accrue comp-off for eligible OT/rest-day/holiday work, track balances with expiry, allow employees to request comp-off leave, and reconcile so the same hours are never both paid and comped.

**Acceptance Criteria**

- [ ] Given eligible OT/holiday work, when policy elects comp-off, then a comp-off balance accrues with an expiry date.
- [ ] Given a comp-off balance, when an employee requests time off, then it is approved and deducted from balance.
- [ ] Given the same hours, when processed, then they cannot be both OT-paid and comp-off accrued (mutual exclusivity enforced).
- [ ] Given expiry, when reached, then unused comp-off is handled per policy (lapse/encash) and audit-logged.

**Tasks**

- [ ] Backend: `comp_off_balance` schema with accrual/expiry + mutual-exclusivity guard
- [ ] Backend: comp-off request/deduction service (integrate with leave EPIC-20)
- [ ] Frontend: comp-off balance + request screen (ESS)
- [ ] Rules/Config: per-country/policy comp-off accrual and expiry rules
- [ ] Tests: integration tests for paid-vs-comped mutual exclusivity

**Covers:** 12.14
**Dependencies:** EPIC-12-S09

### EPIC-12-S11 — Overtime budget control

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As an** HR Manager, **I want** OT budgets enforced per department/cost center, **so that** overtime spend stays within approved limits.

**Description**
Set OT budgets (hours/cost) per department/cost center/period (linked to EPIC-09), track committed vs actual OT against budget at request and payroll time, and warn or block requests that breach budget, with override requiring elevated approval.

**Acceptance Criteria**

- [ ] Given an OT budget, when a request would breach it, then the system warns or blocks per config and surfaces remaining budget.
- [ ] Given approved OT, when consumed, then committed and actual OT update against the budget in real time.
- [ ] Given a budget override, when granted, then it requires elevated approval and is audit-logged.
- [ ] Given a period, when reviewed, then OT budget vs actual variance is reported per cost center.

**Tasks**

- [ ] Backend: `ot_budget` schema (cost_center, period, budget_hours, budget_cost) + consumption tracking
- [ ] Backend: budget-breach check at request and payroll stages
- [ ] Frontend: OT budget configuration + budget-vs-actual view
- [ ] Rules/Config: warn vs block mode and override approval
- [ ] Alerts/Workflow: budget-threshold alerts (e.g., at 80%/100%)
- [ ] Tests: integration tests for breach blocking and override path

**Covers:** 12.15
**Dependencies:** EPIC-12-S04, EPIC-09

### EPIC-12-S12 — Fatigue & health-&-safety risk controls

**Labels:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** fatigue and HSE limits enforced on overtime, **so that** excessive hours don't endanger worker health and safety.

**Description**
Enforce maximum cumulative working hours, minimum rest periods and consecutive-OT-day limits, flagging or blocking OT that breaches fatigue thresholds (e.g., max consecutive workdays, max weekly hours), with escalation to HSE/HR for high-risk roles.

**Acceptance Criteria**

- [ ] Given cumulative hours, when OT would exceed the configured fatigue limit (e.g., max weekly hours or consecutive days), then it is flagged or blocked.
- [ ] Given minimum-rest rules, when violated by an OT assignment, then it is blocked/escalated.
- [ ] Given a high-risk role, when fatigue thresholds approach, then an alert escalates to HSE/HR.
- [ ] Given any fatigue breach/override, when recorded, then it is audit-logged.

**Tasks**

- [ ] Backend: fatigue-limit engine (cumulative hours, consecutive days, min rest)
- [ ] Backend: HSE escalation hook
- [ ] Frontend: fatigue-risk monitor and breach view
- [ ] Rules/Config: per-country/role fatigue thresholds
- [ ] Alerts/Workflow: HSE/HR escalation on breach
- [ ] Tests: unit tests for cumulative-hours and rest-period breach detection

**Covers:** 12.16
**Dependencies:** EPIC-12-S06

### EPIC-12-S13 — Overtime fraud & abuse controls

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As an** Internal Auditor, **I want** OT fraud and abuse red-flags, **so that** ghost hours, manipulation and abuse are detected and prevented.

**Description**
Detect OT fraud patterns: OT without supporting punches (ghost hours), self-approved OT, repeated post-facto OT, duplicate OT for the same hours, statistical outliers (employees/managers with abnormal OT), and approval after the fact, raising cases to the exception register.

**Acceptance Criteria**

- [ ] Given OT pay with no/insufficient attendance support, when detected, then it is flagged as potential ghost OT and withheld from payroll.
- [ ] Given an approver approving their own OT, when detected, then it is blocked/flagged (maker ≠ approver).
- [ ] Given duplicate OT for the same hours/date, when detected, then it is flagged and deduplicated.
- [ ] Given outlier OT (e.g., top-percentile hours or repeated post-facto), when detected, then it is raised as a fraud-risk case.
- [ ] Given any flag, when raised, then it is logged to the exception register and audit trail.

**Tasks**

- [ ] Backend: OT fraud red-flag engine (ghost/self-approval/duplicate/outlier)
- [ ] Backend: withhold-from-payroll on critical flags
- [ ] Frontend: fraud-flag review queue
- [ ] Rules/Config: configurable fraud thresholds/rules
- [ ] Alerts/Workflow: fraud-case alerts to auditor/compliance
- [ ] Tests: integration tests for ghost-OT and self-approval detection

**Covers:** 12.17
**Dependencies:** EPIC-12-S05, EPIC-12-S04

### EPIC-12-S14 — Payroll integration

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** approved, calculated OT delivered to payroll as a clean input, **so that** OT is paid accurately within the payroll period.

**Description**
Hand off finalized OT (approved, reconciled, non-fraud-flagged) to the payroll input collection (EPIC-10) per period, by employee, OT type and amount, respecting the payroll cut-off, with locked OT figures that cannot change after payroll lock.

**Acceptance Criteria**

- [ ] Given a payroll period, when OT is finalized before cut-off, then approved OT hours/amounts feed payroll inputs by employee and type.
- [ ] Given fraud-flagged or unreconciled OT, when present, then it is excluded from the payroll feed until resolved.
- [ ] Given the payroll cut-off, when passed, then OT for that period is frozen and late OT routes to the next period/off-cycle.
- [ ] Given the handoff, when completed, then OT figures are locked and audit-logged against the payroll run.

**Tasks**

- [ ] Backend: OT-to-payroll feed service keyed to payroll period/cut-off
- [ ] Backend: exclusion of unresolved/flagged OT + freeze on lock
- [ ] Frontend: OT-to-payroll handoff summary
- [ ] Alerts/Workflow: late-OT routing to next period
- [ ] Tests: integration tests for cut-off freeze and flagged-OT exclusion

**Covers:** 12.18
**Dependencies:** EPIC-12-S06, EPIC-12-S13, EPIC-10

### EPIC-12-S15 — Overtime KPIs & dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3
**As an** Executive / Leadership user, **I want** an overtime KPI dashboard, **so that** I can monitor OT cost, hours, trends and compliance.

**Description**
Build a dashboard with total OT cost/hours by department/cost center/country, OT-to-base-pay ratio, top OT employees/managers, post-facto OT %, budget-vs-actual, fatigue-breach count and fraud-flag count, with drill-down and RBAC.

**Acceptance Criteria**

- [ ] Given the dashboard, when loaded, then OT cost, hours, ratio, budget variance and exception counts show per org/country.
- [ ] Given a KPI tile, when clicked, then it drills to underlying OT records/employees.
- [ ] Given RBAC, when a user views, then only in-scope org units appear.
- [ ] Given a period, when selected, then metrics recompute for that period.

**Tasks**

- [ ] Backend: OT KPI aggregation endpoints
- [ ] Frontend: OT KPI dashboard with drill-down + export
- [ ] Rules/Config: KPI definitions/thresholds
- [ ] Tests: integration tests for KPI computation and RBAC scoping

**Covers:** 12.20
**Dependencies:** EPIC-12-S11, EPIC-12-S13

### EPIC-12-S16 — HRMS overtime automation design

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**As a** System Administrator, **I want** OT automation across the cycle, **so that** detection, calculation, reconciliation and payroll feed run with exception-only intervention.

**Description**
Implement the OT automation design: scheduled attendance ingest, auto OT detection/classification/calculation, auto request-matching and fraud screening, exception-only manual review, and automated payroll feed at cut-off, all event-driven and configurable per entity.

**Acceptance Criteria**

- [ ] Given attendance posting, when it completes, then OT auto-detects, classifies, calculates and matches to approvals.
- [ ] Given clean OT, when no exceptions/flags exist, then it flows to the payroll feed automatically; otherwise it halts on exceptions.
- [ ] Given the payroll cut-off, when reached, then finalized OT is auto-pushed to payroll inputs.
- [ ] Given automation config, when changed, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: OT orchestrator (ingest→detect→calc→match→screen→feed) on event bus
- [ ] Backend: exception-only halt logic
- [ ] Frontend: OT automation configuration console
- [ ] Alerts/Workflow: stage notifications and exception halts
- [ ] Tests: e2e test of automated OT cycle with and without exceptions

**Covers:** 12.21
**Dependencies:** EPIC-12-S05, EPIC-12-S14

### EPIC-12-S17 — OT request form, audit checklist, exception register & takeaways

**Labels:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** a digital OT request form, audit checklist and exception register, **so that** OT requests are standardized and governance gaps are tracked.

**Description**
Build a configurable digital Overtime Request Form (mirroring the handbook sample), a configurable OT audit checklist (pre-approval present, hours match attendance, rates correct, within caps/budget, no self-approval) and an OT exception register (post-facto, fraud flags, budget/fatigue breaches), with export and the key-takeaways reference.

**Acceptance Criteria**

- [ ] Given the OT request form, when submitted, then required fields (employee, date, type, estimated hours, reason) are validated and it feeds the approval workflow.
- [ ] Given the audit checklist, when run for a period, then it flags red-flags (missing pre-approval, hours-vs-attendance mismatch, wrong rate, cap/budget breach, self-approval).
- [ ] Given OT exceptions, when raised, then they are recorded in the exception register with type, owner, status and resolution.
- [ ] Given export, when requested, then form/checklist/register export to PDF/Excel and are audit-logged.

**Tasks**

- [ ] Backend: OT request form schema + audit-rule engine + `ot_exception_register`
- [ ] Frontend: configurable OT request form, audit checklist runner and exception register
- [ ] Rules/Config: configurable red-flag rules
- [ ] Alerts/Workflow: unresolved-exception alerts
- [ ] Tests: integration tests for red-flag detection and register lifecycle

**Covers:** 12.19, 12.22, 12.23, 12.24
**Dependencies:** EPIC-12-S04, EPIC-12-S13
