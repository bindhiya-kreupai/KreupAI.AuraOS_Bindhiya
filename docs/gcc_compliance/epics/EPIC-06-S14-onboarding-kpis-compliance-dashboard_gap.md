# Gap Analysis: EPIC-06-S14 — Onboarding KPIs & compliance dashboard

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-06-chapter-6-employee-onboarding-compliance.md](./EPIC-06-chapter-6-employee-onboarding-compliance.md)
> Parent epic: EPIC-06: Chapter 6 – Employee Onboarding Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5

**Description**
Compute KPIs (time-to-onboard, day-one readiness %, first-pay accuracy, social-insurance/medical registration-on-time %, probation-decision-on-time %, document completeness) and present a filterable dashboard by country, entity, department and recruiter, with trend and drill-down.

**Covers:** 6.16, 6.17
**Acceptance criteria count:** 5 · **Task count:** 4

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx
- apps/web/src/app/(modules)/core-hr/position-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given completed/in-flight cases, when KPIs compute, then each metric reflects current data with country/entity filters.
- [ ] Given the dashboard, when filtered, then values, trends and overdue/blocked cases update accordingly.
- [ ] Given a KPI breach threshold, then the metric is visually flagged.
- [ ] Given a drill-down, then the underlying cases/employees are listed (RBAC-respecting).
- [ ] Given data refresh, then KPIs update on the defined schedule/events.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation queries/materialized views + metrics API.
- [ ] Frontend: onboarding dashboard with filters, trends, drill-down.
- [ ] Rules/Config: KPI thresholds per entity.
- [ ] Tests: KPI calculation correctness tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
