# EPIC-28: Chapter 28 – End-of-Service Benefits Compliance

> **Source:** GCC HR Compliance Handbook — Chapter 28 – End-of-Service Benefits Compliance
> **Module:** Separation · **Labels:** `epic`, `gcc-compliance`, `eosb`
> **Status:** Backlog · **Priority:** Must

## Epic Goal

Deliver a complete End-of-Service Benefits (EOSB) compliance engine in AuraOS built around a configurable per-country **EOSB formula engine** that calculates gratuity/award/indemnity for every GCC jurisdiction (UAE 21→30 days/yr, Saudi end-of-service award, Bahrain/Qatar/Oman/Kuwait gratuity/indemnity), correctly applies resignation-vs-termination rules, derives the service period and salary basis, adjusts for unpaid leave, nets social-insurance/pension funding, provisions and accounts for accrued liability, integrates with final settlement, and manages disputes. The outcome is a defensible, auditable EOSB number produced automatically at separation — and accrued monthly — with no spreadsheet calculation.

## Business Value

EOSB is the single largest end-of-employment liability and the most litigated GCC HR calculation: wrong day-rates, mis-applied resignation reductions, incorrect salary basis, or ignoring unpaid leave and social-insurance funding lead to under/over-payment, labour-court claims, MOHRE/MHRSD complaints, and restated provisions. A configurable formula engine with per-country rules, effective-dating, and full audit trail removes manual error, defends the entity in disputes, keeps the GL provision accurate for finance and audit, and gives leavers a transparent, on-time settlement.

## Requirements Covered (handbook sections)

- 28.1 Introduction
- 28.2 Objectives of EOSB Compliance
- 28.3 EOSB Governance Framework
- 28.4 EOSB Terminology
- 28.5 Common EOSB Calculation Inputs
- 28.6 Country-Wise EOSB Overview
- 28.7 UAE End-of-Service Gratuity
- 28.8 Saudi Arabia End-of-Service Award
- 28.9 Bahrain End-of-Service Gratuity / Indemnity
- 28.10 Qatar End-of-Service Gratuity
- 28.11 Oman End-of-Service / Social Protection Linkage
- 28.12 Kuwait End-of-Service Indemnity
- 28.13 Resignation vs Termination Impact
- 28.14 Service Period Calculation
- 28.15 Salary Basis
- 28.16 Unpaid Leave Impact
- 28.17 Social Insurance and Pension Interaction
- 28.18 EOSB Provisioning and Accounting
- 28.19 EOSB and Final Settlement Integration
- 28.20 EOSB Disputes
- 28.21 EOSB Audit Checklist
- 28.22 EOSB KPIs
- 28.23 EOSB Risk Matrix
- 28.24 HRMS EOSB Automation Design
- 28.25 EOSB Dashboard
- 28.26 Monthly EOSB Compliance Pack
- 28.27 Sample EOSB Calculation Sheet
- 28.28 Sample EOSB Dispute Register
- 28.29 Sample EOSB Monthly Compliance Certificate
- 28.30 Key Takeaways

## Out of Scope

- Final-settlement orchestration mechanics (clearance, leave encashment, deduction recovery, payout) owned by EPIC-27 — this epic supplies the EOSB figure and consumes/returns settlement context.
- Visa/work-permit cancellation and immigration exit, owned by EPIC-29.
- Social-insurance contribution calculation and funded-balance maintenance (GOSI/GPSSA/SIO/PASI), owned by the social-insurance epics — this epic consumes the funded/pension interaction only.
- Posting to the general ledger; this epic produces the provision/journal data and hands it to the Payroll→GL integration.

## Dependencies

- EPIC-02 (Regulatory Framework — country rule engine baseline, EOSB references per country)
- EPIC-27 (Termination and Separation Compliance — separation types, notice, final settlement)
- EPIC-10 (Payroll Management & Processing — salary components, GL integration)
- EPIC-13 / EPIC-14 / EPIC-15 (GOSI / GPSSA / SIO — social-insurance & funded-gratuity interaction)

## Epic Definition of Done

- [ ] A configurable EOSB formula engine computes gratuity/award/indemnity per country with effective-dated rules and no code change for rule edits.
- [ ] Resignation-vs-termination reductions, service-period derivation, salary basis, and unpaid-leave adjustment are applied correctly and shown line-by-line.
- [ ] Social-insurance/pension funded balances are netted into the EOSB result where applicable.
- [ ] Monthly EOSB provisioning accrues liability per employee and posts journal data to finance.
- [ ] EOSB integrates with final settlement; disputes are logged, tracked and resolved with audit.
- [ ] Calculation sheet, dispute register, monthly pack, certificate, dashboard, KPIs, audit checklist and risk matrix are delivered with RBAC.
- [ ] Every calculation, override and rule change is captured in the audit trail with full input/output snapshot.

---

## User Stories

### EPIC-28-S01 — EOSB Foundation, Governance, Terminology & Objectives

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 3
**As a** Compliance Officer, **I want** the EOSB domain, governance model, terminology and objectives modelled as configurable reference data, **so that** AuraOS shares one consistent EOSB vocabulary and control framework across all GCC entities.

