# EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 5 – Offer Management & Pre-Employment Compliance
> **Module:** Recruitment · **Labels:** `epic`, `gcc-compliance`, `recruitment`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an AuraOS offer-management and pre-employment module that governs everything from offer approval (via an approval matrix), compliant offer-letter generation, conditional offers and salary-structure design, through benefits, work-permit readiness, pre-employment documentation, background and medical-fitness checks, contract preparation, candidate acceptance and a clean recruitment-to-onboarding handover. A configurable country pre-employment control matrix and offer workflow must ensure no candidate joins without all statutory conditions met.

## Business Value

Stops non-compliant or unauthorised offers, ensures salary structures and contracts meet GCC labour-law and WPS requirements, and guarantees work-permit/medical/document conditions are satisfied before joining — avoiding labour fines, visa rejections and disputes. A controlled offer matrix and audit trail protect against governance findings, while a clean handover prevents onboarding gaps and data re-keying.

## Requirements Covered (handbook sections)

- 5.1 Introduction
- 5.2 Objectives of Offer Management
- 5.3 Offer Management Lifecycle
- 5.4 Offer Approval Governance
- 5.5 Offer Letter Structure
- 5.6 Conditional Offer Management
- 5.7 Salary Structure Design
- 5.8 Benefits Compliance
- 5.9 Work Permit Readiness
- 5.10 Pre-Employment Documentation
- 5.11 Background Verification
- 5.12 Medical Fitness Requirements
- 5.13 Employment Contract Preparation
- 5.14 Candidate Acceptance Process
- 5.15 Recruitment-to-Onboarding Handover
- 5.16 Country-Specific Pre-Employment Control Matrix
- 5.17 Offer Management KPIs
- 5.18 Offer Management Audit Checklist
- 5.19 Common Offer Management Risks
- 5.20 HRMS Workflow Design for Offer Management
- 5.21 Sample Offer Letter Template

## Out of Scope

- Sourcing, screening, interview and recruitment-side verification (covered in EPIC-04).
- Joining-day formalities, master-data creation and onboarding execution (covered in EPIC-06).
- Authority work-permit/visa filing and Iqama/CPR/QID issuance execution (covered in EPIC-07).
- Payroll run, WPS file generation and GOSI/GPSSA registration processing (covered in EPIC-10/11/13/14).

## Dependencies

- EPIC-02 (Country Rule Engine — pre-employment, contract, salary rules)
- EPIC-04 (Selected candidate package: BGV, eligibility, benchmark)

## Epic Definition of Done

- [ ] Offer lifecycle, objectives and a configurable offer-approval matrix (maker-checker, value/grade escalation) are enforced.
- [ ] Compliant, templated offer letters and conditional offers are generated with versioning and e-acceptance.
- [ ] Salary structures and benefits validate against country labour-law/WPS and grade-band rules.
- [ ] Work-permit readiness, pre-employment documentation, BGV and medical-fitness gates block joining until cleared.
- [ ] Employment contracts are prepared per country contract type with mandatory clauses and bilingual support where required.
- [ ] Candidate acceptance is captured digitally and a complete handover package flows to Onboarding (EPIC-06).
- [ ] A country-specific pre-employment control matrix governs required steps per nationality/country.
- [ ] Offer KPIs, audit checklist, risk register and offer-letter template form are live, with full audit trail.

---

## User Stories

### EPIC-05-S01 — Offer management lifecycle, objectives & workflow design

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** HR Manager, **I want** a configurable offer-management lifecycle and workflow, **so that** every offer follows one controlled, auditable path from selected candidate to accepted offer.

**Description**
Establishes the offer process backbone (objectives, lifecycle stages: initiate → approve → issue → accept → pre-employment → contract → handover) and the HRMS workflow design tying stages, gates and SLAs together. Consumes the `candidate.selected` package from EPIC-04 to open an offer case and orchestrates all later stories.

