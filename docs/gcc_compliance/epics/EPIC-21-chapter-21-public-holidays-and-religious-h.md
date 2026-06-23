# EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 21 – Public Holidays and Religious Holidays Compliance
> **Module:** Time & Attendance · **Labels:** `epic`, `gcc-compliance`, `time-attendance`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a configurable public/religious holiday compliance module in AuraOS that governs the annual holiday calendar per GCC country, handles Hijri-driven Eid and Ramadan events (including provisional vs gazetted dates), and controls holiday-work approval, holiday pay/overtime treatment, compensatory off and holiday-leave overlap. The holiday calendar becomes the authoritative source that attendance, leave, overtime and payroll consume, with full audit trail and change management.

## Business Value

Prevents labour-law breaches on public-holiday pay and premiums (typically 150% + a day off in lieu, or equivalent), avoids disputes from incorrect holiday treatment of leave/attendance, handles late government Eid announcements via change management, controls and evidences holiday-work approvals, and gives payroll correct holiday pay/overtime inputs with defensible inspection evidence across all six GCC countries.

## Requirements Covered (handbook sections)

- 21.1 Introduction
- 21.2 Objectives of Public Holiday Compliance
- 21.3 GCC Holiday Governance Framework
- 21.4 Types of Holidays in the GCC
- 21.5 Annual Holiday Calendar Governance
- 21.6 Country-Wise Public Holiday Overview
- 21.7 Eid Holiday Management
- 21.8 Ramadan Schedule Impact
- 21.9 Holiday Work Approval
- 21.10 Holiday Pay and Overtime Treatment
- 21.11 Compensatory Off for Holiday Work
- 21.12 Holiday and Leave Overlap
- 21.13 Holiday and Attendance Integration
- 21.14 Holiday and Payroll Integration
- 21.15 Holiday and Contractor Management
- 21.16 Holiday Communication
- 21.17 Holiday Calendar Change Management
- 21.18 Holiday Audit Checklist
- 21.19 Holiday KPIs
- 21.20 Holiday Risk Matrix
- 21.21 HRMS Holiday Automation Design
- 21.22 Holiday Dashboard
- 21.23 Monthly / Event-Based Holiday Compliance Pack
- 21.24 Sample Public Holiday Compliance Certificate
- 21.25 Sample Holiday Work Approval Register
- 21.26 Sample Leave-Holiday Conflict Register
- 21.27 Key Takeaways

## Out of Scope

- Attendance capture/punch processing (EPIC-19) — holidays are consumed by attendance, not captured here.
- Overtime calculation engine and rates (EPIC-12) — this epic defines holiday-work treatment and hands hours to OT.
- Leave entitlement/accrual rules (EPIC-20) — only holiday-leave overlap is handled here.
- Payroll calculation engine, payslip and bank file (EPIC-10) — only holiday pay/premium inputs are pushed.

## Dependencies

- EPIC-02 (Country Rule Engine) · EPIC-09 (Org/Position for site/entity calendars) · EPIC-19 (Attendance) · EPIC-20 (Leave) · EPIC-12 (Overtime) · EPIC-10 (Payroll)

## Epic Definition of Done

- [ ] Annual holiday calendar is configurable and governed per country/entity/site, including holiday types.
- [ ] Hijri-driven Eid/Ramadan events handle provisional vs confirmed dates with change management.
- [ ] Holiday-work approval, holiday pay/overtime treatment and comp-off are enforced.
- [ ] Holiday-leave overlap, attendance and payroll integrations work end-to-end.
- [ ] Contractor holiday handling and holiday communication are supported.
- [ ] KPIs, dashboard, audit checklist, risk matrix, compliance pack, certificate and registers are live.

---

## User Stories

### EPIC-21-S01 — Holiday objectives, types & governance framework

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a configurable holiday governance framework and holiday-type taxonomy per country, **so that** holidays are managed under defined controls and the correct legal basis.

