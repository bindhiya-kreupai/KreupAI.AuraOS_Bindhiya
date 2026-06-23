# EPIC-09: Chapter 9 – Organization & Position Management

> **Source:** GCC HR Compliance Handbook — Chapter 9 – Organization & Position Management
> **Module:** Core HR · **Labels:** `epic`, `gcc-compliance`, `core-hr`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a configurable Organization & Position Management foundation in AuraOS that models legal entities, business units, departments, cost centers, positions, job architecture, grades/bands and reporting hierarchies as governed, version-controlled master data. The model drives position-controlled headcount, delegation of authority, vacancy tracking and nationalization reporting so every downstream module (payroll, immigration, nationalization, workforce analytics) inherits a single, audited source of organizational truth.

## Business Value

Prevents off-structure hiring and budget breaches through position control, ensures legal-entity-accurate WPS/social-insurance/nationalization reporting, gives auditors a fully traceable org-change history, and accelerates restructures, requisitions and approvals via a configurable, self-service org model with built-in maker-checker.

## Requirements Covered (handbook sections)

- 9.1 Introduction
- 9.2 Objectives of Organization & Position Management
- 9.3 Organization Structure Framework
- 9.4 Legal Entity Management
- 9.5 Business Unit and Department Management
- 9.6 Cost Center Management
- 9.7 Position Management
- 9.8 Position Control
- 9.9 Job Architecture
- 9.10 Grades and Salary Bands
- 9.11 Reporting Hierarchy
- 9.12 Delegation of Authority
- 9.13 Vacancy Management
- 9.14 Organization Change Management
- 9.15 Nationalization Reporting Through Organization Structure
- 9.16 Workforce Analytics
- 9.17 HRMS Configuration Model
- 9.18 Organization & Position Audit Checklist
- 9.19 Common Organization & Position Management Risks
- 9.20 Sample Position Creation Form
- 9.21 Sample Organization Change Request
- 9.22 Key Takeaways

## Out of Scope

- Recruitment requisition-to-offer workflow (covered by EPIC-04/EPIC-05; this epic only exposes the vacant position).
- Payroll salary-component calculation (EPIC-10) — only grades/bands as a control input are in scope here.
- Detailed nationalization target computation and authority filing (EPIC-16/17/18) — this epic provides the org-structure data feed only.
- Succession planning and competency modelling.

## Dependencies

- EPIC-02 (Platform / Country Rule Engine) for legal-entity and country configuration
- EPIC-08 (Employee Records) for employee-to-position assignment

## Epic Definition of Done

- [ ] Org hierarchy (legal entity → business unit → department → cost center → position) is modelled with effective-dating and version history.
- [ ] Position control blocks any hire/assignment that exceeds approved seats or sits outside an approved position.
- [ ] Job architecture, grades and salary bands are configurable and reusable across legal entities.
- [ ] Reporting hierarchy and delegation-of-authority drive approval routing across modules.
- [ ] Org change requests run through maker-checker with full audit trail and effective dates.
- [ ] Nationalization headcount is derivable from org structure per legal entity and country.
- [ ] Workforce analytics dashboard, audit checklist and risk register are live and configurable.

---

## User Stories

### EPIC-09-S01 — Organization structure framework & objectives baseline

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** a configurable multi-level organization structure framework, **so that** every entity, unit and position in AuraOS rolls up into one governed hierarchy.

**Description**
Establish the foundational org framework that defines node types (legal entity, business unit, department, cost center, position), allowed parent-child rules, and effective-dated versioning. This is the backbone the rest of the epic and downstream modules build on, encoding the objectives and structure principles from the handbook.

**Acceptance Criteria**

- [ ] Given a defined node-type ruleset, when an admin builds the hierarchy, then only valid parent-child relationships (e.g., department under business unit under legal entity) are permitted.
- [ ] Given any structure change, when it is saved, then a new effective-dated version is created and the prior version is retained read-only.
- [ ] Given multiple GCC countries, when entities are added, then each node is tagged with its country and legal entity for downstream rule-engine resolution.
- [ ] Given an RBAC-restricted user, when they attempt structural edits, then only `HR Admin`/`System Administrator` roles may modify the framework, and all edits are written to the audit trail.
- [ ] Given a request for the org tree, when rendered, then the API returns the hierarchy as of any chosen effective date.

**Tasks**

