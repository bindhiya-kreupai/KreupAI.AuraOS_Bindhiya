# EPIC-33: Chapter 33 – HR Forms and Templates

> **Source:** GCC HR Compliance Handbook — Chapter 33 – HR Forms and Templates
> **Module:** Forms · **Labels:** `epic`, `gcc-compliance`, `forms`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Build a **configurable digital HR forms engine** in AuraOS that replaces paper/PDF HR forms across the entire employee lifecycle with governed, versioned, workflow-driven digital forms. The engine provides a central forms library, a drag-and-drop form builder, routing/approval, e-signature, audit trail, and automatic write-back of approved form data into the relevant HRMS modules — so every HR transaction starts from a controlled, traceable form.

## Business Value

Eliminates uncontrolled, inconsistent paper forms that create compliance gaps in GCC audits (MOHRE/MHRSD/labour inspections), removes manual re-keying errors between forms and the HRMS, and gives a single audit trail for every request, approval and signature. Standardised, version-controlled forms cut processing time, enforce mandatory fields and country rules at the point of capture, and produce ready audit/KPI evidence.

## Requirements Covered (handbook sections)

- 33.1 Introduction
- 33.2 Objectives of HR Forms and Templates
- 33.3 HR Form Governance Framework
- 33.4 HR Forms Library
- 33.5 Recruitment Forms
- 33.6 Manpower Requisition Form
- 33.7 Interview Evaluation Form
- 33.8 Candidate Selection and Offer Approval Form
- 33.9 Employment Forms
- 33.10 Offer Letter Template
- 33.11 Employment Contract Checklist
- 33.12 Employee Joining Form
- 33.13 Payroll Forms
- 33.14 Salary Advance Form
- 33.15 Employee Loan Request Form
- 33.16 Overtime Approval Form
- 33.17 Payroll Change Form
- 33.18 Leave and Attendance Forms
- 33.19 Leave Request Form
- 33.20 Attendance Regularization Form
- 33.21 Comp-Off Request Form
- 33.22 Benefits Forms
- 33.23 Medical Insurance Enrollment Form
- 33.24 Accommodation Request Form
- 33.25 Asset Issue Form
- 33.26 Employee Relations Forms
- 33.27 Grievance Form
- 33.28 Disciplinary Hearing Record
- 33.29 Warning Letter Template
- 33.30 Separation Forms
- 33.31 Resignation Form
- 33.32 Handover Form
- 33.33 Exit Clearance Form
- 33.34 Final Settlement Form
- 33.35 Exit Interview Form
- 33.36 Compliance Forms
- 33.37 Policy Acknowledgement Form
- 33.38 Document Submission Form
- 33.39 Visa / Work Permit Renewal Form
- 33.40 HRMS Forms Automation Design
- 33.41 HR Forms Audit Checklist
- 33.42 HR Forms KPIs
- 33.43 HR Forms Risk Matrix
- 33.44 Monthly HR Forms Compliance Pack
- 33.45 Key Takeaways

## Out of Scope

- The downstream business logic of each module (payroll calculation, EOSB, visa processing) — owned by their respective epics; this epic owns the _forms_ and their write-back, not the processing.
- Document retention/archival policy itself (EPIC-30) beyond storing submitted forms.
- The full Policy engine and acknowledgement logic (owned by EPIC-32; this epic exposes the policy acknowledgement _form_).
- External e-signature vendor contracting (an adapter is in scope; vendor selection is not).

## Dependencies

- EPIC-08 (Employee master), EPIC-32 (Policies — shares the configurable forms engine), and the destination modules forms write into (EPIC-03/04/05/06, 10, 19/20, 22/23, 25/26, 27/28, 29). Workflow/approval, RBAC, e-signature, audit-trail and notifications are platform services.

## Epic Definition of Done

- [ ] A configurable forms engine supports a drag-and-drop builder, field types, validation, versioning, conditional logic and routing.
- [ ] A governed forms library with categories, ownership, version control and publish workflow is operational.
- [ ] At least one digital form is delivered for every form group (recruitment, employment, payroll, leave/attendance, benefits, employee-relations, separation, compliance) with module write-back.
- [ ] Country rules (e.g. KSA/UAE statutory limits) are enforced at the point of form capture where relevant.
- [ ] E-signature, approval routing and full audit trail apply to every submitted form.
- [ ] Forms automation design, audit checklist, KPIs, risk matrix and monthly compliance pack are delivered.
- [ ] Every section 33.1–33.45 is traceable to a delivered story.

