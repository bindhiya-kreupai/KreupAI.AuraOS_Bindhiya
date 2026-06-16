# EPIC-37: Compliance Checklist & Red-Flag Engine

> **Source:** GCC HR Compliance Handbook — Appendices A3–A6 – Compliance Checklists
> **Module:** audit · **Labels:** `epic`, `gcc-compliance`, `audit`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a single configurable compliance-checklist, red-flag, evidence and certification engine in AuraOS that powers every HR, payroll, immigration and audit checklist in Appendices A3–A6 from one platform. Rather than hard-coding ~100 distinct checklists, AuraOS provides reusable checklist templates, scheduled checklist runs, item-level status workflow, automated red-flag rules, audit sampling, finding and corrective-action registers, certificates and automation — seeded with a Checklist Template Library that materializes each handbook checklist as configurable data.

## Business Value

Replaces dozens of spreadsheets and manual review cycles with one governed engine: any domain checklist (employee file, recruitment, payroll, WPS, social insurance, nationalization, immigration, leave, attendance, benefits, accommodation, HSE, grievance, disciplinary, separation, document retention, plus the full payroll, immigration and HR-audit checklist sets) becomes a versioned template that runs on schedule, auto-evaluates red flags from live data, demands evidence, and certifies. This makes compliance status continuous and audit-ready, slashes preparation effort, and ensures no checklist is silently skipped.

## Requirements Covered (handbook sections)

- A3.1 Introduction
- A3.2 HR Compliance Checklist Governance
- A3.3 Master HR Compliance Checklist
- A3.4 Employee File Compliance Checklist
- A3.5 Recruitment Compliance Checklist
- A3.6 Onboarding Compliance Checklist
- A3.7 Payroll Compliance Checklist
- A3.8 Wage Protection Checklist
- A3.9 Social Insurance Checklist
- A3.10 Nationalization Compliance Checklist
- A3.11 Immigration Compliance Checklist
- A3.12 Leave Compliance Checklist
- A3.13 Attendance and Overtime Compliance Checklist
- A3.14 Benefits Compliance Checklist
- A3.15 Accommodation Compliance Checklist
- A3.16 HSE Compliance Checklist
- A3.17 Grievance Compliance Checklist
- A3.18 Disciplinary Compliance Checklist
- A3.19 Separation Compliance Checklist
- A3.20 Document Retention Compliance Checklist
- A3.21 Monthly HR Compliance Checklist Certificate
- A3.22 Checklist Automation in AuraOS
- A3.23 Key Takeaways
- A4.1 Introduction
- A4.2 Payroll Compliance Governance
- A4.3 Monthly Payroll Master Checklist
- A4.4 Payroll Input Checklist
- A4.5 New Joiner Payroll Checklist
- A4.6 Exit Payroll Checklist
- A4.7 Salary Change Payroll Checklist
- A4.8 Allowance Checklist
- A4.9 Deduction Checklist
- A4.10 Overtime Payroll Checklist
- A4.11 Leave Payroll Checklist
- A4.12 Salary Advance Checklist
- A4.13 Employee Loan Checklist
- A4.14 Bonus and Commission Payroll Checklist
- A4.15 WPS Checklist
- A4.16 Mudad Checklist
- A4.17 Social Insurance Payroll Checklist
- A4.18 Final Settlement Payroll Checklist
- A4.19 Payroll Reconciliation Checklist
- A4.20 Payroll Audit Checklist
- A4.21 Payroll Exception Register
- A4.22 Monthly Payroll Compliance Certificate
- A4.23 Payroll Checklist Automation in AuraOS
- A4.24 Payroll Compliance KPIs
- A4.25 Payroll Compliance Risk Matrix
- A4.26 Key Takeaways
- A5.1 Introduction
- A5.2 Immigration Compliance Governance
- A5.3 Master Immigration Compliance Checklist
- A5.4 Employee Immigration File Checklist
- A5.5 New Joiner Immigration Checklist
- A5.6 Visa Compliance Checklist
- A5.7 Work Permit Compliance Checklist
- A5.8 Residence / National ID Checklist
- A5.9 Passport Validity Checklist
- A5.10 Immigration Renewal Checklist
- A5.11 Employee Transfer Checklist
- A5.12 Dependent Visa Checklist
- A5.13 Visa / Work Permit Cancellation Checklist
- A5.14 Grace Period Checklist
- A5.15 Repatriation / Final Exit Checklist
- A5.16 Absconding / Abandonment Checklist
- A5.17 Immigration and Payroll Alignment Checklist
- A5.18 PRO Audit Checklist
- A5.19 Immigration Exception Register
- A5.20 Monthly Immigration Compliance Certificate
- A5.21 Immigration Checklist Automation in AuraOS
- A5.22 Immigration Compliance KPIs
- A5.23 Immigration Compliance Risk Matrix
- A5.24 Key Takeaways
- A6.1 Introduction
- A6.2 HR Audit Governance
- A6.3 Master HR Audit Checklist
- A6.4 Employee File Audit Checklist
- A6.5 Recruitment Audit Checklist
- A6.6 Onboarding Audit Checklist
- A6.7 Payroll Audit Checklist
- A6.8 Wage Protection Audit Checklist
- A6.9 Social Insurance Audit Checklist
- A6.10 Nationalization Audit Checklist
- A6.11 Immigration Audit Checklist
- A6.12 Leave Audit Checklist
- A6.13 Attendance and Overtime Audit Checklist
- A6.14 Benefits Audit Checklist
- A6.15 Accommodation Audit Checklist
- A6.16 HSE Audit Checklist
- A6.17 Grievance Audit Checklist
- A6.18 Disciplinary Audit Checklist
- A6.19 Separation and Final Settlement Audit Checklist
- A6.20 Document Retention Audit Checklist
- A6.21 HRMS Audit Checklist
- A6.22 Audit Sampling Guide
- A6.23 Audit Finding Register
- A6.24 Corrective Action Plan Template
- A6.25 Management Audit Certificate
- A6.26 Audit Automation in AuraOS
- A6.27 Audit KPIs
- A6.28 Audit Risk Matrix
- A6.29 Key Takeaways

