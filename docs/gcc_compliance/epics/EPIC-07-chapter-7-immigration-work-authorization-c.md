# EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 7 – Immigration & Work Authorization Compliance
> **Module:** Immigration · **Labels:** `epic`, `gcc-compliance`, `immigration`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an AuraOS immigration command centre that manages the full work-authorization lifecycle for every GCC country — entry permit, work permit/labour card, residence visa, Emirates ID/Iqama/CPR/QID, and dependent visas — from issuance through renewal, transfer, cancellation and exit. The system drives PRO workflows, enforces job-title/occupation and work-location rules, maintains a complete document register, and fires 60/30/7-day expiry alerts so the workforce stays legally authorised at all times.

## Business Value

Expired or mismatched work authorization triggers heavy authority fines, work stoppages, blacklisting and labour bans across MOHRE/ICP/GDRFA, MHRSD/Qiwa, LMRA, PAM and others. Automated tracking, renewal alerts and PRO orchestration eliminate lapsed permits, evidence every authority transaction for audit, and give Compliance and Leadership a real-time view of immigration risk and document validity across all entities.

## Requirements Covered (handbook sections)

- 7.1 Introduction
- 7.2 Purpose of Immigration Compliance
- 7.3 Immigration Compliance Lifecycle
- 7.4 Key Immigration Documents
- 7.5 Country-Wise Immigration and Work Authorization Framework
- 7.6 Job Title and Occupation Classification
- 7.7 Work Location Compliance
- 7.8 Employee Transfer and Mobility
- 7.9 Dependents and Family Visa Support
- 7.10 Renewal Management
- 7.11 Cancellation and Exit Compliance
- 7.12 Immigration Document Register
- 7.13 Immigration Audit Checklist
- 7.14 Immigration Compliance KPIs
- 7.15 Immigration Risk Matrix
- 7.16 HRMS Workflow Design for Immigration Compliance
- 7.17 Sample Immigration Compliance Policy
- 7.18 Sample Work Authorization Checklist
- 7.19 Key Takeaways

## Out of Scope

- Initial onboarding visa-stamping orchestration owned by EPIC-06 (this epic consumes activation and owns ongoing lifecycle).
- Full final-settlement/EOSB and separation processing (EPIC-27, EPIC-28); this epic covers immigration cancellation/exit only.
- Detailed visa-exit/repatriation settlement linkage handled in EPIC-29 (consumed here).

## Dependencies

- EPIC-06 (Employee Onboarding) — provides activated employees and initial documents
- EPIC-02 (Regulatory Framework) — country immigration rule engine
- EPIC-08 (Employee Records Management) — document store & register
- EPIC-29 (Visa/Immigration Exit) — exit settlement linkage

## Epic Definition of Done

- [ ] All key immigration documents are modelled with issue/expiry dates, authority references and status.
- [ ] Country immigration frameworks (UAE/KSA/Bahrain/Qatar/Oman/Kuwait) are configurable via the rule engine.
- [ ] 60/30/7-day pre-expiry alerts and renewal workflows operate for every document type.
- [ ] Transfers, dependents, cancellation and exit are handled with PRO workflow and authority-evidence capture.
- [ ] Job-title/occupation classification and work-location rules are validated against permits.
- [ ] Immigration document register, audit checklist, KPIs and risk matrix are live and exportable.
- [ ] Every authority transaction and document change is captured in the audit trail.

---

## User Stories

### EPIC-07-S01 — Immigration purpose, lifecycle & policy context content

**Labels:** `user-story`, `immigration` · **Priority:** Should · **Estimate:** 2
**As a** Compliance Officer, **I want** the immigration module to present its purpose, lifecycle stages and key takeaways in-product, **so that** users understand obligations and the standardised flow.

**Description**
Embed configurable guidance (introduction, purpose of immigration compliance, lifecycle overview, key takeaways) as contextual content tied to GCC authorities and document types, editable and version-controlled by System Administrator.

**Acceptance Criteria**

- [ ] Given the immigration workspace, when help is opened, then introduction, purpose, lifecycle and key-takeaways content render per active country.
- [ ] Given a content edit, when saved, then a new version is stored and prior versions retained.
- [ ] Given a country context, then relevant authorities (MOHRE/ICP/GDRFA, MHRSD/Qiwa, LMRA, PAM, etc.) are referenced.
- [ ] Given audit, then the content version is recoverable.

**Tasks**

