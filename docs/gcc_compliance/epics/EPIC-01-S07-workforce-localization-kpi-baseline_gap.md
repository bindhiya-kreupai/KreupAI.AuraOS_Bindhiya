# Gap Analysis: EPIC-01-S07 — Workforce localization & KPI baseline

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-01-gcc-employment-landscape.md](./EPIC-01-gcc-employment-landscape.md)
> Parent epic: EPIC-01: Chapter 1: GCC Employment Landscape
> Module: Foundation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5

**Description**
Builds the baseline KPI layer off the national/expat data model: national % per entity/country, expat headcount, total headcount, and placeholders for module KPIs (visa-expiry exposure, WPS status, social-insurance coverage) that later epics populate.

**Covers:** 1.2, 1.3
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given employee data, when KPIs compute, then national %, expat count and total headcount are produced per entity and rolled up per country and tenant.
- [ ] Given a localization target is configured (e.g., a nationalization %), then the KPI shows actual vs. target with a RAG status.
- [ ] Given a country with no employees yet, then KPIs render zero/empty without error.
- [ ] Given KPIs, then they refresh on `employee.classified` events and on a scheduled recompute.
- [ ] Given RBAC, then Executives/Compliance see all assigned countries; Line Managers see only their scope.
- [ ] Given any KPI snapshot, then it is timestamped for trend tracking.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation service producing `WorkforceKpiSnapshot` per entity/country/date; migration.
- [ ] Backend: subscribe to classification events + scheduled recompute job.
- [ ] Frontend: KPI tiles (national %, headcount, target RAG) reused by the landscape dashboard.
- [ ] Rules/Config: configurable localization targets per country/entity.
- [ ] Tests: unit tests for aggregation/rollup and RAG thresholds.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