---

## User Stories

### EPIC-33-S01 — Configurable digital forms engine (form builder)

**Labels:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 13
**As a** System Administrator, **I want** a configurable form builder with field types, validation, conditional logic and versioning, **so that** HR can create and change any HR form without code.

**Description**
Delivers the heart of the epic: a drag-and-drop form definition engine with field types (text, number, date, dropdown, lookup-to-employee, file upload, signature), per-field validation, conditional show/hide, sections, multi-language labels, and immutable form versioning. All later form-group stories instantiate definitions in this engine. This addresses the chapter's introduction and objectives by replacing ad-hoc forms with one governed platform.

**Acceptance Criteria**

- [ ] Given the builder, when an admin adds fields, then they can set type, label (multi-language), required flag, validation rule and default, and reorder via drag-and-drop.
- [ ] Given conditional logic, then a field can be shown/hidden or made required based on another field's value.
- [ ] Given a published form, when it is edited, then a new version is created and in-flight submissions stay on their original version.
- [ ] Given validation, then a submission failing a required/format/range rule is rejected with field-level errors and never persists partial data.
- [ ] Given RBAC, then only Form Authors can build/publish; field-level permissions can restrict who sees/edits sensitive fields.

**Tasks**

- [ ] Backend: `form_definition` (formCode, category, ownerId, status, currentVersionId), `form_version` (versionNo, schemaJson, status), `form_submission` (formVersionId, data, status) entities + migration.
- [ ] Backend: schema validation + conditional-logic evaluation service.
- [ ] Frontend: drag-and-drop form builder (admin portal) and dynamic form renderer.
- [ ] Rules/Config: reusable validation rule library and field-type registry.
- [ ] Alerts/Workflow: hook points for routing (consumed by S03).
- [ ] Tests: unit (validation, conditional logic), integration (versioning isolation), e2e (build → render → submit).

**Covers:** 33.1, 33.2
**Dependencies:** EPIC-08

### EPIC-33-S02 — HR form governance framework & forms library

**Labels:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** a governed forms library with ownership, categories, version control and a publish-approval workflow, **so that** only approved, current forms are in use and obsolete forms are retired.

**Description**
Adds governance over the engine: a central forms library organised by category/lifecycle stage, with each form having an owner, approver, retention class, and publish workflow (draft → review → approved → published → retired). Provides the searchable catalogue users launch forms from and enforces that no form is usable unless published.

**Acceptance Criteria**

- [ ] Given a form, when it is submitted for publishing, then it routes to the designated approver and cannot be launched by users until approved (maker-checker: author ≠ approver).
- [ ] Given the library, then forms are browsable/searchable by category (Recruitment, Employment, Payroll, Leave/Attendance, Benefits, Employee Relations, Separation, Compliance) and lifecycle status.
- [ ] Given a retired form, then it is hidden from launch but its prior submissions remain accessible read-only.
- [ ] Given governance, then each form records owner, approver, version, effective date and retention class, all audited.
- [ ] Given RBAC, then form visibility/launch can be restricted by role, entity and country.

**Tasks**

- [ ] Backend: governance fields on `form_definition` + `form_category` taxonomy + publish workflow service.
- [ ] Backend: forms catalogue/search API with RBAC scoping.
- [ ] Frontend: Forms Library catalogue (employee/manager/admin views) + launch.
- [ ] Rules/Config: category taxonomy and per-form access rules.
- [ ] Alerts/Workflow: publish-approval routing.
- [ ] Tests: integration (publish gate, maker-checker, retire behaviour).

**Covers:** 33.3, 33.4
**Dependencies:** EPIC-33-S01

### EPIC-33-S03 — Forms routing, approval, e-signature & audit

**Labels:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** configurable approval routing, e-signature and a full audit trail on every form submission, **so that** every HR transaction is approved by the right people and provably signed.

**Description**
Cross-cutting service used by all form-group stories: configurable multi-step routing (by role, manager hierarchy, amount thresholds, country), e-signature capture, status tracking (submitted → approved/rejected → completed), and immutable audit of every action. Without this, the group forms cannot be processed compliantly.

**Acceptance Criteria**

