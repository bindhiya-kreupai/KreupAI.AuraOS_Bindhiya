# EPIC-25: Chapter 25 – Employee Relations and Grievance Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 25 – Employee Relations and Grievance Compliance
> **Module:** Employee Relations · **Labels:** `epic`, `gcc-compliance`, `employee-relations`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an end-to-end AuraOS Employee Relations & Grievance module that captures complaints from multiple channels, runs structured risk triage, supports informal resolution and formal investigations with interviews and evidence standards, and enforces confidentiality, statutory timelines, anti-retaliation and appeal controls across all six GCC countries. The module must produce defensible case files that withstand scrutiny by MOHRE, MHRSD, LMRA, PAM, Qatar MOL/ADLSA and Oman MOL labour authorities and protect the employer from authority complaints and litigation.

## Business Value

Reduces exposure to labour-authority complaints, harassment/discrimination claims and retaliation lawsuits by ensuring every grievance is logged, risk-assessed, investigated and resolved within statutory timelines with a full audit trail. Improves employee trust and experience through transparent intake channels and appeals, while giving HR, Compliance and Leadership real-time visibility of ER risk, open cases and SLA breaches for audit-readiness.

## Requirements Covered (handbook sections)

- 25.1 Introduction
- 25.2 Objectives of Employee Relations Compliance
- 25.3 GCC Labour Complaint Context
- 25.4 Employee Relations Governance Framework
- 25.5 Grievance Policy
- 25.6 Types of Grievances
- 25.7 Complaint Channels
- 25.8 Grievance Intake Process
- 25.9 Initial Risk Assessment
- 25.10 Informal Resolution
- 25.11 Formal Investigation Process
- 25.12 Investigation Interviews
- 25.13 Harassment and Bullying Complaints
- 25.14 Discrimination Complaints
- 25.15 Retaliation Controls
- 25.16 Workplace Conflict Resolution
- 25.17 Grievance and Disciplinary Linkage
- 25.18 Confidentiality
- 25.19 Documentation Standards
- 25.20 Grievance Timelines
- 25.21 Appeals
- 25.22 Authority Complaints
- 25.23 Grievance Data Privacy
- 25.24 Employee Relations Audit Checklist
- 25.25 Employee Relations KPIs
- 25.26 Employee Relations Risk Matrix
- 25.27 HRMS Employee Relations Automation Design
- 25.28 Employee Relations Dashboard
- 25.29 Monthly Employee Relations Compliance Pack
- 25.30 Sample Grievance Intake Form
- 25.31 Sample Grievance Register
- 25.32 Sample Investigation Report Structure
- 25.33 Sample Corrective Action Register
- 25.34 Key Takeaways

## Out of Scope

- Disciplinary penalty execution and warning-letter issuance (covered by EPIC-26).
- Termination/separation processing arising from grievance outcomes (covered by EPIC-27).
- General HR policy authoring/version control beyond the grievance & anti-harassment policies surfaced here (covered by EPIC-32).
- Direct API submission/defence on government labour-dispute portals; AuraOS records the authority case but does not file it.

## Dependencies

- EPIC-26 (Disciplinary Action — grievance→disciplinary linkage)
- EPIC-27 (Termination & Separation — outcomes leading to exit)
- EPIC-32 (HR Policies — grievance & anti-harassment policy lifecycle)
- Platform services: RBAC, workflow/approval engine, document store, audit trail, alerts, country rule engine

## Epic Definition of Done

- [ ] Employees can raise grievances through at least four channels (portal, app, email-to-case, hotline/anonymous, manager-logged) with a unique case reference.
- [ ] Every case is auto-triaged into a risk tier that drives SLA, confidentiality level and investigation path.
- [ ] Formal investigations support interviews, evidence logging with chain-of-custody, and a structured investigation report.
- [ ] Retaliation, harassment, discrimination and confidentiality controls are enforced by configurable rules with audit capture.
- [ ] Country-configurable grievance timelines and authority-complaint tracking are live for all six GCC countries.
- [ ] ER dashboard, KPIs, risk matrix, audit checklist and monthly compliance pack are operational and exportable.
- [ ] Sample intake form, grievance register, investigation report template and corrective-action register are configurable digital artefacts with export.

