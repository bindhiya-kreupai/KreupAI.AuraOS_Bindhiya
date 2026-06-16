# EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 34 – HRMS Configuration for GCC Compliance
> **Module:** platform · **Labels:** `epic`, `gcc-compliance`, `platform`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver the AuraOS configuration backbone that makes every GCC compliance module country-correct without code changes: a versioned country rule engine, legal-entity and master-data configuration, and per-domain configuration surfaces (contract, payroll, WPS/Mudad, social insurance, nationalization, immigration, leave, attendance/overtime, benefits, accommodation, HSE, ER/disciplinary, separation, EOSB formula engine, documents). It also provides the cross-cutting platform configuration — approval workflows, alerts, audit trail, RBAC, integrations, data migration — plus the implementation checklist, configuration control sheet and go-live certification that govern a compliant rollout.

## Business Value

Turns AuraOS into a single configurable platform where UAE, KSA, Bahrain, Qatar, Oman and Kuwait rules are data, not bespoke builds — cutting implementation time and error, guaranteeing that statutory thresholds (WPS windows, GOSI/GPSSA/SIO rates, EOSB formulas, Emiratisation/Nitaqat targets, visa-expiry alerts) are applied consistently. Versioned config plus a full audit trail give regulators and auditors proof of _which_ rule applied _when_, and the go-live certification prevents launching an entity with incomplete or unvalidated compliance configuration.

## Requirements Covered (handbook sections)

- 34.1 Introduction
- 34.2 Objectives of GCC HRMS Configuration
- 34.3 HRMS Compliance Architecture
- 34.4 Country Rule Engine
- 34.5 Legal Entity Configuration
- 34.6 Employee Master Data Configuration
- 34.7 Position and Organization Configuration
- 34.8 Contract Management Configuration
- 34.9 Payroll Configuration
- 34.10 WPS and Mudad File Configuration
- 34.11 Social Insurance Configuration
- 34.12 Nationalization Configuration
- 34.13 Immigration Configuration
- 34.14 Leave Configuration
- 34.15 Attendance and Overtime Configuration
- 34.16 Benefits Configuration
- 34.17 Accommodation Configuration
- 34.18 HSE Configuration
- 34.19 Employee Relations and Disciplinary Configuration
- 34.20 Separation and Final Settlement Configuration
- 34.21 EOSB Formula Engine
- 34.22 Document Management Configuration
- 34.23 Approval Workflow Configuration
- 34.24 Alerts and Notifications
- 34.25 Audit Trail Configuration
- 34.26 Role-Based Access Control
- 34.27 Data Integration Configuration
- 34.28 Data Migration for GCC HRMS Implementation
- 34.29 Implementation Checklist
- 34.30 HRMS Compliance KPIs
- 34.31 HRMS Configuration Risk Matrix
- 34.32 Sample HRMS Configuration Control Sheet
- 34.33 Sample HRMS Go-Live Certification
- 34.34 Key Takeaways

## Out of Scope

- Operational execution of each domain (running payroll, submitting WPS, processing visas) — owned by EPIC-07/10/11/13–18/19–29; this epic configures the rules those modules consume.
- Authority portal credential onboarding and live API certification beyond defining the integration adapter contract.
- Tenant infrastructure provisioning, hosting and DR (covered by platform engineering, not compliance config).
- Building the country labour-law content library itself (authored in EPIC-36; consumed here as rule packs).

## Dependencies

- EPIC-02 (Regulatory Framework / Country Rule Engine seed) · EPIC-36 (GCC Country Rule Config packs) · feeds all domain epics (EPIC-07–EPIC-33)

## Epic Definition of Done

- [ ] Versioned country rule engine resolves the correct rule set per legal entity/country/effective date with no code change.
- [ ] Every domain (contract, payroll, WPS, social insurance, nationalization, immigration, leave, attendance/OT, benefits, accommodation, HSE, ER, separation, EOSB, documents) has a configuration surface validated against country rules.
- [ ] Cross-cutting config — approval workflows, alerts, audit trail, RBAC, integrations — is operational and tenant-scoped.
- [ ] Data migration tooling loads, validates and reconciles legacy master data with an error/rejection report.
- [ ] Implementation checklist, configuration control sheet and HR data dictionary are live and enforced as go-live gates.
- [ ] HRMS configuration KPIs and risk matrix are published; go-live certification cannot be issued with open critical gaps.
- [ ] All configuration changes are versioned, attributable and audit-logged with effective dating.

---

## User Stories

### EPIC-34-S01 — Configuration objectives & compliance architecture baseline

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 3
**As a** System Administrator, **I want** a documented configuration architecture and objectives model in AuraOS, **so that** every compliance module configures against a single, consistent layered design.
**Description**
Establish the HRMS compliance configuration foundation: the layered architecture (country rule engine → legal entity → domain config → workflow/alerts/audit/RBAC), configuration objects registry, environment model (config vs runtime), and the principle that all statutory behaviour is data-driven and effective-dated. This frames every later configuration story.

**Acceptance Criteria**

