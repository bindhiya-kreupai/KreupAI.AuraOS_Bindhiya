# EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> **Module:** Immigration · **Labels:** `epic`, `gcc-compliance`, `immigration`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a complete immigration-exit compliance engine in AuraOS that drives every visa/work-permit closure scenario across the GCC — cancellation, transfer/release to a new sponsor, absconding/abandonment reporting, repatriation and final exit — through a governed PRO workflow with authority-portal evidence (MOHRE, ICP, GDRFA, Qiwa/MHRSD, LMRA, MOI/PAM, PACI). It manages grace periods and dependent-visa impact, links exit to final settlement, payroll, benefits and social-insurance closure, and produces the exit checklist, grace-period and PRO action registers, dashboard, KPIs and monthly compliance pack. The outcome is that no employee is separated without their immigration footprint correctly and provably closed.

## Business Value

Failure to cancel a visa/work permit on time, mishandling a transfer vs cancellation, missing a grace period, or not reporting absconding correctly exposes the sponsor to fines, accumulating overstay penalties, blocked future quotas, blacklisting, and continuing liability for an employee who has left. Automating exit scenarios, grace-period tracking, dependent-visa cascades, PRO task management and authority-portal evidence removes manual gaps, protects the establishment's immigration standing and quota, ensures the employer's legal duties (repatriation, air ticket, absconding reports) are met, and gives Compliance an audit-ready trail for every exit.

## Requirements Covered (handbook sections)

- 29.1 Introduction
- 29.2 Objectives of Immigration Exit Compliance
- 29.3 Immigration Exit Governance Framework
- 29.4 Immigration Exit Policy
- 29.5 Common Immigration Exit Scenarios
- 29.6 Country-Wise Immigration Exit Overview
- 29.7 Visa Cancellation vs Employee Transfer
- 29.8 Final Settlement Linkage
- 29.9 Grace Period Management
- 29.10 Dependent Visa Impact
- 29.11 Repatriation and Air Ticket
- 29.12 Absconding / Abandonment Immigration Cases
- 29.13 Immigration Exit and Payroll
- 29.14 Immigration Exit and Benefits Closure
- 29.15 Immigration Exit and Social Insurance
- 29.16 Employee Communication
- 29.17 PRO Workflow
- 29.18 Authority Portal Evidence
- 29.19 Immigration Exit Audit Checklist
- 29.20 Immigration Exit KPIs
- 29.21 Immigration Exit Risk Matrix
- 29.22 HRMS Immigration Exit Automation Design
- 29.23 Immigration Exit Dashboard
- 29.24 Monthly Immigration Exit Compliance Pack
- 29.25 Sample Immigration Exit Checklist
- 29.26 Sample Grace Period Register
- 29.27 Sample PRO Action Register
- 29.28 Key Takeaways

## Out of Scope

- Visa/work-permit issuance, renewal and active-employment immigration management, owned by EPIC-07 — this epic handles the exit/closure phase only.
- EOSB calculation, owned by EPIC-28; final-settlement orchestration and clearance, owned by EPIC-27 — this epic links to them.
- Social-insurance de-registration mechanics (GOSI/GPSSA/SIO), owned by the social-insurance epics — this epic triggers and evidences the closure interaction.
- Live two-way API integration with authority portals (separate connectors epic); this epic produces portal-ready task packs, captures uploaded evidence, and runs a guided/manual reconciliation.

## Dependencies

- EPIC-07 (Immigration & Work Authorization — active visa/permit records, document register)
- EPIC-27 (Termination and Separation Compliance — separation trigger, exit clearance, final settlement)
- EPIC-28 (End-of-Service Benefits — settlement figure feeding payout sequencing)
- EPIC-22 (Employee Benefits — air-ticket/benefit closure)
- EPIC-13 / EPIC-14 / EPIC-15 (Social-insurance de-registration)

## Epic Definition of Done

- [ ] Immigration-exit governance, policy and scenarios are configurable; each scenario drives the correct PRO task set per country.
- [ ] Visa cancellation vs transfer, grace periods, dependent-visa cascade, repatriation/air-ticket and absconding/abandonment reporting are fully modelled with alerts.
- [ ] Exit links to final settlement, payroll, benefits closure and social-insurance de-registration with sequencing controls.
- [ ] PRO workflow with task ownership/SLA and authority-portal evidence capture are live and audited.
- [ ] Exit checklist, grace-period register, PRO action register, dashboard, KPIs, audit checklist and risk matrix are delivered with RBAC.
- [ ] Monthly immigration-exit compliance pack and certificate are produced with sign-off.
- [ ] Every exit action and evidence upload is captured in the audit trail.

---

## User Stories

### EPIC-29-S01 — Immigration Exit Foundation, Governance, Policy & Objectives

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** the immigration-exit domain, governance framework, policy and objectives modelled as configurable reference data, **so that** AuraOS applies one consistent, governed exit-compliance framework across all GCC entities.

