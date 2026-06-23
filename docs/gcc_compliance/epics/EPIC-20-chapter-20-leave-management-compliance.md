# EPIC-20: Chapter 20 – Leave Management Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 20 – Leave Management Compliance
> **Module:** Time & Attendance · **Labels:** `epic`, `gcc-compliance`, `leave`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a complete, country-configurable leave management module in AuraOS covering every GCC leave type (annual, sick, maternity, paternity/parental, bereavement, Hajj, study, marriage, unpaid, comp-off), with statutory entitlements, accrual, carry-forward, encashment, leave-salary computation and integration to attendance and payroll. Leave becomes an accurate, self-service, auditable process that respects each country's labour law and prevents over-grant, misuse and pay errors.

## Business Value

Avoids labour-law breaches and disputes over leave entitlement, leave salary and end-of-service leave encashment, automates accrual/carry-forward to prevent over/under-balances, gives payroll correct leave-salary and LOP inputs, reduces leave abuse through controls and analytics, protects sensitive sick/maternity medical data, and improves employee experience with transparent balances and self-service requests across all six GCC countries.

## Requirements Covered (handbook sections)

- 20.1 Introduction
- 20.2 Objectives of Leave Compliance
- 20.3 GCC Leave Governance Framework
- 20.4 Common Leave Types in the GCC
- 20.5 Annual Leave
- 20.6 Sick Leave
- 20.7 Maternity Leave
- 20.8 Paternity and Parental Leave
- 20.9 Bereavement / Compassionate Leave
- 20.10 Hajj Leave
- 20.11 Study and Examination Leave
- 20.12 Marriage Leave
- 20.13 Unpaid Leave
- 20.14 Compensatory Off
- 20.15 Leave Accrual
- 20.16 Leave Carry-Forward
- 20.17 Leave Encashment
- 20.18 Leave Salary
- 20.19 Leave and Payroll Integration
- 20.20 Leave and Attendance Integration
- 20.21 Leave During Notice Period
- 20.22 Long-Term Leave and Return to Work
- 20.23 Leave Misuse and Abuse Risks
- 20.24 Leave Data Privacy
- 20.25 Leave Audit Checklist
- 20.26 Leave KPIs
- 20.27 Leave Risk Matrix
- 20.28 HRMS Leave Automation Design
- 20.29 Leave Dashboard
- 20.30 Monthly Leave Compliance Pack
- 20.31 Sample Leave Monthly Compliance Certificate
- 20.32 Sample Leave Balance Adjustment Register
- 20.33 Sample Sick Leave Register
- 20.34 Key Takeaways

## Out of Scope

- Attendance capture/punch processing (EPIC-19) — leave consumes/feeds attendance but capture lives there.
- Payroll calculation engine, payslip and bank file (EPIC-10/EPIC-11) — only leave-salary/LOP inputs are pushed.
- End-of-service gratuity calculation (EPIC-28) — leave encashment at separation is handed to final settlement.
- Public-holiday calendar governance (EPIC-21) — consumed for leave/holiday overlap.

## Dependencies

- EPIC-02 (Country Rule Engine) · EPIC-09 (Org/Position & manager hierarchy) · EPIC-19 (Attendance) · EPIC-21 (Public Holidays) · EPIC-10 (Payroll) · EPIC-27/EPIC-28 (Separation/EOSB for encashment)

## Epic Definition of Done

- [ ] All GCC leave types are configurable per country/entity/grade with statutory entitlements.
- [ ] Accrual, carry-forward, encashment and leave-salary engines run correctly per country.
- [ ] Self-service request, balance, approval (maker-checker) and document attachment work end-to-end.
- [ ] Leave integrates with attendance (suppress absence) and payroll (leave salary/LOP).
- [ ] Notice-period leave, long-term leave/return-to-work and misuse controls are enforced.
- [ ] Sensitive medical (sick/maternity) data is privacy-protected and RBAC-scoped.
- [ ] KPIs, dashboard, audit checklist, risk matrix, compliance pack, certificate and registers are live.

---

## User Stories

### EPIC-20-S01 — Leave objectives & governance framework

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a configurable leave governance framework per country, **so that** leave operates within statutory rules and defined controls.

**Description**
Establish the governance baseline: leave-policy ownership, approval roles, statutory minimums per country, control points and the stated objectives of leave compliance. This is the rule foundation all leave-type stories consume.

**Acceptance Criteria**

