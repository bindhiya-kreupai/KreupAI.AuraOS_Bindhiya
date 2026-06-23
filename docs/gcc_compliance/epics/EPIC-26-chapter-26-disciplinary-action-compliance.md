# EPIC-26: Chapter 26 – Disciplinary Action Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 26 – Disciplinary Action Compliance
> **Module:** Employee Relations · **Labels:** `epic`, `gcc-compliance`, `employee-relations`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an AuraOS Disciplinary Action module that classifies misconduct, applies a configurable penalty matrix, enforces pre-action investigation, evidence standards and a documented employee hearing, and controls suspension, salary deductions and the disciplinary-to-termination pathway with country-specific legal guardrails. The module must guarantee consistency, fairness and a defensible audit trail aligned to UAE, Saudi, Bahrain, Qatar, Oman and Kuwait labour-law limits on penalties and deductions.

## Business Value

Prevents unlawful or inconsistent discipline that exposes the employer to labour-court reversal, reinstatement orders, back-pay and fines—particularly around illegal salary deductions, defective process and unfair dismissal. Standardises penalty decisions, enforces due-process steps, and provides Compliance, HR and Leadership with auditable evidence that every disciplinary action was lawful, proportionate and consistently applied.

## Requirements Covered (handbook sections)

- 26.1 Introduction
- 26.2 Objectives of Disciplinary Compliance
- 26.3 GCC Disciplinary Governance Framework
- 26.4 Legal Context in the GCC
- 26.5 Disciplinary Policy
- 26.6 Misconduct Classification
- 26.7 Disciplinary Penalty Matrix
- 26.8 Investigation Before Disciplinary Action
- 26.9 Evidence Standards
- 26.10 Employee Hearing
- 26.11 Types of Disciplinary Actions
- 26.12 Suspension Pending Investigation
- 26.13 Salary Deduction Risks
- 26.14 Disciplinary Action and Termination
- 26.15 Disciplinary Appeals
- 26.16 Disciplinary Confidentiality
- 26.17 Consistency and Fairness
- 26.18 Documentation Standards
- 26.19 Country-Specific Control Notes
- 26.20 Disciplinary Audit Checklist
- 26.21 Disciplinary KPIs
- 26.22 Disciplinary Risk Matrix
- 26.23 HRMS Disciplinary Automation Design
- 26.24 Disciplinary Dashboard
- 26.25 Monthly Disciplinary Compliance Pack
- 26.26 Sample Misconduct Report Form
- 26.27 Sample Disciplinary Hearing Record
- 26.28 Sample Warning Letter Structure
- 26.29 Sample Disciplinary Register
- 26.30 Key Takeaways

## Out of Scope

- Grievance intake and investigation mechanics (covered by EPIC-25; this epic consumes its findings).
- Termination execution, notice, EOSB and final settlement processing (covered by EPIC-27/EPIC-28; this epic links to them).
- Payroll deduction posting mechanics beyond legality validation and instruction (executed in EPIC-10 payroll).
- General policy authoring/version control beyond the disciplinary policy surfaced here (covered by EPIC-32).

## Dependencies

- EPIC-25 (Employee Relations — investigation findings feeding discipline)
- EPIC-27 (Termination & Separation — disciplinary-led dismissal)
- EPIC-10 (Payroll — deduction execution)
- EPIC-32 (HR Policies — disciplinary policy lifecycle)
- Platform services: RBAC, workflow/approval engine, document store, audit trail, alerts, country rule engine

## Epic Definition of Done

- [ ] Misconduct is classifiable into configurable categories/severities driving a penalty matrix that proposes proportionate, country-lawful penalties.
- [ ] No disciplinary penalty can be issued without a recorded investigation, evidence meeting the standard, and a documented employee hearing.
- [ ] Suspension and salary-deduction controls enforce country legal limits and block unlawful actions.
- [ ] The disciplinary→termination pathway is gated, traceable and linked to separation/EOSB.
- [ ] Appeals, confidentiality, consistency/fairness checks and documentation standards are enforced with audit capture.
- [ ] Dashboard, KPIs, risk matrix, audit checklist and monthly compliance pack are live and exportable.
- [ ] Sample misconduct report, hearing record, warning-letter structure and disciplinary register are configurable digital artefacts with export.