## Out of Scope

- The domain transactions that checklist items inspect (running payroll, processing a visa, paying WPS) — owned by domain epics; this engine reads their data to evaluate items.
- The compliance calendar that schedules audit cycles (EPIC-35) — this epic supplies the checklists/sampling it executes.
- The full KPI catalogue and scorecard (EPIC-38) — checklist-level KPIs are surfaced here; the library is separate.
- Country rule authoring (EPIC-36) — red-flag thresholds reference those rules.

## Dependencies

- EPIC-34 (Audit/Alerts/RBAC config) · EPIC-36 (country rules for red-flag thresholds) · EPIC-35 (audit-cycle scheduling) · reads data from EPIC-07–EPIC-30 domain modules

## Epic Definition of Done

- [ ] A configurable checklist-template engine supports versioned templates, items, weighting and scope (entity/country/employee category).
- [ ] Checklist runs schedule, assign, and capture item-level status with evidence and a workflow to closure.
- [ ] A red-flag rule engine auto-evaluates items from live data and raises flags with severity.
- [ ] Audit sampling, finding register and corrective-action plans are operational and tracked to closure.
- [ ] Compliance/audit certificates generate, gated on red-flags and open findings, with e-sign and export.
- [ ] Checklist/audit automation runs cycles end-to-end with exception-only intervention.
- [ ] The Checklist Template Library materializes every A3–A6 handbook checklist as seeded, configurable templates with full traceability.

---

## User Stories