**Description**
Establishes the immigration-exit module: objectives, the governance framework (PRO/HR/Compliance roles, approval authority, segregation of duties), and a configurable Immigration Exit Policy (timelines, mandatory steps, country addendums, escalation). Provides inline guidance and anchors all scenario and PRO-workflow stories.

**Acceptance Criteria**

- [ ] Given the module, when opened, then objectives, governance roles and authority matrix are configurable and shown inline.
- [ ] Given the exit policy, when configured, then mandatory steps, timelines, country addendums and escalation rules are captured and versioned.
- [ ] Given governance roles, when set, then PRO/HR/Compliance responsibilities and SoD are enforceable downstream.
- [ ] Given guidance content (29.1–29.4), then it is editable per entity without code, versioned and EN/AR.
- [ ] Given any governance/policy change, then it is versioned with effective date and audited.

**Tasks**

- [ ] Backend: `immig_exit_governance` + `immig_exit_policy` entities (mandatorySteps, timelines, countryAddendums, escalation)
- [ ] Backend: guidance content store keyed by section with locale/version
- [ ] Frontend: governance + policy configuration screens
- [ ] Rules/Config: seed exit policy and governance roles
- [ ] Tests: unit tests for policy versioning and SoD evaluation

**Covers:** 29.1, 29.2, 29.3, 29.4
**Dependencies:** EPIC-07

### EPIC-29-S02 — Exit Scenarios & Country-Wise Exit Rule Catalogue

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** the common immigration-exit scenarios and a per-country exit rule catalogue modelled as configurable data, **so that** each separation triggers the correct sequence of immigration steps for the right jurisdiction.

**Description**
Defines the canonical exit scenarios (normal cancellation, transfer/release to new sponsor, end of fixed-term, absconding/abandonment, repatriation/final exit, retirement, death in service) and a country exit rule catalogue describing each GCC jurisdiction's closure mechanics, authorities and statutory windows (UAE MOHRE work-permit + ICP/GDRFA residence cancellation; KSA Qiwa/MHRSD exit/transfer + Absher final-exit; Bahrain LMRA permit cancellation + NPRA; Qatar MOI/ADLSA; Oman ROP/MOL; Kuwait PAM/MOI). Each scenario maps to a task template per country, consumed by the PRO workflow.

**Acceptance Criteria**

- [ ] Given the scenario set, when configured, then each scenario maps to a country-specific task template with authorities and statutory windows.
- [ ] Given a separation type from EPIC-27, when an exit is created, then the matching scenario is selected (or chosen) and the right country task set instantiated.
- [ ] Given the country catalogue, then each of the six GCC countries has an exit profile with authorities, document requirements and timelines.
- [ ] Given an effective-dated rule, when an exit occurs, then the rule version in force is used; a new country/rule added in config is consumed with no code change.
- [ ] Given the country-wise overview (29.6), then a six-country comparison view is available; any change is audited.

**Tasks**

- [ ] Backend: `immig_exit_scenario` + `immig_exit_country_profile` (countryCode, authorities[], requiredDocs[], statutoryWindows, taskTemplateRef, effectiveFrom)
- [ ] Backend: scenario-to-task-template resolver by country + date
- [ ] Frontend: scenario + country-profile config screens; six-country comparison view
- [ ] Rules/Config: seed UAE/KSA/Bahrain/Qatar/Oman/Kuwait exit profiles and task templates
- [ ] Tests: unit tests for scenario/country resolution

**Covers:** 29.5, 29.6
**Dependencies:** EPIC-29-S01, EPIC-27

### EPIC-29-S03 — Immigration Exit Case Orchestration

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** an immigration-exit case auto-created on separation that instantiates the correct task set and tracks closure end-to-end, **so that** every leaver's immigration closure is driven, visible and complete.

**Description**
Creates an exit case when a separation is initiated, linking the employee's active visa/work-permit/residence records (from EPIC-07), selecting the scenario/country profile, instantiating the task template (PRO tasks, document needs, authority steps), and tracking overall closure status with a completeness gate. The case is the spine that all other exit stories (grace period, dependents, repatriation, payroll/benefits/SI closure, evidence) attach to.

**Acceptance Criteria**

- [ ] Given a separation initiated in EPIC-27, when an exit case is created, then the employee's active immigration records are linked and the scenario/country task set instantiated.
- [ ] Given the case, when tasks complete, then overall closure status advances and an immigration-closure completeness score is shown.
- [ ] Given an incomplete case, when separation final clearance is attempted, then the immigration items block clearance until closed or explicitly waived with reason.
- [ ] Given a change in scenario (e.g. normal exit reclassified as absconding), then the task set re-instantiates appropriately.
- [ ] Given any case action, then it is audited; RBAC restricts case management to PRO / HR Admin.

**Tasks**

