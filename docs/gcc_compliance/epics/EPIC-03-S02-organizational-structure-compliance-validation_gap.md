# Gap Analysis: EPIC-03-S02 — Organizational structure compliance & validation

> Source epic: [EPIC-03-chapter-3-workforce-planning-manpower-comp.md](./EPIC-03-chapter-3-workforce-planning-manpower-comp.md)
> Parent epic: EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**User story:** HR Admin, **I want** the org structure validated against compliance rules, **so that** every department, reporting line and span-of-control conforms to entity governance before positions are attached.

**Description**
Provides effective-dated org-unit modelling with structural validation: no orphan units, valid parent chains, span-of-control limits and mandatory cost-center/legal-entity linkage. Flags non-compliant nodes (e.g., unit without manager, circular reporting) so structure issues are resolved before workforce planning proceeds.

**Covers:** 3.4
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

- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given an org unit, when saved, then it must link to a legal entity and cost center, else creation is blocked.
- [ ] Given a reporting line, when defined, then circular reporting and orphan nodes are detected and rejected.
- [ ] Given a span-of-control threshold per entity, when exceeded, then the node is flagged as a structural exception.
- [ ] Given a structural change, when committed, then it is effective-dated and the prior structure is preserved.
- [ ] Given any structure edit, when saved, then RBAC is enforced and the action is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `org_unit` and `org_relationship` entities with effective dating.
- [ ] Backend: structural validation service (cycle/orphan/span checks).
- [ ] Frontend: org tree editor with inline compliance flags.
- [ ] Rules/Config: per-entity span-of-control and mandatory-link rules.
- [ ] Alerts/Workflow: notify HR Admin on structural exceptions.
- [ ] Tests: unit (cycle detection) + integration (effective-dated edits).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
