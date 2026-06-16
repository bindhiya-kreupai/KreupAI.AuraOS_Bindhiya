# EPIC-30: Chapter 30 – Document Retention and HR Audit Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 30 – Document Retention and HR Audit Compliance
> **Module:** Compliance / Audit · **Labels:** `epic`, `gcc-compliance`, `audit`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a complete HR document-retention and HR-audit compliance engine in AuraOS: a configurable **document retention schedule** per record type and country, a governed digital document store and physical-file controls, access control and data-privacy enforcement, document-expiry management, litigation hold, controlled disposal, and a full **HR audit framework** with checklist, sampling, findings, KPIs and risk matrix. The outcome is that every HR record across the employee lifecycle is classified, retained for the legally required period, secured, expiry-tracked, held when litigation requires, disposed of only when authorised — and that HR can be audited end-to-end with evidence.

## Business Value

GCC labour, immigration, tax and social-insurance regimes mandate retention of HR records (contracts, payroll/wage, WPS, social-insurance, immigration, attendance) for defined periods; inability to produce them in an authority inspection or labour claim leads to fines, adverse rulings and lost defences, while keeping personal/medical data beyond its lawful period breaches data-privacy law. Automating the retention schedule, expiry alerts, access control, litigation hold and authorised disposal — plus a repeatable HR audit framework — eliminates record gaps, reduces privacy and legal exposure, and makes the entire HR function audit-ready on demand.

## Requirements Covered (handbook sections)

- 30.1 Introduction
- 30.2 Objectives of HR Document Retention
- 30.3 GCC Record-Keeping Context
- 30.4 HR Document Governance Framework
- 30.5 HR Document Policy
- 30.6 Employee File Structure
- 30.7 Recruitment Records
- 30.8 Contract Records
- 30.9 Immigration Records
- 30.10 Payroll and Wage Records
- 30.11 WPS, Mudad and Wage Protection Records
- 30.12 Social Insurance and Pension Records
- 30.13 Attendance and Leave Records
- 30.14 Performance Records
- 30.15 Training and Competency Records
- 30.16 Disciplinary and Grievance Records
- 30.17 Medical and Sensitive Records
- 30.18 HSE and Work Injury Records
- 30.19 Separation and Final Settlement Records
- 30.20 Document Retention Schedule
- 30.21 Digital Document Management
- 30.22 Physical File Controls
- 30.23 Access Control
- 30.24 Data Privacy and Confidentiality
- 30.25 Document Expiry Management
- 30.26 Litigation Hold
- 30.27 Document Disposal
- 30.28 HR Audit Framework
- 30.29 HR Audit Checklist
- 30.30 HR Audit KPIs
- 30.31 Document Retention Risk Matrix
- 30.32 HRMS Document Automation Design
- 30.33 HR Document Dashboard
- 30.34 Monthly HR Document Compliance Pack
- 30.35 Sample Employee File Audit Sheet
- 30.36 Sample Document Retention Register
- 30.37 Sample Monthly Document Compliance Certificate
- 30.38 Key Takeaways

## Out of Scope

- The source business processes that generate records (recruitment, payroll, immigration, etc.) are owned by their respective epics — this epic governs the classification, retention, security, expiry, hold, disposal and audit of the resulting records.
- Document-expiry for live operational items (e.g. visa/permit renewal alerts in active employment) is owned by EPIC-07 — this epic manages retention-driven and record-lifecycle expiry.
- Platform RBAC primitives and the audit-trail engine are provided by EPIC-34/platform — this epic configures and consumes them for documents and audit.
- Master compliance checklist/red-flag engine (EPIC-37) and KPI library (EPIC-38) — this epic delivers the document-retention and HR-audit-specific checklist, KPIs and risk matrix and integrates with those engines.

## Dependencies

- EPIC-02 (Regulatory Framework — country record-keeping/retention references)
- EPIC-08 (Employee Records Management — employee file structure, document matrix, access control baseline)
- EPIC-34 (HRMS Configuration — document management, RBAC, audit-trail, rule engine)
- Record-source epics (EPIC-04/05 recruitment, EPIC-10/11 payroll/WPS, EPIC-07/29 immigration, EPIC-13/14/15 social insurance, EPIC-19/20 attendance/leave, EPIC-24 HSE, EPIC-25/26 ER/disciplinary, EPIC-27/28 separation/EOSB)

## Epic Definition of Done