**Description**
Establishes the EOSB module foundation: purpose/objectives, the governance framework (roles, approval authority, segregation of duties for preparer/approver/payer), and a configurable terminology glossary (gratuity, award, indemnity, qualifying service, daily wage, capped wage, accrued liability, vested/forfeited portion). Provides inline guidance and anchors all downstream calculation stories.

**Acceptance Criteria**

- [ ] Given the EOSB module, when opened, then objectives and governance (roles, authority matrix, segregation of duties) are configurable and displayed inline.
- [ ] Given the terminology glossary, when configured, then each term has a definition surfaced contextually on calculation screens.
- [ ] Given governance roles, when set, then preparer ≠ approver ≠ payer is enforceable downstream.
- [ ] Given guidance content (28.1–28.4), then it is editable per entity without code, versioned and EN/AR.
- [ ] Given any governance/terminology change, then it is versioned with effective date and audited.

**Tasks**

- [ ] Backend: `eosb_governance` (entityId, authorityMatrix JSON, sodRules) + `eosb_term` glossary entity
- [ ] Backend: guidance content store keyed by section with locale/version
- [ ] Frontend: EOSB governance + glossary configuration screens
- [ ] Rules/Config: seed governance roles and EOSB terminology
- [ ] Tests: unit tests for SoD rule evaluation and versioning

**Covers:** 28.1, 28.2, 28.3, 28.4
**Dependencies:** EPIC-02

### EPIC-28-S02 — EOSB Calculation Inputs & Country-Wise Rule Catalogue

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** the common EOSB calculation inputs and the per-country EOSB rule catalogue modelled as configurable, effective-dated reference data, **so that** the formula engine has a single source of truth for every GCC jurisdiction's rules.

**Description**
Defines the canonical EOSB input set (join date, last working day, service years/months/days, salary basis amount, unpaid-leave days, separation type/reason, contract type, social-insurance funded balance, prior settlements) and a country rule catalogue describing each jurisdiction's accrual structure at a high level (UAE tiered day-rates, Saudi award half/full-month bands, Bahrain/Qatar/Oman/Kuwait gratuity/indemnity formulas, caps, eligibility minimums). This is the data layer the formula engine consumes; detailed per-country math lives in S03–S05.

**Acceptance Criteria**

- [ ] Given the input model, when configured, then every input has a source field, type and validation, and the engine refuses to run with missing mandatory inputs.
- [ ] Given the country catalogue, when set up, then each of the six GCC countries has an EOSB rule profile with eligibility minimum, accrual structure, caps and salary-basis definition.
- [ ] Given an effective-dated rule, when a separation date falls in a period, then the rule version in force for that date is selected.
- [ ] Given a new country/rule profile, when added in config, then the engine consumes it with no code change.
- [ ] Given the country-wise overview (28.6), then a comparison view of the six profiles is available; any change is audited.

**Tasks**

- [ ] Backend: `eosb_input_definition` + `eosb_country_rule_profile` (countryCode, eligibilityMinMonths, accrualStructure JSON, caps, salaryBasisDef, effectiveFrom/To)
- [ ] Backend: rule-catalogue loader resolving profile by country + date
- [ ] Backend: mandatory-input guard
- [ ] Frontend: input-definition + country-rule-profile config screens; six-country comparison view
- [ ] Rules/Config: seed UAE/KSA/Bahrain/Qatar/Oman/Kuwait profiles
- [ ] Tests: unit tests for date-based profile resolution and mandatory-input guard

**Covers:** 28.5, 28.6
**Dependencies:** EPIC-28-S01

### EPIC-28-S03 — EOSB Formula Engine Core (Configurable, Effective-Dated)

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 13
**As a** Payroll Officer, **I want** a configurable EOSB formula engine that evaluates per-country accrual rules into a gratuity/award/indemnity amount with a full line-by-line breakdown, **so that** EOSB is computed consistently, transparently and without code changes per rule.

**Description**
The heart of the epic: a rule-driven engine that takes the EOSB input snapshot and the country rule profile and evaluates the entitlement. It supports tiered/banded accrual (e.g. day-rate-per-year that changes after a service threshold), capped entitlements, eligibility minimums, daily-wage derivation, and resignation/termination multipliers (applied via S06). Every run produces an immutable breakdown showing each band, days/years applied, day-rate, sub-totals, caps hit, and the final figure — the basis for the calculation sheet and any dispute.

**Acceptance Criteria**

- [ ] Given an input snapshot and country profile, when the engine runs, then it produces the entitlement amount plus a line-by-line breakdown (band, qualifying service, day-rate, sub-total, cap applied).
- [ ] Given a tiered structure, when service spans a threshold, then each portion of service is accrued at its correct band rate and summed.
- [ ] Given an entitlement cap, when the computed amount exceeds it, then it is capped and the cap is shown in the breakdown.
- [ ] Given service below the eligibility minimum, then the engine returns the configured outcome (zero or pro-rata) per the profile.
- [ ] Given effective-dated rules, when a historical or future separation is computed, then the rule in force at the last working day is applied.
- [ ] Given any run, then the complete input/output snapshot is persisted immutably for audit and re-computation.

**Tasks**

