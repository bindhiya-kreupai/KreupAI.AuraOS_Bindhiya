# Gap Analysis: EPIC-28-S04 — UAE & Saudi EOSB Rules (Gratuity 21→30 days/yr; KSA Award)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** the UAE end-of-service gratuity and Saudi Arabia end-of-service award encoded as formula-engine rule profiles, **so that** AuraOS produces legally correct EOSB for the two largest GCC populations.

**Description**
Implements the UAE gratuity profile (21 days' basic wage per year for the first five years, 30 days' basic wage per year thereafter, on the basic-salary basis, with the statutory two-years-wage cap and the unlimited/limited-contract resignation treatment) and the Saudi end-of-service award profile (half-month wage per year for the first five years, full-month wage per year thereafter, with the resignation bands of <2 / 2–5 / 5–10 / 10+ years). All thresholds, day-counts and bands are configurable in the country rule profile from S02.

**Covers:** 28.7, 28.8
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

- [ ] Given a UAE employee, when EOSB runs, then 21 days' basic wage per year applies to the first 5 years and 30 days' per year thereafter, on basic salary, capped at two years' total wage.
- [ ] Given a Saudi employee, when EOSB runs, then a half-month wage per year applies to the first 5 years and a full month per year thereafter.
- [ ] Given a Saudi resignation, when computed, then the award reduction bands (<2, 2–5, 5–10, 10+ years) are applied per S06 configuration.
- [ ] Given a part-year of service, when computed, then it is prorated by the configured day basis.
- [ ] Given these rules, then all rates/thresholds/caps are stored as effective-dated config, editable without code, and any change is audited.

## Implementation Tasks From Backlog

- [ ] Backend: UAE gratuity accrual profile (21/30-day bands, basic-wage basis, 2-year cap)
- [ ] Backend: KSA award accrual profile (half/full-month bands)
- [ ] Backend: proration of part-years per day basis
- [ ] Frontend: profile viewer/editor for UAE & KSA showing bands and caps
- [ ] Rules/Config: seed UAE & KSA rates, thresholds, caps, salary basis
- [ ] Tests: unit tests with worked examples (e.g. UAE 7-yr, KSA 12-yr, sub-5-yr proration)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