- [ ] Backend: `immig_exit_case` entity (employeeId, scenario, countryProfile, linkedDocs[], status, completenessScore)
- [ ] Backend: consumer on `employee.separationInitiated` instantiating case + tasks
- [ ] Backend: completeness gate feeding EPIC-27 clearance
- [ ] Frontend: exit-case detail with task list and completeness
- [ ] Alerts/Workflow: clearance block until immigration closed/waived
- [ ] Tests: e2e separation→exit-case→task instantiation; reclassification

**Covers:** 29.5 (orchestration aspect)
**Dependencies:** EPIC-29-S02, EPIC-07, EPIC-27

### EPIC-29-S04 — Visa Cancellation vs Employee Transfer

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** the exit case to distinguish and correctly handle visa/permit cancellation versus transfer/release to a new sponsor, **so that** the right authority steps, consents and evidence are applied for each path.

**Description**
Branches the exit path: full cancellation (work-permit cancellation + residence cancellation, exit/grace handling) versus transfer/release (sponsorship transfer to a new employer, e.g. UAE work-permit transfer, KSA Qiwa transfer, Bahrain LMRA transfer) where the residence may continue under the new sponsor. Captures required consents/NOCs, ban implications, and produces the correct task set and evidence requirements for each path with country-specific rules.

**Acceptance Criteria**

- [ ] Given an exit case, when the path is set to cancellation or transfer, then the appropriate country-specific task set and document requirements are applied.
- [ ] Given a transfer, when processed, then transfer consent/NOC, new-sponsor details and any transfer eligibility/ban rules are captured and validated.
- [ ] Given a cancellation, when processed, then work-permit and residence cancellation steps and any labour-ban implications are tracked.
- [ ] Given the chosen path, then dependent-visa and grace-period handling (S05/S06) adjust accordingly.
- [ ] Given any path action, then it is audited with the authority and reference captured.

**Tasks**

- [ ] Backend: cancellation vs transfer branch on `immig_exit_case` with path-specific task sets
- [ ] Backend: transfer consent/NOC + ban-rule validation per country
- [ ] Frontend: path selector + cancellation/transfer detail panels
- [ ] Rules/Config: per-country cancellation vs transfer rules, ban implications
- [ ] Tests: unit tests for both paths across countries

**Covers:** 29.7
**Dependencies:** EPIC-29-S03

### EPIC-29-S05 — Grace Period Management & Register

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As a** PRO / Immigration Officer, **I want** post-cancellation grace periods tracked with countdown alerts and a grace-period register, **so that** overstay penalties are avoided and the employee's lawful stay window is managed.

**Description**
On cancellation, AuraOS computes the statutory grace period per country (e.g. configurable days after residence cancellation before overstay/fines begin), starts a countdown with alerts, tracks the employee's status within the window (departed / transferred / extended / overstayed), and maintains a configurable Grace Period Register. Overstay risk is escalated; the register feeds the dashboard and monthly pack.

**Acceptance Criteria**

- [ ] Given a cancellation, when residence is cancelled, then the country grace period is computed and a countdown started from the cancellation date.
- [ ] Given the countdown, when within configurable thresholds (e.g. 15/7/1 days remaining), then alerts fire to PRO and the employee/HR.
- [ ] Given the window, when the employee departs/transfers/extends, then status is updated; if it lapses, then "overstay risk" is flagged and escalated.
- [ ] Given the Grace Period Register, then it lists each case with cancellation date, grace days, days remaining, status and owner, and exports.
- [ ] Given any grace-period change, then it is audited.

**Tasks**

- [ ] Backend: `immig_grace_period` entity (caseId, cancellationDate, graceDays, dueDate, status) + countdown service
- [ ] Backend: overstay-risk detector + escalation
- [ ] Frontend: grace-period register grid with filters/export
- [ ] Rules/Config: per-country grace-period days + alert thresholds
- [ ] Alerts/Workflow: 15/7/1-day countdown alerts + overstay escalation
- [ ] Tests: unit tests for countdown, status transitions, overstay flag

**Covers:** 29.9, 29.26
**Dependencies:** EPIC-29-S04

### EPIC-29-S06 — Dependent Visa Impact Cascade

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As a** PRO / Immigration Officer, **I want** the impact on dependent visas handled when the principal's visa is cancelled or transferred, **so that** sponsored family members are cancelled/transferred in the correct sequence and not left in overstay.

**Description**
Links the principal employee's exit to their dependents' visas (from EPIC-07): on cancellation, dependents must typically be cancelled first/in sequence; on transfer, dependents may move under the new sponsor or require separate handling. AuraOS lists all linked dependents, enforces the correct cancellation/transfer sequence, computes dependent grace periods, and tracks each dependent's closure with its own evidence.

**Acceptance Criteria**

- [ ] Given a principal exit, when the case is created, then all linked dependents and their visa records are listed.
- [ ] Given a cancellation, when processed, then the required dependent-first/sequenced cancellation is enforced and tracked per dependent.
- [ ] Given a transfer, when processed, then dependents are flagged for move-under-new-sponsor or separate handling per the configured rule.
- [ ] Given dependents, then each has its own grace period and closure status feeding the register and dashboard.
- [ ] Given any dependent action, then it is audited.