---

## User Stories

### EPIC-25-S01 — ER Governance Framework, Grievance Policy & Grievance Type Catalogue

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a configurable ER governance framework with a published grievance policy and a catalogue of grievance types, **so that** every complaint is handled under a documented, country-aware standard that reflects GCC labour-complaint context.

**Description**
Establishes the foundation: roles/responsibilities (ER committee, HR Manager, investigator), the grievance policy lifecycle (publish, version, acknowledge), and a master catalogue of grievance types (pay/EOSB, working conditions, harassment, bullying, discrimination, retaliation, contract/visa, accommodation, manager conduct). Captures GCC labour-complaint context per country so the framework explains where employees can escalate (MOHRE, MHRSD/Qiwa, LMRA, PAM, ADLSA, Oman MOL).

**Acceptance Criteria**

- [ ] Given a Compliance Officer configures the framework, when they define ER roles, then RBAC scopes for intake, triage, investigation and approval are created and enforced.
- [ ] Given a grievance policy is published, when an employee logs in, then they must acknowledge the current policy version and the acknowledgement is timestamped to the audit trail.
- [ ] Given the grievance type catalogue, when a new case is created, then the user must select a type and sub-type that drives default risk weighting and routing.
- [ ] Given a country is selected, when context is displayed, then the relevant external authority/escalation path (e.g. MOHRE for UAE, MHRSD for KSA, LMRA for Bahrain) is shown.
- [ ] Given any framework change, when saved, then a versioned audit record (who/what/when/before-after) is written.

**Tasks**

- [ ] Backend: `er_governance_config`, `grievance_policy` (version, status, effective_date), `grievance_type` (code, label, default_risk_weight, default_path) entities + migrations.
- [ ] Backend: policy acknowledgement service + RBAC scope registration for ER roles.
- [ ] Frontend: ER admin config screen + employee policy-acknowledgement screen.
- [ ] Rules/Config: per-country authority/escalation reference data for UAE/KSA/Bahrain/Qatar/Oman/Kuwait.
- [ ] Alerts/Workflow: notify employees on new/changed policy version requiring re-acknowledgement.
- [ ] Tests: unit (catalogue validation), integration (policy versioning + acknowledgement audit).

**Covers:** 25.1, 25.2, 25.3, 25.4, 25.5, 25.6
**Dependencies:** EPIC-32

### EPIC-25-S02 — Multi-Channel Complaint Intake & Grievance Case Creation

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 8
**As an** Employee (Self-Service), **I want** to raise a grievance through multiple channels including anonymously, **so that** I can report issues safely and receive a tracked case reference.

**Description**
Implements complaint channels (employee/manager portal, mobile app, email-to-case, anonymous hotline/web form) and a standardised intake process that creates a grievance case with a unique reference, captures the complainant, respondent(s), category, narrative, desired outcome and supporting attachments, and acknowledges receipt automatically.

**Acceptance Criteria**

- [ ] Given an employee submits via any channel, when the case is created, then a unique reference (e.g. `GRV-{country}-{YYYY}-{seq}`) is generated and an acknowledgement is sent within the configured SLA.
- [ ] Given an anonymous submission, when created, then complainant identity is masked/omitted while the case remains actionable, with anonymity flagged on the record.
- [ ] Given an email-to-case, when received at the ER inbox, then a case is auto-created with the email body/attachments captured.
- [ ] Given a manager logs a grievance on behalf of an employee, when saved, then both the source manager and the affected employee are recorded.
- [ ] Given mandatory intake fields are missing, when submitting, then validation blocks submission with field-level errors.
- [ ] Given any intake event, when stored, then it is written to the audit trail with channel and timestamp.

**Tasks**

- [ ] Backend: `grievance_case` (ref, channel, complainant_id nullable, anonymous_flag, respondent_ids, category, narrative, desired_outcome, status) + `grievance_attachment` entities/migrations.
- [ ] Backend: intake service with reference generator + email-to-case ingestion consumer on event bus.
- [ ] Frontend: employee/manager intake form, mobile-responsive, plus public anonymous web form.
- [ ] Rules/Config: per-country reference format and acknowledgement-SLA configuration.
- [ ] Alerts/Workflow: auto-acknowledgement notification + route to ER queue.
- [ ] Tests: integration (all channels create valid case), e2e (anonymous + email-to-case).