---

## User Stories

### EPIC-26-S01 — Disciplinary Governance, Legal Context & Policy

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a configurable disciplinary governance framework with country legal context and a published disciplinary policy, **so that** all disciplinary action follows lawful, documented authority structures.

**Description**
Establishes governance (decision authorities by penalty level, segregation of investigator vs decision-maker), encodes GCC legal context (UAE Labour Law, KSA Labour Law/MHRSD, Bahrain, Qatar, Oman, Kuwait limits on penalties, deductions and dismissal grounds), and manages the disciplinary policy lifecycle (publish, version, acknowledge).

**Acceptance Criteria**

- [ ] Given governance config, when set, then authority-to-issue thresholds per penalty type are enforced via RBAC.
- [ ] Given country legal-context data, when a case is in a country, then applicable statutory limits/grounds are surfaced to the decision-maker.
- [ ] Given a disciplinary policy is published, when employees log in, then they acknowledge the version with timestamp.
- [ ] Given the investigator equals the proposed decision-maker, when validated, then the system warns/blocks per segregation rule.
- [ ] Given any governance/policy change, when saved, then it is versioned and audited.

**Tasks**

- [ ] Backend: `disciplinary_governance`, `disciplinary_policy`, `country_legal_context` entities/migrations.
- [ ] Backend: authority-threshold + segregation-of-duties guard.
- [ ] Frontend: governance config + policy acknowledgement screens.
- [ ] Rules/Config: per-country statutory limits/grounds reference data.
- [ ] Alerts/Workflow: policy re-acknowledgement notifications.
- [ ] Tests: unit (authority thresholds), integration (policy versioning + audit).

**Covers:** 26.1, 26.2, 26.3, 26.4, 26.5
**Dependencies:** EPIC-32

### EPIC-26-S02 — Misconduct Classification & Disciplinary Penalty Matrix

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 8
**As an** HR Manager, **I want** to classify misconduct and apply a configurable penalty matrix, **so that** penalties are proportionate, consistent and lawful for the country.

**Description**
Implements a misconduct taxonomy (minor/major/gross categories with specific offences—absenteeism, insubordination, safety breach, theft, fraud, harassment-linked, etc.) and a penalty matrix mapping offence × prior-record × severity to a recommended penalty (verbal/written warning, final warning, fine, suspension, demotion, dismissal), constrained by country legal limits.

**Acceptance Criteria**

- [ ] Given a case, when an offence is classified, then category and severity are recorded and drive matrix lookup.
- [ ] Given an offence plus the employee's active prior warnings, when the matrix runs, then a proportionate recommended penalty is proposed.
- [ ] Given a proposed penalty, when it exceeds country legal limits, then it is blocked/flagged with the statutory reference.
- [ ] Given an HR override of the recommendation, when applied, then reason and approver are captured and audited.
- [ ] Given expired prior warnings, when matrix runs, then they are excluded per validity period (configurable).

**Tasks**

- [ ] Backend: `misconduct_category`, `misconduct_offence`, `penalty_matrix_rule`, `disciplinary_case` entities/migrations.
- [ ] Backend: matrix evaluation service using prior-record + severity in the rule engine.
- [ ] Frontend: classification + recommended-penalty screen with override.
- [ ] Rules/Config: configurable matrix and per-country legal-limit constraints and warning-validity periods.
- [ ] Alerts/Workflow: approval routing for overrides/escalated penalties.
- [ ] Tests: unit (matrix evaluation + legal cap), integration (prior-record aggregation).

**Covers:** 26.6, 26.7
**Dependencies:** EPIC-26-S01

### EPIC-26-S03 — Pre-Action Investigation & Evidence Standards

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 8
**As an** Internal Auditor, **I want** every disciplinary action gated behind a recorded investigation meeting evidence standards, **so that** penalties are defensible and not overturned for lack of due process.

