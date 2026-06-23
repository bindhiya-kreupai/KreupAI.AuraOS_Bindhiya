# EPIC-02: Chapter 2 – Regulatory Framework

> **Source:** GCC HR Compliance Handbook — Chapter 2 – Regulatory Framework
> **Module:** Platform / Country Rule Engine · **Labels:** `epic`, `gcc-compliance`, `platform`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Build the configurable country rule engine that encodes each GCC state's labour-law framework as versioned, effective-dated, per-country rule sets, and connect AuraOS to the authorities and platforms that enforce them — MOHRE, GPSSA, Qiwa, Mudad, GOSI, LMRA and SIO. Every downstream compliance module (payroll, WPS, social insurance, nationalization, immigration, EOSB) reads its rules and integration contracts from this engine instead of hard-coding country logic. The epic also delivers the GCC regulatory comparison matrix so the same controls can be reasoned about side-by-side across all six markets.

## Business Value

The rule engine is the spine of the platform: it lets one codebase serve six legal regimes, lets compliance teams update rules when laws change without a release, and prevents the single largest source of GCC HR penalties — applying the wrong country's rule. Authority/platform integrations (WPS/Mudad wage files, GOSI/GPSSA/SIO contributions, Qiwa contracts, MOHRE/LMRA permits) turn manual portal work into reconciled, auditable, alert-driven automation. The comparison matrix gives leadership and auditors a defensible, single view of obligations across the GCC.

## Requirements Covered (handbook sections)

- 2.1 Introduction
- 2.2 UAE Labour Law Framework
- 2.3 MOHRE Regulations
- 2.4 Wage Protection System (WPS)
- 2.5 GPSSA Compliance
- 2.6 Emiratisation
- 2.7 Saudi Labour Law Framework
- 2.8 GOSI Compliance
- 2.9 Qiwa Platform
- 2.10 Mudad Platform
- 2.11 Nitaqat (Saudization)
- 2.12 Bahrain Labour Law
- 2.13 LMRA
- 2.14 SIO
- 2.15 Qatar Labour Framework
- 2.16 Qatar WPS
- 2.17 Oman Labour Framework
- 2.18 Social Protection System
- 2.19 Kuwait Labour Framework
- 2.20 GCC Regulatory Comparison Matrix

## Out of Scope

- Full transactional processing inside each functional module (e.g., running a payroll, calculating a leave accrual) — those epics consume this engine's rules.
- End-to-end EOSB / nationalization computation logic beyond the rule parameters and integration hooks defined here.
- Building authority portal UIs; AuraOS integrates via files/APIs, it does not replace MOHRE/Qiwa/GOSI portals.

## Dependencies

- EPIC-01 (multi-country tenancy, national/expat data model, audit/alert backbone, RBAC).

## Epic Definition of Done

- [ ] A versioned, effective-dated country rule engine stores labour-law parameters per GCC country and is queryable by module, country, and date.
- [ ] Rule changes are made through configuration (maker-checker), versioned, and fully audit-trailed — no code deploy required.
- [ ] Integration adapters exist for WPS/Mudad wage files, GOSI, GPSSA, SIO contributions, Qiwa contracts, and MOHRE/LMRA permits, each with reconciliation and exception handling.
- [ ] Nationalization parameter sets (Emiratisation, Nitaqat) are configurable and expose hooks for the nationalization epics.
- [ ] Every country framework section (UAE, KSA, Bahrain, Qatar, Oman, Kuwait) is represented by a seeded baseline rule set.
- [ ] A GCC regulatory comparison matrix renders obligations across all six countries from the same rule store.
- [ ] All integrations and rule evaluations are observable, alert-driven (e.g., file-due, contribution-due, permit-expiry), and audit-logged.

---

## User Stories

### EPIC-02-S01 — Configurable country rule engine core

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 13
**As a** Compliance Officer, **I want** a versioned, effective-dated rule engine that stores labour-law parameters per GCC country, **so that** every module evaluates rules by country and date without hard-coded logic.

**Description**
The foundational service: rules are typed parameters (numeric thresholds, formulas, enums, schedules) grouped by domain (working-hours, leave, notice, EOSB, contributions, nationalization, WPS) and scoped to a country with effective-from/to dates. Modules call `evaluate(domain, country, asOfDate, context)` and receive the applicable rule version.

**Acceptance Criteria**