**Description**
Establish the governance baseline: holiday-type taxonomy (national/public, religious/Islamic, gazetted vs declared, paid vs optional, half-day), ownership/approval roles, control points and the stated objectives. This is the rule foundation all holiday stories consume.

**Acceptance Criteria**

- [ ] Given each GCC country, when configured, then holiday types and their pay/treatment defaults are stored and versioned.
- [ ] Given the governance model, when set, then calendar-owner roles and approval/control points are mandatory.
- [ ] Given a legal entity, when holiday rules resolve, then the rule engine returns the correct country/entity configuration.
- [ ] Given any framework/type change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `holiday_governance` + `holiday_type` schemas (country, type, pay_treatment, gazetted_flag)
- [ ] Backend: governance control-point + rule-resolution service
- [ ] Frontend: holiday governance & type configuration screen
- [ ] Rules/Config: per-country holiday-type defaults
- [ ] Tests: unit tests for type/treatment resolution per country

**Covers:** 21.1, 21.2, 21.3, 21.4
**Dependencies:** EPIC-02

### EPIC-21-S02 — Annual holiday calendar governance & country overview

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** to author and govern annual holiday calendars per country, **so that** each country/entity/site has an authoritative, approved holiday calendar.

**Description**
Build the annual holiday calendar with per-country/entity/site scoping, the country-wise public-holiday overview (national days, Islamic New Year, Prophet's Birthday, Eid Al-Fitr, Eid Al-Adha, Arafat Day, Commemoration/Martyrs' days etc.), draft→review→approve→publish governance, and effective-dated versions.

**Acceptance Criteria**

- [ ] Given a year and country, when a calendar is built, then the standard public holidays for that country are seeded and editable.
- [ ] Given an entity/site, when a calendar is scoped, then it can override the country default (e.g., emirate-specific).
- [ ] Given a calendar, when published, then it follows draft→review→approve→publish with maker-checker.
- [ ] Given a published calendar, when changed, then a new version is created and prior version retained, audit-logged.

**Tasks**

- [ ] Backend: `holiday_calendar`, `holiday` schemas (country, entity_id, site_id, date, type, status, version)
- [ ] Backend: country-overview seeding + publish workflow
- [ ] Frontend: calendar builder + per-country/entity/site editor
- [ ] Rules/Config: per-country standard holiday set
- [ ] Alerts/Workflow: approve/publish maker-checker workflow
- [ ] Tests: integration tests for seeding, scoping override, publish/versioning

**Covers:** 21.5, 21.6
**Dependencies:** EPIC-21-S01, EPIC-09

### EPIC-21-S03 — Eid holiday management (Hijri, provisional vs confirmed)

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** Hijri-based Eid holidays managed with provisional and confirmed dates, **so that** late government announcements are handled without breaking pay/attendance.

**Description**
Model Hijri-driven Eid Al-Fitr and Eid Al-Adha (multi-day, often moon-sighting dependent) with provisional (estimated) and confirmed (gazetted) date states, automatic propagation of the confirmed dates to attendance/leave/payroll, and handling of bridging days where applicable.

**Acceptance Criteria**

- [ ] Given an Eid event, when created, then provisional Hijri-based dates are set and clearly marked provisional.
- [ ] Given a government announcement, when entered, then the confirmed dates replace provisional and propagate to consumers.
- [ ] Given multi-day Eid, when configured, then each day's pay treatment and any half-day eve is applied per country.
- [ ] Given confirmation/change, when applied, then it triggers the change-management flow and is audit-logged.

**Tasks**

- [ ] Backend: Eid-event model with provisional/confirmed states + Hijri date support
- [ ] Backend: propagation service on confirmation; bridging-day logic
- [ ] Frontend: Eid management screen (provisional vs confirmed)
- [ ] Rules/Config: per-country Eid day counts and eve half-day rules
- [ ] Alerts/Workflow: confirmation triggers change-management
- [ ] Tests: integration tests for provisional→confirmed propagation

**Covers:** 21.7
**Dependencies:** EPIC-21-S02, EPIC-21-S12

