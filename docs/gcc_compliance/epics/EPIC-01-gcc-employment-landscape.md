# EPIC-01: Chapter 1: GCC Employment Landscape

> **Source:** GCC HR Compliance Handbook — Chapter 1: GCC Employment Landscape
> **Module:** Foundation · **Labels:** `epic`, `gcc-compliance`, `platform`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Establish the AuraOS platform foundation that makes every downstream compliance module GCC-aware: a multi-country, multi-entity tenancy model; a unified workforce data model that distinguishes expatriate vs. national employees per country; a digital-transformation/automation baseline (event bus, audit trail, alerts) that compliance modules plug into; and a compliance-risk and KPI baseline that turns the handbook's market context and risk themes into configurable, measurable platform behaviour. This epic does not implement labour-law rules itself — it creates the structures, reference data, and analytics scaffolding the rule engine (EPIC-02) populates.

## Business Value

Without a country-aware tenancy and a clean national/expat data model, no GCC compliance control (Emiratisation, WPS, GOSI, immigration) can be computed correctly. Getting the foundation right prevents systemic mis-classification, removes manual spreadsheet workarounds across six markets, gives leadership an at-a-glance compliance-risk and workforce-localization baseline, and makes every later module audit-ready by default through a shared audit trail and alerting backbone.

## Requirements Covered (handbook sections)

- 1.1 Introduction
- 1.2 Overview of GCC Labour Markets
- 1.3 Common HR Challenges Across GCC
- 1.4 Regional Compliance Risks
- 1.5 Future of HR Compliance in the GCC
- 1.6 Digital Transformation in GCC HR

## Out of Scope

- Country-specific labour-law rule definitions and authority integrations (owned by EPIC-02).
- Module-level transactional processing (payroll runs, leave accrual, visa workflows) — those live in their respective epics.
- Detailed nationalization quota calculations (Emiratisation/Nitaqat) — only the data model hooks and baseline KPIs are built here.

## Dependencies

- —

## Epic Definition of Done

- [ ] A tenant can be configured with one or more GCC countries and one or more legal entities, each tagged to a country.
- [ ] Every employee record carries country of employment, nationality, and a derived national-vs-expat classification used platform-wide.
- [ ] A shared platform backbone (event bus topics, immutable audit trail, alert/notification service) is live and consumable by other modules.
- [ ] A workforce localization baseline (national % per entity/country) is computed and visible on an executive landscape dashboard.
- [ ] A configurable compliance-risk register seeded with the handbook's regional risk themes is available and surfaced on the dashboard.
- [ ] RBAC roles for all defined personas exist and gate access to landscape data and dashboards.
- [ ] A digital-maturity/automation baseline scorecard is captured per tenant to track transformation progress.

---

## User Stories

### EPIC-01-S01 — Multi-country, multi-entity tenancy model

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** to configure a tenant with multiple GCC countries and legal entities, **so that** every downstream compliance module knows which country's rules and authorities apply to each entity.

**Description**
AuraOS must support organisations operating across UAE, Saudi Arabia, Bahrain, Qatar, Oman and Kuwait simultaneously. This story builds the tenant → country → legal-entity hierarchy that anchors all later configuration, with each entity bound to exactly one GCC country and its relevant authority context.

**Acceptance Criteria**

- [ ] Given a tenant, when an admin adds a country, then only the six GCC countries (UAE, KSA, Bahrain, Qatar, Oman, Kuwait) are selectable.
- [ ] Given a country is enabled, when an admin creates a legal entity, then the entity must be assigned to one enabled country and inherits that country's ISO code, currency, and timezone defaults.
- [ ] Given a legal entity, when it is saved, then a unique entity registration reference (e.g., MOHRE establishment / Qiwa entity / LMRA / CR number placeholder) field is captured per country.
- [ ] Given a country is not enabled for a tenant, when any user tries to assign an employee to it, then the system blocks the action with a validation error.
- [ ] Given any create/update/disable of a country or entity, then the change is written to the audit trail with actor, timestamp, and before/after values.
- [ ] Given RBAC, when a non-System-Administrator attempts entity configuration, then access is denied.

**Tasks**

- [ ] Backend: `Tenant`, `Country` (iso_code, currency, timezone, enabled), `LegalEntity` (entity_id, tenant_id, country_id, legal_name, registration_ref, status) Prisma schema + migration.
- [ ] Backend: tenancy service enforcing country-scoping on all entity reads/writes; emit `entity.created`/`entity.updated` events.
- [ ] Frontend: admin "Countries & Entities" configuration screen with country picker and entity CRUD.
- [ ] Rules/Config: restrict country list to the six GCC states; default currency/timezone per country.
- [ ] Alerts/Workflow: notify System Administrator group on entity activation/deactivation.
- [ ] Tests: unit tests for country-scope enforcement; e2e for entity creation across two countries.

