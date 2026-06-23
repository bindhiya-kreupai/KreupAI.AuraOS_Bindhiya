# EPIC-27: Chapter 27 – Termination and Separation Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 27 – Termination and Separation Compliance
> **Module:** Separation · **Labels:** `epic`, `gcc-compliance`, `separation`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an end-to-end AuraOS Separation module that manages every exit type (resignation, employer termination, mutual, redundancy, non-renewal, probation, abandonment, death in service) with correct notice-period, garden-leave, exit-clearance, final-settlement, EOSB, leave-encashment and recoveries handling. It orchestrates downstream closures—visa/work-permit cancellation, social insurance, benefits, IT/data-access—plus handover and exit interview, fully country-configured for UAE, KSA, Bahrain, Qatar, Oman and Kuwait with a defensible audit trail.

## Business Value

Eliminates the highest-risk HR transaction—exits—where errors trigger labour claims, WPS/EOSB disputes, immigration overstays/fines, social-insurance penalties and data-security exposure. Automates final settlement and statutory closures, enforces notice/EOSB legality, ensures timely visa cancellation to avoid overstay fines and labour bans, and gives HR, PRO, Payroll, Compliance and Leadership a single, auditable separation pipeline that is fully audit-ready.

## Requirements Covered (handbook sections)

- 27.1 Introduction
- 27.2 Objectives of Separation Compliance
- 27.3 Types of Separation
- 27.4 Separation Governance Framework
- 27.5 Separation Policy
- 27.6 Resignation Compliance
- 27.7 Employer Termination
- 27.8 Mutual Separation
- 27.9 Redundancy and Restructuring
- 27.10 Non-Renewal of Fixed-Term Contract
- 27.11 Probation Termination
- 27.12 Abandonment / Absconding / Unauthorized Absence
- 27.13 Notice Period Compliance
- 27.14 Garden Leave
- 27.15 Exit Clearance
- 27.16 Final Settlement
- 27.17 End-of-Service Benefits Linkage
- 27.18 Leave Balance and Encashment
- 27.19 Deductions and Recoveries
- 27.20 Visa, Work Permit and Immigration Closure
- 27.21 Social Insurance Closure
- 27.22 Benefits Closure
- 27.23 IT and Data Access Closure
- 27.24 Handover Management
- 27.25 Exit Interview
- 27.26 Death in Service
- 27.27 Separation Data Privacy
- 27.28 Separation Audit Checklist
- 27.29 Separation KPIs
- 27.30 Separation Risk Matrix
- 27.31 HRMS Separation Automation Design
- 27.32 Separation Dashboard
- 27.33 Monthly Separation Compliance Pack
- 27.34 Sample Separation Request / Approval Form
- 27.35 Sample Exit Clearance Checklist
- 27.36 Sample Final Settlement Checklist
- 27.37 Key Takeaways

## Out of Scope

- Detailed EOSB calculation formulae and provisioning/accounting (owned by EPIC-28; this epic links and consumes the result).
- Detailed immigration-exit portal workflows and grace-period mechanics (owned by EPIC-29; this epic triggers and tracks them).
- Disciplinary determination of dismissal grounds (owned by EPIC-26; this epic receives the dismissal type).
- Payroll engine mechanics (owned by EPIC-10; final settlement instructs payroll).

## Dependencies

- EPIC-26 (Disciplinary — disciplinary-led termination)
- EPIC-28 (EOSB — gratuity calculation/provisioning)
- EPIC-29 (Immigration Exit — visa/permit cancellation)
- EPIC-10 (Payroll), EPIC-20 (Leave), EPIC-13/14/15 (Social Insurance), EPIC-22 (Benefits)
- Platform services: RBAC, workflow/approval engine, document store, audit trail, alerts, country rule engine

## Epic Definition of Done

- [ ] All separation types are supported with type-specific workflows, validations and country rules.
- [ ] Notice period, garden leave, exit clearance and final settlement are computed and enforced per country law.
- [ ] Final settlement integrates EOSB, leave encashment, deductions/recoveries and produces an approved, WPS-consistent payout.
- [ ] Visa/permit cancellation, social-insurance closure, benefits closure and IT/data-access revocation are orchestrated and tracked to completion.
- [ ] Handover, exit interview, death-in-service and data-privacy controls are operational with audit capture.
- [ ] Dashboard, KPIs, risk matrix, audit checklist and monthly compliance pack are live and exportable.
- [ ] Sample separation request/approval form, exit-clearance checklist and final-settlement checklist are configurable digital artefacts with export.

---

## User Stories

### EPIC-27-S01 — Separation Governance, Policy & Types Framework

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a configurable separation governance framework, policy and separation-type catalogue, **so that** every exit follows a documented, country-aware standard with the right approvals.