**Acceptance Criteria**

- [ ] Given a `candidate.selected` event, when received, then an offer case opens pre-populated with the EPIC-04 package.
- [ ] Given offer lifecycle stages, when configured, then each has entry/exit gates, owner role and SLA.
- [ ] Given a stage-gate, when its controls are unmet, then advancing is blocked with reasons.
- [ ] Given an offer case, when progressed, then SLA timers run and breaches are flagged.
- [ ] Given any stage transition, when performed, then it is audit-logged.

**Tasks**

- [ ] Backend: `offer_case` + `offer_stage` entities (candidateId, stage, owner, slaDays, status) + migration.
- [ ] Backend: offer workflow/state-machine consuming `candidate.selected`.
- [ ] Frontend: offer-case workspace with stage tracker.
- [ ] Rules/Config: configurable lifecycle stages, gates and SLAs per entity.
- [ ] Alerts/Workflow: SLA-breach and stage-transition notifications.
- [ ] Tests: unit (state machine) + e2e (selected→offer case opens).

**Covers:** 5.1, 5.2, 5.3, 5.20
**Dependencies:** EPIC-04

### EPIC-05-S02 — Offer approval governance & approval matrix

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 8
**As a** HR Manager, **I want** offers routed through a configurable approval matrix with maker-checker, **so that** every offer is authorised at the correct level before issuance.

**Description**
Implements the offer-approval matrix: approver levels determined by entity, grade, total-cost-to-company and deviation from band (links to EPIC-04 benchmark). Enforces maker-checker (preparer ≠ approver), out-of-band escalation, and final approval as the gate to issue the offer letter. Captures full decision history.

**Acceptance Criteria**

- [ ] Given an offer, when submitted, then approvers are derived from entity, grade and CTC value with maker-checker enforced.
- [ ] Given an out-of-band salary (vs EPIC-04 benchmark), when proposed, then an extra approval level is required.
- [ ] Given an approver, when they approve/reject/return, then the decision and comments are recorded and the next step triggers.
- [ ] Given final approval, when reached, then the offer-letter issue gate opens.
- [ ] Given any approval action, when performed, then it is audit-logged with actor, level and reason.

**Tasks**

- [ ] Backend: `offer_approval` entity + approval-routing service on workflow engine.
- [ ] Backend: matrix resolver (grade/CTC/band-deviation → approver chain).
- [ ] Frontend: approval inbox + decision actions + history.
- [ ] Rules/Config: per-entity offer approval matrix and escalation thresholds.
- [ ] Alerts/Workflow: route, escalate on SLA breach, open issue gate on approval.
- [ ] Tests: integration (maker-checker, out-of-band escalation) + e2e (full chain).

**Covers:** 5.4
**Dependencies:** EPIC-05-S01, EPIC-04

### EPIC-05-S03 — Compliant offer-letter structure & generation

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** HR Admin, **I want** offer letters generated from compliant, country-specific templates, **so that** every issued offer contains mandatory terms and is version-controlled.

**Description**
Generates offer letters from configurable templates per country/entity with mandatory components (job title, grade, salary structure, benefits, probation, notice, conditions, validity/expiry). Merges approved offer data, version-locks the issued document, supports bilingual output where required, and only allows issuance after final approval (S02).

**Acceptance Criteria**

- [ ] Given an approved offer, when generated, then mandatory components are populated and missing ones block generation.
- [ ] Given a country, when generating, then the correct template (and Arabic/bilingual version where required) is used.
- [ ] Given an issued offer letter, when sent, then it is version-locked with an expiry/validity date.
- [ ] Given edits after issue, when required, then a new version supersedes the prior with audit trail.
- [ ] Given any generation/issue action, when performed, then it is audit-logged.

**Tasks**