**Description**
Requires a documented investigation before any penalty, capturing allegations, evidence (with source, reliability, chain-of-custody, integrity hash), the standard of proof (balance of probabilities), and a finding per allegation. Consumes EPIC-25 investigation findings where the case originated from a grievance, avoiding duplication.

**Acceptance Criteria**

- [ ] Given a disciplinary case, when a penalty above a configured threshold is attempted, then it is blocked unless a completed investigation with findings exists.
- [ ] Given evidence, when logged, then source/reliability/custody/hash are captured and tamper-evident.
- [ ] Given a grievance-origin case, when linked, then EPIC-25 findings/evidence are imported (redacted as needed) rather than re-entered.
- [ ] Given findings, when recorded, then each allegation has a finding and the standard of proof applied.
- [ ] Given any investigation step, when performed, then it is audited.

**Tasks**

- [ ] Backend: `disciplinary_investigation`, `disciplinary_evidence`, `disciplinary_finding` entities + evidence-hashing service.
- [ ] Backend: penalty-gate guard requiring investigation; EPIC-25 import adapter.
- [ ] Frontend: investigation/evidence/findings workspace.
- [ ] Rules/Config: penalty thresholds requiring investigation; standard-of-proof per country.
- [ ] Alerts/Workflow: investigation SLA reminders.
- [ ] Tests: integration (penalty gate + grievance import), unit (evidence integrity).

**Covers:** 26.8, 26.9
**Dependencies:** EPIC-25, EPIC-26-S02

### EPIC-26-S04 — Employee Hearing & Right to Respond

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** a structured employee hearing step with the right to respond, **so that** the employee's side is heard and recorded before any penalty is finalised.

**Description**
Implements a mandatory hearing workflow: issue notice with allegations and evidence summary within a minimum notice period, record attendance and the employee's representations (and right to be accompanied where applicable), and capture the hearing outcome that feeds the penalty decision.

**Acceptance Criteria**

- [ ] Given a case ready for penalty, when a hearing is required, then a hearing notice with allegations/evidence and a minimum notice period is issued and logged.
- [ ] Given the hearing, when held, then attendance, employee representations and accompaniment are recorded.
- [ ] Given the employee does not attend, when documented, then reasonable-opportunity/rescheduling rules are applied before proceeding.
- [ ] Given a penalty above threshold, when issued without a recorded hearing, then the system blocks it.
- [ ] Given any hearing event, when stored, then it is audited.

**Tasks**

- [ ] Backend: `disciplinary_hearing` (notice, notice_period, attendance, representations, outcome) entity + hearing-gate guard.
- [ ] Backend: notice generation linked to document store.
- [ ] Frontend: hearing scheduling, notice, and minutes capture screens.
- [ ] Rules/Config: per-country minimum notice periods and accompaniment rights.
- [ ] Alerts/Workflow: hearing notice/reminder notifications.
- [ ] Tests: integration (hearing gate + non-attendance handling), unit (notice period).

**Covers:** 26.10
**Dependencies:** EPIC-26-S03

### EPIC-26-S05 — Types of Disciplinary Actions & Issuance

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** to issue the full range of disciplinary actions with proper records, **so that** penalties are formally documented, communicated and tracked to expiry.

**Description**
Supports issuing verbal warning, written warning, final written warning, fine/penalty deduction (subject to legal-limit checks), demotion, suspension and dismissal-recommendation, each generating a formal letter/record, communicating to the employee, capturing acknowledgement, and tracking validity/expiry that feeds the penalty matrix's prior-record logic.

**Acceptance Criteria**

- [ ] Given a finalised decision, when a penalty type is issued, then the corresponding letter/record is generated and delivered with acknowledgement capture.
- [ ] Given a fine/deduction penalty, when issued, then it routes through legal-limit validation (S06) before payroll instruction.
- [ ] Given a warning, when issued, then its validity period is set and it appears in the employee's active record.
- [ ] Given employee non-acknowledgement, when occurring, then delivery is still evidenced (e.g. witnessed/registered) and recorded.
- [ ] Given any issuance, when completed, then it is audited and filed to the employee record.

**Tasks**

