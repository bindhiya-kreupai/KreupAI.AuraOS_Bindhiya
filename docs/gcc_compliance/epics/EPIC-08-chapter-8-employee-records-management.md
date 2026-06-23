# EPIC-08: Chapter 8 – Employee Records Management

> **Source:** GCC HR Compliance Handbook — Chapter 8 – Employee Records Management
> **Module:** Core HR · **Labels:** `epic`, `gcc-compliance`, `core-hr`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver the AuraOS system of record for employee data and documents: governed employee master data, a standard digital employee file structure, a country-aware mandatory-document matrix, retention scheduling, data-privacy/confidentiality controls, granular access control, data-quality management, ESS self-service updates with change management, and an employee-file completeness score — all under full audit trail and a records dashboard. It is the single source of truth every other AuraOS module reads from.

## Business Value

Incomplete, inconsistent or non-retained records are the most common HR audit failures and a direct liability in GCC labour disputes and authority inspections. A governed records platform guarantees mandatory documents exist and are valid, enforces retention and data-privacy (PDPL) obligations, restricts access on need-to-know, and continuously scores file completeness — turning records from a compliance risk into provable, audit-ready evidence while reducing manual upkeep.

## Requirements Covered (handbook sections)

- 8.1 Introduction
- 8.2 Objectives of Employee Records Management
- 8.3 Employee Record Governance
- 8.4 Employee Master Data
- 8.5 Employee File Structure
- 8.6 Mandatory Document Matrix
- 8.7 Country-Specific Employee Record Considerations
- 8.8 Document Retention
- 8.9 Data Privacy and Confidentiality
- 8.10 Access Control
- 8.11 Data Quality Management
- 8.12 Employee Self-Service Record Updates
- 8.13 Record Change Management
- 8.14 Employee Record Audit
- 8.15 Employee File Completeness Score
- 8.16 Employee Records Dashboard
- 8.17 HRMS Workflow Design for Employee Records
- 8.18 Employee Records Audit Checklist
- 8.19 Common Employee Record Risks
- 8.20 Sample Employee File Index
- 8.21 Key Takeaways

## Out of Scope

- Initial master-data creation/activation during onboarding (EPIC-06; this epic owns ongoing maintenance).
- Long-term retention/disposal of separated employees and litigation hold at enterprise scale (EPIC-30; this epic implements core retention used there).
- Immigration document lifecycle/renewals (EPIC-07; documents are referenced here, not managed here).

## Dependencies

- EPIC-06 (Employee Onboarding) — creates initial records & files
- EPIC-07 (Immigration) — immigration documents referenced in the file
- EPIC-02 (Regulatory Framework) — country record/retention rules
- EPIC-30 (Document Retention & HR Audit) — enterprise retention/audit consumer

## Epic Definition of Done

- [ ] Employee master data is governed with validation, change management and full audit history.
- [ ] A standard employee file structure and country-aware mandatory-document matrix are enforced.
- [ ] Retention schedules, data-privacy controls and granular access control are operational.
- [ ] ESS record updates flow through maker-checker change management with audit capture.
- [ ] Data-quality rules and an employee-file completeness score run continuously.
- [ ] Records dashboard, audit checklist and risk register are live and exportable.
- [ ] Every record view/edit/export is captured in the audit trail under RBAC.

---

## User Stories

### EPIC-08-S01 — Records objectives, governance & key takeaways context

**Labels:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 3
**As an** HR Manager, **I want** the records module to express its objectives, governance model and key takeaways in-product, **so that** ownership, accountability and compliance intent are clear.

**Description**
Embed configurable guidance (introduction, objectives, key takeaways) and a records-governance model defining data owners, stewards, custodians, RACI and review cadence per entity/country. Content and governance config are version-controlled and editable by System Administrator.

**Acceptance Criteria**

- [ ] Given the records workspace, when help is opened, then introduction, objectives and key-takeaways content render per country.
- [ ] Given governance config, when set, then data owners/stewards/custodians and review cadence are defined per entity.
- [ ] Given a content/governance edit, when saved, then a new version is stored and prior retained.
- [ ] Given audit, then governance assignments and content versions are recoverable.