- [ ] A configurable retention schedule defines retention period, trigger event and disposal action per record type and country, applied automatically.
- [ ] Every HR record type (recruitment→separation) is classified into the file structure with its retention and sensitivity.
- [ ] Digital store controls, physical-file controls, access control and data-privacy enforcement are live and audited.
- [ ] Document-expiry management, litigation hold and authorised-disposal workflows are operational with alerts and approvals.
- [ ] An HR audit framework with checklist, sampling, findings, corrective actions, KPIs and risk matrix is delivered.
- [ ] Employee File Audit Sheet, Document Retention Register, monthly pack and certificate are produced with RBAC and sign-off.
- [ ] Every document action (access, hold, disposal, audit) is captured in the audit trail.

---

## User Stories

### EPIC-30-S01 — Document Retention Foundation, Governance, Policy & Objectives

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** the HR document-retention domain, GCC record-keeping context, governance framework and policy modelled as configurable reference data, **so that** AuraOS applies one consistent retention-and-audit framework across all entities.

**Description**
Establishes the module foundation: objectives, the GCC record-keeping context (per-country statutory retention drivers), the document governance framework (owner roles, retention authority, segregation of duties for disposal), and a configurable HR Document Policy (classification, retention, access, disposal, hold). Provides inline guidance and anchors all downstream record-classification and audit stories.

**Acceptance Criteria**

- [ ] Given the module, when opened, then objectives, GCC record-keeping context and governance roles are configurable and shown inline.
- [ ] Given the document policy, when configured, then classification, retention, access, disposal and hold rules are captured and versioned.
- [ ] Given governance roles, when set, then document-owner, retention-authority and disposal-approver duties and SoD are enforceable downstream.
- [ ] Given guidance content (30.1–30.5), then it is editable per entity without code, versioned and EN/AR.
- [ ] Given any governance/policy change, then it is versioned with effective date and audited.

**Tasks**

- [ ] Backend: `doc_governance` + `doc_policy` entities (classificationRules, retentionRules, accessRules, disposalRules, holdRules)
- [ ] Backend: guidance content store keyed by section with locale/version
- [ ] Frontend: governance + policy configuration screens
- [ ] Rules/Config: seed document policy and governance roles; per-country record-keeping context
- [ ] Tests: unit tests for policy versioning and SoD evaluation

**Covers:** 30.1, 30.2, 30.3, 30.4, 30.5
**Dependencies:** EPIC-02, EPIC-08

### EPIC-30-S02 — Employee File Structure & Document Classification Model

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** a configurable employee file structure and document classification model, **so that** every HR record is filed in the right section with its document type, sensitivity and retention class.

**Description**
Defines the standard employee file structure (sections/folders) and a document classification taxonomy: each document type maps to a file section, a sensitivity level (general/confidential/medical/sensitive), and a retention class. This taxonomy is the backbone the retention schedule, access control, privacy rules and audit all key off, and aligns with the EPIC-08 mandatory document matrix.

**Acceptance Criteria**

- [ ] Given the file structure, when configured, then sections/sub-sections are defined per entity and documents file into them.
- [ ] Given the classification model, when set, then each document type has a section, sensitivity level and retention class.
- [ ] Given a new document type, when added in config, then it is classified without code change.
- [ ] Given the model, then it aligns with the EPIC-08 mandatory document matrix and flags unmapped document types.
- [ ] Given any classification change, then it is versioned and audited.

**Tasks**

- [ ] Backend: `doc_file_structure` + `doc_type_classification` entities (docType, section, sensitivity, retentionClass)
- [ ] Backend: unmapped-document-type detector
- [ ] Frontend: file-structure + classification configuration screens
- [ ] Rules/Config: seed standard sections and document-type taxonomy
- [ ] Tests: unit tests for classification resolution and unmapped detection

**Covers:** 30.6
**Dependencies:** EPIC-30-S01, EPIC-08

### EPIC-30-S03 — Lifecycle Record Type Coverage (Recruitment → Separation)

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 13
**As a** Compliance Officer, **I want** every HR record category across the employee lifecycle modelled with its own retention class, sensitivity, trigger event and source linkage, **so that** recruitment, contract, immigration, payroll, WPS, social-insurance, attendance/leave, performance, training, disciplinary/grievance, medical, HSE and separation records are all governed consistently.

**Description**
Configures the full set of HR record categories so each is classified and bound to its source: recruitment records; contract records; immigration records; payroll and wage records; WPS/Mudad and wage-protection records; social-insurance and pension records; attendance and leave records; performance records; training and competency records; disciplinary and grievance records; medical and sensitive records; HSE and work-injury records; separation and final-settlement records. Each category gets its retention class, sensitivity, retention-trigger event (e.g. from termination date, from document date) and the source epic/event that creates it.

