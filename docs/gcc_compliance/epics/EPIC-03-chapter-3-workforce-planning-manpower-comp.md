# EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 3 – Workforce Planning & Manpower Compliance
> **Module:** Core HR · **Labels:** `epic`, `gcc-compliance`, `core-hr`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver an AuraOS workforce-planning module that ties organizational structure, positions and headcount budgets to a controlled manpower-requisition and approval workflow, with built-in GCC nationalization (Emiratisation/Nitaqat/Bahrainization/Omanisation) planning, succession, contractor planning and workforce-risk tracking. Every requisition must validate against an approved position, a funded budget line and the entity's localization target before a vacancy can flow into Recruitment (EPIC-04).

## Business Value

Prevents unbudgeted and unapproved hiring, eliminates "ghost positions", and gives Compliance and Leadership a single source of truth for headcount, nationalization gaps and workforce risk. Maker-checker requisitions and a full audit trail protect against governance findings, while early nationalization-gap alerts reduce exposure to Emiratisation/Nitaqat penalties and work-permit blocks.

## Requirements Covered (handbook sections)

- 3.1 Introduction
- 3.2 Objectives of Workforce Planning
- 3.3 Workforce Planning Framework
- 3.4 Organizational Structure Compliance
- 3.5 Position Management
- 3.6 Manpower Requisition Process
- 3.7 Headcount Budgeting
- 3.8 Workforce Localization Planning
- 3.9 Succession Planning
- 3.10 Workforce Risk Management
- 3.11 Contractor Workforce Planning
- 3.12 Workforce Analytics & KPIs
- 3.13 HR Governance Requirements
- 3.14 HR Audit Checklist

## Out of Scope

- Candidate sourcing, screening and interview execution (covered in EPIC-04).
- Offer generation, salary-structure design and pre-employment checks (covered in EPIC-05).
- Detailed grade/salary-band architecture and cost-center master setup (covered in EPIC-09).
- Statutory nationalization calculation engines and authority filings (covered in EPIC-16/17/18).

## Dependencies

- EPIC-02 (Country Rule Engine — localization thresholds, governance rules)
- EPIC-09 (Organization & Position Management — entity, cost-center, grade master)

## Epic Definition of Done

- [ ] Org structure, positions and headcount budgets are modelled with effective-dated versions and validation rules.
- [ ] Manpower requisitions cannot be raised without an approved position and a funded budget line.
- [ ] Configurable maker-checker requisition approval workflow (preparer ≠ approver) is enforced per entity and value band.
- [ ] Nationalization target vs actual is computed per entity and surfaced as a gating check during planning and requisition.
- [ ] Succession, workforce-risk and contractor-planning registers are operational with alerts.
- [ ] Workforce analytics dashboard and KPI pack render live data per country/entity/department.
- [ ] Governance rules and an HR audit checklist run as configurable red-flag checks with a risk register.
- [ ] All create/approve/reject/override actions captured in the immutable audit trail with actor, timestamp and reason.

---

## User Stories

### EPIC-03-S01 — Workforce planning framework, objectives & governance baseline

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**As a** HR Manager, **I want** a configurable workforce-planning framework with defined objectives, planning horizon and governance roles, **so that** all manpower planning in AuraOS follows one documented, auditable model.

**Description**
Establishes the foundational planning cycle (annual + rolling quarterly), planning entities, roles and the governance baseline that all later stories plug into. Captures the chapter's introduction, objectives and the planning framework as configurable reference data and a planning-cycle record so that requisitions, budgets and localization plans are anchored to a named, versioned plan.

**Acceptance Criteria**

- [ ] Given an HR Manager, when they create a workforce plan, then they must select legal entity, country, planning period and horizon, and the plan is stored with status Draft → In Review → Approved.
- [ ] Given a planning framework, when configured, then planning objectives, demand/supply inputs and assumptions are recorded against the plan version.
- [ ] Given governance roles, when assigned, then planner, reviewer and approver are distinct identities (preparer ≠ approver) enforced by RBAC.
- [ ] Given an approved plan, when superseded, then the prior version is retained read-only with effective dates and an audit entry.
- [ ] Given any plan change, when saved, then actor, timestamp, field-level before/after and reason are written to the audit trail.

**Tasks**

- [ ] Backend: `workforce_plan` entity (id, entityId, countryCode, periodFrom, periodTo, horizonMonths, status, version, createdBy, approvedBy) + Prisma migration.
- [ ] Backend: planning-cycle service with state machine and version supersession.
- [ ] Frontend: Workforce Plan workspace (create, assumptions, objectives tabs).
- [ ] Rules/Config: configurable planning horizon and objective taxonomy per entity.
- [ ] Alerts/Workflow: route plan to reviewer/approver via workflow engine.
- [ ] Tests: unit (state machine) + e2e (create→approve→supersede with audit).