- [ ] Given each GCC country, when configured, then statutory leave minimums and control roles are stored and versioned.
- [ ] Given the governance model, when set, then approval roles and maker-checker control points are mandatory.
- [ ] Given a legal entity, when leave rules resolve, then the rule engine returns the correct country/entity configuration.
- [ ] Given any framework change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `leave_governance` + `leave_rule_set` schemas (country, owner_role, statutory_min)
- [ ] Backend: governance control-point + rule-resolution service
- [ ] Frontend: leave governance configuration screen
- [ ] Rules/Config: per-country statutory minimums and approver roles
- [ ] Tests: unit tests for rule resolution per country/entity

**Covers:** 20.1, 20.2, 20.3
**Dependencies:** EPIC-02

### EPIC-20-S02 — Leave type catalogue & country entitlement engine

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 13
**As an** HR Manager, **I want** a configurable catalogue of all GCC leave types with country-specific entitlements, **so that** every leave is granted per the correct labour-law rule.

**Description**
Build a leave-type catalogue (annual, sick, maternity, paternity/parental, bereavement, Hajj, study/exam, marriage, unpaid, comp-off and custom) with per-country/entity/grade entitlement, paid/unpaid/partial-pay tiers, eligibility (service, gender, religion, nationality where lawful), documentation requirements and limits — the configuration that powers all type-specific stories.

**Acceptance Criteria**

- [ ] Given the catalogue, when configured, then each leave type carries country-specific entitlement, pay tier, eligibility and documentation rules.
- [ ] Given a country, when an employee's leave types resolve, then only eligible, correctly-quantified types are offered.
- [ ] Given a paid-then-reduced type (e.g., sick leave full→half→unpaid bands), when configured, then pay tiers apply by day-band.
- [ ] Given any entitlement change, when saved, then it is versioned, effective-dated and audit-logged.

**Tasks**

- [ ] Backend: `leave_type`, `leave_entitlement_rule` schemas (country, pay_tier_bands, eligibility, doc_required)
- [ ] Backend: entitlement resolution service (employee+country → entitlements)
- [ ] Frontend: leave-type catalogue + entitlement configuration screen
- [ ] Rules/Config: seed GCC defaults (entitlement days, pay bands per type/country)
- [ ] Tests: unit tests for entitlement resolution and pay-tier bands

**Covers:** 20.4
**Dependencies:** EPIC-20-S01

### EPIC-20-S03 — Annual leave

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 8
**As an** Employee (Self-Service), **I want** to request and track annual leave per my country entitlement, **so that** I take leave within my accrued, country-correct balance.

**Description**
Implement annual leave with country entitlement (e.g., 30 calendar days/year after one year in UAE; pro-rata in first year), accrual link, holiday/weekend treatment within the leave span, minimum/maximum block rules and manager approval.

**Acceptance Criteria**

- [ ] Given a country, when annual leave resolves, then the correct annual entitlement and accrual basis apply (e.g., UAE 30 days/yr, pro-rata for partial year).
- [ ] Given a leave span overlapping a public holiday/weekly off, when calculated, then those days are treated per country rule (excluded or included).
- [ ] Given insufficient balance, when requested, then the system blocks or routes to unpaid/advance per policy.
- [ ] Given approval, when granted, then the balance is deducted and the request is audit-logged.

**Tasks**

- [ ] Backend: annual-leave request/balance service over `leave_type`
- [ ] Backend: holiday/weekend-in-span calculation per country
- [ ] Frontend: annual-leave request + balance screen
- [ ] Rules/Config: per-country annual entitlement, pro-rata and holiday-in-span rule
- [ ] Alerts/Workflow: manager approval routing
- [ ] Tests: unit tests for entitlement, pro-rata and holiday-in-span

**Covers:** 20.5
**Dependencies:** EPIC-20-S02, EPIC-20-S08

### EPIC-20-S04 — Sick leave (with medical bands & register)

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 8
**As an** Employee (Self-Service), **I want** to apply for sick leave with medical evidence, **so that** sick days are paid per the statutory pay bands and tracked compliantly.

**Description**
Implement sick leave with country pay-band logic (e.g., UAE: first 15 days full pay, next 30 half pay, then unpaid within a year), medical-certificate requirement and validation, sensitive-data handling, and feed the Sample Sick Leave Register.

**Acceptance Criteria**