- [ ] Backend: `immigration_guidance_content` (key, country_code, body, version).
- [ ] Backend: versioning + retrieval API.
- [ ] Frontend: contextual help drawer + lifecycle overview panel.
- [ ] Rules/Config: map content to country authorities.
- [ ] Tests: versioning + country-resolution tests.

**Covers:** 7.1, 7.2, 7.3, 7.19
**Dependencies:** —

### EPIC-07-S02 — Key immigration document model & status engine

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 13
**As a** PRO / Immigration Officer, **I want** every key immigration document modelled with dates, references and lifecycle status, **so that** each employee's authorization validity is always known and traceable.

**Description**
Model document types — entry/employment entry permit, work permit/labour card, residence visa, Emirates ID, Iqama, CPR, QID, medical, e-visa, sponsorship/establishment card — with issue date, expiry date, authority, reference number, place of issue, and status (Draft/Applied/Issued/Active/Expiring/Expired/Cancelled). A status engine derives Expiring/Expired from configurable thresholds and drives alerts and dashboards.

**Acceptance Criteria**

- [ ] Given a document, when created/updated, then type, authority, reference, issue/expiry dates are validated and stored with the employee link.
- [ ] Given expiry thresholds, when an expiry date nears, then status transitions to Expiring at the configured offset and Expired after the date.
- [ ] Given a country, then only document types valid for that country are selectable (e.g. Iqama for KSA, Emirates ID for UAE, CPR for Bahrain, QID for Qatar).
- [ ] Given a document supersession (e.g. renewal), then the prior document is versioned and history retained.
- [ ] Given RBAC, then only PRO/immigration roles can edit immigration documents.
- [ ] Given any change, then it is audit-logged with before/after values.

**Tasks**

- [ ] Backend: `immigration_document` (employee_id, doc_type, authority, reference_no, issue_date, expiry_date, status, country_code, version) + history table; migration.
- [ ] Backend: status-derivation service + scheduled re-evaluation job.
- [ ] Frontend: document detail/edit screens per type.
- [ ] Rules/Config: country-valid document-type catalogue + thresholds.
- [ ] Alerts/Workflow: status-change events to alerting.
- [ ] Tests: status transition + country-validity + history tests.

**Covers:** 7.4
**Dependencies:** EPIC-06

### EPIC-07-S03 — Country-wise immigration & work authorization framework (rule engine)

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 13
**As a** Compliance Officer, **I want** each country's immigration and work-authorization framework configured in the rule engine, **so that** required documents, authorities and sequences differ correctly by country without code changes.

**Description**
Configure per-country frameworks: UAE (MOHRE work permit + GDRFA/ICP residence + Emirates ID), KSA (MHRSD/Qiwa work permit + Iqama via Jawazat), Bahrain (LMRA work permit + CPR), Qatar (MOI work permit + residence + QID), Oman (Ministry of Labour permit + resident card via ROP), Kuwait (PAM work permit + civil ID). Each framework defines required documents, issuing authority, valid sequence and validity periods.

**Acceptance Criteria**

- [ ] Given an employee's country, when their immigration profile is built, then the country framework determines required documents and their sequence.
- [ ] Given a UAE employee, when authorization is assembled, then MOHRE work permit, residence visa and Emirates ID are required and linked.
- [ ] Given a KSA employee, then Qiwa work permit and Iqama are required with correct authorities.
- [ ] Given a framework version change, then new profiles use the new version while existing retain their bound version.
- [ ] Given an unsupported document/authority combination for a country, then it is rejected.
- [ ] Given audit, then the applied framework version is traceable per employee.

**Tasks**

- [ ] Backend: `country_immigration_framework` config (required docs, authorities, sequence, validity).
- [ ] Backend: framework resolver + profile builder service.
- [ ] Frontend: framework configuration UI (System Admin).
- [ ] Rules/Config: seed UAE/KSA/Bahrain/Qatar/Oman/Kuwait frameworks.
- [ ] Tests: per-country resolution + sequencing tests.

**Covers:** 7.5
**Dependencies:** EPIC-02

### EPIC-07-S04 — Job title & occupation classification compliance

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** job titles mapped to authority occupation classifications and validated against permits, **so that** the permit profession matches the actual role and avoids misclassification penalties.

**Description**
Maintain a mapping of internal job titles to official authority occupation codes (MOHRE profession list, KSA professional classification/Qiwa, etc.). Validate that the work-permit profession aligns with the employee's position and flag mismatches (a common cause of fines and renewal rejections), including profession-localization constraints.

**Acceptance Criteria**