**Covers:** 3.1, 3.2, 3.3
**Dependencies:** EPIC-02

### EPIC-03-S02 — Organizational structure compliance & validation

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**As a** HR Admin, **I want** the org structure validated against compliance rules, **so that** every department, reporting line and span-of-control conforms to entity governance before positions are attached.

**Description**
Provides effective-dated org-unit modelling with structural validation: no orphan units, valid parent chains, span-of-control limits and mandatory cost-center/legal-entity linkage. Flags non-compliant nodes (e.g., unit without manager, circular reporting) so structure issues are resolved before workforce planning proceeds.

**Acceptance Criteria**

- [ ] Given an org unit, when saved, then it must link to a legal entity and cost center, else creation is blocked.
- [ ] Given a reporting line, when defined, then circular reporting and orphan nodes are detected and rejected.
- [ ] Given a span-of-control threshold per entity, when exceeded, then the node is flagged as a structural exception.
- [ ] Given a structural change, when committed, then it is effective-dated and the prior structure is preserved.
- [ ] Given any structure edit, when saved, then RBAC is enforced and the action is audit-logged.

**Tasks**

- [ ] Backend: `org_unit` and `org_relationship` entities with effective dating.
- [ ] Backend: structural validation service (cycle/orphan/span checks).
- [ ] Frontend: org tree editor with inline compliance flags.
- [ ] Rules/Config: per-entity span-of-control and mandatory-link rules.
- [ ] Alerts/Workflow: notify HR Admin on structural exceptions.
- [ ] Tests: unit (cycle detection) + integration (effective-dated edits).

**Covers:** 3.4
**Dependencies:** EPIC-09

### EPIC-03-S03 — Position management & position control

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As a** HR Manager, **I want** to manage positions with controlled headcount slots, **so that** hiring is constrained to approved, funded positions and ghost positions cannot exist.

**Description**
Implements positions as the unit of control: each position carries org unit, job, grade, FTE count, status (active/frozen/abolished), nationalization flag and budget linkage. Position control enforces that filled + open ≤ approved FTE, and abolishment requires no active incumbents.

**Acceptance Criteria**

- [ ] Given a position, when created, then it requires org unit, job, grade, approved FTE and cost center.
- [ ] Given a position with approved FTE = N, when incumbents + open requisitions would exceed N, then the over-allocation is blocked.
- [ ] Given a frozen position, when a requisition references it, then the requisition is blocked with reason "position frozen".
- [ ] Given a position flagged as nationalization-reserved, when planned, then it is marked for localized fill.
- [ ] Given an abolish action, when incumbents exist, then abolishment is blocked.
- [ ] Given any position change, when saved, then the audit trail records actor, change and reason.

**Tasks**

- [ ] Backend: `position` entity (orgUnitId, jobId, gradeId, approvedFte, status, nationalizationReserved, budgetLineId) + migration.
- [ ] Backend: position-control service (capacity check, abolish guard).
- [ ] Frontend: position register with status and capacity indicators.
- [ ] Rules/Config: per-country freeze/abolish governance rules.
- [ ] Alerts/Workflow: alert when position over-allocation attempted.
- [ ] Tests: unit (capacity math) + integration (freeze/abolish guards).

**Covers:** 3.5
**Dependencies:** EPIC-09

### EPIC-03-S04 — Headcount budgeting & funded-position control

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As a** HR Manager, **I want** headcount budgets defined per cost center and period with funded-position tracking, **so that** no requisition or hire can exceed the approved, funded headcount.

**Description**
Adds annual/period headcount budgets at entity/department/cost-center level, allocating budgeted FTE and salary cost to positions. Tracks budgeted vs committed vs actual headcount, and enforces budget availability as a gate on requisitions. Supports budget revisions with approval and variance tracking.

**Acceptance Criteria**

- [ ] Given a headcount budget, when created, then budgeted FTE and budgeted cost are captured per cost center and period.
- [ ] Given a requisition, when raised, then the system checks remaining funded FTE = budgeted − (filled + committed) and blocks if insufficient.
- [ ] Given a budget revision, when submitted, then it routes for approval and records variance vs original.
- [ ] Given over-budget hiring intent, when attempted, then an exception requiring senior approval is raised, not a silent allow.
- [ ] Given a dashboard, when viewed, then budgeted/committed/actual FTE and cost reconcile per cost center.
- [ ] Given any budget action, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `headcount_budget` and `budget_line` entities (costCenterId, period, budgetedFte, budgetedCost, committedFte) + migration.
- [ ] Backend: budget-availability service consumed by requisition gate.
- [ ] Frontend: budget planning grid + budgeted/committed/actual reconciliation view.
- [ ] Rules/Config: over-budget exception approval thresholds per entity.
- [ ] Alerts/Workflow: budget-revision approval + over-budget exception routing.
- [ ] Tests: unit (availability calc) + integration (requisition blocked on no funds).

