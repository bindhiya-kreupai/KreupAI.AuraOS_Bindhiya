# Gap Analysis: EPIC-13-S12 — GOSI KPIs & Dashboard

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers GOSI KPIs (registration timeliness %, on-time submission %, reconciliation pass rate, contribution-wage coverage, variance count/value, late-registration count, exited-still-listed count, employer vs employee contribution totals) and a role-based dashboard with trend charts and drill-down, filterable by entity, nationality, and period.

**Covers:** 13.15, 13.18
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given GOSI data, when the dashboard loads, then KPIs render with current value, target, and trend vs prior periods.
- [ ] Given filters (entity, nationality, period), when applied, then all tiles and charts update consistently.
- [ ] Given a KPI breaching its target, when displayed, then it is shown in red with drill-down to the underlying records.
- [ ] Given RBAC, then Executives see summary tiles while Payroll/Compliance see operational drill-downs.
- [ ] Given exported data, when requested, then KPI snapshots export to Excel/PDF for the monthly pack.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation service + materialized views per period/entity
- [ ] Backend: KPI definition config (target, formula, direction)
- [ ] Frontend: GOSI dashboard with tiles, trend charts, drill-down, filters
- [ ] Rules/Config: KPI targets per entity
- [ ] Tests: unit tests for KPI calculations and filter integrity

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