**Description**
Establishes separation objectives, governance (approval authorities by type/seniority, segregation of duties), the separation policy lifecycle (publish/version/acknowledge), and the master catalogue of separation types (resignation, employer termination, mutual, redundancy, non-renewal, probation, abandonment, death in service) each mapped to its workflow, notice rules and EOSB treatment.

**Acceptance Criteria**

- [ ] Given governance config, when set, then approval authorities per separation type/seniority are enforced via RBAC and workflow.
- [ ] Given the separation policy, when published, then employees/managers acknowledge the version with timestamp.
- [ ] Given a new separation case, when created, then a type from the catalogue is selected, driving workflow, notice and EOSB defaults.
- [ ] Given a country, when selected, then country-specific separation rules/objectives are surfaced.
- [ ] Given any governance/policy/catalogue change, when saved, then it is versioned and audited.

**Tasks**

- [ ] Backend: `separation_governance`, `separation_policy`, `separation_type` (workflow_key, notice_rule, eosb_treatment) entities/migrations.
- [ ] Backend: approval-authority + segregation guard.
- [ ] Frontend: governance config + policy acknowledgement screens.
- [ ] Rules/Config: per-country separation rules and type mappings.
- [ ] Alerts/Workflow: policy re-acknowledgement notifications.
- [ ] Tests: unit (authority routing), integration (policy versioning + audit).

**Covers:** 27.1, 27.2, 27.3, 27.4, 27.5
**Dependencies:** EPIC-32

### EPIC-27-S02 — Resignation Compliance

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**As an** Employee (Self-Service), **I want** to submit a resignation with correct notice handling, **so that** my exit follows policy and law and my last working day is computed correctly.

**Description**
Implements employee-initiated resignation: submission with intended last day, manager/HR acceptance, notice-period validation per country/contract, options for notice buyout/waiver, withdrawal-before-acceptance handling, and creation of a separation case feeding clearance and final settlement.

**Acceptance Criteria**

- [ ] Given a resignation, when submitted, then the required notice period is validated against country/contract and the last working day is computed.
- [ ] Given a shortfall in notice, when present, then notice buyout/recovery or mutual waiver is captured per policy.
- [ ] Given manager/HR acceptance, when recorded, then the resignation is locked and downstream workflow starts.
- [ ] Given withdrawal before acceptance, when requested, then it is allowed and audited.
- [ ] Given any resignation event, when stored, then it is audited.

**Tasks**

- [ ] Backend: `resignation` (intended_last_day, notice_required, notice_served, buyout) entity + notice-validation service.
- [ ] Backend: acceptance/withdrawal state machine.
- [ ] Frontend: resignation submission + manager acceptance screens.
- [ ] Rules/Config: per-country/contract notice periods and buyout rules.
- [ ] Alerts/Workflow: acceptance routing + downstream trigger.
- [ ] Tests: integration (notice validation + acceptance), unit (withdrawal).

**Covers:** 27.6
**Dependencies:** EPIC-27-S01

### EPIC-27-S03 — Employer Termination

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** to process employer-initiated terminations with lawful grounds and approvals, **so that** dismissals are valid, documented and not arbitrary.

**Description**
Handles employer termination (with-notice and summary/gross-misconduct), requiring lawful-ground citation, linkage to disciplinary case where applicable (EPIC-26), required approvals, notice or pay-in-lieu, and arbitrary-dismissal risk flagging, then drives clearance, settlement and statutory closures.

**Acceptance Criteria**

- [ ] Given an employer termination, when initiated, then a lawful ground and required approval level are captured.
- [ ] Given a disciplinary-led dismissal, when linked, then EPIC-26 findings/grounds are imported and referenced.
- [ ] Given with-notice termination, when chosen, then notice or pay-in-lieu is computed per country.
- [ ] Given arbitrary-dismissal risk indicators, when present, then the case is flagged for compliance review before finalisation.
- [ ] Given any termination event, when stored, then it is audited.

**Tasks**

- [ ] Backend: `employer_termination` (ground, notice_type, pay_in_lieu, disciplinary_link) entity + ground-validation service.
- [ ] Backend: arbitrary-dismissal risk flagging.
- [ ] Frontend: termination decision screen with grounds/approval.
- [ ] Rules/Config: per-country lawful grounds, notice and pay-in-lieu rules.
- [ ] Alerts/Workflow: approval routing + compliance-review flag.
- [ ] Tests: integration (disciplinary import + notice), unit (risk flagging).

**Covers:** 27.7
**Dependencies:** EPIC-26, EPIC-27-S01

### EPIC-27-S04 — Mutual Separation & Settlement Agreement

**Labels:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 3
**As an** HR Manager, **I want** to process mutual separations with a settlement agreement, **so that** negotiated exits are documented, approved and released cleanly.