- [ ] Given the platform, when reviewed, then the configuration architecture layers and their resolution order are documented and represented as a config-object registry.
- [ ] Given any compliance behaviour, when implemented, then it must resolve from configuration (rule engine/legal entity/domain config), never hard-coded country logic.
- [ ] Given a configuration object, when created, then it carries owner, scope (global/country/entity), effective date and version.
- [ ] Given the architecture, when changed, then the change is versioned and audit-logged.

**Tasks**

- [ ] Backend: `config_object_registry` and `config_scope` schemas (scope, owner, effective_from, version)
- [ ] Backend: configuration-resolution order service (global → country → entity → domain)
- [ ] Frontend: configuration architecture / object-registry overview screen
- [ ] Rules/Config: enumerate configuration domains and ownership
- [ ] Tests: unit tests for scope resolution precedence

**Covers:** 34.1, 34.2, 34.3
**Dependencies:** EPIC-02

### EPIC-34-S02 — Country rule engine (versioned, effective-dated)

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 13
**As a** Compliance Officer, **I want** a versioned country rule engine, **so that** the correct GCC statutory rule set is applied per entity, country and date without code changes.
**Description**
Build the core rule engine that stores per-country rule packs (thresholds, formulas, windows, mandatory fields, authority references) as versioned, effective-dated records and resolves the applicable rule for any transaction by country + legal entity + effective date. Supports rule overrides, future-dated rule changes, and a simulation/preview mode.

**Acceptance Criteria**

- [ ] Given a transaction with country and date, when evaluated, then the engine returns the rule version effective on that date for UAE/KSA/BH/QA/OM/KW.
- [ ] Given a future statutory change, when configured with a future effective date, then it activates automatically on that date and prior transactions still resolve to the old version.
- [ ] Given a rule change, when published, then it is versioned, attributable and audit-logged, and previous versions remain queryable.
- [ ] Given a draft rule, when simulated, then the engine previews impact without affecting live resolution.
- [ ] Given an entity override, when set, then it takes precedence over the country default per the resolution order.

**Tasks**

- [ ] Backend: `country_rule_pack`, `rule`, `rule_version` schemas (country, domain, key, value/formula, effective_from/to)
- [ ] Backend: rule-resolution service with effective-dating and override precedence
- [ ] Backend: rule simulation/preview endpoint
- [ ] Frontend: rule-pack editor with version history and effective-date scheduling
- [ ] Rules/Config: seed UAE/KSA/BH/QA/OM/KW rule pack skeletons
- [ ] Tests: unit + integration tests for effective-dated resolution and override precedence

**Covers:** 34.4
**Dependencies:** EPIC-34-S01, EPIC-36

### EPIC-34-S03 — Legal entity configuration

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** to configure legal entities with their country, registrations and authority identifiers, **so that** every entity inherits the correct compliance rules and reporting identities.
**Description**
Configure each legal entity with country, establishment/labour registrations and authority identifiers (MOHRE/MOL establishment, Qiwa/Mudad, GOSI/GPSSA/SIO/LMRA, WPS employer IDs, trade licence), calendar, currency and the rule-pack binding that drives all downstream compliance behaviour for that entity.

**Acceptance Criteria**

- [ ] Given a new legal entity, when created, then its country, registrations and authority IDs are captured and the matching country rule pack is bound.
- [ ] Given authority IDs, when entered, then country-specific format validation is enforced (e.g., GOSI establishment, Qiwa unified number, MOHRE establishment card).
- [ ] Given an entity, when activated, then mandatory registrations for its country must be present or activation is blocked.
- [ ] Given any entity-config change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `legal_entity` schema (country, trade_licence, authority_ids[], currency, calendar, rule_pack_id)
- [ ] Backend: authority-ID validation service per country
- [ ] Frontend: legal-entity configuration screen with registration completeness indicator
- [ ] Rules/Config: mandatory-registration matrix per country
- [ ] Tests: integration tests for activation gating on missing registrations

**Covers:** 34.5
**Dependencies:** EPIC-34-S02

### EPIC-34-S04 — Employee master data configuration & HR data dictionary

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** configurable employee master-data fields governed by a central HR data dictionary, **so that** every entity captures the right country-mandated attributes with consistent definitions.
**Description**
Configure the employee master-data model — field catalogue, data types, mandatory/optional by country and employee category, validation rules (Emirates ID, Iqama, CPR, QID, IBAN, passport), and the governing **HR Data Dictionary/glossary** that defines every field, code list and term as the single configuration reference for the platform. The dictionary is the canonical source for field meaning, allowed values and country applicability.

**Acceptance Criteria**

- [ ] Given the master-data catalogue, when configured, then each field has a data-dictionary definition (name, meaning, type, allowed values, country applicability, sensitivity).
- [ ] Given a country/employee category, when selected, then mandatory fields (e.g., Emirates ID for UAE, Iqama for KSA, CPR for Bahrain, QID for Qatar) are enforced.
- [ ] Given an ID field, when entered, then format/checksum validation per country is applied.
- [ ] Given the data dictionary, when browsed, then any field/code list/term resolves to its definition and is exportable as a reference.
- [ ] Given a dictionary or field change, when published, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `master_data_field`, `code_list`, `data_dictionary_term` schemas with country applicability and sensitivity tags
- [ ] Backend: country ID-format validators (Emirates ID, Iqama, CPR, QID, IBAN, passport)
- [ ] Frontend: master-data configuration screen + searchable HR data dictionary/glossary
- [ ] Rules/Config: mandatory-field-by-country/category matrix
- [ ] Tests: unit tests for ID validation and mandatory-field enforcement