**Covers:** 25.7, 25.8
**Dependencies:** —

### EPIC-25-S03 — Initial Risk Assessment & Triage Routing

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** every new grievance auto-triaged into a risk tier, **so that** high-risk cases (harassment, safety, retaliation, authority-escalation threat) get faster, more confidential handling.

**Description**
On case creation, AuraOS computes an initial risk score from grievance type, presence of harassment/discrimination/retaliation markers, vulnerability of complainant, and potential authority/legal exposure, assigning a tier (Low/Medium/High/Critical) that sets SLA, confidentiality level, assigned investigator seniority and whether informal resolution is permitted.

**Acceptance Criteria**

- [ ] Given a case is created, when triage runs, then a risk tier and rationale are recorded automatically.
- [ ] Given a harassment, discrimination or retaliation category, when triaged, then the case is forced to at least High tier and informal-only resolution is disabled.
- [ ] Given a High/Critical tier, when assigned, then only senior ER/investigator roles can view/handle it (elevated confidentiality).
- [ ] Given an HR Manager overrides the tier, when saved, then the override, reason and approver are audited.
- [ ] Given the tier is set, when SLA clocks start, then due dates for acknowledgement, investigation and resolution are computed per country config.

**Tasks**

- [ ] Backend: `grievance_risk_assessment` (tier, score, factors, rationale, override_reason) entity + scoring service in rule engine.
- [ ] Backend: SLA computation tied to tier + country timelines.
- [ ] Frontend: triage panel showing score factors and tier with override control.
- [ ] Rules/Config: configurable risk factors/weights and forced-tier rules per category/country.
- [ ] Alerts/Workflow: escalate Critical cases to ER committee immediately.
- [ ] Tests: unit (scoring), integration (forced tier + confidentiality enforcement).

**Covers:** 25.9
**Dependencies:** EPIC-25-S02

### EPIC-25-S04 — Informal Resolution & Workplace Conflict Resolution

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3
**As an** HR Manager, **I want** to run and record informal resolution and conflict-resolution actions, **so that** low-risk interpersonal grievances are resolved quickly without a formal investigation.

**Description**
Supports an informal track (mediation, facilitated conversation, manager coaching) for eligible low/medium-risk cases, capturing actions, agreements and outcomes, with the ability to escalate to formal investigation if informal resolution fails or new risk emerges.

**Acceptance Criteria**

- [ ] Given a case is eligible (tier allows), when HR selects informal resolution, then mediation/conflict-resolution steps and outcomes can be logged.
- [ ] Given informal resolution is recorded as agreed, when closed, then complainant acknowledgement is captured and the case is marked resolved-informal.
- [ ] Given informal resolution fails or new risk markers appear, when escalated, then the case converts to formal investigation retaining all prior records.
- [ ] Given a harassment/discrimination/retaliation case, when informal resolution is attempted, then the system blocks it unless senior approval is recorded.
- [ ] Given any informal action, when logged, then it is audited.

**Tasks**

- [ ] Backend: `informal_resolution` (method, sessions, agreement, outcome, complainant_ack) entity + escalate-to-formal transition.
- [ ] Backend: eligibility guard tied to risk tier and category.
- [ ] Frontend: informal resolution workspace with session log and outcome capture.
- [ ] Rules/Config: eligibility and senior-approval thresholds per category.
- [ ] Alerts/Workflow: notify parties of agreed outcome; escalation alert on failure.
- [ ] Tests: integration (escalation retains history), unit (eligibility guard).

**Covers:** 25.10, 25.16
**Dependencies:** EPIC-25-S03

### EPIC-25-S05 — Formal Investigation Process, Interviews & Evidence Standards

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 13
**As an** Internal Auditor, **I want** formal investigations to follow a structured process with interviews and defensible evidence standards, **so that** outcomes are fair, consistent and legally defensible before any authority.

