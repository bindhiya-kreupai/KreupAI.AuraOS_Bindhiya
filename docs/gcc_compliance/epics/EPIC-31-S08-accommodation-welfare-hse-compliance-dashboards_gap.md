# Gap Analysis: EPIC-31-S08 — Accommodation/welfare & HSE compliance dashboards

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** accommodation/welfare and HSE dashboards, **so that** I can monitor worker-welfare, camp inspection status, and safety/incident compliance.

**Description**
Accommodation/welfare view (occupancy vs capacity, overdue inspections, open complaints, hygiene/fire-safety status) and HSE view (incident rates, overdue corrective actions, training/PTW status, heat-stress mid-day-break-window compliance).

**Covers:** 31.15, 31.16
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/executive-dashboards/page.tsx
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx
- apps/web/src/app/dashboard/analytics/drill-down-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given accommodation data, when the dashboard loads, then it shows occupancy compliance, overdue inspections, and open complaints with RAG.
- [ ] Given HSE data, when rendered, then incident frequency, open safety actions, and training/PTW compliance appear.
- [ ] Given a seasonal heat-stress period, when active, then mid-day work-ban / break-window compliance is surfaced for the relevant country.
- [ ] Given an overdue inspection or open high-severity incident, when detected, then it is flagged Red and linkable to corrective action.

## Implementation Tasks From Backlog

- [ ] Backend: accommodation/welfare and HSE KPI feeds.
- [ ] Frontend: accommodation/welfare dashboard and HSE dashboard with drill-down.
- [ ] Rules/Config: inspection cadence, occupancy limits, heat-stress period/window per country.
- [ ] Alerts/Workflow: raise finding on overdue inspection / high-severity incident.
- [ ] Tests: integration tests for overdue-inspection and incident-rate computation.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
