# Gap Analysis: EPIC-29-S16 — Immigration Exit KPIs & Dashboard

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-29-chapter-29-visa-work-permit-and-immigratio.md](./EPIC-29-chapter-29-visa-work-permit-and-immigratio.md)
> Parent epic: EPIC-29: Chapter 29 – Visa, Work Permit and Immigration Exit Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Should · **Estimate:** 5

**Description**
Delivers exit KPIs (average cancellation turnaround, % cancellations within statutory window, grace-period overstay count/risk, dependent-closure completeness, absconding cases raised/withdrawn, repatriation completion %, PRO SLA adherence, evidence-completeness %, immigration-vs-SI mismatch count) and a role-based dashboard with trend charts and drill-down, filterable by entity, country, scenario and period.

**Covers:** 29.20, 29.23
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given exit data, when the dashboard loads, then KPIs render with value, target and trend.
- [ ] Given filters (entity, country, scenario, period), when applied, then tiles and charts update consistently.
- [ ] Given a KPI breaching target (e.g. overstay risk, cancellation turnaround), then it is red with drill-down to cases.
- [ ] Given RBAC, Executives see summary/risk tiles; PRO/Compliance see operational drill-downs.
- [ ] Given export, then KPI snapshots export for the monthly pack.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation service + materialized views over cases/tasks/grace/evidence
- [ ] Backend: KPI definition config (target, formula, direction)
- [ ] Frontend: exit dashboard with tiles, charts, drill-down, filters
- [ ] Rules/Config: KPI targets per entity
- [ ] Tests: unit tests for KPI calculations and filters

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
