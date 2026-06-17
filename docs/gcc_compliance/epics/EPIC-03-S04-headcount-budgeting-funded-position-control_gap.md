# Gap Analysis: EPIC-03-S04 — Headcount budgeting & funded-position control

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-03-chapter-3-workforce-planning-manpower-comp.md](./EPIC-03-chapter-3-workforce-planning-manpower-comp.md)
> Parent epic: EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8
**User story:** HR Manager, **I want** headcount budgets defined per cost center and period with funded-position tracking, **so that** no requisition or hire can exceed the approved, funded headcount.

**Description**
Adds annual/period headcount budgets at entity/department/cost-center level, allocating budgeted FTE and salary cost to positions. Tracks budgeted vs committed vs actual headcount, and enforces budget availability as a gate on requisitions. Supports budget revisions with approval and variance tracking.

**Covers:** 3.7
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/app/(modules)/position-budgeting/page.tsx
- apps/web/src/app/dashboard/position-budgeting/budget-allocation/page.tsx
- apps/web/src/app/dashboard/position-budgeting/budget-vs-actual/page.tsx
- apps/web/src/app/dashboard/position-budgeting/page.tsx
- apps/web/src/app/dashboard/position-budgeting/position-analytics/page.tsx
- apps/web/src/app/dashboard/position-budgeting/position-creation/page.tsx
- apps/web/src/app/dashboard/position-budgeting/position-freeze/page.tsx
- apps/web/src/app/dashboard/position-budgeting/position-history/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add tests.

## Acceptance Criteria To Verify

- [ ] Given a headcount budget, when created, then budgeted FTE and budgeted cost are captured per cost center and period.
- [ ] Given a requisition, when raised, then the system checks remaining funded FTE = budgeted − (filled + committed) and blocks if insufficient.
- [ ] Given a budget revision, when submitted, then it routes for approval and records variance vs original.
- [ ] Given over-budget hiring intent, when attempted, then an exception requiring senior approval is raised, not a silent allow.
- [ ] Given a dashboard, when viewed, then budgeted/committed/actual FTE and cost reconcile per cost center.
- [ ] Given any budget action, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `headcount_budget` and `budget_line` entities (costCenterId, period, budgetedFte, budgetedCost, committedFte) + migration.
- [ ] Backend: budget-availability service consumed by requisition gate.
- [ ] Frontend: budget planning grid + budgeted/committed/actual reconciliation view.
- [ ] Rules/Config: over-budget exception approval thresholds per entity.
- [ ] Alerts/Workflow: budget-revision approval + over-budget exception routing.
- [ ] Tests: unit (availability calc) + integration (requisition blocked on no funds).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