- [ ] Backend: `org_node` schema (`node_id`, `node_type`, `parent_id`, `legal_entity_id`, `country_code`, `effective_from`, `effective_to`, `status`, `version`)
- [ ] Backend: hierarchy validation service enforcing node-type parent-child rules
- [ ] Backend: effective-dated versioning + as-of query API
- [ ] Frontend: org structure tree builder/editor with version timeline
- [ ] Rules/Config: configurable node-type ruleset per tenant
- [ ] Tests: unit tests for invalid hierarchy rejection and as-of retrieval

**Covers:** 9.1, 9.2, 9.3
**Dependencies:** EPIC-02

### EPIC-09-S02 — Legal entity management

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** to manage legal entities with their registration, country and authority identifiers, **so that** payroll, WPS, social insurance and nationalization report under the correct legal employer.

**Description**
Model each legal entity with its country, trade licence / CR number, MOHRE/Qiwa/LMRA establishment IDs, WPS employer code and base currency, so downstream modules resolve the right statutory context per entity.

**Acceptance Criteria**

- [ ] Given a new legal entity, when created, then mandatory fields (country, legal name, registration number, establishment ID, base currency) are validated before save.
- [ ] Given a GCC country, when the entity is saved, then country-specific identifier formats (e.g., UAE establishment card, Saudi CR/Qiwa, Bahrain LMRA) are validated by the rule engine.
- [ ] Given an entity used by active employees, when a user attempts deletion, then it is blocked and only deactivation with effective date is allowed.
- [ ] Given any field change, when saved, then maker-checker approval and audit capture apply.

**Tasks**

- [ ] Backend: `legal_entity` schema (`entity_id`, `country_code`, `legal_name`, `cr_number`, `establishment_id`, `wps_employer_code`, `base_currency`, `status`)
- [ ] Backend: country-specific identifier validation via rule engine
- [ ] Frontend: legal entity registry screen with CRUD + deactivate
- [ ] Rules/Config: per-country mandatory identifier and format rules
- [ ] Alerts/Workflow: maker-checker on entity create/change
- [ ] Tests: integration tests for identifier validation per country

**Covers:** 9.4
**Dependencies:** EPIC-02

### EPIC-09-S03 — Business unit & department management

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 3
**As an** HR Manager, **I want** to manage business units and departments under each legal entity, **so that** the workforce is organized into reportable, owner-assigned units.

**Description**
Provide CRUD and effective-dated lifecycle for business units and departments, each with an owner (department head position), location and active status, nested under the correct legal entity.

**Acceptance Criteria**

- [ ] Given a legal entity, when a business unit or department is created, then it must attach to a valid parent and be assigned an owning manager position.
- [ ] Given a department with active positions, when deactivation is attempted, then the system warns and requires reassignment or close-out of those positions.
- [ ] Given a department move, when reparented, then the change is effective-dated and version-logged.
- [ ] Given any change, when saved, then it is written to the audit trail with actor and timestamp.

**Tasks**

- [ ] Backend: `business_unit` and `department` schemas with owner-position FK
- [ ] Backend: reparenting + deactivation guard service
- [ ] Frontend: BU/department management screens within the org tree
- [ ] Rules/Config: owner-position-required validation
- [ ] Tests: unit tests for deactivation guard with active positions

**Covers:** 9.5
**Dependencies:** EPIC-09-S01, EPIC-09-S02

### EPIC-09-S04 — Cost center management

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 3
**As a** Payroll Officer, **I want** cost centers mapped to org nodes and positions, **so that** payroll and labour costs post to the correct GL cost center per legal entity.

**Description**
Define cost centers, link them to departments and positions, and enforce that every position resolves to exactly one default cost center for finance posting, while allowing split allocation where configured.

**Acceptance Criteria**

- [ ] Given a position, when activated, then it must resolve to a valid, active cost center (direct or inherited from department).
- [ ] Given a cost-center split, when configured, then allocation percentages must total 100%.
- [ ] Given a cost center used in current-period payroll, when deactivation is attempted, then it is blocked until reassignment.
- [ ] Given a change, when saved, then it is effective-dated and audit-logged for GL traceability.

**Tasks**

- [ ] Backend: `cost_center` schema + `position_cost_center_allocation` (with percentage)
- [ ] Backend: 100%-allocation and active-cost-center validation
- [ ] Frontend: cost center registry + allocation editor
- [ ] Rules/Config: inherit-from-department default rule
- [ ] Tests: validation tests for split totals and deactivation guard

**Covers:** 9.6
**Dependencies:** EPIC-09-S03