**Tasks**

- [ ] Backend: dependent linkage on `immig_exit_case` + per-dependent closure tracking
- [ ] Backend: sequencing enforcement (dependents before/with principal per rule)
- [ ] Frontend: dependents panel with per-dependent status and grace period
- [ ] Rules/Config: per-country dependent cancellation/transfer sequencing
- [ ] Tests: unit tests for sequencing and per-dependent grace periods

**Covers:** 29.10
**Dependencies:** EPIC-29-S04, EPIC-29-S05, EPIC-07

### EPIC-29-S07 — Repatriation & Air Ticket

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** the employer's repatriation and air-ticket obligation managed within the exit case, **so that** the statutory/contractual return-ticket duty is met, costed and evidenced.

**Description**
Manages the repatriation duty: determines air-ticket entitlement per country/contract/policy and separation type (e.g. employer-provided return ticket unless the employee resigns to join another local employer), captures destination, ticket class, booking/cost or cash-in-lieu, links to benefits closure, and records proof of repatriation. Feeds the final settlement and benefits-closure stories.

**Acceptance Criteria**

- [ ] Given an exit case, when evaluated, then air-ticket/repatriation entitlement is determined per country/contract/policy and separation type.
- [ ] Given entitlement, when actioned, then destination, class, booking reference or cash-in-lieu amount and cost are captured.
- [ ] Given no entitlement (e.g. transfer to local employer), then it is recorded with reason and no ticket cost is raised.
- [ ] Given repatriation, then proof (boarding/confirmation) can be attached and the obligation marked complete.
- [ ] Given the ticket cost or cash-in-lieu, then it is passed to final settlement/payroll and audited.

**Tasks**

- [ ] Backend: `immig_repatriation` entity (caseId, entitlement, destination, ticketRef, cost/cashInLieu, proofRef, status)
- [ ] Backend: entitlement rule evaluation + hand-off to final settlement/benefits
- [ ] Frontend: repatriation panel with entitlement, booking and proof
- [ ] Rules/Config: per-country/contract air-ticket entitlement rules
- [ ] Tests: unit tests for entitlement determination and settlement hand-off

**Covers:** 29.11
**Dependencies:** EPIC-29-S03, EPIC-22, EPIC-28

### EPIC-29-S08 — Absconding / Abandonment Immigration Cases

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** absconding/abandonment exits handled with the correct authority reporting and timelines, **so that** the employer reports per law, limits liability, and the case is fully evidenced.

**Description**
Handles the absconding/abandonment path: triggered from EPIC-27 unauthorized-absence, it enforces the statutory waiting/notice period before an absconding report can be filed, generates the authority report task set per country (e.g. UAE MOHRE absconding/work-abandonment report, KSA Qiwa/MOI, Bahrain LMRA, Qatar/Kuwait equivalents), captures the report reference and any withdrawal if the employee returns, and links to payroll stop and benefits/SI closure. Strong controls prevent premature or unsupported reports.

**Acceptance Criteria**

- [ ] Given an unauthorized absence from EPIC-27, when it reaches the configured threshold, then an absconding case can be raised — and is blocked before the statutory waiting period elapses.
- [ ] Given the report, when filed, then the country-specific authority report task set is generated and the report reference captured as evidence.
- [ ] Given the employee returns within the window, then the absconding report can be withdrawn with reason and the case reclassified.
- [ ] Given an absconding case, then payroll is flagged to stop and benefits/SI closure are triggered.
- [ ] Given any absconding action, then it is audited; RBAC restricts filing to PRO / HR Manager.

**Tasks**

- [ ] Backend: `immig_absconding_case` entity (caseId, absenceFrom, thresholdMet, reportRef, withdrawal, status)
- [ ] Backend: statutory-waiting-period guard + country report task generator
- [ ] Backend: payroll-stop + benefits/SI-closure triggers
- [ ] Frontend: absconding case panel with report and withdrawal
- [ ] Rules/Config: per-country absconding thresholds, waiting periods, report requirements
- [ ] Alerts/Workflow: escalation + block on premature filing
- [ ] Tests: unit tests for threshold/waiting-period guard and withdrawal

**Covers:** 29.12
**Dependencies:** EPIC-29-S03, EPIC-27

### EPIC-29-S09 — Immigration Exit ↔ Final Settlement & Payroll Linkage

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** immigration-exit events linked to final settlement and to drive payroll stop/hold and last-payment sequencing, **so that** salary stops at the right point and the final settlement/payout is released only when immigration closure permits.

**Description**
Connects the exit case to final settlement (EPIC-27/EPIC-28) and payroll: sets the salary-stop date from the last working day / absconding date, links the immigration-closure status to the final-settlement gate so the settlement and final payout are held until required immigration steps (cancellation/transfer/grace) reach the configured sequencing checkpoint, and ensures any recoveries (e.g. unreturned ticket, immigration costs) flow to final settlement. Prevents both continued salary for departed employees and premature final settlement/payout before closure.