- [ ] Backend: `offer_letter` entity (templateId, version, expiryDate, language, status) + merge service.
- [ ] Backend: document generation (PDF) with version lock.
- [ ] Frontend: offer-letter preview/issue screen.
- [ ] Rules/Config: per-country offer templates and mandatory-component rules.
- [ ] Alerts/Workflow: issuance notification; expiry reminder.
- [ ] Tests: unit (mandatory-component validation) + integration (versioning).

**Covers:** 5.5
**Dependencies:** EPIC-05-S02

### EPIC-05-S04 — Sample offer-letter template (configurable digital form)

**Labels:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 3
**As a** HR Admin, **I want** a configurable sample offer-letter template library, **so that** standardised, compliant offer templates can be maintained and reused per country/entity.

**Description**
Delivers the chapter's sample offer-letter template as a configurable digital template with placeholders, clause blocks, country variants and an export. Maintained by HR with version control and approval; consumed by the generation engine in S03. Includes the standard GCC clause set (title, comp, benefits, probation, notice, governing law, conditions).

**Acceptance Criteria**

- [ ] Given the template library, when a template is created, then placeholders, clause blocks and country variant are defined.
- [ ] Given a template, when published, then it is version-controlled and available to S03 generation.
- [ ] Given a country variant, when required, then bilingual/Arabic clause blocks are supported.
- [ ] Given a template, when exported, then a sample/preview document is produced.
- [ ] Given any template change, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `offer_template` entity (clauses, placeholders, country, version, status) + migration.
- [ ] Backend: template publish/version service + export.
- [ ] Frontend: template builder with clause blocks and preview.
- [ ] Rules/Config: standard GCC clause catalogue and country variants.
- [ ] Alerts/Workflow: template approval routing.
- [ ] Tests: unit (placeholder validation) + integration (export/preview).

**Covers:** 5.21
**Dependencies:** EPIC-05-S03

### EPIC-05-S05 — Conditional offer management

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** HR Admin, **I want** offers issued conditional on defined pre-employment conditions, **so that** employment is contingent on medical, BGV, document and visa clearances being met.

**Description**
Supports conditional offers where the offer explicitly lists conditions precedent (medical fitness, BGV clearance, document submission, work-permit approval, qualification attestation). Tracks each condition's status, prevents the contract/joining gate from opening until all mandatory conditions are satisfied, and supports withdrawal if a condition fails.

**Acceptance Criteria**

- [ ] Given a conditional offer, when issued, then each condition precedent is listed with owner and target date.
- [ ] Given a condition, when its evidence is recorded, then its status updates (pending/met/failed).
- [ ] Given an unmet mandatory condition, when contract/joining is attempted, then it is blocked.
- [ ] Given a failed condition, when confirmed, then offer withdrawal workflow can be triggered with reason.
- [ ] Given any condition change, when made, then it is audit-logged.

**Tasks**

- [ ] Backend: `offer_condition` entity (offerId, type, mandatory, status, evidenceDocId, targetDate) + migration.
- [ ] Backend: conditions-gate service feeding contract/joining gate.
- [ ] Frontend: conditional-offer tracker with status per condition.
- [ ] Rules/Config: condition catalogue and mandatory flags per country/role.
- [ ] Alerts/Workflow: condition-overdue alerts; offer-withdrawal workflow.
- [ ] Tests: unit (gate logic) + integration (block on unmet condition).

**Covers:** 5.6
**Dependencies:** EPIC-05-S03

### EPIC-05-S06 — Salary structure design & compliance

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**As a** HR Manager, **I want** to design compliant salary structures for the offer, **so that** basic/allowance splits, minimum-wage and WPS-relevant components meet country labour-law and grade-band rules.

**Description**
Builds the offer's salary structure from configurable components (basic, housing, transport, other allowances), validates against grade/salary band (EPIC-09), country minimum-wage/national-wage rules and the basic-to-gross ratios that drive EOSB and WPS. Ensures the structure is WPS-payable and feeds the offer letter and contract.