**Acceptance Criteria**

- [ ] Given each record category, when configured, then it has a retention class, sensitivity, trigger event and source linkage.
- [ ] Given medical/sensitive and disciplinary/grievance records, then they are flagged highest-sensitivity with restricted access by default.
- [ ] Given payroll/WPS/social-insurance/immigration records, then their statutory retention drivers per country are captured.
- [ ] Given a record created by a source epic, when ingested, then it is auto-classified into the correct category and section.
- [ ] Given separation/final-settlement records, then their retention triggers from the separation date.
- [ ] Given any category configuration change, then it is versioned and audited.

**Tasks**

- [ ] Backend: `doc_record_category` config for all lifecycle categories (retentionClass, sensitivity, triggerEvent, sourceRef)
- [ ] Backend: ingestion classifier auto-mapping records from source epics
- [ ] Frontend: record-category configuration matrix across the lifecycle
- [ ] Rules/Config: seed all categories (recruitment→separation) with sensitivity and triggers per country
- [ ] Tests: unit tests for category classification and trigger derivation per category

**Covers:** 30.7, 30.8, 30.9, 30.10, 30.11, 30.12, 30.13, 30.14, 30.15, 30.16, 30.17, 30.18, 30.19
**Dependencies:** EPIC-30-S02

### EPIC-30-S04 — Document Retention Schedule Engine

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** a configurable retention schedule that sets retention period, trigger and disposal action per record type and country, **so that** every record's retain-until date and disposal eligibility are computed automatically.

**Description**
The core retention engine: a schedule defining, per record category and country, the retention period (e.g. payroll/wage records N years from period end; contract records N years from termination; medical records per privacy law), the trigger event from which retention runs, the resulting retain-until date, and the disposal action on expiry (review/dispose/anonymise). The engine stamps every record with its retain-until date and computes disposal eligibility, feeding expiry management and disposal.

**Acceptance Criteria**

- [ ] Given the schedule, when configured, then each record category/country has a retention period, trigger event and disposal action, effective-dated.
- [ ] Given a record, when ingested or its trigger occurs, then its retain-until date is computed and stamped.
- [ ] Given different countries, when their retention periods differ for the same category, then the correct country period applies.
- [ ] Given the longest-applicable-period rule, when a record is subject to multiple drivers, then the longest retention wins.
- [ ] Given a new country/period in config, then the engine applies it with no code change; any schedule change is audited.

**Tasks**

- [ ] Backend: `doc_retention_schedule` (recordCategory, countryCode, retentionPeriod, triggerEvent, disposalAction, effectiveFrom)
- [ ] Backend: retain-until computation service stamping records; longest-period resolution
- [ ] Frontend: retention-schedule configuration grid (category × country)
- [ ] Rules/Config: seed GCC statutory retention periods per category/country
- [ ] Tests: unit tests for retain-until computation, country variance, longest-period

**Covers:** 30.20
**Dependencies:** EPIC-30-S03

### EPIC-30-S05 — Digital Document Management Controls

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** governed digital document storage with versioning, integrity, metadata and immutability controls, **so that** electronic HR records are securely stored, tamper-evident and retrievable for audit.

**Description**
Provides the digital store controls: upload with mandatory metadata (employee, category, country, document date), versioning, integrity hashing/tamper-evidence, immutability for finalised records, indexing/search, and retention-stamp linkage. Ensures every stored record carries its classification, sensitivity, retain-until date and access policy, and is retrievable on demand for inspections and audits.

**Acceptance Criteria**

- [ ] Given a document upload, when stored, then mandatory metadata (employee, category, country, date) is captured and the document classified and retention-stamped.
- [ ] Given a finalised record, when stored, then it is immutable and versioned; superseded versions are retained.
- [ ] Given integrity controls, when a record is retrieved, then a tamper-evidence hash validates it is unchanged.
- [ ] Given search, when queried by employee/category/date/retention status, then matching records are returned subject to access control.
- [ ] Given any store action, then it is audited.

**Tasks**

- [ ] Backend: `doc_record` store entity (metadata, version, hash, immutableFlag, retainUntil, accessPolicyRef) + integrity hashing
- [ ] Backend: versioning + immutability enforcement + indexed search
- [ ] Frontend: document store UI (upload, version history, search)
- [ ] Rules/Config: mandatory-metadata rules per category
- [ ] Tests: unit tests for integrity validation, immutability, search

**Covers:** 30.21
**Dependencies:** EPIC-30-S04, EPIC-34