### EPIC-21-S04 — Ramadan schedule impact

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** Ramadan's schedule impact reflected in the holiday/calendar module, **so that** the Ramadan window drives reduced hours and related events consistently.

**Description**
Define the Hijri Ramadan window (provisional/confirmed) at the calendar level so that the reduced-hours rule (consumed by attendance EPIC-19) and Ramadan-related events (e.g., Eid eve) activate over the correct period, with country-specific eligibility.

**Acceptance Criteria**

- [ ] Given the Hijri year, when configured, then the Ramadan window is set with provisional then confirmed start/end.
- [ ] Given the confirmed window, when published, then attendance consumes it for reduced-hours and evaluation.
- [ ] Given country eligibility, when applied, then the reduced-hours scope targets the correct population per law.
- [ ] Given window confirmation/change, when applied, then it propagates and is audit-logged.

**Tasks**

- [ ] Backend: `ramadan_window` schema (country, provisional, confirmed, eligibility) + publish event
- [ ] Backend: propagation to attendance (`ramadan.window.confirmed`)
- [ ] Frontend: Ramadan window config screen
- [ ] Rules/Config: per-country Ramadan eligibility
- [ ] Tests: integration tests for window confirm + propagation

**Covers:** 21.8
**Dependencies:** EPIC-21-S02, EPIC-19-S12

### EPIC-21-S05 — Holiday work approval

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As a** Line Manager, **I want** a holiday-work approval workflow, **so that** working on a public holiday/rest day is pre-authorized and evidenced.

**Description**
Provide a request/approval workflow to authorize specified employees to work on a public holiday or rest day (reason, headcount, shift), feeding the Holiday Work Approval Register and enabling correct holiday pay/comp-off downstream; unauthorized holiday work is flagged.

**Acceptance Criteria**

- [ ] Given an upcoming holiday, when a manager requests holiday work, then employees, shift and reason are captured and routed for approval.
- [ ] Given approval, when granted, then approved employees are tagged for holiday-work pay/comp-off treatment.
- [ ] Given attendance on a holiday without approval, when detected, then it is flagged as unauthorized for review.
- [ ] Given any approval, when granted, then it posts to the Holiday Work Approval Register and is audit-logged.

**Tasks**

- [ ] Backend: `holiday_work_request` schema (holiday_id, employee_ids, shift, reason, status)
- [ ] Backend: approval service + unauthorized-holiday-work detection
- [ ] Frontend: holiday-work request + approval screens
- [ ] Rules/Config: approver hierarchy per entity
- [ ] Alerts/Workflow: approval routing + maker-checker
- [ ] Tests: e2e for request→approve→tag; unauthorized detection

**Covers:** 21.9, 21.25 (feeds register)
**Dependencies:** EPIC-21-S02, EPIC-19

### EPIC-21-S06 — Holiday pay & overtime treatment

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** country-correct holiday pay and overtime treatment computed, **so that** holiday work is paid at the right premium and day-in-lieu rules apply.

**Description**
Implement per-country holiday-work treatment (e.g., UAE: pay for the day plus 50% of wage premium, or a substitute day off; rest-day/holiday premium rates), splitting normal vs premium hours, integrating with the OT engine (EPIC-12) and producing payroll inputs.

**Acceptance Criteria**

- [ ] Given approved holiday work, when computed, then the country premium applies (e.g., 150% pay, or normal pay + day-in-lieu per UAE rule).
- [ ] Given hours beyond shift on a holiday, when computed, then holiday-OT rates layer correctly via the OT engine.
- [ ] Given a day-in-lieu rule, when chosen over premium, then a comp-off credit is generated instead of/with the premium per country.
- [ ] Given holiday pay, when produced, then it feeds payroll with a breakdown and is audit-logged.

**Tasks**

