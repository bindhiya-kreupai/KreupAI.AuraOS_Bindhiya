# Gap Analysis: EPIC-12-S15 — Overtime KPIs & dashboard

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3

**Description**
Build a dashboard with total OT cost/hours by department/cost center/country, OT-to-base-pay ratio, top OT employees/managers, post-facto OT %, budget-vs-actual, fatigue-breach count and fraud-flag count, with drill-down and RBAC.

**Covers:** 12.20
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts
- apps/web/src/**tests**/services/attendance-overtime-dashboard.service.test.ts
- apps/web/src/app/(modules)/attendance/overtime-calculation/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/ot-rules/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the dashboard, when loaded, then OT cost, hours, ratio, budget variance and exception counts show per org/country.
- [ ] Given a KPI tile, when clicked, then it drills to underlying OT records/employees.
- [ ] Given RBAC, when a user views, then only in-scope org units appear.
- [ ] Given a period, when selected, then metrics recompute for that period.

## Implementation Tasks From Backlog

- [ ] Backend: OT KPI aggregation endpoints
- [ ] Frontend: OT KPI dashboard with drill-down + export
- [ ] Rules/Config: KPI definitions/thresholds
- [ ] Tests: integration tests for KPI computation and RBAC scoping

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