**Acceptance Criteria**

- [ ] Given a grade, when a structure is built, then components validate against the band min/mid/max.
- [ ] Given a country, when a structure is built, then minimum-wage/national-wage and basic-ratio rules are enforced via the rule engine.
- [ ] Given EOSB/WPS relevance, when components are set, then the EOSB-eligible basic and WPS-payable gross are flagged correctly.
- [ ] Given an out-of-band component, when entered, then an approval flag is raised.
- [ ] Given any salary-structure change, when saved, then it is audit-logged and carried to offer letter/contract.

**Tasks**

- [ ] Backend: `salary_structure` + `salary_component` entities (componentType, amount, eosbEligible, wpsPayable) + migration.
- [ ] Backend: structure-validation service (band, minimum wage, basic ratio).
- [ ] Frontend: salary-structure designer with live validation.
- [ ] Rules/Config: per-country minimum-wage, basic-ratio and band rules.
- [ ] Alerts/Workflow: out-of-band approval flag.
- [ ] Tests: unit (validation rules) + integration (feed to offer letter).

**Covers:** 5.7
**Dependencies:** EPIC-02, EPIC-09

### EPIC-05-S07 — Benefits compliance in the offer

**Labels:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**As a** HR Manager, **I want** offer benefits validated for statutory and policy compliance, **so that** medical insurance, leave, air ticket and other entitlements meet country mandates and grade policy.

**Description**
Configures the benefits package attached to the offer (mandatory medical insurance, annual leave entitlement, air ticket, housing/transport where applicable) and validates against country statutory minimums (e.g., mandatory health insurance in UAE/KSA) and internal grade-based benefit policy. Feeds offer letter and contract, and seeds benefits enrolment in onboarding.

**Acceptance Criteria**

- [ ] Given a country, when benefits are set, then statutory-mandatory benefits (e.g., medical insurance) are enforced.
- [ ] Given a grade, when benefits are set, then they validate against grade-based benefit policy.
- [ ] Given a missing mandatory benefit, when proposed, then the offer is blocked with reason.
- [ ] Given the benefits package, when finalised, then it carries to the offer letter and contract.
- [ ] Given any benefits change, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `offer_benefit` entity (type, value, statutory, gradePolicyRef) + migration.
- [ ] Backend: benefits-validation service (statutory + policy).
- [ ] Frontend: benefits configuration on the offer.
- [ ] Rules/Config: per-country statutory benefits and grade policy.
- [ ] Alerts/Workflow: block on missing mandatory benefit.
- [ ] Tests: unit (statutory/policy validation) + integration (carry to letter).

**Covers:** 5.8
**Dependencies:** EPIC-02, EPIC-05-S03

### EPIC-05-S08 — Work-permit readiness verification

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As a** PRO / Immigration Officer, **I want** work-permit readiness verified before joining, **so that** quota, entry-permit, attestation and sponsorship prerequisites are confirmed for the target country.

**Description**
Confirms readiness to obtain a work permit/visa: available quota (MOHRE/Qiwa/LMRA), required document attestations, entry-permit prerequisites, profession/occupation match and NOC/transfer needs (building on EPIC-04 eligibility). Tracks readiness status as a joining gate and prepares the data PRO needs for filing in EPIC-07.

**Acceptance Criteria**

- [ ] Given a candidate and country, when readiness is checked, then quota availability, required attestations and profession match are validated.
- [ ] Given an in-country transfer case, when detected, then NOC/transfer steps are listed.
- [ ] Given missing readiness items, when joining is attempted, then it is blocked with the outstanding list.
- [ ] Given readiness Cleared, when complete, then data is staged for EPIC-07 work-permit filing.
- [ ] Given any readiness change, when made, then it is audit-logged.

**Tasks**

