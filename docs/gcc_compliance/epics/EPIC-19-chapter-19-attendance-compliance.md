# EPIC-19: Chapter 19 – Attendance Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 19 – Attendance Compliance
> **Module:** Time & Attendance · **Labels:** `epic`, `gcc-compliance`, `time-attendance`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an end-to-end attendance compliance module in AuraOS that captures time via multiple methods (biometric, mobile, web, geofence), maps employees to country-correct work schedules and shifts, and applies configurable rules for late arrival, early departure, missing punches, absence and regularization. Attendance becomes the single source of truth that feeds leave, overtime and payroll with full audit trail, Ramadan handling, remote/contractor coverage, fraud and data-privacy controls across all six GCC countries.

## Business Value

Prevents labour-law breaches on working hours and unauthorized absence, eliminates buddy-punching and ghost-attendance fraud, gives payroll accurate loss-of-pay and presence inputs (avoiding under/over-payment and WPS disputes), provides defensible evidence for MOHRE/MHRSD/LMRA inspections and absconding cases, and improves employee experience through self-service punch, regularization and transparent dashboards.

## Requirements Covered (handbook sections)

- 19.1 Introduction
- 19.2 Objectives of Attendance Compliance
- 19.3 GCC Working Hours Context
- 19.4 Attendance Governance Framework
- 19.5 Attendance Policy
- 19.6 Work Schedules
- 19.7 Shift Management
- 19.8 Attendance Capture Methods
- 19.9 Late Arrival and Early Departure
- 19.10 Missing Punch Management
- 19.11 Absence Management
- 19.12 Attendance Regularization
- 19.13 Attendance and Leave Integration
- 19.14 Attendance and Payroll Integration
- 19.15 Ramadan Attendance Controls
- 19.16 Public Holiday and Rest Day Attendance
- 19.17 Remote Work Attendance
- 19.18 Contractor Attendance
- 19.19 Attendance Fraud Risks
- 19.20 Attendance Data Privacy
- 19.21 Attendance Audit Checklist
- 19.22 Attendance KPIs
- 19.23 Attendance Risk Matrix
- 19.24 HRMS Attendance Automation Design
- 19.25 Attendance Dashboard
- 19.26 Monthly Attendance Compliance Pack
- 19.27 Sample Attendance Monthly Compliance Certificate
- 19.28 Sample Missing Punch Register
- 19.29 Sample Unauthorized Absence Register
- 19.30 Key Takeaways

## Out of Scope

- Overtime eligibility, calculation and OT premiums (EPIC-12) — attendance only detects worked hours and hands them over.
- Leave entitlement, accrual and approval rules (EPIC-20) — attendance consumes approved leave to suppress absence flags.
- Public-holiday calendar governance and holiday pay treatment (EPIC-21) — consumed as input.
- Payroll calculation engine, payslip and bank file (EPIC-10/EPIC-11) — only attendance/LOP inputs are pushed.

## Dependencies

- EPIC-02 (Country Rule Engine) · EPIC-09 (Org/Position for schedule & manager hierarchy) · EPIC-20 (Leave) · EPIC-21 (Public Holidays) · EPIC-12 (Overtime) · EPIC-10 (Payroll)

## Epic Definition of Done

- [ ] Attendance policy, governance, schedules and shifts are configurable per country/entity/grade.
- [ ] All four capture methods (biometric, mobile, web, geofence) post normalized punches with device/location metadata.
- [ ] Late/early/missing-punch, absence and regularization rules run automatically with workflow.
- [ ] Leave, holiday and overtime integration suppress/raise the correct flags; Ramadan hours apply automatically.
- [ ] LOP and presence inputs feed payroll with maker-checker lock before period close.
- [ ] Fraud controls (geofence breach, duplicate/buddy punch) and data-privacy/consent controls are enforced.
- [ ] KPIs, dashboard, audit checklist, risk matrix, compliance pack and registers/certificate are live.

---

## User Stories

### EPIC-19-S01 — Working-hours context, objectives & attendance governance framework

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a configurable attendance governance framework anchored to GCC working-hours context, **so that** attendance operates within statutory limits and defined controls.

**Description**
Establish the governance baseline: standard/maximum working hours per country (e.g., UAE 8h/day or 48h/week, reduced to 6h/day in Ramadan for fasting workers; Friday rest day), control roles, escalation points and the stated objectives of attendance compliance. This is the rule foundation every other story consumes.

