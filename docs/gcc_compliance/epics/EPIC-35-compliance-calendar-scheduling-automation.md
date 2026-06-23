# EPIC-35: Compliance Calendar & Scheduling Automation

> **Source:** GCC HR Compliance Handbook — Appendix A1 – GCC Compliance Calendar and Annual Audit Plan
> **Module:** platform · **Labels:** `epic`, `gcc-compliance`, `platform`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a recurring statutory-task scheduler in AuraOS that turns every GCC HR compliance obligation — monthly, quarterly and annual — into owned, dated, alerting tasks across payroll, WPS, social insurance, visa/permit renewal, nationalization checkpoints, Ramadan/holiday events, insurance/benefits renewals, HSE/training and document audits. It also drives the annual HR compliance audit plan (sampling, testing checklists, findings and corrective actions, management review) and produces a calendar dashboard and monthly compliance-calendar certificate.

## Business Value

Eliminates missed statutory deadlines — the single largest source of GCC HR penalties — by scheduling and alerting every recurring obligation with a named owner and escalation path, so WPS submissions, GOSI/GPSSA/SIO filings, visa/permit renewals and nationalization checkpoints never lapse. The annual audit plan plus findings/corrective-action tracking gives leadership a defensible, evidenced compliance cadence, and the monthly certificate proves the calendar was executed.

## Requirements Covered (handbook sections)

- A1.1 Introduction
- A1.2 Objectives of a GCC Compliance Calendar
- A1.3 Compliance Calendar Governance Framework
- A1.4 Compliance Calendar Categories
- A1.5 Monthly HR Compliance Calendar
- A1.6 Quarterly HR Compliance Calendar
- A1.7 Annual HR Compliance Calendar
- A1.8 Payroll Compliance Calendar
- A1.9 Social Insurance Filing Calendar
- A1.10 Work Permit and Visa Renewal Calendar
- A1.11 Nationalization Checkpoint Calendar
- A1.12 Ramadan and Public Holiday Calendar
- A1.13 Insurance and Benefits Renewal Calendar
- A1.14 HSE and Training Calendar
- A1.15 Employee Relations Calendar
- A1.16 Document and File Audit Calendar
- A1.17 Annual HR Compliance Audit Plan
- A1.18 HR Audit Sampling Plan
- A1.19 HR Audit Testing Checklist
- A1.20 Audit Findings and Corrective Actions
- A1.21 Management Review Schedule
- A1.22 AuraOS Compliance Calendar Automation
- A1.23 Compliance Calendar Dashboard
- A1.24 Monthly Compliance Calendar Certificate
- A1.25 Sample Annual HR Compliance Audit Plan
- A1.26 Sample Compliance Task Register
- A1.27 Key Takeaways

## Out of Scope

- The execution logic of each scheduled task (running payroll, submitting WPS, processing visas) — owned by the respective domain epics; this epic schedules, assigns and tracks them.
- The compliance checklist content and red-flag rules themselves (EPIC-37) — consumed here as audit testing checklists.
- KPI definitions and scorecard library (EPIC-38) — the calendar dashboard surfaces calendar metrics, not the full KPI catalogue.
- Country rule sourcing (EPIC-36) — calendar uses country deadlines from the rule engine.

## Dependencies

- EPIC-34 (Alerts/Workflow/Audit config) · EPIC-36 (country deadlines) · EPIC-37 (audit checklists) · feeds EPIC-31 (Compliance Dashboard)

## Epic Definition of Done

- [ ] Recurring statutory tasks (monthly/quarterly/annual) generate per entity with owner, due date and category.
- [ ] Domain calendars (payroll, social insurance, visa/permit, nationalization, Ramadan/holiday, insurance/benefits, HSE/training, ER, document audit) are live and country-correct.
- [ ] Tiered deadline alerts and escalation fire ahead of and on each due date.
- [ ] Annual audit plan with sampling, testing checklists, findings and corrective actions, and management review is operational.
- [ ] Calendar automation generates and rolls forward recurring tasks with no manual scheduling.
- [ ] Calendar dashboard, compliance task register and monthly compliance-calendar certificate are produced and audit-logged.
- [ ] Every task and audit action is owned, dated and audit-trailed.

---

## User Stories

### EPIC-35-S01 — Compliance calendar objectives, governance & categories

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** a governed compliance-calendar model with defined categories, **so that** every statutory obligation has structure, ownership and a control framework.
**Description**
Establish the calendar foundation: objectives, governance roles (calendar owner, task owners, approvers), and the category taxonomy (payroll, social insurance, immigration, nationalization, holiday, benefits, HSE, ER, document audit). This frames every scheduling and automation story.