**Description**
Implements the formal investigation workflow: appoint investigator (conflict-of-interest check), define scope/allegations, plan and record interviews (complainant, respondent, witnesses) with statements, log evidence with chain-of-custody and source/reliability tagging, apply the balance-of-probabilities standard, and reach documented findings per allegation.

**Acceptance Criteria**

- [ ] Given a formal case, when an investigator is appointed, then a conflict-of-interest declaration is required and recorded.
- [ ] Given an investigation plan, when interviews are scheduled, then each interviewee record stores invitation, attendance, statement and right-to-be-accompanied note where applicable.
- [ ] Given evidence is added, when logged, then it captures source, date obtained, reliability tag, custodian and an immutable hash for integrity.
- [ ] Given findings are recorded, when finalised, then each allegation has a finding (substantiated/partly/unsubstantiated) with reasoning and the standard of proof applied.
- [ ] Given investigation completion, when closed, then a draft investigation report is generated for review/approval.
- [ ] Given any investigation step, when performed, then it is captured in the audit trail with actor and timestamp.

**Tasks**

- [ ] Backend: `investigation`, `investigation_interview`, `investigation_evidence` (source, reliability, custody, hash), `investigation_finding` entities/migrations.
- [ ] Backend: conflict-of-interest guard + evidence integrity hashing service.
- [ ] Frontend: investigation case workspace (scope, interviews, evidence, findings).
- [ ] Rules/Config: standard-of-proof and accompaniment rules per country.
- [ ] Alerts/Workflow: interview scheduling notifications + investigation SLA reminders.
- [ ] Tests: integration (evidence integrity + COI guard), e2e (full investigation to findings).

**Covers:** 25.11, 25.12
**Dependencies:** EPIC-25-S03

### EPIC-25-S06 — Harassment, Bullying & Discrimination Case Handling

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 8
**As an** HR Manager, **I want** specialised handling paths for harassment, bullying and discrimination complaints, **so that** these sensitive cases follow elevated confidentiality, protected-characteristic capture and mandatory formal investigation.

**Description**
Adds dedicated intake/triage and handling logic for harassment & bullying and for discrimination (protected characteristics: gender, nationality, religion, disability, etc.), enforcing elevated confidentiality, mandatory formal investigation, support measures for complainants, and interim safeguarding (e.g. separation of parties pending investigation).

**Acceptance Criteria**

- [ ] Given a harassment/bullying case, when created, then it is forced to formal investigation with restricted access and support-measure prompts.
- [ ] Given a discrimination case, when created, then protected-characteristic fields are captured and tagged sensitive under data-privacy rules.
- [ ] Given interim safeguarding is required, when applied, then measures (reassignment, no-contact) are logged and linked to the case.
- [ ] Given a respondent is a senior leader, when triaged, then the case routes to an independent investigator outside the reporting line.
- [ ] Given sensitive-category data, when accessed, then access is restricted to authorised roles and every access is audited.

**Tasks**

- [ ] Backend: extend case model with `sensitive_category`, `protected_characteristics`, `interim_measures`; independent-routing service.
- [ ] Backend: access-restriction layer for sensitive cases.
- [ ] Frontend: harassment/discrimination intake + safeguarding panel.
- [ ] Rules/Config: protected-characteristic lists and forced-formal/independent-investigator rules per country.
- [ ] Alerts/Workflow: support-measure reminders + independent-investigator assignment.
- [ ] Tests: integration (forced formal + restricted access), unit (independent routing).

**Covers:** 25.13, 25.14
**Dependencies:** EPIC-25-S03, EPIC-25-S05

### EPIC-25-S07 — Retaliation Controls & Whistleblower Protection

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** retaliation-monitoring controls on complainants and witnesses, **so that** people who raise or support grievances are protected from adverse action.

**Description**
Flags complainants/witnesses for a configurable protection window and monitors for adverse HR events (disciplinary, negative review, transfer, termination, pay cut) against them during that window, requiring justification/second-line approval before such actions proceed and enabling a retaliation sub-complaint.

**Acceptance Criteria**