- [ ] Backend: `work_permit_readiness` entity (countryCode, quotaStatus, attestationsRequired, nocRequired, status) + migration.
- [ ] Backend: readiness rule service + joining-gate integration.
- [ ] Frontend: work-permit readiness checklist screen.
- [ ] Rules/Config: per-country quota/attestation/profession rules.
- [ ] Alerts/Workflow: block joining when not ready; PRO handoff notification.
- [ ] Tests: unit (rule eval) + integration (gate, EPIC-07 staging).

**Covers:** 5.9
**Dependencies:** EPIC-04, EPIC-07

### EPIC-05-S09 — Pre-employment documentation collection

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** HR Admin, **I want** pre-employment documents collected and validated against a country checklist, **so that** all mandatory documents are present, valid and attested before joining.

**Description**
Manages the pre-employment document checklist per country/nationality (passport, photo, attested certificates, prior-employment papers, visa/entry docs, qualification attestation). Captures uploads, validates expiry/attestation, flags missing items and gates contract/joining until the mandatory set is complete.

**Acceptance Criteria**

- [ ] Given a country/nationality, when the case opens, then the correct document checklist is generated.
- [ ] Given an uploaded document, when validated, then expiry and attestation status are checked.
- [ ] Given a missing/expired mandatory document, when contract/joining is attempted, then it is blocked.
- [ ] Given a document, when stored, then it is filed against the candidate in the document store with access control.
- [ ] Given any document action, when performed, then it is audit-logged.

**Tasks**

- [ ] Backend: `pre_employment_document` entity (type, mandatory, expiry, attested, status, docId) + migration.
- [ ] Backend: checklist-generation + completeness-gate service.
- [ ] Frontend: document collection screen with checklist and upload.
- [ ] Rules/Config: per-country/nationality document matrices.
- [ ] Alerts/Workflow: missing-document reminders; joining gate.
- [ ] Tests: unit (completeness logic) + integration (expiry/attestation checks).

**Covers:** 5.10
**Dependencies:** EPIC-02, EPIC-05-S01

### EPIC-05-S10 — Pre-employment background verification finalisation

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** background-verification status confirmed as a joining condition, **so that** any pre-employment BGV is cleared before contract and joining.

**Description**
Finalises the BGV initiated in EPIC-04 within the offer context: confirms all required checks are Cleared (or that approved exceptions are documented), links BGV outcome to the conditional-offer condition (S05), and blocks contract/joining if BGV is unresolved. Avoids duplicating EPIC-04 BGV mechanics — this story is the offer-side gate and reconciliation.

**Acceptance Criteria**

- [ ] Given an offer case, when reviewed, then the linked EPIC-04 BGV status is displayed (cleared/pending/discrepant).
- [ ] Given a pending/discrepant BGV, when contract/joining is attempted, then it is blocked.
- [ ] Given a BGV discrepancy, when accepted via exception, then approval and justification are recorded.
- [ ] Given BGV Cleared, when confirmed, then the related offer condition (S05) is auto-marked met.
- [ ] Given any BGV confirmation/exception, when made, then it is audit-logged.

**Tasks**

- [ ] Backend: BGV-reconciliation service linking EPIC-04 `bgv_case` to `offer_condition`.
- [ ] Backend: joining-gate enforcement on BGV status.
- [ ] Frontend: BGV status panel on offer case with exception capture.
- [ ] Rules/Config: BGV-exception approval authority per entity.
- [ ] Alerts/Workflow: escalation on unresolved BGV at joining.
- [ ] Tests: integration (gate block) + unit (condition auto-mark).

**Covers:** 5.11
**Dependencies:** EPIC-04, EPIC-05-S05

### EPIC-05-S11 — Medical fitness requirements management

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As a** PRO / Immigration Officer, **I want** medical-fitness testing tracked as a pre-employment gate, **so that** mandatory GCC medical/visa fitness results are obtained and cleared before joining.