**Acceptance Criteria**

- [ ] Given each GCC country, when configured, then standard daily/weekly hours, weekly rest day and Ramadan reductions are stored and versioned.
- [ ] Given the governance model, when set, then owner roles (HR Admin/Manager, Line Manager, Compliance Officer) and control points are mandatory.
- [ ] Given a legal entity, when working hours are resolved, then the rule engine returns the correct country/entity limits.
- [ ] Given any framework or hour-limit change, when saved, then it is versioned and audit-logged with maker-checker.

**Tasks**

- [ ] Backend: `attendance_governance` and `working_hours_rule` schemas (country, std_daily_hours, weekly_hours, rest_day, ramadan_daily_hours)
- [ ] Backend: governance control-point + rule-resolution service
- [ ] Frontend: attendance governance & working-hours configuration screen
- [ ] Rules/Config: per-country statutory hour limits and rest-day defaults
- [ ] Tests: unit tests for hour-limit resolution per country/entity

**Covers:** 19.1, 19.2, 19.3, 19.4
**Dependencies:** EPIC-02

### EPIC-19-S02 — Configurable attendance policy

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** to author and publish a country-configurable attendance policy, **so that** rules for grace, deductions, absence and regularization are codified and acknowledged.

**Description**
Build a versioned attendance policy object defining grace periods, late/early thresholds, deduction logic, missing-punch handling, absence treatment and regularization limits, mapped per country/entity/grade, with employee acknowledgement capture.

**Acceptance Criteria**

- [ ] Given a policy, when configured, then grace minutes, late/early thresholds, monthly regularization caps and deduction rules are set per country/grade.
- [ ] Given a published policy, when an employee logs in, then acknowledgement is requested and recorded with timestamp.
- [ ] Given a policy change, when saved, then a new version is created and the old version retained.
- [ ] Given RBAC, when a non-authorized user attempts edit, then access is denied and logged.

**Tasks**

- [ ] Backend: `attendance_policy` schema (version, country, grace_minutes, late_threshold, regularization_cap, deduction_rule)
- [ ] Backend: policy versioning + acknowledgement service
- [ ] Frontend: policy authoring screen + employee acknowledgement prompt
- [ ] Rules/Config: per-country/grade policy defaults
- [ ] Alerts/Workflow: acknowledgement reminder notification
- [ ] Tests: unit + e2e for policy versioning and acknowledgement

**Covers:** 19.5
**Dependencies:** EPIC-19-S01

### EPIC-19-S03 — Work schedules

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** to define and assign work schedules, **so that** each employee's expected daily presence is known for compliance evaluation.

**Description**
Create reusable work-schedule templates (fixed, flexible, compressed) with planned start/end, break, weekly off pattern and tolerance, and assign them to employees, positions or org units with effective dating.

**Acceptance Criteria**

- [ ] Given a schedule template, when created, then start/end, breaks, weekly-off pattern and grace tolerance are defined.
- [ ] Given an employee, when assigned a schedule, then it is effective-dated and overrides the org default.
- [ ] Given a flexible schedule, when evaluated, then core hours and total-hours rules apply instead of fixed start.
- [ ] Given a country rest day (e.g., Friday), when scheduled, then weekly-off aligns to the configured rest day.

**Tasks**

- [ ] Backend: `work_schedule` + `schedule_assignment` schemas (template, start, end, break, weekly_off, effective_from)
- [ ] Backend: schedule resolution service (employee → effective schedule per date)
- [ ] Frontend: schedule template builder + assignment screen
- [ ] Rules/Config: per-country rest-day and default schedule
- [ ] Tests: unit tests for effective-dated schedule resolution

**Covers:** 19.6
**Dependencies:** EPIC-19-S01, EPIC-09

### EPIC-19-S04 — Shift management

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** to manage shifts and rotational rosters, **so that** shift workers are evaluated against the correct shift including night and rotation rules.

**Description**
Support shift definitions (day/night/split), rotation patterns, roster planning, shift swaps and night-shift differential flags, with cross-midnight handling so punches map to the correct shift window.

**Acceptance Criteria**

- [ ] Given a shift, when defined, then window, cross-midnight flag, break and night-shift flag are stored.
- [ ] Given a rotation pattern, when generated, then a roster is produced per employee/team for the period.
- [ ] Given a night shift crossing midnight, when a punch posts at 02:00, then it maps to the prior day's shift correctly.
- [ ] Given a shift swap, when approved, then both employees' rosters update and the change is audit-logged.