- [ ] Given a person becomes a complainant/witness, when flagged, then a protection window (configurable, e.g. 6/12 months) is set.
- [ ] Given an adverse HR action is initiated against a protected person during the window, when triggered, then the action is held for ER/Compliance review and justification.
- [ ] Given a retaliation sub-complaint is raised, when created, then it is linked to the originating case and triaged High.
- [ ] Given protection-window expiry, when reached, then the flag is lifted and audited.
- [ ] Given any protected-person event, when processed, then it is recorded in the audit trail.

**Tasks**

- [ ] Backend: `retaliation_protection` (subject_id, source_case, window_start/end) + adverse-action interceptor consuming HR events.
- [ ] Backend: linkage of retaliation sub-complaints to source case.
- [ ] Frontend: protected-persons view + adverse-action review queue.
- [ ] Rules/Config: protection-window length and adverse-action types per country.
- [ ] Alerts/Workflow: hold-and-review approval for flagged actions; expiry notification.
- [ ] Tests: integration (interceptor holds action), unit (window lifecycle).

**Covers:** 25.15
**Dependencies:** EPIC-25-S02

### EPIC-25-S08 — Grievance↔Disciplinary Linkage & Outcome Routing

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** to route substantiated grievance outcomes into the disciplinary process, **so that** investigation findings translate into consistent, traceable corrective action.

**Description**
Connects ER outcomes to EPIC-26: where an investigation substantiates misconduct by a respondent, AuraOS can initiate a linked disciplinary case carrying over findings/evidence, and where a complaint is unfounded/malicious, it can flag potential disciplinary action against the complainant under fairness rules.

**Acceptance Criteria**

- [ ] Given a substantiated finding, when HR routes it, then a disciplinary case is created pre-populated with linked findings and evidence references.
- [ ] Given a malicious/vexatious complaint finding, when recorded, then the system supports (but does not auto-trigger) a separate review with mandatory senior approval.
- [ ] Given a linked disciplinary case, when viewed, then bidirectional traceability between grievance and disciplinary records is shown.
- [ ] Given evidence is shared to disciplinary, when transferred, then confidentiality/redaction rules are applied.
- [ ] Given any linkage event, when performed, then it is audited.

**Tasks**

- [ ] Backend: `grievance_disciplinary_link` entity + outcome-routing service emitting a disciplinary-init event.
- [ ] Backend: redaction service for cross-module evidence sharing.
- [ ] Frontend: outcome routing screen with linkage display.
- [ ] Rules/Config: routing/approval rules for substantiated vs malicious findings.
- [ ] Alerts/Workflow: notify disciplinary owner on linked case creation.
- [ ] Tests: integration (link creation + traceability), unit (redaction).

**Covers:** 25.17
**Dependencies:** EPIC-26, EPIC-25-S05

### EPIC-25-S09 — Confidentiality, Documentation Standards & Grievance Data Privacy

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** enforced confidentiality, documentation standards and data-privacy controls on grievance records, **so that** sensitive ER data is protected and case files are complete and defensible.

**Description**
Implements need-to-know access tiers, document-standard validation (mandatory fields, naming, completeness checks before closure), and data-privacy controls (retention, minimisation, redaction, subject-access handling, lawful-basis tagging) for grievance records across GCC jurisdictions.

**Acceptance Criteria**

- [ ] Given a grievance record, when accessed, then only need-to-know roles see it and every view/download is logged.
- [ ] Given a case is being closed, when validation runs, then mandatory documentation (intake, risk assessment, investigation/finding, outcome) must be present or closure is blocked.
- [ ] Given data-privacy config, when a record reaches retention end, then disposal/anonymisation is scheduled and audited.
- [ ] Given a subject-access or correction request, when received, then a controlled export/redaction workflow handles it.
- [ ] Given any access or privacy action, when performed, then it is captured in the audit trail.

**Tasks**

- [ ] Backend: confidentiality-tier middleware + `document_standard_check` validation service; retention/disposal scheduler.
- [ ] Backend: subject-access export with redaction.
- [ ] Frontend: access banner, completeness checklist on closure, privacy-request handler.
- [ ] Rules/Config: per-country retention periods and lawful-basis tags.
- [ ] Alerts/Workflow: closure-blocked notification; retention-due alerts.
- [ ] Tests: integration (closure block + access logging), unit (retention scheduler).