**Covers:** 1.1, 1.2
**Dependencies:** —

### EPIC-01-S02 — GCC labour-market reference dataset

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** a maintained reference dataset describing each GCC labour market, **so that** the platform and dashboards have authoritative context (currency, weekend pattern, authorities, expat-dependency profile) per country.

**Description**
Captures the descriptive market context from the handbook overview as structured, versioned reference data (not rules) so screens and reports can render country context consistently and the rule engine has a seed to extend.

**Acceptance Criteria**

- [ ] Given each GCC country, when reference data is loaded, then weekend pattern, statutory currency, primary labour authority, social-insurance authority, and nationalization programme name are present.
- [ ] Given a country profile, when displayed, then its expat-vs-national workforce dependency note and key market characteristics render read-only to business users.
- [ ] Given reference data changes, when saved, then a new version is stored and the previous version retained with effective dates.
- [ ] Given an unsupported country code, when referenced, then the system rejects it.
- [ ] Given any edit, then the audit trail records who changed which country attribute.

**Tasks**

- [ ] Backend: `CountryProfile` (country_id, weekend_pattern, labour_authority, social_insurance_authority, nationalization_programme, market_notes, version, effective_from) schema + migration.
- [ ] Backend: seed service populating all six GCC profiles; versioned read API.
- [ ] Frontend: read-only country-context panel reused by landscape dashboard.
- [ ] Rules/Config: seed data for MOHRE/Qiwa/GOSI/GPSSA/LMRA/SIO mapping per country.
- [ ] Tests: unit tests for versioning and seed integrity.

**Covers:** 1.2
**Dependencies:** EPIC-01-S01

### EPIC-01-S03 — National vs. expatriate workforce data model

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** every employee classified as a GCC national or expatriate per country of employment, **so that** nationalization, social-insurance, and immigration modules can branch correctly off a single source of truth.

**Description**
The single most reused dimension across GCC compliance is national vs. expat. This story adds nationality, country of employment, GCC-national flag, and a derived classification to the employee master so that EOSB, GOSI/GPSSA, Emiratisation/Nitaqat and immigration logic all read one consistent value.

**Acceptance Criteria**

- [ ] Given an employee, when their nationality and country of employment are set, then the system derives `workforce_class` ∈ {national, gcc_national_other, expat}.
- [ ] Given a UAE entity, when an Emirati is recorded, then the employee is flagged eligible for Emiratisation counting hooks (calculation owned by nationalization epic).
- [ ] Given an employee, when nationality is missing, then the record cannot be activated and a data-quality flag is raised.
- [ ] Given a classification change, then it is versioned with effective date and written to the audit trail.
- [ ] Given RBAC, when a Line Manager views an employee, then nationality/ID numbers are masked unless permitted.
- [ ] Given a GCC national working in another GCC state, then the cross-GCC social-insurance hook (e.g., GCC unified extension) is flagged for the social-insurance module.

**Tasks**

- [ ] Backend: extend `Employee` with nationality, country_of_employment, is_gcc_national, workforce_class (derived), classification_effective_from; migration.
- [ ] Backend: derivation service + `employee.classified` event for downstream modules.
- [ ] Frontend: employee personal-details section with masked sensitive fields.
- [ ] Rules/Config: GCC-national set and derivation matrix per country of employment.
- [ ] Alerts/Workflow: data-quality flag when mandatory classification fields are missing.
- [ ] Tests: unit tests for derivation across national/other-GCC/expat permutations.

**Covers:** 1.2, 1.3
**Dependencies:** EPIC-01-S01

### EPIC-01-S04 — Platform automation backbone (event bus, audit trail, alerts)

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 13
**As a** System Administrator, **I want** a shared event bus, immutable audit trail, and alert/notification service, **so that** every compliance module automates evidence capture and expiry/deadline alerting on a common backbone rather than re-implementing it.

**Description**
Realises the handbook's digital-transformation theme as concrete platform plumbing: domain events (e.g., visa expiry, salary delay), an append-only audit log, and a configurable alerting engine supporting tiered reminders (e.g., 60/30/7 days). All later epics depend on this.

**Acceptance Criteria**