**Tasks**

- [ ] Backend: `shift`, `roster`, `shift_swap` schemas (window, cross_midnight, rotation_pattern)
- [ ] Backend: roster generation + cross-midnight punch-mapping service
- [ ] Frontend: roster planner + shift-swap request screen
- [ ] Rules/Config: night-shift differential flag per country
- [ ] Alerts/Workflow: shift-swap approval workflow
- [ ] Tests: integration tests for rotation and cross-midnight mapping

**Covers:** 19.7
**Dependencies:** EPIC-19-S03

### EPIC-19-S05 — Multi-method attendance capture (biometric, mobile, web, geofence)

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 13
**As an** Employee (Self-Service), **I want** to record attendance via biometric, mobile, web or geofence, **so that** my presence is captured accurately wherever I work.

**Description**
Build a unified punch ingestion pipeline that normalizes events from biometric/access-control devices, the mobile app (with GPS + selfie/liveness option), the web portal and geofence auto-punch, storing device ID, source, location and timestamp. Includes device registration, offline buffering and idempotent de-duplication.

**Acceptance Criteria**

- [ ] Given any capture method, when a punch posts, then it is normalized to a common event with source, device_id, geo-coordinates and server timestamp.
- [ ] Given a geofence, when an employee enters/exits the configured site radius, then an auto IN/OUT punch is created and tagged.
- [ ] Given a mobile punch outside the allowed geofence, when submitted, then it is flagged for review, not auto-approved.
- [ ] Given a duplicate device push within N seconds, when received, then it is de-duplicated idempotently.
- [ ] Given an offline mobile device, when reconnected, then buffered punches sync with original timestamps.
- [ ] Given any punch, when stored, then capture metadata is retained for audit.

**Tasks**

- [ ] Backend: `punch_event` schema (employee_id, source, device_id, lat, lng, ts, raw_payload) + `device_registry`
- [ ] Backend: ingestion API + normalization/de-dup service; event-bus publish `attendance.punch.recorded`
- [ ] Backend: geofence evaluation service (site polygons/radius)
- [ ] Frontend: mobile punch (GPS + optional selfie) and web punch components; device registration admin screen
- [ ] Rules/Config: per-site geofence radius, allowed capture methods per location
- [ ] Tests: integration tests for each source, de-dup, offline sync, geofence in/out

**Covers:** 19.8
**Dependencies:** EPIC-19-S03

### EPIC-19-S06 — Late arrival and early departure handling

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** automatic detection and treatment of late arrivals and early departures, **so that** tardiness is consistently flagged and applied to deductions where policy requires.

**Description**
Compare actual IN/OUT against the effective schedule and policy grace, classify late/early events, accumulate occurrences, and compute any deduction or warning per country policy.

**Acceptance Criteria**

- [ ] Given a punch later than start + grace, when evaluated, then a late event is recorded with minutes late.
- [ ] Given an OUT before end − grace, when evaluated, then an early-departure event is recorded.
- [ ] Given accumulated occurrences beyond threshold, when reached, then a warning/deduction action is triggered per policy.
- [ ] Given a deduction rule, when applied, then the LOP amount is computed and queued for payroll, audit-logged.

**Tasks**

- [ ] Backend: `attendance_exception` schema (type, minutes, occurrence_count)
- [ ] Backend: late/early evaluation + occurrence-accumulation service
- [ ] Frontend: employee/manager view of late/early events
- [ ] Rules/Config: grace, thresholds and deduction logic per country/grade
- [ ] Alerts/Workflow: threshold-breach notification to manager
- [ ] Tests: unit tests for boundary cases (exactly at grace, cumulative thresholds)

**Covers:** 19.9
**Dependencies:** EPIC-19-S03, EPIC-19-S05

### EPIC-19-S07 — Missing punch management

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** Employee (Self-Service), **I want** missing punches detected and a correction path, **so that** incomplete records do not wrongly mark me absent or unpaid.

**Description**
Detect single-sided or missing punches against the schedule, notify the employee/manager, and provide a missing-punch correction request feeding the regularization workflow and the Missing Punch Register.

**Acceptance Criteria**