- [ ] Backend: `eosb_formula_engine` service evaluating `eosb_country_rule_profile` accrual JSON
- [ ] Backend: `eosb_calculation` + `eosb_calculation_line` entities (band, serviceDays, dayRate, subTotal, capApplied)
- [ ] Backend: daily-wage derivation + cap + eligibility-minimum handling
- [ ] Frontend: calculation runner with breakdown viewer
- [ ] Rules/Config: accrual-structure schema supporting bands, caps, thresholds
- [ ] Tests: unit tests per accrual structure incl. threshold crossing, capping, sub-minimum service

**Covers:** 28.5 (engine evaluation aspect)
**Dependencies:** EPIC-28-S02

### EPIC-28-S04 — UAE & Saudi EOSB Rules (Gratuity 21→30 days/yr; KSA Award)

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** the UAE end-of-service gratuity and Saudi Arabia end-of-service award encoded as formula-engine rule profiles, **so that** AuraOS produces legally correct EOSB for the two largest GCC populations.

**Description**
Implements the UAE gratuity profile (21 days' basic wage per year for the first five years, 30 days' basic wage per year thereafter, on the basic-salary basis, with the statutory two-years-wage cap and the unlimited/limited-contract resignation treatment) and the Saudi end-of-service award profile (half-month wage per year for the first five years, full-month wage per year thereafter, with the resignation bands of <2 / 2–5 / 5–10 / 10+ years). All thresholds, day-counts and bands are configurable in the country rule profile from S02.

**Acceptance Criteria**

- [ ] Given a UAE employee, when EOSB runs, then 21 days' basic wage per year applies to the first 5 years and 30 days' per year thereafter, on basic salary, capped at two years' total wage.
- [ ] Given a Saudi employee, when EOSB runs, then a half-month wage per year applies to the first 5 years and a full month per year thereafter.
- [ ] Given a Saudi resignation, when computed, then the award reduction bands (<2, 2–5, 5–10, 10+ years) are applied per S06 configuration.
- [ ] Given a part-year of service, when computed, then it is prorated by the configured day basis.
- [ ] Given these rules, then all rates/thresholds/caps are stored as effective-dated config, editable without code, and any change is audited.

**Tasks**

- [ ] Backend: UAE gratuity accrual profile (21/30-day bands, basic-wage basis, 2-year cap)
- [ ] Backend: KSA award accrual profile (half/full-month bands)
- [ ] Backend: proration of part-years per day basis
- [ ] Frontend: profile viewer/editor for UAE & KSA showing bands and caps
- [ ] Rules/Config: seed UAE & KSA rates, thresholds, caps, salary basis
- [ ] Tests: unit tests with worked examples (e.g. UAE 7-yr, KSA 12-yr, sub-5-yr proration)

**Covers:** 28.7, 28.8
**Dependencies:** EPIC-28-S03

### EPIC-28-S05 — Bahrain, Qatar, Oman & Kuwait EOSB Rules (Gratuity / Indemnity / Social-Protection Linkage)

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** the Bahrain, Qatar, Oman and Kuwait end-of-service gratuity/indemnity rules encoded as formula-engine profiles, **so that** EOSB is correct across the remaining GCC jurisdictions, including social-protection-funded schemes.