**Covers:** 3.7
**Dependencies:** EPIC-03-S03, EPIC-09

### EPIC-03-S05 — Manpower Requisition with maker-checker approval workflow

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As a** Line Manager, **I want** to raise a manpower requisition that is validated and routed through an approval matrix, **so that** vacancies are authorised, funded and compliant before recruitment begins.

**Description**
Core requisition workflow: a requisition must reference an approved, unfrozen position and a funded budget line, capture justification (replacement/new/backfill), nationalization expectation and target start date. It routes through a configurable multi-level approval matrix (maker-checker, value/grade-based escalation) and, on final approval, emits a `vacancy.approved` event to Recruitment.

**Acceptance Criteria**

- [ ] Given a requisition, when submitted, then position validity, budget availability and localization target are checked; failures block submission with reasons.
- [ ] Given the approval matrix, when a requisition is routed, then approvers are determined by entity, grade and headcount value, and preparer ≠ any approver.
- [ ] Given an approver, when they approve/reject/return, then a decision with comments is recorded and the next step triggers.
- [ ] Given final approval, when reached, then committed FTE is incremented and a `vacancy.approved` event is published to Recruitment.
- [ ] Given a UAE/KSA entity below its nationalization target, when a non-national requisition is raised, then a localization warning/justification is required.
- [ ] Given any requisition action, when performed, then the audit trail records actor, decision, reason and timestamp.

**Tasks**

- [ ] Backend: `manpower_requisition` entity (positionId, budgetLineId, type, justification, nationalizationExpected, targetStartDate, status) + migration.
- [ ] Backend: validation + approval-routing service on the workflow engine.
- [ ] Frontend: requisition form + approval inbox with decision actions.
- [ ] Rules/Config: per-entity approval matrix (grade/value escalation, maker-checker).
- [ ] Alerts/Workflow: route, escalate on SLA breach, emit `vacancy.approved`.
- [ ] Tests: integration (block on no budget/frozen position) + e2e (multi-level approval + event).

**Covers:** 3.6
**Dependencies:** EPIC-03-S03, EPIC-03-S04, EPIC-04

### EPIC-03-S06 — Workforce localization planning & nationalization-gap targeting

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** nationalization targets planned per entity with gap tracking against the country rule engine, **so that** planning and requisitions actively close Emiratisation/Nitaqat/Bahrainization/Omanisation gaps.

**Description**
Computes required localized headcount per entity from country thresholds (e.g., Emiratisation %, Nitaqat band/colour, Bahrainization ratio), compares to current localized actuals, and produces a localization plan that reserves positions and shapes the requisition pipeline. Surfaces gaps as planning gates and feeds nationalization-reserved flags on positions/requisitions.

**Acceptance Criteria**

- [ ] Given an entity and country, when localization is planned, then required localized FTE is derived from the rule engine threshold and current actuals.
- [ ] Given a localization gap, when computed, then a target plan recommends localized hires per period and flags reserved positions.
- [ ] Given a requisition for a non-national in a gap entity, when raised, then a localization justification is required and logged.
- [ ] Given a KSA entity, when planned, then Nitaqat band impact of the planned hires is simulated.
- [ ] Given target vs actual, when viewed, then gap by entity/department renders with trend.
- [ ] Given any localization-plan change, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `localization_plan` entity (entityId, countryCode, requiredLocalFte, currentLocalFte, gap, period) + migration.
- [ ] Backend: gap-calc service calling country rule engine thresholds.
- [ ] Frontend: localization planning view with gap and band simulation.
- [ ] Rules/Config: country thresholds (Emiratisation/Nitaqat/Bahrainization/Omanisation) via rule engine.
- [ ] Alerts/Workflow: alert on widening gap / breach risk; gate non-national requisitions.
- [ ] Tests: unit (gap + Nitaqat band sim) + integration (requisition gating).

**Covers:** 3.8
**Dependencies:** EPIC-02, EPIC-03-S03, EPIC-03-S05

### EPIC-03-S07 — Succession planning & talent-pool readiness

**Labels:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 5
**As a** HR Manager, **I want** succession plans for critical positions, **so that** key-role continuity risk is managed and ready successors are tracked.

