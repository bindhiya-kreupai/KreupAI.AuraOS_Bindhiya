# Gap Analysis: EPIC-03-S11 — HR governance rules & control enforcement

> Source epic: [EPIC-03-chapter-3-workforce-planning-manpower-comp.md](./EPIC-03-chapter-3-workforce-planning-manpower-comp.md)
> Parent epic: EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `audit` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** workforce-planning governance rules enforced and evidenced, **so that** segregation of duties, approval authority and policy controls are demonstrably in place.

**Description**
Codifies the chapter's governance requirements as enforceable controls: segregation of duties (preparer ≠ approver), delegation-of-authority limits on requisitions/budgets, mandatory justification, and control evidence capture. Produces a governance control matrix showing each control, its owner, status and last test date.

**Covers:** 3.13
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

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a control matrix, when configured, then each governance control has owner, frequency and evidence requirement.
- [ ] Given an approval, when the approver exceeds their delegated authority, then it is blocked or escalated.
- [ ] Given segregation-of-duties, when the same user prepares and approves, then the action is prevented system-wide.
- [ ] Given a control test, when recorded, then result, evidence link and tester are stored.
- [ ] Given any governance action, when performed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `governance_control` + `control_test` entities + migration.
- [ ] Backend: SoD and delegation-of-authority enforcement service.
- [ ] Frontend: governance control matrix view.
- [ ] Rules/Config: DoA limits and control catalogue per entity.
- [ ] Alerts/Workflow: escalation on authority breach; control-test reminders.
- [ ] Tests: unit (SoD/DoA checks) + integration (escalation).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