- [ ] Given an expected punch absent by a cut-off, when detected, then a missing-punch exception is raised and the employee notified.
- [ ] Given a single IN with no OUT, when end-of-day runs, then the record is flagged incomplete (not auto-closed as full day).
- [ ] Given a correction request, when submitted with reason, then it routes to manager approval and updates the record on approval.
- [ ] Given any correction, when applied, then before/after values and approver are audit-logged.

**Tasks**

- [ ] Backend: missing-punch detection job + `punch_correction_request` schema
- [ ] Backend: correction-apply service with audit snapshot
- [ ] Frontend: missing-punch alert + correction request screen
- [ ] Rules/Config: detection cut-off time per shift/country
- [ ] Alerts/Workflow: employee + manager notification, approval workflow
- [ ] Tests: integration tests for detection and correction apply

**Covers:** 19.10, 19.28 (feeds register)
**Dependencies:** EPIC-19-S05, EPIC-19-S12

### EPIC-19-S08 — Absence management

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**As an** HR Manager, **I want** automatic absence detection and classification, **so that** authorized vs unauthorized absence is correctly handled for pay, discipline and immigration risk.

**Description**
Detect no-show days, distinguish authorized (approved leave/holiday) from unauthorized absence, accumulate consecutive unauthorized days, trigger absconding/job-abandonment escalation per country thresholds, and feed the Unauthorized Absence Register and LOP.

**Acceptance Criteria**

- [ ] Given no punch and no approved leave/holiday, when day-close runs, then an unauthorized absence is recorded.
- [ ] Given approved leave or a public holiday on that date, when evaluated, then absence is suppressed/classified authorized.
- [ ] Given consecutive unauthorized days beyond country threshold, when reached, then an absconding/abandonment escalation is raised (e.g., MOHRE/MHRSD reporting flag).
- [ ] Given unauthorized absence, when confirmed, then LOP is queued for payroll and the absence register updated, all audit-logged.

**Tasks**

- [ ] Backend: absence detection job + `absence_record` schema (type, authorized_flag, consecutive_count)
- [ ] Backend: absconding-threshold evaluation + escalation service
- [ ] Frontend: absence dashboard + register view
- [ ] Rules/Config: per-country absconding day-threshold and authority-reporting flag
- [ ] Alerts/Workflow: manager/HR escalation for absconding cases
- [ ] Tests: integration tests for authorized vs unauthorized and absconding threshold

**Covers:** 19.11, 19.29 (feeds register)
**Dependencies:** EPIC-19-S05, EPIC-19-S13, EPIC-19-S16

### EPIC-19-S09 — Attendance regularization workflow

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** Employee (Self-Service), **I want** to raise regularization requests for exceptions, **so that** genuine corrections are approved within controlled limits.

**Description**
Provide a regularization workflow for missing punches, late/early events and absences with reason codes, evidence attachment, monthly caps and maker-checker (employee ≠ approver), updating attendance on approval.

**Acceptance Criteria**

- [ ] Given an exception, when an employee files a regularization with reason code, then it routes to the line manager for approval.
- [ ] Given the monthly regularization cap is reached, when another is filed, then it is blocked or escalated to HR per policy.
- [ ] Given approval, when granted, then the attendance record is updated and the exception cleared, audit-logged.
- [ ] Given employee = approver, when attempted, then the system blocks self-approval (maker-checker).

**Tasks**

- [ ] Backend: `regularization_request` schema (reason_code, evidence, status) + monthly-cap counter
- [ ] Backend: workflow-engine integration + apply-on-approval service
- [ ] Frontend: regularization request + manager approval screens
- [ ] Rules/Config: reason codes, monthly cap per country/grade
- [ ] Alerts/Workflow: approval routing + maker-checker enforcement
- [ ] Tests: e2e for request→approve→record-update; cap and self-approval blocks

**Covers:** 19.12
**Dependencies:** EPIC-19-S06, EPIC-19-S07

### EPIC-19-S10 — Attendance ↔ leave integration

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** attendance to reconcile with approved leave, **so that** leave days are not counted as absence and unplanned absence can convert to leave per policy.

**Description**
Consume approved leave from EPIC-20 to suppress absence/late flags on leave days, optionally convert unauthorized absence to sick/unpaid leave on approval, and reflect half-day leave against partial attendance.

**Acceptance Criteria**

- [ ] Given an approved full-day leave, when day-close runs, then no absence/late exception is raised for that date.
- [ ] Given a half-day leave, when evaluated, then only the working half-day is checked for late/early.
- [ ] Given an unauthorized absence later covered by approved sick leave, when applied, then the absence reclassifies and LOP reverses.
- [ ] Given any reclassification, when applied, then it is audit-logged and the leave/attendance balances stay consistent.

