# Gap Analysis: EPIC-28-S07 — Service Period Calculation

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** the qualifying service period derived precisely from join date to last working day with configurable rules for breaks, transfers and notice, **so that** EOSB accrues on the correct service length.

**Description**
Computes qualifying service in years/months/days from the continuous-service start date to the last working day, with configurable handling of: continuous-service preservation across internal transfers/rehires, treatment of notice period and garden leave as service, exclusion rules for ineligible periods, and the day-count basis (e.g. 365 vs 30-day months) per country. Produces the service figure consumed by the accrual engine and shown on the calculation sheet.

**Covers:** 28.14
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/lib/services/taxCalculationEngine.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given join and last-working-day dates, when computed, then qualifying service is returned in years/months/days using the country day-count basis.
- [ ] Given an internal transfer or rehire flagged as continuous, then prior service is preserved and combined per configuration.
- [ ] Given notice period/garden leave, then it is included or excluded per the configured rule and reflected in the last-working-day used.
- [ ] Given an ineligible period (configurable), then it is excluded with the adjustment shown.
- [ ] Given the service result, then the derivation is shown line-by-line and audited.

## Implementation Tasks From Backlog

- [ ] Backend: service-period service producing `eosb_service_period` (years, months, days, basis, adjustments[])
- [ ] Backend: continuous-service / transfer / rehire resolution
- [ ] Backend: notice/garden-leave inclusion rule
- [ ] Frontend: service-period breakdown panel
- [ ] Rules/Config: day-count basis + inclusion/exclusion rules per country
- [ ] Tests: unit tests for transfers, rehires, notice inclusion, day-count bases

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
