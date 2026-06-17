# Gap Analysis: EPIC-38-S07 — Executive compliance scorecard & KPI dashboards

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-38-compliance-kpi-scorecard-library.md](./EPIC-38-compliance-kpi-scorecard-library.md)
> Parent epic: EPIC-38: Compliance KPI & Scorecard Library
> Module: analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5

**Description**
Build the executive compliance scorecard that rolls weighted domain KPIs into an overall compliance score with red/amber/green status, and the supporting KPI dashboards designed per the dashboard-design principles — per domain/entity/country, with trend, drill-down to underlying KPIs and records, and RBAC.

**Covers:** A7.20, A7.22
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/executive-dashboards/page.tsx
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/offboarding/analytics/metrics/route.ts
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the scorecard, when loaded, then weighted domain KPIs roll into an overall compliance score with RAG status per entity/country.
- [ ] Given a scorecard tile, when clicked, then it drills to the domain KPIs and underlying records.
- [ ] Given dashboards, when designed, then they follow the dashboard-design principles (clarity, trend, exception focus) and respect RBAC.
- [ ] Given a period filter, when applied, then scorecard and KPIs recompute for that period.

## Implementation Tasks From Backlog

- [ ] Backend: scorecard weighting/roll-up service + dashboard aggregation endpoints
- [ ] Frontend: executive compliance scorecard + KPI dashboards with drill-down and trend
- [ ] Rules/Config: domain weightings and dashboard layout config
- [ ] Tests: integration tests for roll-up weighting and RBAC scoping

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