- [ ] Given a domain, country, and as-of date, when a module queries the engine, then it returns exactly one effective rule version (or a clear "no rule" result).
- [ ] Given overlapping effective dates for the same country/domain, when saving, then the engine rejects the overlap.
- [ ] Given a rule, when published, then the prior version is retained and remains queryable for historical (retro) calculations.
- [ ] Given a rule evaluation, then inputs, matched rule version, and output are logged for audit and reproducibility.
- [ ] Given a country not enabled for the tenant (per EPIC-01), then evaluation is blocked.
- [ ] Given RBAC, then only Compliance Officer/System Administrator may author rules.

**Tasks**

- [ ] Backend: `RuleSet`, `RuleVersion` (domain, country, effective_from, effective_to, status), `RuleParameter` (key, type, value/formula) schema + migration.
- [ ] Backend: `RuleEvaluationService.evaluate()` with effective-date resolution and overlap guard.
- [ ] Backend: evaluation-trace persistence and `rule.evaluated` event.
- [ ] Frontend: rule-authoring workspace (parameter editor, effective-date picker, version history).
- [ ] Rules/Config: domain taxonomy and parameter type system.
- [ ] Tests: unit tests for effective-date resolution, overlap rejection, and retro evaluation.

**Covers:** 2.1
**Dependencies:** EPIC-01

### EPIC-02-S02 — Rule change governance (maker-checker & versioning)

**Labels:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**As an** Internal Auditor, **I want** all rule changes to pass maker-checker approval and be fully versioned, **so that** regulatory updates are controlled, traceable, and reversible.

**Description**
Wraps the rule engine in a governed change workflow: a preparer drafts a rule change, a different approver authorises it, and only then does it become effective. Every change is versioned with rationale and source reference (e.g., decree number).

**Acceptance Criteria**

- [ ] Given a rule draft, when submitted, then it requires approval by a different user (preparer ≠ approver).
- [ ] Given a pending change, when approved, then it activates on its effective date and supersedes the prior version.
- [ ] Given a change, when created, then a rationale and legal source reference (e.g., decree/circular number) are mandatory.
- [ ] Given an approved change, when needed, then it can be rolled back to the previous version with audit capture.
- [ ] Given any submit/approve/reject/rollback, then the audit trail records actor, timestamp, and before/after.
- [ ] Given RBAC, then approval rights are limited to senior Compliance roles.

**Tasks**

- [ ] Backend: `RuleChangeRequest` (draft, status, preparer, approver, rationale, source_ref) schema + migration.
- [ ] Backend: maker-checker workflow service integrating with the rule engine; rollback support.
- [ ] Frontend: change-request inbox, diff view, approve/reject screen.
- [ ] Rules/Config: enforce preparer ≠ approver and mandatory source reference.
- [ ] Alerts/Workflow: notify approvers on submission; notify preparer on decision.
- [ ] Tests: e2e for maker-checker, rejection, rollback, and audit capture.

**Covers:** 2.1
**Dependencies:** EPIC-02-S01

### EPIC-02-S03 — UAE labour-law framework rule set

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** the UAE labour-law framework encoded as a baseline rule set, **so that** UAE entities compute working hours, leave, notice, probation, and EOSB correctly.