### EPIC-09-S05 — Position management

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** to create and maintain positions as distinct objects from employees, **so that** the org runs on a position-based model where seats persist independently of incumbents.

**Description**
Model positions with title, job mapping, grade, department, cost center, FTE, location, employment type and incumbency, supporting single or shared incumbency and effective-dated lifecycle (create, hold, freeze, abolish).

**Acceptance Criteria**

- [ ] Given a position, when created, then it links to a job profile, grade, department and cost center, and specifies FTE and headcount seats.
- [ ] Given an incumbent assignment, when made, then the system records the employee-to-position link with effective dates and prevents over-assignment beyond seats.
- [ ] Given a position, when frozen or abolished, then no new assignment is allowed and the action is effective-dated.
- [ ] Given a vacated position, when the incumbent leaves, then it is auto-flagged vacant for vacancy management.
- [ ] Given any position change, when saved, then RBAC and audit trail apply.

**Tasks**

- [ ] Backend: `position` schema (`position_id`, `title`, `job_id`, `grade_id`, `department_id`, `cost_center_id`, `fte`, `seats`, `employment_type`, `location`, `status`)
- [ ] Backend: `position_incumbency` link table with effective dates
- [ ] Backend: position lifecycle service (create/hold/freeze/abolish)
- [ ] Frontend: position master screen + incumbency view
- [ ] Rules/Config: single vs shared incumbency configuration
- [ ] Tests: e2e position lifecycle and incumbency assignment

**Covers:** 9.7
**Dependencies:** EPIC-09-S03, EPIC-09-S04, EPIC-09-S06

### EPIC-09-S06 — Job architecture (job families, jobs, profiles)

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** a structured job architecture of job families, sub-families, jobs and job profiles, **so that** positions are built from standardized, reusable job definitions.

**Description**
Build the job catalogue: job families → sub-families → jobs → job profiles, each carrying a standard title, occupation/profession code (for nationalization and immigration), default grade and job description reference, reusable across legal entities.

**Acceptance Criteria**

- [ ] Given the architecture, when a job is created, then it must belong to a family/sub-family and carry an occupation/profession code.
- [ ] Given a position, when created, then it must reference a published job profile, not a free-text title.
- [ ] Given a country, when a job is used, then its occupation code maps to that country's classification (e.g., MOHRE/Qiwa profession lists).
- [ ] Given job-profile edits, when saved, then versioning and audit capture apply and existing positions show the version they were built from.

**Tasks**

- [ ] Backend: `job_family`, `job`, `job_profile` schemas with `occupation_code`
- [ ] Backend: occupation-code mapping per country via rule engine
- [ ] Frontend: job architecture catalogue + profile editor
- [ ] Rules/Config: country occupation/profession code lists
- [ ] Tests: unit tests for profile versioning and mandatory occupation code

**Covers:** 9.9
**Dependencies:** EPIC-02

### EPIC-09-S07 — Grades and salary bands

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**As an** HR Manager, **I want** to define grades and salary bands per grade, **so that** positions and offers stay within governed pay ranges.

**Description**
Configure grade structures and salary bands (min/mid/max, currency) per grade and legal entity/country, with compa-ratio support, so positions inherit grade-driven pay ranges used by recruitment and payroll as a control.

**Acceptance Criteria**

- [ ] Given a grade, when a salary band is defined, then min ≤ mid ≤ max and a currency are required.
- [ ] Given a position with a grade, when a salary outside the band is proposed downstream, then the system flags an out-of-band exception.
- [ ] Given multiple currencies, when bands are defined per legal entity, then each band stores its base currency for the entity's country.
- [ ] Given band changes, when saved, then effective-dating, versioning and audit apply.

**Tasks**

- [ ] Backend: `grade` and `salary_band` schemas (`min`, `mid`, `max`, `currency`, `effective_from`)
- [ ] Backend: out-of-band detection service + compa-ratio calculation
- [ ] Frontend: grade & band configuration screen
- [ ] Rules/Config: per-entity currency and band rules
- [ ] Tests: validation tests for min/mid/max ordering and out-of-band flagging

**Covers:** 9.10
**Dependencies:** EPIC-09-S06

### EPIC-09-S08 — Position control & headcount budgeting

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As an** HR Manager, **I want** position control enforced against approved headcount budgets, **so that** no hiring or assignment can exceed approved seats or budget.