**Covers:** 34.6
**Dependencies:** EPIC-34-S02, EPIC-34-S03

### EPIC-34-S05 — Position & organization configuration

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** to configure organization structure, positions, grades and occupation mappings, **so that** headcount, nationalization and immigration logic operate on a controlled structure.
**Description**
Configure legal-entity org hierarchy, business units/departments, cost centres, position catalogue with position control, grades/salary bands, and the occupation/job-classification code mappings (MOHRE occupation codes, Qiwa professions) that feed nationalization counting and immigration eligibility.

**Acceptance Criteria**

- [ ] Given an entity, when configured, then its org hierarchy, departments, cost centres, positions and grades are defined with position-control rules.
- [ ] Given a position, when created, then it maps to an authority occupation/profession code used by nationalization and immigration.
- [ ] Given position control, when enabled, then headcount cannot exceed approved positions without override.
- [ ] Given any structure change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `org_unit`, `position`, `grade`, `occupation_mapping` schemas
- [ ] Backend: position-control enforcement service
- [ ] Frontend: organization & position configuration screens
- [ ] Rules/Config: occupation/profession code lists per country
- [ ] Tests: integration tests for position-control gating

**Covers:** 34.7
**Dependencies:** EPIC-34-S03

### EPIC-34-S06 — Contract management configuration

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** to configure contract types, clauses and limits per country, **so that** employment contracts comply with each GCC labour law.
**Description**
Configure contract types (limited/unlimited or fixed-term as permitted by country), probation limits, notice-period rules, working-hour caps, renewal rules and mandatory clauses, with country constraints (e.g., UAE fixed-term-only post-2022, KSA Qiwa contract requirements) sourced from the rule engine.

**Acceptance Criteria**

- [ ] Given a country, when contract types are configured, then only legally valid types are offered (e.g., UAE fixed-term, KSA Qiwa-registered).
- [ ] Given probation/notice config, when set, then values cannot exceed the country statutory maximum.
- [ ] Given a contract template, when configured, then mandatory clauses for the country are enforced as present.
- [ ] Given any contract-config change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `contract_type`, `contract_clause`, `contract_rule` schemas bound to rule engine
- [ ] Backend: statutory-limit validation (probation/notice/working hours)
- [ ] Frontend: contract configuration screen with country constraints
- [ ] Rules/Config: per-country contract-type and clause rules
- [ ] Tests: unit tests for statutory-limit enforcement

**Covers:** 34.8
**Dependencies:** EPIC-34-S02

### EPIC-34-S07 — Payroll configuration

**Labels:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** to configure pay components, calendars, proration and statutory deductions per entity, **so that** payroll runs are country-correct and controlled.
**Description**
Configure earnings/deduction components, eligibility and taxability/contribution flags, payroll calendars and cut-offs, proration methods, rounding, GL mapping and maker-checker thresholds — all bound to country rules so statutory deductions (GOSI/GPSSA/SIO) and pay structures comply per entity.

**Acceptance Criteria**

- [ ] Given an entity, when payroll is configured, then pay components, calendar, cut-off, proration and rounding are defined per country.
- [ ] Given a statutory component, when configured, then its base and rate derive from the country rule engine, not free entry.
- [ ] Given maker-checker config, when set, then preparer ≠ approver is enforced and lock requires all mandatory inputs.
- [ ] Given any payroll-config change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `pay_component`, `payroll_calendar`, `proration_rule`, `gl_mapping` schemas
- [ ] Backend: statutory-base resolution from rule engine
- [ ] Frontend: payroll configuration workspace
- [ ] Rules/Config: country statutory deduction bases and rounding rules
- [ ] Alerts/Workflow: maker-checker threshold configuration
- [ ] Tests: integration tests for statutory-base resolution and maker-checker gating

**Covers:** 34.9
**Dependencies:** EPIC-34-S02, EPIC-34-S03

### EPIC-34-S08 — WPS & Mudad file configuration

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** to configure WPS/Mudad file formats, windows and bank-agent details per entity, **so that** wage files generate correctly and on time.
**Description**
Configure each entity's WPS/Mudad parameters: file format/layout (UAE SIF, Saudi Mudad, Qatar WPS, Bahrain/Oman/Kuwait controls), employer/establishment IDs, bank-agent/routing, statutory submission window, and validation/control thresholds (e.g., salary-delay flag > statutory window) consumed by the WPS module.

**Acceptance Criteria**

- [ ] Given an entity, when WPS is configured, then its country file layout, employer IDs and bank-agent details are captured.
- [ ] Given statutory timing, when configured, then the submission window and salary-delay threshold (e.g., > 15 days UAE) are set from the rule engine.
- [ ] Given a configuration, when activated, then it is validated against the country's mandatory WPS field set.
- [ ] Given any WPS-config change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `wps_config` schema (layout, employer_id, bank_agent, window_days, delay_threshold)
- [ ] Backend: WPS-config validation against country mandatory fields
- [ ] Frontend: WPS/Mudad configuration screen
- [ ] Rules/Config: per-country WPS layout and window rules
- [ ] Tests: unit tests for WPS-config validation

