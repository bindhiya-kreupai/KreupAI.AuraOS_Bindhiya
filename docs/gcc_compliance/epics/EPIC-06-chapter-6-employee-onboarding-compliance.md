# EPIC-06: Chapter 6 – Employee Onboarding Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 6 – Employee Onboarding Compliance
> **Module:** Core HR · **Labels:** `epic`, `gcc-compliance`, `core-hr`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an end-to-end AuraOS onboarding engine that converts an accepted offer into a fully compliant, active employee record across any GCC country. It must orchestrate pre-joining and joining-day checklists, create governed employee master data, run country-specific onboarding (visa stamping, Emirates ID/Iqama/CPR linkage), and trigger payroll, medical insurance and social-insurance (GPSSA/GOSI/SIO/PASI) enrolment — all under a configurable workflow, RBAC and full audit trail, with probation tracking and a completeness/KPI dashboard.

## Business Value

Removes manual, error-prone onboarding hand-offs that cause WPS/social-insurance registration delays, first-payroll errors and missing mandatory documents — each carrying authority penalties and labour-claim exposure. Standardised, audit-ready onboarding cuts time-to-productivity, guarantees data quality at source for every downstream module (payroll, immigration, EOSB), and gives leadership real-time visibility of onboarding compliance and risk.

## Requirements Covered (handbook sections)

- 6.1 Introduction
- 6.2 Objectives of Employee Onboarding
- 6.3 Onboarding Lifecycle
- 6.4 Onboarding Governance
- 6.5 Pre-Joining Checklist
- 6.6 Joining Day Formalities
- 6.7 Employee Master Data Creation
- 6.8 Country-Specific Onboarding Requirements
- 6.9 Payroll Onboarding
- 6.10 Medical Insurance and Benefits Enrollment
- 6.11 Social Insurance and Pension Onboarding
- 6.12 IT and Asset Provisioning
- 6.13 Policy Acknowledgement
- 6.14 Probation Management
- 6.15 Employee File Management
- 6.16 Onboarding KPIs
- 6.17 Onboarding Compliance Dashboard
- 6.18 HRMS Workflow Design for Onboarding
- 6.19 Onboarding Audit Checklist
- 6.20 Common Onboarding Risks
- 6.21 Best Practice Onboarding Timeline
- 6.22 Sample Employee Joining Form
- 6.23 Key Takeaways

## Out of Scope

- Recruitment, offer creation and pre-employment medical/background checks (EPIC-04, EPIC-05).
- Full immigration document lifecycle, renewals and transfers (EPIC-07).
- Detailed payroll calculation, WPS file generation and EOSB formulas (EPIC-10, EPIC-11, EPIC-28).

## Dependencies

- EPIC-05 (Offer Management & Pre-Employment) — provides accepted offer + pre-employment data
- EPIC-07 (Immigration & Work Authorization) — consumes onboarding to start visa lifecycle
- EPIC-08 (Employee Records Management) — employee file structure & document matrix
- EPIC-02 (Regulatory Framework) — country rule engine

## Epic Definition of Done

- [ ] Accepted offers convert to onboarding cases with a configurable, country-aware checklist and workflow.
- [ ] Employee master data is created once, validated, and propagated to payroll, immigration, social insurance and benefits.
- [ ] Country-specific onboarding tasks (UAE/KSA/Bahrain/Qatar/Oman/Kuwait) are driven by the rule engine, not hard-coded.
- [ ] Payroll, medical insurance and social-insurance enrolment are triggered and evidenced before first payroll lock.
- [ ] Probation periods are tracked with confirmation/extension workflow and alerts.
- [ ] Onboarding KPIs, dashboard and audit checklist are live with red-flag risk detection.
- [ ] Every onboarding action is captured in the audit trail with maker-checker on master-data activation.

---

## User Stories

### EPIC-06-S01 — Onboarding case lifecycle & governance model

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As an** HR Manager, **I want** each accepted offer to generate a governed onboarding case that moves through defined lifecycle stages, **so that** every new hire follows the same controlled, auditable process.