**Tasks**

- [ ] Backend: subscribe to `leave.approved` events; reconciliation service
- [ ] Backend: absence→leave conversion logic with reversal of LOP
- [ ] Frontend: combined attendance+leave day view
- [ ] Rules/Config: half-day handling and conversion rules per country
- [ ] Tests: integration tests for suppression, half-day, and reclassification

**Covers:** 19.13
**Dependencies:** EPIC-19-S08, EPIC-20

### EPIC-19-S11 — Attendance ↔ payroll integration (LOP & presence inputs)

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** attendance to deliver locked LOP and presence inputs, **so that** payroll reflects actual attendance with no manual rekeying.

**Description**
Aggregate per-period present days, unauthorized absence, late/early deductions and LOP into a payroll input set with maker-checker lock; block payroll lock if attendance for any active employee is unprocessed, and publish a signed input feed to payroll.

**Acceptance Criteria**

- [ ] Given period close, when attendance is finalized, then present days, LOP days and deduction amounts are aggregated per employee.
- [ ] Given any active employee with unprocessed attendance, when payroll attempts lock, then the lock is blocked with a reason.
- [ ] Given maker-checker, when the input set is approved (preparer ≠ approver), then it is locked and published to payroll.
- [ ] Given a post-lock correction, when made, then it routes to an off-cycle/adjustment path, not silent overwrite, and is audit-logged.

**Tasks**

- [ ] Backend: `attendance_payroll_input` aggregation + lock schema
- [ ] Backend: pre-lock completeness check + event publish `attendance.payroll.locked`
- [ ] Frontend: payroll-input review + maker-checker approval screen
- [ ] Rules/Config: LOP day-value basis per country (calendar vs working days)
- [ ] Alerts/Workflow: lock-block alerts; off-cycle correction routing
- [ ] Tests: integration tests for aggregation, lock-block, maker-checker

**Covers:** 19.14
**Dependencies:** EPIC-19-S06, EPIC-19-S08, EPIC-10

### EPIC-19-S12 — Ramadan attendance controls

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** automatic Ramadan working-hour reductions, **so that** schedules and absence/late evaluation comply with reduced hours during Ramadan.

**Description**
Apply country-specific Ramadan reductions (e.g., 2-hour daily reduction in UAE; reduced hours for fasting workers) over the Hijri Ramadan window, auto-adjusting effective schedules and late/early/short-hours evaluation, with eligibility (fasting/Muslim or all-staff per country law).

**Acceptance Criteria**

- [ ] Given the configured Ramadan window, when active, then effective daily hours reduce per country rule automatically.
- [ ] Given reduced hours, when attendance is evaluated, then late/early/short-hours thresholds use the Ramadan schedule.
- [ ] Given country eligibility rules, when applied, then the reduction targets the correct population.
- [ ] Given the Ramadan window end, when passed, then schedules revert automatically, audit-logged.

**Tasks**

- [ ] Backend: `ramadan_rule` schema (country, window_start, window_end, hours_reduction, eligibility)
- [ ] Backend: schedule-override service for Ramadan period
- [ ] Frontend: Ramadan window/eligibility config screen
- [ ] Rules/Config: per-country Ramadan reduction and eligibility
- [ ] Tests: unit tests for window activation, evaluation and revert

**Covers:** 19.15
**Dependencies:** EPIC-19-S03, EPIC-19-S01

### EPIC-19-S13 — Public holiday and rest-day attendance

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** rest days and public holidays handled in attendance, **so that** non-working days are not absences and work on them is captured for premium/comp-off.

**Description**
Consume the holiday calendar (EPIC-21) and configured rest days so those dates are excluded from absence, while detecting punches on holidays/rest days and tagging them for holiday-work premium or comp-off handover.

**Acceptance Criteria**

- [ ] Given a public holiday or rest day, when day-close runs, then no absence is raised for non-attendance.
- [ ] Given a punch on a holiday/rest day, when recorded, then it is tagged as holiday/rest-day work and handed to OT/comp-off.
- [ ] Given a country-specific rest day, when evaluated, then the correct weekly-off applies.
- [ ] Given holiday-work detection, when tagged, then it appears in the holiday-work feed and is audit-logged.

**Tasks**