**Tasks**

- [ ] Backend: `records_governance` (entity_id, role, assignee, raci, review_cadence) + `records_guidance_content` (versioned).
- [ ] Backend: versioning + retrieval API.
- [ ] Frontend: governance config + contextual help drawer.
- [ ] Rules/Config: default governance/RACI templates.
- [ ] Tests: versioning + governance-resolution tests.

**Covers:** 8.1, 8.2, 8.3, 8.21
**Dependencies:** —

### EPIC-08-S02 — Employee master data model & maintenance

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 13
**As an** HR Admin, **I want** a complete, validated employee master-data model maintained as the single source of truth, **so that** all modules consume accurate, consistent employee information.

**Description**
Define the canonical master-data domains (personal, contact, identification, nationality/visa status, job/position/grade, contract, compensation reference, bank/IBAN, dependents reference, social-insurance reference, emergency contact). Maintenance is field-validated, country-aware and emits change events so downstream modules stay in sync.

**Acceptance Criteria**

- [ ] Given a master-data edit, when saved, then field-level validations (formats, ranges, country-mandatory fields) are enforced.
- [ ] Given a change to a propagated field (e.g. IBAN, job title), then a `employee.master.updated` event is published for subscribers.
- [ ] Given country context, then country-specific fields (Emirates ID/Iqama/CPR/QID, nationality, sponsor) are required/validated.
- [ ] Given a field with downstream impact, then dependent records (payroll, immigration) are flagged for review.
- [ ] Given RBAC, then field visibility/edit rights follow role and sensitivity class.
- [ ] Given any change, then before/after values, actor and timestamp are audit-logged.

**Tasks**

- [ ] Backend: master-data schema/domains + validation service; migration.
- [ ] Backend: change-event publisher + downstream-impact flagging.
- [ ] Frontend: master-data view/edit with sensitivity-aware fields.
- [ ] Rules/Config: country mandatory-field + validation rules.
- [ ] Tests: validation + event-publish + audit tests.

**Covers:** 8.4
**Dependencies:** EPIC-06

### EPIC-08-S03 — Employee file structure & Sample Employee File Index

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** a standard, configurable employee file structure with an indexed digital file, **so that** every employee's documents are organised consistently and quickly retrievable.

**Description**
Define the standard file structure (sections such as Personal & Identification, Recruitment & Offer, Contract, Immigration, Payroll & Bank, Benefits & Insurance, Leave & Attendance, Performance, Disciplinary, Training, Separation). Each section holds typed documents with metadata. Provide the Sample Employee File Index (section 8.20) as a configurable, auto-generated index/table of contents with export.

**Acceptance Criteria**

- [ ] Given an employee, when the file opens, then the configured section structure renders with documents under each section.
- [ ] Given a document upload, when filed, then it is classified into the correct section with metadata (type, country, issue/expiry, sensitivity).
- [ ] Given the file index, when generated, then a structured index/TOC lists sections and contained documents with status.
- [ ] Given a structure-config change, then it applies to new files while existing files migrate/map safely.
- [ ] Given an index export, then a PDF/Excel file index is produced and timestamped.
- [ ] Given any filing action, then it is audit-logged.

**Tasks**

- [ ] Backend: `employee_file_section` + `employee_document` (section_id, type, metadata, sensitivity); migration.
- [ ] Backend: classification + index-generation/export service.
- [ ] Frontend: employee file viewer with sectioned tabs + index/export.
- [ ] Rules/Config: configurable file-structure template per entity.
- [ ] Tests: classification + index generation tests.

**Covers:** 8.5, 8.20
**Dependencies:** EPIC-08-S02

### EPIC-08-S04 — Mandatory document matrix & country-specific considerations

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** a country/nationality/employment-type-driven mandatory-document matrix, **so that** every employee file holds exactly the documents their jurisdiction requires.

**Description**
Configure the mandatory-document matrix: which documents are required by country, nationality (national vs expat), employment type and entity (e.g. UAE: passport, Emirates ID, residence visa, labour card, signed MOHRE contract; KSA: Iqama, Qiwa contract, GOSI; Bahrain: CPR, LMRA permit). Country-specific considerations (attestation, Arabic contract, authority-registered contract) drive required/conditional items and validity rules.

