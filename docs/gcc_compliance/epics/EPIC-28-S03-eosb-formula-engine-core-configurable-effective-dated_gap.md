# Gap Analysis: EPIC-28-S03 — EOSB Formula Engine Core (Configurable, Effective-Dated)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 13
**User story:** Payroll Officer, **I want** a configurable EOSB formula engine that evaluates per-country accrual rules into a gratuity/award/indemnity amount with a full line-by-line breakdown, **so that** EOSB is computed consistently, transparently and without code changes per rule.

**Description**
The heart of the epic: a rule-driven engine that takes the EOSB input snapshot and the country rule profile and evaluates the entitlement. It supports tiered/banded accrual (e.g. day-rate-per-year that changes after a service threshold), capped entitlements, eligibility minimums, daily-wage derivation, and resignation/termination multipliers (applied via S06). Every run produces an immutable breakdown showing each band, days/years applied, day-rate, sub-totals, caps hit, and the final figure — the basis for the calculation sheet and any dispute.

**Covers:** 28.5 (engine evaluation aspect)
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx
- apps/web/src/app/(modules)/core-hr/position-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an input snapshot and country profile, when the engine runs, then it produces the entitlement amount plus a line-by-line breakdown (band, qualifying service, day-rate, sub-total, cap applied).
- [ ] Given a tiered structure, when service spans a threshold, then each portion of service is accrued at its correct band rate and summed.
- [ ] Given an entitlement cap, when the computed amount exceeds it, then it is capped and the cap is shown in the breakdown.
- [ ] Given service below the eligibility minimum, then the engine returns the configured outcome (zero or pro-rata) per the profile.
- [ ] Given effective-dated rules, when a historical or future separation is computed, then the rule in force at the last working day is applied.
- [ ] Given any run, then the complete input/output snapshot is persisted immutably for audit and re-computation.

## Implementation Tasks From Backlog

- [ ] Backend: `eosb_formula_engine` service evaluating `eosb_country_rule_profile` accrual JSON
- [ ] Backend: `eosb_calculation` + `eosb_calculation_line` entities (band, serviceDays, dayRate, subTotal, capApplied)
- [ ] Backend: daily-wage derivation + cap + eligibility-minimum handling
- [ ] Frontend: calculation runner with breakdown viewer
- [ ] Rules/Config: accrual-structure schema supporting bands, caps, thresholds
- [ ] Tests: unit tests per accrual structure incl. threshold crossing, capping, sub-minimum service

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