**Description**
Introduce an `OnboardingCase` aggregate spanning stages Pre-Joining → Joining Day → Master-Data Activation → Enrolment → Probation → Completed. Governance defines stage owners (HR Admin, PRO, Payroll, IT, Line Manager), entry/exit criteria, SLAs and escalation. The case is created automatically when an offer reaches `ACCEPTED`.

**Acceptance Criteria**

- [ ] Given an offer status changes to ACCEPTED, when the event is consumed, then an OnboardingCase is created with country, legal entity, employment type and target join date pre-populated.
- [ ] Given a case in any stage, when a stage's mandatory exit criteria are unmet, then the case cannot advance and the blocking items are listed.
- [ ] Given a stage SLA breach, when the SLA timer elapses, then the case is escalated to the configured role and flagged on the dashboard.
- [ ] Given governance config per country/entity, when a case is created, then the correct owners and checklist template are bound.
- [ ] Given any stage transition, then actor, timestamp, from/to stage and reason are written to the audit trail.
- [ ] Given RBAC, then only the stage owner role (or HR Manager) can advance or reassign a stage.

**Tasks**

- [ ] Backend: `onboarding_case` (id, employee_offer_id, country_code, legal_entity_id, employment_type, target_join_date, current_stage, status, sla_due_at) + `onboarding_stage_history`.
- [ ] Backend: state-machine service with entry/exit guards and Kafka `onboarding.case.*` events.
- [ ] Backend: offer-accepted event consumer to auto-create cases.
- [ ] Frontend: Onboarding case workspace with stage tracker and blocking-items panel (HR/admin portal).
- [ ] Rules/Config: per-country/entity governance template (owners, SLAs, escalation paths).
- [ ] Alerts/Workflow: SLA timers + escalation notifications.
- [ ] Tests: state-machine guard unit tests, e2e offer→case creation.

**Covers:** 6.3, 6.4
**Dependencies:** EPIC-05

### EPIC-06-S02 — Onboarding objectives, intro context & key takeaways content

**Labels:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 2
**As an** HR Admin, **I want** the onboarding module to surface its purpose, objectives and key compliance takeaways in-product, **so that** users understand why each step is mandatory and reduce non-compliance.

**Description**
Embed configurable guidance content (introduction, onboarding objectives, key takeaways) as contextual help panels and an onboarding "why this matters" banner tied to GCC compliance obligations. Content is editable by System Administrator and version-controlled.

**Acceptance Criteria**

- [ ] Given the onboarding workspace, when a user opens contextual help, then introduction, objectives and key-takeaways content render per active country.
- [ ] Given a System Administrator edits content, when saved, then a new version is stored and the prior version retained.
- [ ] Given a country context, then country-relevant takeaways (e.g. WPS/social-insurance registration deadlines) are highlighted.
- [ ] Given an audit, then content version shown to each user at each stage is recoverable.

**Tasks**

- [ ] Backend: `onboarding_guidance_content` (key, country_code, body, version, status).
- [ ] Backend: content versioning service + retrieval API.
- [ ] Frontend: contextual help drawer and onboarding intro banner.
- [ ] Rules/Config: map takeaways to country obligations.
- [ ] Tests: versioning + country-resolution unit tests.

**Covers:** 6.1, 6.2, 6.23
**Dependencies:** —

### EPIC-06-S03 — Pre-joining checklist & document collection

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** a configurable pre-joining checklist that collects and validates documents and data before day one, **so that** the employee can legally and operationally start on the join date.

**Description**
A country/entity/employment-type-driven pre-joining checklist (passport, photo, educational certificates with attestation, prior visa/cancellation, NOC, bank details, dependents, etc.). Candidate completes a self-service pre-boarding portal; HR validates and signs off. Checklist completeness gates the Joining-Day stage.

**Acceptance Criteria**