**Covers:** 34.10
**Dependencies:** EPIC-34-S02, EPIC-34-S07

### EPIC-34-S09 — Social insurance configuration

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** to configure GOSI/GPSSA/SIO contribution rules per entity and nationality, **so that** social-insurance deductions are calculated correctly.
**Description**
Configure social-insurance schemes by country and nationality (GOSI KSA, GPSSA UAE nationals, SIO Bahrain, plus Qatar/Oman/Kuwait equivalents): contribution wage definition, employer/employee rates, caps/floors, branch applicability (e.g., occupational hazard), and registration mapping, all bound to the rule engine.

**Acceptance Criteria**

- [ ] Given country + nationality, when configured, then the applicable scheme, contribution wage and employer/employee rates resolve from the rule engine.
- [ ] Given caps/floors, when set, then the contribution wage is clamped accordingly.
- [ ] Given an entity, when activated, then social-insurance registration IDs must be present for the relevant scheme.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `social_insurance_scheme`, `contribution_rule` schemas (country, nationality, base, rates, cap/floor)
- [ ] Backend: scheme-resolution service by country + nationality
- [ ] Frontend: social-insurance configuration screen
- [ ] Rules/Config: GOSI/GPSSA/SIO/QA/OM/KW rates and bases
- [ ] Tests: unit tests for rate/cap resolution by nationality

**Covers:** 34.11
**Dependencies:** EPIC-34-S02, EPIC-34-S07

### EPIC-34-S10 — Nationalization configuration

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** to configure nationalization targets, counting rules and bands per entity, **so that** Emiratisation/Nitaqat/Bahrainization/Omanisation compliance is computed correctly.
**Description**
Configure nationalization parameters: applicable scheme by country and entity size/sector, counting rules (who counts, weighting, genuine-employment criteria), target percentages/points, Nitaqat band thresholds, and checkpoint cadence — consumed by the nationalization modules.

**Acceptance Criteria**

- [ ] Given an entity, when configured, then the applicable scheme (Emiratisation/Nitaqat/Bahrainization/Omanisation) and its targets/bands resolve from the rule engine by size/sector.
- [ ] Given counting rules, when set, then eligibility/weighting and genuine-employment criteria are defined.
- [ ] Given thresholds, when configured, then green/compliant vs at-risk bands are derived automatically.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `nationalization_config`, `target_band` schemas
- [ ] Backend: scheme/target resolution by size and sector
- [ ] Frontend: nationalization configuration screen
- [ ] Rules/Config: per-country target/band/counting rules
- [ ] Tests: unit tests for band derivation and counting eligibility

**Covers:** 34.12
**Dependencies:** EPIC-34-S02, EPIC-34-S05

### EPIC-34-S11 — Immigration configuration

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As a** PRO / Immigration Officer, **I want** to configure visa/permit document types, validity rules and expiry-alert thresholds per country, **so that** immigration compliance and renewals are driven by configuration.
**Description**
Configure immigration document types (visa, work permit, Iqama, CPR, QID, residence, labour card), validity rules, occupation/quota linkage, grace periods, and renewal/expiry alert thresholds (e.g., 60/30/7 days before expiry) consumed by the immigration modules.

**Acceptance Criteria**

- [ ] Given a country, when configured, then its immigration document types, validity rules and grace periods are defined.
- [ ] Given expiry alerts, when configured, then thresholds (e.g., 60/30/7 days before visa/permit expiry) are set per document type.
- [ ] Given a document type, when configured, then mandatory linkage to occupation/quota is enforced where the country requires it.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `immigration_doc_type`, `validity_rule`, `expiry_alert_config` schemas
- [ ] Backend: alert-threshold resolution per document type
- [ ] Frontend: immigration configuration screen
- [ ] Rules/Config: per-country document types and grace periods
- [ ] Alerts/Workflow: expiry-alert threshold configuration
- [ ] Tests: unit tests for alert-threshold derivation

**Covers:** 34.13
**Dependencies:** EPIC-34-S02

### EPIC-34-S12 — Leave configuration

**Labels:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** to configure leave types, entitlements, accrual and encashment rules per country, **so that** leave complies with each GCC labour law.
**Description**
Configure leave types (annual, sick with tiered pay, maternity, paternity, Hajj, bereavement, unpaid), entitlement and accrual rules, carry-forward caps, encashment basis, and leave-salary treatment — bound to country rules (e.g., UAE 30 days annual, tiered sick pay).

**Acceptance Criteria**

- [ ] Given a country, when leave is configured, then statutory types and entitlements (e.g., annual days, tiered sick pay) resolve from the rule engine.
- [ ] Given accrual/carry-forward, when set, then methods and caps are enforced and cannot violate statutory minima.
- [ ] Given encashment, when configured, then the salary basis and eligibility are defined per country.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `leave_type`, `accrual_rule`, `encashment_rule` schemas
- [ ] Backend: statutory-minimum validation
- [ ] Frontend: leave configuration screen
- [ ] Rules/Config: per-country leave entitlement/accrual rules
- [ ] Tests: unit tests for statutory-minimum enforcement

**Covers:** 34.14
**Dependencies:** EPIC-34-S02

### EPIC-34-S13 — Attendance & overtime configuration

