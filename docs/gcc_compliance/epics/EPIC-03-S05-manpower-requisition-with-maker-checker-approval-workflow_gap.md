# Gap Analysis: EPIC-03-S05 — Manpower Requisition with maker-checker approval workflow

> Source epic: [EPIC-03-chapter-3-workforce-planning-manpower-comp.md](./EPIC-03-chapter-3-workforce-planning-manpower-comp.md)
> Parent epic: EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**User story:** Line Manager, **I want** to raise a manpower requisition that is validated and routed through an approval matrix, **so that** vacancies are authorised, funded and compliant before recruitment begins.

**Description**
Core requisition workflow: a requisition must reference an approved, unfrozen position and a funded budget line, capture justification (replacement/new/backfill), nationalization expectation and target start date. It routes through a configurable multi-level approval matrix (maker-checker, value/grade-based escalation) and, on final approval, emits a `vacancy.approved` event to Recruitment.

**Covers:** 3.6
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/components/AgenticWorkflowHub.tsx
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-life-events/page.tsx
- apps/web/src/app/(modules)/core-hr/employees/page.tsx
- apps/web/src/app/(modules)/core-hr/position-management/BudgetHealth.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given a requisition, when submitted, then position validity, budget availability and localization target are checked; failures block submission with reasons.
- [ ] Given the approval matrix, when a requisition is routed, then approvers are determined by entity, grade and headcount value, and preparer ≠ any approver.
- [ ] Given an approver, when they approve/reject/return, then a decision with comments is recorded and the next step triggers.
- [ ] Given final approval, when reached, then committed FTE is incremented and a `vacancy.approved` event is published to Recruitment.
- [ ] Given a UAE/KSA entity below its nationalization target, when a non-national requisition is raised, then a localization warning/justification is required.
- [ ] Given any requisition action, when performed, then the audit trail records actor, decision, reason and timestamp.

## Implementation Tasks From Backlog

- [ ] Backend: `manpower_requisition` entity (positionId, budgetLineId, type, justification, nationalizationExpected, targetStartDate, status) + migration.
- [ ] Backend: validation + approval-routing service on the workflow engine.
- [ ] Frontend: requisition form + approval inbox with decision actions.
- [ ] Rules/Config: per-entity approval matrix (grade/value escalation, maker-checker).
- [ ] Alerts/Workflow: route, escalate on SLA breach, emit `vacancy.approved`.
- [ ] Tests: integration (block on no budget/frozen position) + e2e (multi-level approval + event).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