**Description**
Manages the mandatory medical-fitness process required for visas/work permits in GCC (e.g., DHA/MOH/visa medical screening): test type, centre, appointment, result (fit/unfit/conditional) and validity. Result gates joining and feeds the conditional offer (S05) and work-permit readiness (S08). Handles "unfit" outcomes with offer-impact workflow.

**Acceptance Criteria**

- [ ] Given a country, when the case opens, then the required medical-fitness test(s) and centre options are listed per rule.
- [ ] Given a result, when recorded, then fit/unfit/conditional status and validity date are captured with evidence.
- [ ] Given an "unfit" result, when confirmed, then a configurable offer-impact workflow (withdraw/escalate) is triggered.
- [ ] Given a "fit" result, when recorded, then the related offer condition and work-permit readiness are updated.
- [ ] Given any medical record, when stored, then it is access-restricted (sensitive data) and audit-logged.

**Tasks**

- [ ] Backend: `medical_fitness` entity (testType, centre, result, validTo, evidenceDocId, status) + migration.
- [ ] Backend: result-gate + offer-impact workflow service.
- [ ] Frontend: medical-fitness tracker with sensitive-data access control.
- [ ] Rules/Config: per-country mandatory medical tests and validity.
- [ ] Alerts/Workflow: unfit-result escalation; appointment reminders.
- [ ] Tests: unit (status/validity) + integration (joining gate, condition update).

**Covers:** 5.12
**Dependencies:** EPIC-02, EPIC-05-S05, EPIC-05-S08

### EPIC-05-S12 — Employment contract preparation

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As a** HR Manager, **I want** employment contracts prepared per country contract type with mandatory clauses, **so that** contracts comply with GCC labour law and authority templates before signing.

**Description**
Generates the employment contract per country contract type (e.g., MOHRE/Qiwa standard contract, fixed/unlimited term per current law), populating salary structure, benefits, probation, notice, working hours and mandatory statutory clauses. Supports bilingual (Arabic) output where mandated and alignment with the authority-registered contract, version-locked and gated on cleared pre-employment conditions.

**Acceptance Criteria**

- [ ] Given a country and contract type, when prepared, then the correct template and mandatory clauses are applied.
- [ ] Given salary/benefits/probation/notice, when merged, then they match the approved offer and salary structure.
- [ ] Given a country requiring bilingual contracts, when generated, then an Arabic/bilingual version is produced.
- [ ] Given unmet mandatory pre-employment conditions, when contract finalisation is attempted, then it is blocked.
- [ ] Given any contract preparation/version, when performed, then it is audit-logged.

**Tasks**

- [ ] Backend: `employment_contract` entity (countryCode, contractType, term, language, version, status) + migration.
- [ ] Backend: contract generation + clause/condition validation service.
- [ ] Frontend: contract preparation/preview screen.
- [ ] Rules/Config: per-country contract types, mandatory clauses, bilingual rules.
- [ ] Alerts/Workflow: block on unmet conditions; readiness-for-signature notification.
- [ ] Tests: unit (clause/condition validation) + integration (offer-data merge).

**Covers:** 5.13
**Dependencies:** EPIC-02, EPIC-05-S05, EPIC-05-S06

### EPIC-05-S13 — Candidate acceptance process & e-signature

**Labels:** `user-story`, `recruitment` · **Priority:** Must · **Estimate:** 5
**As a** Employee (Self-Service), **I want** to review and accept my offer and contract digitally, **so that** acceptance is captured securely with a clear, time-bound audit record.

**Description**
Provides a candidate portal to review the issued offer letter/contract, accept/decline/negotiate, and e-sign within the validity window. Captures acceptance metadata (timestamp, IP, version accepted), handles expiry/withdrawal, and on acceptance advances the case to pre-employment/handover. Supports counter-offer/negotiation loops back to approval.

**Acceptance Criteria**