**Acceptance Criteria**

- [ ] Given an employee's country/nationality/type, when the matrix resolves, then required and conditional documents are determined.
- [ ] Given a UAE expat, then passport, residence visa, Emirates ID, labour card and signed authority contract are required.
- [ ] Given a KSA national, then Iqama is not required but national ID and GOSI registration are, per matrix.
- [ ] Given country considerations (e.g. attestation/Arabic contract), then those validity rules are enforced on the relevant documents.
- [ ] Given a missing/expired mandatory document, then it is flagged and feeds the completeness score.
- [ ] Given audit, then the matrix version applied per employee is traceable.

**Tasks**

- [ ] Backend: `mandatory_document_matrix` (country, nationality, emp_type, doc_type, required, conditions) + resolver.
- [ ] Backend: requirement-evaluation service feeding completeness/flags.
- [ ] Frontend: matrix configuration UI + per-employee requirement view.
- [ ] Rules/Config: seed GCC matrices + country considerations (attestation, Arabic/authority contract).
- [ ] Tests: matrix resolution per country/nationality/type tests.

**Covers:** 8.6, 8.7
**Dependencies:** EPIC-08-S03, EPIC-02

### EPIC-08-S05 — Document retention scheduling

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** retention periods enforced per document type and country, **so that** records are kept for the statutory minimum and not disposed of prematurely (or held beyond limits).

**Description**
Assign retention rules by document category and country (e.g. payroll/wage records and contracts retained for statutory minimums post-separation), compute disposal-eligible dates, support legal/litigation hold that overrides disposal, and queue review/disposal with approval. Integrates with enterprise retention (EPIC-30).

**Acceptance Criteria**

- [ ] Given a document type/country, when retention resolves, then a retention period and earliest-disposal date are set.
- [ ] Given a separated employee, when retention starts, then disposal-eligible dates compute from the separation/event date.
- [ ] Given a litigation/legal hold, when active, then affected documents cannot be disposed regardless of schedule.
- [ ] Given disposal eligibility, when reached, then a review/approval task is queued (no automatic deletion without approval).
- [ ] Given audit, then retention assignment, holds and disposals are logged.

**Tasks**

- [ ] Backend: `retention_rule` + `document_retention` (doc_id, retain_until, hold_flag, disposal_status).
- [ ] Backend: retention-calc + hold + disposal-approval service.
- [ ] Frontend: retention/hold management + disposal-review queue.
- [ ] Rules/Config: per-country/type retention periods.
- [ ] Alerts/Workflow: disposal-eligibility review tasks.
- [ ] Tests: retention calc + hold-override + approval tests.

**Covers:** 8.8
**Dependencies:** EPIC-08-S03, EPIC-30

### EPIC-08-S06 — Data privacy, confidentiality & sensitivity classification

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** records classified by sensitivity with privacy controls and consent handling, **so that** personal and sensitive data are protected per GCC PDPL/data-protection laws.

**Description**
Classify fields/documents by sensitivity (public/internal/confidential/restricted; special categories like medical, disciplinary). Enforce masking, purpose-limited access, consent capture for processing, data-subject request support (access/correction) and breach-relevant logging. Special-category records (medical, grievance) get elevated protection.

**Acceptance Criteria**

- [ ] Given a field/document, when classified, then sensitivity drives masking and access eligibility.
- [ ] Given a non-privileged viewer, when accessing a restricted field, then it is masked/blocked and the attempt is logged.
- [ ] Given consent-required processing, when consent is absent, then the processing/visibility is restricted.
- [ ] Given a data-subject access/correction request, when raised, then a workflow gathers the data and tracks fulfilment within the configured window.
- [ ] Given special-category records, then elevated access rules apply.
- [ ] Given audit, then all sensitive-data access is logged with actor, field and purpose.

**Tasks**