**Description**
Implements the four remaining country profiles: Bahrain gratuity/indemnity (tiered day-rate bands for expatriates, with awareness of the SIO-administered monthly funding of expatriate gratuity so the lump-sum is reduced by the funded portion); Qatar gratuity (minimum three-weeks' basic wage per year, configurable upward, with eligibility minimum of one year); Oman gratuity with the Social Protection Fund linkage (post-reform contributions reduce/replace employer lump-sum for in-scope workers); and Kuwait end-of-service indemnity (15 days/yr for the first five years, one month/yr thereafter, with the resignation-based fractional entitlement bands). All bands/rates/caps are configurable.

**Acceptance Criteria**

- [ ] Given a Bahrain expatriate, when EOSB runs, then the gratuity day-rate bands apply and the SIO-funded portion (from the social-insurance epic) is netted into the lump-sum result.
- [ ] Given a Qatar employee with ≥1 year service, when computed, then at least three weeks' basic wage per year of service is accrued, configurable upward.
- [ ] Given an Oman worker in scope of the Social Protection Fund, when computed, then the SPF-funded period reduces/replaces the employer lump-sum per the configured linkage.
- [ ] Given a Kuwait employee, when computed, then 15 days/yr for the first 5 years and one month/yr thereafter apply, with resignation fractional bands (e.g. 1/2 for 3–5, 2/3 for 5–10, full for 10+) per S06.
- [ ] Given all four, then rates/bands/caps and social-protection linkage are effective-dated config; any change is audited.

**Tasks**

- [ ] Backend: Bahrain, Qatar, Oman, Kuwait accrual profiles
- [ ] Backend: social-protection netting hooks (Bahrain SIO funded balance; Oman SPF funded period)
- [ ] Backend: Kuwait resignation fractional-band handling
- [ ] Frontend: profile viewer/editor for the four countries
- [ ] Rules/Config: seed Bahrain/Qatar/Oman/Kuwait rates, eligibility minimums, social-protection linkage flags
- [ ] Tests: unit tests with worked examples per country incl. funded-portion netting

**Covers:** 28.9, 28.10, 28.11, 28.12
**Dependencies:** EPIC-28-S03, EPIC-28-S11

### EPIC-28-S06 — Resignation vs Termination Impact Engine

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** the EOSB result adjusted automatically for separation type and reason (resignation, termination, mutual, redundancy, abandonment, retirement, death), **so that** statutory reductions and forfeitures are applied correctly and defensibly.

**Description**
Adds the separation-impact layer over the formula engine: per country and separation type, configurable rules determine whether the full entitlement applies, a reduced fraction applies (e.g. KSA resignation bands, Kuwait fractional bands), or entitlement is forfeited (e.g. dismissal for gross misconduct under defined articles). Pulls the separation type/reason from EPIC-27 and applies the right multiplier/treatment, with the reasoning shown in the breakdown so it can be justified in a dispute.

**Acceptance Criteria**

- [ ] Given a separation type and reason from EPIC-27, when EOSB runs, then the configured per-country treatment (full / reduced fraction / forfeit) is applied.
- [ ] Given a Saudi resignation, when service falls in a band, then the corresponding fraction is applied; given Kuwait resignation, then the Kuwait fractional band is applied.
- [ ] Given a dismissal for a forfeiting reason (configurable), when computed, then entitlement is reduced/forfeited per the configured article and clearly flagged.
- [ ] Given a redundancy/termination-by-employer, when computed, then no resignation reduction applies.
- [ ] Given the adjustment, then the reason, rule reference and multiplier are shown in the breakdown and audited.

**Tasks**

- [ ] Backend: `eosb_separation_treatment` config (countryCode, separationType, reasonCode, treatment, fraction, ruleRef, effectiveFrom)
- [ ] Backend: separation-impact resolver layered over the formula engine
- [ ] Backend: consumer of EPIC-27 separation type/reason
- [ ] Frontend: treatment-matrix config + breakdown display of applied treatment
- [ ] Rules/Config: seed per-country resignation/termination/forfeit treatments
- [ ] Tests: unit tests across separation types/reasons per country

**Covers:** 28.13
**Dependencies:** EPIC-28-S04, EPIC-28-S05, EPIC-27

### EPIC-28-S07 — Service Period Calculation

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** the qualifying service period derived precisely from join date to last working day with configurable rules for breaks, transfers and notice, **so that** EOSB accrues on the correct service length.

**Description**
Computes qualifying service in years/months/days from the continuous-service start date to the last working day, with configurable handling of: continuous-service preservation across internal transfers/rehires, treatment of notice period and garden leave as service, exclusion rules for ineligible periods, and the day-count basis (e.g. 365 vs 30-day months) per country. Produces the service figure consumed by the accrual engine and shown on the calculation sheet.

**Acceptance Criteria**

- [ ] Given join and last-working-day dates, when computed, then qualifying service is returned in years/months/days using the country day-count basis.
- [ ] Given an internal transfer or rehire flagged as continuous, then prior service is preserved and combined per configuration.
- [ ] Given notice period/garden leave, then it is included or excluded per the configured rule and reflected in the last-working-day used.
- [ ] Given an ineligible period (configurable), then it is excluded with the adjustment shown.
- [ ] Given the service result, then the derivation is shown line-by-line and audited.

**Tasks**

- [ ] Backend: service-period service producing `eosb_service_period` (years, months, days, basis, adjustments[])
- [ ] Backend: continuous-service / transfer / rehire resolution
- [ ] Backend: notice/garden-leave inclusion rule
- [ ] Frontend: service-period breakdown panel
- [ ] Rules/Config: day-count basis + inclusion/exclusion rules per country
- [ ] Tests: unit tests for transfers, rehires, notice inclusion, day-count bases

**Covers:** 28.14
**Dependencies:** EPIC-28-S03, EPIC-27

### EPIC-28-S08 — Salary Basis Derivation

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** the EOSB salary basis derived from the configured components per country, **so that** the day/month rate uses the legally correct wage (e.g. basic-only in UAE; broader components where required).

**Description**
Defines, per country and rule profile, which salary components form the EOSB basis (e.g. UAE basic salary only; some jurisdictions include certain allowances), how the basis is determined at separation (last drawn vs average over a period), and how the daily/monthly rate is derived from it. Produces the salary-basis snapshot that the accrual engine multiplies by qualifying days/years.

**Acceptance Criteria**

- [ ] Given a country rule profile, when configured, then the included salary components for the EOSB basis are selectable per jurisdiction.
- [ ] Given the basis method, when set to "last drawn" or "average", then the engine derives the basis accordingly from payroll history.
- [ ] Given the basis amount, when computed, then the daily/monthly rate is derived using the country day-count basis and shown.
- [ ] Given a UAE employee, then by default only basic salary forms the basis unless reconfigured.
- [ ] Given any basis derivation, then the components and method are shown on the calculation sheet and audited.

**Tasks**

- [ ] Backend: `eosb_salary_basis_rule` (countryCode, includedComponentCodes[], method, averagingWindow, effectiveFrom)
- [ ] Backend: salary-basis service producing `eosb_salary_basis` snapshot + day/month-rate
- [ ] Frontend: salary-basis rule config + per-employee basis breakdown
- [ ] Rules/Config: seed UAE basic-only + other-country component sets and methods
- [ ] Tests: unit tests for last-drawn vs average and component inclusion

**Covers:** 28.15
**Dependencies:** EPIC-28-S03, EPIC-10

### EPIC-28-S09 — Unpaid Leave Impact on EOSB

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** unpaid-leave periods to reduce qualifying service for EOSB per the configured country rule, **so that** the entitlement does not over-accrue for time not worked/paid.

**Description**
Pulls unpaid-leave history from the leave module and, per country rule, deducts the configured portion of unpaid-leave days from qualifying service (some jurisdictions exclude unpaid leave from service; others have thresholds). The adjustment is applied before accrual and shown explicitly so the leaver can see how unpaid leave changed their service and entitlement.

**Acceptance Criteria**

- [ ] Given unpaid-leave records, when EOSB runs, then the configured per-country treatment (exclude all / exclude above threshold / include) is applied to qualifying service.
- [ ] Given the deduction, when applied, then the reduced qualifying service flows to the accrual engine and the day reduction is shown.
- [ ] Given a country that does not exclude unpaid leave, then no reduction is applied per configuration.
- [ ] Given the adjustment, then unpaid-leave days, rule applied and resulting service delta appear on the calculation sheet.
- [ ] Given any unpaid-leave adjustment, then it is audited and re-computable.

**Tasks**

- [ ] Backend: consumer of leave history; unpaid-leave aggregation per employee
- [ ] Backend: unpaid-leave service-adjustment rule applied in service-period derivation
- [ ] Frontend: unpaid-leave impact line on calculation sheet
- [ ] Rules/Config: per-country unpaid-leave treatment (exclude/threshold/include)
- [ ] Tests: unit tests across treatments and thresholds

**Covers:** 28.16
**Dependencies:** EPIC-28-S07, EPIC-20

### EPIC-28-S10 — Social Insurance & Pension Interaction (Funded-Balance Netting)

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**As a** Compliance Officer, **I want** EOSB to interact correctly with social-insurance/pension funding (GOSI, GPSSA, SIO, Oman SPF) so that funded portions are netted and nationals' treatment is handled per country, **so that** the employer neither double-funds nor under-pays.

**Description**
Models the interaction between EOSB and social-insurance/pension: for GCC nationals (covered by GPSSA/GOSI/SIO pension), EOSB treatment differs from expatriates per country rule (some nationals receive pension instead of/alongside gratuity); for expatriates under funded schemes (Bahrain SIO monthly gratuity funding, Oman SPF), the funded balance reduces the employer lump-sum. This story consumes funded-balance/service data from the social-insurance epics and nets it into the EOSB result, flagging any shortfall the employer must top up.

**Acceptance Criteria**

- [ ] Given a GCC national, when EOSB runs, then the configured national treatment (pension-covered, gratuity, or combination) is applied per country.
- [ ] Given an expatriate under a funded scheme, when computed, then the funded balance (from SIO/SPF) is netted from the lump-sum and any employer top-up is shown.
- [ ] Given a funded balance exceeding the entitlement, then the lump-sum is reduced to zero and the surplus is noted (no negative payout).
- [ ] Given the interaction, then funded amount, netting and top-up appear on the calculation sheet.
- [ ] Given any netting, then the source social-insurance reference and value are audited.

**Tasks**

- [ ] Backend: funded-balance/pension-interaction consumer (GOSI/GPSSA/SIO/SPF APIs)
- [ ] Backend: netting logic + top-up/shortfall computation in the engine
- [ ] Frontend: social-insurance interaction lines on calculation sheet
- [ ] Rules/Config: per-country national vs expatriate EOSB-vs-pension treatment
- [ ] Tests: unit tests for national treatment, expat netting, surplus handling

**Covers:** 28.17
**Dependencies:** EPIC-28-S04, EPIC-28-S05, EPIC-13, EPIC-14, EPIC-15

### EPIC-28-S11 — EOSB Provisioning & Accounting (Monthly Accrual + GL)

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**As a** Payroll Officer, **I want** EOSB liability accrued monthly per employee and posted as journal data to finance, **so that** the balance sheet reflects an accurate, audit-ready provision at all times.

**Description**
Runs a monthly EOSB provisioning calculation: for every active employee, the engine computes the hypothetical entitlement at month-end (as if they left), records the period accrual (movement vs prior month: service increase, salary change, new joiners, leavers releasing provision), and produces journal lines (provision charge, release on settlement) for the Payroll→GL integration. Maintains a per-employee accrued-liability ledger feeding the dashboard and audit.

**Acceptance Criteria**

- [ ] Given month-end, when provisioning runs, then each active employee's accrued EOSB liability is computed and the movement vs prior month recorded.
- [ ] Given a new joiner, salary change, or service growth, when provisioned, then the accrual movement is captured and explained.
- [ ] Given a leaver, when settled, then the provision is released and the difference vs actual payout posted.
- [ ] Given the provisioning run, then journal lines (charge/release) are produced and handed to the GL integration with a cost-centre/entity split.
- [ ] Given the per-employee ledger, then accrued balances reconcile to the total provision and are auditable.

**Tasks**

- [ ] Backend: monthly provisioning job using the formula engine in "as-if-leaving" mode
- [ ] Backend: `eosb_provision_ledger` (employeeId, period, openingBal, accrual, release, closingBal) + journal builder
- [ ] Backend: GL hand-off payload (account, cost centre, entity)
- [ ] Frontend: provision movement report + per-employee ledger
- [ ] Rules/Config: provision GL mapping per entity
- [ ] Tests: unit tests for movement, release on settlement, ledger reconciliation

**Covers:** 28.18
**Dependencies:** EPIC-28-S03, EPIC-10

### EPIC-28-S12 — EOSB ↔ Final Settlement Integration

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**As an** HR Admin, **I want** the EOSB figure to flow into the final settlement with maker-checker approval and provision release, **so that** the leaver's settlement is accurate, approved and accounted for end-to-end.

**Description**
Connects EOSB to the EPIC-27 final settlement: on separation the EOSB calculation is generated, attached to the final settlement alongside leave encashment, deductions and recoveries, routed through maker-checker (preparer ≠ approver), and on approval/payout the provision is released and the actual-vs-provision difference posted. Prevents the settlement from being finalised without an approved EOSB figure.

**Acceptance Criteria**

- [ ] Given a separation, when initiated, then an EOSB calculation is generated and attached to the final settlement record.
- [ ] Given the EOSB figure, when submitted, then maker-checker requires an approver different from the preparer before it can be included in payout.
- [ ] Given final settlement approval, then the EOSB amount is locked, the provision released, and any actual-vs-provision variance posted.
- [ ] Given a settlement attempted without an approved EOSB, then it is blocked with a clear message.
- [ ] Given any settlement integration step, then it is audited and the locked breakdown retained.

**Tasks**

- [ ] Backend: EOSB→final-settlement attachment + lock-on-approval
- [ ] Backend: maker-checker state machine via workflow engine
- [ ] Backend: provision-release + actual-vs-provision posting on payout
- [ ] Frontend: EOSB panel within the final-settlement screen
- [ ] Alerts/Workflow: approval routing + block-without-approved-EOSB gate
- [ ] Tests: integration test settlement incl. preparer≠approver and provision release

**Covers:** 28.19
**Dependencies:** EPIC-28-S03, EPIC-28-S06, EPIC-28-S11, EPIC-27

### EPIC-28-S13 — EOSB Disputes Management & Dispute Register

**Labels:** `user-story`, `eosb` · **Priority:** Should · **Estimate:** 5
**As an** Employee Relations / Compliance Officer, **I want** EOSB disputes logged, investigated and resolved against the locked calculation, **so that** challenges are handled transparently and the entity is defensible in a labour claim.

**Description**
Provides a dispute workflow and configurable EOSB Dispute Register: a leaver (or authority) raises a dispute against a specific EOSB calculation; HR records the claim, attaches the locked breakdown, runs a recalculation/what-if, records the resolution (upheld/revised/rejected), any adjustment, and links to any labour-court/authority reference. The register tracks status, ageing, root cause and outcome, feeding the audit checklist and dashboard.

**Acceptance Criteria**

- [ ] Given a finalised EOSB, when a dispute is raised, then it is logged against the specific calculation with the locked breakdown attached.
- [ ] Given a dispute, when investigated, then a recalculation/what-if can be run and compared to the original without altering the locked figure.
- [ ] Given a resolution, when recorded, then outcome (upheld/revised/rejected), adjustment amount, authority reference and resolution date are captured.
- [ ] Given an open dispute ageing beyond threshold, then it is escalated and flagged.
- [ ] Given the register, then it filters by status/country/outcome, exports, and feeds the monthly pack; all actions are audited.

**Tasks**

- [ ] Backend: `eosb_dispute` + `eosb_dispute_register` entities (calcRef, claim, status, outcome, adjustment, authorityRef)
- [ ] Backend: what-if recalculation isolated from locked figure
- [ ] Frontend: dispute workflow + register grid with filters/export
- [ ] Alerts/Workflow: ageing escalation to HR/Compliance Manager
- [ ] Tests: unit tests for what-if isolation and status transitions

**Covers:** 28.20, 28.28
**Dependencies:** EPIC-28-S12

### EPIC-28-S14 — EOSB Audit Checklist & Risk Matrix

**Labels:** `user-story`, `eosb` · **Priority:** Should · **Estimate:** 5
**As an** Internal Auditor, **I want** a configurable EOSB audit checklist and risk matrix with red-flag detection, **so that** I can verify EOSB correctness and track risks to closure.

**Description**
Provides a configurable EOSB audit checklist (rule-version correctness, salary-basis correctness, service-period accuracy, resignation/termination treatment applied, unpaid-leave adjustment, social-insurance netting, maker-checker on settlement, provision reconciliation, dispute handling) and a risk matrix seeded with common EOSB risks (wrong day-rate, mis-applied resignation reduction, stale rule version, under-provisioning, missing funded-balance netting, late settlement). System red-flags auto-create findings; risks tracked with likelihood/impact/owner/mitigation and a heatmap.

**Acceptance Criteria**

- [ ] Given the checklist, when run for a period/sample, then each item is scored Pass/Fail/NA with evidence links to calculations.
- [ ] Given system red-flags (override without note, stale rule version, settlement without approval, provision mismatch), then they auto-create findings.
- [ ] Given the risk matrix, then each risk has likelihood, impact, score, owner, mitigation, with a heatmap.
- [ ] Given a failed item, then a corrective action can be raised and tracked to closure.
- [ ] Given RBAC, only Internal Auditor / Compliance Officer may edit templates and risks.

**Tasks**

- [ ] Backend: `eosb_audit_checklist_template` + `eosb_audit_result` + `eosb_risk` entities
- [ ] Backend: red-flag-to-finding generator
- [ ] Frontend: checklist runner + risk heatmap
- [ ] Alerts/Workflow: corrective-action raise and reminders
- [ ] Tests: unit tests for scoring and auto-findings

**Covers:** 28.21, 28.23
**Dependencies:** EPIC-28-S03, EPIC-28-S11, EPIC-28-S12

### EPIC-28-S15 — EOSB KPIs & Dashboard

**Labels:** `user-story`, `eosb` · **Priority:** Should · **Estimate:** 5
**As an** Executive / Leadership user, **I want** an EOSB KPI dashboard, **so that** I can see total liability, settlement timeliness, disputes and provision health at a glance.

**Description**
Delivers EOSB KPIs (total accrued liability by entity/country, average settlement turnaround days, settlement-on-time %, EOSB dispute count/value, dispute resolution time, provision-vs-actual variance, funded-vs-employer split, forfeiture/reduction count) and a role-based dashboard with trend charts and drill-down, filterable by entity, country, nationality and period.

**Acceptance Criteria**

- [ ] Given EOSB data, when the dashboard loads, then KPIs render with value, target and trend.
- [ ] Given filters (entity, country, nationality, period), when applied, then tiles and charts update consistently.
- [ ] Given a KPI breaching target (e.g. settlement turnaround), then it is red with drill-down to records.
- [ ] Given RBAC, Executives see liability/summary tiles; Payroll/Compliance see operational drill-downs.
- [ ] Given export, then KPI snapshots export for the monthly pack.

**Tasks**

- [ ] Backend: KPI aggregation service + materialized views over calculations/provisions/disputes
- [ ] Backend: KPI definition config (target, formula, direction)
- [ ] Frontend: EOSB dashboard with tiles, charts, drill-down, filters
- [ ] Rules/Config: KPI targets per entity
- [ ] Tests: unit tests for KPI calculations and filters

**Covers:** 28.22, 28.25
**Dependencies:** EPIC-28-S11, EPIC-28-S12, EPIC-28-S13

### EPIC-28-S16 — HRMS EOSB Automation Design (Events, Rule Engine, Workflow)

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**As a** System Administrator, **I want** the EOSB module wired into the event bus, country rule engine and workflow engine, **so that** EOSB runs straight-through, is fully configurable per country, and fails safe on missing rules.

**Description**
Makes the integration backbone explicit: separation/salary-change/leave/social-insurance events trigger EOSB recalculation and provisioning; the rule engine holds all EOSB parameters (country profiles, salary basis, service rules, separation treatments, caps, provision mappings) configurable per country with effective-dating; the workflow engine drives maker-checker and dispute escalation; notifications and a standardised audit envelope are applied throughout.

**Acceptance Criteria**

- [ ] Given the rule engine, when an EOSB parameter changes, then no deployment is needed and it is effective-dated.
- [ ] Given domain events (`employee.separationInitiated`, `employee.salaryChanged`, `leave.unpaidRecorded`, `socialInsurance.fundedBalanceUpdated`, `payroll.monthEnd`), then EOSB handlers react idempotently.
- [ ] Given the workflow engine, then EOSB maker-checker and dispute-escalation paths are reusable and configurable.
- [ ] Given an unconfigured country/rule, when EOSB runs, then it fails safe with a clear error rather than producing a wrong figure.
- [ ] Given all EOSB actions, then a standardised audit envelope (who/when/inputs/outputs) is recorded.

**Tasks**

- [ ] Backend: EOSB event handlers with idempotency keys
- [ ] Backend: rule-engine namespace `eosb.*` with effective-dated parameter store
- [ ] Backend: workflow templates for EOSB approval and disputes
- [ ] Backend: fail-safe guard for missing/expired rule profile
- [ ] Rules/Config: parameterise profiles, salary basis, service rules, treatments, caps, provision mapping per country
- [ ] Tests: integration tests for idempotency and fail-safe

**Covers:** 28.24
**Dependencies:** EPIC-28-S03, EPIC-28-S11, EPIC-28-S12

### EPIC-28-S17 — Monthly EOSB Compliance Pack

**Labels:** `user-story`, `eosb` · **Priority:** Should · **Estimate:** 5
**As a** Compliance Officer, **I want** a one-click Monthly EOSB Compliance Pack, **so that** I have a complete sign-off-ready evidence bundle of EOSB liability and settlement activity each month.

**Description**
Compiles the period's EOSB artefacts into one downloadable pack: provision movement summary, settlements completed (with calculation sheets), open disputes, KPI snapshot, social-insurance netting summary, provision-vs-actual reconciliation, and the EOSB compliance certificate. Requires sign-off, is versioned and archived for retention.

**Acceptance Criteria**

- [ ] Given a closed EOSB period, when the pack is generated, then it includes provision movement, settlements with calculation sheets, open disputes, KPI snapshot, netting summary, and provision-vs-actual reconciliation.
- [ ] Given the pack, then it requires Compliance Officer sign-off before Final.
- [ ] Given an unreconciled provision, when generation is attempted, then it is blocked or flagged with outstanding items.
- [ ] Given a finalised pack, then it is archived immutably with version/retention metadata.
- [ ] Given export, then PDF and Excel outputs are produced.

**Tasks**

- [ ] Backend: compliance-pack assembler aggregating provision/settlement/dispute/KPI/netting artefacts
- [ ] Backend: immutable archive + retention metadata
- [ ] Frontend: pack preview + sign-off
- [ ] Alerts/Workflow: sign-off request to Compliance Officer
- [ ] Tests: integration test for pack contents and block-on-unreconciled

**Covers:** 28.26
**Dependencies:** EPIC-28-S11, EPIC-28-S13, EPIC-28-S15

### EPIC-28-S18 — Sample EOSB Calculation Sheet (Configurable Form/Export)

**Labels:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 5
**As a** Payroll Officer, **I want** a configurable EOSB Calculation Sheet auto-populated from the calculation with a full line-by-line breakdown, **so that** the leaver and auditors see exactly how the figure was derived.

**Description**
Provides a digital, template-driven EOSB Calculation Sheet auto-populated from a calculation: employee/entity/country, join and last-working-day dates, qualifying service (with unpaid-leave adjustment), salary basis and day/month rate, accrual bands with sub-totals, caps, resignation/termination treatment, social-insurance netting, and the final entitlement. Configurable per entity, bilingual (EN/AR), exports to PDF and attaches to the final settlement and dispute records.

**Acceptance Criteria**

- [ ] Given a calculation, when generated, then the sheet auto-populates identity, dates, service (incl. unpaid-leave adjustment), salary basis/rate, accrual bands, caps, separation treatment, netting and final figure.
- [ ] Given the template, when configured, then header/footer/clauses/logo are editable per entity without code, and EN/AR layouts are supported.
- [ ] Given the sheet, when generated, then it exports to PDF and attaches to the final settlement and any dispute.
- [ ] Given a recalculation, then a new versioned sheet is produced and the prior retained.
- [ ] Given any sheet generation, then it is audited.

**Tasks**

- [ ] Backend: calculation-sheet template engine + calculation data-binding
- [ ] Backend: versioning + PDF export + attachment links
- [ ] Frontend: template editor + generate/preview screen
- [ ] Rules/Config: per-entity template config (EN/AR)
- [ ] Tests: unit test for data-binding, versioning and PDF export

**Covers:** 28.27
**Dependencies:** EPIC-28-S03, EPIC-28-S06, EPIC-28-S09, EPIC-28-S10

### EPIC-28-S19 — Sample EOSB Monthly Compliance Certificate (Configurable Form)

**Labels:** `user-story`, `eosb` · **Priority:** Should · **Estimate:** 3
**As a** Compliance Officer, **I want** a configurable EOSB Monthly Compliance Certificate auto-populated from period data with attestation, **so that** I can certify and evidence EOSB compliance and provisioning.

**Description**
Provides a digital, template-driven EOSB certificate auto-populated from the period (entity, country, total accrued liability, provision movement, settlements completed and on-time %, open disputes, provision-vs-actual variance, netting total) with an e-attestation block. Configurable per entity, exports to PDF and attaches to the monthly pack.

**Acceptance Criteria**

- [ ] Given a finalised EOSB period, when generated, then the certificate auto-populates entity, country, total liability, provision movement, settlement stats, disputes, and provision-vs-actual variance.
- [ ] Given the template, when configured, then header/footer/clauses/logo are editable per entity without code.
- [ ] Given the certifying user, when they attest, then an e-signature with name, role and timestamp is recorded.
- [ ] Given generation, then it exports to PDF and attaches to the monthly pack.
- [ ] Given any certificate, then it is audited and versioned.

**Tasks**

- [ ] Backend: certificate template engine + period data-binding
- [ ] Backend: e-attestation capture and versioning
- [ ] Frontend: template editor + generate/attest screen
- [ ] Rules/Config: per-entity template configuration
- [ ] Tests: unit test for data-binding and PDF export

**Covers:** 28.29
**Dependencies:** EPIC-28-S17

### EPIC-28-S20 — EOSB Key Takeaways & In-Product Guidance

**Labels:** `user-story`, `eosb` · **Priority:** Could · **Estimate:** 2
**As an** HR Admin, **I want** EOSB key takeaways and best-practice guidance surfaced in-product, **so that** users understand entitlements and avoid common EOSB mistakes.

**Description**
Surfaces the chapter's key takeaways as a configurable guidance panel and a short readiness checklist for EOSB users (use the correct country rule, confirm salary basis, apply resignation treatment, adjust unpaid leave, net social-insurance funding, get maker-checker approval, release provision on payout). Content is admin-editable, versioned and EN/AR.

**Acceptance Criteria**

- [ ] Given the EOSB module home, when opened, then a key-takeaways panel shows configurable guidance.
- [ ] Given a first-time user, then a short readiness checklist of EOSB essentials is shown.
- [ ] Given guidance content, when edited, then it is versioned and effective-dated.
- [ ] Given localisation, then guidance supports English/Arabic.

**Tasks**

- [ ] Backend: `eosb_guidance_content` table (key, body, locale, version)
- [ ] Frontend: key-takeaways panel + first-run checklist
- [ ] Rules/Config: admin-editable guidance EN/AR
- [ ] Tests: unit test for versioning and locale fallback

**Covers:** 28.30
**Dependencies:** EPIC-28-S01
