# EPIC-32: Chapter 32 – HR Policies

> **Source:** GCC HR Compliance Handbook — Chapter 32 – HR Policies
> **Module:** Policies · **Labels:** `epic`, `gcc-compliance`, `policies`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Build a centralized AuraOS **HR Policy Engine** that authors, versions, publishes, and governs the full GCC HR policy set as structured digital documents. The engine drives controlled distribution, mandatory acknowledgement tracking, country-specific addendums, exception workflows, and a review calendar — so that every employee in every GCC entity is provably bound to the current, approved version of each policy with a full audit trail.

## Business Value

Eliminates the legal exposure of stale, unsigned, or inconsistent policies during MOHRE/MHRSD/labour-court disputes and grievance/disciplinary actions, where an unacknowledged policy is unenforceable. Automates handbook distribution and acknowledgement chasing, gives Compliance and Leadership real-time visibility of policy coverage and review-due risk, and produces audit-ready evidence packs (register, acknowledgements, exceptions, certificates) on demand.

## Requirements Covered (handbook sections)

- 32.1 Introduction
- 32.2 Objectives of HR Policies
- 32.3 HR Policy Governance Framework
- 32.4 Policy Structure Template
- 32.5 Policy Version Control
- 32.6 Employee Handbook
- 32.7 Code of Conduct
- 32.8 Leave Policy
- 32.9 Attendance Policy
- 32.10 Remote Work Policy
- 32.11 Data Privacy Policy
- 32.12 Anti-Harassment Policy
- 32.13 Disciplinary Policy
- 32.14 Grievance Policy
- 32.15 Payroll Policy
- 32.16 IT and Acceptable Use Policy
- 32.17 HSE and Welfare Policy
- 32.18 Accommodation Policy
- 32.19 Policy Communication
- 32.20 Policy Acknowledgement
- 32.21 Country-Specific Policy Addendums
- 32.22 Policy Exception Management
- 32.23 Policy Review Calendar
- 32.24 Policy Audit Checklist
- 32.25 Policy KPIs
- 32.26 Policy Risk Matrix
- 32.27 HRMS Policy Automation Design
- 32.28 Monthly Policy Compliance Pack
- 32.29 Sample HR Policy Register
- 32.30 Sample Policy Acknowledgement Form
- 32.31 Sample Policy Exception Request Form
- 32.32 Key Takeaways

## Out of Scope

- Authoring the legal text of policies for a specific client (engine ships templates; legal content is configured per client).
- Disciplinary case management and grievance investigation workflows themselves (owned by EPIC-25 / EPIC-26; this epic owns the _policy documents_).
- E-learning / LMS course delivery beyond read-and-acknowledge.
- Contract and offer letter templates (owned by EPIC-05 / EPIC-33).

## Dependencies

- EPIC-08 (Employee Records — employee/entity master, document store), EPIC-31 (Compliance Dashboard — KPI surfacing), EPIC-34 (Country Rule Engine for addendum resolution). Workflow/approval, RBAC, audit-trail and notifications are platform services.

## Epic Definition of Done

- [ ] A configurable policy document model supports the standard structure template, version control, and lifecycle (draft → review → approved → published → retired).
- [ ] All 13 standard GCC policies ship as configurable templates and can be published per legal entity/country with addendums.
- [ ] Acknowledgement campaigns auto-target the right population, chase non-responders, and record signed evidence with timestamp and version.
- [ ] Country-specific addendum resolution and policy exception workflow are operational with maker-checker approval.
- [ ] Review calendar drives 90/60/30-day review-due alerts and KPIs/risk-matrix surface to the compliance dashboard.
- [ ] Policy register, acknowledgement form, exception form, and monthly compliance pack export as audit-ready documents.
- [ ] All actions (author, approve, publish, acknowledge, except) write to the immutable audit trail.

---

## User Stories

### EPIC-32-S01 — Policy engine foundation, governance & structure template

**Labels:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** a governed policy document model built on a standard structure template with an approval framework, **so that** every HR policy is authored consistently and only takes effect after the right owners approve it.