**Description**
Enforce position-controlled headcount: approved seats per position/department, budgeted vs actual vs committed FTE, and hard blocks or budget-overage warnings when assignments would breach the approved establishment.

**Acceptance Criteria**

- [ ] Given an approved headcount budget, when an assignment would exceed approved seats, then the system blocks it (hard control) or routes an over-establishment approval, per config.
- [ ] Given a requisition draw-down, when a position is filled, then budgeted/committed/actual counts update in real time.
- [ ] Given a department, when viewed, then planned vs approved vs filled vs vacant FTE is shown with variance.
- [ ] Given an override, when granted, then it requires elevated approval and is fully audit-logged.

**Tasks**

- [ ] Backend: `headcount_budget` schema (`department_id`, `position_id`, `budget_period`, `approved_fte`, `committed_fte`, `actual_fte`)
- [ ] Backend: position-control enforcement service (block/warn/override)
- [ ] Frontend: position-control dashboard with budget vs actual
- [ ] Rules/Config: hard-block vs soft-warn mode per tenant/entity
- [ ] Alerts/Workflow: over-establishment approval routing
- [ ] Tests: e2e tests for block-on-exceed and override path

**Covers:** 9.8
**Dependencies:** EPIC-09-S05

### EPIC-09-S09 — Reporting hierarchy management

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** position-based and person-based reporting hierarchies, **so that** approval routing and org charts reflect the true line-of-command.

**Description**
Maintain primary and dotted-line reporting relationships at position level, derive the live org chart, detect cycles, and expose the hierarchy as the routing source for workflows across modules.

**Acceptance Criteria**

- [ ] Given a position, when a reports-to relationship is set, then circular reporting is detected and rejected.
- [ ] Given an incumbent change, when a new employee fills a manager position, then all reports automatically resolve to the new manager.
- [ ] Given a request for the org chart, when rendered, then both solid and dotted-line relationships are shown as of any date.
- [ ] Given a vacant manager position, when reports exist, then they escalate to the next valid level for approvals.

**Tasks**

- [ ] Backend: `reporting_relationship` schema (position-to-position, type solid/dotted)
- [ ] Backend: cycle-detection + next-valid-manager resolution service
- [ ] Frontend: interactive org chart with reporting lines
- [ ] Alerts/Workflow: expose hierarchy as approval-routing provider
- [ ] Tests: unit tests for cycle detection and vacant-manager escalation

**Covers:** 9.11
**Dependencies:** EPIC-09-S05

### EPIC-09-S10 — Delegation of authority (DoA)

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a configurable delegation-of-authority matrix, **so that** approvals (requisitions, org changes, salary actions) route to the authorized role within defined limits.

**Description**
Define DoA rules by transaction type, monetary/headcount threshold, org level and country, with temporary delegation (acting/out-of-office) and expiry, consumed by the workflow engine for all approvals.

**Acceptance Criteria**

- [ ] Given a transaction with a value, when submitted, then it routes to the approver whose DoA limit covers that value at that org level.
- [ ] Given an approver on leave, when a temporary delegation is active, then approvals route to the delegate only within the delegation's validity window and limits.
- [ ] Given a transaction exceeding all configured limits, when submitted, then it escalates to the top authority and is flagged.
- [ ] Given any delegation create/change, when saved, then it is audit-logged with effective and expiry dates.

**Tasks**

- [ ] Backend: `doa_rule` schema (`transaction_type`, `threshold`, `org_level`, `approver_role`, `country_code`) + `delegation` (acting) table
- [ ] Backend: DoA resolution service integrated with workflow engine
- [ ] Frontend: DoA matrix configuration + delegation setup screen
- [ ] Rules/Config: per-country and per-transaction threshold tables
- [ ] Alerts/Workflow: route approvals via DoA + delegation expiry alerts
- [ ] Tests: integration tests for threshold routing and temporary delegation

**Covers:** 9.12
**Dependencies:** EPIC-09-S09

### EPIC-09-S11 — Vacancy management

**Labels:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 3
**As an** HR Manager, **I want** automatic vacancy tracking from position control, **so that** open seats are visible and feed recruitment.

**Description**
Surface vacant positions (newly created, vacated, or seats below filled count) with vacancy reason, aging and recruitment status, and expose them to the requisition process.

**Acceptance Criteria**