- [ ] Given a country, when sick leave is taken, then pay bands apply by cumulative days in the entitlement window (full/half/unpaid).
- [ ] Given a sick request beyond the no-certificate threshold, when submitted, then a medical certificate is mandatory.
- [ ] Given a medical certificate, when uploaded, then it is stored as sensitive data with restricted access.
- [ ] Given sick leave, when approved, then it posts to the Sick Leave Register and feeds payroll pay-tier, audit-logged.

**Tasks**

- [ ] Backend: sick-leave service with cumulative-band evaluation + `sick_leave_record`
- [ ] Backend: medical-certificate sensitive-document handling
- [ ] Frontend: sick-leave request + certificate upload screen
- [ ] Rules/Config: per-country sick pay bands and certificate thresholds
- [ ] Alerts/Workflow: HR review for long/abusive sick patterns
- [ ] Tests: unit tests for pay-band transitions; integration for register feed

**Covers:** 20.6, 20.33 (feeds register)
**Dependencies:** EPIC-20-S02, EPIC-20-S20

### EPIC-20-S05 — Maternity leave

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**As an** Employee (Self-Service), **I want** maternity leave per my country's law, **so that** I receive the correct paid/partly-paid maternity entitlement and protections.

**Description**
Implement maternity leave with country entitlement and pay (e.g., UAE 60 days: 45 full + 15 half pay; KSA up to 12 weeks), eligibility, expected-date scheduling, nursing-hour entitlements where applicable, and return-to-work linkage.

**Acceptance Criteria**

- [ ] Given a country, when maternity leave resolves, then duration and pay tiers apply per law (e.g., UAE 45 full + 15 half).
- [ ] Given an expected delivery date, when scheduled, then the leave window and any pre/post split are computed.
- [ ] Given nursing-hour entitlement, when applicable, then it is granted post-return per country rule.
- [ ] Given maternity leave, when approved, then it links to return-to-work tracking and is privacy-protected, audit-logged.

**Tasks**

- [ ] Backend: maternity-leave service with pay-tier + scheduling logic
- [ ] Backend: nursing-hour entitlement post-return
- [ ] Frontend: maternity request + expected-date screen
- [ ] Rules/Config: per-country maternity duration, pay tiers, nursing hours
- [ ] Alerts/Workflow: return-to-work trigger handover
- [ ] Tests: unit tests for duration/pay tiers per country

**Covers:** 20.7
**Dependencies:** EPIC-20-S02, EPIC-20-S16

### EPIC-20-S06 — Paternity & parental leave

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**As an** Employee (Self-Service), **I want** paternity/parental leave per my country, **so that** new fathers/parents receive their statutory entitlement.

**Description**
Implement paternity/parental leave (e.g., UAE 5 working days parental leave for either parent within 6 months of birth), eligibility window, document requirements and approval.

**Acceptance Criteria**

- [ ] Given a country, when paternity/parental leave resolves, then the correct day count and eligibility window apply (e.g., UAE 5 days within 6 months).
- [ ] Given a request outside the eligibility window, when submitted, then it is blocked with reason.
- [ ] Given required documents (e.g., birth proof), when configured, then they are mandatory before approval.
- [ ] Given approval, when granted, then balance/usage is recorded and audit-logged.

**Tasks**

- [ ] Backend: paternity/parental leave service with eligibility window
- [ ] Frontend: paternity/parental request screen
- [ ] Rules/Config: per-country entitlement, window and documents
- [ ] Alerts/Workflow: approval routing
- [ ] Tests: unit tests for window and entitlement

**Covers:** 20.8
**Dependencies:** EPIC-20-S02

### EPIC-20-S07 — Bereavement, Hajj, study & marriage leave

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 8
**As an** Employee (Self-Service), **I want** to apply for bereavement, Hajj, study/exam and marriage leave per my country, **so that** these special leaves are granted correctly with required eligibility and documents.

**Description**
Implement the special-leave family using the catalogue: bereavement/compassionate (e.g., UAE 5 days spouse, 3 days specified relatives), Hajj/pilgrimage (e.g., once in service, up to 10–15 unpaid days where applicable, religion/eligibility-gated), study/examination leave, and marriage leave, each with eligibility, once-in-service or frequency caps, documents and approval.

**Acceptance Criteria**