- [ ] Backend: sensitivity classification on fields/docs + masking service; consent + DSAR entities.
- [ ] Backend: purpose-limited access enforcement + access logging.
- [ ] Frontend: masked views + DSAR workflow screen.
- [ ] Rules/Config: PDPL-aligned classification + consent rules per country.
- [ ] Alerts/Workflow: DSAR SLA tracking; restricted-access alerts.
- [ ] Tests: masking, consent-gate, DSAR, access-log tests.

**Covers:** 8.9
**Dependencies:** EPIC-08-S02

### EPIC-08-S07 — Access control (RBAC/ABAC) for records

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** granular role- and attribute-based access control over records, **so that** users see and edit only the records and fields appropriate to their role, entity and need-to-know.

**Description**
Implement RBAC/ABAC scoping records by role (HR Admin, Payroll, PRO, Line Manager, Employee, Auditor), organisational scope (entity/department/country) and field sensitivity. Line Managers see only their team; Auditors get read-only with full logging; employees see only their own record. Includes field-level edit permissions and segregation of duties.

**Acceptance Criteria**

- [ ] Given a user's role and org scope, when they access records, then only in-scope employees/fields are visible.
- [ ] Given a Line Manager, when browsing, then only direct/indirect reports are accessible.
- [ ] Given an Auditor, then access is read-only and every view is logged.
- [ ] Given field-level permissions, when a user lacks edit rights, then the field is read-only/masked.
- [ ] Given segregation of duties, then conflicting permissions (e.g. edit + approve own change) are prevented.
- [ ] Given any access decision, then it is enforced server-side and logged.

**Tasks**

- [ ] Backend: RBAC/ABAC policy model (role, scope, field-sensitivity) + enforcement middleware.
- [ ] Backend: SoD rule checks + access-decision logging.
- [ ] Frontend: scope-aware record lists + permission-aware field rendering.
- [ ] Rules/Config: role-permission matrix per entity/country.
- [ ] Tests: scope, field-permission, SoD enforcement tests.

**Covers:** 8.10
**Dependencies:** EPIC-08-S02, EPIC-08-S06

### EPIC-08-S08 — Data quality management

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As an** HR Manager, **I want** automated data-quality rules and exception management, **so that** master data stays accurate, complete and consistent.

**Description**
Run configurable data-quality checks (completeness, format validity, cross-field consistency, duplicate detection, expiry validity, referential integrity to documents/positions). Surface a data-quality scorecard and exception queue with assignment and resolution, and prevent known-bad data from propagating.

**Acceptance Criteria**

- [ ] Given the data-quality rule set, when executed, then completeness, format, consistency and duplicate checks run across records.
- [ ] Given a rule violation, when detected, then an exception is created with severity and assigned for resolution.
- [ ] Given a duplicate (e.g. same passport/national ID), when found, then it is flagged and blocked from activation propagation.
- [ ] Given the data-quality scorecard, when viewed, then accuracy/completeness/consistency rates show per entity.
- [ ] Given resolution of an exception, then re-validation runs and the scorecard updates.
- [ ] Given audit, then exceptions and resolutions are logged.

**Tasks**

- [ ] Backend: `data_quality_rule` + `data_quality_exception` + scheduled check engine.
- [ ] Backend: duplicate/consistency detectors + scorecard aggregation.
- [ ] Frontend: data-quality scorecard + exception queue.
- [ ] Rules/Config: configurable DQ rules per entity.
- [ ] Tests: detector + scorecard + resolution tests.

**Covers:** 8.11
**Dependencies:** EPIC-08-S02

### EPIC-08-S09 — Employee self-service record updates (ESS)

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As an** Employee (Self-Service), **I want** to view and request updates to my own record, **so that** my personal data stays current while sensitive changes remain controlled.

**Description**
Provide an ESS portal where employees view their record/file and submit updates (contact, address, emergency contact, bank/IBAN, dependents, documents). Low-risk fields may auto-apply; sensitive fields (IBAN, name, ID, nationality) route to HR approval. Document re-uploads (e.g. renewed passport) feed the file and mandatory-matrix.

**Acceptance Criteria**