**Description**
Supports mutually agreed separation: capture negotiated terms (effective date, ex-gratia/settlement amount, waiver/release clauses), route for approval, generate a settlement agreement for e-signature, and feed agreed amounts into final settlement.

**Acceptance Criteria**

- [ ] Given a mutual separation, when created, then negotiated terms and effective date are captured.
- [ ] Given terms, when approved, then a settlement agreement is generated for e-signature by both parties.
- [ ] Given e-signature completion, when recorded, then agreed amounts flow into final settlement.
- [ ] Given a release/waiver clause, when included, then it is stored and surfaced in the case file.
- [ ] Given any mutual-separation event, when stored, then it is audited.

**Tasks**

- [ ] Backend: `mutual_separation` (terms, settlement_amount, waiver) entity + agreement generator.
- [ ] Backend: e-signature integration + settlement feed.
- [ ] Frontend: mutual-separation terms + agreement screens.
- [ ] Rules/Config: approval thresholds for settlement amounts per country/entity.
- [ ] Alerts/Workflow: approval + signature reminders.
- [ ] Tests: integration (agreement→settlement), unit (waiver capture).

**Covers:** 27.8
**Dependencies:** EPIC-27-S01

### EPIC-27-S05 — Redundancy & Restructuring

**Labels:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 5
**As an** HR Manager, **I want** to manage redundancy/restructuring exits with selection and consultation controls, **so that** workforce reductions are fair, documented and compliant.

**Description**
Handles redundancy: define a restructuring program, apply objective selection criteria, run consultation/notification steps, manage redundancy entitlements/enhanced packages, and batch-create separation cases that flow into clearance, settlement and statutory closures.

**Acceptance Criteria**

- [ ] Given a redundancy program, when created, then affected roles/positions and selection criteria are recorded.
- [ ] Given selection, when applied, then the rationale per employee is captured to defend fairness.
- [ ] Given consultation/notification requirements, when configured, then steps are tracked to completion.
- [ ] Given redundancy entitlement, when computed, then any enhanced package flows into final settlement.
- [ ] Given any program/selection event, when stored, then it is audited.

**Tasks**

- [ ] Backend: `redundancy_program`, `redundancy_selection` entities + batch separation-case creation.
- [ ] Backend: entitlement/enhancement feed to settlement.
- [ ] Frontend: program setup, selection grid, consultation tracker.
- [ ] Rules/Config: per-country consultation/notification and entitlement rules.
- [ ] Alerts/Workflow: consultation-step reminders + approvals.
- [ ] Tests: integration (batch creation), unit (selection rationale capture).

**Covers:** 27.9
**Dependencies:** EPIC-27-S01

### EPIC-27-S06 — Non-Renewal of Fixed-Term Contract & Probation Termination

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** to process contract non-renewal and probation terminations with the correct notice and timing rules, **so that** these exits respect contract type and probation law.

**Description**
Handles fixed-term non-renewal (expiry tracking, non-renewal notice within statutory window, EOSB treatment for completed term) and probation termination (within probation window, reduced/specified notice, country probation rules), each driving clearance and settlement.

**Acceptance Criteria**

- [ ] Given a fixed-term contract nearing expiry, when within the notice window, then non-renewal notice is prompted and tracked (e.g. alerts at 60/30 days before expiry).
- [ ] Given non-renewal, when finalised, then EOSB/end-of-term treatment is applied per country.
- [ ] Given a probation termination, when initiated, then it is validated to be within the probation period and the correct notice rule applies.
- [ ] Given probation rules per country, when applied, then notice/eligibility differences are enforced.
- [ ] Given any non-renewal/probation event, when stored, then it is audited.

**Tasks**

- [ ] Backend: `contract_non_renewal`, `probation_termination` entities + expiry/probation-window validators.
- [ ] Backend: EOSB-treatment flagging for each path.
- [ ] Frontend: non-renewal and probation-termination screens.
- [ ] Rules/Config: per-country probation periods, notice windows and EOSB treatment.
- [ ] Alerts/Workflow: contract-expiry alerts (60/30 days) + notice prompts.
- [ ] Tests: integration (window validation), unit (notice rules).

**Covers:** 27.10, 27.11
**Dependencies:** EPIC-27-S01

### EPIC-27-S07 — Abandonment / Absconding / Unauthorized Absence

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**As a** PRO / Immigration Officer, **I want** to manage abandonment/absconding cases with the correct legal and immigration steps, **so that** unauthorized absence is handled lawfully and overstay/penalty risk is controlled.

**Description**
Handles unauthorized absence escalating to abandonment/absconding: track consecutive absence days, trigger warning/return-to-work notices at statutory thresholds, manage absconding declaration to the authority, and link to immigration absconding/cancellation procedures (EPIC-29) and final-settlement implications.