- [ ] Backend: `disciplinary_action` (type, validity_period, letter_ref, ack_status) entity + letter generator.
- [ ] Backend: prior-record feed to penalty matrix; payroll-instruction emitter for fines.
- [ ] Frontend: action issuance + acknowledgement screens.
- [ ] Rules/Config: per-country permissible action types and validity periods.
- [ ] Alerts/Workflow: issuance notification + acknowledgement reminder.
- [ ] Tests: integration (issuance→record→matrix feed), unit (validity expiry).

**Covers:** 26.11
**Dependencies:** EPIC-26-S04

### EPIC-26-S06 — Suspension Pending Investigation & Salary-Deduction Legal Limits

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** suspension and salary-deduction controls enforcing GCC legal limits, **so that** the employer never applies unlawful suspension or deductions.

**Description**
Implements precautionary suspension (paid/unpaid per law, duration caps, review checkpoints) and salary-deduction guardrails enforcing statutory caps (e.g. monthly fine/deduction percentage limits and cumulative caps under UAE/KSA/Bahrain/Qatar/Oman/Kuwait law), blocking deductions that breach limits and ensuring WPS-consistent payroll instructions.

**Acceptance Criteria**

- [ ] Given a suspension, when applied, then pay treatment, start/end and review dates follow country rules, with duration-cap alerts.
- [ ] Given a proposed deduction, when it exceeds the statutory single-month or cumulative cap, then it is blocked with the legal reference.
- [ ] Given multiple penalties in a period, when aggregated, then total deductions are capped per country limit.
- [ ] Given an approved lawful deduction, when posted, then a WPS-consistent payroll instruction is emitted and reconciled.
- [ ] Given any suspension/deduction action, when processed, then it is audited.

**Tasks**

- [ ] Backend: `disciplinary_suspension`, `disciplinary_deduction` entities + statutory-cap validation in rule engine.
- [ ] Backend: cumulative-cap aggregation + payroll/WPS instruction emitter.
- [ ] Frontend: suspension and deduction screens with limit indicators.
- [ ] Rules/Config: per-country deduction caps, suspension pay rules and duration limits.
- [ ] Alerts/Workflow: suspension-review reminders; deduction-blocked alerts.
- [ ] Tests: unit (cap enforcement), integration (cumulative cap + payroll instruction).

**Covers:** 26.12, 26.13
**Dependencies:** EPIC-10, EPIC-26-S05

### EPIC-26-S07 — Disciplinary Action and Termination Linkage

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a gated pathway from disciplinary action to termination, **so that** dismissals are lawfully grounded, traceable and connected to separation/EOSB processing.

**Description**
Links disciplinary outcomes to EPIC-27: where the matrix/decision results in dismissal (including gross-misconduct summary dismissal under specific statutory grounds), AuraOS verifies the required disciplinary history/grounds, requires elevated approval, and initiates a separation case carrying findings, hearing record and country dismissal-ground references, flagging EOSB/notice implications.

**Acceptance Criteria**

- [ ] Given a dismissal recommendation, when raised, then required disciplinary history or qualifying statutory ground is verified before proceeding.
- [ ] Given a gross-misconduct summary dismissal, when selected, then the specific country statutory ground (e.g. UAE Art. 44 type grounds, KSA Art. 80 type grounds) must be cited and evidenced.
- [ ] Given approval, when granted at the required authority level, then a separation case is created with linked disciplinary evidence and dismissal type.
- [ ] Given a dismissal type, when set, then notice/EOSB impact flags are passed to separation/EOSB.
- [ ] Given any linkage event, when performed, then it is audited with full traceability.

**Tasks**

- [ ] Backend: `disciplinary_termination_link` entity + dismissal-grounds verification service.
- [ ] Backend: separation-init event emitter with evidence handoff.
- [ ] Frontend: dismissal decision screen with grounds citation.
- [ ] Rules/Config: per-country dismissal grounds and required-history rules.
- [ ] Alerts/Workflow: elevated-approval routing; separation owner notification.
- [ ] Tests: integration (grounds verification + separation init), unit (history checks).

**Covers:** 26.14
**Dependencies:** EPIC-27, EPIC-26-S05