- [ ] Backend: subscribe to `holiday.calendar` data; rest-day/holiday evaluation service
- [ ] Backend: holiday-work tagging + handover to EPIC-12/EPIC-21
- [ ] Frontend: calendar overlay on attendance views
- [ ] Rules/Config: per-country rest day; holiday-work eligibility
- [ ] Tests: integration tests for suppression and holiday-work tagging

**Covers:** 19.16
**Dependencies:** EPIC-21, EPIC-12

### EPIC-19-S14 — Remote work attendance

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As an** Employee (Self-Service), **I want** compliant remote attendance capture, **so that** approved remote/hybrid work is recorded without forcing on-site punch.

**Description**
Support remote/hybrid attendance via web/mobile punch with optional activity confirmation, location category (home/field) instead of strict geofence, tied to an approved remote-work arrangement, while preserving working-hours and privacy controls.

**Acceptance Criteria**

- [ ] Given an approved remote arrangement, when an employee punches remotely, then it is accepted and tagged remote.
- [ ] Given remote punch outside an arrangement, when submitted, then it is flagged for manager review.
- [ ] Given remote work, when evaluated, then working-hours and short-hours rules still apply.
- [ ] Given location capture, when remote, then only category/coarse location is stored per privacy policy.

**Tasks**

- [ ] Backend: `remote_work_arrangement` schema; remote-punch acceptance logic
- [ ] Backend: link punch to arrangement + tagging
- [ ] Frontend: remote punch + arrangement request screens
- [ ] Rules/Config: remote eligibility and location-granularity per policy
- [ ] Tests: integration tests for in/out-of-arrangement remote punches

**Covers:** 19.17
**Dependencies:** EPIC-19-S05

### EPIC-19-S15 — Contractor attendance

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As an** HR Admin, **I want** to track contractor/outsourced-worker attendance, **so that** site presence is governed without enrolling them as employees and billing/compliance is evidenced.

**Description**
Capture contractor attendance via assigned capture methods, link to the vendor/contract and site, segregate from employee payroll, and provide reconciliation data for contractor billing and site-access compliance.

**Acceptance Criteria**

- [ ] Given a contractor, when registered, then they link to a vendor/contract and site without an employee payroll record.
- [ ] Given contractor punches, when captured, then they are stored and reportable per vendor/site.
- [ ] Given contractor attendance, when aggregated, then it produces vendor-billing/reconciliation data, not employee LOP.
- [ ] Given site-access rules, when a contractor lacks valid status, then attendance is flagged.

**Tasks**

- [ ] Backend: `contractor`, `contractor_attendance` schemas (vendor_id, contract_id, site_id)
- [ ] Backend: contractor punch ingestion + vendor reconciliation report service
- [ ] Frontend: contractor register + attendance report screen
- [ ] Rules/Config: site-access validity rules
- [ ] Tests: integration tests for contractor capture and reconciliation

**Covers:** 19.18
**Dependencies:** EPIC-19-S05

### EPIC-19-S16 — Attendance fraud controls

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** automated fraud detection, **so that** buddy-punching, ghost attendance and location spoofing are prevented and flagged.

**Description**
Detect buddy/proxy punches (biometric liveness, selfie face-match), geofence breaches, GPS-spoof/mock-location signals, impossible-travel patterns, duplicate device pushes and unusual punch patterns, raising a fraud register with risk scoring.

**Acceptance Criteria**

- [ ] Given a mobile punch with mock-location/spoof signal, when detected, then it is blocked or flagged high-risk.
- [ ] Given two punches for the same person at impossible distance/time, when detected, then an impossible-travel alert is raised.
- [ ] Given selfie/biometric mismatch, when scored below threshold, then the punch is rejected/flagged.
- [ ] Given any fraud flag, when raised, then it enters the fraud register with risk score and is audit-logged for investigation.

**Tasks**

- [ ] Backend: fraud-rule engine + `attendance_fraud_flag` schema (signal, risk_score)
- [ ] Backend: face-match/liveness integration, mock-location & impossible-travel detectors
- [ ] Frontend: fraud register/investigation screen
- [ ] Rules/Config: thresholds per signal; auto-block vs flag per country
- [ ] Alerts/Workflow: high-risk alert to Compliance Officer
- [ ] Tests: unit/integration tests for each fraud signal

**Covers:** 19.19
**Dependencies:** EPIC-19-S05