### EPIC-30-S06 — Physical File Controls

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**As an** HR Admin, **I want** physical HR file controls (register, location, check-in/out, custody), **so that** paper records are tracked, located and accounted for alongside their digital counterparts.

**Description**
Manages physical files where paper originals exist: a physical-file register with file ID, location (cabinet/box/archive), custody, check-in/out log, and linkage to the corresponding digital record. Supports archive/off-site tracking, missing-file flagging, and aligns physical retention/disposal with the digital schedule so paper and electronic copies are governed together.

**Acceptance Criteria**

- [ ] Given a physical file, when registered, then file ID, location, custodian and linked digital record are captured.
- [ ] Given check-out/check-in, when logged, then custody and return-due are tracked and overdue returns flagged.
- [ ] Given the retention schedule, when a physical file is due for disposal, then it is flagged in step with its digital record.
- [ ] Given a missing/unreturned file, then it is flagged and escalated.
- [ ] Given any physical-file action, then it is audited.

**Tasks**

- [ ] Backend: `doc_physical_file` entity (fileId, location, custodian, digitalRecordRef) + check-in/out log
- [ ] Backend: overdue-return + missing-file detection; disposal alignment with schedule
- [ ] Frontend: physical-file register + check-in/out screen
- [ ] Rules/Config: location taxonomy + custody rules
- [ ] Tests: unit tests for check-in/out and overdue/missing flags

**Covers:** 30.22
**Dependencies:** EPIC-30-S04

### EPIC-30-S07 — Access Control for HR Records

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As a** System Administrator, **I want** sensitivity-based, role-based access control over HR records with full access logging, **so that** only authorised roles can view/download each record class and every access is traceable.

**Description**
Implements record-level access control keyed off sensitivity and role: general records visible to HR Admin/Manager; confidential to restricted roles; medical/sensitive and disciplinary/grievance to named roles only (e.g. Compliance/ER); employee self-service limited to own non-restricted records. Every view/download/print is logged. Access is enforced on the digital store and search results.

**Acceptance Criteria**

- [ ] Given a record's sensitivity, when access is attempted, then only roles permitted for that sensitivity can view/download it.
- [ ] Given medical/sensitive/disciplinary records, then access is restricted to named roles and denied to others (including general HR).
- [ ] Given employee self-service, then an employee sees only their own non-restricted records.
- [ ] Given any view/download/print, then it is logged with user, record, timestamp and action.
- [ ] Given an access-policy change, then it is versioned and audited.

**Tasks**

- [ ] Backend: record-level access enforcement keyed on sensitivity + role; access-log entity
- [ ] Backend: self-service scoping to own records
- [ ] Frontend: access-policy configuration + access-log viewer
- [ ] Rules/Config: sensitivity→role access matrix
- [ ] Tests: unit tests for permitted/denied access and self-service scoping

**Covers:** 30.23
**Dependencies:** EPIC-30-S02, EPIC-30-S05, EPIC-34

### EPIC-30-S08 — Data Privacy & Confidentiality Enforcement

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** data-privacy and confidentiality rules enforced over HR records (purpose limitation, minimisation, lawful retention, subject requests), **so that** personal and sensitive data is handled per GCC data-protection law.

**Description**
Adds privacy enforcement over the document store: purpose tagging and minimisation for sensitive categories, lawful-retention enforcement (no keeping personal data beyond its retention period — driving anonymise/dispose at expiry), masking/redaction on export, and support for data-subject access/erasure requests within the legal constraints (records under retention/hold cannot be erased early). Aligns with the privacy obligations of the source modules.

**Acceptance Criteria**

- [ ] Given a sensitive record, when handled, then purpose tag and minimisation rules apply and over-collection is flagged.
- [ ] Given retention expiry, when reached for personal data, then the configured anonymise/dispose action is enforced (no indefinite retention).
- [ ] Given an export, when it includes sensitive fields, then masking/redaction is applied per role.
- [ ] Given a data-subject request, when raised, then access/erasure is processed within legal limits, with records under retention/litigation hold excluded from early erasure and the reason recorded.
- [ ] Given any privacy action, then it is audited.

**Tasks**

- [ ] Backend: privacy tags + minimisation checks; subject-request workflow honouring retention/hold
- [ ] Backend: masking/redaction on export by role
- [ ] Frontend: privacy/subject-request console
- [ ] Rules/Config: per-category privacy rules and masking policy
- [ ] Tests: unit tests for erasure-vs-hold conflict and masking

**Covers:** 30.24
**Dependencies:** EPIC-30-S04, EPIC-30-S07

