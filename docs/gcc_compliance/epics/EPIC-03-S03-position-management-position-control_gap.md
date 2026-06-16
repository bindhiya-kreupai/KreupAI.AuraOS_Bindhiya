# Gap Analysis: EPIC-03-S03 — Position management & position control

> Source epic: [EPIC-03-chapter-3-workforce-planning-manpower-comp.md](./EPIC-03-chapter-3-workforce-planning-manpower-comp.md)
> Parent epic: EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**User story:** HR Manager, **I want** to manage positions with controlled headcount slots, **so that** hiring is constrained to approved, funded positions and ghost positions cannot exist.

**Description**
Implements positions as the unit of control: each position carries org unit, job, grade, FTE count, status (active/frozen/abolished), nationalization flag and budget linkage. Position control enforces that filled + open ≤ approved FTE, and abolishment requires no active incumbents.

**Covers:** 3.5
**Acceptance criteria count:** 6 · **Task count:** 6

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

- [ ] Given a position, when created, then it requires org unit, job, grade, approved FTE and cost center.
- [ ] Given a position with approved FTE = N, when incumbents + open requisitions would exceed N, then the over-allocation is blocked.
- [ ] Given a frozen position, when a requisition references it, then the requisition is blocked with reason "position frozen".
- [ ] Given a position flagged as nationalization-reserved, when planned, then it is marked for localized fill.
- [ ] Given an abolish action, when incumbents exist, then abolishment is blocked.
- [ ] Given any position change, when saved, then the audit trail records actor, change and reason.

## Implementation Tasks From Backlog

- [ ] Backend: `position` entity (orgUnitId, jobId, gradeId, approvedFte, status, nationalizationReserved, budgetLineId) + migration.
- [ ] Backend: position-control service (capacity check, abolish guard).
- [ ] Frontend: position register with status and capacity indicators.
- [ ] Rules/Config: per-country freeze/abolish governance rules.
- [ ] Alerts/Workflow: alert when position over-allocation attempted.
- [ ] Tests: unit (capacity math) + integration (freeze/abolish guards).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