- [ ] Given a case country/type, when the pre-joining stage opens, then the correct checklist items (mandatory/optional) are instantiated from the template.
- [ ] Given the new hire uploads a document, when validation runs, then file type, expiry date and required attestation are checked and invalid items rejected with reason.
- [ ] Given a UAE/KSA hire, when prior employment exists, then cancellation/visa-transfer evidence (or NOC where applicable) is required before sign-off.
- [ ] Given all mandatory items complete & validated, then HR can sign off and the case may advance; otherwise advancement is blocked.
- [ ] Given any upload/validation/sign-off, then the action is audit-logged with actor and timestamp.
- [ ] Given RBAC, then only HR Admin/Manager can override a missing optional item with a recorded justification.

**Tasks**

- [ ] Backend: `onboarding_checklist_item` (case_id, code, category, mandatory, status, document_id, expiry_date, validated_by).
- [ ] Backend: checklist instantiation + validation service (expiry, attestation flags).
- [ ] Frontend: candidate pre-boarding portal + HR validation screen.
- [ ] Rules/Config: country/entity/type checklist templates incl. attestation requirements.
- [ ] Alerts/Workflow: reminders to candidate for pending items; HR sign-off workflow.
- [ ] Tests: template resolution, validation, gating integration tests.

**Covers:** 6.5
**Dependencies:** EPIC-05

### EPIC-06-S04 — Joining day formalities & first-day workflow

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** a structured joining-day formalities checklist, **so that** identity, signed contract, biometrics and induction are completed and evidenced on day one.

**Description**
Joining-day stage covers original-document verification, signed employment contract receipt, ID/biometric capture, induction attendance, workspace handover and reporting-manager confirmation. Completion stamps the actual join date, which becomes the service-period anchor for EOSB.

**Acceptance Criteria**

- [ ] Given joining day, when HR verifies originals against pre-joining copies, then each item is marked verified/discrepant with notes.
- [ ] Given the contract is signed, when uploaded and confirmed, then the signed contract is linked to the employee file as a mandatory record.
- [ ] Given completion of all formalities, when HR confirms, then the actual join date is recorded and locked (editable only via maker-checker correction).
- [ ] Given the Line Manager, then a "reported on date" confirmation is captured.
- [ ] Given any discrepancy (e.g. visa/Iqama mismatch), then the case is flagged and master-data activation is blocked.
- [ ] Given all actions, then they are audit-logged.

**Tasks**

- [ ] Backend: `joining_day_record` (case_id, actual_join_date, contract_doc_id, biometric_status, induction_status, manager_confirmed).
- [ ] Backend: verification + join-date locking service.
- [ ] Frontend: joining-day formalities screen with verify/flag actions.
- [ ] Rules/Config: per-entity required joining-day items.
- [ ] Alerts/Workflow: manager confirmation request.
- [ ] Tests: join-date lock + discrepancy gating tests.

**Covers:** 6.6
**Dependencies:** EPIC-06-S03

### EPIC-06-S05 — Employee master data creation & activation

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 13
**As an** HR Admin, **I want** to create the governed employee master record from validated onboarding data with maker-checker activation, **so that** a single accurate source of truth feeds all downstream modules.

**Description**
Compose the canonical employee master record (personal, identification, job/position, contract, compensation, bank/IBAN, nationality, social-insurance eligibility). A preparer drafts; a checker activates. On activation the employee number is issued and `employee.activated` is emitted to payroll, immigration, benefits and social insurance.

**Acceptance Criteria**

- [ ] Given validated onboarding data, when the master record is drafted, then mandatory fields per country (e.g. Emirates ID/Iqama/CPR/QID number, nationality, IBAN, GOSI/GPSSA eligibility flag) are enforced.
- [ ] Given maker-checker, when the preparer submits, then a different user must approve before activation (preparer ≠ approver).
- [ ] Given activation, when approved, then an employee number is generated per entity sequence and the record becomes active.
- [ ] Given activation, then `employee.activated` event is published with the master payload for downstream modules.
- [ ] Given duplicate detection, when passport/national-ID matches an existing active employee, then activation is blocked.
- [ ] Given any create/edit/activate, then field-level changes are written to the audit trail.

