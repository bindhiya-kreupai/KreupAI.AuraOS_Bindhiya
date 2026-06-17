# Gap Analysis: EPIC-12-S11 — Overtime budget control

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5

**Description**
Set OT budgets (hours/cost) per department/cost center/period (linked to EPIC-09), track committed vs actual OT against budget at request and payroll time, and warn or block requests that breach budget, with override requiring elevated approval.

**Covers:** 12.15
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts
- apps/web/src/**tests**/services/attendance-overtime-dashboard.service.test.ts
- apps/web/src/app/(modules)/attendance/overtime-calculation/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/ot-rules/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given an OT budget, when a request would breach it, then the system warns or blocks per config and surfaces remaining budget.
- [ ] Given approved OT, when consumed, then committed and actual OT update against the budget in real time.
- [ ] Given a budget override, when granted, then it requires elevated approval and is audit-logged.
- [ ] Given a period, when reviewed, then OT budget vs actual variance is reported per cost center.

## Implementation Tasks From Backlog

- [ ] Backend: `ot_budget` schema (cost_center, period, budget_hours, budget_cost) + consumption tracking
- [ ] Backend: budget-breach check at request and payroll stages
- [ ] Frontend: OT budget configuration + budget-vs-actual view
- [ ] Rules/Config: warn vs block mode and override approval
- [ ] Alerts/Workflow: budget-threshold alerts (e.g., at 80%/100%)
- [ ] Tests: integration tests for breach blocking and override path

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