**Description**
Establishes the core `Policy` and `PolicySection` domain backing the AuraOS Policy Engine, the RACI-style governance framework (owner, approver, reviewer), and a standard structure template (purpose, scope, definitions, policy statements, roles, related policies, effective date). This is the foundation all later stories build on, and it encodes the objectives and governance principles of the chapter.

**Acceptance Criteria**

- [ ] Given a new policy, when the author selects the structure template, then mandatory sections (Purpose, Scope, Definitions, Policy Statement, Roles & Responsibilities, Effective Date, Owner) are pre-populated and cannot be removed.
- [ ] Given a policy in draft, when it is submitted, then it routes through the configured governance chain (Policy Owner → HR Head → Legal/Compliance) and cannot be published until all required approvals are captured.
- [ ] Given an approval, when an approver acts, then their identity, decision, comments and timestamp are written to the audit trail and the preparer cannot also be the approver (maker-checker).
- [ ] Given RBAC, then only Policy Authors can edit drafts, only Approvers can approve, and Employees have read-only access to published policies.
- [ ] Given the objectives configuration, then each policy records its compliance objective and governing GCC authority reference (MOHRE/MHRSD/LMRA/etc.) for traceability.

**Tasks**

- [ ] Backend: `policy` (policyCode, title, module, ownerId, approverChain, governingAuthority, status, currentVersionId) and `policy_section` (policyId, sectionType, sequence, bodyRichText) entities + migration.
- [ ] Backend: structure-template service that seeds mandatory sections and validates completeness before submit.
- [ ] Backend: governance/approval service integrating the workflow engine with maker-checker enforcement.
- [ ] Frontend: Policy authoring workspace (admin portal) with section editor and template guardrails.
- [ ] Rules/Config: configurable approval chains per policy type and per legal entity.
- [ ] Alerts/Workflow: approval routing + pending-approval notifications.
- [ ] Tests: unit (template completeness, maker-checker), integration (approval routing → publish gate).

**Covers:** 32.1, 32.2, 32.3, 32.4
**Dependencies:** EPIC-08

### EPIC-32-S02 — Policy version control & lifecycle

**Labels:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** full version control over each policy, **so that** I can prove exactly which version an employee acknowledged and roll forward changes without losing history.

**Description**
Adds immutable, numbered versioning to every policy with effective-date control, change-log/diff between versions, and a controlled supersede flow. Critical for enforceability: an acknowledgement must bind to a specific version hash.

**Acceptance Criteria**

- [ ] Given an approved policy, when a new revision is published, then the prior version is retained read-only, the new version gets an incremented number and effective date, and a change summary is captured.
- [ ] Given any acknowledgement, then it stores the exact `versionId` and content hash acknowledged.
- [ ] Given two versions, when a user compares them, then a field/section-level diff is shown.
- [ ] Given a future-dated effective date, then the new version does not become the "current" published version until that date.
- [ ] Given a retired policy, then it is archived (not deleted) and excluded from active acknowledgement campaigns.

**Tasks**

- [ ] Backend: `policy_version` (policyId, versionNo, contentHash, effectiveDate, changeSummary, status, publishedBy) entity + migration.
- [ ] Backend: supersede/rollforward service and content-hash generation.
- [ ] Backend: version diff service.
- [ ] Frontend: version history panel + side-by-side diff viewer.
- [ ] Rules/Config: effective-date activation job.
- [ ] Tests: integration (version increment, future-dated activation, hash immutability).

**Covers:** 32.5
**Dependencies:** EPIC-32-S01

### EPIC-32-S03 — Employee Handbook & Code of Conduct

**Labels:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** the Employee Handbook and Code of Conduct as master compiled policies, **so that** every new joiner receives one authoritative, current rulebook covering conduct standards.

**Description**
Ships the Employee Handbook as a "compilation" policy that assembles referenced policies into a single published document, plus the Code of Conduct with ethics, conflict-of-interest, gifts, and anti-bribery clauses. Both feed onboarding acknowledgement.

**Acceptance Criteria**