- [ ] Given bereavement leave, when requested, then day count varies by relationship per country (e.g., 5 days spouse / 3 days parent).
- [ ] Given Hajj leave, when requested, then once-in-service and eligibility (e.g., not previously taken) are enforced and paid/unpaid status applies per country.
- [ ] Given study/exam or marriage leave, when configured, then frequency caps, service eligibility and documents are enforced.
- [ ] Given any special leave, when approved, then usage caps update and the request is audit-logged.

**Tasks**

- [ ] Backend: special-leave service with relationship/frequency/once-in-service caps
- [ ] Backend: eligibility + document-requirement enforcement
- [ ] Frontend: special-leave request screens (relationship picker, document upload)
- [ ] Rules/Config: per-country bereavement-by-relationship, Hajj, study, marriage rules
- [ ] Alerts/Workflow: approval routing
- [ ] Tests: unit tests for relationship/frequency/once-in-service caps

**Covers:** 20.9, 20.10, 20.11, 20.12
**Dependencies:** EPIC-20-S02

### EPIC-20-S08 — Leave accrual engine

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** an automated leave accrual engine, **so that** balances build correctly over time per country rules.

**Description**
Implement accrual (monthly/daily proration, post-probation start, accrual caps, mid-service joiners/leavers, unpaid-leave impact on accrual) for annual and other accruing leave types, producing auditable balance ledgers.

**Acceptance Criteria**

- [ ] Given an accrual rule, when the period runs, then balance accrues per country basis (e.g., 2.5 days/month for 30-day annual).
- [ ] Given probation/eligibility, when not yet met, then accrual starts only after the configured point.
- [ ] Given unpaid leave in a period, when accrual runs, then accrual is reduced per country rule.
- [ ] Given each accrual, when posted, then a ledger entry is created and auditable; caps are enforced.

**Tasks**

- [ ] Backend: accrual scheduler + `leave_balance_ledger` schema (accrual, used, adjustment, balance)
- [ ] Backend: proration + cap + unpaid-impact logic
- [ ] Frontend: balance ledger view
- [ ] Rules/Config: per-country accrual rate, start point, caps
- [ ] Tests: unit tests for proration, caps, unpaid impact

**Covers:** 20.15
**Dependencies:** EPIC-20-S02

### EPIC-20-S09 — Leave carry-forward

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** automated year-end carry-forward, **so that** unused leave carries over within country limits and excess is lapsed/encashed per policy.

**Description**
Implement year-end/anniversary carry-forward with country caps (max carry days, expiry of carried balance, lapse vs encash treatment), producing adjustment entries and notices.

**Acceptance Criteria**

- [ ] Given year-end, when carry-forward runs, then unused balance carries up to the country/policy cap.
- [ ] Given balance above the cap, when processed, then excess is lapsed or routed to encashment per policy.
- [ ] Given carried balance with expiry, when expiry passes, then it lapses and is audit-logged.
- [ ] Given carry-forward, when run, then employees are notified and ledger adjustments are recorded.

**Tasks**

- [ ] Backend: carry-forward job + ledger adjustment entries
- [ ] Backend: cap/expiry/lapse-vs-encash logic
- [ ] Frontend: carry-forward summary + notice
- [ ] Rules/Config: per-country carry cap, expiry, lapse/encash rule
- [ ] Alerts/Workflow: employee notification of carry/lapse
- [ ] Tests: unit tests for cap, expiry, lapse vs encash

**Covers:** 20.16
**Dependencies:** EPIC-20-S08

### EPIC-20-S10 — Leave encashment

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** automated leave encashment, **so that** eligible unused leave is paid out correctly in-service and at separation.

**Description**
Implement encashment (eligibility, encashable days, rate basis per country — e.g., basic vs gross, in-service vs end-of-service), approval and handover to payroll/final settlement.

**Acceptance Criteria**

- [ ] Given encashment eligibility, when triggered, then encashable days and the country rate basis are computed (e.g., basic salary/30 × days in UAE).
- [ ] Given separation, when leave encashment runs, then it hands the amount to final settlement (EPIC-28).
- [ ] Given in-service encashment, when approved, then it is queued to payroll and balance reduced.
- [ ] Given any encashment, when posted, then it is audit-logged with calculation breakdown.

**Tasks**

- [ ] Backend: encashment calculation service + handover events
- [ ] Backend: in-service vs separation routing
- [ ] Frontend: encashment request/approval + breakdown screen
- [ ] Rules/Config: per-country encashable days and rate basis
- [ ] Alerts/Workflow: approval routing
- [ ] Tests: unit tests for rate basis and routing