**Acceptance Criteria**

- [ ] Given an exit, when the last working/absconding date is set, then payroll salary-stop is applied from that date.
- [ ] Given the final-settlement gate, when configured, then the settlement/final payout is held until the required immigration checkpoint is reached or explicitly overridden with reason.
- [ ] Given an absconding case, then salary is stopped and flagged immediately.
- [ ] Given immigration-related recoveries, then they are passed to final settlement.
- [ ] Given any final-settlement/payroll-linkage action, then it is audited.

**Tasks**

- [ ] Backend: immigration-closure → final-settlement gate + payroll salary-stop + final-payment-hold based on exit checkpoints
- [ ] Backend: recovery hand-off to final settlement
- [ ] Frontend: final-settlement/payroll-linkage panel within the exit case
- [ ] Rules/Config: final-settlement sequencing checkpoints per scenario/country
- [ ] Alerts/Workflow: hold/override gate
- [ ] Tests: integration tests for stop date, settlement gate, hold and override

**Covers:** 29.8, 29.13
**Dependencies:** EPIC-29-S03, EPIC-29-S08, EPIC-27, EPIC-28, EPIC-10

### EPIC-29-S10 — Immigration Exit ↔ Benefits Closure

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** benefits closed as part of the immigration exit (medical insurance, accommodation, allowances, dependents' cover), **so that** no benefit continues after departure and closures are evidenced and costed.

**Description**
Triggers benefits closure from the exit case: cancel medical insurance (principal + dependents) effective from the correct date, vacate accommodation, stop benefit allowances, recover assets, and align with the air-ticket/repatriation handling. Captures closure confirmations from benefit vendors/EPIC-22 and ensures any benefit-related recoveries flow to final settlement.

**Acceptance Criteria**

- [ ] Given an exit, when closure runs, then medical insurance (principal + dependents) is cancelled effective from the configured date and confirmation captured.
- [ ] Given accommodation/allowances/assets, then each is closed/recovered with status tracked.
- [ ] Given a transfer (not full exit), then benefit closures adjust per the configured rule (some may continue under new sponsor handover).
- [ ] Given benefit recoveries, then they are passed to final settlement.
- [ ] Given any benefits-closure action, then it is audited and feeds the exit completeness score.

**Tasks**

- [ ] Backend: benefits-closure trigger consuming EPIC-22 (insurance, accommodation, allowances, assets)
- [ ] Backend: recovery hand-off to final settlement
- [ ] Frontend: benefits-closure panel within the exit case
- [ ] Rules/Config: effective-date and transfer-vs-cancel closure rules
- [ ] Tests: unit tests for closure dates and recovery hand-off

**Covers:** 29.14
**Dependencies:** EPIC-29-S03, EPIC-29-S07, EPIC-22

### EPIC-29-S11 — Immigration Exit ↔ Social Insurance Closure

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** social-insurance de-registration triggered and reconciled as part of the immigration exit, **so that** GOSI/GPSSA/SIO records close in step with visa/permit closure and no contributions continue post-exit.

**Description**
Aligns immigration exit with social-insurance closure: triggers de-registration in the relevant scheme (GOSI/GPSSA/SIO) from the leaving date, reconciles that immigration cancellation and SI de-registration both occur (flagging mismatches such as cancelled-visa-but-still-in-GOSI), and surfaces the funded-gratuity/pension closure for EOSB. Ensures the two closures cannot drift apart.

**Acceptance Criteria**

- [ ] Given an exit, when initiated, then social-insurance de-registration is triggered from the leaving date in the relevant scheme.
- [ ] Given both processes, when reconciled, then mismatches (visa cancelled but SI active, or vice versa) are flagged and escalated.
- [ ] Given a transfer, then SI handling follows the configured transfer rule rather than full de-registration.
- [ ] Given closure, then the SI funded/pension status is exposed to EOSB.
- [ ] Given any SI-closure action, then it is audited and feeds the completeness score.

**Tasks**

- [ ] Backend: SI de-registration trigger + immigration↔SI reconciliation
- [ ] Backend: mismatch detection + escalation; expose SI status to EOSB
- [ ] Frontend: SI-closure panel within the exit case
- [ ] Rules/Config: scheme selection and transfer-vs-deregister rules
- [ ] Tests: unit tests for trigger, reconciliation and mismatch flag

**Covers:** 29.15
**Dependencies:** EPIC-29-S03, EPIC-13, EPIC-14, EPIC-15, EPIC-28

### EPIC-29-S12 — Employee Communication

**Labels:** `user-story`, `immigration` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** the leaver kept informed of their immigration-exit steps, grace period and required actions, **so that** they cooperate, depart/transfer in time and overstay is avoided.

**Description**
Drives structured, templated communication to the employee (and dependents where relevant) through the exit: cancellation/transfer status, grace-period countdown, documents needed (passport submission, NOC), repatriation/ticket details, and final-settlement dependency. Communications are configurable, bilingual, logged as evidence, and tied to the case milestones.

**Acceptance Criteria**

- [ ] Given an exit milestone (cancellation, grace start, document request, ticket booked), when reached, then the configured communication is sent to the employee/dependents.
- [ ] Given grace-period thresholds, when hit, then countdown reminders are sent to the employee.
- [ ] Given each communication, then it is logged against the case as evidence with timestamp.
- [ ] Given templates, when configured, then content is editable per entity and EN/AR.
- [ ] Given employee self-service, then the leaver can view their exit status and required actions.

**Tasks**

- [ ] Backend: communication templates + milestone-triggered dispatch logged to case
- [ ] Frontend: employee self-service exit-status view + HR comms log
- [ ] Rules/Config: per-entity EN/AR communication templates
- [ ] Alerts/Workflow: milestone- and grace-threshold-triggered messages
- [ ] Tests: unit tests for milestone triggers and logging

**Covers:** 29.16
**Dependencies:** EPIC-29-S03, EPIC-29-S05

### EPIC-29-S13 — PRO Workflow & PRO Action Register

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** a PRO task workflow with ownership, SLAs and a PRO Action Register, **so that** every government-relations step in an exit is assigned, tracked to deadline and evidenced.

**Description**
Provides the PRO workflow engine for exits: the scenario/country task template generates discrete PRO tasks (e.g. submit cancellation, collect cancellation paper, file transfer, book ticket, file absconding report), each with owner, SLA, dependency order and required evidence. A configurable PRO Action Register lists all tasks across cases with status, ageing, owner and authority reference, driving the worklist, dashboard and monthly pack.

**Acceptance Criteria**

- [ ] Given an exit case, when instantiated, then PRO tasks are generated from the country template with owner, SLA, dependency order and evidence requirement.
- [ ] Given a task, when worked, then status, completion date, authority reference and evidence are captured; dependent tasks unlock in order.
- [ ] Given an overdue PRO task, then it is flagged and escalated to the PRO supervisor / HR Manager.
- [ ] Given the PRO Action Register, then it lists tasks across all cases with filters (status, country, owner, ageing) and exports.
- [ ] Given any PRO task action, then it is audited; RBAC restricts task completion to PRO roles.

**Tasks**

- [ ] Backend: `immig_pro_task` + `immig_pro_action_register` entities (caseId, taskCode, owner, sla, dependsOn[], status, authorityRef, evidenceRef)
- [ ] Backend: dependency-ordered task engine + SLA/escalation
- [ ] Frontend: PRO worklist + PRO Action Register grid with filters/export
- [ ] Alerts/Workflow: SLA-breach escalation
- [ ] Tests: integration tests for dependency ordering and SLA escalation

**Covers:** 29.17, 29.27
**Dependencies:** EPIC-29-S03

### EPIC-29-S14 — Authority Portal Evidence Capture

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** authority-portal evidence captured and linked to each exit step, **so that** every cancellation, transfer, grace and absconding action is provable against MOHRE/ICP/GDRFA/Qiwa/LMRA/MOI records.

**Description**
Captures and validates authority evidence per exit step: cancellation papers, transfer confirmations, final-exit/exit-permit records, absconding report references, and portal screenshots/PDFs from MOHRE, ICP, GDRFA, Qiwa/MHRSD, LMRA, MOI/PAM, PACI. Evidence is tagged to the case/task, format/expiry-validated where applicable, stored immutably in the document store, and required to close the relevant task. Feeds the audit checklist and monthly pack.

**Acceptance Criteria**

- [ ] Given an exit step requiring evidence, when completed, then the authority reference and document are captured and tagged to the case/task.
- [ ] Given evidence, when uploaded, then type/format is validated and it is stored immutably with metadata (authority, date, reference).
- [ ] Given a task needing evidence, when evidence is missing, then the task cannot be closed.
- [ ] Given evidence, then it is retrievable for audit and included in the monthly pack.
- [ ] Given any evidence upload, then it is audited.

**Tasks**

- [ ] Backend: `immig_exit_evidence` entity (caseId, taskId, authority, refNumber, docRef, validatedAt) + immutable store link
- [ ] Backend: evidence-required gate on task closure + format validation
- [ ] Frontend: evidence upload/preview per task with authority tagging
- [ ] Rules/Config: per-authority evidence requirements
- [ ] Tests: unit tests for required-evidence gate and validation

**Covers:** 29.18
**Dependencies:** EPIC-29-S13

### EPIC-29-S15 — Immigration Exit Audit Checklist & Risk Matrix

**Labels:** `user-story`, `immigration` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable immigration-exit audit checklist and risk matrix with red-flag detection, **so that** I can verify exit compliance and track risks to closure.

**Description**
Provides a configurable exit audit checklist (cancellation/transfer correctness, grace-period adherence, dependent-visa closure, repatriation completion, absconding reporting timeliness, payroll/benefits/SI closure, PRO task completion, evidence completeness) and a risk matrix seeded with common exit risks (overstay penalties, missed cancellation, premature/missed absconding report, dependent left in overstay, SI-immigration mismatch, missing evidence). System red-flags auto-create findings; risks tracked with likelihood/impact/owner/mitigation and a heatmap.

**Acceptance Criteria**

- [ ] Given the checklist, when run for a case/period, then each item is scored Pass/Fail/NA with evidence links.
- [ ] Given system red-flags (overstay risk, evidence missing, SI mismatch, overdue PRO task), then they auto-create findings.
- [ ] Given the risk matrix, then each risk has likelihood, impact, score, owner, mitigation, with a heatmap.
- [ ] Given a failed item, then a corrective action can be raised and tracked to closure.
- [ ] Given RBAC, only Internal Auditor / Compliance Officer may edit templates and risks.

**Tasks**

- [ ] Backend: `immig_exit_audit_template` + `immig_exit_audit_result` + `immig_exit_risk` entities
- [ ] Backend: red-flag-to-finding generator
- [ ] Frontend: checklist runner + risk heatmap
- [ ] Alerts/Workflow: corrective-action raise and reminders
- [ ] Tests: unit tests for scoring and auto-findings

**Covers:** 29.19, 29.21
**Dependencies:** EPIC-29-S05, EPIC-29-S08, EPIC-29-S13, EPIC-29-S14

### EPIC-29-S16 — Immigration Exit KPIs & Dashboard

**Labels:** `user-story`, `immigration` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership user, **I want** an immigration-exit KPI dashboard, **so that** I can see closure timeliness, overstay risk, absconding cases and PRO performance at a glance.

**Description**
Delivers exit KPIs (average cancellation turnaround, % cancellations within statutory window, grace-period overstay count/risk, dependent-closure completeness, absconding cases raised/withdrawn, repatriation completion %, PRO SLA adherence, evidence-completeness %, immigration-vs-SI mismatch count) and a role-based dashboard with trend charts and drill-down, filterable by entity, country, scenario and period.

**Acceptance Criteria**

- [ ] Given exit data, when the dashboard loads, then KPIs render with value, target and trend.
- [ ] Given filters (entity, country, scenario, period), when applied, then tiles and charts update consistently.
- [ ] Given a KPI breaching target (e.g. overstay risk, cancellation turnaround), then it is red with drill-down to cases.
- [ ] Given RBAC, Executives see summary/risk tiles; PRO/Compliance see operational drill-downs.
- [ ] Given export, then KPI snapshots export for the monthly pack.

**Tasks**

- [ ] Backend: KPI aggregation service + materialized views over cases/tasks/grace/evidence
- [ ] Backend: KPI definition config (target, formula, direction)
- [ ] Frontend: exit dashboard with tiles, charts, drill-down, filters
- [ ] Rules/Config: KPI targets per entity
- [ ] Tests: unit tests for KPI calculations and filters

**Covers:** 29.20, 29.23
**Dependencies:** EPIC-29-S05, EPIC-29-S13, EPIC-29-S14

### EPIC-29-S17 — HRMS Immigration Exit Automation Design (Events, Rule Engine, Workflow)

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** the immigration-exit module wired into the event bus, country rule engine and workflow engine, **so that** exits run straight-through, are fully configurable per country, and fail safe on missing rules.

**Description**
Makes the integration backbone explicit: separation/absence/payroll/benefit/SI events trigger exit actions; the rule engine holds all exit parameters (scenarios, country profiles, grace periods, dependent sequencing, repatriation rules, absconding thresholds, PRO templates, evidence requirements) configurable per country with effective-dating; the workflow engine drives PRO tasks, escalations and clearance gates; notifications and a standardised audit envelope are applied throughout.

**Acceptance Criteria**

- [ ] Given the rule engine, when an exit parameter changes, then no deployment is needed and it is effective-dated.
- [ ] Given domain events (`employee.separationInitiated`, `employee.unauthorizedAbsence`, `payroll.run.completed`, `socialInsurance.deregistered`), then exit handlers react idempotently.
- [ ] Given the workflow engine, then PRO-task, escalation and clearance-gate paths are reusable and configurable.
- [ ] Given an unconfigured country/scenario, when an exit runs, then it fails safe with a clear error rather than skipping steps.
- [ ] Given all exit actions, then a standardised audit envelope is recorded.

**Tasks**

- [ ] Backend: exit event handlers with idempotency keys
- [ ] Backend: rule-engine namespace `immig.exit.*` with effective-dated parameter store
- [ ] Backend: workflow templates for PRO tasks and clearance gates
- [ ] Backend: fail-safe guard for missing config
- [ ] Rules/Config: parameterise scenarios, profiles, grace, sequencing, repatriation, thresholds, evidence per country
- [ ] Tests: integration tests for idempotency and fail-safe

**Covers:** 29.22
**Dependencies:** EPIC-29-S03, EPIC-29-S13

### EPIC-29-S18 — Monthly Immigration Exit Compliance Pack & Certificate

**Labels:** `user-story`, `immigration` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** a one-click Monthly Immigration Exit Compliance Pack with certificate, **so that** I have a complete sign-off-ready evidence bundle of exit activity and closure each month.

**Description**
Compiles the period's exit artefacts into one downloadable pack: cancellations/transfers completed, grace-period register, open overstay risks, absconding cases, repatriation completions, PRO action register, evidence index, KPI snapshot, and a configurable Monthly Immigration Exit Compliance Certificate auto-populated from period data with e-attestation. Requires sign-off, is versioned and archived for retention.

**Acceptance Criteria**

- [ ] Given a closed period, when the pack is generated, then it includes cancellations/transfers, grace register, overstay risks, absconding cases, repatriation, PRO register, evidence index and KPI snapshot.
- [ ] Given the certificate, when generated, then it auto-populates entity, country, exit counts, overstay/absconding stats and closure %, with e-attestation (name, role, timestamp).
- [ ] Given outstanding overstay/open critical items, when generation is attempted, then they are flagged before sign-off.
- [ ] Given a finalised pack, then it is archived immutably with version/retention metadata and exports to PDF/Excel.
- [ ] Given any pack/certificate action, then it is audited.

**Tasks**

- [ ] Backend: compliance-pack assembler + certificate template engine with period data-binding
- [ ] Backend: immutable archive + retention metadata + e-attestation capture
- [ ] Frontend: pack preview + certificate generate/attest + sign-off
- [ ] Alerts/Workflow: sign-off request to Compliance Officer
- [ ] Tests: integration test for pack/certificate contents and flagging

**Covers:** 29.24
**Dependencies:** EPIC-29-S05, EPIC-29-S13, EPIC-29-S16

### EPIC-29-S19 — Sample Immigration Exit Checklist (Configurable Form)

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 3
**As a** PRO / Immigration Officer, **I want** a configurable Immigration Exit Checklist auto-driven from the case, **so that** every mandatory exit step is tracked, signed off and evidenced per country.

**Description**
Provides a digital, template-driven Immigration Exit Checklist generated from the scenario/country profile: cancellation/transfer steps, passport handling, grace period, dependent closures, repatriation, payroll/benefits/SI closure, and evidence items — each as a checklist line with status, owner, date and evidence link. Configurable per entity/country, bilingual, exports to PDF and attaches to the case and monthly pack.

**Acceptance Criteria**

- [ ] Given an exit case, when generated, then the checklist auto-populates the mandatory steps for that scenario/country with owner and status.
- [ ] Given each item, when completed, then status, date and evidence link are captured and reflected in the completeness score.
- [ ] Given the template, when configured, then items, header/footer and EN/AR layout are editable per entity without code.
- [ ] Given the checklist, then it exports to PDF and attaches to the case and pack.
- [ ] Given any checklist action, then it is audited.

**Tasks**

- [ ] Backend: exit-checklist template engine bound to case/scenario/country
- [ ] Backend: PDF export + attachment links + completeness contribution
- [ ] Frontend: checklist runner + template editor (EN/AR)
- [ ] Rules/Config: per-country mandatory checklist items
- [ ] Tests: unit test for auto-population and completeness

**Covers:** 29.25
**Dependencies:** EPIC-29-S03, EPIC-29-S14

### EPIC-29-S20 — Immigration Exit Key Takeaways & In-Product Guidance

**Labels:** `user-story`, `immigration` · **Priority:** Could · **Estimate:** 2
**As a** PRO / Immigration Officer, **I want** immigration-exit key takeaways and best-practice guidance surfaced in-product, **so that** users understand obligations and avoid overstay, missed cancellation and absconding-reporting errors.

**Description**
Surfaces the chapter's key takeaways as a configurable guidance panel and a short readiness checklist for exit users (choose cancellation vs transfer correctly, cancel dependents in sequence, track the grace period, complete repatriation, report absconding only after the waiting period, capture authority evidence, close payroll/benefits/SI). Content is admin-editable, versioned and EN/AR.

**Acceptance Criteria**

- [ ] Given the exit module home, when opened, then a key-takeaways panel shows configurable guidance.
- [ ] Given a first-time user, then a short readiness checklist of exit essentials is shown.
- [ ] Given guidance content, when edited, then it is versioned and effective-dated.
- [ ] Given localisation, then guidance supports English/Arabic.

**Tasks**

- [ ] Backend: `immig_exit_guidance_content` table (key, body, locale, version)
- [ ] Frontend: key-takeaways panel + first-run checklist
- [ ] Rules/Config: admin-editable guidance EN/AR
- [ ] Tests: unit test for versioning and locale fallback

**Covers:** 29.28
**Dependencies:** EPIC-29-S01