**Description**
Lets HR designate critical/key positions, nominate successors with readiness levels (ready now / 1–2 yrs / 3+ yrs), and track development actions and bench strength. Links to position management so vacated critical roles surface pre-identified successors and feed workforce-risk scoring.

**Acceptance Criteria**

- [ ] Given a position flagged critical, when a succession plan is created, then ≥1 successor with readiness level can be recorded.
- [ ] Given a successor, when nominated, then readiness, development actions and review date are captured.
- [ ] Given a critical position with no ready-now successor, when reviewed, then it is flagged as a continuity risk.
- [ ] Given bench strength, when viewed per unit, then % of critical roles with a ready successor is shown.
- [ ] Given any succession change, when saved, then it is audit-logged and RBAC-restricted to HR.

**Tasks**

- [ ] Backend: `succession_plan` + `successor_nomination` entities + migration.
- [ ] Backend: bench-strength and continuity-risk calc service.
- [ ] Frontend: succession board (critical roles, successors, readiness heat).
- [ ] Rules/Config: criticality criteria and readiness scale per entity.
- [ ] Alerts/Workflow: alert on critical role with no ready successor.
- [ ] Tests: unit (bench calc) + integration (risk flagging).

**Covers:** 3.9
**Dependencies:** EPIC-03-S03

### EPIC-03-S08 — Workforce risk management & risk register

**Labels:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** a workforce risk register with scoring, **so that** localization, attrition, visa-expiry concentration and key-person risks are tracked and mitigated.

**Description**
Provides a configurable workforce-risk register capturing risk type, likelihood, impact, owner, mitigation and status, with auto-generated risks fed from other modules (nationalization gap, succession gap, high attrition, expiring-permit concentration). Renders a risk matrix and drives mitigation tracking.

**Acceptance Criteria**

- [ ] Given a workforce risk, when logged, then type, likelihood, impact, score, owner and mitigation are captured.
- [ ] Given source signals (gap/attrition/expiry), when thresholds are crossed, then risks are auto-raised into the register.
- [ ] Given a risk score, when computed, then it maps to a configurable likelihood×impact matrix band.
- [ ] Given a mitigation, when overdue, then an alert is sent to the risk owner.
- [ ] Given any risk change, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `workforce_risk` entity (type, likelihood, impact, score, owner, mitigation, status) + migration.
- [ ] Backend: auto-risk generation service from module signals.
- [ ] Frontend: risk register + likelihood×impact heat matrix.
- [ ] Rules/Config: scoring bands and auto-raise thresholds per entity.
- [ ] Alerts/Workflow: overdue-mitigation alerts to owners.
- [ ] Tests: unit (scoring/banding) + integration (auto-raise from signals).

**Covers:** 3.10
**Dependencies:** EPIC-03-S06, EPIC-03-S07

### EPIC-03-S09 — Contractor & outsourced workforce planning

**Labels:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 5
**As a** HR Manager, **I want** to plan and track contractor/outsourced headcount distinctly from direct employees, **so that** blended workforce, sponsorship and localization-exclusion rules are correctly managed.

**Description**
Models contingent workforce (agency, outsourced, third-party-sponsored) with vendor, contract period, sponsorship/visa source and cost. Keeps contractor headcount separate from direct FTE so localization ratios and budgets are computed correctly, and flags contractors who must not be counted toward nationalization or whose work permits expire.

**Acceptance Criteria**

- [ ] Given a contractor record, when created, then vendor, contract type, sponsorship source, period and cost are captured.
- [ ] Given localization computation, when run, then contractor heads are excluded from national-ratio numerators/denominators per rule.
- [ ] Given blended planning, when viewed, then direct vs contingent headcount split is shown per unit.
- [ ] Given a contractor permit/contract nearing expiry, when within 60/30/7 days, then an alert is raised.
- [ ] Given any contractor-plan change, when saved, then it is audit-logged.

**Tasks**

- [ ] Backend: `contingent_worker` entity (vendorId, contractType, sponsorshipSource, periodFrom/To, cost) + migration.
- [ ] Backend: blended-headcount + localization-exclusion service.
- [ ] Frontend: contingent workforce planning view (direct vs contingent).
- [ ] Rules/Config: country rules on contractor counting/exclusion.
- [ ] Alerts/Workflow: 60/30/7-day contract/permit expiry alerts.
- [ ] Tests: unit (exclusion logic) + integration (expiry alerting).

**Covers:** 3.11
**Dependencies:** EPIC-03-S06

### EPIC-03-S10 — Workforce analytics, KPIs & planning dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**As a** Executive / Leadership, **I want** a workforce analytics dashboard with planning KPIs, **so that** headcount, budget utilisation, localization and risk are visible in real time.

