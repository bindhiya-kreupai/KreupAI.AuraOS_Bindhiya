# Gap Analysis: EPIC-09-S14 — Workforce analytics & org dashboard

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5

**Description**
Build dashboards covering headcount by entity/BU/department, span of control, manager-to-IC ratio, vacancy rate and aging, position fill rate, grade distribution and budget vs actual FTE, with drill-down and export.

**Covers:** 9.16
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/workforce-planning/page.tsx
- apps/web/src/app/dashboard/workforce-planning/workforce-analytics/page.tsx
- apps/web/src/components/analytics/WorkforcePlanning.tsx
- apps/web/src/lib/services/ai/workforce-analytics.service.ts
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/api/v1/benefits/analytics/total-statement/[employeeId]/route.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the dashboard, when loaded, then it shows headcount, vacancy rate, fill rate, span of control and budget-vs-actual FTE by org level.
- [ ] Given a KPI tile, when clicked, then it drills down to the underlying positions/units.
- [ ] Given an RBAC scope, when a leader logs in, then they see only their entities/units.
- [ ] Given a reporting period, when selected, then metrics are computed as of that date using effective-dated structure.

## Implementation Tasks From Backlog

- [ ] Backend: analytics aggregation endpoints (span, fill rate, vacancy, grade mix)
- [ ] Frontend: org analytics dashboard with drill-down and export
- [ ] Rules/Config: KPI definitions and thresholds configuration
- [ ] Tests: integration tests for as-of metric computation and RBAC scoping

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