### EPIC-30-S09 — Document Expiry Management

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** document expiry and retention-due dates tracked with tiered alerts, **so that** expiring documents are renewed/refiled and records reaching end-of-retention are actioned on time.

**Description**
Tracks two kinds of expiry: document validity expiry (e.g. a record that must be refreshed) and retention expiry (retain-until reached). Drives tiered alerts (e.g. 60/30/7 days before document validity expiry; and at retention-due) to the responsible role, surfaces an expiry worklist, and hands retention-due records to the disposal workflow. Distinguishes from active operational visa/permit expiry (owned by EPIC-07) by focusing on record-lifecycle expiry.

**Acceptance Criteria**

- [ ] Given a document with a validity-expiry date, when within 60/30/7 days, then alerts fire to the responsible role and it appears on the expiry worklist.
- [ ] Given a record reaching its retain-until date, when due, then it is flagged retention-due and handed to the disposal workflow.
- [ ] Given an expiry worklist, then it filters by type, category, entity and due window.
- [ ] Given an actioned expiry (renewed/refiled/queued for disposal), then status updates and the alert clears.
- [ ] Given any expiry action, then it is audited.

**Tasks**

- [ ] Backend: expiry tracker over validity-expiry and retain-until; tiered alert scheduler
- [ ] Backend: retention-due → disposal-queue hand-off
- [ ] Frontend: expiry worklist with filters
- [ ] Rules/Config: alert-offset configuration (60/30/7) per document type
- [ ] Alerts/Workflow: tiered expiry alerts + retention-due flag
- [ ] Tests: unit tests for alert offsets and retention-due hand-off

**Covers:** 30.25
**Dependencies:** EPIC-30-S04

### EPIC-30-S10 — Litigation Hold

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** to place and manage litigation holds on records/employees, **so that** documents relevant to a claim or investigation cannot be disposed of or erased until the hold is released.

**Description**
Provides litigation/legal hold: a Compliance/Legal user places a hold scoped to an employee, case, category or date range; held records are locked against disposal, expiry-disposal and early erasure regardless of retention status; the hold is tracked with reason, scope, owner and authority/case reference; and release requires authorisation. Held records are clearly flagged everywhere they appear, and the hold overrides retention expiry and data-subject erasure.

**Acceptance Criteria**

- [ ] Given a litigation hold, when placed, then scoped records are locked against disposal, expiry-disposal and erasure with a clear flag.
- [ ] Given a held record, when retention expiry or a subject-erasure request occurs, then disposal/erasure is blocked and the hold reason shown.
- [ ] Given the hold, then reason, scope, owner and case reference are captured and audited.
- [ ] Given a release, when authorised, then the hold lifts and normal retention/disposal resumes from the correct date.
- [ ] Given RBAC, only Compliance/Legal roles may place/release holds; every hold action is audited.

**Tasks**

- [ ] Backend: `doc_litigation_hold` entity (scope, reason, owner, caseRef, status) + disposal/erasure lock
- [ ] Backend: hold-override over retention expiry and subject erasure
- [ ] Frontend: litigation-hold console with scope builder
- [ ] Rules/Config: hold scopes (employee/case/category/date)
- [ ] Alerts/Workflow: hold place/release authorisation
- [ ] Tests: unit tests for lock, override and release

**Covers:** 30.26
**Dependencies:** EPIC-30-S04, EPIC-30-S08

### EPIC-30-S11 — Document Disposal Workflow

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a controlled, approved document-disposal workflow with a disposal certificate, **so that** records are destroyed/anonymised only when eligible, authorised and evidenced.

**Description**
Handles end-of-retention disposal: retention-due records (not under hold) enter a disposal queue; a maker-checker approval (preparer ≠ approver) authorises disposal per the schedule's disposal action (destroy/anonymise); the system records what was disposed, when, by/approved-by whom, and produces a disposal certificate/log for evidence. Held records are excluded; disposal is irreversible and fully audited.

**Acceptance Criteria**

- [ ] Given retention-due records, when queued, then those under litigation hold are excluded automatically.
- [ ] Given a disposal batch, when approved, then maker-checker requires an approver different from the preparer before disposal executes.
- [ ] Given the disposal action, when executed, then records are destroyed or anonymised per the schedule and a disposal certificate/log is generated.
- [ ] Given an attempt to dispose a held or not-yet-due record, then it is blocked with a clear reason.
- [ ] Given any disposal, then it is irreversibly recorded and audited (what, when, who, approval).

**Tasks**