**Description**
Builds the workforce-planning dashboard and KPI pack: budgeted vs actual headcount, vacancy/requisition cycle time, localization % vs target, span of control, succession coverage, contractor ratio and workforce-risk count. Supports filters by country/entity/department and export.

**Acceptance Criteria**

- [ ] Given the dashboard, when opened, then headcount (budgeted/committed/actual), localization % vs target and open-requisition aging render per filter.
- [ ] Given KPIs, when computed, then time-to-fill, vacancy rate, succession coverage and contractor ratio are shown with trend.
- [ ] Given filters, when applied (country/entity/department/period), then all tiles recompute.
- [ ] Given an export, when requested, then a KPI pack (PDF/Excel) is generated.
- [ ] Given RBAC, when a user views, then data is scoped to their authorised entities.

**Tasks**

- [ ] Backend: analytics aggregation queries/materialized views for planning KPIs.
- [ ] Backend: KPI export service (PDF/Excel).
- [ ] Frontend: dashboard with tiles, trends and filters.
- [ ] Rules/Config: KPI definitions and targets per entity.
- [ ] Alerts/Workflow: threshold alerts (e.g., localization below target).
- [ ] Tests: unit (KPI calc) + integration (filter scoping + export).

**Covers:** 3.12
**Dependencies:** EPIC-03-S04, EPIC-03-S05, EPIC-03-S06

### EPIC-03-S11 — HR governance rules & control enforcement

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** workforce-planning governance rules enforced and evidenced, **so that** segregation of duties, approval authority and policy controls are demonstrably in place.

**Description**
Codifies the chapter's governance requirements as enforceable controls: segregation of duties (preparer ≠ approver), delegation-of-authority limits on requisitions/budgets, mandatory justification, and control evidence capture. Produces a governance control matrix showing each control, its owner, status and last test date.

**Acceptance Criteria**

- [ ] Given a control matrix, when configured, then each governance control has owner, frequency and evidence requirement.
- [ ] Given an approval, when the approver exceeds their delegated authority, then it is blocked or escalated.
- [ ] Given segregation-of-duties, when the same user prepares and approves, then the action is prevented system-wide.
- [ ] Given a control test, when recorded, then result, evidence link and tester are stored.
- [ ] Given any governance action, when performed, then it is audit-logged.

**Tasks**

- [ ] Backend: `governance_control` + `control_test` entities + migration.
- [ ] Backend: SoD and delegation-of-authority enforcement service.
- [ ] Frontend: governance control matrix view.
- [ ] Rules/Config: DoA limits and control catalogue per entity.
- [ ] Alerts/Workflow: escalation on authority breach; control-test reminders.
- [ ] Tests: unit (SoD/DoA checks) + integration (escalation).

**Covers:** 3.13
**Dependencies:** EPIC-03-S05

### EPIC-03-S12 — Workforce planning HR audit checklist & red-flag register

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 5
**As a** Internal Auditor, **I want** a configurable workforce-planning audit checklist with red-flag detection, **so that** I can verify positions, budgets, requisitions and localization controls and log findings.

**Description**
Implements the chapter's HR audit checklist as a digital, configurable checklist with pass/fail/N-A, evidence attachment and auto-run red-flag rules (e.g., filled > budgeted, requisition approved by preparer, position with no budget, non-national hire in a gap entity without justification). Findings flow into a finding/corrective-action register.

**Acceptance Criteria**

- [ ] Given an audit checklist, when configured, then items are grouped by control area with response types and evidence slots.
- [ ] Given red-flag rules, when executed, then exceptions (e.g., headcount > budget, SoD breach, unfunded position) are listed with drill-down.
- [ ] Given a checklist item, when marked fail, then a finding with severity, owner and due date is created.
- [ ] Given a finding, when overdue, then an alert is raised and it appears on the dashboard.
- [ ] Given audit execution, when completed, then a signed audit pack/export is produced and audit-logged.

**Tasks**

- [ ] Backend: `audit_checklist`, `audit_item`, `audit_finding` entities + migration.
- [ ] Backend: red-flag rule engine over planning/budget/requisition data.
- [ ] Frontend: checklist runner + findings/corrective-action register.
- [ ] Rules/Config: configurable checklist templates and red-flag rules per entity.
- [ ] Alerts/Workflow: overdue-finding alerts; sign-off workflow.
- [ ] Tests: unit (red-flag rules) + e2e (run checklist→finding→export).

**Covers:** 3.14
**Dependencies:** EPIC-03-S04, EPIC-03-S05, EPIC-03-S11