- [ ] Given a form with a routing config, when submitted, then it follows the configured chain (e.g. manager → HR → Finance) with conditional steps on thresholds/country.
- [ ] Given any approval step, then the approver e-signs and their identity, decision, comments, timestamp and IP are recorded immutably.
- [ ] Given a rejection, then it returns to the initiator with reason and no downstream write-back occurs.
- [ ] Given maker-checker, then an initiator cannot approve their own submission.
- [ ] Given an auditor, then the full lifecycle of any submission (versions, routing, signatures) is reconstructable.

**Tasks**

- [ ] Backend: routing engine config + `form_approval_step` and `form_signature` entities + migration.
- [ ] Backend: e-signature adapter (typed/drawn signature, optional vendor hook) and audit writer.
- [ ] Frontend: approval inbox, submission timeline, signature capture.
- [ ] Rules/Config: routing rules by role/threshold/country; SLA per step.
- [ ] Alerts/Workflow: pending-approval and SLA-breach notifications.
- [ ] Tests: integration (conditional routing, maker-checker), e2e (submit → sign → approve).

**Covers:** 33.3
**Dependencies:** EPIC-33-S01

### EPIC-33-S04 — Recruitment forms group (requisition, interview evaluation, selection/offer approval)

**Labels:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8
**As a** Line Manager, **I want** digital recruitment forms for manpower requisition, interview evaluation and candidate selection/offer approval, **so that** hiring decisions are captured, scored and approved with full traceability and nationalization checks.

**Description**
Delivers the recruitment form group as configurable forms feeding the recruitment module (EPIC-03/04/05): Manpower Requisition (with headcount/budget and localization fields), Interview Evaluation (competency scoring), and Candidate Selection & Offer Approval (with approval thresholds). Includes anti-discrimination and nationalization flags at capture.

**Acceptance Criteria**

- [ ] Given the Manpower Requisition form, when submitted, then it validates against headcount budget and captures localization/nationalization target, routing for budget approval.
- [ ] Given the Interview Evaluation form, then competency scores aggregate to a recommendation and panel members each submit independently.
- [ ] Given the Selection & Offer Approval form, then it enforces approval authority by grade/salary band and links the selected candidate to the requisition.
- [ ] Given GCC rules, then nationalization-eligibility and anti-discrimination prompts appear where applicable.
- [ ] Given approval, then approved requisition/selection data writes back to the recruitment module and is audited.

**Tasks**

- [ ] Backend: form definitions + write-back mappers to recruitment entities.
- [ ] Backend: budget/headcount validation hook; score-aggregation service for evaluations.
- [ ] Frontend: requisition, interview evaluation, selection/offer approval forms.
- [ ] Rules/Config: approval authority by grade/band; nationalization flags per country.
- [ ] Alerts/Workflow: budget and offer-approval routing.
- [ ] Tests: integration (budget validation, score aggregation, write-back).

**Covers:** 33.5, 33.6, 33.7, 33.8
**Dependencies:** EPIC-33-S02, EPIC-33-S03

### EPIC-33-S05 — Employment forms group (offer letter, contract checklist, joining form)

**Labels:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** digital employment forms for the offer letter, employment-contract checklist and employee joining form, **so that** new hires are onboarded on a controlled, complete and country-compliant data set.

**Description**
Delivers the employment form group: an Offer Letter template (merge-fields from offer data, e-signable), an Employment Contract Checklist (mandatory pre-employment/contract documents per country), and an Employee Joining Form that captures master data and creates the employee record (EPIC-06/08).

**Acceptance Criteria**

- [ ] Given the Offer Letter template, when generated, then offer data merges into the document, it is e-signable, and signed copies are archived.
- [ ] Given the Contract Checklist, then mandatory documents/clauses are listed by country (UAE/KSA/etc.) and the contract cannot be marked complete with missing mandatory items.
- [ ] Given the Joining Form, when approved, then validated master data creates/updates the employee record and triggers onboarding tasks.
- [ ] Given validation, then identifiers (Emirates ID/Iqama/CPR/QID, IBAN) are format-validated per country at capture.
- [ ] Given completion, then all actions are audited and documents stored to the employee file.

**Tasks**