**Covers:** 25.18, 25.19, 25.23
**Dependencies:** EPIC-25-S05

### EPIC-25-S10 — Grievance Timelines, SLA Engine & Appeals

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** country-configurable grievance timelines with SLA tracking and an appeals process, **so that** cases are resolved within statutory windows and employees can challenge outcomes.

**Description**
Provides an SLA engine for acknowledgement, investigation and resolution stages with per-country/per-tier targets, breach alerts at 75%/100% of SLA, and an appeals workflow allowing complainants/respondents to appeal an outcome to an independent reviewer within a defined window.

**Acceptance Criteria**

- [ ] Given a case stage, when SLA is configured, then due dates per country/tier are tracked and breaches flagged at thresholds.
- [ ] Given an outcome is communicated, when the appeal window opens, then eligible parties can lodge an appeal with grounds before it closes.
- [ ] Given an appeal is lodged, when assigned, then it routes to a reviewer independent of the original decision-maker.
- [ ] Given an appeal decision, when recorded, then it upholds/varies/overturns the outcome with reasons and is final per policy.
- [ ] Given any SLA breach or appeal event, when it occurs, then it is alerted and audited.

**Tasks**

- [ ] Backend: SLA engine (`case_sla` with stage targets) + `grievance_appeal` (grounds, reviewer, decision) entities.
- [ ] Backend: independent-reviewer routing guard.
- [ ] Frontend: SLA timeline view + appeal submission/review screens.
- [ ] Rules/Config: per-country timelines and appeal-window durations.
- [ ] Alerts/Workflow: 75%/100% breach alerts; appeal lodged/decided notifications.
- [ ] Tests: unit (SLA computation), integration (appeal independence + finality).

**Covers:** 25.20, 25.21
**Dependencies:** EPIC-25-S03

### EPIC-25-S11 — Labour Authority Complaint Tracking

**Labels:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** to track external labour-authority complaints linked to internal grievances, **so that** the employer responds within authority deadlines and maintains a defensible position file.

**Description**
Records complaints escalated to or filed with labour authorities (MOHRE/labour court UAE, MHRSD/labour office KSA, LMRA/MOL Bahrain, ADLSA Qatar, Oman MOL, PAM Kuwait), tracks hearing dates, required submissions, internal linkage, response deadlines and outcomes/settlements, ensuring the internal case file supports the authority response.

**Acceptance Criteria**

- [ ] Given an authority complaint, when logged, then the authority, jurisdiction, reference, filing date and linked internal grievance are captured.
- [ ] Given an authority deadline/hearing, when set, then reminders fire at configurable lead times (e.g. 7/3/1 days).
- [ ] Given a country is selected, when displayed, then the correct authority and process metadata are shown.
- [ ] Given an outcome/settlement, when recorded, then it links to final settlement/EOSB impact where relevant.
- [ ] Given any authority-case event, when stored, then it is audited.

**Tasks**

- [ ] Backend: `authority_complaint` (authority, jurisdiction, ref, filing_date, hearings[], deadlines[], outcome) + internal linkage.
- [ ] Backend: deadline/hearing reminder scheduler.
- [ ] Frontend: authority-complaint register and case detail.
- [ ] Rules/Config: per-country authority list, process steps and reminder lead times.
- [ ] Alerts/Workflow: deadline/hearing reminders to Compliance/PRO.
- [ ] Tests: integration (reminders + linkage), unit (country metadata).

**Covers:** 25.22
**Dependencies:** EPIC-25-S02

### EPIC-25-S12 — ER Audit Checklist & Risk Matrix

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable ER audit checklist and risk matrix with red-flag detection, **so that** I can verify ER compliance and quantify residual risk.

**Description**
Delivers a configurable ER audit checklist (intake completeness, timeliness, confidentiality, investigation quality, retaliation controls) producing pass/fail with evidence links, plus an ER risk register/matrix (likelihood × impact) with auto-flagged red flags (SLA breaches, missing documentation, repeat respondents, anonymous-case neglect).

**Acceptance Criteria**