### EPIC-26-S08 — Disciplinary Appeals

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As an** Employee (Self-Service), **I want** to appeal a disciplinary decision to an independent reviewer, **so that** wrong or disproportionate penalties can be corrected internally.

**Description**
Provides an appeals workflow allowing the disciplined employee to appeal within a defined window on stated grounds, routing to a reviewer independent of the original decision-maker, with the ability to uphold, reduce or overturn the penalty and to reverse any associated deduction/record where overturned.

**Acceptance Criteria**

- [ ] Given a disciplinary decision, when communicated, then the appeal window and grounds options are presented to the employee.
- [ ] Given an appeal is lodged within window, when assigned, then it routes to an independent reviewer.
- [ ] Given an appeal decision, when recorded, then it upholds/reduces/overturns with reasons.
- [ ] Given an overturned penalty, when finalised, then associated warning record and any deduction are reversed and re-reconciled.
- [ ] Given any appeal event, when stored, then it is audited.

**Tasks**

- [ ] Backend: `disciplinary_appeal` (grounds, reviewer, decision) entity + independent-reviewer guard + reversal service.
- [ ] Backend: deduction/record reversal with payroll re-reconciliation.
- [ ] Frontend: appeal submission + review screens.
- [ ] Rules/Config: per-country appeal windows.
- [ ] Alerts/Workflow: appeal lodged/decided notifications.
- [ ] Tests: integration (independence + reversal), unit (window enforcement).

**Covers:** 26.15
**Dependencies:** EPIC-26-S05, EPIC-26-S06

### EPIC-26-S09 — Confidentiality, Consistency/Fairness & Documentation Standards

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** confidentiality, consistency/fairness checks and documentation standards enforced, **so that** discipline is private, even-handed and fully documented.

**Description**
Enforces need-to-know access to disciplinary records, a consistency engine comparing the proposed penalty against precedents for similar offences (flagging disparate treatment risk), and documentation-completeness validation (investigation, hearing, decision, communication, acknowledgement) before closure.

**Acceptance Criteria**

- [ ] Given a disciplinary record, when accessed, then only authorised roles view it and access is logged.
- [ ] Given a proposed penalty, when the consistency engine runs, then it surfaces comparable past cases and flags disparate treatment for the same offence/severity.
- [ ] Given case closure, when validated, then mandatory documents must be present or closure is blocked.
- [ ] Given a disparate-treatment flag, when raised, then justification or adjustment is required before issuance.
- [ ] Given any access/consistency/documentation action, when performed, then it is audited.

**Tasks**

- [ ] Backend: confidentiality middleware + `consistency_check` service comparing precedents + completeness validator.
- [ ] Backend: precedent index by offence/severity/outcome.
- [ ] Frontend: consistency-comparison panel + closure completeness checklist.
- [ ] Rules/Config: comparable-case criteria and mandatory-document sets per country.
- [ ] Alerts/Workflow: disparate-treatment review prompt; closure-blocked notice.
- [ ] Tests: integration (consistency flagging + closure block), unit (access logging).

**Covers:** 26.16, 26.17, 26.18
**Dependencies:** EPIC-26-S02, EPIC-26-S04

### EPIC-26-S10 — Country-Specific Disciplinary Control Notes

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3
**As an** HR Manager, **I want** country-specific control notes surfaced during disciplinary handling, **so that** decisions respect each GCC jurisdiction's procedural and substantive rules.

**Description**
Maintains a configurable per-country control-note library (notice periods, deduction caps, prohibited penalties, summary-dismissal grounds, time bars for acting on misconduct, documentation requirements) surfaced contextually within the disciplinary workflow for UAE, KSA, Bahrain, Qatar, Oman and Kuwait.

**Acceptance Criteria**

- [ ] Given a case's country, when handling proceeds, then relevant control notes are shown at the appropriate step.
- [ ] Given a time bar (e.g. acting within statutory days of discovery), when exceeded, then the system warns/blocks.
- [ ] Given a prohibited penalty for a country, when selected, then it is blocked with the reference.
- [ ] Given control-note updates, when published, then versioning applies and notes refresh in-workflow.
- [ ] Given any control-note application, when triggered, then it is audited.

