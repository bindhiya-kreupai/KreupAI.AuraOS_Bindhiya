# Gap Analysis: EPIC-19-S19 — Attendance KPIs & dashboard

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5

**Description**
Compute KPIs (attendance %, punctuality %, unauthorized-absence rate, missing-punch rate, regularization rate, absconding count) and render a drill-down dashboard with country/entity/department filters and trend lines.

**Covers:** 19.22, 19.25
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts
- apps/web/src/**tests**/api/attendance-timesheets-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given attendance data, when aggregated, then KPIs compute per country/entity/team with period comparison.
- [ ] Given the dashboard, when filtered, then it drills from company → country → entity → team → employee.
- [ ] Given a KPI breach (e.g., absence > target), when detected, then it is highlighted with red/amber/green status.
- [ ] Given RBAC, when a viewer lacks scope, then restricted data is hidden.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation service + materialized views
- [ ] Backend: RBAC scoping for dashboard data
- [ ] Frontend: attendance dashboard with filters, trends, RAG status
- [ ] Rules/Config: KPI targets/thresholds per country
- [ ] Tests: unit tests for KPI math; e2e for drill-down + RBAC

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