**Covers:** 20.17
**Dependencies:** EPIC-20-S08, EPIC-10

### EPIC-20-S11 — Leave salary computation

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** leave-salary computed per country, **so that** employees on leave are paid the correct wage (including advance leave salary where applicable).

**Description**
Compute leave salary (wage basis on leave, advance leave-salary payment before annual leave where mandated, allowance inclusion/exclusion per country) and feed payroll.

**Acceptance Criteria**

- [ ] Given annual leave, when computed, then leave salary uses the correct country wage basis (basic/gross and included allowances).
- [ ] Given a country requiring advance leave salary, when leave starts, then the advance is computed and flagged for payroll.
- [ ] Given partial-pay leave types, when on leave, then the reduced wage is computed correctly.
- [ ] Given leave salary, when produced, then it feeds payroll with a breakdown and is audit-logged.

**Tasks**

- [ ] Backend: leave-salary calculation service (wage basis, allowance inclusion)
- [ ] Backend: advance-leave-salary flagging
- [ ] Frontend: leave-salary breakdown view
- [ ] Rules/Config: per-country wage basis, allowances, advance requirement
- [ ] Tests: unit tests for wage basis and advance computation

**Covers:** 20.18
**Dependencies:** EPIC-20-S02, EPIC-10

### EPIC-20-S12 — Unpaid leave

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** to manage unpaid leave, **so that** LOP, accrual impact and service-period effects are handled correctly.

**Description**
Implement unpaid leave with approval, LOP computation to payroll, impact on accrual and on service period for gratuity (handover flag to EOSB), and limits/escalation for extended unpaid leave.

**Acceptance Criteria**

- [ ] Given unpaid leave, when approved, then LOP is computed and queued to payroll for those days.
- [ ] Given unpaid leave, when posted, then accrual reduction and service-period impact flags are recorded.
- [ ] Given unpaid leave beyond a threshold, when reached, then HR escalation/approval is required.
- [ ] Given any unpaid leave, when applied, then it is audit-logged with LOP and impact details.

**Tasks**

- [ ] Backend: unpaid-leave service + LOP and service-impact flags
- [ ] Backend: EOSB service-period impact handover
- [ ] Frontend: unpaid-leave request/approval screen
- [ ] Rules/Config: per-country LOP basis and service-impact rule, thresholds
- [ ] Alerts/Workflow: extended-unpaid escalation
- [ ] Tests: unit tests for LOP and service-impact

**Covers:** 20.13
**Dependencies:** EPIC-20-S08, EPIC-10

### EPIC-20-S13 — Compensatory off (comp-off)

**Labels:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 5
**As an** Employee (Self-Service), **I want** comp-off for approved holiday/rest-day work, **so that** I can take time off in lieu within its validity.

**Description**
Implement comp-off accrual from approved holiday/rest-day work (from EPIC-19/EPIC-21), with validity/expiry, conversion-to-pay option, and request/approval workflow.

**Acceptance Criteria**

- [ ] Given approved holiday/rest-day work, when received, then a comp-off credit is created with validity.
- [ ] Given a comp-off request, when within validity, then it is approvable and deducts the credit.
- [ ] Given an expiring comp-off, when validity passes, then it lapses or converts to pay per policy.
- [ ] Given comp-off activity, when posted, then it is audit-logged and reflected in balance.

**Tasks**

- [ ] Backend: `comp_off_credit` schema + accrual from holiday-work events
- [ ] Backend: validity/expiry + convert-to-pay logic
- [ ] Frontend: comp-off request + balance screen
- [ ] Rules/Config: per-country comp-off validity and conversion rule
- [ ] Alerts/Workflow: expiry reminder + approval routing
- [ ] Tests: integration tests for accrual, validity, conversion

**Covers:** 20.14
**Dependencies:** EPIC-19-S13, EPIC-21

### EPIC-20-S14 — Leave ↔ payroll integration

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** leave to deliver locked leave-salary/LOP/encashment inputs, **so that** payroll reflects leave accurately without manual entry.

**Description**
Aggregate leave-salary, LOP (unpaid/partial), encashment and advance leave-salary into the payroll input feed with maker-checker lock, blocking payroll lock if leave for the period is unprocessed.

**Acceptance Criteria**