**Tasks**

- [ ] Backend: `country_control_note` (versioned) entity + contextual-surfacing service; time-bar guard.
- [ ] Frontend: contextual control-note panel.
- [ ] Rules/Config: per-country notes, time bars and prohibited penalties.
- [ ] Alerts/Workflow: time-bar warning.
- [ ] Tests: unit (time-bar/prohibited-penalty), integration (contextual surfacing).

**Covers:** 26.19
**Dependencies:** EPIC-26-S01

### EPIC-26-S11 — Disciplinary Audit Checklist & Risk Matrix

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable disciplinary audit checklist and risk matrix with red flags, **so that** I can verify due process and quantify disciplinary risk.

**Description**
Delivers an audit checklist (investigation present, hearing held, evidence standard met, penalty within legal limit, consistency checked, documentation complete) with pass/fail and evidence links, plus a risk register/matrix (likelihood × impact) auto-flagging red flags (penalty without hearing, deduction over cap, disparate treatment, time-bar breach, dismissal without grounds).

**Acceptance Criteria**

- [ ] Given the checklist, when run for a period/entity, then each item returns pass/fail/N-A with evidence and a score.
- [ ] Given the risk matrix, when populated, then risks plot on a likelihood×impact grid with residual ratings.
- [ ] Given red-flag rules, when triggered, then items auto-raise to the risk register.
- [ ] Given remediation owners/dates, when assigned, then overdue items are escalated.
- [ ] Given checklist/risk changes, when saved, then they are audited.

**Tasks**

- [ ] Backend: `disciplinary_audit_checklist`, `disciplinary_audit_result`, `disciplinary_risk_register` + red-flag engine.
- [ ] Backend: scoring/residual-rating service.
- [ ] Frontend: checklist runner + risk heat grid.
- [ ] Rules/Config: configurable items, red-flag thresholds, risk scales.
- [ ] Alerts/Workflow: overdue-remediation escalation.
- [ ] Tests: unit (red flags/scoring), integration (checklist→register).

**Covers:** 26.20, 26.22
**Dependencies:** EPIC-26-S03, EPIC-26-S06

### EPIC-26-S12 — Disciplinary KPIs, Dashboard & Automation Design

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 8
**As an** Executive / Leadership user, **I want** a disciplinary dashboard with KPIs and an automation design, **so that** I have visibility of disciplinary volumes, fairness and legal-risk indicators.

**Description**
Builds disciplinary analytics (KPIs: cases by type/severity, penalty distribution, % with hearing, average time-to-decision, deduction-cap breaches prevented, appeal/overturn rate, dismissal rate, repeat-offender rate, consistency-flag rate) and an interactive dashboard with country/entity drill-down, underpinned by an event-driven automation blueprint (matrix evaluation, gates, alerts, escalation).

**Acceptance Criteria**

- [ ] Given disciplinary data, when the dashboard loads, then KPIs render with country/entity/period filters and drill-down.
- [ ] Given overturn/consistency-flag/cap-breach metrics, when present, then they are highlighted with trends.
- [ ] Given the automation design, when configured, then matrix evaluation, gates and escalations run on case events from the event bus.
- [ ] Given RBAC, when a viewer lacks rights, then individual case detail is masked while aggregate KPIs remain.
- [ ] Given KPI computation, when run, then figures reconcile with the disciplinary register.

**Tasks**

- [ ] Backend: KPI aggregation + materialised views; automation rules on event bus.
- [ ] Backend: dashboard APIs with RBAC masking.
- [ ] Frontend: disciplinary dashboard (KPI cards, trends, drill-down).
- [ ] Rules/Config: KPI thresholds and automation triggers.
- [ ] Alerts/Workflow: dashboard alerts for breaches/spikes.
- [ ] Tests: integration (KPI reconciliation), e2e (filters + masking).

**Covers:** 26.21, 26.23, 26.24
**Dependencies:** EPIC-26-S02, EPIC-26-S06