**Description**
Seeds UAE Federal Decree-Law parameters: contract types (limited-term), max working hours, weekly rest, annual leave (30 days after one year), sick-leave bands, notice periods, probation limits, and EOSB rule (21 days/yr for first 5 years then 30 days/yr, capped at 2 years' wage). These become the authoritative UAE rule version.

**Acceptance Criteria**

- [ ] Given a UAE entity, when leave/notice/EOSB rules are evaluated, then they return the seeded UAE parameters for the as-of date.
- [ ] Given EOSB evaluation, then it applies 21 days/yr for the first five years and 30 days/yr thereafter, capped at two years' total wage.
- [ ] Given annual-leave evaluation, then it returns 30 calendar days after one year of service with documented pro-ration for partial years.
- [ ] Given probation, then the rule enforces the statutory maximum and required notice within probation.
- [ ] Given a future legal change, then a new effective-dated UAE version can supersede without affecting historical calculations.
- [ ] Given any rule read, then the matched UAE version id is captured in the evaluation trace.

**Tasks**

- [ ] Backend: seed UAE `RuleSet` parameters (working_hours, rest_day, annual_leave, sick_leave_bands, notice, probation, eosb_formula).
- [ ] Backend: EOSB formula expression and leave pro-ration helper registered with the engine.
- [ ] Frontend: UAE rule-set view within the rule-authoring workspace.
- [ ] Rules/Config: UAE parameter values with source references.
- [ ] Tests: unit tests for EOSB tiering/cap and annual-leave entitlement.

**Covers:** 2.2
**Dependencies:** EPIC-02-S01

### EPIC-02-S04 — MOHRE regulations & work-permit integration

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 8
**As a** PRO / Immigration Officer, **I want** MOHRE establishment, contract, and work-permit rules with integration hooks, **so that** UAE permit obligations are tracked, validated, and alerted automatically.

**Description**
Encodes MOHRE rules (establishment status, labour-contract registration, work-permit lifecycle, quota/category context) and provides an integration adapter to submit/track contracts and permits, with expiry alerting on the EPIC-01 backbone.

**Acceptance Criteria**

- [ ] Given a UAE employee, when a labour contract is registered, then required MOHRE fields are validated before submission.
- [ ] Given a work permit, when its expiry approaches, then alerts fire at 60/30/7 days to the PRO/Immigration Officer.
- [ ] Given a MOHRE integration response, when received, then status is reconciled against the local record and mismatches are flagged.
- [ ] Given a missing or expired permit, then dependent actions (e.g., payroll activation hooks) can be blocked per configuration.
- [ ] Given any MOHRE submission/response, then the payload reference and outcome are audit-logged.
- [ ] Given RBAC, then only PRO/Immigration Officer and HR Admin may initiate MOHRE actions.

**Tasks**

- [ ] Backend: `MohreEstablishment`, `LabourContract`, `WorkPermit` schema + migration; MOHRE adapter interface (stub + sandbox).
- [ ] Backend: reconciliation service comparing MOHRE status vs. local; emit mismatch events.
- [ ] Frontend: MOHRE contract/permit register with status and expiry indicators.
- [ ] Rules/Config: MOHRE field-validation rules sourced from the UAE rule set.
- [ ] Alerts/Workflow: 60/30/7-day permit-expiry reminders.
- [ ] Tests: integration tests for submission, reconciliation, and expiry alerting.

**Covers:** 2.3
**Dependencies:** EPIC-02-S03

### EPIC-02-S05 — UAE WPS wage-file generation & salary-delay controls

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** UAE WPS wage files generated to the statutory SIF format with salary-delay controls, **so that** salaries are paid through WPS on time and penalties are avoided.

**Description**
Implements UAE Wage Protection System rule parameters and a wage-file (SIF) generator, validating against MOHRE WPS requirements, flagging salary delays beyond the statutory window, and reconciling generated vs. paid.

**Acceptance Criteria**

- [ ] Given an approved UAE payroll, when a WPS file is generated, then it conforms to the SIF structure and passes format validation.
- [ ] Given the statutory pay window, when salaries are not paid within it (delay > 15 days), then a salary-delay flag and alert are raised.
- [ ] Given a WPS file, when records are missing mandatory fields (e.g., IBAN, labour card / MOL id), then generation is blocked with a clear error list.
- [ ] Given a generated file, then it is reconciled against payroll totals and discrepancies are flagged.
- [ ] Given file generation/submission, then the run is audit-logged with totals and record counts.
- [ ] Given RBAC + maker-checker, then file release requires an approver different from the preparer.

**Tasks**

- [ ] Backend: `WpsFile`, `WpsRecord` schema + SIF generator and validator; migration.
- [ ] Backend: salary-delay detection against statutory window from the rule engine.
- [ ] Frontend: WPS run screen with validation results and file download.
- [ ] Rules/Config: UAE WPS parameters (window, mandatory fields, SIF format).
- [ ] Alerts/Workflow: salary-delay alert and maker-checker release.
- [ ] Tests: unit tests for SIF format, mandatory-field blocking, and reconciliation.

**Covers:** 2.4
**Dependencies:** EPIC-02-S03

### EPIC-02-S06 — GPSSA pension compliance & contribution integration

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** GPSSA registration and contribution rules with file/integration support, **so that** UAE/GCC-national pension contributions are calculated, submitted, and reconciled correctly.

**Description**
Encodes GPSSA applicability (UAE nationals and GCC nationals under the unified extension), contribution-account-salary definition, employer/employee split, and monthly process; provides a contribution file/adapter with reconciliation against payroll.

**Acceptance Criteria**

- [ ] Given a UAE-national employee, when contributions are computed, then the GPSSA contribution-account salary and employer/employee percentages from the rule engine are applied.
- [ ] Given a GCC national employed in the UAE, then GPSSA cross-GCC handling is applied per the unified extension rule.
- [ ] Given monthly close, when the GPSSA file is generated, then it reconciles to payroll contribution totals and flags variances.
- [ ] Given a salary change mid-period, then the contribution base is recomputed and the variance recorded.
- [ ] Given any GPSSA submission, then payload, totals, and outcome are audit-logged.
- [ ] Given RBAC, then only Payroll Officer/HR Admin may run GPSSA processing.

**Tasks**

- [ ] Backend: `GpssaRegistration`, `GpssaContribution` schema + monthly contribution engine; migration.
- [ ] Backend: GPSSA file/adapter and payroll reconciliation service.
- [ ] Frontend: GPSSA monthly run + variance review screen.
- [ ] Rules/Config: GPSSA contribution-salary definition, rates, and GCC-unified-extension flag.
- [ ] Alerts/Workflow: contribution-due reminder and variance alert.
- [ ] Tests: unit tests for split calculation, mid-period change, and reconciliation.

**Covers:** 2.5
**Dependencies:** EPIC-02-S03

### EPIC-02-S07 — Emiratisation parameter set & hooks

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** Emiratisation targets and counting rules configurable in the rule engine, **so that** UAE entities can be measured and the nationalization epic can compute compliance.

**Description**
Captures Emiratisation applicability (size/category thresholds), target percentages, counting/eligibility rules, and penalty-exposure parameters as configurable rules, exposing evaluation hooks (Emirati count vs. target) for the dedicated Emiratisation epic.

**Acceptance Criteria**

- [ ] Given a UAE entity, when applicability is evaluated, then size/category thresholds determine whether targets apply.
- [ ] Given an applicable entity, when its Emirati ratio is evaluated, then the engine returns actual vs. target and a shortfall.
- [ ] Given an employee, when counted, then only eligible (genuinely employed, GPSSA-registered) Emiratis contribute per the rule.
- [ ] Given a shortfall, then the configured penalty-exposure parameters are returned for downstream reporting.
- [ ] Given a target change, then it is effective-dated and version-controlled.
- [ ] Given any evaluation, then inputs and matched version are traced.

**Tasks**

- [ ] Backend: Emiratisation rule parameters (applicability, target %, counting/eligibility, penalty exposure).
- [ ] Backend: `evaluateEmiratisation(entity, asOf)` hook returning actual/target/shortfall.
- [ ] Frontend: Emiratisation parameter view in the rule workspace.
- [ ] Rules/Config: seed UAE Emiratisation thresholds with source references.
- [ ] Tests: unit tests for applicability, eligibility filtering, and shortfall computation.

**Covers:** 2.6
**Dependencies:** EPIC-02-S03, EPIC-02-S06

### EPIC-02-S08 — Saudi labour-law framework rule set

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** the Saudi labour-law framework encoded as a baseline rule set, **so that** KSA entities compute working hours, leave, notice, and end-of-service award correctly.

**Description**
Seeds KSA Labour Law parameters: working hours (with Ramadan reduction for Muslim workers), weekly rest, annual leave (21 days rising to 30 after five years), sick-leave pay bands, notice periods, and the end-of-service award (half-month wage per year for first five years, full month thereafter, with resignation tiers).

**Acceptance Criteria**

- [ ] Given a KSA entity, when EOS award is evaluated, then it applies ½-month/yr for the first five years and 1-month/yr thereafter.
- [ ] Given a resignation, then the resignation-based EOS reduction tiers are applied per service length.
- [ ] Given annual-leave evaluation, then 21 days (rising to 30 after five years) is returned.
- [ ] Given Ramadan, then reduced working hours for Muslim workers are reflected in the working-hours rule.
- [ ] Given a future change, then a new effective-dated KSA version supersedes cleanly.
- [ ] Given any read, then the matched KSA version is traced.

**Tasks**

- [ ] Backend: seed KSA `RuleSet` (working_hours, ramadan_hours, annual_leave, sick_leave_bands, notice, eos_award_formula, resignation_tiers).
- [ ] Backend: EOS-award formula with resignation tiering registered with the engine.
- [ ] Frontend: KSA rule-set view in the authoring workspace.
- [ ] Rules/Config: KSA parameter values with source references.
- [ ] Tests: unit tests for EOS tiering, resignation reduction, and leave entitlement.

**Covers:** 2.7
**Dependencies:** EPIC-02-S01

### EPIC-02-S09 — GOSI compliance & contribution integration

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** GOSI registration and contribution rules with integration support, **so that** Saudi and expat social-insurance contributions are computed, submitted, and reconciled.

**Description**
Encodes GOSI branches (annuities for Saudis, occupational-hazard for all), contribution-wage definition and ceiling, employer/employee rates differing by nationality, monthly process, and reconciliation; provides a GOSI adapter/file.

**Acceptance Criteria**

- [ ] Given a Saudi employee, when contributions compute, then annuities + occupational-hazard branches and the correct rates/ceiling are applied.
- [ ] Given an expat employee, when contributions compute, then only the applicable (occupational-hazard) branch and rate are applied.
- [ ] Given the contribution wage, then it is capped at the GOSI ceiling from the rule engine.
- [ ] Given monthly close, when the GOSI submission is prepared, then it reconciles to payroll and flags variances.
- [ ] Given any GOSI action, then payload, totals, and outcome are audit-logged.
- [ ] Given RBAC, then only Payroll Officer/HR Admin may run GOSI processing.

**Tasks**

- [ ] Backend: `GosiRegistration`, `GosiContribution` schema + branch-aware contribution engine; migration.
- [ ] Backend: GOSI adapter/file generator and payroll reconciliation service.
- [ ] Frontend: GOSI monthly run + variance review screen.
- [ ] Rules/Config: GOSI branches, rates by nationality, contribution-wage definition, ceiling.
- [ ] Alerts/Workflow: contribution-due reminder and variance alert.
- [ ] Tests: unit tests for Saudi vs. expat branches, ceiling cap, and reconciliation.

**Covers:** 2.8
**Dependencies:** EPIC-02-S08

### EPIC-02-S10 — Qiwa platform integration (contracts & establishment)

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** Qiwa contract authentication and establishment data integrated, **so that** Saudi employment contracts and labour records stay synchronised and compliant.

**Description**
Provides a Qiwa adapter to authenticate/register employment contracts, retrieve establishment and workforce data, and reconcile Qiwa contract status against local records, with validation that a Qiwa-authenticated contract exists where required (e.g., for Saudization counting).

**Acceptance Criteria**

- [ ] Given a Saudi employment contract, when submitted to Qiwa, then required fields are validated and the authentication reference is stored.
- [ ] Given Qiwa establishment/workforce data, when retrieved, then it is reconciled with local headcount and mismatches flagged.
- [ ] Given a Saudization-counted employee, when they lack a Qiwa-authenticated contract, then a compliance flag is raised.
- [ ] Given any Qiwa call, then request reference and outcome are audit-logged.
- [ ] Given an integration failure, then it is retried and surfaced as an exception.
- [ ] Given RBAC, then only HR Admin/Compliance Officer may trigger Qiwa actions.

**Tasks**

- [ ] Backend: Qiwa adapter interface (sandbox), `QiwaContract` schema + migration.
- [ ] Backend: establishment/workforce reconciliation service; mismatch events.
- [ ] Frontend: Qiwa contract status register and reconciliation view.
- [ ] Rules/Config: Qiwa contract-field validation rules.
- [ ] Alerts/Workflow: missing-authenticated-contract flag and retry/exception handling.
- [ ] Tests: integration tests for submission, reconciliation, and exception handling.

**Covers:** 2.9
**Dependencies:** EPIC-02-S08

### EPIC-02-S11 — Mudad platform integration (Saudi wage protection)

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** Mudad wage-file generation and payroll integration for KSA, **so that** Saudi salaries are processed and protected through Mudad with delay controls.

**Description**
Implements Saudi Wage Protection (Mudad) rules and a wage-file generator/adapter, validating mandatory fields, generating the Mudad-compliant file, flagging wage commitment ratio/delays, and reconciling against payroll.

**Acceptance Criteria**

- [ ] Given an approved KSA payroll, when a Mudad file is generated, then it conforms to the Mudad format and passes validation.
- [ ] Given the Mudad wage-commitment expectation, when payment is delayed beyond the statutory window, then a delay flag and alert are raised.
- [ ] Given missing IBAN/national-id/GOSI linkage, then file generation is blocked with an error list.
- [ ] Given a generated file, then it reconciles against payroll totals.
- [ ] Given generation/submission, then the run is audit-logged with totals.
- [ ] Given RBAC + maker-checker, then release requires a different approver.

**Tasks**

- [ ] Backend: `MudadFile`, `MudadRecord` schema + generator/validator; Mudad adapter; migration.
- [ ] Backend: delay detection against the KSA statutory window from the rule engine.
- [ ] Frontend: Mudad run screen with validation and download.
- [ ] Rules/Config: KSA wage-protection parameters (window, mandatory fields, format).
- [ ] Alerts/Workflow: wage-delay alert and maker-checker release.
- [ ] Tests: unit tests for format, blocking, and reconciliation.

**Covers:** 2.10
**Dependencies:** EPIC-02-S08, EPIC-02-S09

### EPIC-02-S12 — Nitaqat (Saudization) parameter set & hooks

**Labels:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** Nitaqat bands, sector/size rules, and counting logic configurable, **so that** KSA entities can be classified (Red/Low/Medium/High/Platinum) and the Saudization epic can compute status.

**Description**
Encodes Nitaqat applicability by activity/size, band thresholds, Saudi-workforce calculation (weighted headcount with GOSI/Qiwa linkage), and artificial-Saudization risk parameters, exposing evaluation hooks for the dedicated Nitaqat epic.

**Acceptance Criteria**

- [ ] Given a KSA entity, when its Saudization ratio is evaluated, then the engine returns the band and distance to the next band.
- [ ] Given counting, then only GOSI-registered, Qiwa-contracted Saudis are counted per the rule.
- [ ] Given activity and size, then the correct band thresholds are selected.
- [ ] Given a band change risk, then artificial-Saudization risk parameters are exposed for reporting.
- [ ] Given a threshold change, then it is effective-dated and versioned.
- [ ] Given any evaluation, then inputs and matched version are traced.

**Tasks**

- [ ] Backend: Nitaqat rule parameters (applicability, band thresholds, weighted counting, risk flags).
- [ ] Backend: `evaluateNitaqat(entity, asOf)` hook returning band and gap.
- [ ] Frontend: Nitaqat parameter view in the rule workspace.
- [ ] Rules/Config: seed band thresholds by sector/size with source references.
- [ ] Tests: unit tests for band selection, weighted counting, and GOSI/Qiwa eligibility.

**Covers:** 2.11
**Dependencies:** EPIC-02-S09, EPIC-02-S10

### EPIC-02-S13 — Bahrain labour-law framework rule set

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** the Bahrain labour-law framework encoded as a baseline rule set, **so that** Bahrain entities compute leave, notice, and end-of-service indemnity correctly.

**Description**
Seeds Bahrain Labour Law parameters: working hours, annual leave (30 days), sick-leave bands, notice periods, and end-of-service indemnity (e.g., half-month wage per year for first three years, full month thereafter), with Bahrainization context referencing LMRA/SIO.

**Acceptance Criteria**

- [ ] Given a Bahrain entity, when EOS indemnity is evaluated, then the seeded tiered formula is applied.
- [ ] Given annual leave, then 30 days entitlement (per qualifying service) is returned with pro-ration.
- [ ] Given sick leave, then the statutory paid/partial/unpaid bands are returned.
- [ ] Given notice, then statutory minimums are enforced.
- [ ] Given a future change, then a new effective-dated Bahrain version supersedes cleanly.
- [ ] Given any read, then the matched Bahrain version is traced.

**Tasks**

- [ ] Backend: seed Bahrain `RuleSet` (working_hours, annual_leave, sick_leave_bands, notice, eos_indemnity_formula).
- [ ] Backend: indemnity formula registered with the engine.
- [ ] Frontend: Bahrain rule-set view in the authoring workspace.
- [ ] Rules/Config: Bahrain parameter values with source references.
- [ ] Tests: unit tests for indemnity tiering and leave entitlement.

**Covers:** 2.12
**Dependencies:** EPIC-02-S01

### EPIC-02-S14 — LMRA integration (Bahrain work permits & fees)

**Labels:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**As a** PRO / Immigration Officer, **I want** LMRA work-permit and fee data integrated for Bahrain, **so that** expat permits and Bahrainization-linked obligations are tracked and alerted.

**Description**
Provides an LMRA adapter to manage expat work permits, fees, and establishment status, with expiry/renewal alerting and reconciliation, and exposes the permit data needed for Bahrainization calculations.

**Acceptance Criteria**

- [ ] Given an expat in Bahrain, when a work permit is registered, then LMRA-required fields are validated.
- [ ] Given a permit/fee due date, when it approaches, then alerts fire at 60/30/7 days to the PRO/Immigration Officer.
- [ ] Given LMRA status, when retrieved, then it is reconciled with local records and mismatches flagged.
- [ ] Given Bahrainization needs, then valid LMRA permits feed the localization calculation.
- [ ] Given any LMRA action, then reference and outcome are audit-logged.
- [ ] Given RBAC, then only PRO/Immigration Officer/HR Admin may act.

**Tasks**

- [ ] Backend: `LmraPermit`, `LmraFee` schema + LMRA adapter; migration.
- [ ] Backend: reconciliation service and permit-expiry scheduler.
- [ ] Frontend: LMRA permit/fee register with expiry indicators.
- [ ] Rules/Config: LMRA field-validation and fee parameters.
- [ ] Alerts/Workflow: 60/30/7-day permit/fee reminders.
- [ ] Tests: integration tests for validation, reconciliation, and alerting.

**Covers:** 2.13
**Dependencies:** EPIC-02-S13

### EPIC-02-S15 — SIO integration (Bahrain social insurance)

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** Bahrain SIO registration and contribution rules with integration, **so that** Bahraini and expat social-insurance/EOS funding contributions are computed and reconciled.

**Description**
Encodes SIO contribution branches and rates (differing by nationality, including expat end-of-service savings funding), contribution-salary definition, monthly process, and reconciliation; aligns with LMRA records and provides a contribution file/adapter.

**Acceptance Criteria**

- [ ] Given a Bahraini employee, when contributions compute, then the applicable SIO branches and rates are applied.
- [ ] Given an expat employee, when contributions compute, then the expat EOS-savings/applicable branch and rate are applied.
- [ ] Given monthly close, when the SIO submission is prepared, then it reconciles to payroll and flags variances.
- [ ] Given LMRA records, then SIO registration is cross-checked for alignment and gaps flagged.
- [ ] Given any SIO action, then payload, totals, and outcome are audit-logged.
- [ ] Given RBAC, then only Payroll Officer/HR Admin may run SIO processing.

**Tasks**

- [ ] Backend: `SioRegistration`, `SioContribution` schema + branch-aware engine; migration.
- [ ] Backend: SIO adapter/file generator, payroll reconciliation, and LMRA alignment check.
- [ ] Frontend: SIO monthly run + variance/alignment review screen.
- [ ] Rules/Config: SIO branches, rates by nationality, contribution-salary definition.
- [ ] Alerts/Workflow: contribution-due reminder, variance and LMRA-mismatch alerts.
- [ ] Tests: unit tests for Bahraini vs. expat branches, reconciliation, and LMRA alignment.

**Covers:** 2.14
**Dependencies:** EPIC-02-S13, EPIC-02-S14

### EPIC-02-S16 — Qatar labour framework & WPS rule set + file

**Labels:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** the Qatar labour framework and WPS encoded with wage-file generation, **so that** Qatar entities compute entitlements correctly and pay salaries through WPS on time.

**Description**
Seeds Qatar Labour Law parameters (working hours, annual leave, end-of-service gratuity of at least three weeks' basic wage per year, notice) and implements the Qatar WPS (SIF) wage-file generator with salary-delay controls and reconciliation. Covers both Qatar framework and Qatar WPS sections.

**Acceptance Criteria**

- [ ] Given a Qatar entity, when EOS gratuity is evaluated, then at least three weeks' basic wage per year of service is applied per the rule.
- [ ] Given annual leave/notice, then the seeded Qatar parameters are returned for the as-of date.
- [ ] Given an approved Qatar payroll, when a WPS file is generated, then it conforms to the Qatar SIF and passes validation.
- [ ] Given salary not paid within the statutory window, then a delay flag and alert are raised.
- [ ] Given missing mandatory WPS fields (IBAN/QID), then generation is blocked with an error list.
- [ ] Given file generation, then it reconciles to payroll and is audit-logged; release uses maker-checker.

**Tasks**

- [ ] Backend: seed Qatar `RuleSet` (working_hours, annual_leave, notice, eos_gratuity_formula); `QatarWpsFile`/`QatarWpsRecord` schema + generator/validator; migration.
- [ ] Backend: salary-delay detection and payroll reconciliation.
- [ ] Frontend: Qatar rule-set view and WPS run screen.
- [ ] Rules/Config: Qatar labour and WPS parameters (window, SIF format, mandatory fields).
- [ ] Alerts/Workflow: salary-delay alert and maker-checker release.
- [ ] Tests: unit tests for EOS gratuity, SIF format, blocking, and reconciliation.

**Covers:** 2.15, 2.16
**Dependencies:** EPIC-02-S01

### EPIC-02-S17 — Oman labour framework & social-protection rule set

**Labels:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** the Oman labour framework and Social Protection System encoded, **so that** Oman entities compute entitlements and social-protection contributions correctly.

**Description**
Seeds Oman Labour Law parameters (working hours, annual leave, notice, end-of-service for expats and social-protection linkage for Omanis) and the Social Protection System (PASI successor) contribution rules differing by nationality, with reconciliation hooks. Covers both Oman framework and Social Protection sections.

**Acceptance Criteria**

- [ ] Given an Oman entity, when EOS/social-protection is evaluated, then expat end-of-service and Omani social-protection contributions are handled per nationality.
- [ ] Given annual leave/notice, then the seeded Oman parameters are returned.
- [ ] Given an Omani employee, when contributions compute, then the Social Protection branches and rates are applied with the correct contribution salary.
- [ ] Given monthly close, then the social-protection contribution set reconciles to payroll and flags variances.
- [ ] Given a future change, then a new effective-dated Oman version supersedes cleanly.
- [ ] Given any evaluation/contribution, then inputs and outcomes are traced/audit-logged.

**Tasks**

- [ ] Backend: seed Oman `RuleSet` (working_hours, annual_leave, notice, eos/social_protection); `OmanContribution` schema + engine; migration.
- [ ] Backend: contribution computation by nationality + payroll reconciliation.
- [ ] Frontend: Oman rule-set view and contribution run screen.
- [ ] Rules/Config: Oman labour and Social Protection parameters with source references.
- [ ] Alerts/Workflow: contribution-due reminder and variance alert.
- [ ] Tests: unit tests for nationality branching, leave/notice, and reconciliation.

**Covers:** 2.17, 2.18
**Dependencies:** EPIC-02-S01

### EPIC-02-S18 — Kuwait labour framework rule set

**Labels:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**As a** Compliance Officer, **I want** the Kuwait labour-law framework encoded as a baseline rule set, **so that** Kuwait entities compute leave, notice, and end-of-service indemnity correctly.

**Description**
Seeds Kuwait Labour Law (private sector) parameters: working hours, annual leave (30 days), sick-leave bands, notice periods, and end-of-service indemnity (15 days' wage per year for first five years, one month per year thereafter), with PIFSS social-security context for Kuwaitis.

**Acceptance Criteria**

- [ ] Given a Kuwait entity, when EOS indemnity is evaluated, then 15 days/yr for the first five years and one month/yr thereafter is applied.
- [ ] Given annual leave, then 30 days entitlement with pro-ration is returned.
- [ ] Given sick leave/notice, then the statutory bands and minimums are returned.
- [ ] Given a Kuwaiti employee, then PIFSS social-security applicability is flagged for the social-insurance module.
- [ ] Given a future change, then a new effective-dated Kuwait version supersedes cleanly.
- [ ] Given any read, then the matched Kuwait version is traced.

**Tasks**

- [ ] Backend: seed Kuwait `RuleSet` (working_hours, annual_leave, sick_leave_bands, notice, eos_indemnity_formula, pifss_flag).
- [ ] Backend: indemnity formula registered with the engine.
- [ ] Frontend: Kuwait rule-set view in the authoring workspace.
- [ ] Rules/Config: Kuwait parameter values with source references.
- [ ] Tests: unit tests for indemnity tiering and leave entitlement.

**Covers:** 2.19
**Dependencies:** EPIC-02-S01

### EPIC-02-S19 — GCC regulatory comparison matrix

**Labels:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership, **I want** a side-by-side GCC regulatory comparison matrix generated from the rule store, **so that** obligations across all six countries can be reviewed and audited in one view.

**Description**
Renders a configurable matrix (countries as columns, obligation themes as rows: working hours, leave, notice, EOSB, WPS, social insurance, nationalization, key authorities) sourced live from the effective rule sets, so the comparison always reflects current configuration and is exportable for board/audit use.

**Acceptance Criteria**

- [ ] Given the matrix, when opened, then it shows all six GCC countries with rows for the key obligation themes drawn from the rule engine.
- [ ] Given an as-of date, when changed, then the matrix reflects the effective rule versions for that date.
- [ ] Given a cell, when no rule exists for a country/theme, then it renders "not applicable / not configured" clearly.
- [ ] Given the matrix, then it is exportable (PDF/Excel) for audit and board reporting.
- [ ] Given RBAC, then only countries within the user's scope are shown.
- [ ] Given a rule change, then the matrix reflects it without code changes.

**Tasks**

- [ ] Backend: matrix-builder service reading effective rule versions across countries/themes for an as-of date.
- [ ] Frontend: comparison-matrix screen with as-of-date selector and PDF/Excel export.
- [ ] Rules/Config: configurable theme catalogue mapping to rule-engine domains.
- [ ] Alerts/Workflow: deep-link from cells to the underlying rule version.
- [ ] Tests: integration tests for as-of resolution, missing-rule handling, and export.

**Covers:** 2.20
**Dependencies:** EPIC-02-S03, EPIC-02-S08, EPIC-02-S13, EPIC-02-S16, EPIC-02-S17, EPIC-02-S18
