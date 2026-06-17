# Gap Analysis: EPIC-28-S15 — EOSB KPIs & Dashboard

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers EOSB KPIs (total accrued liability by entity/country, average settlement turnaround days, settlement-on-time %, EOSB dispute count/value, dispute resolution time, provision-vs-actual variance, funded-vs-employer split, forfeiture/reduction count) and a role-based dashboard with trend charts and drill-down, filterable by entity, country, nationality and period.

**Covers:** 28.22, 28.25
**Acceptance criteria count:** 5 · **Task count:** 5

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

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given EOSB data, when the dashboard loads, then KPIs render with value, target and trend.
- [ ] Given filters (entity, country, nationality, period), when applied, then tiles and charts update consistently.
- [ ] Given a KPI breaching target (e.g. settlement turnaround), then it is red with drill-down to records.
- [ ] Given RBAC, Executives see liability/summary tiles; Payroll/Compliance see operational drill-downs.
- [ ] Given export, then KPI snapshots export for the monthly pack.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation service + materialized views over calculations/provisions/disputes
- [ ] Backend: KPI definition config (target, formula, direction)
- [ ] Frontend: EOSB dashboard with tiles, charts, drill-down, filters
- [ ] Rules/Config: KPI targets per entity
- [ ] Tests: unit tests for KPI calculations and filters

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