- [ ] Backend: holiday-pay treatment service (premium vs day-in-lieu) + OT-engine handover
- [ ] Backend: normal/premium hour split
- [ ] Frontend: holiday-pay breakdown view
- [ ] Rules/Config: per-country holiday premium rate and day-in-lieu rule
- [ ] Tests: unit tests for premium, OT layering, day-in-lieu per country

**Covers:** 21.10
**Dependencies:** EPIC-21-S05, EPIC-12

### EPIC-21-S07 — Compensatory off for holiday work

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 3
**As an** Employee (Self-Service), **I want** comp-off credited for approved holiday work, **so that** I can take a day in lieu within validity.

**Description**
Generate comp-off credits from approved holiday work (where day-in-lieu treatment applies) and hand them to the leave module's comp-off balance (EPIC-20), with validity and conversion rules.

**Acceptance Criteria**

- [ ] Given approved holiday work with day-in-lieu treatment, when processed, then a comp-off credit is created with validity.
- [ ] Given the credit, when published, then it appears in the employee's comp-off balance (EPIC-20).
- [ ] Given an expiring credit, when validity passes, then it lapses or converts to pay per country rule.
- [ ] Given credit creation, when done, then it is audit-logged.

**Tasks**

- [ ] Backend: comp-off credit generation + publish `holiday.compoff.credited`
- [ ] Backend: validity/conversion config
- [ ] Frontend: holiday comp-off summary view
- [ ] Rules/Config: per-country comp-off validity and conversion
- [ ] Tests: integration tests for credit generation and handover

**Covers:** 21.11
**Dependencies:** EPIC-21-S06, EPIC-20-S13

### EPIC-21-S08 — Holiday & leave overlap

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** holiday-leave overlap handled automatically, **so that** holidays within a leave span are not deducted from leave balance per country rule.

**Description**
Detect public holidays/weekly-offs falling within an approved leave span and apply the country rule (exclude holidays from leave-day count or include), recompute leave balance, and feed the Leave-Holiday Conflict Register for review where rules conflict.

**Acceptance Criteria**

- [ ] Given a public holiday inside an annual-leave span, when calculated, then it is excluded/included per country rule and balance recomputed.
- [ ] Given a holiday declared after leave approval, when added, then the affected leave is recalculated and the employee notified.
- [ ] Given an overlap conflict, when detected, then it posts to the Leave-Holiday Conflict Register for HR review.
- [ ] Given any recalculation, when applied, then it is audit-logged and balances stay consistent.

**Tasks**

- [ ] Backend: overlap-detection service + leave recalculation handover to EPIC-20
- [ ] Backend: conflict-register population
- [ ] Frontend: overlap view + conflict register screen
- [ ] Rules/Config: per-country holiday-in-leave inclusion rule
- [ ] Alerts/Workflow: notify employee on recalculation
- [ ] Tests: integration tests for exclude/include and post-approval holiday addition

**Covers:** 21.12, 21.26 (feeds register)
**Dependencies:** EPIC-21-S02, EPIC-20

### EPIC-21-S09 — Holiday & attendance integration

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** the holiday calendar integrated with attendance, **so that** holidays suppress absence and holiday work is detected.

**Description**
Publish the published holiday calendar to attendance (EPIC-19) so holiday/rest dates are excluded from absence evaluation and punches on holidays are tagged for holiday-work treatment, with re-evaluation when dates are confirmed/changed.

**Acceptance Criteria**

- [ ] Given a published holiday, when consumed by attendance, then no absence is raised for non-attendance on that date.
- [ ] Given a punch on a holiday, when detected, then it is tagged holiday-work and linked to approval/pay treatment.
- [ ] Given a holiday date change/confirmation, when published, then attendance re-evaluates affected dates.
- [ ] Given integration actions, when applied, then they are audit-logged.

**Tasks**

- [ ] Backend: publish `holiday.calendar.published`/`holiday.date.changed`; attendance consumers
- [ ] Backend: re-evaluation trigger on date change
- [ ] Frontend: calendar overlay on attendance views
- [ ] Rules/Config: holiday-work eligibility per site
- [ ] Tests: integration tests for suppression, tagging, re-evaluation