**Labels:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** to configure work schedules, attendance rules and overtime multipliers per country, **so that** time and overtime comply with GCC working-hour law.
**Description**
Configure shifts/work schedules, working-hour caps, Ramadan reduced hours, late/missing-punch rules, regularization, and overtime types/multipliers (normal/rest-day/public-holiday rates per country) plus daily/weekly OT caps — consumed by attendance and overtime modules.

**Acceptance Criteria**

- [ ] Given a country, when configured, then working-hour caps, Ramadan hours and overtime multipliers resolve from the rule engine.
- [ ] Given overtime rules, when set, then rest-day and public-holiday rates are differentiated per country statute.
- [ ] Given caps, when configured, then daily/weekly OT limits and breach flags are enforced.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `work_schedule`, `attendance_rule`, `overtime_rule` schemas
- [ ] Backend: overtime-multiplier resolution per type/country
- [ ] Frontend: attendance & overtime configuration screen
- [ ] Rules/Config: per-country hours/Ramadan/OT multiplier rules
- [ ] Tests: unit tests for OT-rate and cap resolution

**Covers:** 34.15
**Dependencies:** EPIC-34-S02

### EPIC-34-S14 — Benefits configuration

**Labels:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** to configure benefit plans, eligibility and statutory minimums per entity, **so that** benefits administration is compliant and consistent.
**Description**
Configure benefit catalogue (medical insurance, life/PA, air ticket, housing, transport, education, loans) with eligibility by grade/category/country, statutory-minimum flags (e.g., mandatory medical cover), payroll linkage and EOSB interaction.

**Acceptance Criteria**

- [ ] Given an entity, when benefits are configured, then plans, eligibility and statutory-minimum flags are defined per country.
- [ ] Given a mandatory benefit (e.g., medical insurance), when an eligible employee lacks it, then a compliance flag is raised.
- [ ] Given payroll linkage, when configured, then benefit values map to pay components/EOSB basis correctly.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `benefit_plan`, `eligibility_rule` schemas
- [ ] Backend: statutory-minimum compliance flagging
- [ ] Frontend: benefits configuration screen
- [ ] Rules/Config: per-country mandatory-benefit rules
- [ ] Tests: unit tests for eligibility and mandatory-cover flags

**Covers:** 34.16
**Dependencies:** EPIC-34-S02, EPIC-34-S07

### EPIC-34-S15 — Accommodation configuration

**Labels:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** to configure accommodation types, occupancy and welfare standards per country, **so that** labour-camp compliance is enforced by configuration.
**Description**
Configure accommodation master setup: property/room/bed structure, occupancy limits, welfare/sanitation/fire-safety standards, eligibility, inspection cadence and cost-allocation rules consumed by the accommodation module.

**Acceptance Criteria**

- [ ] Given an entity, when configured, then accommodation types, occupancy limits and welfare standards resolve per country.
- [ ] Given occupancy, when configured, then max-per-room limits and breach flags are enforced.
- [ ] Given inspection cadence, when set, then scheduling parameters feed the accommodation calendar.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `accommodation_config`, `occupancy_rule` schemas
- [ ] Backend: occupancy-limit enforcement
- [ ] Frontend: accommodation configuration screen
- [ ] Rules/Config: per-country welfare/occupancy standards
- [ ] Tests: unit tests for occupancy-limit flags

**Covers:** 34.17
**Dependencies:** EPIC-34-S02

### EPIC-34-S16 — HSE configuration

**Labels:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** to configure HSE controls, heat-stress and incident parameters per country, **so that** health and safety compliance is driven by configuration.
**Description**
Configure HSE parameters: risk-assessment categories, heat-stress/midday-break rules (e.g., summer working-hour bans), PPE requirements, permit-to-work types, incident classification and reporting thresholds consumed by the HSE module.

**Acceptance Criteria**

- [ ] Given a country, when configured, then heat-stress/midday-break windows and PPE/permit requirements resolve from the rule engine.
- [ ] Given incident classification, when configured, then severity tiers and reporting thresholds are defined.
- [ ] Given the midday-break rule, when active in season, then it drives attendance/scheduling flags.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `hse_config`, `incident_classification` schemas
- [ ] Backend: heat-stress/midday-break rule resolution
- [ ] Frontend: HSE configuration screen
- [ ] Rules/Config: per-country heat-stress/PPE/permit rules
- [ ] Tests: unit tests for seasonal midday-break resolution

**Covers:** 34.18
**Dependencies:** EPIC-34-S02

### EPIC-34-S17 — Employee relations & disciplinary configuration

**Labels:** `user-story`, `employee-relations` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** to configure grievance and disciplinary frameworks per country, **so that** ER processes follow lawful, consistent rules.
**Description**
Configure grievance categories/SLAs and the disciplinary framework: misconduct classification, penalty matrix, hearing requirements, suspension and salary-deduction limits (country-capped), and appeal timelines consumed by the ER/disciplinary module.

**Acceptance Criteria**