**Tasks**

- [ ] Backend: `employee` master schema + `employee_identification`, `employee_job`, `employee_compensation` with realistic fields; migration.
- [ ] Backend: maker-checker activation service + employee-number generator + duplicate check.
- [ ] Backend: `employee.activated` Kafka publisher.
- [ ] Frontend: master-data create/draft and checker-approval screens.
- [ ] Rules/Config: per-country mandatory-field matrix.
- [ ] Tests: maker-checker, duplicate, event-publish integration tests.

**Covers:** 6.7
**Dependencies:** EPIC-06-S03, EPIC-06-S04

### EPIC-06-S06 — Country-specific onboarding requirements (rule-engine driven)

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** onboarding steps to adapt to each GCC country's authority requirements via the rule engine, **so that** UAE, KSA, Bahrain, Qatar, Oman and Kuwait hires meet local obligations without code changes.

**Description**
Configure country onboarding rule sets: UAE (MOHRE work permit activation, Emirates ID/ICP linkage, medical, Tawjeeh/Emiratisation tagging), KSA (Qiwa contract authentication, Iqama linkage, GOSI registration, Saudization classification), Bahrain (LMRA permit, CPR, SIO), Qatar (QID, WPS enrolment), Oman (PASI/PASS, resident card), Kuwait (PAM/PIFSS). Rules drive required tasks, document items and downstream triggers.

**Acceptance Criteria**

- [ ] Given a case country, when onboarding starts, then the country-specific task set and document requirements are instantiated from the rule engine.
- [ ] Given a KSA hire, when contract data is ready, then a Qiwa contract-authentication task and GOSI registration trigger are required before activation.
- [ ] Given a UAE hire, when activated, then MOHRE work-permit linkage and Emiratisation classification (national/expat) are captured.
- [ ] Given configuration change to a country rule, when saved, then new cases use the new rule version while in-flight cases retain their bound version.
- [ ] Given missing country-mandatory items, then activation/enrolment stages are blocked.
- [ ] Given audit, then the applied rule version per case is traceable.

**Tasks**

- [ ] Backend: `country_onboarding_rule` config + rule resolver service.
- [ ] Backend: task/document instantiation keyed by country + employment type + nationality.
- [ ] Frontend: country-rule configuration UI (System Admin) and per-case country task panel.
- [ ] Rules/Config: seed UAE/KSA/Bahrain/Qatar/Oman/Kuwait rule sets with authority references.
- [ ] Tests: rule-resolution + version-binding tests per country.

**Covers:** 6.8
**Dependencies:** EPIC-02, EPIC-06-S01

### EPIC-06-S07 — Payroll onboarding & first-pay readiness

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** new hires set up for payroll with validated salary, bank and proration data before the first run, **so that** the first salary is correct, on time and WPS-compliant.

**Description**
On master activation, create the payroll profile (salary structure, allowances, bank/IBAN, WPS/Mudad routing, cost centre, proration from actual join date). Payroll readiness checks block payroll lock if any mandatory input is missing or the employee is not yet enrolled where statutorily required.

**Acceptance Criteria**

- [ ] Given an activated employee, when the payroll profile is created, then salary components, IBAN and cost centre are validated against entity rules.
- [ ] Given a mid-month join, when proration runs, then first-period salary is prorated from the actual join date.
- [ ] Given WPS-governed countries, when payroll readiness is checked, then a missing IBAN/labour-card/WPS routing blocks payroll lock with a clear reason.
- [ ] Given salary delay risk, when join-to-first-pay would exceed the statutory wage window, then an alert is raised.
- [ ] Given any payroll-profile change, then it is audit-logged and routed for approval where required.

**Tasks**