- [ ] Given an issued offer, when the candidate opens the portal, then the current version is shown with accept/decline/negotiate actions.
- [ ] Given acceptance, when submitted, then e-signature, timestamp and accepted version are recorded.
- [ ] Given the validity window, when it lapses without acceptance, then the offer auto-expires and notifies HR.
- [ ] Given a negotiation request, when raised, then it routes back to offer approval (S02) with the change.
- [ ] Given any acceptance/decline action, when performed, then it is audit-logged.

**Tasks**

- [ ] Backend: `offer_acceptance` entity (offerId, action, signedAt, versionAccepted, signatureRef) + migration.
- [ ] Backend: acceptance/expiry/negotiation service + e-signature integration.
- [ ] Frontend: candidate acceptance portal.
- [ ] Rules/Config: validity window and negotiation rules per entity.
- [ ] Alerts/Workflow: expiry reminders; negotiation routing; acceptance notification.
- [ ] Tests: integration (accept/expire/negotiate) + e2e (e-sign capture).

**Covers:** 5.14
**Dependencies:** EPIC-05-S02, EPIC-05-S03

### EPIC-05-S14 — Recruitment-to-onboarding handover

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**As a** HR Admin, **I want** an accepted offer to hand a complete, validated package to onboarding, **so that** no data is re-keyed and onboarding starts only when all pre-employment gates are cleared.

**Description**
Assembles the full handover package (candidate data, contract, salary structure, benefits, cleared conditions, BGV/medical/document/work-permit status) and, once all mandatory gates pass, emits a `candidate.ready_to_onboard` event to EPIC-06 with the package. Provides a handover checklist confirming completeness and prevents premature handover.

**Acceptance Criteria**

- [ ] Given an accepted offer, when handover is initiated, then all mandatory gates (conditions, BGV, medical, documents, work-permit readiness) are verified.
- [ ] Given an unmet gate, when handover is attempted, then it is blocked listing outstanding items.
- [ ] Given all gates cleared, when initiated, then a `candidate.ready_to_onboard` event with the package is published to EPIC-06.
- [ ] Given the handover, when completed, then a handover record/checklist confirms completeness.
- [ ] Given any handover action, when performed, then it is audit-logged.

**Tasks**

- [ ] Backend: handover package assembler + gate-verification service.
- [ ] Backend: `candidate.ready_to_onboard` event emission to EPIC-06.
- [ ] Frontend: handover checklist/summary screen.
- [ ] Rules/Config: required-gate set per country/role for handover.
- [ ] Alerts/Workflow: handover notification to Onboarding; block on incomplete.
- [ ] Tests: integration (gate block) + e2e (accepted→event to EPIC-06).

**Covers:** 5.15
**Dependencies:** EPIC-05-S05, EPIC-05-S08, EPIC-05-S09, EPIC-05-S11, EPIC-05-S12, EPIC-06

### EPIC-05-S15 — Country-specific pre-employment control matrix

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a configurable country-specific pre-employment control matrix, **so that** the required pre-employment steps adapt automatically to country, nationality and role.

**Description**
Implements a rule-driven control matrix mapping each GCC country (and nationality where relevant) to its mandatory pre-employment controls — documents, attestations, medical tests, work-permit steps, contract type and BGV requirements. The matrix configures the gates used by S05–S12 so a single source of truth governs what must be true before joining.

**Acceptance Criteria**

- [ ] Given a country and nationality, when an offer case opens, then the matrix derives the applicable mandatory controls.
- [ ] Given a control matrix entry, when updated, then dependent gates (documents/medical/work-permit/contract) reflect the change.
- [ ] Given a control not applicable, when evaluated, then it is excluded from gating for that case.
- [ ] Given a matrix, when viewed, then required steps per country/nationality render side by side.
- [ ] Given any matrix change, when saved, then it is version-controlled and audit-logged.

**Tasks**