- [ ] Given a country, when configured, then the penalty matrix and salary-deduction caps resolve from the rule engine.
- [ ] Given grievance categories, when set, then SLAs and escalation tiers are defined.
- [ ] Given a disciplinary penalty, when configured, then it cannot exceed the country statutory deduction limit.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `grievance_config`, `disciplinary_matrix` schemas
- [ ] Backend: salary-deduction-cap validation
- [ ] Frontend: ER & disciplinary configuration screen
- [ ] Rules/Config: per-country penalty matrix and deduction caps
- [ ] Tests: unit tests for deduction-cap enforcement

**Covers:** 34.19
**Dependencies:** EPIC-34-S02

### EPIC-34-S18 — Separation & final settlement configuration

**Labels:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**As an** HR Admin, **I want** to configure separation types, notice rules and final-settlement components per country, **so that** exits are processed compliantly.
**Description**
Configure separation types (resignation, termination, redundancy, non-renewal, absconding, death-in-service), notice-period and garden-leave rules, exit-clearance checklist templates, and final-settlement component set (EOSB, leave encashment, deductions, recoveries) bound to country rules.

**Acceptance Criteria**

- [ ] Given a country, when configured, then separation types, notice rules and final-settlement components resolve from the rule engine.
- [ ] Given a separation type, when configured, then its EOSB eligibility/penalty rules (e.g., resignation vs termination) are defined.
- [ ] Given exit clearance, when configured, then the mandatory checklist template is enforced before settlement.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `separation_config`, `final_settlement_component` schemas
- [ ] Backend: settlement-component resolution by separation type
- [ ] Frontend: separation configuration screen
- [ ] Rules/Config: per-country separation and settlement rules
- [ ] Tests: unit tests for component resolution by separation type

**Covers:** 34.20
**Dependencies:** EPIC-34-S02

### EPIC-34-S19 — EOSB formula engine

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** a configurable EOSB formula engine, **so that** gratuity/end-of-service amounts compute correctly per country and separation type.
**Description**
Build the EOSB formula engine that holds per-country gratuity formulas as configurable rules — service-band day rates, salary basis, resignation-vs-termination factors, unpaid-leave exclusion, caps — and computes EOSB deterministically (e.g., UAE: 21 days/yr for first 5 years then 30 days/yr; KSA, Bahrain, Qatar, Oman, Kuwait variants) with a traceable calculation breakdown.

**Acceptance Criteria**

- [ ] Given country, service period, salary basis and separation type, when computed, then EOSB returns the correct amount with a step-by-step breakdown.
- [ ] Given UAE, when computed, then the engine applies 21 days/yr for the first 5 years and 30 days/yr thereafter, with resignation reductions where applicable.
- [ ] Given unpaid leave, when present, then it is excluded from service per the country rule.
- [ ] Given a formula change, when published with an effective date, then prior settlements remain on the old formula and new ones use the new version.
- [ ] Given any computation, when run, then inputs, formula version and result are audit-logged.

**Tasks**

- [ ] Backend: `eosb_formula`, `eosb_calculation` schemas (service bands, day rate, salary basis, factors, caps)
- [ ] Backend: deterministic EOSB calculation engine with breakdown trace and effective-dating
- [ ] Frontend: EOSB formula editor + calculation preview
- [ ] Rules/Config: per-country EOSB formulas (UAE/KSA/BH/QA/OM/KW)
- [ ] Tests: unit tests per country (e.g., UAE 21/30-day bands, resignation reductions, unpaid-leave exclusion)

**Covers:** 34.21
**Dependencies:** EPIC-34-S02, EPIC-34-S18

### EPIC-34-S20 — Document management configuration

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 3
**As an** HR Admin, **I want** to configure document types, mandatory matrices and retention rules per country, **so that** the document store enforces compliant filing and retention.
**Description**
Configure document taxonomy, mandatory-document matrix by employee category/country, expiry tracking, retention schedules, litigation-hold flags and disposal rules consumed by the document store.

**Acceptance Criteria**

- [ ] Given a country/category, when configured, then the mandatory-document matrix and retention periods resolve from the rule engine.
- [ ] Given an expiring document type, when configured, then expiry-alert thresholds are set.
- [ ] Given retention, when configured, then disposal is blocked while a litigation hold is active.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `document_type`, `retention_rule`, `mandatory_doc_matrix` schemas
- [ ] Backend: retention/disposal and litigation-hold logic
- [ ] Frontend: document configuration screen
- [ ] Rules/Config: per-country retention schedules and mandatory matrix
- [ ] Tests: unit tests for retention/hold enforcement

**Covers:** 34.22
**Dependencies:** EPIC-34-S02

### EPIC-34-S21 — Approval workflow configuration

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As a** System Administrator, **I want** a configurable approval-workflow engine, **so that** every compliance process routes through the correct, auditable approvals.
**Description**
Configure approval workflows per process and entity: multi-step routing, maker-checker (preparer ≠ approver), delegation-of-authority limits, parallel/sequential steps, conditional routing by amount/country, escalation and SLA — consumed by all domain modules.

**Acceptance Criteria**

- [ ] Given a process, when a workflow is configured, then steps, approvers, conditions and SLAs are defined per entity.
- [ ] Given maker-checker, when enforced, then the preparer cannot approve their own transaction.
- [ ] Given DoA limits, when configured, then routing escalates beyond an approver's authority threshold.
- [ ] Given any workflow change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `workflow_definition`, `workflow_step`, `doa_limit` schemas + routing engine
- [ ] Backend: maker-checker and conditional-routing logic
- [ ] Frontend: workflow builder UI
- [ ] Rules/Config: per-process/entity routing and DoA limits
- [ ] Alerts/Workflow: SLA escalation configuration
- [ ] Tests: integration tests for maker-checker and DoA escalation