### EPIC-37-S01 — Checklist governance & template engine

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** a configurable checklist-template engine with governance, **so that** every HR/payroll/immigration/audit checklist is a versioned, scoped template rather than a hard-coded form.
**Description**
Build the core engine: checklist templates with items (text, control objective, evidence requirement, weighting, mandatory flag, red-flag rule binding), scope (entity/country/employee category), versioning, and the governance model (template owner, approver, review cadence) shared by all A3–A6 checklists and master checklists. Covers the introductions, governance and master checklist heads of all four appendices.

**Acceptance Criteria**

- [ ] Given a checklist template, when created, then items carry control objective, evidence requirement, weighting, mandatory flag and optional red-flag binding.
- [ ] Given a template, when scoped, then it applies to the correct entity/country/employee category.
- [ ] Given governance, when configured, then owner, approver and review cadence are enforced before a template can be activated.
- [ ] Given a template, when published, then it is versioned and prior versions remain for historical runs.
- [ ] Given any template change, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `checklist_template`, `checklist_item`, `checklist_scope` schemas with versioning
- [ ] Backend: template governance/approval service
- [ ] Frontend: checklist template builder with item editor and scope
- [ ] Rules/Config: weighting and mandatory-item rules
- [ ] Tests: unit tests for scoping and version retention

**Covers:** A3.1, A3.2, A3.3, A4.1, A4.2, A4.3, A5.1, A5.2, A5.3, A6.1, A6.2, A6.3
**Dependencies:** EPIC-34

### EPIC-37-S02 — Checklist run, status workflow & evidence capture

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**As an** Internal Auditor, **I want** to run checklists with item-level status, evidence and a workflow to closure, **so that** compliance reviews are completed, evidenced and signed off consistently.
**Description**
Provide checklist execution: instantiate a run from a template for a period/entity/employee, capture per-item status (compliant / non-compliant / N/A / pending) with mandatory evidence attachments, reviewer and reason, route through a maker-checker workflow, and compute a weighted run score. This is the shared runtime that every domain checklist (employee file, recruitment, onboarding, etc.) uses.

**Acceptance Criteria**

- [ ] Given a template, when a run is instantiated, then it targets a period/entity/scope and lists all in-scope items.
- [ ] Given an item, when assessed, then status, reviewer, reason and required evidence are captured and mandatory items cannot be left blank.
- [ ] Given a completed run, when scored, then a weighted compliance score is computed and non-compliant items are listed.
- [ ] Given the workflow, when submitted, then a separate checker reviews before sign-off (preparer ≠ approver).
- [ ] Given any run action, when performed, then it is audit-logged.

**Tasks**

- [ ] Backend: `checklist_run`, `checklist_run_item`, `evidence_attachment` schemas + scoring service
- [ ] Backend: maker-checker run workflow
- [ ] Frontend: checklist run screen with item status, evidence upload and score
- [ ] Alerts/Workflow: run-due and pending-item reminders
- [ ] Tests: integration tests for mandatory-evidence and maker-checker gating

**Covers:** A3.4, A3.5, A3.6, A6.4, A6.5, A6.6
**Dependencies:** EPIC-37-S01

### EPIC-37-S03 — Red-flag rule engine

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** a red-flag rule engine that auto-evaluates checklist items from live data, **so that** non-compliance is detected automatically rather than relying on manual review.
**Description**
Build the red-flag engine: configurable rules (condition over live AuraOS data + country-rule thresholds) bound to checklist items that auto-set an item to non-compliant and raise a severity-scored flag — e.g., visa/permit expiring < 30 days, WPS unsubmitted past window, salary delay > 15 days, GOSI wage mismatch, missing mandatory document, nationalization below target. Flags feed findings and certificate gating.

**Acceptance Criteria**

- [ ] Given a red-flag rule bound to an item, when a run executes, then the item auto-evaluates from live data and country thresholds.
- [ ] Given a breach (e.g., WPS past window, visa < 30 days, salary delay > 15 days), when detected, then a red flag is raised with severity and the item marked non-compliant.
- [ ] Given a flag, when raised, then it links to the source record and routes to the finding register.
- [ ] Given red-flag rules, when configured, then they are tenant-editable and country-aware.
- [ ] Given any flag, when raised or cleared, then it is audit-logged.