- [ ] Backend: `pre_employment_control_matrix` entity (countryCode, nationality, controlType, mandatory) + migration.
- [ ] Backend: matrix-resolution service feeding S05–S12 gates.
- [ ] Frontend: control-matrix configuration and comparison view.
- [ ] Rules/Config: per-country/nationality control definitions via rule engine.
- [ ] Alerts/Workflow: notify on matrix change affecting open cases.
- [ ] Tests: unit (resolution) + integration (gate reconfiguration).

**Covers:** 5.16
**Dependencies:** EPIC-02, EPIC-05-S05

### EPIC-05-S16 — Offer management KPIs & dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As a** Executive / Leadership, **I want** offer-management KPIs and a dashboard, **so that** offer throughput, acceptance and pre-employment compliance are visible in real time.

**Description**
Delivers offer KPIs (offer cycle time, approval TAT, offer-to-acceptance rate, decline reasons, conditional-offer clearance rate, pre-employment-gate completion, time-to-join) and a dashboard surfacing pending approvals, expiring offers, blocked joiners and country control status. Filterable by country/entity/department with export.

**Acceptance Criteria**

- [ ] Given the KPI view, when opened, then offer cycle time, approval TAT and acceptance rate render with trend.
- [ ] Given the dashboard, when opened, then pending approvals, expiring offers and blocked-joiner reasons are shown.
- [ ] Given filters, when applied, then all tiles recompute by country/entity/department/period.
- [ ] Given a threshold breach (e.g., approval TAT > target), when detected, then it is highlighted.
- [ ] Given RBAC, when viewed, then data is scoped to authorised entities; export available.

**Tasks**

- [ ] Backend: offer KPI aggregation views + dashboard service.
- [ ] Backend: export service (PDF/Excel).
- [ ] Frontend: offer KPI + status dashboard with filters.
- [ ] Rules/Config: KPI targets and thresholds per entity.
- [ ] Alerts/Workflow: threshold-breach alerts.
- [ ] Tests: unit (KPI calc) + integration (filter scoping/export).

**Covers:** 5.17
**Dependencies:** EPIC-05-S02, EPIC-05-S13, EPIC-05-S14

### EPIC-05-S17 — Offer management audit checklist & risk register

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**As a** Internal Auditor, **I want** an offer-management audit checklist and common-risk register with red-flags, **so that** I can verify offer governance and pre-employment controls and log findings.

**Description**
Implements the offer audit checklist as a configurable digital checklist (pass/fail/N-A + evidence) and codifies common offer-management risks (offer issued without approval, salary out of band, joining before medical/BGV/work-permit clearance, missing mandatory documents, expired offer reissued without re-approval) into auto-run red-flags and a likelihood×impact risk register with corrective-action tracking.

**Acceptance Criteria**

- [ ] Given the audit checklist, when configured, then items are grouped by control area with evidence slots.
- [ ] Given red-flag rules, when run, then exceptions (unapproved offer, pre-clearance joining, out-of-band salary) are listed with drill-down.
- [ ] Given the risk register, when populated, then each common risk has likelihood, impact, score, owner and mitigation.
- [ ] Given a checklist fail or red-flag, when raised, then a finding/corrective action with owner and due date is created.
- [ ] Given audit completion, when finalised, then a signed audit pack is exported and audit-logged.

**Tasks**

- [ ] Backend: `offer_audit_checklist`, `audit_finding`, `offer_risk` entities + migration.
- [ ] Backend: red-flag rule engine over offer/pre-employment data.
- [ ] Frontend: checklist runner + risk register + corrective-action tracker.
- [ ] Rules/Config: checklist templates, red-flag rules and risk scoring per entity.
- [ ] Alerts/Workflow: overdue-finding alerts; audit sign-off workflow.
- [ ] Tests: unit (red-flag rules/scoring) + e2e (checklist→finding→export).

**Covers:** 5.18, 5.19
**Dependencies:** EPIC-05-S02, EPIC-05-S08, EPIC-05-S11, EPIC-05-S12