- [ ] Given the audit checklist, when run for a period/entity, then each item returns pass/fail/N-A with linked evidence and a score.
- [ ] Given the risk matrix, when populated, then risks are plotted on a likelihood×impact grid with residual ratings.
- [ ] Given red-flag rules, when triggered (e.g. SLA breach, missing investigation report), then items auto-raise to the risk register.
- [ ] Given a remediation owner/date, when assigned, then overdue remediation is escalated.
- [ ] Given checklist/risk changes, when saved, then they are audited.

**Tasks**

- [ ] Backend: `er_audit_checklist`, `er_audit_result`, `er_risk_register` entities + red-flag rule engine.
- [ ] Backend: scoring and residual-rating service.
- [ ] Frontend: checklist runner + risk-matrix heat grid.
- [ ] Rules/Config: configurable checklist items, red-flag thresholds and risk scales.
- [ ] Alerts/Workflow: overdue-remediation escalation.
- [ ] Tests: unit (scoring/red-flags), integration (checklist run + register linkage).

**Covers:** 25.24, 25.26
**Dependencies:** EPIC-25-S05, EPIC-25-S10

### EPIC-25-S13 — ER KPIs, Dashboard & ER Automation Design

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 8
**As an** Executive / Leadership user, **I want** an ER dashboard with KPIs and the underlying automation design, **so that** I have real-time visibility of grievance volumes, SLA health and ER risk.

**Description**
Builds the ER analytics layer (KPIs: open cases, average resolution time, SLA compliance %, % formal vs informal, harassment/discrimination counts, repeat-respondent rate, appeal rate, retaliation flags) and an interactive dashboard with country/entity drill-down, underpinned by an event-driven automation design (auto-triage, SLA timers, alerts, escalation) documented as the module's automation blueprint.

**Acceptance Criteria**

- [ ] Given grievance data, when the dashboard loads, then KPIs render with country/entity/period filters and drill-down.
- [ ] Given SLA breaches/critical cases, when present, then they are highlighted with trend lines.
- [ ] Given the automation design, when configured, then auto-triage, SLA timers and escalation rules run on case events from the event bus.
- [ ] Given RBAC, when a viewer lacks rights, then sensitive case details are masked while aggregate KPIs remain visible.
- [ ] Given KPI computation, when run, then figures reconcile with the grievance register.

**Tasks**

- [ ] Backend: KPI aggregation services + materialised views; automation rules wired to event bus.
- [ ] Backend: dashboard data APIs with RBAC masking.
- [ ] Frontend: ER dashboard (KPI cards, trends, drill-down).
- [ ] Rules/Config: configurable KPI thresholds and automation triggers.
- [ ] Alerts/Workflow: dashboard-driven alerts for breaches/spikes.
- [ ] Tests: integration (KPI reconciliation), e2e (filters + masking).

**Covers:** 25.25, 25.27, 25.28
**Dependencies:** EPIC-25-S02, EPIC-25-S03, EPIC-25-S10

### EPIC-25-S14 — Monthly ER Compliance Pack

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** an auto-generated monthly Employee Relations compliance pack, **so that** management and auditors receive a consistent, certified ER summary.

**Description**
Generates a periodic compliance pack consolidating case volumes by type/tier, SLA performance, open/aged cases, harassment/discrimination/retaliation summaries, authority-complaint status, audit-checklist results and risk-matrix highlights, with management certification sign-off and export (PDF/Excel).

**Acceptance Criteria**

- [ ] Given a period close, when the pack is generated, then all required sections populate from live data.
- [ ] Given the pack, when reviewed, then a manager can certify it with e-signature and timestamp.
- [ ] Given export, when requested, then PDF and Excel outputs are produced and stored in the document store.
- [ ] Given sensitive content, when packaged, then aggregate-only views are used and individual identities are protected per privacy rules.
- [ ] Given generation/certification, when completed, then it is audited.

**Tasks**

- [ ] Backend: compliance-pack assembler + certification entity; export service.
- [ ] Backend: scheduler for monthly generation.
- [ ] Frontend: pack preview and certification screen.
- [ ] Rules/Config: configurable pack sections per country/entity.
- [ ] Alerts/Workflow: certification reminder + distribution.
- [ ] Tests: integration (assembly + export), unit (certification audit).

