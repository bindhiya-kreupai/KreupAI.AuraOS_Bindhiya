# Gap Analysis: EPIC-03-S10 — Workforce analytics, KPIs & planning dashboard

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-03-chapter-3-workforce-planning-manpower-comp.md](./EPIC-03-chapter-3-workforce-planning-manpower-comp.md)
> Parent epic: EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**User story:** Executive / Leadership, **I want** a workforce analytics dashboard with planning KPIs, **so that** headcount, budget utilisation, localization and risk are visible in real time.

**Description**
Builds the workforce-planning dashboard and KPI pack: budgeted vs actual headcount, vacancy/requisition cycle time, localization % vs target, span of control, succession coverage, contractor ratio and workforce-risk count. Supports filters by country/entity/department and export.

**Covers:** 3.12
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/workforce-planning/page.tsx
- apps/web/src/app/dashboard/workforce-planning/workforce-analytics/page.tsx
- apps/web/src/components/analytics/WorkforcePlanning.tsx
- apps/web/src/lib/services/ai/workforce-analytics.service.ts
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/succession-planning/analytics/route.ts
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the dashboard, when opened, then headcount (budgeted/committed/actual), localization % vs target and open-requisition aging render per filter.
- [ ] Given KPIs, when computed, then time-to-fill, vacancy rate, succession coverage and contractor ratio are shown with trend.
- [ ] Given filters, when applied (country/entity/department/period), then all tiles recompute.
- [ ] Given an export, when requested, then a KPI pack (PDF/Excel) is generated.
- [ ] Given RBAC, when a user views, then data is scoped to their authorised entities.

## Implementation Tasks From Backlog

- [ ] Backend: analytics aggregation queries/materialized views for planning KPIs.
- [ ] Backend: KPI export service (PDF/Excel).
- [ ] Frontend: dashboard with tiles, trends and filters.
- [ ] Rules/Config: KPI definitions and targets per entity.
- [ ] Alerts/Workflow: threshold alerts (e.g., localization below target).
- [ ] Tests: unit (KPI calc) + integration (filter scoping + export).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