- [ ] Backend: `doc_disposal_batch` + `doc_disposal_log` entities; hold exclusion + maker-checker
- [ ] Backend: destroy/anonymise executor + disposal-certificate generator
- [ ] Frontend: disposal queue + approval + certificate view
- [ ] Rules/Config: disposal action per schedule; approval roles
- [ ] Alerts/Workflow: maker-checker approval + block on held/not-due
- [ ] Tests: integration test for hold exclusion, preparer≠approver, certificate

**Covers:** 30.27
**Dependencies:** EPIC-30-S04, EPIC-30-S09, EPIC-30-S10

### EPIC-30-S12 — HR Audit Framework & Sampling

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**As an** Internal Auditor, **I want** an HR audit framework with audit scopes, sampling and finding-to-corrective-action tracking, **so that** I can run repeatable, evidence-based HR audits across all modules.

**Description**
Delivers the HR audit framework: configurable audit scopes (by module/domain — recruitment, payroll, WPS, social insurance, immigration, leave/attendance, benefits, HSE, ER/disciplinary, separation, documents), a sampling engine (random/risk-based/stratified sample selection over populations), an audit execution model linking samples to tests, and a findings register with severity, root cause, owner and corrective-action tracking to closure. This is the engine the audit checklist (S13) runs within.

**Acceptance Criteria**

- [ ] Given an audit scope, when configured, then its population, tests and sampling method are defined.
- [ ] Given a sampling method (random/risk-based/stratified), when run, then a defensible sample is selected and recorded with the method and seed.
- [ ] Given a sample, when tested, then each item is scored Pass/Fail/NA with evidence linked.
- [ ] Given a failed test, when raised as a finding, then severity, root cause, owner and corrective action are captured and tracked to closure.
- [ ] Given an audit, then a report can be generated; RBAC restricts audit setup to Internal Auditor / Compliance Officer; all actions audited.

**Tasks**

- [ ] Backend: `hr_audit_scope` + `hr_audit_run` + `hr_audit_sample` + `hr_audit_finding` entities
- [ ] Backend: sampling engine (random/risk-based/stratified) + finding/CAP tracker
- [ ] Frontend: audit setup + sampling + execution + findings screens
- [ ] Rules/Config: per-module audit scopes, populations and tests
- [ ] Tests: unit tests for sampling determinism and finding lifecycle

**Covers:** 30.28
**Dependencies:** EPIC-30-S03, EPIC-30-S04

### EPIC-30-S13 — HR Audit Checklist & Document Retention Risk Matrix

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable HR audit checklist and a document-retention risk matrix with red-flag detection, **so that** I can verify document/retention/audit compliance and track risks to closure.

**Description**
Provides a configurable HR audit checklist (file completeness, classification correctness, retention-schedule adherence, access-control compliance, privacy compliance, expiry actioning, litigation-hold integrity, disposal authorisation, audit-finding closure) runnable within the audit framework, and a document-retention risk matrix seeded with common risks (missing mandatory documents, over-retention of personal data, disposal without approval, held-record disposed, unauthorised access, expired-not-actioned). System red-flags auto-create findings; risks tracked with likelihood/impact/owner/mitigation and a heatmap.

**Acceptance Criteria**

- [ ] Given the checklist, when run for a scope/period, then each item is scored Pass/Fail/NA with evidence links.
- [ ] Given system red-flags (missing mandatory doc, over-retention, disposal-without-approval, access violation, expired-not-actioned), then they auto-create findings.
- [ ] Given the risk matrix, then each risk has likelihood, impact, score, owner, mitigation, with a heatmap.
- [ ] Given a failed item, then a corrective action can be raised and tracked to closure.
- [ ] Given RBAC, only Internal Auditor / Compliance Officer may edit templates and risks.

**Tasks**

- [ ] Backend: `hr_audit_checklist_template` + `hr_audit_checklist_result` + `doc_retention_risk` entities
- [ ] Backend: red-flag-to-finding generator
- [ ] Frontend: checklist runner + risk heatmap
- [ ] Alerts/Workflow: corrective-action raise and reminders
- [ ] Tests: unit tests for scoring and auto-findings

**Covers:** 30.29, 30.31
**Dependencies:** EPIC-30-S12

### EPIC-30-S14 — HR Audit KPIs & HR Document Dashboard

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership user, **I want** HR-audit KPIs and an HR document dashboard, **so that** I can see file completeness, retention health, expiry, disposal and audit status at a glance.

**Description**
Delivers HR-audit/document KPIs (file completeness %, mandatory-document coverage, records under retention vs overdue-for-disposal, expiry backlog, litigation holds active, disposals completed/pending approval, access-violation count, audit findings open/closed, corrective-action ageing) and a role-based HR document dashboard with trend charts and drill-down, filterable by entity, record category and period.