- [ ] Backend: `employee_payroll_profile` (salary_components, iban, wps_route, cost_center, proration_basis).
- [ ] Backend: payroll-readiness validation service + lock-blocking hook.
- [ ] Frontend: payroll onboarding screen for Payroll Officer.
- [ ] Rules/Config: country WPS routing + mandatory payroll inputs.
- [ ] Alerts/Workflow: readiness-failure and salary-delay alerts.
- [ ] Tests: proration + lock-block integration tests.

**Covers:** 6.9
**Dependencies:** EPIC-06-S05

### EPIC-06-S08 — Medical insurance & benefits enrolment

**Labels:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** new hires (and eligible dependents) enrolled in mandatory medical insurance and applicable benefits, **so that** statutory health-cover obligations (e.g. DHA/DOH, CCHI) are met from day one.

**Description**
Trigger enrolment into the correct medical insurance plan by emirate/region and grade, capture dependents, generate vendor enrolment files/records and track policy/card issuance. Enforce mandatory medical cover where required (e.g. Dubai/Abu Dhabi, KSA CCHI) before completion.

**Acceptance Criteria**

- [ ] Given an activated employee, when benefits enrolment runs, then the correct plan is selected by location/grade and eligibility rules.
- [ ] Given mandatory-cover jurisdictions, when enrolment is incomplete, then onboarding completion is blocked and flagged.
- [ ] Given eligible dependents, when added, then their cover and documents are captured and included in the enrolment record.
- [ ] Given vendor enrolment, then an enrolment file/record is produced and insurance-card status is tracked to issuance.
- [ ] Given any enrolment action, then it is audit-logged.

**Tasks**

- [ ] Backend: `benefit_enrolment` (employee_id, plan_id, dependents, vendor_ref, card_status).
- [ ] Backend: eligibility resolver + vendor enrolment export.
- [ ] Frontend: benefits enrolment screen incl. dependents.
- [ ] Rules/Config: mandatory medical-cover rules by emirate/region & grade.
- [ ] Alerts/Workflow: card-pending and mandatory-cover-missing alerts.
- [ ] Tests: eligibility + mandatory-gate tests.

**Covers:** 6.10
**Dependencies:** EPIC-06-S05

### EPIC-06-S09 — Social insurance & pension onboarding

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** eligible nationals (and applicable expats) registered with the correct social-insurance/pension authority during onboarding, **so that** GOSI/GPSSA/SIO/PASI registration deadlines are met and contributions begin correctly.

**Description**
Determine social-insurance applicability by nationality and country (UAE national → GPSSA; KSA → GOSI; Bahraini/expat in Bahrain → SIO; Oman → PASI; Qatar/Kuwait equivalents), capture contribution-wage basis and registration reference, and trigger registration within statutory windows. Block onboarding completion if a mandatory registration is missing.

**Acceptance Criteria**

- [ ] Given nationality + country, when eligibility is evaluated, then the correct authority and contribution scheme are assigned (e.g. UAE national → GPSSA, KSA → GOSI).
- [ ] Given an eligible employee, when registration is initiated, then a statutory-deadline timer starts and is alerted before breach.
- [ ] Given contribution-wage rules, when computed, then the registered wage matches the country's defined contributory base.
- [ ] Given a missing mandatory registration reference, then onboarding completion is blocked.
- [ ] Given any registration action, then it is audit-logged with authority reference.

**Tasks**

- [ ] Backend: `social_insurance_registration` (employee_id, authority, scheme, contribution_wage, reference, status, deadline_at).
- [ ] Backend: eligibility + contribution-wage rule engine; deadline timers.
- [ ] Frontend: social-insurance onboarding screen.
- [ ] Rules/Config: per-country authority mapping & contributory base rules.
- [ ] Alerts/Workflow: registration-deadline alerts; completion-block on missing registration.
- [ ] Tests: eligibility + deadline + wage-basis tests per country.

**Covers:** 6.11
**Dependencies:** EPIC-06-S05, EPIC-02

