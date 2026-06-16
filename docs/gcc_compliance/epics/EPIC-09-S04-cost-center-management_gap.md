# Gap Analysis: EPIC-09-S04 — Cost center management

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 3
**User story:** Payroll Officer, **I want** cost centers mapped to org nodes and positions, **so that** payroll and labour costs post to the correct GL cost center per legal entity.

**Description**
Define cost centers, link them to departments and positions, and enforce that every position resolves to exactly one default cost center for finance posting, while allowing split allocation where configured.

**Covers:** 9.6
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given a position, when activated, then it must resolve to a valid, active cost center (direct or inherited from department).
- [ ] Given a cost-center split, when configured, then allocation percentages must total 100%.
- [ ] Given a cost center used in current-period payroll, when deactivation is attempted, then it is blocked until reassignment.
- [ ] Given a change, when saved, then it is effective-dated and audit-logged for GL traceability.

## Implementation Tasks From Backlog

- [ ] Backend: `cost_center` schema + `position_cost_center_allocation` (with percentage)
- [ ] Backend: 100%-allocation and active-cost-center validation
- [ ] Frontend: cost center registry + allocation editor
- [ ] Rules/Config: inherit-from-department default rule
- [ ] Tests: validation tests for split totals and deactivation guard

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