**Covers:** 34.23
**Dependencies:** EPIC-34-S01

### EPIC-34-S22 — Alerts & notifications configuration

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** to configure compliance alerts and notification channels, **so that** statutory deadlines and breaches are surfaced proactively.
**Description**
Configure alert rules (trigger condition, threshold, recipients, channel, frequency) for compliance events — visa/permit expiry (60/30/7 days), WPS/payroll deadlines, salary delay > window, contribution-filing due, nationalization at-risk — with escalation tiers and digest options.

**Acceptance Criteria**

- [ ] Given an alert rule, when configured, then trigger condition, threshold, recipients and channel are defined.
- [ ] Given expiry alerts, when configured, then tiered thresholds (e.g., 60/30/7 days) fire to the right roles.
- [ ] Given a breach, when detected, then escalation to management occurs per configured tier.
- [ ] Given any alert-config change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `alert_rule`, `notification_channel` schemas + dispatch service
- [ ] Backend: tiered-threshold and escalation engine
- [ ] Frontend: alerts/notifications configuration screen
- [ ] Rules/Config: default compliance alert thresholds
- [ ] Tests: integration tests for tiered firing and escalation

**Covers:** 34.24
**Dependencies:** EPIC-34-S01

### EPIC-34-S23 — Audit trail configuration

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable, tamper-evident audit trail, **so that** every compliance-relevant change is captured for regulators and auditors.
**Description**
Configure the audit-trail framework: which entities/fields are audited, before/after values, actor, timestamp, reason, immutability/tamper-evidence, retention, and queryable audit views — applied platform-wide including config changes themselves.

**Acceptance Criteria**

- [ ] Given an audited action, when performed, then actor, timestamp, before/after values and reason are captured immutably.
- [ ] Given audit scope, when configured, then sensitive/statutory fields are always audited and cannot be excluded.
- [ ] Given an auditor, when querying, then they can filter audit records by entity, user, date and change type.
- [ ] Given configuration changes, when made, then they are themselves audited.

**Tasks**

- [ ] Backend: `audit_log` schema with before/after, actor, reason + tamper-evidence (hash chain)
- [ ] Backend: audit-scope configuration and enforcement
- [ ] Frontend: audit-trail query/viewer screen
- [ ] Rules/Config: mandatory-audit field set
- [ ] Tests: integration tests for immutability and mandatory-scope capture

**Covers:** 34.25
**Dependencies:** EPIC-34-S01

### EPIC-34-S24 — Role-based access control configuration

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As a** System Administrator, **I want** to configure RBAC with roles, permissions and data scoping, **so that** users see and act only within their authorized entities and data.
**Description**
Configure RBAC: role catalogue, granular permissions, entity/country/department data scoping, segregation-of-duties rules, sensitive-data masking, and access-review cadence — applied across all modules and dashboards.

**Acceptance Criteria**

- [ ] Given a role, when configured, then its permissions and data scope (entity/country/department) are defined.
- [ ] Given SoD rules, when set, then conflicting permissions (e.g., preparer + approver) are blocked from one role.
- [ ] Given a scoped user, when accessing data, then only in-scope records are visible and sensitive fields are masked per role.
- [ ] Given any RBAC change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `role`, `permission`, `data_scope`, `sod_rule` schemas + enforcement middleware
- [ ] Backend: data-scoping and field-masking service
- [ ] Frontend: RBAC configuration screen + access-review report
- [ ] Rules/Config: SoD conflict matrix
- [ ] Tests: integration tests for data scoping, masking and SoD blocking

**Covers:** 34.26
**Dependencies:** EPIC-34-S01

### EPIC-34-S25 — Data integration configuration

**Labels:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**As a** System Administrator, **I want** to configure integrations with authorities, banks and finance systems, **so that** compliance data flows reliably in and out of AuraOS.
**Description**
Configure integration adapters: authority portals/APIs (MOHRE/ICP/Qiwa/Mudad/GOSI/GPSSA/SIO/LMRA), bank/WPS agents, GL/finance, insurance and identity providers — with endpoints, credentials (secured), field mappings, schedules, retry and reconciliation hooks.

**Acceptance Criteria**

- [ ] Given an integration, when configured, then endpoint, secured credentials, mapping and schedule are defined per entity.
- [ ] Given a field mapping, when set, then source-to-target transforms are validated before activation.
- [ ] Given a transfer, when it fails, then retry/error-handling and reconciliation hooks fire and log the outcome.
- [ ] Given any integration-config change, when saved, then it is versioned and audit-logged.

**Tasks**

- [ ] Backend: `integration_adapter`, `field_mapping`, `integration_schedule` schemas
- [ ] Backend: secure-credential store + retry/error-handling
- [ ] Frontend: integration configuration screen
- [ ] Rules/Config: authority/bank/GL adapter contracts
- [ ] Tests: integration tests for mapping validation and retry handling

**Covers:** 34.27
**Dependencies:** EPIC-34-S01