**Acceptance Criteria**

- [ ] Given consecutive unauthorized absence, when thresholds are reached (configurable, e.g. 7 consecutive days), then escalation notices and an absconding-eligibility flag are raised.
- [ ] Given an absconding declaration, when initiated, then the authority-reporting step and required evidence are tracked.
- [ ] Given an absconding case, when declared, then immigration absconding/cancellation actions are triggered to EPIC-29.
- [ ] Given final-settlement implications, when applicable, then forfeiture/withholding rules per country are applied with justification.
- [ ] Given any abandonment event, when processed, then it is audited.

**Tasks**

- [ ] Backend: `absence_escalation`, `absconding_case` entities + threshold-trigger service consuming attendance events.
- [ ] Backend: immigration-trigger emitter + settlement-implication flags.
- [ ] Frontend: absconding case workspace + notice generation.
- [ ] Rules/Config: per-country absence thresholds, reporting and settlement rules.
- [ ] Alerts/Workflow: escalation notices + authority-reporting reminders.
- [ ] Tests: integration (threshold→escalation→immigration trigger), unit (settlement flags).

**Covers:** 27.12
**Dependencies:** EPIC-27-S01, EPIC-29

### EPIC-27-S08 — Notice Period Compliance & Garden Leave

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** notice-period and garden-leave handling enforced per country, **so that** notice pay, in-lieu amounts and garden-leave status are correct.

**Description**
Computes notice periods per country/contract/seniority, supports notice served, pay-in-lieu, and shortfall recovery, and manages garden leave (employee off-site but employed/paid, restricted access, accruals continuing) including its interaction with leave, payroll, EOSB service period and IT access.

**Acceptance Criteria**

- [ ] Given a separation, when notice is computed, then country/contract/seniority rules determine the period and last working day.
- [ ] Given pay-in-lieu of notice, when selected, then the amount is computed and instructed to payroll (WPS-consistent).
- [ ] Given garden leave, when applied, then the employee remains paid with service accruing, access restrictions are enforced, and the period is flagged distinct from notice-served.
- [ ] Given notice shortfall by the employee, when present, then recovery is computed for final settlement.
- [ ] Given any notice/garden-leave action, when processed, then it is audited.

**Tasks**

- [ ] Backend: `notice_period`, `garden_leave` entities + computation service.
- [ ] Backend: pay-in-lieu/shortfall feed to settlement + access-restriction trigger.
- [ ] Frontend: notice/garden-leave management screen.
- [ ] Rules/Config: per-country notice periods, in-lieu and garden-leave rules.
- [ ] Alerts/Workflow: notice-period milestone alerts; access-restriction request.
- [ ] Tests: integration (notice computation + in-lieu), unit (garden-leave accrual).

**Covers:** 27.13, 27.14
**Dependencies:** EPIC-10, EPIC-27-S01

### EPIC-27-S09 — Exit Clearance Orchestration

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** an exit-clearance workflow across all departments, **so that** all obligations (assets, dues, access, handover) are cleared before final settlement release.

**Description**
Orchestrates a multi-department clearance checklist (IT, Finance, Admin/Assets, Line Manager, HR, Accommodation, Library/other) with per-item status, blocking dependencies, escalation for pending items, and a gate that prevents final-settlement release until clearance is complete or exceptions are approved.

**Acceptance Criteria**

- [ ] Given a separation case, when clearance starts, then department checklist items are auto-generated and routed to owners.
- [ ] Given clearance items, when owners respond, then statuses (cleared/pending/recovery-required) are tracked with attachments.
- [ ] Given any item requiring recovery (asset/dues), when flagged, then the amount feeds deductions/recoveries.
- [ ] Given incomplete clearance, when final settlement is attempted, then release is blocked unless an exception is approved.
- [ ] Given any clearance action, when performed, then it is audited.

**Tasks**

- [ ] Backend: `exit_clearance`, `clearance_item` (department, status, recovery_amount) entities + auto-generation service.
- [ ] Backend: settlement-release gate + recovery feed.
- [ ] Frontend: clearance dashboard per case + department response screens.
- [ ] Rules/Config: configurable department checklist per country/entity.
- [ ] Alerts/Workflow: routing + pending-item escalation.
- [ ] Tests: integration (gate enforcement), unit (recovery feed).

**Covers:** 27.15
**Dependencies:** EPIC-27-S01

### EPIC-27-S10 — Final Settlement, EOSB Linkage, Leave Encashment & Recoveries

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 13
**As a** Payroll Officer, **I want** an integrated final-settlement engine combining EOSB, leave encashment, dues and recoveries, **so that** the employee is paid the correct net amount lawfully and on time.