**Covers:** 21.13
**Dependencies:** EPIC-21-S02, EPIC-19

### EPIC-21-S10 — Holiday & payroll integration

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** holiday pay/premium inputs delivered to payroll, **so that** holiday work and day-in-lieu are paid correctly with no manual entry.

**Description**
Aggregate holiday-work premium, holiday-OT and any day-in-lieu monetization into the payroll input feed with maker-checker lock, ensuring holiday treatment is finalized before payroll lock for the period.

**Acceptance Criteria**

- [ ] Given period close, when holiday work is finalized, then premiums/OT/lieu amounts are aggregated per employee.
- [ ] Given unfinalized holiday-work approvals for the period, when payroll attempts lock, then it is blocked with a reason.
- [ ] Given maker-checker, when approved (preparer ≠ approver), then the holiday input set is locked and published.
- [ ] Given a post-lock change, when made, then it routes to off-cycle/adjustment and is audit-logged.

**Tasks**

- [ ] Backend: `holiday_payroll_input` aggregation + lock; event `holiday.payroll.locked`
- [ ] Backend: pre-lock completeness check
- [ ] Frontend: holiday-input review + maker-checker screen
- [ ] Rules/Config: premium/lieu monetization basis per country
- [ ] Alerts/Workflow: lock-block alerts
- [ ] Tests: integration tests for aggregation, lock-block, maker-checker

**Covers:** 21.14
**Dependencies:** EPIC-21-S06, EPIC-10

### EPIC-21-S11 — Holiday & contractor management

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** holiday handling for contractors, **so that** contractor holiday work/billing follows the right calendar and terms.

**Description**
Apply the relevant holiday calendar to contractor/outsourced workers for attendance/absence suppression and holiday-work tagging, while routing holiday-work cost to vendor billing rather than employee payroll, per the contract.

**Acceptance Criteria**

- [ ] Given a contractor, when a holiday occurs, then their attendance suppression follows the assigned calendar.
- [ ] Given contractor holiday work, when tagged, then it is reported for vendor billing, not employee payroll.
- [ ] Given contract terms, when configured, then contractor holiday premium/treatment follows the contract.
- [ ] Given contractor holiday activity, when recorded, then it is reportable and audit-logged.

**Tasks**

- [ ] Backend: contractor-calendar assignment + holiday-work billing tagging
- [ ] Backend: vendor-billing report handover
- [ ] Frontend: contractor holiday config/report screen
- [ ] Rules/Config: contract-based holiday treatment
- [ ] Tests: integration tests for contractor suppression and billing tagging

**Covers:** 21.15
**Dependencies:** EPIC-21-S02, EPIC-19-S15

### EPIC-21-S12 — Holiday communication & calendar change management

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** holiday communication and controlled calendar change management, **so that** employees are informed and late government changes are applied with full traceability.

**Description**
Implement holiday announcements/notifications (upcoming holidays, confirmed Eid dates) to employees, and a change-management workflow for calendar edits (especially Hijri date confirmations and government re-announcements) with approval, impact assessment on attendance/leave/payroll, and versioning.

**Acceptance Criteria**

- [ ] Given a published/confirmed holiday, when finalized, then employees receive a communication via app/email.
- [ ] Given a calendar change, when proposed, then it routes through change-management with approval and an impact summary.
- [ ] Given an approved change, when applied, then attendance/leave/payroll consumers re-evaluate and a new version is recorded.
- [ ] Given any change/communication, when done, then it is audit-logged.

**Tasks**

- [ ] Backend: change-management workflow + impact-assessment service; notification service
- [ ] Backend: re-propagation on approved change
- [ ] Frontend: announcement composer + change-request/approval screen
- [ ] Rules/Config: communication templates and recipient scoping
- [ ] Alerts/Workflow: change approval + employee notifications
- [ ] Tests: e2e for change→approve→propagate; notification delivery

**Covers:** 21.16, 21.17
**Dependencies:** EPIC-21-S02