### EPIC-06-S10 — IT & asset provisioning

**Labels:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 5
**As a** Line Manager, **I want** IT accounts and physical assets provisioned and acknowledged during onboarding, **so that** the new hire is productive on day one and asset accountability is recorded.

**Description**
Provision IT accounts (email, systems access by role) and issue assets (laptop, SIM, access card, PPE where applicable) via a provisioning checklist integrated with IT/asset systems. Each asset issue is acknowledged by the employee and recorded for later separation recovery.

**Acceptance Criteria**

- [ ] Given an activated employee, when provisioning starts, then role-based IT access and asset items are instantiated.
- [ ] Given an asset issued, when the employee acknowledges, then a signed/e-signed asset issue record is stored.
- [ ] Given pending provisioning at join date, then a flag and reminder are raised to IT/manager.
- [ ] Given RBAC, then only IT/admin roles can mark IT access granted.
- [ ] Given any issue/return action, then it is audit-logged and available to the separation module.

**Tasks**

- [ ] Backend: `asset_issue` (employee_id, asset_type, serial, issued_at, acknowledged, returned_at) + IT-access task entity.
- [ ] Backend: provisioning checklist service + integration hooks.
- [ ] Frontend: provisioning screen + employee asset-acknowledgement (ESS).
- [ ] Rules/Config: role-based access & asset bundles.
- [ ] Alerts/Workflow: provisioning reminders.
- [ ] Tests: acknowledgement + audit tests.

**Covers:** 6.12
**Dependencies:** EPIC-06-S05

### EPIC-06-S11 — Policy acknowledgement

**Labels:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** new hires to acknowledge mandatory policies during onboarding, **so that** code of conduct, data-privacy and country-specific policy consent are evidenced.

**Description**
Present the mandatory policy pack (code of conduct, data privacy/PDPL consent, IT acceptable use, anti-harassment, country addendums) for e-acknowledgement. Acknowledgement is versioned, timestamped and stored to the employee file; missing acknowledgements block completion.

**Acceptance Criteria**

- [ ] Given onboarding, when the policy step opens, then the active policy versions for the employee's country/entity are presented.
- [ ] Given the employee e-acknowledges, then the exact policy version, timestamp and IP/device are recorded.
- [ ] Given an unacknowledged mandatory policy, then onboarding completion is blocked.
- [ ] Given a later policy version, then re-acknowledgement can be requested (handled in records module).
- [ ] Given audit, then acknowledgement evidence is retrievable per employee and policy.

**Tasks**

- [ ] Backend: `policy_acknowledgement` (employee_id, policy_id, version, acknowledged_at, evidence).
- [ ] Backend: acknowledgement capture + completeness gate.
- [ ] Frontend: ESS policy-acknowledgement screen.
- [ ] Rules/Config: mandatory policy pack per country/entity.
- [ ] Tests: gating + version-capture tests.

**Covers:** 6.13
**Dependencies:** EPIC-06-S05

### EPIC-06-S12 — Probation management

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As an** HR Manager, **I want** probation periods tracked with confirmation, extension and termination workflows, **so that** probation decisions are timely, compliant with GCC notice rules and fully evidenced.

**Description**
Set probation length per country/contract (within legal caps, e.g. UAE max 6 months), schedule review milestones, and run a confirmation/extension/probation-termination workflow with manager assessment. Alerts fire ahead of probation end so decisions occur before the deadline; defaults to confirmation where configured.

**Acceptance Criteria**

- [ ] Given a contract, when probation is set, then the period is validated against the country's legal maximum.
- [ ] Given an approaching probation end, when 30/14/7 days remain, then the line manager and HR are alerted to act.
- [ ] Given a confirmation decision, when approved, then the employee status updates to confirmed and the effective date is recorded.
- [ ] Given a probation extension, when within legal limits, then the new end date and justification are stored and re-alerted.
- [ ] Given probation termination, when initiated, then country notice rules are applied and the case routes to separation.
- [ ] Given any probation action, then it is audit-logged.