**Description**
Builds the final-settlement engine consolidating: pending salary/proration, EOSB from EPIC-28, leave-balance encashment from EPIC-20, notice/in-lieu, and deductions/recoveries (loans, advances, asset/training recovery, notice shortfall), with maker-checker approval, statutory deduction-limit checks, WPS-consistent payout instruction and a settlement statement.

**Acceptance Criteria**

- [ ] Given a separation, when final settlement is computed, then EOSB (EPIC-28), leave encashment (EPIC-20), pending dues and recoveries are aggregated to a net amount.
- [ ] Given leave encashment, when calculated, then it uses the correct salary basis and accrued balance per country.
- [ ] Given deductions/recoveries, when applied, then they respect statutory deduction limits and require justification.
- [ ] Given maker-checker, when applied, then preparer ≠ approver and the settlement is locked on approval.
- [ ] Given an approved settlement, when released, then a WPS-consistent payout instruction and settlement statement are produced; release within the statutory window (e.g. flag if beyond 14 days of last day in UAE) is enforced.
- [ ] Given any settlement action, when performed, then it is audited.

**Tasks**

- [ ] Backend: `final_settlement` (components[], gross, deductions, net, status) + EOSB/leave/recovery aggregation services.
- [ ] Backend: maker-checker + statutory-limit validation + WPS payout instruction.
- [ ] Frontend: final-settlement worksheet + approval + statement preview.
- [ ] Rules/Config: per-country salary basis, encashment, deduction limits and release windows.
- [ ] Alerts/Workflow: maker-checker routing + release-deadline alerts.
- [ ] Tests: integration (aggregation + payout), unit (limit checks, maker-checker).

**Covers:** 27.16, 27.17, 27.18, 27.19
**Dependencies:** EPIC-28, EPIC-20, EPIC-10

### EPIC-27-S11 — Visa, Work Permit & Immigration Closure

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** visa/work-permit cancellation orchestrated as part of separation, **so that** the employee's status is closed on time to avoid overstay fines and labour bans.

**Description**
Triggers and tracks immigration closure (EPIC-29): work-permit/visa cancellation, dependent-visa impact, grace-period tracking, repatriation/air-ticket where due, and signed cancellation acknowledgement, ensuring closure timing aligns with final settlement and last working day.

**Acceptance Criteria**

- [ ] Given a separation, when finalised, then a visa/work-permit cancellation task is created and tracked to authority confirmation (EPIC-29).
- [ ] Given dependent visas, when present, then their impact and required actions are surfaced.
- [ ] Given grace-period/overstay risk, when applicable, then alerts fire (e.g. at grace-period start and before expiry) to avoid fines/bans.
- [ ] Given repatriation/air-ticket entitlement, when due, then it is included in benefits/settlement closure.
- [ ] Given any immigration-closure event, when processed, then it is audited.

**Tasks**

- [ ] Backend: immigration-closure trigger + status tracker integrating EPIC-29.
- [ ] Backend: dependent-impact + repatriation-entitlement evaluation.
- [ ] Frontend: immigration-closure tracker within separation case.
- [ ] Rules/Config: per-country cancellation steps, grace periods and repatriation rules.
- [ ] Alerts/Workflow: grace-period/overstay alerts; PRO task routing.
- [ ] Tests: integration (trigger→tracking), unit (dependent/repatriation logic).

**Covers:** 27.20
**Dependencies:** EPIC-29, EPIC-27-S01

### EPIC-27-S12 — Social Insurance & Benefits Closure

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** social-insurance and benefits closures automated at separation, **so that** GOSI/GPSSA/SIO deregistration and benefit terminations are timely and accurate.

**Description**
Orchestrates social-insurance closure (GOSI/GPSSA/SIO/PASI deregistration, final contribution, EOSB-funding alignment) and benefits closure (medical insurance termination, life/accident cover, air-ticket, housing/transport, mobile, loan settlement linkage), each tracked to confirmation and reflected in final settlement.

**Acceptance Criteria**

- [ ] Given a separation, when finalised, then a social-insurance deregistration task per country (GOSI/GPSSA/SIO) is created and tracked with final-contribution reconciliation.
- [ ] Given benefits, when closure runs, then medical insurance and other benefits are terminated effective the correct date with vendor notification.
- [ ] Given outstanding benefit-linked recoveries (e.g. loan, ticket clawback), when present, then they feed final settlement.
- [ ] Given country-specific timing, when applicable, then deregistration deadlines are enforced with alerts.
- [ ] Given any closure event, when processed, then it is audited.

**Tasks**

- [ ] Backend: social-insurance + benefits closure orchestrators integrating EPIC-13/14/15 and EPIC-22.
- [ ] Backend: final-contribution reconciliation + recovery feed.
- [ ] Frontend: closure tracker (social insurance + benefits) within case.
- [ ] Rules/Config: per-country deregistration deadlines and benefit rules.
- [ ] Alerts/Workflow: vendor notifications + deadline alerts.
- [ ] Tests: integration (deregistration tracking), unit (recovery feed).

