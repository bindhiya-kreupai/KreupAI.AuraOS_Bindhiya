# Gap Analysis: EPIC-21-S14 — Holiday KPIs & dashboard

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5

**Description**
Compute KPIs (holiday-work hours/cost, premium spend, unauthorized-holiday-work rate, comp-off lapse, Eid-confirmation timeliness) and a drill-down dashboard with country/entity/site filters and trends.

**Covers:** 21.19, 21.22
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

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given holiday data, when aggregated, then KPIs (holiday-work cost, premium spend, unauthorized rate) compute per country/entity/site.
- [ ] Given the dashboard, when filtered, then it drills from company → country → entity → site.
- [ ] Given a KPI breach (e.g., high unauthorized holiday work), when detected, then RAG status highlights it.
- [ ] Given RBAC, when a viewer lacks scope, then restricted data is hidden.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation service + materialized views
- [ ] Backend: RBAC scoping
- [ ] Frontend: holiday dashboard with filters, trends, RAG status
- [ ] Rules/Config: KPI targets per country
- [ ] Tests: unit tests for KPI math; e2e for drill-down + RBAC

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