**Acceptance Criteria**

- [ ] Given document/audit data, when the dashboard loads, then KPIs render with value, target and trend.
- [ ] Given filters (entity, category, period), when applied, then tiles and charts update consistently.
- [ ] Given a KPI breaching target (e.g. file completeness, overdue disposal), then it is red with drill-down to records/findings.
- [ ] Given RBAC, Executives see summary tiles; Compliance/Audit see operational drill-downs.
- [ ] Given export, then KPI snapshots export for the monthly pack.

**Tasks**

- [ ] Backend: KPI aggregation service + materialized views over records/retention/holds/disposal/findings
- [ ] Backend: KPI definition config (target, formula, direction)
- [ ] Frontend: HR document dashboard with tiles, charts, drill-down, filters
- [ ] Rules/Config: KPI targets per entity
- [ ] Tests: unit tests for KPI calculations and filters

**Covers:** 30.30, 30.33
**Dependencies:** EPIC-30-S04, EPIC-30-S09, EPIC-30-S11, EPIC-30-S12

### EPIC-30-S15 — HRMS Document Automation Design (Events, Rule Engine, Workflow)

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** the document-retention and audit module wired into the event bus, rule engine and workflow engine, **so that** record ingestion, retention, expiry, hold, disposal and audit run straight-through and are fully configurable.

**Description**
Makes the integration backbone explicit: record-creation/separation/expiry events trigger classification, retention-stamping, expiry tracking and disposal queuing; the rule engine holds all parameters (classification, retention schedule, access matrix, privacy rules, disposal actions) configurable per country with effective-dating; the workflow engine drives disposal maker-checker, hold authorisation and audit CAPs; and a standardised audit envelope plus notifications apply throughout.

**Acceptance Criteria**

- [ ] Given the rule engine, when a retention/classification/access parameter changes, then no deployment is needed and it is effective-dated.
- [ ] Given domain events (`record.created`, `employee.separated`, `record.retentionDue`, `litigationHold.placed`), then document handlers react idempotently.
- [ ] Given the workflow engine, then disposal maker-checker, hold authorisation and audit CAP paths are reusable and configurable.
- [ ] Given an unclassifiable record or missing retention rule, when ingested, then it is quarantined/flagged rather than mis-retained.
- [ ] Given all document/audit actions, then a standardised audit envelope is recorded.

**Tasks**

- [ ] Backend: document event handlers with idempotency keys
- [ ] Backend: rule-engine namespace `doc.*` with effective-dated parameter store
- [ ] Backend: workflow templates for disposal, hold and audit CAPs
- [ ] Backend: quarantine for unclassifiable/missing-rule records
- [ ] Rules/Config: parameterise classification, retention, access, privacy, disposal per country
- [ ] Tests: integration tests for idempotency and quarantine

**Covers:** 30.32
**Dependencies:** EPIC-30-S04, EPIC-30-S07, EPIC-30-S11, EPIC-34

### EPIC-30-S16 — Monthly HR Document Compliance Pack & Certificate

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** a one-click Monthly HR Document Compliance Pack with certificate, **so that** I have a complete sign-off-ready evidence bundle of document/retention/audit status each month.

**Description**
Compiles the period's artefacts into one downloadable pack: file-completeness summary, retention register extract, expiry backlog, litigation holds active, disposals completed (with certificates), access-violation summary, audit findings/CAP status, KPI snapshot, and a configurable Monthly Document Compliance Certificate auto-populated with e-attestation. Requires sign-off, is versioned and archived for retention.

**Acceptance Criteria**

- [ ] Given a closed period, when the pack is generated, then it includes completeness, retention extract, expiry backlog, holds, disposals, access violations, findings/CAP and KPI snapshot.
- [ ] Given the certificate, when generated, then it auto-populates entity, completeness %, retention/disposal stats and audit status, with e-attestation (name, role, timestamp).
- [ ] Given outstanding critical items (overdue disposal, open high-severity findings), when generation is attempted, then they are flagged before sign-off.
- [ ] Given a finalised pack, then it is archived immutably with version/retention metadata and exports to PDF/Excel.
- [ ] Given any pack/certificate action, then it is audited.

**Tasks**

- [ ] Backend: compliance-pack assembler + certificate template engine with period data-binding
- [ ] Backend: immutable archive + retention metadata + e-attestation capture
- [ ] Frontend: pack preview + certificate generate/attest + sign-off
- [ ] Alerts/Workflow: sign-off request to Compliance Officer
- [ ] Tests: integration test for pack/certificate contents and flagging