- [ ] Given a position, when an immigration profile is created, then the mapped authority occupation code is proposed and required.
- [ ] Given a work permit profession different from the mapped occupation, when detected, then a mismatch flag and corrective task are raised.
- [ ] Given a country with localized/restricted professions, when an expat is assigned such a profession, then the system warns/blocks per configuration.
- [ ] Given a job-title change, then occupation re-validation runs and permit-amendment need is flagged.
- [ ] Given audit, then occupation mapping decisions are logged.

**Tasks**

- [ ] Backend: `occupation_mapping` (job_title_id, country_code, authority_code, restricted_flag) + validation service.
- [ ] Backend: mismatch detector + corrective-task generator.
- [ ] Frontend: occupation mapping admin + per-employee classification view.
- [ ] Rules/Config: authority profession catalogues + localized-profession rules.
- [ ] Alerts/Workflow: mismatch flag + amendment task.
- [ ] Tests: mapping + mismatch + restricted-profession tests.

**Covers:** 7.6
**Dependencies:** EPIC-07-S03

### EPIC-07-S05 — Work location compliance

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** work-location/establishment validated against the permit's sponsoring entity and jurisdiction, **so that** employees work only where their authorization permits (e.g. correct emirate, freezone vs mainland, work-site).

**Description**
Validate the employee's assigned work location/site and legal entity against the sponsoring establishment on the work permit (including freezone/mainland and emirate/region distinctions). Flag out-of-jurisdiction assignments and inter-location movements requiring permit changes.

**Acceptance Criteria**

- [ ] Given an assigned work location, when validated, then it is checked against the sponsoring entity/establishment on the permit.
- [ ] Given a freezone-sponsored employee assigned to mainland (or cross-emirate) work, when detected, then a compliance flag is raised.
- [ ] Given a work-location change, then a permit-impact assessment task is generated where required.
- [ ] Given audit, then location-validation outcomes are logged.
- [ ] Given RBAC, then only authorised roles can override a location flag with justification.

**Tasks**

- [ ] Backend: `work_location` + sponsoring-establishment link; location-validation service.
- [ ] Backend: jurisdiction/freezone rule checks.
- [ ] Frontend: work-location assignment + flag panel.
- [ ] Rules/Config: jurisdiction & establishment rules per country.
- [ ] Alerts/Workflow: out-of-jurisdiction flags + assessment task.
- [ ] Tests: jurisdiction validation tests.

**Covers:** 7.7
**Dependencies:** EPIC-07-S03

### EPIC-07-S06 — Employee transfer & mobility management

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** to manage internal and external immigration transfers/mobility with the correct authority process, **so that** sponsorship and permit changes are executed compliantly without illegal working gaps.

**Description**
Handle transfer scenarios: change of sponsor/establishment, inter-entity transfer, MOHRE work-permit transfer, KSA sponsorship transfer/Qiwa, freezone-to-mainland, and cross-emirate moves. Each transfer is a workflow with prerequisite checks (NOC, current-permit cancellation/transfer, no overlap), authority steps and evidence capture.

**Acceptance Criteria**

- [ ] Given a transfer request, when initiated, then required prerequisites (e.g. NOC, no concurrent active permit) are checked and enforced.
- [ ] Given a sponsor change, when executed, then the old sponsorship is closed and the new permit linked with continuity of dates recorded.
- [ ] Given country rules, when a transfer type is not permitted (e.g. within ban period), then it is blocked with reason.
- [ ] Given a transfer, then PRO workflow steps and authority evidence are tracked to completion.
- [ ] Given audit, then full transfer history (from/to entity, dates, evidence) is logged.

**Tasks**

- [ ] Backend: `immigration_transfer` (employee_id, type, from_entity, to_entity, status, evidence) + workflow.
- [ ] Backend: prerequisite-check + continuity service.
- [ ] Frontend: transfer request + PRO processing screen.
- [ ] Rules/Config: country transfer rules & restrictions.
- [ ] Alerts/Workflow: PRO task routing + completion alerts.
- [ ] Tests: prerequisite, blocking, continuity tests.

**Covers:** 7.8
**Dependencies:** EPIC-07-S02, EPIC-07-S03

### EPIC-07-S07 — Dependents & family visa support

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** to manage dependents and family-visa sponsorship linked to the employee, **so that** family residence, Emirates ID/Iqama and renewals are tracked and dependent on the employee's valid status.