**Acceptance Criteria**

- [ ] Given the platform, when configured, then calendar categories and governance roles/control points are defined.
- [ ] Given a category, when created, then it has an owner role and default cadence.
- [ ] Given governance, when set, then task creation → assignment → completion → certification control points are mandatory.
- [ ] Given any calendar-config change, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `calendar_category`, `calendar_governance` schemas
- [ ] Backend: governance control-point service
- [ ] Frontend: calendar governance & category configuration screen
- [ ] Rules/Config: default category taxonomy and cadences
- [ ] Tests: unit tests for control-point enforcement

**Covers:** A1.1, A1.2, A1.3, A1.4
**Dependencies:** EPIC-34

### EPIC-35-S02 — Recurring task scheduler (monthly/quarterly/annual)

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** a recurring statutory-task scheduler, **so that** monthly, quarterly and annual obligations auto-generate as owned, dated tasks.
**Description**
Build the core scheduler that defines recurrence rules (monthly/quarterly/annual, with country-specific due-date logic and holiday shifting) and auto-generates tasks per entity with owner, due date, category, dependencies and status, forming the monthly/quarterly/annual HR compliance calendars and the compliance task register.

**Acceptance Criteria**

- [ ] Given a recurrence rule, when active, then tasks auto-generate for each upcoming period per entity with owner, due date and category.
- [ ] Given a due date that falls on a public holiday/weekend, when computed, then it shifts per the country rule.
- [ ] Given monthly/quarterly/annual scopes, when generated, then they populate the respective calendar views and the task register.
- [ ] Given task generation, when run, then it is idempotent (no duplicates) and audit-logged.

**Tasks**

- [ ] Backend: `compliance_task`, `recurrence_rule` schemas + scheduler engine
- [ ] Backend: holiday/weekend due-date shifting using country calendar
- [ ] Frontend: monthly/quarterly/annual calendar views + task register
- [ ] Rules/Config: recurrence templates per category/country
- [ ] Tests: integration tests for idempotent generation and date shifting

**Covers:** A1.5, A1.6, A1.7, A1.26
**Dependencies:** EPIC-35-S01

### EPIC-35-S03 — Payroll & social insurance filing calendars

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** payroll and social-insurance filing calendars, **so that** pay runs, WPS/Mudad submissions and GOSI/GPSSA/SIO filings are never late.
**Description**
Configure the payroll compliance calendar (cut-off, run, approval, WPS/Mudad submission, GL posting) and the social-insurance filing calendar (GOSI, GPSSA, SIO and Qatar/Oman/Kuwait equivalents) with per-country statutory due dates and salary-delay thresholds, generating tasks and alerts from the scheduler.

**Acceptance Criteria**

- [ ] Given an entity, when configured, then payroll cut-off/run/WPS-submission tasks generate with country due dates (e.g., WPS within statutory window).
- [ ] Given social insurance, when configured, then GOSI/GPSSA/SIO filing tasks generate per country deadline.
- [ ] Given a due date approaching, when reached, then tiered alerts fire to the payroll owner.
- [ ] Given task completion, when recorded, then it is audit-logged with evidence link.

**Tasks**

- [ ] Backend: payroll/social-insurance calendar templates feeding the scheduler
- [ ] Backend: country deadline resolution from rule engine
- [ ] Frontend: payroll & social-insurance calendar views
- [ ] Rules/Config: per-country payroll/WPS/contribution deadlines
- [ ] Alerts/Workflow: deadline alerts to task owners
- [ ] Tests: integration tests for deadline generation per country

**Covers:** A1.8, A1.9
**Dependencies:** EPIC-35-S02, EPIC-36

### EPIC-35-S04 — Visa/permit renewal & nationalization checkpoint calendars

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As a** PRO / Immigration Officer, **I want** visa/permit renewal and nationalization checkpoint calendars, **so that** renewals and localization targets are tracked to deadline.
**Description**
Generate per-employee work-permit/visa renewal tasks driven by document expiry (alerting 60/30/7 days before) and per-entity nationalization checkpoint tasks (Emiratisation/Nitaqat/Bahrainization/Omanisation mid-year/year-end and platform-reporting dates), with owners and escalation.

**Acceptance Criteria**