- [ ] Backend: offer-letter merge service; checklist completeness engine; joining-form → employee write-back.
- [ ] Backend: country-specific ID/IBAN validators.
- [ ] Frontend: offer letter generator, contract checklist, joining form.
- [ ] Rules/Config: mandatory document matrix and ID formats per country.
- [ ] Alerts/Workflow: onboarding task trigger on joining-form approval.
- [ ] Tests: integration (merge, checklist completeness, write-back), unit (ID validators).

**Covers:** 33.9, 33.10, 33.11, 33.12
**Dependencies:** EPIC-33-S02, EPIC-33-S03

### EPIC-33-S06 — Payroll forms group (salary advance, loan, overtime, payroll change)

**Labels:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8
**As an** Employee (Self-Service), **I want** digital payroll forms for salary advance, employee loans, overtime approval and payroll changes, **so that** pay-affecting requests are approved, controlled and fed into payroll without manual re-entry.

**Description**
Delivers the payroll form group feeding the payroll module (EPIC-10/12): Salary Advance, Employee Loan Request (with eligibility and repayment schedule), Overtime Approval (pre-approval feeding OT calc), and Payroll Change Form (maker-checker on pay components). All enforce thresholds and cut-off rules.

**Acceptance Criteria**

- [ ] Given the Salary Advance/Loan forms, then eligibility (tenure, max % of salary) is validated and a repayment schedule is generated.
- [ ] Given the Overtime Approval form, then pre-approval is required before OT hours feed payroll, with country OT caps enforced.
- [ ] Given the Payroll Change form, then changes to pay components route maker-checker (preparer ≠ approver) and are blocked after payroll cut-off/lock.
- [ ] Given approval, then approved values write back to payroll inputs and appear in the audit trail.
- [ ] Given country rules, then statutory deduction/OT limits per GCC country are applied at capture.

**Tasks**

- [ ] Backend: form definitions + payroll-input write-back; loan repayment-schedule generator.
- [ ] Backend: eligibility and cut-off/lock validation hooks.
- [ ] Frontend: salary advance, loan, overtime, payroll change forms.
- [ ] Rules/Config: max-advance %, OT caps, cut-off dates per country.
- [ ] Alerts/Workflow: maker-checker routing; cut-off block notification.
- [ ] Tests: integration (eligibility, cut-off block, write-back).

**Covers:** 33.13, 33.14, 33.15, 33.16, 33.17
**Dependencies:** EPIC-33-S02, EPIC-33-S03

### EPIC-33-S07 — Leave & attendance forms group (leave request, attendance regularization, comp-off)

**Labels:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 5
**As an** Employee (Self-Service), **I want** digital leave, attendance-regularization and comp-off request forms, **so that** time-off and attendance corrections are captured against balances and approved consistently.

**Description**
Delivers the leave/attendance form group feeding EPIC-19/20: Leave Request (balance-aware, leave-type rules), Attendance Regularization (missing punch/late correction with evidence), and Comp-Off Request (earned vs availed). Forms validate against live balances and country leave rules.

**Acceptance Criteria**

- [ ] Given the Leave Request form, then available balance and leave-type eligibility (e.g. statutory annual/sick) are validated and overlapping leave is flagged.
- [ ] Given the Attendance Regularization form, then it references the specific date/punch and requires reason/evidence, routing to the manager.
- [ ] Given the Comp-Off form, then comp-off can only be requested against earned/approved holiday or rest-day work.
- [ ] Given approval, then approved leave/regularization/comp-off updates the attendance/leave ledgers and is audited.
- [ ] Given country rules, then statutory leave minimums and Ramadan/holiday rules are respected.

**Tasks**

- [ ] Backend: form definitions + write-back to leave/attendance ledgers; balance validation service.
- [ ] Frontend: leave request, attendance regularization, comp-off forms.
- [ ] Rules/Config: leave-type rules and balances per country.
- [ ] Alerts/Workflow: manager approval routing; overlap warnings.
- [ ] Tests: integration (balance validation, ledger write-back).

**Covers:** 33.18, 33.19, 33.20, 33.21
**Dependencies:** EPIC-33-S02, EPIC-33-S03

### EPIC-33-S08 — Benefits forms group (medical insurance enrollment, accommodation request, asset issue)

**Labels:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 5
**As an** Employee (Self-Service), **I want** digital forms to enroll in medical insurance, request accommodation and acknowledge asset issuance, **so that** benefits and asset provisioning are tracked and acknowledged with evidence.