- [ ] Given the Handbook, when included policies are republished, then the Handbook flags as "out of sync" and can be recompiled to a new version.
- [ ] Given onboarding (EPIC-06 link), when a new joiner is hired, then Handbook + Code of Conduct acknowledgement tasks are auto-created.
- [ ] Given the Code of Conduct, then conflict-of-interest and gifts/anti-bribery clauses are configurable per entity.
- [ ] Given an employee, then the published Handbook is viewable in self-service in their language where a translation version exists.

**Tasks**

- [ ] Backend: compilation policy type assembling child policy versions.
- [ ] Backend: out-of-sync detection service.
- [ ] Frontend: Handbook viewer in employee self-service + Code of Conduct template.
- [ ] Rules/Config: per-entity Code of Conduct clause toggles.
- [ ] Tests: unit (compile/sync), e2e (onboarding ack task creation).

**Covers:** 32.6, 32.7
**Dependencies:** EPIC-32-S02

### EPIC-32-S04 — Workforce policy set (Leave, Attendance, Remote Work, Payroll)

**Labels:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** the operational workforce policies configured as engine documents linked to their functional modules, **so that** policy text and system rules stay aligned.

**Description**
Configures Leave, Attendance, Remote Work and Payroll policies as engine documents, each cross-linking the corresponding AuraOS functional configuration (leave types, attendance rules, payroll calendar) so the written policy and the system behaviour reference one source.

**Acceptance Criteria**

- [ ] Given the Leave policy, then it references the leave-type matrix (EPIC-20) and country statutory minimums.
- [ ] Given the Attendance policy, then it references work schedules, late/missing-punch and Ramadan rules (EPIC-19).
- [ ] Given the Remote Work policy, then eligibility, hours, equipment and data-security clauses are configurable.
- [ ] Given the Payroll policy, then pay calendar, deductions, and WPS/salary-delay statements (EPIC-10/11) are referenced.
- [ ] Given any of these, then publishing triggers an acknowledgement campaign for the in-scope population.

**Tasks**

- [ ] Backend: policy-to-module reference links (leave, attendance, payroll config IDs).
- [ ] Backend: template content for the four policies.
- [ ] Frontend: cross-reference panel showing linked module config.
- [ ] Rules/Config: country statutory-minimum references per policy.
- [ ] Alerts/Workflow: publish → acknowledgement campaign trigger.
- [ ] Tests: integration (cross-reference resolution, campaign trigger).

**Covers:** 32.8, 32.9, 32.10, 32.15
**Dependencies:** EPIC-32-S02

### EPIC-32-S05 — Governance & compliance policy set (Data Privacy, Anti-Harassment, Disciplinary, Grievance, IT/Acceptable Use)

**Labels:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** the governance and conduct policies configured with their reporting and escalation hooks, **so that** the policy text matches the live grievance, disciplinary and data-privacy processes.

**Description**
Configures Data Privacy, Anti-Harassment, Disciplinary, Grievance and IT/Acceptable Use policies. Each links to its operating process: data privacy to the consent/access-control model (EPIC-08/30), anti-harassment/grievance to the intake channels (EPIC-25), disciplinary to the penalty matrix (EPIC-26), IT/AUP to access-closure (EPIC-27).

**Acceptance Criteria**

- [ ] Given the Data Privacy policy, then lawful-basis, retention and data-subject-rights clauses align with the retention schedule (EPIC-30).
- [ ] Given the Anti-Harassment and Grievance policies, then they reference the confidential complaint channels and non-retaliation controls (EPIC-25).
- [ ] Given the Disciplinary policy, then it references the misconduct classification and penalty matrix (EPIC-26).
- [ ] Given the IT/Acceptable Use policy, then acceptable-use, monitoring-notice and access-revocation clauses are configurable.
- [ ] Given mandatory policies, then they are flagged "mandatory acknowledgement" so no employee can be active without an acknowledgement on record.

**Tasks**

- [ ] Backend: process-hook links (grievance intake, disciplinary matrix, retention schedule, access control).
- [ ] Backend: "mandatory" flag and enforcement check on employee activation.
- [ ] Frontend: policy templates for the five governance policies.
- [ ] Rules/Config: country data-privacy clause variants.
- [ ] Tests: integration (mandatory-ack enforcement, process-hook resolution).