### EPIC-26-S13 — Monthly Disciplinary Compliance Pack

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** an auto-generated monthly disciplinary compliance pack, **so that** management and auditors receive a certified disciplinary summary.

**Description**
Generates a periodic pack consolidating cases by type/severity, penalty distribution, due-process compliance (hearing/investigation rates), deduction-legality status, appeals/overturns, audit-checklist results and risk-matrix highlights, with management certification and export (PDF/Excel).

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

**Covers:** 26.25
**Dependencies:** EPIC-26-S11, EPIC-26-S12

### EPIC-26-S14 — Sample Misconduct Report Form (Configurable Digital Form)

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3
**As a** Line Manager, **I want** a configurable digital misconduct report form, **so that** incidents are reported consistently and initiate a disciplinary case.

**Description**
Provides a configurable misconduct report form (employee, date/time/location, offence category, description, witnesses, evidence attachments, immediate action taken, reporter declaration) that creates a disciplinary case and is exportable as a branded PDF template.

**Acceptance Criteria**

- [ ] Given the form builder, when fields are configured, then mandatory/conditional fields are enforced.
- [ ] Given a submission, when validated, then a disciplinary case is created and classified for triage.
- [ ] Given attachments, when added, then they are stored as evidence with metadata.
- [ ] Given export, when requested, then a branded PDF template is produced.
- [ ] Given form changes, when saved, then versioning and audit apply.

**Tasks**

- [ ] Backend: form-definition entity + render/validate service linked to case creation.
- [ ] Frontend: form builder + manager-facing form.
- [ ] Rules/Config: per-country/entity field sets.
- [ ] Alerts/Workflow: case-created acknowledgement.
- [ ] Tests: unit (validation), integration (form→case + PDF).

**Covers:** 26.26
**Dependencies:** EPIC-26-S02

### EPIC-26-S15 — Sample Hearing Record, Warning Letter Structure & Disciplinary Register

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a hearing record template, warning-letter structure and disciplinary register, **so that** disciplinary documentation is standardised, lawful and audit-ready.

**Description**
Delivers three configurable digital artefacts: a disciplinary hearing record template (notice, attendees, allegations, employee representations, decision), a warning-letter structure (offence, prior history, expectation, consequence of recurrence, validity, appeal rights) generated per country wording, and a disciplinary register (all cases with type, penalty, status, validity, appeal)—each filterable and exportable.

**Acceptance Criteria**

- [ ] Given a hearing, when the record is generated, then it follows the template and pulls hearing data.
- [ ] Given a warning, when issued, then the letter follows the configured structure with mandatory clauses (incl. appeal rights) per country.
- [ ] Given the disciplinary register, when opened, then all cases list with filters (country, type, penalty, status) and export.
- [ ] Given a record/letter/register change, when saved, then it is audited and exportable (PDF/Excel).
- [ ] Given a missing mandatory clause, when generating a letter, then generation is blocked with the gap identified.

**Tasks**

- [ ] Backend: hearing-record + warning-letter generators (template-driven) + register query service.
- [ ] Backend: mandatory-clause validation per country.
- [ ] Frontend: hearing-record builder, letter preview, disciplinary register grid.
- [ ] Rules/Config: configurable templates/clauses and register columns per country.
- [ ] Alerts/Workflow: letter-issuance notification.
- [ ] Tests: integration (letter generation + register export), unit (clause validation).

**Covers:** 26.27, 26.28, 26.29
**Dependencies:** EPIC-26-S04, EPIC-26-S05

### EPIC-26-S16 — Key Takeaways & Disciplinary Knowledge Reference

**Labels:** `user-story`, `employee-relations` · **Priority:** Could · **Estimate:** 1
**As an** HR Admin, **I want** an in-product Key Takeaways/knowledge reference for the disciplinary module, **so that** users follow due process and country rules at point of use.

**Description**
Surfaces concise key takeaways and contextual guidance (fair-process principles, deduction/penalty limits, country nuances, do/don't lists) within the disciplinary module as version-controlled help content linked to relevant screens.

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

**Covers:** 26.30
**Dependencies:** EPIC-26-S01