### EPIC-19-S17 — Attendance data privacy & consent controls

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** privacy controls over biometric and location data, **so that** attendance complies with GCC data-protection laws.

**Description**
Implement consent capture for biometric/location processing, purpose limitation, retention/erasure schedules, RBAC-scoped access to sensitive attendance data, and encryption of biometric templates and geo-coordinates per UAE PDPL/KSA PDPL and similar.

**Acceptance Criteria**

- [ ] Given biometric/location capture, when enrolled, then explicit consent is recorded with purpose and version.
- [ ] Given sensitive attendance data, when accessed, then RBAC restricts to authorized roles and access is logged.
- [ ] Given the retention schedule, when reached, then biometric templates/location data are purged or anonymized.
- [ ] Given a data-subject erasure request, when valid, then the relevant attendance personal data is handled per policy.

**Tasks**

- [ ] Backend: `attendance_consent` schema + retention/erasure jobs
- [ ] Backend: field-level encryption for biometric/geo data; access-log service
- [ ] Frontend: consent screen + privacy admin console
- [ ] Rules/Config: per-country retention periods and lawful-basis settings
- [ ] Tests: unit/integration tests for consent, RBAC access, retention purge

**Covers:** 19.20
**Dependencies:** EPIC-19-S05

### EPIC-19-S18 — Attendance audit checklist & risk matrix

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable attendance audit checklist and risk matrix, **so that** controls are testable and red flags are tracked.

**Description**
Provide a digital audit checklist (policy ack, schedule coverage, regularization caps, missing-punch closure, LOP accuracy) and a configurable risk matrix/register scoring likelihood × impact for attendance risks (fraud, absconding, privacy, payroll error) with mitigation owners.

**Acceptance Criteria**

- [ ] Given the audit checklist, when run, then each control yields pass/fail with evidence links and is timestamped.
- [ ] Given the risk matrix, when configured, then risks score likelihood × impact with rating bands (low/med/high/critical).
- [ ] Given an open risk, when logged, then owner, mitigation and due date are tracked to closure.
- [ ] Given checklist/risk records, when saved, then they are exportable and audit-logged.

**Tasks**

- [ ] Backend: `audit_checklist_item`, `risk_register_entry` schemas
- [ ] Backend: checklist run + risk-scoring service
- [ ] Frontend: audit checklist + risk-matrix/register screens
- [ ] Rules/Config: default attendance control set and risk scoring bands
- [ ] Tests: unit tests for scoring and checklist evaluation

**Covers:** 19.21, 19.23
**Dependencies:** EPIC-19-S02

### EPIC-19-S19 — Attendance KPIs & dashboard

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership, **I want** attendance KPIs and a dashboard, **so that** presence, punctuality and absence trends are visible per country/entity/team.

**Description**
Compute KPIs (attendance %, punctuality %, unauthorized-absence rate, missing-punch rate, regularization rate, absconding count) and render a drill-down dashboard with country/entity/department filters and trend lines.

**Acceptance Criteria**

- [ ] Given attendance data, when aggregated, then KPIs compute per country/entity/team with period comparison.
- [ ] Given the dashboard, when filtered, then it drills from company → country → entity → team → employee.
- [ ] Given a KPI breach (e.g., absence > target), when detected, then it is highlighted with red/amber/green status.
- [ ] Given RBAC, when a viewer lacks scope, then restricted data is hidden.

**Tasks**

- [ ] Backend: KPI aggregation service + materialized views
- [ ] Backend: RBAC scoping for dashboard data
- [ ] Frontend: attendance dashboard with filters, trends, RAG status
- [ ] Rules/Config: KPI targets/thresholds per country
- [ ] Tests: unit tests for KPI math; e2e for drill-down + RBAC

**Covers:** 19.22, 19.25
**Dependencies:** EPIC-19-S06, EPIC-19-S08

### EPIC-19-S20 — HRMS attendance automation design

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As a** System Administrator, **I want** the attendance automation/event design implemented, **so that** punch→evaluation→exception→payroll flows run with minimal manual effort.

**Description**
Implement the end-to-end automation: scheduled day-close jobs, event-driven evaluation on each punch, auto-generation of exceptions/alerts, and orchestrated handovers to leave/OT/payroll via the event bus with retry/observability.

**Acceptance Criteria**