- [ ] Given an employee, when they open ESS, then only their own record/file is visible.
- [ ] Given a low-risk field update, when submitted within validation, then it applies (or auto-routes per config) and notifies the employee.
- [ ] Given a sensitive field update (IBAN/name/ID), when submitted, then it routes to HR approval before taking effect.
- [ ] Given a document re-upload, when validated, then it updates the file and refreshes mandatory-matrix/expiry status.
- [ ] Given any ESS change, then it is audit-logged with the requesting employee as actor.
- [ ] Given RBAC, then employees cannot view others' data.

**Tasks**

- [ ] Backend: ESS update-request entity + field-risk routing service.
- [ ] Backend: document re-upload handler feeding file/matrix.
- [ ] Frontend: ESS record view + update request forms.
- [ ] Rules/Config: field-risk classification (auto vs approval).
- [ ] Alerts/Workflow: HR approval routing + employee notifications.
- [ ] Tests: routing, validation, own-record-scope tests.

**Covers:** 8.12
**Dependencies:** EPIC-08-S02, EPIC-08-S07

### EPIC-08-S10 — Record change management (maker-checker) & records workflow

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**As an** HR Manager, **I want** all material record changes to flow through configurable change management with maker-checker, **so that** changes are authorised, evidenced and reversible.

**Description**
Provide a configurable records workflow engine where material changes (master-data edits, sensitive ESS updates, document removals) are proposed by a maker and approved by a checker (preparer ≠ approver), with effective-dating, reason capture and full before/after history. Supports bulk changes with batch approval and rollback.

**Acceptance Criteria**

- [ ] Given a material change, when proposed, then it enters a pending state requiring a different approver (preparer ≠ approver).
- [ ] Given approval, when granted, then the change applies with effective date and is recorded with before/after values.
- [ ] Given rejection, then the change is discarded with reason and the record unchanged.
- [ ] Given a bulk change, when submitted, then it routes for batch approval and applies atomically.
- [ ] Given a configurable workflow, then routing varies by change type/entity.
- [ ] Given audit, then full change history (maker, checker, reason, values) is retained and exportable.

**Tasks**

- [ ] Backend: `record_change_request` (entity, field, old, new, maker, checker, effective_date, status) + workflow engine.
- [ ] Backend: maker-checker enforcement + bulk/rollback service.
- [ ] Frontend: change-request submission + approver console.
- [ ] Rules/Config: configurable change-type routing per entity.
- [ ] Alerts/Workflow: approval notifications + escalation.
- [ ] Tests: maker-checker, effective-dating, bulk/rollback tests.

**Covers:** 8.13, 8.17
**Dependencies:** EPIC-08-S02, EPIC-08-S07

### EPIC-08-S11 — Employee record audit & audit checklist

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** record audit capabilities and a configurable audit checklist, **so that** I can verify completeness, validity, access and retention compliance across employee files.

**Description**
Provide an immutable audit log explorer (who viewed/changed what, when) and a configurable Employee Records Audit Checklist (mandatory documents present, valid/non-expired, access appropriately restricted, retention applied, change-management evidence) that auto-evaluates on a sample and routes failures to corrective action.

**Acceptance Criteria**

- [ ] Given the audit log, when queried by employee/user/date/action, then matching access and change events return with full context.
- [ ] Given the audit checklist, when run on a sample, then each control is auto-evaluated where data exists and gaps flagged.
- [ ] Given a failed control (e.g. missing mandatory document, retention not applied), then it routes to corrective action/risk register.
- [ ] Given export, then audit results and logs export for review with timestamp.
- [ ] Given RBAC, then auditors have read-only access and their queries are themselves logged.

**Tasks**

- [ ] Backend: audit-log query API + `records_audit_check` definitions + evaluation service.
- [ ] Backend: auto-evaluation rules + corrective-action linkage.
- [ ] Frontend: audit-log explorer + checklist runner.
- [ ] Rules/Config: configurable audit controls.
- [ ] Tests: log-query + auto-evaluation tests.

**Covers:** 8.14, 8.18
**Dependencies:** EPIC-08-S03, EPIC-08-S04, EPIC-08-S07