**Covers:** 32.11, 32.12, 32.13, 32.14, 32.16
**Dependencies:** EPIC-32-S02

### EPIC-32-S06 — Welfare policy set (HSE & Welfare, Accommodation)

**Labels:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** the HSE/Welfare and Accommodation policies configured with worker-population targeting, **so that** labour-camp and field workers receive the welfare and safety policies that apply to them.

**Description**
Configures the HSE & Welfare and Accommodation policies, including heat-stress, PPE, camp-rules and occupancy clauses, and targets them at the relevant worker populations (e.g. site/labour-camp employees) rather than all staff.

**Acceptance Criteria**

- [ ] Given the HSE policy, then duty-of-care, heat-stress and PPE clauses reference the HSE config (EPIC-24).
- [ ] Given the Accommodation policy, then occupancy, hygiene and camp-rules reference the accommodation model (EPIC-23).
- [ ] Given population targeting, then these policies are pushed only to in-scope worker categories/locations.
- [ ] Given multilingual workers, then acknowledgement supports the worker's preferred language version.

**Tasks**

- [ ] Backend: population-targeting rule (by job category/location) for policy distribution.
- [ ] Backend: HSE/Accommodation policy templates with module links.
- [ ] Frontend: targeting selector in publish flow.
- [ ] Rules/Config: language-version mapping for worker policies.
- [ ] Tests: integration (targeted distribution scope).

**Covers:** 32.17, 32.18
**Dependencies:** EPIC-32-S02

### EPIC-32-S07 — Policy communication & distribution

**Labels:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** controlled, multi-channel policy communication on publish, **so that** the right employees are notified of new and changed policies through self-service, email and where configured SMS.

**Description**
Builds the communication layer that fires on publish: targeted notifications, a self-service "Policies" hub showing assigned/current policies and read status, and a reminder cadence for unread items. Supports translation versions and read-tracking distinct from formal acknowledgement.

**Acceptance Criteria**

- [ ] Given a publish, when the campaign starts, then in-scope employees receive a notification with a deep link to the policy.
- [ ] Given the self-service hub, then an employee sees their assigned policies grouped by Read / Acknowledged / Overdue.
- [ ] Given an unread policy, then reminders are sent on a configurable cadence (e.g. day 0, 7, 14).
- [ ] Given a translated policy, then the employee is shown the version in their preferred language.
- [ ] Given communication events, then each send/open is logged to the audit trail.

**Tasks**

- [ ] Backend: `policy_communication` campaign + recipient tracking entities.
- [ ] Backend: multi-channel dispatch service (in-app, email, SMS adapter).
- [ ] Frontend: employee self-service Policies hub.
- [ ] Rules/Config: reminder cadence and channel config per policy.
- [ ] Alerts/Workflow: reminder scheduler.
- [ ] Tests: integration (targeted dispatch, reminder cadence).

**Covers:** 32.19
**Dependencies:** EPIC-32-S02, EPIC-32-S06

### EPIC-32-S08 — Policy acknowledgement tracking

**Labels:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** verifiable acknowledgement capture against the exact policy version, **so that** I can prove enforceability in any labour dispute or audit.

**Description**
Implements the acknowledgement workflow: read-confirm with version binding, signed evidence (e-signature/typed name + timestamp + IP), re-acknowledgement on version change, and completion dashboards by entity/department. This is the enforceability backbone of the engine.

**Acceptance Criteria**

- [ ] Given an assigned mandatory policy, when the employee confirms, then the acknowledgement records employeeId, policyVersionId, contentHash, timestamp, channel and IP.
- [ ] Given a republished version, then prior acknowledgers are re-targeted for re-acknowledgement and shown as "stale" until they re-confirm.
- [ ] Given a non-responder past SLA, then escalation alerts go to the line manager and HR.
- [ ] Given an auditor, then acknowledgement status is queryable and exportable per employee/policy/version.
- [ ] Given RBAC, then employees can only acknowledge their own assignments and cannot back-date.