**Tasks**

- [ ] Backend: `probation` (employee_id, start, end, status, decision, decided_by) + review milestones.
- [ ] Backend: probation rule validation + decision workflow service.
- [ ] Frontend: probation tracker + manager assessment form.
- [ ] Rules/Config: per-country probation caps & notice rules.
- [ ] Alerts/Workflow: 30/14/7-day probation alerts + confirmation workflow.
- [ ] Tests: cap validation, alert scheduling, decision-flow tests.

**Covers:** 6.14
**Dependencies:** EPIC-06-S05

### EPIC-06-S13 — Employee file creation during onboarding

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** onboarding documents auto-filed into a structured employee file, **so that** the new hire's file is complete and audit-ready at activation.

**Description**
As onboarding documents are collected, auto-classify and file them into the standard employee file structure (personal, identification, contractual, immigration, payroll, benefits, policy). Compute an onboarding-time completeness indicator and hand the file to the records module (EPIC-08) on completion.

**Acceptance Criteria**

- [ ] Given an uploaded onboarding document, when filed, then it is classified into the correct file section with metadata (type, expiry, country).
- [ ] Given the mandatory-document set for the country/type, when computed, then missing items are listed and a completeness % shown.
- [ ] Given onboarding completion, then the file is marked active and ownership passes to the records module.
- [ ] Given RBAC, then file access follows record-access rules.
- [ ] Given any filing/reclassification, then it is audit-logged.

**Tasks**

- [ ] Backend: link onboarding documents to `employee_file_section`; completeness calc service.
- [ ] Backend: file-handover event to EPIC-08.
- [ ] Frontend: employee file view within onboarding case.
- [ ] Rules/Config: country/type mandatory-document set.
- [ ] Tests: classification + completeness tests.

**Covers:** 6.15
**Dependencies:** EPIC-06-S05, EPIC-08

### EPIC-06-S14 — Onboarding KPIs & compliance dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership user, **I want** onboarding KPIs and a compliance dashboard, **so that** I can monitor onboarding speed, completeness and compliance across countries and entities.

**Description**
Compute KPIs (time-to-onboard, day-one readiness %, first-pay accuracy, social-insurance/medical registration-on-time %, probation-decision-on-time %, document completeness) and present a filterable dashboard by country, entity, department and recruiter, with trend and drill-down.

**Acceptance Criteria**

- [ ] Given completed/in-flight cases, when KPIs compute, then each metric reflects current data with country/entity filters.
- [ ] Given the dashboard, when filtered, then values, trends and overdue/blocked cases update accordingly.
- [ ] Given a KPI breach threshold, then the metric is visually flagged.
- [ ] Given a drill-down, then the underlying cases/employees are listed (RBAC-respecting).
- [ ] Given data refresh, then KPIs update on the defined schedule/events.

**Tasks**

- [ ] Backend: KPI aggregation queries/materialized views + metrics API.
- [ ] Frontend: onboarding dashboard with filters, trends, drill-down.
- [ ] Rules/Config: KPI thresholds per entity.
- [ ] Tests: KPI calculation correctness tests.

**Covers:** 6.16, 6.17
**Dependencies:** EPIC-06-S01

### EPIC-06-S15 — Onboarding workflow & best-practice timeline configuration

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 8
**As a** System Administrator, **I want** to configure the onboarding workflow and a best-practice timeline template, **so that** approvals, hand-offs and recommended day-offsets are standardised and adaptable per country/entity.

**Description**
Provide a no-code workflow designer for onboarding (stages, tasks, owners, approvals, parallel tracks for PRO/Payroll/IT) and a best-practice timeline template expressing recommended offsets (e.g. T-7 pre-joining complete, T-0 joining day, T+1 master activation, T+3 enrolment). The timeline drives default due dates and the dashboard's on-track view.

**Acceptance Criteria**