### EPIC-08-S12 — Employee file completeness score

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** an automated employee-file completeness score, **so that** I can quickly see which files are complete, missing documents or holding expired records, and drive remediation.

**Description**
Compute a completeness score per employee (and aggregate per entity/department) from the mandatory-document matrix, document validity (non-expired), master-data completeness and required acknowledgements. Weighted, configurable scoring with a status band (e.g. Complete/At-Risk/Incomplete), gap list and remediation tasks.

**Acceptance Criteria**

- [ ] Given an employee, when the score computes, then it reflects mandatory-document presence, validity, master-data completeness and acknowledgements.
- [ ] Given a missing/expired item, when scoring, then the item appears on the gap list and lowers the score.
- [ ] Given configurable weights/bands, when applied, then the status band (Complete/At-Risk/Incomplete) is derived.
- [ ] Given aggregation, when viewed by entity/department, then average and distribution of scores show.
- [ ] Given a remediation action, then it is generated for each gap and tracked.
- [ ] Given recompute triggers (upload, expiry, change), then the score updates.

**Tasks**

- [ ] Backend: completeness-scoring service consuming matrix + validity + master-data; `file_completeness_score` store.
- [ ] Backend: gap-list + remediation-task generator + recompute triggers.
- [ ] Frontend: per-employee score + gap list; aggregate view.
- [ ] Rules/Config: configurable weights & bands.
- [ ] Tests: scoring + recompute + gap-generation tests.

**Covers:** 8.15
**Dependencies:** EPIC-08-S04

### EPIC-08-S13 — Employee records dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership user, **I want** an employee-records dashboard, **so that** I can monitor data quality, file completeness, retention and access compliance across the organisation.

**Description**
Provide a filterable dashboard surfacing completeness-score distribution, mandatory-document gaps, expiring documents, data-quality scorecard, pending change requests, retention/disposal queue and access-anomaly indicators, by country/entity/department with trends and drill-down.

**Acceptance Criteria**

- [ ] Given records data, when the dashboard loads, then completeness, DQ, document-gap and retention metrics render with filters.
- [ ] Given filters, when applied, then values, trends and at-risk lists update.
- [ ] Given a threshold breach (e.g. completeness < target), then the metric is flagged.
- [ ] Given drill-down, then underlying employees/files list (RBAC-respecting).
- [ ] Given refresh, then metrics update on schedule/events.

**Tasks**

- [ ] Backend: dashboard aggregation queries/materialized views + metrics API.
- [ ] Frontend: records dashboard with filters, trends, drill-down.
- [ ] Rules/Config: dashboard thresholds per entity.
- [ ] Tests: aggregation correctness tests.

**Covers:** 8.16
**Dependencies:** EPIC-08-S08, EPIC-08-S12

### EPIC-08-S14 — Common employee record risks register & risk matrix

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** a records risk register with red-flag detection and a risk matrix, **so that** common record risks are scored, tracked and remediated.

**Description**
Seed a risk register with common record risks (missing/expired mandatory documents, inaccurate master data, unauthorised access, premature disposal/retention breach, unconsented sensitive processing, duplicate employees, stale ESS data). Auto-create entries from detectors, score likelihood × impact into a heat-map, and track corrective actions to closure.

**Acceptance Criteria**

- [ ] Given a detected red flag (e.g. expired mandatory document, restricted-field access by unauthorised user), then a risk entry is created with severity.
- [ ] Given a risk entry, when scored, then likelihood × impact yields a rating and heat-map position.
- [ ] Given a corrective action, when assigned, then owner, due date and status are tracked to closure.
- [ ] Given the matrix, when filtered by entity/country, then ratings update.
- [ ] Given export, then the risk register exports for review.

**Tasks**

- [ ] Backend: `records_risk_register` (risk, likelihood, impact, rating, action, status) + red-flag detectors.
- [ ] Backend: scoring + heat-map computation.
- [ ] Frontend: risk matrix/heat-map + register view.
- [ ] Rules/Config: configurable scoring + seeded risks.
- [ ] Tests: detector + scoring tests.

**Covers:** 8.19
**Dependencies:** EPIC-08-S04, EPIC-08-S07
