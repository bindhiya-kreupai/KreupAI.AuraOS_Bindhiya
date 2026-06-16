# Gap Analysis: EPIC-08-S13 — Employee records dashboard

> Source epic: [EPIC-08-chapter-8-employee-records-management.md](./EPIC-08-chapter-8-employee-records-management.md)
> Parent epic: EPIC-08: Chapter 8 – Employee Records Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5

**Description**
Provide a filterable dashboard surfacing completeness-score distribution, mandatory-document gaps, expiring documents, data-quality scorecard, pending change requests, retention/disposal queue and access-anomaly indicators, by country/entity/department with trends and drill-down.

**Covers:** 8.16
**Acceptance criteria count:** 5 · **Task count:** 4

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/document-intelligence/page.tsx
- apps/web/src/app/(modules)/core-hr/document-management/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given records data, when the dashboard loads, then completeness, DQ, document-gap and retention metrics render with filters.
- [ ] Given filters, when applied, then values, trends and at-risk lists update.
- [ ] Given a threshold breach (e.g. completeness < target), then the metric is flagged.
- [ ] Given drill-down, then underlying employees/files list (RBAC-respecting).
- [ ] Given refresh, then metrics update on schedule/events.

## Implementation Tasks From Backlog

- [ ] Backend: dashboard aggregation queries/materialized views + metrics API.
- [ ] Frontend: records dashboard with filters, trends, drill-down.
- [ ] Rules/Config: dashboard thresholds per entity.
- [ ] Tests: aggregation correctness tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