**Tasks**

- [ ] Backend: `policy_acknowledgement` (employeeId, policyVersionId, contentHash, signedName, signedAt, channel, ipAddress) entity + migration.
- [ ] Backend: re-acknowledgement trigger on version supersede; SLA escalation service.
- [ ] Frontend: acknowledgement screen (read-confirm + e-sign) and completion dashboard.
- [ ] Rules/Config: acknowledgement SLA and escalation chain.
- [ ] Alerts/Workflow: non-responder escalation to manager/HR.
- [ ] Tests: unit (version binding), integration (re-ack on republish, SLA escalation), e2e (sign flow).

**Covers:** 32.20
**Dependencies:** EPIC-32-S02, EPIC-32-S07

### EPIC-32-S09 — Country-specific policy addendums

**Labels:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** country/entity addendums layered onto base policies via the rule engine, **so that** one base policy can comply with UAE, KSA, Bahrain, Qatar, Oman and Kuwait law without duplicating the whole document.

**Description**
Adds an addendum layer: a base policy plus country-specific overriding clauses resolved at render time through the country rule engine (EPIC-34), so an employee always sees base + applicable addendum as one effective document, version-controlled together.

**Acceptance Criteria**

- [ ] Given a base policy with addendums, when an employee in KSA views it, then base + KSA addendum render as one effective document; a UAE employee sees the UAE addendum.
- [ ] Given an addendum change, then the effective document for affected employees increments its effective version and triggers re-acknowledgement.
- [ ] Given the rule engine, then addendum applicability is resolved by employee legal entity/country, not manual assignment.
- [ ] Given conflicting clauses, then the addendum overrides the base and the override is visible/auditable.

**Tasks**

- [ ] Backend: `policy_addendum` (basePolicyId, country, legalEntityId, overrideSections) entity + migration.
- [ ] Backend: render-time merge service resolving base + addendum via rule engine.
- [ ] Frontend: addendum editor and effective-document preview by country.
- [ ] Rules/Config: country applicability rules (UAE/KSA/BHR/QAT/OMN/KWT).
- [ ] Tests: integration (per-country render, override precedence, re-ack on addendum change).

**Covers:** 32.21
**Dependencies:** EPIC-32-S02, EPIC-32-S08, EPIC-34

### EPIC-32-S10 — Policy exception management

**Labels:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 5
**As a** Line Manager, **I want** to request and track approved exceptions to a policy, **so that** legitimate deviations are authorised, time-bound and auditable rather than informal.

**Description**
Implements the exception workflow: a request against a specific policy/clause, maker-checker approval, validity window, conditions, and an exception register. Exceptions expire automatically and are surfaced to audit and risk.

**Acceptance Criteria**

- [ ] Given an exception request, when submitted, then it captures policy, clause, justification, employee(s)/scope, requested validity and routes for approval.
- [ ] Given an approved exception, then it has a start/end date, auto-expires, and notifies before expiry.
- [ ] Given maker-checker, then the requester cannot approve their own exception.
- [ ] Given the exception register, then all active/expired exceptions are listed, filterable by policy/entity/risk.
- [ ] Given an expired exception, then the affected employees revert to the standard policy and the change is audited.

**Tasks**

- [ ] Backend: `policy_exception` (policyId, clauseRef, scope, justification, validFrom, validTo, status, approverId) entity + migration.
- [ ] Backend: approval + auto-expiry service.
- [ ] Frontend: exception request form + exception register view.
- [ ] Rules/Config: approval authority by exception risk level.
- [ ] Alerts/Workflow: pre-expiry and expiry notifications.
- [ ] Tests: integration (maker-checker, auto-expiry).

**Covers:** 32.22
**Dependencies:** EPIC-32-S01

### EPIC-32-S11 — Policy review calendar & scheduled reviews

**Labels:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** a review calendar that schedules and alerts on policy reviews, **so that** no policy goes past its mandated review cycle.

