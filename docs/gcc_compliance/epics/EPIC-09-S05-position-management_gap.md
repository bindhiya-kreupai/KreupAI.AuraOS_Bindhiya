# Gap Analysis: EPIC-09-S05 — Position management

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8

**Description**
Model positions with title, job mapping, grade, department, cost center, FTE, location, employment type and incumbency, supporting single or shared incumbency and effective-dated lifecycle (create, hold, freeze, abolish).

**Covers:** 9.7
**Acceptance criteria count:** 5 · **Task count:** 6

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

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given a position, when created, then it links to a job profile, grade, department and cost center, and specifies FTE and headcount seats.
- [ ] Given an incumbent assignment, when made, then the system records the employee-to-position link with effective dates and prevents over-assignment beyond seats.
- [ ] Given a position, when frozen or abolished, then no new assignment is allowed and the action is effective-dated.
- [ ] Given a vacated position, when the incumbent leaves, then it is auto-flagged vacant for vacancy management.
- [ ] Given any position change, when saved, then RBAC and audit trail apply.

## Implementation Tasks From Backlog

- [ ] Backend: `position` schema (`position_id`, `title`, `job_id`, `grade_id`, `department_id`, `cost_center_id`, `fte`, `seats`, `employment_type`, `location`, `status`)
- [ ] Backend: `position_incumbency` link table with effective dates
- [ ] Backend: position lifecycle service (create/hold/freeze/abolish)
- [ ] Frontend: position master screen + incumbency view
- [ ] Rules/Config: single vs shared incumbency configuration
- [ ] Tests: e2e position lifecycle and incumbency assignment

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