**Tasks**

- [ ] Backend: `red_flag_rule`, `red_flag` schemas + evaluation engine over live data and rule engine
- [ ] Backend: severity scoring and source-record linkage
- [ ] Frontend: red-flag rule editor + flag review board
- [ ] Rules/Config: per-country red-flag thresholds
- [ ] Alerts/Workflow: critical red-flag alerts
- [ ] Tests: integration tests for threshold breaches per country

**Covers:** A3.7, A3.8, A3.9, A3.10, A3.11
**Dependencies:** EPIC-37-S02, EPIC-36

### EPIC-37-S04 — Domain checklist coverage: HR operations (leave, attendance, benefits, accommodation, HSE)

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** the engine seeded for HR-operations domains, **so that** leave, attendance/overtime, benefits, accommodation and HSE checklists run with their red flags.
**Description**
Materialize the HR-operations compliance checklists as templates with domain-specific red flags (e.g., leave below statutory minimum, OT beyond cap, missing mandatory medical insurance, accommodation over-occupancy, missing HSE training/heat-stress controls), proving the engine generalizes beyond the core domains.

**Acceptance Criteria**

- [ ] Given leave/attendance/benefits/accommodation/HSE templates, when run, then their items evaluate with domain red flags.
- [ ] Given a domain breach (e.g., OT over cap, over-occupancy, expired HSE training), when detected, then a red flag is raised.
- [ ] Given each template, when scoped, then it applies per entity/country correctly.
- [ ] Given runs, when completed, then results feed the dashboards and certificates.

**Tasks**

- [ ] Backend: domain red-flag rule sets for leave/attendance/benefits/accommodation/HSE
- [ ] Frontend: domain checklist run views (reusing the run engine)
- [ ] Rules/Config: domain red-flag thresholds per country
- [ ] Tests: integration tests for domain red-flag detection

**Covers:** A3.12, A3.13, A3.14, A3.15, A3.16
**Dependencies:** EPIC-37-S03

### EPIC-37-S05 — Domain checklist coverage: ER, disciplinary, separation & document retention

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** the engine seeded for ER, disciplinary, separation and document-retention domains, **so that** those checklists run with their red flags.
**Description**
Materialize the grievance, disciplinary, separation and document-retention compliance checklists as templates with red flags (e.g., grievance SLA breach, disciplinary deduction over cap, incomplete exit clearance, document past retention/expired), completing the A3 domain set.

**Acceptance Criteria**

- [ ] Given grievance/disciplinary/separation/document-retention templates, when run, then their items evaluate with domain red flags.
- [ ] Given a breach (e.g., SLA breach, over-cap deduction, expired/over-retention document), when detected, then a red flag is raised.
- [ ] Given each template, when scoped, then it applies per entity/country correctly.
- [ ] Given runs, when completed, then results feed dashboards and certificates.

**Tasks**

- [ ] Backend: red-flag rule sets for grievance/disciplinary/separation/document-retention
- [ ] Frontend: domain checklist run views
- [ ] Rules/Config: domain red-flag thresholds
- [ ] Tests: integration tests for domain red-flag detection

**Covers:** A3.17, A3.18, A3.19, A3.20
**Dependencies:** EPIC-37-S03

### EPIC-37-S06 — Payroll checklist suite & exception register

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** the full payroll checklist suite with an exception register, **so that** every payroll input, event and reconciliation is verified before the run is certified.
**Description**
Materialize the Appendix A4 payroll checklist suite as templates — monthly master, inputs, new-joiner, exit, salary-change, allowances, deductions, overtime, leave, salary-advance, loan, bonus/commission, WPS, Mudad, social-insurance, final-settlement and reconciliation checklists — with payroll red flags and a payroll exception register that captures, owns and tracks failures to resolution before lock/certification.

**Acceptance Criteria**