- [ ] Given a position with unfilled approved seats, when evaluated, then it appears in the vacancy register with vacancy-since date and aging.
- [ ] Given an incumbent departure, when finalized, then the position auto-flags vacant with reason "vacated".
- [ ] Given a frozen/abolished position, when checked, then it is excluded from the active vacancy list.
- [ ] Given a vacancy, when a requisition is raised, then its recruitment status syncs back to the vacancy register.

**Tasks**

- [ ] Backend: vacancy derivation service (seats vs filled) + `vacancy` view with aging
- [ ] Backend: integration hook to requisition status (EPIC-04)
- [ ] Frontend: vacancy register with aging and reason filters
- [ ] Alerts/Workflow: aging-vacancy alert at configurable thresholds
- [ ] Tests: unit tests for vacancy derivation and exclusion of frozen positions

**Covers:** 9.13
**Dependencies:** EPIC-09-S08

### EPIC-09-S12 — Organization change management (maker-checker)

**Labels:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** all structural changes routed through governed org change requests, **so that** reorganizations are controlled, effective-dated and auditable.

**Description**
Provide an Org Change Request (OCR) workflow covering create/move/merge/split/abolish of units and positions, with impact preview, maker-checker approval, effective-dating and bulk apply, preventing ad-hoc structural drift.

**Acceptance Criteria**

- [ ] Given an OCR, when submitted, then the preparer cannot self-approve (maker ≠ checker) and it routes per DoA.
- [ ] Given a proposed change, when previewed, then impacted positions, incumbents, cost centers and reporting lines are listed before approval.
- [ ] Given approval, when applied, then changes take effect on the stated effective date and prior structure is versioned.
- [ ] Given a rejected OCR, when returned, then comments are captured and no structural change occurs.
- [ ] Given any OCR action, when performed, then it is fully audit-logged.

**Tasks**

- [ ] Backend: `org_change_request` schema (`ocr_id`, `change_type`, `payload`, `effective_date`, `status`, `maker_id`, `checker_id`)
- [ ] Backend: impact-analysis + bulk-apply transaction service
- [ ] Frontend: OCR wizard with impact preview and approval timeline
- [ ] Alerts/Workflow: maker-checker routing via DoA + notifications
- [ ] Tests: e2e tests for maker≠checker enforcement and effective-dated apply

**Covers:** 9.14, 9.21
**Dependencies:** EPIC-09-S10

### EPIC-09-S13 — Nationalization reporting through org structure

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** nationalization headcount derived from org structure per legal entity and country, **so that** Emiratisation/Saudization/Bahrainization/Omanisation ratios reflect the true establishment.

**Description**
Tag positions/incumbents with nationality and counting eligibility, and aggregate national vs total headcount by legal entity, establishment and country to feed nationalization computation and authority reporting.

**Acceptance Criteria**

- [ ] Given employees mapped to positions, when aggregated, then national vs expatriate headcount is computed per legal entity and establishment.
- [ ] Given a country, when ratios are derived, then the correct denominator rules (e.g., countable categories per Nitaqat/Emiratisation) are applied via the rule engine.
- [ ] Given a structural change, when applied, then nationalization counts recompute on the change's effective date.
- [ ] Given the report, when exported, then it is broken down by establishment ID for authority alignment.

**Tasks**

- [ ] Backend: nationalization aggregation service over org/incumbency data
- [ ] Backend: per-country countable-category rules via rule engine
- [ ] Frontend: nationalization-by-structure report view
- [ ] Rules/Config: Emiratisation/Saudization/Bahrainization/Omanisation counting rules
- [ ] Tests: integration tests for per-entity national-ratio computation
- [ ] Alerts/Workflow: feed to EPIC-16/17/18 nationalization modules

**Covers:** 9.15
**Dependencies:** EPIC-09-S05

### EPIC-09-S14 — Workforce analytics & org dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership user, **I want** an org & position analytics dashboard, **so that** I can see span of control, vacancy, filled/budget ratios and structural KPIs at a glance.

**Description**
Build dashboards covering headcount by entity/BU/department, span of control, manager-to-IC ratio, vacancy rate and aging, position fill rate, grade distribution and budget vs actual FTE, with drill-down and export.

**Acceptance Criteria**

- [ ] Given the dashboard, when loaded, then it shows headcount, vacancy rate, fill rate, span of control and budget-vs-actual FTE by org level.
- [ ] Given a KPI tile, when clicked, then it drills down to the underlying positions/units.
- [ ] Given an RBAC scope, when a leader logs in, then they see only their entities/units.
- [ ] Given a reporting period, when selected, then metrics are computed as of that date using effective-dated structure.

