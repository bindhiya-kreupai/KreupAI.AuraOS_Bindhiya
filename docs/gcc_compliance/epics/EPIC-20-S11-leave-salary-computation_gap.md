# Gap Analysis: EPIC-20-S11 — Leave salary computation

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** leave-salary computed per country, **so that** employees on leave are paid the correct wage (including advance leave salary where applicable).

**Description**
Compute leave salary (wage basis on leave, advance leave-salary payment before annual leave where mandated, allowance inclusion/exclusion per country) and feed payroll.

**Covers:** 20.18
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts
- apps/web/src/**tests**/api/attendance-timesheets-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given annual leave, when computed, then leave salary uses the correct country wage basis (basic/gross and included allowances).
- [ ] Given a country requiring advance leave salary, when leave starts, then the advance is computed and flagged for payroll.
- [ ] Given partial-pay leave types, when on leave, then the reduced wage is computed correctly.
- [ ] Given leave salary, when produced, then it feeds payroll with a breakdown and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: leave-salary calculation service (wage basis, allowance inclusion)
- [ ] Backend: advance-leave-salary flagging
- [ ] Frontend: leave-salary breakdown view
- [ ] Rules/Config: per-country wage basis, allowances, advance requirement
- [ ] Tests: unit tests for wage basis and advance computation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
