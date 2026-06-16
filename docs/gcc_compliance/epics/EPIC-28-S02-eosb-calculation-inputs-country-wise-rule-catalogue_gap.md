# Gap Analysis: EPIC-28-S02 — EOSB Calculation Inputs & Country-Wise Rule Catalogue

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** the common EOSB calculation inputs and the per-country EOSB rule catalogue modelled as configurable, effective-dated reference data, **so that** the formula engine has a single source of truth for every GCC jurisdiction's rules.

**Description**
Defines the canonical EOSB input set (join date, last working day, service years/months/days, salary basis amount, unpaid-leave days, separation type/reason, contract type, social-insurance funded balance, prior settlements) and a country rule catalogue describing each jurisdiction's accrual structure at a high level (UAE tiered day-rates, Saudi award half/full-month bands, Bahrain/Qatar/Oman/Kuwait gratuity/indemnity formulas, caps, eligibility minimums). This is the data layer the formula engine consumes; detailed per-country math lives in S03–S05.

**Covers:** 28.5, 28.6
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/services/compliance/eosb.service.test.ts
- apps/web/src/app/(modules)/payroll-compliance/eosb/accruals/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/compliance/eosb/route.ts
- apps/web/src/app/dashboard/payroll-compliance/eosb/end-of-service-benefits-calculator/page.tsx
- apps/web/src/app/dashboard/payroll-compliance/eosb/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given the input model, when configured, then every input has a source field, type and validation, and the engine refuses to run with missing mandatory inputs.
- [ ] Given the country catalogue, when set up, then each of the six GCC countries has an EOSB rule profile with eligibility minimum, accrual structure, caps and salary-basis definition.
- [ ] Given an effective-dated rule, when a separation date falls in a period, then the rule version in force for that date is selected.
- [ ] Given a new country/rule profile, when added in config, then the engine consumes it with no code change.
- [ ] Given the country-wise overview (28.6), then a comparison view of the six profiles is available; any change is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `eosb_input_definition` + `eosb_country_rule_profile` (countryCode, eligibilityMinMonths, accrualStructure JSON, caps, salaryBasisDef, effectiveFrom/To)
- [ ] Backend: rule-catalogue loader resolving profile by country + date
- [ ] Backend: mandatory-input guard
- [ ] Frontend: input-definition + country-rule-profile config screens; six-country comparison view
- [ ] Rules/Config: seed UAE/KSA/Bahrain/Qatar/Oman/Kuwait profiles
- [ ] Tests: unit tests for date-based profile resolution and mandatory-input guard

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