### EPIC-21-S13 — Holiday audit checklist & risk matrix

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable holiday audit checklist and risk matrix, **so that** holiday controls are testable and risks tracked.

**Description**
Provide a digital audit checklist (calendar approval, Eid confirmation timeliness, holiday-work approval coverage, premium accuracy, leave-overlap correctness) and a configurable risk matrix/register scoring likelihood × impact for holiday risks (late Eid changes, unauthorized work, pay errors).

**Acceptance Criteria**

- [ ] Given the checklist, when run, then each control yields pass/fail with evidence and timestamp.
- [ ] Given the risk matrix, when configured, then risks score likelihood × impact with rating bands.
- [ ] Given an open risk, when logged, then owner, mitigation and due date are tracked to closure.
- [ ] Given checklist/risk records, when saved, then they are exportable and audit-logged.

**Tasks**

- [ ] Backend: `holiday_audit_item`, `holiday_risk_entry` schemas
- [ ] Backend: checklist run + risk-scoring service
- [ ] Frontend: audit checklist + risk-matrix screens
- [ ] Rules/Config: default holiday control set and scoring bands
- [ ] Tests: unit tests for scoring and checklist evaluation

**Covers:** 21.18, 21.20
**Dependencies:** EPIC-21-S01

### EPIC-21-S14 — Holiday KPIs & dashboard

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership, **I want** holiday KPIs and a dashboard, **so that** holiday-work volume, premium cost and approval compliance are visible per country/entity.

**Description**
Compute KPIs (holiday-work hours/cost, premium spend, unauthorized-holiday-work rate, comp-off lapse, Eid-confirmation timeliness) and a drill-down dashboard with country/entity/site filters and trends.

**Acceptance Criteria**

- [ ] Given holiday data, when aggregated, then KPIs (holiday-work cost, premium spend, unauthorized rate) compute per country/entity/site.
- [ ] Given the dashboard, when filtered, then it drills from company → country → entity → site.
- [ ] Given a KPI breach (e.g., high unauthorized holiday work), when detected, then RAG status highlights it.
- [ ] Given RBAC, when a viewer lacks scope, then restricted data is hidden.

**Tasks**

- [ ] Backend: KPI aggregation service + materialized views
- [ ] Backend: RBAC scoping
- [ ] Frontend: holiday dashboard with filters, trends, RAG status
- [ ] Rules/Config: KPI targets per country
- [ ] Tests: unit tests for KPI math; e2e for drill-down + RBAC

**Covers:** 21.19, 21.22
**Dependencies:** EPIC-21-S06

### EPIC-21-S15 — HRMS holiday automation design

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As a** System Administrator, **I want** the holiday automation/event design implemented, **so that** calendar publish, propagation and integrations run with minimal manual effort.

**Description**
Implement event-driven publish/propagation of holiday and Ramadan/Eid events, scheduled reminders for upcoming holidays and pending Eid confirmations, and orchestrated handovers to attendance/leave/OT/payroll over the event bus with retry/observability.

**Acceptance Criteria**

- [ ] Given a calendar publish/change, when emitted, then attendance/leave/OT/payroll consumers process idempotently.
- [ ] Given pending Eid/Ramadan confirmation, when the reminder schedule runs, then HR is prompted ahead of the date.
- [ ] Given a failed consumer, when it errors, then retry and DLQ handling apply with alerting.
- [ ] Given automation config, when changed, then schedules/rules update without code deploy where possible.

**Tasks**

- [ ] Backend: event topology (`holiday.*`, `ramadan.*` topics), DLQ + retry; reminder scheduler
- [ ] Backend: idempotent consumers/handovers
- [ ] Frontend: automation/job-monitoring admin screen
- [ ] Rules/Config: configurable reminder lead times
- [ ] Tests: integration tests for propagation and DLQ handling

**Covers:** 21.21
**Dependencies:** EPIC-21-S02, EPIC-21-S12