- [ ] Given any module publishes a domain event, when consumed, then delivery is at-least-once and traceable by correlation id.
- [ ] Given any create/update/delete on a compliance entity, then an immutable audit record (actor, action, entity, before/after, timestamp, tenant, entity-country) is written and cannot be edited or deleted.
- [ ] Given a configurable alert rule, when a date threshold is crossed (e.g., 60/30/7 days before an expiry), then notifications fire to the configured persona/channel exactly once per threshold.
- [ ] Given an alert rule, when an admin configures thresholds and recipients, then they are validated and country/entity-scopable.
- [ ] Given the audit log, when queried, then it is filterable by entity, actor, country, and date range and exportable.
- [ ] Given RBAC, then only Internal Auditor and System Administrator roles can read the full cross-tenant audit log.

**Tasks**

- [ ] Backend: event-bus abstraction (Kafka/RabbitMQ) with topic registry and correlation ids.
- [ ] Backend: `AuditLog` append-only table + write interceptor; `AlertRule`, `AlertInstance` schema + scheduler.
- [ ] Backend: notification dispatch service (email/in-app) with idempotent per-threshold firing.
- [ ] Frontend: alert-rule configuration screen and audit-log viewer with filters/export.
- [ ] Rules/Config: default reminder ladders (e.g., 60/30/7 days) as reusable templates.
- [ ] Alerts/Workflow: dead-letter handling and retry for failed notifications.
- [ ] Tests: integration tests for event delivery, audit immutability, and threshold-once firing.

**Covers:** 1.6
**Dependencies:** EPIC-01-S01

### EPIC-01-S05 — RBAC role model for GCC HR personas

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As a** System Administrator, **I want** predefined RBAC roles for every HR persona scoped by country and entity, **so that** access to sensitive workforce and compliance data follows least-privilege from day one.

**Description**
Defines roles for HR Admin, HR Manager, Payroll Officer, PRO/Immigration Officer, Compliance Officer, Line Manager, Employee, Internal Auditor, Executive/Leadership and System Administrator, with permissions scopeable to specific countries and entities.

**Acceptance Criteria**

- [ ] Given the persona catalogue, when roles are seeded, then all ten personas exist with sensible default permission sets.
- [ ] Given a user, when assigned a role, then it can be constrained to one or more countries/entities.
- [ ] Given a Line Manager role, when accessing employees, then visibility is limited to their reporting line.
- [ ] Given an Employee (self-service) role, then access is limited to their own records.
- [ ] Given any role/permission change, then it is recorded in the audit trail.
- [ ] Given a Compliance Officer or Internal Auditor, then read access spans assigned countries without write rights to transactional data.

**Tasks**

- [ ] Backend: `Role`, `Permission`, `UserRoleAssignment` (with country/entity scope) schema + migration.
- [ ] Backend: authorization guard enforcing country/entity scoping on every protected resource.
- [ ] Frontend: role-assignment admin screen with scope selectors.
- [ ] Rules/Config: seed default permission matrices per persona.
- [ ] Tests: unit/e2e tests covering scope enforcement and self-service isolation.

**Covers:** 1.3
**Dependencies:** EPIC-01-S01

### EPIC-01-S06 — Common HR challenges as a configurable compliance-risk register

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** the handbook's common GCC HR challenges and regional compliance risks captured as a configurable risk register, **so that** the organisation can track, own, and mitigate them rather than discover them in an audit.

**Description**
Turns the descriptive "common challenges" and "regional compliance risks" sections into a structured, ownable register: each risk has a category (e.g., nationalization shortfall, WPS/salary delay, visa/permit expiry, document-retention gap), likelihood, impact, owner, mitigation, and status, scopeable per country.

**Acceptance Criteria**

- [ ] Given the register is seeded, when viewed, then it contains the handbook's regional risk themes (nationalization, wage protection, immigration validity, social insurance, record-keeping) as starter entries.
- [ ] Given a risk, when created/edited, then likelihood × impact produces a computed risk score and rating band.
- [ ] Given a risk, then it can be scoped to specific countries/entities and assigned an owner persona.
- [ ] Given a risk marked high/critical, then an alert is raised to the Compliance Officer and Executive roles.
- [ ] Given any change to a risk entry, then it is captured in the audit trail.
- [ ] Given RBAC, then only Compliance Officer/HR Manager/System Administrator may edit; Executives may view.

**Tasks**

- [ ] Backend: `RiskRegister` (risk_id, category, description, likelihood, impact, score, rating, owner_role, country_scope, mitigation, status) schema + migration.
- [ ] Backend: scoring service and high-risk event emitter.
- [ ] Frontend: risk register list + edit screen with computed score badge.
- [ ] Rules/Config: seed regional risk themes; configurable likelihood/impact scales and rating bands.
- [ ] Alerts/Workflow: notification on high/critical risk creation or status change.
- [ ] Tests: unit tests for scoring and seed coverage of regional risk themes.

**Covers:** 1.3, 1.4
**Dependencies:** EPIC-01-S04