- [ ] Given a payroll period, when the master and sub-checklists run, then all input/event/reconciliation items are evaluated with red flags.
- [ ] Given a failed item (e.g., missing input, WPS/Mudad gap, GOSI mismatch, reconciliation break), when detected, then a payroll exception is raised with owner and due date.
- [ ] Given open critical exceptions, when present, then payroll certification is blocked until closed or accepted.
- [ ] Given checklist/exception actions, when taken, then they are audit-logged.

**Tasks**

- [ ] Backend: payroll checklist templates + `payroll_exception` register linked to runs
- [ ] Backend: payroll red-flag rules (inputs, WPS/Mudad, GOSI, reconciliation)
- [ ] Frontend: payroll checklist suite + exception register
- [ ] Rules/Config: payroll red-flag thresholds per country
- [ ] Alerts/Workflow: exception SLA + certification gating
- [ ] Tests: integration tests for exception capture and certification gating

**Covers:** A4.4, A4.5, A4.6, A4.7, A4.8, A4.9, A4.10, A4.11, A4.12, A4.13, A4.14, A4.15, A4.16, A4.17, A4.18, A4.19, A4.20, A4.21
**Dependencies:** EPIC-37-S03

### EPIC-37-S07 — Immigration checklist suite & exception register

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** the full immigration checklist suite with an exception register, **so that** every visa, permit, ID, renewal, transfer and exit case is verified.
**Description**
Materialize the Appendix A5 immigration checklist suite as templates — immigration file, new-joiner, visa, work-permit, residence/national-ID, passport-validity, renewal, transfer, dependent-visa, cancellation, grace-period, repatriation/final-exit, absconding, immigration-payroll-alignment and PRO-audit checklists — with immigration red flags and an immigration exception register tracking lapses to resolution.

**Acceptance Criteria**

- [ ] Given an employee/case, when the immigration checklists run, then visa/permit/ID/renewal/transfer/exit items are evaluated with red flags.
- [ ] Given a lapse (e.g., expired permit, passport < validity threshold, grace-period overrun, payroll-active-but-cancelled-visa mismatch), when detected, then an immigration exception is raised with owner and due date.
- [ ] Given open critical exceptions, when present, then the immigration certificate is blocked until closed or accepted.
- [ ] Given checklist/exception actions, when taken, then they are audit-logged.

**Tasks**

- [ ] Backend: immigration checklist templates + `immigration_exception` register linked to runs
- [ ] Backend: immigration red-flag rules (expiry, validity, grace period, payroll alignment)
- [ ] Frontend: immigration checklist suite + exception register
- [ ] Rules/Config: immigration red-flag thresholds per country
- [ ] Alerts/Workflow: exception SLA + certification gating
- [ ] Tests: integration tests for lapse detection and certification gating

**Covers:** A5.4, A5.5, A5.6, A5.7, A5.8, A5.9, A5.10, A5.11, A5.12, A5.13, A5.14, A5.15, A5.16, A5.17, A5.18, A5.19
**Dependencies:** EPIC-37-S03

### EPIC-37-S08 — Audit sampling, finding register & corrective-action plans

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**As an** Internal Auditor, **I want** audit sampling, a finding register and corrective-action plans, **so that** audit checklists are tested on representative samples and issues are remediated.
**Description**
Materialize the Appendix A6 audit checklist suite (master, employee-file, recruitment, onboarding, payroll, wage-protection, social-insurance, nationalization, immigration, leave, attendance/OT, benefits, accommodation, HSE, grievance, disciplinary, separation/final-settlement, document-retention and HRMS audit checklists), the audit sampling guide (population, method, size), the audit finding register and the corrective-action plan template, with tracking to closure.

**Acceptance Criteria**

- [ ] Given an audit checklist, when sampling is applied, then a representative sample (risk-based + random, per the sampling guide) is drawn from the population.
- [ ] Given a sampled item, when tested as non-compliant, then a finding is recorded in the finding register with severity and evidence.
- [ ] Given a finding, when raised, then a corrective-action plan with owner, action, due date and status is created and tracked to closure.
- [ ] Given an overdue corrective action, when detected, then it escalates to management.
- [ ] Given audit actions, when taken, then they are audit-logged.

