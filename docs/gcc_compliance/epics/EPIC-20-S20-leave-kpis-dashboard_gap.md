# Gap Analysis: EPIC-20-S20 — Leave KPIs & dashboard

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 5

**Description**
Compute KPIs (leave utilization, average balance, leave liability/provision, sick-leave rate, carry-forward/lapse, negative-balance count) and a drill-down dashboard with country/entity/department filters and trends.

**Covers:** 20.26, 20.29
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts
- apps/web/src/**tests**/api/attendance-timesheets-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given leave data, when aggregated, then KPIs including leave-liability provision compute per country/entity/team.
- [ ] Given the dashboard, when filtered, then it drills from company → country → entity → team → employee.
- [ ] Given a KPI breach (e.g., high sick rate), when detected, then RAG status highlights it.
- [ ] Given RBAC, when a viewer lacks scope, then restricted data is hidden.

## Implementation Tasks From Backlog

- [ ] Backend: KPI + leave-liability aggregation service + materialized views
- [ ] Backend: RBAC scoping
- [ ] Frontend: leave dashboard with filters, trends, RAG status
- [ ] Rules/Config: KPI targets per country
- [ ] Tests: unit tests for KPI/liability math; e2e for drill-down + RBAC

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