- [ ] Given the workflow designer, when an admin configures stages/tasks/approvals, then new cases follow the configured flow.
- [ ] Given a best-practice timeline, when applied, then task due dates default to the configured day-offsets relative to join date.
- [ ] Given parallel tracks, when active, then PRO/Payroll/IT tasks run concurrently without blocking unrelated stages.
- [ ] Given a config change, then in-flight cases keep their bound workflow version while new cases use the latest.
- [ ] Given audit, then workflow/timeline versions are recorded.

**Tasks**

- [ ] Backend: `onboarding_workflow_def` + `onboarding_timeline_template` (offsets) with versioning.
- [ ] Backend: workflow execution + due-date derivation service.
- [ ] Frontend: workflow designer + timeline template editor.
- [ ] Rules/Config: default GCC timeline templates.
- [ ] Tests: workflow execution + offset-derivation tests.

**Covers:** 6.18, 6.21
**Dependencies:** EPIC-06-S01

### EPIC-06-S16 — Onboarding audit checklist & risk register

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable onboarding audit checklist and a red-flag risk register, **so that** I can verify control compliance and track common onboarding risks to closure.

**Description**
Provide a configurable audit checklist (e.g. signed contract on file, master-data maker-checker evidence, social-insurance registered on time, mandatory medical cover, policy acknowledgements) and a risk register seeded with common onboarding risks (late registration, missing/expired documents, duplicate employees, first-pay errors, ghost activations) with likelihood/impact scoring and corrective actions.

**Acceptance Criteria**

- [ ] Given a sample of cases, when the audit checklist runs, then each control is auto-evaluated where data exists and flagged where evidence is missing.
- [ ] Given a detected red flag (e.g. activation without checker, registration past deadline), then a risk-register entry is created with severity.
- [ ] Given a risk entry, when a corrective action is assigned, then owner, due date and status are tracked to closure.
- [ ] Given the risk matrix, then likelihood × impact yields a rating and heat-map position.
- [ ] Given audit export, then checklist results and the risk register export for review.

**Tasks**

- [ ] Backend: `onboarding_audit_check` + `onboarding_risk_register` (risk, likelihood, impact, rating, action, status).
- [ ] Backend: auto-evaluation rules + red-flag detectors.
- [ ] Frontend: audit checklist runner + risk register/heat-map.
- [ ] Rules/Config: configurable controls + seeded common risks.
- [ ] Tests: red-flag detection + scoring tests.

**Covers:** 6.19, 6.20
**Dependencies:** EPIC-06-S05, EPIC-06-S09

### EPIC-06-S17 — Sample Employee Joining Form (configurable digital form)

**Labels:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 5
**As an** HR Admin, **I want** a configurable digital Employee Joining Form with export, **so that** new hires submit standardised joining data that feeds master-data creation and is archived as evidence.

**Description**
Build a configurable Employee Joining Form (personal, contact, emergency contact, identification, dependents, bank/IBAN, declarations and signature) rendered as a digital ESS form with country-specific fields. Submission pre-populates master-data drafting, and a PDF export is stored in the employee file.

**Acceptance Criteria**

- [ ] Given a country/entity, when the joining form renders, then country-specific fields and validations apply (e.g. Emirates ID/Iqama/CPR, IBAN format).
- [ ] Given the new hire submits, then validated data maps into the master-data draft.
- [ ] Given submission, then a PDF/export of the form is generated and filed with timestamp and signature.
- [ ] Given a form-definition change, then versioning preserves prior submissions' layout.
- [ ] Given audit, then the submitted form and its version are retrievable.

**Tasks**

- [ ] Backend: `joining_form_def` + `joining_form_submission` with versioning.
- [ ] Backend: form-to-master-data mapping + PDF export service.
- [ ] Frontend: configurable form builder + ESS form renderer.
- [ ] Rules/Config: country field sets & validations (ID formats, IBAN).
- [ ] Tests: validation, mapping and export tests.

**Covers:** 6.22
**Dependencies:** EPIC-06-S05