### EPIC-34-S26 — Data migration for GCC HRMS implementation

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** data-migration tooling with validation and reconciliation, **so that** legacy HR data loads cleanly and compliantly at go-live.
**Description**
Provide migration templates and a load engine for master data, contracts, balances (leave, EOSB accrual), documents and history, with pre-load validation against the data dictionary and country rules, dedup, error/rejection reporting, and post-load reconciliation against source totals.

**Acceptance Criteria**

- [ ] Given a migration template, when populated and loaded, then records are validated against the data dictionary and country rules before commit.
- [ ] Given invalid records, when detected, then they are rejected with a per-row error report and do not block valid records.
- [ ] Given a completed load, when reconciled, then headcount, balances and totals match source and discrepancies are reported.
- [ ] Given any migration run, when executed, then it is logged with counts, rejects and reconciliation status.

**Tasks**

- [ ] Backend: migration template engine + staged load with validation
- [ ] Backend: dedup, rejection report and reconciliation service
- [ ] Frontend: migration console (upload, validate, load, reconcile)
- [ ] Rules/Config: validation rules bound to data dictionary/country rules
- [ ] Tests: integration tests for rejection isolation and reconciliation totals

**Covers:** 34.28
**Dependencies:** EPIC-34-S04, EPIC-34-S02

### EPIC-34-S27 — Implementation checklist & configuration control sheet

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** a configurable implementation checklist and configuration control sheet, **so that** every entity's setup is complete and verified before go-live.
**Description**
Build the implementation checklist (all config domains, owner, status, evidence) and the **configuration control sheet** — a per-entity register of every configured parameter with reviewer sign-off — used to verify completeness and serve as the go-live evidence and the sample control sheet from the handbook.

**Acceptance Criteria**

- [ ] Given an implementation, when tracked, then the checklist shows every config domain with owner, status and evidence link.
- [ ] Given the configuration control sheet, when generated, then it lists each configured parameter, its value, source rule and reviewer sign-off.
- [ ] Given incomplete items, when present, then the implementation cannot be marked ready for go-live certification.
- [ ] Given any checklist/control-sheet update, when made, then it is audit-logged.

**Tasks**

- [ ] Backend: `implementation_checklist`, `config_control_sheet` schemas
- [ ] Backend: completeness-gate service feeding go-live
- [ ] Frontend: implementation checklist board + control-sheet generator/export
- [ ] Rules/Config: configurable checklist template per country
- [ ] Tests: integration tests for completeness gating

**Covers:** 34.29, 34.32
**Dependencies:** EPIC-34-S02

### EPIC-34-S28 — HRMS configuration KPIs & risk matrix

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3
**As an** Executive / Leadership user, **I want** configuration KPIs and a risk matrix, **so that** I can see configuration health and risk before and after go-live.
**Description**
Build configuration KPIs (config completeness %, rule-pack coverage, validation-error rate, migration reconciliation %, overdue config items) and a configuration risk matrix (e.g., wrong/missing rule, stale rule version, unscoped access, failed integration) scored by likelihood × impact with remediation tracking.

**Acceptance Criteria**

- [ ] Given the dashboard, when loaded, then config completeness, rule coverage, error rate and migration reconciliation show per entity.
- [ ] Given a configuration risk, when registered, then it carries likelihood, impact, score, owner and linked control.
- [ ] Given a finding, when raised, then it is tracked to remediation with due date and status.
- [ ] Given KPI/risk items, when configured, then thresholds are tenant-editable.

**Tasks**

- [ ] Backend: config-KPI aggregation + `config_risk_register`
- [ ] Frontend: configuration KPI dashboard + risk heatmap
- [ ] Rules/Config: KPI definitions/thresholds and risk-scoring
- [ ] Tests: integration tests for KPI computation and risk scoring

**Covers:** 34.30, 34.31
**Dependencies:** EPIC-34-S27

### EPIC-34-S29 — HRMS go-live certification & key takeaways

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** a go-live certification gated on configuration completeness, **so that** no entity launches without verified compliant setup.
**Description**
Build the HRMS go-live certification: an attested certificate confirming rule packs bound, mandatory config complete, migration reconciled, RBAC/audit/integrations validated and the configuration control sheet signed — blocked while critical implementation-checklist or risk items are open. Includes the chapter key-takeaways as a reference.

**Acceptance Criteria**

- [ ] Given an entity, when go-live certification is requested, then completeness, migration reconciliation, RBAC/audit/integration validation and the signed control sheet are checked.
- [ ] Given open critical checklist or risk items, when certification is attempted, then it is blocked until closed or formally accepted.
- [ ] Given certification, when issued, then it is e-signed by the authorized role, versioned and stored as go-live evidence.
- [ ] Given the certificate, when exported, then it produces a PDF and is audit-logged.

**Tasks**

- [ ] Backend: go-live certification service with gating on checklist/risk/migration status
- [ ] Backend: certificate generator + e-sign capture
- [ ] Frontend: go-live certification screen with gating summary + key-takeaways reference
- [ ] Rules/Config: certification attestation fields
- [ ] Tests: integration tests for certification gating on open critical items

**Covers:** 34.33, 34.34
**Dependencies:** EPIC-34-S27, EPIC-34-S28