- [ ] Given period close, when leave is finalized, then leave salary, LOP and encashment are aggregated per employee.
- [ ] Given unprocessed leave for an active employee, when payroll attempts lock, then it is blocked with a reason.
- [ ] Given maker-checker, when approved (preparer ≠ approver), then the leave input set is locked and published.
- [ ] Given a post-lock change, when made, then it routes to off-cycle/adjustment and is audit-logged.

**Tasks**

- [ ] Backend: `leave_payroll_input` aggregation + lock; event `leave.payroll.locked`
- [ ] Backend: pre-lock completeness check
- [ ] Frontend: leave-input review + maker-checker screen
- [ ] Rules/Config: LOP/leave-salary day-value basis per country
- [ ] Alerts/Workflow: lock-block alerts
- [ ] Tests: integration tests for aggregation, lock-block, maker-checker

**Covers:** 20.19
**Dependencies:** EPIC-20-S11, EPIC-20-S12, EPIC-10

### EPIC-20-S15 — Leave ↔ attendance integration

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** leave and attendance reconciled, **so that** leave days suppress absence and unplanned absence can convert to leave.

**Description**
Publish approved-leave events to attendance (EPIC-19) to suppress absence/late flags, support half-day leave against partial attendance, and accept absence→leave conversion requests (e.g., backdated sick leave).

**Acceptance Criteria**

- [ ] Given approved leave, when published, then attendance suppresses absence/late for those dates.
- [ ] Given a half-day leave, when applied, then only the working half-day is attendance-evaluated.
- [ ] Given an unauthorized absence, when covered by approved leave, then it reclassifies and any LOP reverses.
- [ ] Given any integration action, when applied, then balances stay consistent and it is audit-logged.

**Tasks**

- [ ] Backend: publish `leave.approved`/`leave.cancelled`; reconciliation handlers
- [ ] Backend: absence→leave conversion with LOP reversal
- [ ] Frontend: combined leave+attendance day view
- [ ] Rules/Config: half-day and conversion rules per country
- [ ] Tests: integration tests for suppression, half-day, conversion

**Covers:** 20.20
**Dependencies:** EPIC-19, EPIC-20-S02

### EPIC-20-S16 — Notice-period & long-term leave / return-to-work

**Labels:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 5
**As an** HR Manager, **I want** controls for leave during notice period and structured long-term leave with return-to-work, **so that** separation and extended leaves are handled compliantly.

**Description**
Restrict/configure leave during notice period (e.g., block or require approval, force encashment of balance rather than leave), and manage long-term leave (maternity, extended sick/unpaid) with return-to-work scheduling, reminders and reinstatement of benefits/attendance.

**Acceptance Criteria**

- [ ] Given an employee on notice period, when leave is requested, then policy rules apply (block / restrict / encash balance) per country.
- [ ] Given long-term leave, when started, then a return-to-work date is tracked with pre-return reminders.
- [ ] Given a return-to-work, when reached, then attendance/benefits resume and any extension routes for approval.
- [ ] Given these actions, when applied, then they are audit-logged.

**Tasks**

- [ ] Backend: notice-period leave rule + `return_to_work` schema
- [ ] Backend: return-to-work scheduler + reinstatement service
- [ ] Frontend: notice-period leave screen + return-to-work tracker
- [ ] Rules/Config: per-country notice-period leave rule
- [ ] Alerts/Workflow: pre-return reminders + extension approval
- [ ] Tests: integration tests for notice restriction and return-to-work

**Covers:** 20.21, 20.22
**Dependencies:** EPIC-20-S02, EPIC-27

### EPIC-20-S17 — Leave misuse & abuse controls

**Labels:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** detection of leave misuse patterns, **so that** abuse (e.g., habitual Monday sick leave, fake certificates) is flagged for action.

**Description**
Implement pattern detection (frequent short sick leaves, leave around weekends/holidays, certificate anomalies, negative-balance forcing) raising a misuse flag/register with risk scoring for HR review.

**Acceptance Criteria**

- [ ] Given recurring sick leave adjacent to weekends/holidays, when detected, then a misuse pattern is flagged.
- [ ] Given certificate anomalies (duplicate/expired source), when detected, then the leave is flagged for verification.
- [ ] Given a flag, when raised, then it enters a misuse register with risk score and routes to HR.
- [ ] Given any flag/resolution, when actioned, then it is audit-logged.

**Tasks**

- [ ] Backend: misuse-pattern rules + `leave_misuse_flag` schema
- [ ] Backend: certificate-anomaly checks
- [ ] Frontend: misuse register/review screen
- [ ] Rules/Config: pattern thresholds per country
- [ ] Alerts/Workflow: HR review notification
- [ ] Tests: unit tests for each misuse pattern