**Tasks**

- [ ] Backend: audit checklist templates + `audit_sample`, `audit_finding`, `corrective_action` schemas
- [ ] Backend: sampling engine + overdue-escalation
- [ ] Frontend: audit checklist runner, finding register and corrective-action board
- [ ] Rules/Config: per-area sampling methods and severities
- [ ] Alerts/Workflow: overdue corrective-action escalation
- [ ] Tests: integration tests for sampling and finding-to-action tracking

**Covers:** A6.4, A6.7, A6.8, A6.9, A6.10, A6.11, A6.12, A6.13, A6.14, A6.15, A6.16, A6.17, A6.18, A6.19, A6.20, A6.21, A6.22, A6.23, A6.24
**Dependencies:** EPIC-37-S02, EPIC-37-S03

### EPIC-37-S09 — Checklist & audit automation

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**As a** System Administrator, **I want** checklist and audit automation, **so that** runs schedule, auto-evaluate, escalate and roll forward with exception-only intervention.
**Description**
Implement the AuraOS checklist/audit automation across A3–A6: on schedule (from the compliance calendar) or on trigger events, auto-instantiate runs, auto-evaluate red-flag items from live data, auto-raise exceptions/findings, escalate overdue items, and roll forward recurring runs — event-driven and configurable per entity.

**Acceptance Criteria**

- [ ] Given a scheduled or triggered cycle, when due, then the relevant checklist/audit runs auto-instantiate and red-flag items auto-evaluate.
- [ ] Given red flags, when raised, then exceptions/findings auto-create and route to owners.
- [ ] Given overdue runs/items, when detected, then they auto-escalate per configured tier.
- [ ] Given automation config, when changed, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: checklist/audit orchestrator on the event bus consuming calendar/trigger events
- [ ] Backend: auto-evaluation + exception/finding creation pipeline
- [ ] Frontend: checklist/audit automation configuration console
- [ ] Alerts/Workflow: auto-escalation notifications
- [ ] Tests: e2e test of automated run → red-flag → finding cycle

**Covers:** A3.22, A4.23, A5.21, A6.26
**Dependencies:** EPIC-37-S03, EPIC-35

### EPIC-37-S10 — Compliance KPIs, risk matrices & dashboards

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership user, **I want** checklist/audit KPIs and risk matrices, **so that** compliance and audit health are visible across domains and entities.
**Description**
Build the payroll, immigration and audit compliance KPIs and risk matrices (e.g., checklist completion %, red-flag count by severity, open findings/exceptions aging, corrective-action closure rate, sample coverage) with a domain risk matrix scored by likelihood × impact, surfaced on dashboards with RBAC and drill-down.

**Acceptance Criteria**

- [ ] Given the dashboards, when loaded, then completion %, red-flag/finding counts, exception aging and closure rates show per domain/entity/country.
- [ ] Given a risk, when registered, then it carries likelihood, impact, score, owner and linked control.
- [ ] Given RBAC, when a user views, then only in-scope data is visible.
- [ ] Given KPI/risk items, when configured, then thresholds are tenant-editable.

**Tasks**

- [ ] Backend: KPI aggregation + `compliance_risk_register` (payroll/immigration/audit)
- [ ] Frontend: checklist/audit KPI dashboards + risk heatmaps with drill-down
- [ ] Rules/Config: KPI definitions/thresholds and risk scoring
- [ ] Tests: integration tests for KPI computation and RBAC scoping

**Covers:** A4.24, A4.25, A5.22, A5.23, A6.27, A6.28
**Dependencies:** EPIC-37-S06, EPIC-37-S07, EPIC-37-S08