**Covers:** 27.21, 27.22
**Dependencies:** EPIC-13, EPIC-14, EPIC-15, EPIC-22, EPIC-27-S01

### EPIC-27-S13 — IT & Data Access Closure

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**As a** System Administrator, **I want** automated IT and data-access revocation at separation, **so that** the leaver loses access on time and corporate data is protected.

**Description**
Coordinates IT/data-access closure: account disablement and access-revocation scheduling aligned to last working day/garden leave, asset/device return tracking, data-handover, and mailbox/forwarding handling, with confirmation feeding clearance and audit.

**Acceptance Criteria**

- [ ] Given a separation with a last working day, when reached (or garden leave starts), then access-revocation tasks are scheduled and tracked to confirmation.
- [ ] Given immediate-risk dismissals, when flagged, then access can be revoked immediately ahead of formalities.
- [ ] Given assets/devices, when due for return, then return status feeds exit clearance and recoveries.
- [ ] Given mailbox/data handover, when configured, then forwarding/archival actions are recorded.
- [ ] Given any IT-closure event, when processed, then it is audited.

**Tasks**

- [ ] Backend: `it_access_closure`, `asset_return` entities + scheduled revocation triggers (event bus to IT/IdP).
- [ ] Backend: immediate-revocation path + clearance/recovery feed.
- [ ] Frontend: IT-closure checklist within case.
- [ ] Rules/Config: revocation timing rules (last day vs garden leave vs immediate).
- [ ] Alerts/Workflow: revocation task routing + overdue alerts.
- [ ] Tests: integration (scheduled revocation), unit (immediate path).

**Covers:** 27.23
**Dependencies:** EPIC-27-S08, EPIC-27-S09

### EPIC-27-S14 — Handover Management & Exit Interview

**Labels:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 5
**As a** Line Manager, **I want** structured handover and exit-interview steps, **so that** knowledge/responsibilities transfer cleanly and exit feedback is captured.

**Description**
Provides a handover workflow (responsibilities, pending work, documents, contacts, successor assignment, sign-off) and a configurable exit-interview process (questionnaire, reason-for-leaving coding, attrition-driver capture, optional/voluntary, confidentiality), feeding clearance completion and ER/analytics.

**Acceptance Criteria**

- [ ] Given a separation, when handover starts, then a handover template captures responsibilities/pending items and routes to a successor for acceptance.
- [ ] Given handover sign-off, when completed, then it satisfies the manager clearance item.
- [ ] Given an exit interview, when conducted, then structured reason-for-leaving and feedback are captured and coded.
- [ ] Given exit-interview confidentiality, when configured, then sensitive feedback is access-restricted and aggregated for analytics.
- [ ] Given any handover/exit-interview event, when stored, then it is audited.

**Tasks**

- [ ] Backend: `handover` (items, successor, signoff), `exit_interview` (reason_code, responses) entities.
- [ ] Backend: clearance linkage + analytics feed.
- [ ] Frontend: handover form + exit-interview questionnaire.
- [ ] Rules/Config: configurable handover/interview templates and reason-code library.
- [ ] Alerts/Workflow: handover routing + exit-interview scheduling.
- [ ] Tests: integration (handover→clearance), unit (reason coding).

**Covers:** 27.24, 27.25
**Dependencies:** EPIC-27-S09

### EPIC-27-S15 — Death in Service

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** a sensitive death-in-service process with beneficiary settlement and benefit closures, **so that** the family receives correct entitlements with dignity and compliance.

**Description**
Handles death-in-service with elevated sensitivity: record event, manage beneficiary/heir identification and documentation, compute EOSB and any death-in-service insurance/benefit, process final settlement to the estate/beneficiaries per country/Sharia-estate rules where applicable, and run all statutory and access closures.

**Acceptance Criteria**

- [ ] Given a death-in-service event, when recorded, then the case follows a restricted, compassionate workflow with required documentation (death certificate, beneficiary proof).
- [ ] Given beneficiary/heir details, when captured, then final settlement and any death-in-service insurance are computed and directed to the correct payee per country rules.
- [ ] Given EOSB on death, when computed, then the correct (often full-rate) treatment per country is applied via EPIC-28.
- [ ] Given closures, when run, then visa/dependent, social insurance, benefits and IT access closures execute appropriately.
- [ ] Given any death-in-service action, when processed, then it is audited with restricted access.

**Tasks**

