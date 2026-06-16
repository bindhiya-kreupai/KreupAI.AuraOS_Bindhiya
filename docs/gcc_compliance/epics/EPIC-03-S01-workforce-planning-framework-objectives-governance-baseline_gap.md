# Gap Analysis: EPIC-03-S01 — Workforce planning framework, objectives & governance baseline

> Source epic: [EPIC-03-chapter-3-workforce-planning-manpower-comp.md](./EPIC-03-chapter-3-workforce-planning-manpower-comp.md)
> Parent epic: EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5
**User story:** HR Manager, **I want** a configurable workforce-planning framework with defined objectives, planning horizon and governance roles, **so that** all manpower planning in AuraOS follows one documented, auditable model.

**Description**
Establishes the foundational planning cycle (annual + rolling quarterly), planning entities, roles and the governance baseline that all later stories plug into. Captures the chapter's introduction, objectives and the planning framework as configurable reference data and a planning-cycle record so that requisitions, budgets and localization plans are anchored to a named, versioned plan.

**Covers:** 3.1, 3.2, 3.3
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

- [ ] Given an HR Manager, when they create a workforce plan, then they must select legal entity, country, planning period and horizon, and the plan is stored with status Draft → In Review → Approved.
- [ ] Given a planning framework, when configured, then planning objectives, demand/supply inputs and assumptions are recorded against the plan version.
- [ ] Given governance roles, when assigned, then planner, reviewer and approver are distinct identities (preparer ≠ approver) enforced by RBAC.
- [ ] Given an approved plan, when superseded, then the prior version is retained read-only with effective dates and an audit entry.
- [ ] Given any plan change, when saved, then actor, timestamp, field-level before/after and reason are written to the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: `workforce_plan` entity (id, entityId, countryCode, periodFrom, periodTo, horizonMonths, status, version, createdBy, approvedBy) + Prisma migration.
- [ ] Backend: planning-cycle service with state machine and version supersession.
- [ ] Frontend: Workforce Plan workspace (create, assumptions, objectives tabs).
- [ ] Rules/Config: configurable planning horizon and objective taxonomy per entity.
- [ ] Alerts/Workflow: route plan to reviewer/approver via workflow engine.
- [ ] Tests: unit (state machine) + e2e (create→approve→supersede with audit).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