### EPIC-01-S07 — Workforce localization & KPI baseline

**Labels:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**As an** Executive / Leadership, **I want** a baseline of workforce-localization and headcount KPIs per country and entity, **so that** leadership has a single starting measure of national-vs-expat mix and compliance posture before module-level detail exists.

**Description**
Builds the baseline KPI layer off the national/expat data model: national % per entity/country, expat headcount, total headcount, and placeholders for module KPIs (visa-expiry exposure, WPS status, social-insurance coverage) that later epics populate.

**Acceptance Criteria**

- [ ] Given employee data, when KPIs compute, then national %, expat count and total headcount are produced per entity and rolled up per country and tenant.
- [ ] Given a localization target is configured (e.g., a nationalization %), then the KPI shows actual vs. target with a RAG status.
- [ ] Given a country with no employees yet, then KPIs render zero/empty without error.
- [ ] Given KPIs, then they refresh on `employee.classified` events and on a scheduled recompute.
- [ ] Given RBAC, then Executives/Compliance see all assigned countries; Line Managers see only their scope.
- [ ] Given any KPI snapshot, then it is timestamped for trend tracking.

**Tasks**

- [ ] Backend: KPI aggregation service producing `WorkforceKpiSnapshot` per entity/country/date; migration.
- [ ] Backend: subscribe to classification events + scheduled recompute job.
- [ ] Frontend: KPI tiles (national %, headcount, target RAG) reused by the landscape dashboard.
- [ ] Rules/Config: configurable localization targets per country/entity.
- [ ] Tests: unit tests for aggregation/rollup and RAG thresholds.

**Covers:** 1.2, 1.3
**Dependencies:** EPIC-01-S03

### EPIC-01-S08 — GCC Employment Landscape executive dashboard

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership, **I want** a single landscape dashboard combining country context, workforce mix, and top compliance risks, **so that** I can see our GCC footprint and compliance posture at a glance.

**Description**
Composes S02 country context, S07 KPIs, and S06 risk register into one executive view with country switcher and entity drill-down, giving the "big picture" the handbook's introduction sets up.

**Acceptance Criteria**

- [ ] Given the dashboard, when opened, then it shows enabled countries, headcount, national % vs. target, and the top compliance risks per country.
- [ ] Given a country/entity selector, when changed, then all widgets re-scope accordingly.
- [ ] Given a high/critical risk exists, then it is highlighted with its rating.
- [ ] Given no data for a country, then widgets degrade gracefully.
- [ ] Given RBAC, then a user only sees countries/entities within their scope.
- [ ] Given a dashboard view, then it is exportable (PDF) for board reporting.

**Tasks**

- [ ] Backend: dashboard aggregation endpoint composing KPI, risk, and country-profile data.
- [ ] Frontend: landscape dashboard page with country switcher, KPI tiles, risk panel, export.
- [ ] Rules/Config: country/entity scoping applied to all widgets.
- [ ] Alerts/Workflow: deep-link from highlighted risks to the risk register.
- [ ] Tests: e2e for scoping, drill-down, and export.

**Covers:** 1.1, 1.2, 1.4
**Dependencies:** EPIC-01-S06, EPIC-01-S07

### EPIC-01-S09 — Digital maturity & automation baseline scorecard

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** a digital-maturity scorecard tracking how much of HR compliance is automated vs. manual, **so that** we can measure and prioritise the digital-transformation journey the handbook anticipates.

**Description**
Captures the "future of HR compliance" and "digital transformation" themes as a measurable baseline: per compliance domain (payroll, WPS, social insurance, nationalization, immigration, records), record automation level and target, producing an overall maturity index.

**Acceptance Criteria**

- [ ] Given the scorecard, when configured, then each compliance domain has a current automation level and target.
- [ ] Given levels are set, then an overall maturity index and per-domain gap are computed.
- [ ] Given a domain below target, then it is flagged as an improvement priority.
- [ ] Given periodic updates, then prior scores are retained to show progress over time.
- [ ] Given RBAC, then Compliance Officer/Executive can view; only Compliance Officer/System Administrator can edit.
- [ ] Given any edit, then it is recorded in the audit trail.

**Tasks**

- [ ] Backend: `DigitalMaturity` (domain, current_level, target_level, period, index) schema + migration.
- [ ] Backend: index/gap computation service with historical snapshots.
- [ ] Frontend: maturity scorecard screen with per-domain bars and trend.
- [ ] Rules/Config: configurable domains and maturity scale.
- [ ] Tests: unit tests for index/gap computation and history retention.

**Covers:** 1.5, 1.6
**Dependencies:** EPIC-01-S04