- [ ] Given an expiring visa/permit, when within the alert window, then a renewal task and tiered alerts (60/30/7 days) are raised to the PRO.
- [ ] Given an entity, when nationalization checkpoints are configured, then checkpoint tasks generate on the scheme's dates.
- [ ] Given a missed/at-risk checkpoint, when detected, then it escalates to management.
- [ ] Given task actions, when taken, then they are audit-logged.

**Tasks**

- [ ] Backend: expiry-driven renewal-task generator + nationalization checkpoint scheduler
- [ ] Backend: tiered-alert engine for expiries
- [ ] Frontend: visa/permit renewal and nationalization checkpoint calendars
- [ ] Rules/Config: per-country renewal windows and checkpoint dates
- [ ] Alerts/Workflow: 60/30/7-day alerts + management escalation
- [ ] Tests: integration tests for expiry-driven task generation

**Covers:** A1.10, A1.11
**Dependencies:** EPIC-35-S02, EPIC-36

### EPIC-35-S05 — Ramadan/holiday & insurance/benefits renewal calendars

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** Ramadan/public-holiday and insurance/benefits renewal calendars, **so that** seasonal schedule changes and policy renewals are planned and actioned on time.
**Description**
Configure the Ramadan/public-holiday calendar (per-country holiday lists, Ramadan reduced-hours window, event-based tasks like schedule changes and communications) and the insurance/benefits renewal calendar (medical/life policy renewals, vendor SLAs) with lead-time alerts.

**Acceptance Criteria**

- [ ] Given a country, when the holiday calendar is loaded, then public holidays and the Ramadan window generate event-based tasks and communications.
- [ ] Given an insurance/benefit policy, when its renewal nears, then a renewal task and lead-time alert are raised.
- [ ] Given a holiday-calendar change, when published, then dependent schedules/tasks update and are flagged.
- [ ] Given task actions, when taken, then they are audit-logged.

**Tasks**

- [ ] Backend: holiday/Ramadan and policy-renewal calendar generators
- [ ] Backend: renewal lead-time alerting
- [ ] Frontend: holiday/Ramadan and benefits-renewal calendar views
- [ ] Rules/Config: per-country holidays and renewal lead times
- [ ] Alerts/Workflow: renewal and holiday-change alerts
- [ ] Tests: integration tests for holiday-driven task generation

**Covers:** A1.12, A1.13
**Dependencies:** EPIC-35-S02, EPIC-36

### EPIC-35-S06 — HSE/training, employee-relations & document-audit calendars

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** HSE/training, employee-relations and document-audit calendars, **so that** recurring safety, ER and file-audit obligations are scheduled and owned.
**Description**
Configure the HSE/training calendar (safety training, drills, inspections, certification renewals), the employee-relations calendar (grievance SLA reviews, recurring ER reporting) and the document/file-audit calendar (employee-file completeness audits, document-expiry sweeps, retention reviews) as scheduler-driven tasks.

**Acceptance Criteria**

- [ ] Given HSE config, when scheduled, then training/drill/inspection tasks generate on cadence with owners.
- [ ] Given ER config, when scheduled, then recurring ER review/reporting tasks generate.
- [ ] Given document-audit config, when scheduled, then file-completeness and expiry-sweep tasks generate.
- [ ] Given task completion, when recorded, then it is audit-logged with evidence.

**Tasks**

- [ ] Backend: HSE/ER/document-audit calendar templates feeding the scheduler
- [ ] Frontend: HSE/training, ER and document-audit calendar views
- [ ] Rules/Config: cadence templates per category
- [ ] Alerts/Workflow: due-date alerts to owners
- [ ] Tests: integration tests for cadence generation

**Covers:** A1.14, A1.15, A1.16
**Dependencies:** EPIC-35-S02

### EPIC-35-S07 — Annual HR compliance audit plan, sampling & testing checklist

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**As an** Internal Auditor, **I want** an annual audit plan with sampling and testing checklists, **so that** the yearly HR compliance audit is structured, evidenced and repeatable.
**Description**
Build the annual HR compliance audit plan (scope, schedule, areas, owners), the audit sampling plan (population, sample size/method per area, e.g., risk-based and random sampling), and the audit testing checklist driving each area's tests — producing the sample annual audit plan from the handbook.

**Acceptance Criteria**

- [ ] Given a year, when the audit plan is configured, then scope, schedule, areas and owners are defined and generate audit tasks.
- [ ] Given an audit area, when sampling is configured, then sample size/method and selected records are produced from the population.
- [ ] Given a sample, when tested, then the area's testing checklist captures pass/fail with evidence.
- [ ] Given the plan, when exported, then it produces the annual audit-plan document and is audit-logged.