**Covers:** 25.29
**Dependencies:** EPIC-25-S12, EPIC-25-S13

### EPIC-25-S15 — Sample Grievance Intake Form (Configurable Digital Form)

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** a configurable digital grievance intake form, **so that** complaints are captured consistently and the form can be exported as a standard template.

**Description**
Provides a configurable grievance intake form (complainant details/anonymity, category, respondents, description, dates, witnesses, desired outcome, attachments, declaration) that drives case creation and is exportable as a branded PDF template for offline use.

**Acceptance Criteria**

- [ ] Given the form builder, when fields are configured, then mandatory/optional and conditional fields are enforced at intake.
- [ ] Given a submission, when validated, then it creates a grievance case via the intake service.
- [ ] Given an anonymous option, when selected, then identity fields are suppressed.
- [ ] Given export, when requested, then a branded PDF template is produced.
- [ ] Given form changes, when saved, then versioning and audit are applied.

**Tasks**

- [ ] Backend: form-definition entity + render/validate service linked to intake.
- [ ] Frontend: form builder + employee-facing form renderer.
- [ ] Rules/Config: configurable field sets per country/entity.
- [ ] Alerts/Workflow: submission acknowledgement.
- [ ] Tests: unit (validation), integration (form→case + PDF export).

**Covers:** 25.30
**Dependencies:** EPIC-25-S02

### EPIC-25-S16 — Sample Grievance Register, Investigation Report & Corrective Action Register

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a grievance register, a structured investigation report template and a corrective-action register, **so that** ER records are standardised, traceable and audit-ready.

**Description**
Delivers three configurable digital artefacts: a grievance register (all cases with status, tier, SLA, outcome), a structured investigation report template (background, scope, allegations, methodology, evidence, findings, recommendations), and a corrective-action register tracking actions, owners, due dates and closure—each filterable and exportable.

**Acceptance Criteria**

- [ ] Given the grievance register, when opened, then all cases are listed with filters (country, type, tier, status, SLA) and export.
- [ ] Given an investigation, when the report is generated, then it follows the structured template and pulls linked interviews/evidence/findings.
- [ ] Given a finding/recommendation, when actioned, then a corrective-action register entry tracks owner, due date and status to closure.
- [ ] Given an overdue corrective action, when detected, then it is flagged/escalated.
- [ ] Given any register/report change, when saved, then it is audited and exportable (PDF/Excel).

**Tasks**

- [ ] Backend: register query services + investigation-report generator + `corrective_action` entity/migration.
- [ ] Backend: overdue-action detector.
- [ ] Frontend: grievance register grid, report builder/preview, corrective-action board.
- [ ] Rules/Config: configurable register columns and report sections.
- [ ] Alerts/Workflow: overdue corrective-action escalation.
- [ ] Tests: integration (report assembly + register export), unit (overdue detection).

**Covers:** 25.31, 25.32, 25.33
**Dependencies:** EPIC-25-S05

### EPIC-25-S17 — Key Takeaways & ER Knowledge Reference

**Labels:** `user-story`, `employee-relations` · **Priority:** Could · **Estimate:** 1
**As an** HR Admin, **I want** an in-product Key Takeaways/knowledge reference for the ER module, **so that** users understand grievance best practices and country nuances at point of use.

**Description**
Surfaces concise key takeaways and contextual guidance (best-practice principles, GCC nuances, do/don't lists) within the ER module as help content, version-controlled and linked to the relevant screens.

**Acceptance Criteria**

- [ ] Given a module screen, when a user opens help, then relevant key takeaways/guidance are shown.
- [ ] Given content updates, when published, then versioning is maintained.
- [ ] Given a country context, when set, then country-specific notes are surfaced.
- [ ] Given help content, when displayed, then it links to the related policy/section.
- [ ] Given content changes, when saved, then they are audited.

**Tasks**

- [ ] Backend: knowledge-content entity (versioned) + screen mapping.
- [ ] Frontend: contextual help panel.
- [ ] Rules/Config: country-specific note configuration.
- [ ] Tests: unit (content versioning), integration (screen mapping).

**Covers:** 25.34
**Dependencies:** EPIC-25-S01