**Description**
Register dependents (spouse, children, parents, domestic workers where applicable), capture their visas/IDs with issue/expiry, validate salary-threshold and document eligibility for family sponsorship, and link dependent validity to the sponsor's residence status (a sponsor cancellation impacts dependents). Dependents inherit the renewal/alert engine.

**Acceptance Criteria**

- [ ] Given an employee, when a dependent is added, then relationship, documents and dependent visa/ID with dates are captured.
- [ ] Given family-sponsorship eligibility rules, when a dependent is sponsored, then salary threshold and required documents are validated per country.
- [ ] Given a sponsor's residence approaching expiry/cancellation, when detected, then dependent impact is surfaced and alerted.
- [ ] Given a dependent visa expiry, then 60/30/7-day alerts and renewal tasks are generated.
- [ ] Given audit, then dependent records and sponsorship changes are logged.

**Tasks**

- [ ] Backend: `dependent` (employee_id, relationship, doc set) + `dependent_visa` with dates/status.
- [ ] Backend: eligibility (salary-threshold) validation + sponsor-link service.
- [ ] Frontend: dependents management screen + ESS dependent view.
- [ ] Rules/Config: per-country family-sponsorship eligibility rules.
- [ ] Alerts/Workflow: dependent expiry alerts + sponsor-impact alerts.
- [ ] Tests: eligibility + sponsor-link + alert tests.

**Covers:** 7.9
**Dependencies:** EPIC-07-S02, EPIC-07-S08

### EPIC-07-S08 — Renewal management with 60/30/7-day alerts

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 13
**As a** PRO / Immigration Officer, **I want** automated renewal management with tiered pre-expiry alerts and workflow, **so that** no work permit, residence visa, Emirates ID, Iqama, CPR or QID lapses.

**Description**
For every dated document (employee and dependent), generate renewal tasks and fire alerts at 60, 30 and 7 days before expiry (configurable), escalating as the deadline nears. A renewal workflow tracks document collection, authority submission, fee, and re-issuance, then supersedes the old document and recomputes status. Overdue renewals raise critical risk flags.

**Acceptance Criteria**

- [ ] Given a document with an expiry date, when 60/30/7 days remain, then alerts fire to PRO/HR/employee with escalating severity.
- [ ] Given the 7-day or post-expiry stage, when unresolved, then a critical risk flag is raised on the dashboard and risk matrix.
- [ ] Given a renewal workflow, when completed, then the new document supersedes the old and history is retained with continuity dates.
- [ ] Given country renewal lead-times, when configured, then alert offsets adjust accordingly.
- [ ] Given RBAC, then only PRO/immigration roles can close a renewal task.
- [ ] Given audit, then alert dispatch and renewal steps are logged.

**Tasks**

- [ ] Backend: `renewal_task` (document_id, due_date, stage, status) + scheduler computing 60/30/7 alerts.
- [ ] Backend: renewal workflow + supersession service.
- [ ] Frontend: renewal pipeline board + PRO action screen.
- [ ] Rules/Config: per-country/document alert offsets & lead-times.
- [ ] Alerts/Workflow: tiered notifications + escalation + critical-flag emission.
- [ ] Tests: alert-timing, escalation, supersession integration tests.

**Covers:** 7.10
**Dependencies:** EPIC-07-S02

### EPIC-07-S09 — Cancellation & exit immigration compliance

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** to process visa/work-permit cancellation and immigration exit with grace-period control, **so that** departures are compliant, sponsorship obligations end correctly and overstays/absconding are avoided.

**Description**
On separation, run the immigration cancellation workflow: work-permit cancellation, residence-visa cancellation, dependent-visa cancellation, ID surrender, exit/grace-period tracking and (where relevant) absconding reporting. Link to final settlement (cancellation often gates final pay/EOSB) and capture authority cancellation evidence.

**Acceptance Criteria**

- [ ] Given a separation trigger, when cancellation starts, then employee and dependent permits/visas are queued for cancellation in the correct order.
- [ ] Given visa cancellation, when completed, then a grace period timer starts and is alerted before lapse (overstay risk).
- [ ] Given a country cancellation-before-final-settlement rule, when configured, then final settlement is gated until cancellation evidence exists.
- [ ] Given absconding/abandonment, when reported, then the authority report and status are recorded.
- [ ] Given dependents, when the sponsor's visa is cancelled, then dependent cancellations are enforced.
- [ ] Given audit, then all cancellation steps and authority evidence are logged.

**Tasks**