### EPIC-21-S16 — Holiday compliance pack & public-holiday certificate

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** a monthly/event-based holiday compliance pack and signed certificate, **so that** management certification and inspection evidence are generated automatically.

**Description**
Assemble a monthly/event-based pack (holiday calendar status, holiday-work approvals, premium/pay summary, registers, open audit actions) and a configurable Public Holiday Compliance Certificate with maker-checker sign-off and export, triggerable per Eid event or monthly.

**Acceptance Criteria**

- [ ] Given month-end or a holiday event, when the pack runs, then it compiles calendar status, approvals, pay summary and registers per entity/country.
- [ ] Given the certificate, when generated, then it reflects pack figures and requires sign-off (preparer ≠ approver).
- [ ] Given sign-off, when completed, then the certificate is locked, versioned and exportable (PDF).
- [ ] Given generation, when done, then it is audit-logged and archived to the document store.

**Tasks**

- [ ] Backend: pack assembler + `holiday_certificate` schema; event-based trigger
- [ ] Backend: PDF export + document-store archival
- [ ] Frontend: pack viewer + certificate sign-off screen
- [ ] Rules/Config: certificate template per country/entity
- [ ] Alerts/Workflow: month-end/event generation + sign-off reminder
- [ ] Tests: e2e for pack assembly, sign-off lock, export

**Covers:** 21.23, 21.24
**Dependencies:** EPIC-21-S14

### EPIC-21-S17 — Holiday Work Approval & Leave-Holiday Conflict registers (digital forms)

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** configurable Holiday Work Approval and Leave-Holiday Conflict registers, **so that** holiday-work authorizations and overlaps are tracked, exportable and audit-ready.

**Description**
Build the two sample registers: a Holiday Work Approval Register (auto-populated from approved holiday-work requests with employee, holiday, shift, treatment) and a Leave-Holiday Conflict Register (auto-populated from overlap detection with resolution status), both configurable, filterable and exportable.

**Acceptance Criteria**

- [ ] Given an approved holiday-work request, when granted, then it auto-appears in the Holiday Work Approval Register with treatment (premium/lieu).
- [ ] Given a leave-holiday overlap, when detected, then it auto-appears in the Conflict Register with resolution status.
- [ ] Given a conflict, when resolved (recalculated/overridden), then its status updates and links to the resolving action.
- [ ] Given either register, when filtered/exported, then a CSV/PDF is produced and the action audit-logged.

**Tasks**

- [ ] Backend: register views over `holiday_work_request` + overlap records; status fields
- [ ] Backend: export service (CSV/PDF)
- [ ] Frontend: Holiday Work Approval + Leave-Holiday Conflict register screens with filters
- [ ] Rules/Config: configurable columns/statuses
- [ ] Tests: integration tests for auto-population and status transitions

**Covers:** 21.25, 21.26
**Dependencies:** EPIC-21-S05, EPIC-21-S08

### EPIC-21-S18 — Holiday key takeaways & guidance

**Labels:** `user-story`, `time-attendance` · **Priority:** Could · **Estimate:** 1
**As an** HR Admin, **I want** in-product key-takeaways/guidance for holiday compliance, **so that** users understand holiday types, pay treatment and Eid/Ramadan handling per country.

**Description**
Surface the chapter's key takeaways as contextual in-app guidance (holiday-type and pay-treatment summary by country, Eid/Ramadan handling notes, control checklist) linked from holiday screens.

**Acceptance Criteria**

- [ ] Given holiday screens, when a user opens help, then key-takeaways guidance is shown with country-specific highlights.
- [ ] Given guidance content, when updated by admin, then it versions without code deploy.
- [ ] Given a new user, when onboarded, then guidance is discoverable from the module.

**Tasks**

- [ ] Backend: `guidance_content` store (module=holiday, country, version)
- [ ] Frontend: contextual help/takeaways panel
- [ ] Rules/Config: editable guidance per country
- [ ] Tests: unit test for guidance retrieval/versioning

**Covers:** 21.27
**Dependencies:** —