- [ ] Given the day-close schedule, when it runs, then all employees' attendance is evaluated and exceptions generated.
- [ ] Given a punch event, when published, then downstream evaluation/fraud/geofence consumers process idempotently.
- [ ] Given a failed job/consumer, when it errors, then retry and dead-letter handling apply with alerting.
- [ ] Given automation config, when changed, then schedules/rules update without code deploy where possible.

**Tasks**

- [ ] Backend: scheduler + event-bus topology (`attendance.*` topics), DLQ + retry
- [ ] Backend: idempotent consumers for evaluation/fraud/geofence
- [ ] Frontend: automation/job-monitoring admin screen
- [ ] Rules/Config: configurable day-close time, batch sizing
- [ ] Tests: integration tests for job orchestration and DLQ handling

**Covers:** 19.24
**Dependencies:** EPIC-19-S05, EPIC-19-S11

### EPIC-19-S21 — Monthly attendance compliance pack & certificate

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** a monthly attendance compliance pack and signed certificate, **so that** management certification and inspection evidence are generated automatically.

**Description**
Assemble a monthly pack (KPIs, exception summaries, registers, fraud/privacy items, open audit actions) and a configurable monthly compliance certificate with maker-checker sign-off and export for management/authority evidence.

**Acceptance Criteria**

- [ ] Given month-end, when the pack runs, then it compiles KPIs, registers and open actions per entity/country.
- [ ] Given the certificate, when generated, then it reflects pack figures and requires sign-off (preparer ≠ approver).
- [ ] Given sign-off, when completed, then the certificate is locked, versioned and exportable (PDF).
- [ ] Given any pack/certificate generation, when done, then it is audit-logged and archived to the document store.

**Tasks**

- [ ] Backend: compliance-pack assembler + `attendance_certificate` schema
- [ ] Backend: PDF export + document-store archival
- [ ] Frontend: pack viewer + certificate sign-off screen
- [ ] Rules/Config: certificate template per country/entity
- [ ] Alerts/Workflow: month-end generation + sign-off reminder
- [ ] Tests: e2e for pack assembly, sign-off lock, export

**Covers:** 19.26, 19.27
**Dependencies:** EPIC-19-S19

### EPIC-19-S22 — Missing Punch & Unauthorized Absence registers (digital forms)

**Labels:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** configurable Missing Punch and Unauthorized Absence registers, **so that** these exceptions are tracked, exportable and audit-ready.

**Description**
Build the two sample registers as configurable digital registers auto-populated from missing-punch and absence detection, with status workflow (open/corrected/closed), filters and export, serving as the handbook's sample registers.

**Acceptance Criteria**

- [ ] Given missing-punch detection, when raised, then an entry auto-appears in the Missing Punch Register with employee, date, shift and status.
- [ ] Given unauthorized absence, when confirmed, then it auto-appears in the Unauthorized Absence Register with consecutive-day count.
- [ ] Given an entry, when resolved via regularization/leave, then its status updates and links to the resolving record.
- [ ] Given either register, when exported, then a CSV/PDF is produced and the action audit-logged.

**Tasks**

- [ ] Backend: register views over `punch_correction_request`/`absence_record` + status fields
- [ ] Backend: export service (CSV/PDF)
- [ ] Frontend: Missing Punch Register + Unauthorized Absence Register screens with filters
- [ ] Rules/Config: configurable columns/statuses
- [ ] Tests: integration tests for auto-population and status transitions

**Covers:** 19.28, 19.29
**Dependencies:** EPIC-19-S07, EPIC-19-S08

### EPIC-19-S23 — Attendance key takeaways & guidance

**Labels:** `user-story`, `time-attendance` · **Priority:** Could · **Estimate:** 1
**As an** HR Admin, **I want** in-product key-takeaways/guidance for attendance compliance, **so that** users understand the controls and best practices.

**Description**
Surface the chapter's key takeaways as contextual in-app guidance/help (best-practice summary, control checklist, country highlights) linked from attendance screens.

**Acceptance Criteria**

- [ ] Given attendance screens, when a user opens help, then key-takeaways guidance is shown with country highlights.
- [ ] Given guidance content, when updated by admin, then it versions without code deploy.
- [ ] Given a new user, when onboarded, then guidance is discoverable from the module.

**Tasks**

- [ ] Backend: `guidance_content` store (module, country, version)
- [ ] Frontend: contextual help/takeaways panel
- [ ] Rules/Config: editable guidance per country
- [ ] Tests: unit test for guidance retrieval/versioning

**Covers:** 19.30
**Dependencies:** —