**Tasks**

- [ ] Backend: `audit_plan`, `audit_sample`, `audit_test_result` schemas
- [ ] Backend: sampling engine (risk-based + random) over populations
- [ ] Frontend: audit-plan builder + sampling + testing-checklist runner
- [ ] Rules/Config: per-area sampling methods and testing checklists
- [ ] Tests: integration tests for sample selection and test capture

**Covers:** A1.17, A1.18, A1.19, A1.25
**Dependencies:** EPIC-35-S01, EPIC-37

### EPIC-35-S08 — Audit findings, corrective actions & management review schedule

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** findings, corrective-action tracking and a management-review schedule, **so that** audit issues are remediated and reviewed by leadership on cadence.
**Description**
Capture audit findings from testing, raise corrective actions with owner/due date/severity, track them to closure, and schedule recurring management reviews of compliance status and open actions, with escalation for overdue items.

**Acceptance Criteria**

- [ ] Given a failed test, when raised, then a finding and corrective action are created with owner, due date and severity.
- [ ] Given an open corrective action, when overdue, then it escalates to management.
- [ ] Given the management-review schedule, when due, then a review task with the open-actions pack is generated.
- [ ] Given finding/action updates, when made, then they are audit-logged.

**Tasks**

- [ ] Backend: `audit_finding`, `corrective_action`, `management_review` schemas
- [ ] Backend: overdue-escalation and review-scheduling service
- [ ] Frontend: findings & corrective-action register + management-review board
- [ ] Alerts/Workflow: overdue-action and review-due alerts
- [ ] Tests: integration tests for escalation and review generation

**Covers:** A1.20, A1.21
**Dependencies:** EPIC-35-S07

### EPIC-35-S09 — Compliance calendar automation

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As a** System Administrator, **I want** end-to-end calendar automation, **so that** tasks roll forward, reassign and escalate without manual scheduling.
**Description**
Implement the AuraOS calendar automation: auto-roll recurring tasks each period, auto-assign by role/entity, auto-escalate overdue tasks up the chain, auto-close on evidence, and re-derive dates on holiday-calendar or rule changes — event-driven and configurable per entity.

**Acceptance Criteria**

- [ ] Given a new period, when reached, then recurring tasks auto-generate and auto-assign without manual action.
- [ ] Given an overdue task, when detected, then it auto-escalates per the configured tier.
- [ ] Given a holiday-calendar or rule change, when published, then affected future task dates re-derive automatically.
- [ ] Given automation config, when changed, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: calendar orchestrator (roll-forward, assignment, escalation, auto-close) on event bus
- [ ] Backend: date re-derivation on calendar/rule change events
- [ ] Frontend: calendar automation configuration console
- [ ] Alerts/Workflow: auto-escalation notifications
- [ ] Tests: e2e test of roll-forward, escalation and date re-derivation

**Covers:** A1.22
**Dependencies:** EPIC-35-S02

### EPIC-35-S10 — Calendar dashboard & monthly compliance-calendar certificate

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3
**As an** Executive / Leadership user, **I want** a calendar dashboard and monthly compliance-calendar certificate, **so that** I can see on-time compliance status and attest the calendar was executed.
**Description**
Build the compliance calendar dashboard (on-time %, overdue tasks, upcoming deadlines, by category/entity/country with drill-down and RBAC) and the monthly compliance-calendar certificate attesting all due tasks were completed or formally deferred, with the chapter key-takeaways as reference.

**Acceptance Criteria**

- [ ] Given the dashboard, when loaded, then on-time %, overdue and upcoming tasks show per category/entity/country with drill-down.
- [ ] Given RBAC, when a user views, then only in-scope entities are visible.
- [ ] Given the monthly certificate, when generated, then it attests completion/deferral of all due tasks and is blocked while critical tasks are overdue.
- [ ] Given the certificate, when exported, then it produces a PDF and is audit-logged.

**Tasks**

- [ ] Backend: calendar-KPI aggregation + certificate generator with gating
- [ ] Frontend: calendar dashboard + certificate view with e-sign/export and key-takeaways reference
- [ ] Rules/Config: certificate attestation fields
- [ ] Tests: integration tests for KPI computation, RBAC and certificate gating

**Covers:** A1.23, A1.24, A1.27
**Dependencies:** EPIC-35-S02, EPIC-35-S09