**Description**
Adds a per-policy review cycle (e.g. annual) with a calendar view and 90/60/30/0-day review-due alerts to policy owners, plus a one-click "start review" that opens a draft revision.

**Acceptance Criteria**

- [ ] Given a policy with an annual review cycle, then its next review date is computed from last approval and shown on the calendar.
- [ ] Given an approaching review, then owners are alerted at 90/60/30 days and on the due date.
- [ ] Given an overdue review, then the policy is flagged on the risk matrix and dashboard.
- [ ] Given "start review", then a new draft version is created from the current version for editing.

**Tasks**

- [ ] Backend: review-cycle fields + next-review-date computation service.
- [ ] Backend: scheduled review-due alert job.
- [ ] Frontend: policy review calendar view.
- [ ] Rules/Config: review cycle per policy type.
- [ ] Alerts/Workflow: 90/60/30/0-day owner alerts.
- [ ] Tests: unit (next-review calc), integration (alert thresholds, overdue flag).

**Covers:** 32.23
**Dependencies:** EPIC-32-S02

### EPIC-32-S12 — Policy audit checklist & risk matrix

**Labels:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable policy audit checklist and a policy risk matrix with red-flags, **so that** I can systematically assess policy coverage, currency and acknowledgement gaps.

**Description**
Delivers a configurable audit checklist (existence, approval, version currency, acknowledgement coverage, addendum completeness) and a risk matrix scoring likelihood × impact with auto red-flags (e.g. mandatory policy unacknowledged, overdue review, missing country addendum) feeding a risk register.

**Acceptance Criteria**

- [ ] Given the audit checklist, when an auditor runs it for an entity, then each item returns pass/fail with evidence links.
- [ ] Given red-flag rules, then an unacknowledged mandatory policy, overdue review, or missing required country addendum auto-raises a risk entry.
- [ ] Given the risk matrix, then each risk is scored likelihood × impact and placed in a heatmap.
- [ ] Given a finding, then a corrective action with owner and due date can be raised and tracked.

**Tasks**

- [ ] Backend: `policy_audit_checklist`, `policy_risk` entities + red-flag rule engine.
- [ ] Backend: checklist evaluation service + risk scoring.
- [ ] Frontend: audit checklist runner + risk heatmap.
- [ ] Rules/Config: configurable red-flag thresholds.
- [ ] Alerts/Workflow: corrective-action assignment.
- [ ] Tests: integration (red-flag generation, scoring).

**Covers:** 32.24, 32.26
**Dependencies:** EPIC-32-S08, EPIC-32-S11

### EPIC-32-S13 — Policy KPIs & dashboard

**Labels:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 3
**As an** Executive / Leadership, **I want** a policy KPI dashboard, **so that** I can see acknowledgement coverage, review currency and exception load at a glance across entities.

**Description**
Surfaces policy KPIs — acknowledgement coverage %, mandatory-policy completion, policies overdue for review, active exceptions, average time-to-acknowledge — to the AuraOS analytics dashboard (EPIC-31), sliceable by entity, country and department.

**Acceptance Criteria**

- [ ] Given the dashboard, then acknowledgement coverage % is shown overall and by entity/country/department.
- [ ] Given mandatory policies, then a completion KPI shows % of active employees with current acknowledgements.
- [ ] Given review currency, then count/% of policies overdue for review is displayed.
- [ ] Given drill-down, then clicking a KPI lists the underlying non-compliant employees/policies.

**Tasks**

- [ ] Backend: KPI aggregation queries/materialized views.
- [ ] Backend: dashboard API feeding EPIC-31.
- [ ] Frontend: policy KPI widgets with drill-down.
- [ ] Rules/Config: KPI thresholds (e.g. coverage target ≥95%).
- [ ] Tests: integration (KPI accuracy vs source data).

**Covers:** 32.25
**Dependencies:** EPIC-32-S08, EPIC-31

### EPIC-32-S14 — HRMS policy automation design & monthly compliance pack

**Labels:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** the policy automation wired end-to-end and a one-click monthly compliance pack, **so that** policy governance runs without manual chasing and produces signed monthly evidence.