**Covers:** 20.23
**Dependencies:** EPIC-20-S04

### EPIC-20-S18 — Leave data privacy (sensitive medical)

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** privacy controls over sick/maternity medical data, **so that** sensitive leave information is protected per GCC data-protection laws.

**Description**
Implement consent, purpose limitation, RBAC-scoped access (e.g., line manager sees dates not diagnosis), encryption of medical certificates, and retention/erasure for sensitive leave data per UAE/KSA PDPL.

**Acceptance Criteria**

- [ ] Given a medical certificate, when stored, then it is encrypted and access is RBAC-restricted (managers see status, not medical detail).
- [ ] Given sensitive leave data, when accessed, then access is logged.
- [ ] Given the retention schedule, when reached, then medical records are purged/anonymized.
- [ ] Given a valid erasure request, when processed, then relevant sensitive leave data is handled per policy.

**Tasks**

- [ ] Backend: field-level encryption + access-log for sensitive leave data
- [ ] Backend: retention/erasure jobs
- [ ] Frontend: privacy-scoped leave views + admin console
- [ ] Rules/Config: per-country retention and access scopes
- [ ] Tests: unit/integration for RBAC masking, retention purge

**Covers:** 20.24
**Dependencies:** EPIC-20-S04

### EPIC-20-S19 — Leave audit checklist & risk matrix

**Labels:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable leave audit checklist and risk matrix, **so that** leave controls are testable and risks tracked.

**Description**
Provide a digital audit checklist (entitlement accuracy, accrual integrity, carry-forward caps, encashment correctness, document completeness, privacy) and a configurable risk matrix/register scoring likelihood × impact for leave risks.

**Acceptance Criteria**

- [ ] Given the checklist, when run, then each control yields pass/fail with evidence and timestamp.
- [ ] Given the risk matrix, when configured, then risks score likelihood × impact with rating bands.
- [ ] Given an open risk, when logged, then owner, mitigation and due date are tracked to closure.
- [ ] Given checklist/risk records, when saved, then they are exportable and audit-logged.

**Tasks**

- [ ] Backend: `leave_audit_item`, `leave_risk_entry` schemas
- [ ] Backend: checklist run + risk-scoring service
- [ ] Frontend: audit checklist + risk-matrix screens
- [ ] Rules/Config: default leave control set and scoring bands
- [ ] Tests: unit tests for scoring and checklist evaluation

**Covers:** 20.25, 20.27
**Dependencies:** EPIC-20-S01

### EPIC-20-S20 — Leave KPIs & dashboard

**Labels:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership, **I want** leave KPIs and a dashboard, **so that** balances, liability and patterns are visible per country/entity/team.

**Description**
Compute KPIs (leave utilization, average balance, leave liability/provision, sick-leave rate, carry-forward/lapse, negative-balance count) and a drill-down dashboard with country/entity/department filters and trends.

**Acceptance Criteria**

- [ ] Given leave data, when aggregated, then KPIs including leave-liability provision compute per country/entity/team.
- [ ] Given the dashboard, when filtered, then it drills from company → country → entity → team → employee.
- [ ] Given a KPI breach (e.g., high sick rate), when detected, then RAG status highlights it.
- [ ] Given RBAC, when a viewer lacks scope, then restricted data is hidden.

**Tasks**

- [ ] Backend: KPI + leave-liability aggregation service + materialized views
- [ ] Backend: RBAC scoping
- [ ] Frontend: leave dashboard with filters, trends, RAG status
- [ ] Rules/Config: KPI targets per country
- [ ] Tests: unit tests for KPI/liability math; e2e for drill-down + RBAC

**Covers:** 20.26, 20.29
**Dependencies:** EPIC-20-S08

### EPIC-20-S21 — HRMS leave automation design

**Labels:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 5
**As a** System Administrator, **I want** the leave automation/event design implemented, **so that** accrual, carry-forward, integrations and approvals run with minimal manual effort.

**Description**
Implement scheduled accrual/carry-forward/expiry jobs, event-driven integrations to attendance/payroll, automated approval routing and reminders, with retry/observability over the event bus.

**Acceptance Criteria**