**Tasks**

- [ ] Backend: analytics aggregation endpoints (span, fill rate, vacancy, grade mix)
- [ ] Frontend: org analytics dashboard with drill-down and export
- [ ] Rules/Config: KPI definitions and thresholds configuration
- [ ] Tests: integration tests for as-of metric computation and RBAC scoping

**Covers:** 9.16
**Dependencies:** EPIC-09-S11, EPIC-09-S13

### EPIC-09-S15 — HRMS configuration model for org & position

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**As a** System Administrator, **I want** the org & position model exposed as tenant-level configuration, **so that** node types, validations, position-control mode and DoA are set up without code changes.

**Description**
Deliver the configuration layer described in the handbook's HRMS configuration model: configurable node types, mandatory-field rules, position-control mode, grade/band currencies, occupation-code lists and DoA thresholds, all versioned per tenant.

**Acceptance Criteria**

- [ ] Given a tenant, when configured, then node types, mandatory fields, and position-control mode are editable via admin UI without deployment.
- [ ] Given a config change, when published, then it is versioned and applied effective-dated with audit capture.
- [ ] Given multiple countries, when configured, then per-country rule sets (identifiers, occupation codes, bands) bind to the correct legal entity.
- [ ] Given an invalid configuration, when validated, then publication is blocked with a clear error.

**Tasks**

- [ ] Backend: `org_config` versioned configuration store + publish/validate service
- [ ] Frontend: configuration admin console for org & position
- [ ] Rules/Config: bind country rule sets to legal entities
- [ ] Tests: unit tests for config validation and versioned publish

**Covers:** 9.17
**Dependencies:** EPIC-09-S01, EPIC-09-S10

### EPIC-09-S16 — Position creation form (configurable digital form)

**Labels:** `user-story`, `forms` · **Priority:** Should · **Estimate:** 3
**As an** HR Manager, **I want** a configurable digital Position Creation Form, **so that** new positions are requested with all required data and routed for approval.

**Description**
Build a digital position-creation form mirroring the handbook sample, capturing job profile, grade, department, cost center, FTE, location, justification and budget reference, with export to PDF and direct creation of the position on approval.

**Acceptance Criteria**

- [ ] Given the form, when submitted, then required fields (job profile, grade, department, cost center, FTE, justification) are validated.
- [ ] Given approval, when granted, then a position record is created with the form data and a link to the source form.
- [ ] Given a completed form, when exported, then a PDF is generated for the record.
- [ ] Given submission, when routed, then it follows DoA-based maker-checker approval and is audit-logged.

**Tasks**

- [ ] Backend: position-creation form schema + form-to-position service
- [ ] Frontend: configurable position creation form + PDF export
- [ ] Alerts/Workflow: approval routing via DoA
- [ ] Tests: e2e tests for form submission → position creation

**Covers:** 9.20
**Dependencies:** EPIC-09-S05, EPIC-09-S10

### EPIC-09-S17 — Org & position audit checklist and risk register

**Labels:** `user-story`, `audit` · **Priority:** Should · **Estimate:** 3
**As an** Internal Auditor, **I want** a configurable audit checklist and risk register for org & position management, **so that** structural-governance gaps and common risks are tracked and remediated.

**Description**
Provide a configurable audit checklist (e.g., positions without cost centers, off-band salaries, orphan reporting lines, over-establishment) and a risk register capturing common org/position risks with likelihood/impact, owner and remediation status, plus the key-takeaways reference.

**Acceptance Criteria**

- [ ] Given the audit checklist, when run, then it flags red-flag conditions (orphan positions, missing cost center, over-establishment, off-band pay, circular reporting).
- [ ] Given a finding, when raised, then it is logged in the risk register with severity, owner and due date.
- [ ] Given a risk register, when reviewed, then likelihood × impact scoring and status are tracked to closure.
- [ ] Given checklist items, when configured, then they are tenant-editable.

**Tasks**

- [ ] Backend: audit-rule engine over org/position data + `org_risk_register` schema
- [ ] Frontend: audit checklist runner + risk register board
- [ ] Rules/Config: configurable red-flag rules and risk scoring matrix
- [ ] Alerts/Workflow: overdue-remediation alerts
- [ ] Tests: integration tests for red-flag detection and register lifecycle

**Covers:** 9.18, 9.19, 9.22
**Dependencies:** EPIC-09-S08, EPIC-09-S09