**Description**
Documents and implements the automation flows (hire → ack tasks, republish → re-ack, review-due → draft, exception expiry → revert) and assembles the Monthly Policy Compliance Pack: register snapshot, acknowledgement coverage, exceptions, overdue reviews, red-flags, and a management certificate for sign-off and archival.

**Acceptance Criteria**

- [ ] Given the automation flows, then onboarding, republish, review-due and exception-expiry events trigger their downstream actions without manual intervention.
- [ ] Given month-end, when the pack is generated, then it compiles register, acknowledgement coverage, exception register, overdue reviews and red-flags into one document.
- [ ] Given the pack, then a management certificate is included for e-signature and the signed pack is archived to the document store with retention.
- [ ] Given regeneration, then the pack is reproducible for any prior period with point-in-time data.

**Tasks**

- [ ] Backend: event-driven automation handlers (hire/republish/review/expiry) on the event bus.
- [ ] Backend: monthly pack assembler + PDF export.
- [ ] Frontend: pack generation screen + certificate sign-off.
- [ ] Rules/Config: pack contents and certificate template per entity.
- [ ] Alerts/Workflow: month-end pack-due reminder.
- [ ] Tests: integration (event triggers), e2e (pack generation + sign-off + archive).

**Covers:** 32.27, 32.28
**Dependencies:** EPIC-32-S08, EPIC-32-S10, EPIC-32-S11

### EPIC-32-S15 — Sample policy register, acknowledgement form & exception request form

**Labels:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** the HR Policy Register, Policy Acknowledgement Form and Policy Exception Request Form as configurable digital forms with export, **so that** I have ready, audit-ready artefacts that match the engine's data.

**Description**
Builds three sample artefacts as configurable digital forms/registers driven by live engine data: the HR Policy Register (all policies, owner, version, effective date, review date, ack coverage), the Policy Acknowledgement Form, and the Policy Exception Request Form — each exportable to PDF/Excel.

**Acceptance Criteria**

- [ ] Given the policy register, then it lists every policy with code, owner, current version, effective/review dates and acknowledgement coverage, and exports to PDF/Excel.
- [ ] Given the acknowledgement form, then it renders the policy, version and signer block and produces a signed record bound to the version.
- [ ] Given the exception request form, then it captures policy, clause, scope, justification and validity and submits into the exception workflow (S10).
- [ ] Given any export, then it is watermarked with generation timestamp and generated-by for audit.

**Tasks**

- [ ] Backend: register query + form definitions reusing the configurable forms engine (EPIC-33).
- [ ] Backend: PDF/Excel export service.
- [ ] Frontend: register view + acknowledgement form + exception form.
- [ ] Rules/Config: column/field configuration per entity.
- [ ] Tests: integration (register accuracy, export, form → workflow submission).

**Covers:** 32.29, 32.30, 32.31
**Dependencies:** EPIC-32-S08, EPIC-32-S10

### EPIC-32-S16 — Policy engine adoption guide & key takeaways

**Labels:** `user-story`, `policies` · **Priority:** Could · **Estimate:** 1
**As an** HR Manager, **I want** an in-product policy governance summary and best-practice checklist, **so that** teams adopt the engine correctly and follow GCC policy best practices.

**Description**
Captures the chapter's key takeaways as an in-product onboarding/help guide and a best-practice setup checklist (governance roles, mandatory policy set, acknowledgement SLAs, review cadence, addendum coverage) shown to admins configuring the policy module.

**Acceptance Criteria**

- [ ] Given a new admin, when they open the policy module, then a best-practice setup checklist and key-takeaways guide are available.
- [ ] Given the checklist, then it covers governance roles, mandatory policies, acknowledgement SLA, review cadence and country addendums.
- [ ] Given completion, then checklist progress is tracked per entity.

**Tasks**

- [ ] Backend: setup-checklist progress tracking.
- [ ] Frontend: in-product help/guide + setup checklist.
- [ ] Rules/Config: checklist items per chapter best practices.
- [ ] Tests: unit (checklist progress).

**Covers:** 32.32
**Dependencies:** EPIC-32-S01