- [ ] Given scheduled jobs, when they run, then accrual, carry-forward and expiry process for all employees with ledger entries.
- [ ] Given leave events, when published, then attendance/payroll consumers process idempotently.
- [ ] Given a failed job/consumer, when it errors, then retry and DLQ handling apply with alerting.
- [ ] Given automation config, when changed, then schedules/rules update without code deploy where possible.

**Tasks**

- [ ] Backend: scheduler + event topology (`leave.*` topics), DLQ + retry
- [ ] Backend: idempotent consumers for attendance/payroll handovers
- [ ] Frontend: automation/job-monitoring admin screen
- [ ] Rules/Config: configurable schedules
- [ ] Tests: integration tests for job orchestration and DLQ

**Covers:** 20.28
**Dependencies:** EPIC-20-S08, EPIC-20-S14

### EPIC-20-S22 — Monthly leave compliance pack & certificate

**Labels:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** a monthly leave compliance pack and signed certificate, **so that** management certification and audit evidence are generated automatically.

**Description**
Assemble a monthly pack (KPIs, liability, registers, misuse/privacy items, open audit actions) and a configurable monthly leave compliance certificate with maker-checker sign-off and export.

**Acceptance Criteria**

- [ ] Given month-end, when the pack runs, then it compiles KPIs, liability, registers and open actions per entity/country.
- [ ] Given the certificate, when generated, then it reflects pack figures and requires sign-off (preparer ≠ approver).
- [ ] Given sign-off, when completed, then the certificate is locked, versioned and exportable (PDF).
- [ ] Given generation, when done, then it is audit-logged and archived to the document store.

**Tasks**

- [ ] Backend: pack assembler + `leave_certificate` schema
- [ ] Backend: PDF export + document-store archival
- [ ] Frontend: pack viewer + certificate sign-off screen
- [ ] Rules/Config: certificate template per country/entity
- [ ] Alerts/Workflow: month-end generation + sign-off reminder
- [ ] Tests: e2e for pack assembly, sign-off lock, export

**Covers:** 20.30, 20.31
**Dependencies:** EPIC-20-S20

### EPIC-20-S23 — Leave Balance Adjustment & Sick Leave registers (digital forms)

**Labels:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** configurable Leave Balance Adjustment and Sick Leave registers, **so that** adjustments and sick patterns are tracked, exportable and audit-ready.

**Description**
Build the two sample registers: a Leave Balance Adjustment Register (manual credits/debits with reason, approver, maker-checker) and a Sick Leave Register (auto-populated from sick leave with pay-band and certificate status), both configurable, filterable and exportable.

**Acceptance Criteria**

- [ ] Given a balance adjustment, when made, then it requires reason + approver and appears in the adjustment register with before/after balance.
- [ ] Given a sick leave, when approved, then it auto-appears in the Sick Leave Register with pay band and certificate status.
- [ ] Given either register, when filtered/exported, then a CSV/PDF is produced and the action audit-logged.
- [ ] Given an adjustment, when applied, then maker-checker (preparer ≠ approver) is enforced.

**Tasks**

- [ ] Backend: `leave_balance_adjustment` schema + sick-register view
- [ ] Backend: export service (CSV/PDF) + maker-checker on adjustments
- [ ] Frontend: adjustment register + sick-leave register screens with filters
- [ ] Rules/Config: configurable columns/reason codes
- [ ] Tests: integration tests for adjustment maker-checker and register population

**Covers:** 20.32, 20.33
**Dependencies:** EPIC-20-S04, EPIC-20-S08

### EPIC-20-S24 — Leave key takeaways & guidance

**Labels:** `user-story`, `leave` · **Priority:** Could · **Estimate:** 1
**As an** HR Admin, **I want** in-product key-takeaways/guidance for leave compliance, **so that** users understand entitlements and controls per country.

**Description**
Surface the chapter's key takeaways as contextual in-app guidance (entitlement summary by country, control checklist, best practices) linked from leave screens.

**Acceptance Criteria**

- [ ] Given leave screens, when a user opens help, then key-takeaways guidance is shown with country entitlement highlights.
- [ ] Given guidance content, when updated by admin, then it versions without code deploy.
- [ ] Given a new user, when onboarded, then guidance is discoverable from the module.

**Tasks**

- [ ] Backend: `guidance_content` store (module=leave, country, version)
- [ ] Frontend: contextual help/takeaways panel
- [ ] Rules/Config: editable guidance per country
- [ ] Tests: unit test for guidance retrieval/versioning

**Covers:** 20.34
**Dependencies:** —
