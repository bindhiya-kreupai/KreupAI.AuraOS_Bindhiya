# Gap Analysis: EPIC-38-S04 — Operational compliance KPI sets (leave, attendance/OT, benefits, accommodation, HSE)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-38-compliance-kpi-scorecard-library.md](./EPIC-38-compliance-kpi-scorecard-library.md)
> Parent epic: EPIC-38: Compliance KPI & Scorecard Library
> Module: analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** leave, attendance/OT, benefits, accommodation and HSE KPI sets, **so that** operational-compliance performance is measured consistently.

**Description**
Implement leave KPIs (leave-liability, encashment, statutory-minimum adherence), attendance/overtime KPIs (absenteeism, OT-over-cap %, missing-punch rate), benefits KPIs (mandatory-cover %, vendor-SLA), accommodation KPIs (occupancy/inspection compliance) and HSE KPIs (incident/LTIFR, training-completion, heat-stress adherence) from the catalogue.

**Covers:** A7.10, A7.11, A7.12, A7.13, A7.14
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/e2e/attendance/shift-management.e2e.test.ts
- apps/web/src/**tests**/services/attendance-roster-dashboard.service.test.ts
- apps/web/src/**tests**/services/attendance-shift-swap-dashboard.service.test.ts
- apps/web/src/app/(modules)/analytics/reports/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the catalogue, when computed, then leave/attendance/benefits/accommodation/HSE KPIs return values per entity/country.
- [ ] Given each KPI, when computed, then it uses the defined formula and source exactly.
- [ ] Given RBAC, when a user views, then only in-scope data is shown.
- [ ] Given a computation, when run, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: computation services for operational-domain KPIs
- [ ] Frontend: operational KPI views
- [ ] Rules/Config: KPI formulas for these domains
- [ ] Tests: integration tests for formula correctness

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
