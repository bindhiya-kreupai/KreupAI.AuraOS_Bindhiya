# Gap Analysis: EPIC-26-S08 — Disciplinary Appeals

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-26-chapter-26-disciplinary-action-compliance.md](./EPIC-26-chapter-26-disciplinary-action-compliance.md)
> Parent epic: EPIC-26: Chapter 26 – Disciplinary Action Compliance
> Module: Employee Relations
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `employee-relations` · **Priority:** Must · **Estimate:** 5

**Description**
Provides an appeals workflow allowing the disciplined employee to appeal within a defined window on stated grounds, routing to a reviewer independent of the original decision-maker, with the ability to uphold, reduce or overturn the penalty and to reverse any associated deduction/record where overturned.

**Covers:** 26.15
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/hr/EmployeeRelationsDashboard.tsx
- apps/web/src/services/employeeRelationsService.ts
- apps/web/src/app/api/my-services/grievances/route.ts
- apps/web/src/app/dashboard/compliance/disciplinary-actions/page.tsx
- apps/web/src/app/dashboard/compliance/disciplinary/page.tsx
- apps/web/src/app/dashboard/compliance/grievance-management/page.tsx
- apps/web/src/app/dashboard/grievance/components/ErrorBoundary.tsx
- apps/web/src/app/dashboard/grievance/components/LoadingSpinner.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a disciplinary decision, when communicated, then the appeal window and grounds options are presented to the employee.
- [ ] Given an appeal is lodged within window, when assigned, then it routes to an independent reviewer.
- [ ] Given an appeal decision, when recorded, then it upholds/reduces/overturns with reasons.
- [ ] Given an overturned penalty, when finalised, then associated warning record and any deduction are reversed and re-reconciled.
- [ ] Given any appeal event, when stored, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `disciplinary_appeal` (grounds, reviewer, decision) entity + independent-reviewer guard + reversal service.
- [ ] Backend: deduction/record reversal with payroll re-reconciliation.
- [ ] Frontend: appeal submission + review screens.
- [ ] Rules/Config: per-country appeal windows.
- [ ] Alerts/Workflow: appeal lodged/decided notifications.
- [ ] Tests: integration (independence + reversal), unit (window enforcement).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
