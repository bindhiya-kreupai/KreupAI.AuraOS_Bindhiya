# Gap Analysis: EPIC-09-S08 — Position control & headcount budgeting

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 8

**Description**
Enforce position-controlled headcount: approved seats per position/department, budgeted vs actual vs committed FTE, and hard blocks or budget-overage warnings when assignments would breach the approved establishment.

**Covers:** 9.8
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given an approved headcount budget, when an assignment would exceed approved seats, then the system blocks it (hard control) or routes an over-establishment approval, per config.
- [ ] Given a requisition draw-down, when a position is filled, then budgeted/committed/actual counts update in real time.
- [ ] Given a department, when viewed, then planned vs approved vs filled vs vacant FTE is shown with variance.
- [ ] Given an override, when granted, then it requires elevated approval and is fully audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `headcount_budget` schema (`department_id`, `position_id`, `budget_period`, `approved_fte`, `committed_fte`, `actual_fte`)
- [ ] Backend: position-control enforcement service (block/warn/override)
- [ ] Frontend: position-control dashboard with budget vs actual
- [ ] Rules/Config: hard-block vs soft-warn mode per tenant/entity
- [ ] Alerts/Workflow: over-establishment approval routing
- [ ] Tests: e2e tests for block-on-exceed and override path

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