**Description**
Delivers the benefits form group feeding EPIC-22/23: Medical Insurance Enrollment (employee + dependents), Accommodation Request (eligibility-based), and Asset Issue Form (asset handover with employee acknowledgement and return obligation).

**Acceptance Criteria**

- [ ] Given the Medical Insurance Enrollment form, then employee and dependent details are captured with mandatory documents, validated against eligibility, and routed to the benefits team/vendor.
- [ ] Given the Accommodation Request form, then eligibility (grade/category) is checked and the request routes to the welfare/accommodation team.
- [ ] Given the Asset Issue form, then issued assets are recorded against the employee and acknowledged via e-signature, creating a return obligation at separation.
- [ ] Given approval, then enrollment/accommodation/asset data writes back to the relevant module and is audited.

**Tasks**

- [ ] Backend: form definitions + write-back to benefits/accommodation/asset registers.
- [ ] Backend: eligibility validation hooks.
- [ ] Frontend: medical enrollment, accommodation request, asset issue forms.
- [ ] Rules/Config: eligibility rules by grade/category/country.
- [ ] Alerts/Workflow: routing to benefits/welfare teams; return-obligation linkage.
- [ ] Tests: integration (eligibility, write-back, asset-return linkage).

**Covers:** 33.22, 33.23, 33.24, 33.25
**Dependencies:** EPIC-33-S02, EPIC-33-S03

### EPIC-33-S09 — Employee relations forms group (grievance, disciplinary hearing record, warning letter)

**Labels:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 5
**As an** HR Manager, **I want** confidential digital forms for grievance intake, disciplinary hearing records and warning letters, **so that** sensitive ER cases are documented to evidentiary standard with restricted access.

**Description**
Delivers the employee-relations form group feeding EPIC-25/26: Grievance Form (confidential intake), Disciplinary Hearing Record (structured minutes, employee response), and Warning Letter template (verbal/written/final, e-signable). These carry heightened confidentiality and link to the ER/disciplinary case.

**Acceptance Criteria**

- [ ] Given the Grievance form, then it can be submitted confidentially, restricts access to the ER team, and creates/links an ER case.
- [ ] Given the Disciplinary Hearing Record, then it captures allegations, evidence, employee response and outcome with a structured minute and signatures.
- [ ] Given the Warning Letter template, then it generates verbal/written/final variants with merge fields, is e-signed, and stored to the employee file with retention.
- [ ] Given RBAC, then ER forms are restricted to authorised roles and excluded from general HR view; access is audited.
- [ ] Given linkage, then approved outcomes update the disciplinary/grievance case record.

**Tasks**

- [ ] Backend: form definitions + write-back to ER/disciplinary case; confidentiality access control.
- [ ] Backend: warning-letter merge/variant service.
- [ ] Frontend: grievance, hearing record, warning letter forms with restricted views.
- [ ] Rules/Config: penalty/warning variants per country; access roles.
- [ ] Alerts/Workflow: ER case routing; confidentiality enforcement.
- [ ] Tests: integration (confidential access, case linkage, letter generation).

**Covers:** 33.26, 33.27, 33.28, 33.29
**Dependencies:** EPIC-33-S02, EPIC-33-S03

### EPIC-33-S10 — Separation forms group (resignation, handover, exit clearance, final settlement, exit interview)

**Labels:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** the full digital separation form set, **so that** offboarding runs as a controlled, multi-department clearance with final settlement and exit feedback.

**Description**
Delivers the separation form group feeding EPIC-27/28: Resignation Form (notice period), Handover Form, Exit Clearance Form (multi-department sign-off incl. IT, asset return, finance), Final Settlement Form (EOSB/leave encashment/recoveries), and Exit Interview Form. These chain into one offboarding workflow.

**Acceptance Criteria**

- [ ] Given the Resignation form, then notice period and last working day are computed per contract/country and route for acceptance.
- [ ] Given the Exit Clearance form, then each department (IT, Finance, Admin, Line Manager) must sign off and asset returns reconcile to the asset register (S08) before clearance completes.
- [ ] Given the Final Settlement form, then it pulls EOSB, leave encashment, deductions and recoveries and requires maker-checker approval before payout.
- [ ] Given the Exit Interview form, then responses are captured (optionally anonymised for analytics) without blocking clearance.
- [ ] Given completion, then approved data writes back to separation/EOSB and triggers immigration/social-insurance closure tasks; all audited.