- [ ] Backend: `immigration_cancellation` (employee_id, scope, status, grace_until, evidence) + workflow.
- [ ] Backend: ordered-cancellation + grace-period + settlement-gate service.
- [ ] Frontend: cancellation/exit processing screen.
- [ ] Rules/Config: per-country cancellation order, grace periods & settlement-gate rules.
- [ ] Alerts/Workflow: grace-period/overstay alerts; settlement-gate hook to EPIC-29.
- [ ] Tests: ordering, grace-timer, gating tests.

**Covers:** 7.11
**Dependencies:** EPIC-07-S02, EPIC-29

### EPIC-07-S10 — Immigration document register (configurable register + export)

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As an** Internal Auditor, **I want** a complete, filterable immigration document register with export, **so that** every authorization document across the workforce is visible with validity and ownership for audit.

**Description**
A consolidated register listing every immigration document (employee + dependent) with type, authority, reference, issue/expiry, status, sponsoring entity and assigned PRO. Filterable by country, entity, status (active/expiring/expired), document type; exportable to Excel/PDF and used as an audit source-of-truth.

**Acceptance Criteria**

- [ ] Given the register, when opened, then all immigration documents render with key fields and current status.
- [ ] Given filters (country/entity/status/type/expiry window), when applied, then the register updates accordingly.
- [ ] Given an export request, then an Excel/PDF register is generated reflecting filters and timestamped.
- [ ] Given RBAC, then only authorised roles can view/export the register.
- [ ] Given a register view/export, then the access is audit-logged.

**Tasks**

- [ ] Backend: register query/materialized view aggregating documents + register export service.
- [ ] Frontend: register grid with filters + export.
- [ ] Rules/Config: column/visibility config by role.
- [ ] Tests: filter + export correctness tests.

**Covers:** 7.12
**Dependencies:** EPIC-07-S02, EPIC-07-S07

### EPIC-07-S11 — Immigration audit checklist & work authorization checklist

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** configurable immigration and work-authorization checklists, **so that** I can verify each employee's authorization is complete, valid and correctly matched.

**Description**
Provide (a) an immigration audit checklist (valid permit on file, residence valid, ID valid, occupation match, location compliant, dependents valid) auto-evaluated per employee/sample, and (b) a reusable Work Authorization Checklist (the section 7.18 sample) usable at onboarding, renewal and audit, as a configurable digital checklist with export.

**Acceptance Criteria**

- [ ] Given a sample/employee, when the audit checklist runs, then each control is auto-evaluated from document data and gaps are flagged.
- [ ] Given the work authorization checklist, when applied to an employee, then mandatory items per country render and completion is tracked.
- [ ] Given a failed control (e.g. expired permit, occupation mismatch), then it routes to corrective action/risk register.
- [ ] Given export, then checklist results export for review with timestamp.
- [ ] Given audit, then checklist runs are logged.

**Tasks**

- [ ] Backend: `immigration_audit_check` + `work_authorization_checklist` definitions + evaluation service.
- [ ] Backend: auto-evaluation rules + corrective-action linkage.
- [ ] Frontend: checklist runner + per-employee checklist.
- [ ] Rules/Config: configurable controls + country checklist templates.
- [ ] Tests: auto-evaluation + gap-routing tests.

**Covers:** 7.13, 7.18
**Dependencies:** EPIC-07-S02, EPIC-07-S04

### EPIC-07-S12 — Immigration compliance KPIs & dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership user, **I want** immigration KPIs and a dashboard, **so that** I can monitor authorization validity, renewal performance and risk across countries and entities.

**Description**
Compute KPIs (% workforce with valid authorization, documents expiring in 60/30/7 days, on-time renewal rate, overdue renewals, occupation-mismatch count, cancellation-on-time rate, grace-period overstays) and present a filterable dashboard with trends, drill-down and expiry heat windows.

**Acceptance Criteria**

- [ ] Given document data, when KPIs compute, then validity, expiry-window and renewal metrics reflect current data with filters.
- [ ] Given the dashboard, when filtered by country/entity/PRO, then values, trends and at-risk lists update.
- [ ] Given a KPI threshold breach, then the metric is visually flagged.
- [ ] Given drill-down, then underlying documents/employees list (RBAC-respecting).
- [ ] Given refresh, then KPIs update on schedule/events.

**Tasks**

- [ ] Backend: KPI aggregation queries + metrics API.
- [ ] Frontend: immigration dashboard with filters, trends, drill-down, expiry windows.
- [ ] Rules/Config: KPI thresholds per entity.
- [ ] Tests: KPI calculation tests.