**Covers:** 30.34, 30.37
**Dependencies:** EPIC-30-S11, EPIC-30-S13, EPIC-30-S14

### EPIC-30-S17 — Sample Employee File Audit Sheet (Configurable Form)

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 3
**As an** Internal Auditor, **I want** a configurable Employee File Audit Sheet auto-populated against the mandatory document matrix, **so that** I can verify each employee's file completeness, classification and retention with evidence.

**Description**
Provides a digital, template-driven Employee File Audit Sheet for a given employee: lists each required document (per the mandatory document matrix / record categories), its presence/absence, document date, retain-until date, sensitivity, expiry status and any gaps, with an auditor scoring and notes column. Configurable per entity/country, exports to PDF and attaches to the audit run and monthly pack.

**Acceptance Criteria**

- [ ] Given an employee, when generated, then the sheet auto-lists required documents with present/absent status, date, retain-until, sensitivity and gaps.
- [ ] Given each line, when audited, then the auditor records Pass/Fail/NA, notes and evidence link, contributing to the file-completeness score.
- [ ] Given the template, when configured, then required-document set, header/footer and EN/AR layout are editable per entity/country without code.
- [ ] Given the sheet, then it exports to PDF and attaches to the audit run and monthly pack.
- [ ] Given any audit-sheet action, then it is audited.

**Tasks**

- [ ] Backend: file-audit-sheet template engine bound to mandatory-doc matrix + record store
- [ ] Backend: completeness scoring + PDF export + attachment links
- [ ] Frontend: audit-sheet runner + template editor (EN/AR)
- [ ] Rules/Config: per-entity/country required-document set
- [ ] Tests: unit test for auto-population and completeness scoring

**Covers:** 30.35
**Dependencies:** EPIC-30-S03, EPIC-30-S12

### EPIC-30-S18 — Sample Document Retention Register (Configurable Register)

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** a configurable Document Retention Register listing every record class with its retention, status, expiry and disposal state, **so that** retention compliance is visible, evidenced and exportable.

**Description**
Provides a digital Document Retention Register fed from the retention engine: each record/class with category, country, retention period, trigger event, retain-until date, current status (active/retention-due/held/disposed), and disposal reference. Supports filtering, ageing and export, and feeds the monthly pack and audit. Doubles as the evidence artefact in an authority inspection.

**Acceptance Criteria**

- [ ] Given records under retention, when generated, then each appears with category, country, retention period, trigger, retain-until and status.
- [ ] Given a held or disposed record, then its hold/disposal reference and date are shown.
- [ ] Given filters (category, country, status, retain-until window, entity), then the register updates and exports to Excel/PDF.
- [ ] Given retention-due records, then they are highlighted for action.
- [ ] Given any register view/export, then it is audited.

**Tasks**

- [ ] Backend: `doc_retention_register` view over records + retention/hold/disposal state
- [ ] Backend: ageing/retention-due highlighting + export
- [ ] Frontend: register grid with filters, status indicators, export
- [ ] Rules/Config: register columns per entity
- [ ] Tests: unit tests for status derivation and export

**Covers:** 30.36
**Dependencies:** EPIC-30-S04, EPIC-30-S10, EPIC-30-S11

### EPIC-30-S19 — HR Document & Audit Key Takeaways & In-Product Guidance

**Labels:** `user-story`, `audit` · **Priority:** Could · **Estimate:** 2
**As a** Compliance Officer, **I want** document-retention and HR-audit key takeaways and best-practice guidance surfaced in-product, **so that** users understand obligations and avoid retention, privacy and disposal errors.

**Description**
Surfaces the chapter's key takeaways as a configurable guidance panel and a short readiness checklist for users (classify every record, apply the retention schedule, restrict sensitive-record access, action expiries, honour litigation holds, never dispose without approval, keep files audit-ready). Content is admin-editable, versioned and EN/AR.

**Acceptance Criteria**

- [ ] Given the module home, when opened, then a key-takeaways panel shows configurable guidance.
- [ ] Given a first-time user, then a short readiness checklist of retention/audit essentials is shown.
- [ ] Given guidance content, when edited, then it is versioned and effective-dated.
- [ ] Given localisation, then guidance supports English/Arabic.

**Tasks**

- [ ] Backend: `doc_guidance_content` table (key, body, locale, version)
- [ ] Frontend: key-takeaways panel + first-run checklist
- [ ] Rules/Config: admin-editable guidance EN/AR
- [ ] Tests: unit test for versioning and locale fallback

**Covers:** 30.38
**Dependencies:** EPIC-30-S01