- [ ] Backend: `death_in_service` (beneficiaries, documents, insurance) entity + beneficiary-settlement service.
- [ ] Backend: EOSB/insurance computation linkage + closure orchestration.
- [ ] Frontend: restricted death-in-service workspace.
- [ ] Rules/Config: per-country beneficiary/estate and death-EOSB rules.
- [ ] Alerts/Workflow: compassionate handling routing + closure tasks.
- [ ] Tests: integration (beneficiary settlement + closures), unit (EOSB-on-death rule).

**Covers:** 27.26
**Dependencies:** EPIC-28, EPIC-27-S10, EPIC-27-S11, EPIC-27-S12

### EPIC-27-S16 — Separation Data Privacy

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** data-privacy controls over separation records, **so that** leaver data is retained, minimised and disposed lawfully.

**Description**
Implements data-privacy controls for separation: retention scheduling per record type/country, access restriction post-exit, minimisation, subject-access/correction handling, and lawful retention of records needed for EOSB disputes/labour claims, with controlled disposal/anonymisation at retention end.

**Acceptance Criteria**

- [ ] Given separation records, when stored, then retention periods per record type/country are applied.
- [ ] Given a post-exit access, when attempted, then only authorised roles access records and access is logged.
- [ ] Given retention end, when reached, then disposal/anonymisation is scheduled and audited, respecting any litigation hold.
- [ ] Given a subject-access/correction request, when received, then a controlled workflow handles it.
- [ ] Given any privacy action, when performed, then it is audited.

**Tasks**

- [ ] Backend: retention/disposal scheduler + access-restriction layer + litigation-hold guard.
- [ ] Backend: subject-access export with redaction.
- [ ] Frontend: privacy-request handler + retention view.
- [ ] Rules/Config: per-country retention periods and lawful-basis tags.
- [ ] Alerts/Workflow: retention-due alerts.
- [ ] Tests: integration (retention + hold), unit (access logging).

**Covers:** 27.27
**Dependencies:** EPIC-27-S01

### EPIC-27-S17 — Separation Audit Checklist & Risk Matrix

**Labels:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable separation audit checklist and risk matrix with red flags, **so that** I can verify exit compliance and quantify residual risk.

**Description**
Delivers an audit checklist (notice correct, clearance complete, settlement within window, EOSB accurate, visa cancelled on time, social insurance/benefits closed, IT access revoked) with pass/fail and evidence links, plus a risk register/matrix auto-flagging red flags (late settlement, overstay risk, missing clearance, deduction over limit, abandonment mishandling).

**Acceptance Criteria**

- [ ] Given the checklist, when run for a period/entity, then each item returns pass/fail/N-A with evidence and a score.
- [ ] Given the risk matrix, when populated, then risks plot on a likelihood×impact grid with residual ratings.
- [ ] Given red-flag rules, when triggered (e.g. settlement beyond statutory window, visa not cancelled), then items auto-raise to the risk register.
- [ ] Given remediation owners/dates, when assigned, then overdue items are escalated.
- [ ] Given checklist/risk changes, when saved, then they are audited.

**Tasks**

- [ ] Backend: `separation_audit_checklist`, `separation_audit_result`, `separation_risk_register` + red-flag engine.
- [ ] Backend: scoring/residual-rating service.
- [ ] Frontend: checklist runner + risk heat grid.
- [ ] Rules/Config: configurable items, red-flag thresholds, risk scales per country.
- [ ] Alerts/Workflow: overdue-remediation escalation.
- [ ] Tests: unit (red flags/scoring), integration (checklist→register).

**Covers:** 27.28, 27.30
**Dependencies:** EPIC-27-S10, EPIC-27-S11

### EPIC-27-S18 — Separation KPIs, Dashboard & Automation Design

**Labels:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 8
**As an** Executive / Leadership user, **I want** a separation dashboard with KPIs and the automation design, **so that** I have visibility of attrition, settlement timeliness and closure risk.

**Description**
Builds separation analytics (KPIs: attrition rate by type, average time-to-settlement, % settled within statutory window, visa-cancellation timeliness, clearance cycle time, overstay/penalty incidents, EOSB dispute rate, voluntary vs involuntary mix) and an interactive dashboard with country/entity drill-down, underpinned by an event-driven automation blueprint (case orchestration, gates, alerts, escalation).

**Acceptance Criteria**

- [ ] Given separation data, when the dashboard loads, then KPIs render with country/entity/period filters and drill-down.
- [ ] Given late-settlement/overstay/dispute metrics, when present, then they are highlighted with trends.
- [ ] Given the automation design, when configured, then case orchestration, gates and escalations run on events from the event bus.
- [ ] Given RBAC, when a viewer lacks rights, then individual case detail is masked while aggregate KPIs remain.
- [ ] Given KPI computation, when run, then figures reconcile with the separation register.

**Tasks**