**Covers:** 7.14
**Dependencies:** EPIC-07-S02, EPIC-07-S08

### EPIC-07-S13 — Immigration risk matrix & red-flag register

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** an immigration risk matrix with red-flag detection and a risk register, **so that** authorization risks are scored, tracked and remediated before they cause penalties.

**Description**
Maintain a configurable risk register seeded with immigration risks (expired/expiring permits, occupation mismatch, illegal work location, overstay/grace breach, absconding, dependent lapse, missing documents). Auto-create entries from red-flag detectors, score likelihood × impact into a heat-map, and track corrective actions to closure.

**Acceptance Criteria**

- [ ] Given a detected red flag (e.g. expired permit, overstay), when triggered, then a risk-register entry is created with severity.
- [ ] Given a risk entry, when scored, then likelihood × impact yields a rating and heat-map position.
- [ ] Given a corrective action, when assigned, then owner, due date and status are tracked to closure.
- [ ] Given the risk matrix, when filtered by country/entity, then it updates with current ratings.
- [ ] Given export, then the risk register exports for review.

**Tasks**

- [ ] Backend: `immigration_risk_register` (risk, likelihood, impact, rating, action, status) + red-flag detectors.
- [ ] Backend: scoring + heat-map computation.
- [ ] Frontend: risk matrix/heat-map + register view.
- [ ] Rules/Config: configurable scoring + seeded risks.
- [ ] Tests: detector + scoring tests.

**Covers:** 7.15
**Dependencies:** EPIC-07-S08

### EPIC-07-S14 — Immigration workflow design & PRO orchestration

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 8
**As a** System Administrator, **I want** to configure immigration workflows and PRO task orchestration, **so that** issuance, renewal, transfer and cancellation processes are standardised, assignable and auditable.

**Description**
Provide a no-code workflow designer for immigration processes (new permit, renewal, transfer, dependent, cancellation) with PRO task assignment, authority-step checklists, document-upload gates, fees and approvals. PRO workload is queued and balanced, with SLAs and escalation.

**Acceptance Criteria**

- [ ] Given the designer, when an admin configures a process, then matching cases follow the configured steps and gates.
- [ ] Given PRO orchestration, when tasks are created, then they are assigned/queued by entity/country with SLAs.
- [ ] Given a document-upload or approval gate, when unmet, then the step cannot complete.
- [ ] Given a config change, then in-flight cases keep their bound workflow version.
- [ ] Given audit, then workflow execution and PRO actions are logged.

**Tasks**

- [ ] Backend: `immigration_workflow_def` (versioned) + PRO task queue model.
- [ ] Backend: workflow execution + SLA/escalation service.
- [ ] Frontend: workflow designer + PRO task console.
- [ ] Rules/Config: default GCC immigration workflows.
- [ ] Alerts/Workflow: SLA + escalation notifications.
- [ ] Tests: workflow execution + queue/SLA tests.

**Covers:** 7.16
**Dependencies:** EPIC-07-S06, EPIC-07-S08, EPIC-07-S09

### EPIC-07-S15 — Sample Immigration Compliance Policy (configurable policy template)

**Labels:** `user-story`, `policies` · **Priority:** Could · **Estimate:** 3
**As a** Compliance Officer, **I want** a configurable Immigration Compliance Policy template with versioning and acknowledgement, **so that** the organisation's immigration rules are documented, published and acknowledged.

**Description**
Provide a configurable Immigration Compliance Policy (scope, responsibilities, document obligations, renewal duties, transfer/cancellation rules, country addendums) as a versioned policy artifact that can be published, acknowledged by relevant roles, and exported as PDF.

**Acceptance Criteria**

- [ ] Given the policy template, when edited, then sections and country addendums are configurable and versioned.
- [ ] Given publication, then the policy is issued for acknowledgement to in-scope roles and an export is produced.
- [ ] Given an acknowledgement, then version, user and timestamp are recorded.
- [ ] Given a new version, then re-acknowledgement can be requested.
- [ ] Given audit, then policy versions and acknowledgements are retrievable.

**Tasks**

- [ ] Backend: `immigration_policy` (version, sections, addendums) + acknowledgement record.
- [ ] Backend: publication + export service.
- [ ] Frontend: policy editor + acknowledgement screen.
- [ ] Rules/Config: country addendum templates.
- [ ] Tests: versioning + acknowledgement tests.

**Covers:** 7.17
**Dependencies:** —