### EPIC-37-S11 — Compliance & audit certificates and key takeaways

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** monthly compliance and audit certificates gated on red-flags and findings, **so that** sign-off attests a genuinely clean compliance state.
**Description**
Generate the monthly HR compliance checklist certificate, monthly payroll compliance certificate, monthly immigration compliance certificate and management audit certificate — each attesting checklist completion and red-flag/finding closure, blocked while critical red flags or open findings remain, e-signed and exportable, with the chapters' key-takeaways as reference.

**Acceptance Criteria**

- [ ] Given a period, when a certificate is generated, then it attests checklist completion and red-flag/finding closure for its domain.
- [ ] Given open critical red flags or findings, when certification is attempted, then it is blocked until closed or formally accepted.
- [ ] Given a certificate, when issued, then it is e-signed by the authorized role, versioned and stored as evidence.
- [ ] Given the certificate, when exported, then it produces a PDF and is audit-logged.

**Tasks**

- [ ] Backend: certificate generators (HR/payroll/immigration/audit) with red-flag/finding gating
- [ ] Backend: e-sign capture and evidence storage
- [ ] Frontend: certificate views with gating summary, e-sign/export and key-takeaways reference
- [ ] Rules/Config: certificate attestation fields per domain
- [ ] Tests: integration tests for certificate gating on open red flags/findings

**Covers:** A3.21, A3.23, A4.22, A4.26, A5.20, A5.24, A6.25, A6.29
**Dependencies:** EPIC-37-S06, EPIC-37-S07, EPIC-37-S08

### EPIC-37-S12 — Checklist Template Library (full A3–A6 traceability)

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** a seeded Checklist Template Library materializing every handbook checklist, **so that** all A3–A6 checklists exist as configurable, traceable templates out of the box.
**Description**
Ship the Checklist Template Library: a curated, versioned set of seed templates for every Appendix A3–A6 checklist — master HR, employee-file, recruitment, onboarding, payroll (and all payroll sub-checklists), wage-protection, social-insurance, nationalization, immigration (and all immigration sub-checklists), leave, attendance/overtime, benefits, accommodation, HSE, grievance, disciplinary, separation, document-retention, and the full HR-audit checklist set — each mapped to its handbook section for traceability, loadable per tenant, and editable via the template engine. This story guarantees no handbook checklist is unrepresented.

**Acceptance Criteria**

- [ ] Given the library, when loaded, then a seed template exists for every A3–A6 handbook checklist mapped to its section number.
- [ ] Given a tenant, when onboarded, then the library can be installed and each template scoped/edited via the template engine.
- [ ] Given a seed template, when updated by the handbook, then a new version is published without breaking historical runs.
- [ ] Given the library, when audited, then a coverage report shows each handbook checklist section mapped to a live template.

**Tasks**

- [ ] Backend: seed-data loader for the full A3–A6 template library with section mapping
- [ ] Backend: coverage-report service (handbook section → template)
- [ ] Frontend: template library catalogue with section traceability view
- [ ] Rules/Config: per-template default items and red-flag bindings
- [ ] Tests: integration tests verifying every A3–A6 section maps to a seeded template

**Covers:** A3.4, A3.5, A3.6, A3.7, A3.8, A3.9, A3.10, A3.11, A3.12, A3.13, A3.14, A3.15, A3.16, A3.17, A3.18, A3.19, A3.20, A4.3, A4.4, A4.5, A4.6, A4.7, A4.8, A4.9, A4.10, A4.11, A4.12, A4.13, A4.14, A4.15, A4.16, A4.17, A4.18, A4.19, A4.20, A5.3, A5.4, A5.5, A5.6, A5.7, A5.8, A5.9, A5.10, A5.11, A5.12, A5.13, A5.14, A5.15, A5.16, A5.17, A5.18, A6.3, A6.4, A6.5, A6.6, A6.7, A6.8, A6.9, A6.10, A6.11, A6.12, A6.13, A6.14, A6.15, A6.16, A6.17, A6.18, A6.19, A6.20, A6.21
**Dependencies:** EPIC-37-S01