- [ ] Backend: KPI aggregation + materialised views; automation rules on event bus.
- [ ] Backend: dashboard APIs with RBAC masking.
- [ ] Frontend: separation dashboard (KPI cards, trends, drill-down).
- [ ] Rules/Config: KPI thresholds and automation triggers.
- [ ] Alerts/Workflow: dashboard alerts for breaches/spikes.
- [ ] Tests: integration (KPI reconciliation), e2e (filters + masking).

**Covers:** 27.29, 27.31, 27.32
**Dependencies:** EPIC-27-S10, EPIC-27-S11

### EPIC-27-S19 — Monthly Separation Compliance Pack

**Labels:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** an auto-generated monthly separation compliance pack, **so that** management and auditors receive a certified separation summary.

**Description**
Generates a periodic pack consolidating separations by type, settlement timeliness, EOSB summary, visa-cancellation and social-insurance/benefits closure status, clearance completion, overstay/penalty incidents, audit-checklist results and risk-matrix highlights, with management certification and export (PDF/Excel).

**Acceptance Criteria**

- [ ] Given period close, when generated, then all sections populate from live data.
- [ ] Given the pack, when reviewed, then a manager certifies it with e-signature and timestamp.
- [ ] Given export, when requested, then PDF/Excel outputs are stored in the document store.
- [ ] Given sensitive content, when packaged, then aggregate views protect individual identities per privacy rules.
- [ ] Given generation/certification, when completed, then it is audited.

**Tasks**

- [ ] Backend: pack assembler + certification entity + export service + monthly scheduler.
- [ ] Frontend: pack preview and certification screen.
- [ ] Rules/Config: configurable sections per country/entity.
- [ ] Alerts/Workflow: certification reminder + distribution.
- [ ] Tests: integration (assembly+export), unit (certification audit).

**Covers:** 27.33
**Dependencies:** EPIC-27-S17, EPIC-27-S18

### EPIC-27-S20 — Sample Separation Request/Approval Form, Exit Clearance & Final Settlement Checklists

**Labels:** `user-story`, `separation` · **Priority:** Should · **Estimate:** 5
**As an** HR Admin, **I want** configurable separation request/approval, exit-clearance and final-settlement checklist artefacts, **so that** separations are captured and verified consistently and exported as standard templates.

**Description**
Delivers three configurable digital artefacts: a separation request/approval form (employee, type, last day, reason, approvals) that creates/updates a separation case; an exit-clearance checklist (department items, status, recoveries); and a final-settlement checklist (EOSB, leave encashment, dues, deductions, statutory limits, approval)—each filterable and exportable as branded templates.

**Acceptance Criteria**

- [ ] Given the separation request form, when submitted, then it creates/updates a separation case with type-driven approvals.
- [ ] Given the exit-clearance checklist, when used, then it reflects live department clearance status and recoveries.
- [ ] Given the final-settlement checklist, when generated, then it lists all components with statutory-limit checks and approval sign-off.
- [ ] Given export, when requested, then branded PDF/Excel templates are produced.
- [ ] Given any artefact change, when saved, then versioning and audit apply.

**Tasks**

- [ ] Backend: form-definition entities + render/validate services linked to case/clearance/settlement.
- [ ] Frontend: form builder + request form, clearance checklist, settlement checklist renderers.
- [ ] Rules/Config: configurable fields/items per country/entity.
- [ ] Alerts/Workflow: submission/approval routing.
- [ ] Tests: unit (validation), integration (form→case/clearance/settlement + export).

**Covers:** 27.34, 27.35, 27.36
**Dependencies:** EPIC-27-S02, EPIC-27-S09, EPIC-27-S10

### EPIC-27-S21 — Key Takeaways & Separation Knowledge Reference

**Labels:** `user-story`, `separation` · **Priority:** Could · **Estimate:** 1
**As an** HR Admin, **I want** an in-product Key Takeaways/knowledge reference for the separation module, **so that** users follow exit best practices and country rules at point of use.

**Description**
Surfaces concise key takeaways and contextual guidance (settlement timelines, notice/EOSB rules, visa-cancellation deadlines, country nuances, do/don't lists) within the separation module as version-controlled help content linked to relevant screens.

**Acceptance Criteria**

- [ ] Given a module screen, when help is opened, then relevant takeaways/guidance show.
- [ ] Given content updates, when published, then versioning is maintained.
- [ ] Given a country context, when set, then country-specific notes surface.
- [ ] Given help content, when displayed, then it links to the related policy/section.
- [ ] Given content changes, when saved, then they are audited.

**Tasks**

- [ ] Backend: knowledge-content entity (versioned) + screen mapping.
- [ ] Frontend: contextual help panel.
- [ ] Rules/Config: country-specific note configuration.
- [ ] Tests: unit (versioning), integration (screen mapping).

**Covers:** 27.37
**Dependencies:** EPIC-27-S01