**Tasks**

- [ ] Backend: form definitions + write-back to separation/EOSB; multi-department clearance state machine.
- [ ] Backend: notice-period and settlement aggregation hooks.
- [ ] Frontend: resignation, handover, exit clearance, final settlement, exit interview forms.
- [ ] Rules/Config: notice periods and settlement components per country.
- [ ] Alerts/Workflow: clearance routing across departments; settlement maker-checker.
- [ ] Tests: integration (clearance completion gates, settlement maker-checker, write-back).

**Covers:** 33.30, 33.31, 33.32, 33.33, 33.34, 33.35
**Dependencies:** EPIC-33-S02, EPIC-33-S03, EPIC-33-S08

### EPIC-33-S11 — Compliance forms group (policy acknowledgement, document submission, visa/work-permit renewal)

**Labels:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 5
**As a** PRO / Immigration Officer, **I want** digital compliance forms for policy acknowledgement, document submission and visa/work-permit renewal, **so that** acknowledgements, document collection and renewal actions are captured with expiry-driven prompts.

**Description**
Delivers the compliance form group: Policy Acknowledgement Form (exposing EPIC-32's acknowledgement capture), Document Submission Form (request/collect employee documents with expiry tracking), and Visa/Work-Permit Renewal Form (PRO-driven, expiry-aware, feeding immigration EPIC-07/29).

**Acceptance Criteria**

- [ ] Given the Policy Acknowledgement form, then it binds to the exact policy version and records signed acknowledgement (reusing EPIC-32 logic).
- [ ] Given the Document Submission form, then requested documents are uploaded, validated for type/expiry, and stored to the employee file.
- [ ] Given the Visa/Work-Permit Renewal form, then renewals are initiated with PRO routing and expiry alerts at 60/30/7 days before expiry.
- [ ] Given approval/completion, then immigration/document records update and the actions are audited.

**Tasks**

- [ ] Backend: form definitions + integration to EPIC-32 acknowledgement and immigration/document registers.
- [ ] Backend: expiry-tracking + alert scheduler (60/30/7 days).
- [ ] Frontend: policy acknowledgement, document submission, visa renewal forms.
- [ ] Rules/Config: document matrix and renewal lead times per country.
- [ ] Alerts/Workflow: expiry alerts; PRO renewal routing.
- [ ] Tests: integration (version-bound ack, expiry alerts, immigration write-back).

**Covers:** 33.36, 33.37, 33.38, 33.39
**Dependencies:** EPIC-33-S02, EPIC-33-S03, EPIC-32-S08

### EPIC-33-S12 — HRMS forms automation design & module write-back framework

**Labels:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** a configurable automation layer that maps approved forms to HRMS module write-backs and downstream triggers, **so that** approved forms update the right records and fire follow-on actions without manual re-keying.

**Description**
Formalises the automation design referenced across the chapter: a configurable mapping layer (form field → target entity field), event-bus triggers on approval/rejection, idempotent write-back, and rollback on failure. This is the integration backbone that makes the group forms "live" rather than just stored documents.

**Acceptance Criteria**

- [ ] Given a form-to-entity mapping, when a form is approved, then the mapped fields write to the target module transactionally and idempotently.
- [ ] Given a write-back failure, then the form is flagged "pending integration" and retried, with no partial/duplicate updates.
- [ ] Given approval events, then configured downstream triggers fire on the event bus (e.g. joining form → onboarding tasks; resignation → clearance).
- [ ] Given the mapping config, then admins can define/adjust mappings without code, with validation against the target schema.
- [ ] Given every write-back, then the source submission and resulting record change are linked in the audit trail.

**Tasks**

- [ ] Backend: configurable mapping engine + idempotent write-back service + retry/rollback.
- [ ] Backend: event-bus publishers/consumers for form lifecycle events.
- [ ] Frontend: mapping configuration UI + integration-status monitor.
- [ ] Rules/Config: form-to-module mapping definitions.
- [ ] Alerts/Workflow: integration-failure alerts.
- [ ] Tests: integration (idempotency, rollback, trigger fan-out).

**Covers:** 33.40
**Dependencies:** EPIC-33-S04, EPIC-33-S05, EPIC-33-S06, EPIC-33-S07, EPIC-33-S08, EPIC-33-S09, EPIC-33-S10, EPIC-33-S11

### EPIC-33-S13 — HR forms audit checklist & risk matrix

**Labels:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable forms audit checklist and a forms risk matrix with red-flags, **so that** I can verify forms governance, completeness and processing integrity.

**Description**
Delivers a configurable audit checklist (form existence/version currency, mandatory-field enforcement, approval completeness, write-back success, retention) and a risk matrix scoring likelihood × impact with auto red-flags (e.g. forms bypassing approval, stuck/failed write-backs, unsigned approvals, overdue form reviews) feeding a risk register.

**Acceptance Criteria**

- [ ] Given the audit checklist, when run for an entity, then each item returns pass/fail with evidence (sample submissions).
- [ ] Given red-flag rules, then approval bypasses, failed write-backs, or unsigned approvals auto-raise risk entries.
- [ ] Given the risk matrix, then each risk is scored likelihood × impact and shown on a heatmap.
- [ ] Given a finding, then a corrective action with owner and due date can be tracked to closure.

**Tasks**

- [ ] Backend: `forms_audit_checklist`, `forms_risk` entities + red-flag rule engine over submission data.
- [ ] Backend: checklist evaluation + risk scoring service.
- [ ] Frontend: audit checklist runner + risk heatmap.
- [ ] Rules/Config: configurable red-flag thresholds.
- [ ] Alerts/Workflow: corrective-action assignment.
- [ ] Tests: integration (red-flag detection, scoring).

**Covers:** 33.41, 33.43
**Dependencies:** EPIC-33-S03, EPIC-33-S12

### EPIC-33-S14 — HR forms KPIs & dashboard

**Labels:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 3
**As an** HR Manager, **I want** a forms KPI dashboard, **so that** I can monitor form volumes, cycle times, approval SLAs and write-back success across groups and entities.

**Description**
Surfaces forms KPIs to the analytics dashboard (EPIC-31): submission volume by form/group, average approval cycle time, SLA-breach rate, rejection rate, and write-back success rate, sliceable by entity/country/department.

**Acceptance Criteria**

- [ ] Given the dashboard, then submission volume and average cycle time per form group are shown.
- [ ] Given SLAs, then SLA-breach and rejection rates are displayed with drill-down to offending submissions.
- [ ] Given integrations, then write-back success rate is shown and failures are listed.
- [ ] Given filters, then KPIs slice by entity, country and department.

**Tasks**

- [ ] Backend: KPI aggregation queries/materialized views over submissions.
- [ ] Backend: dashboard API feeding EPIC-31.
- [ ] Frontend: forms KPI widgets with drill-down.
- [ ] Rules/Config: SLA targets per form group.
- [ ] Tests: integration (KPI accuracy vs source).

**Covers:** 33.42
**Dependencies:** EPIC-33-S03, EPIC-31

### EPIC-33-S15 — Monthly HR forms compliance pack & key takeaways

**Labels:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** a one-click monthly HR forms compliance pack plus an in-product best-practice guide, **so that** I have signed monthly evidence of forms governance and teams adopt the engine correctly.

**Description**
Assembles the Monthly HR Forms Compliance Pack (forms library snapshot, version currency, submission/approval stats, audit-checklist results, red-flags, with a management certificate for sign-off and archival) and captures the chapter's key takeaways as an in-product best-practice/adoption guide.

**Acceptance Criteria**

- [ ] Given month-end, when the pack is generated, then it compiles library snapshot, KPIs, audit-checklist results and red-flags into one document.
- [ ] Given the pack, then a management certificate is included for e-signature and the signed pack is archived with retention.
- [ ] Given regeneration, then the pack is reproducible for any prior period with point-in-time data.
- [ ] Given admins, then an in-product key-takeaways/best-practice guide for forms governance is available.

**Tasks**

- [ ] Backend: monthly pack assembler + PDF export; best-practice content store.
- [ ] Frontend: pack generation + certificate sign-off; in-product guide.
- [ ] Rules/Config: pack contents and certificate template per entity.
- [ ] Alerts/Workflow: month-end pack-due reminder.
- [ ] Tests: e2e (pack generation + sign-off + archive).

**Covers:** 33.44, 33.45
**Dependencies:** EPIC-33-S13, EPIC-33-S14
