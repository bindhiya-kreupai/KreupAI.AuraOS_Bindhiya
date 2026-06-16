# Gap Analysis: EPIC-20-S10 — Leave encashment

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** automated leave encashment, **so that** eligible unused leave is paid out correctly in-service and at separation.

**Description**
Implement encashment (eligibility, encashable days, rate basis per country — e.g., basic vs gross, in-service vs end-of-service), approval and handover to payroll/final settlement.

**Covers:** 20.17
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given encashment eligibility, when triggered, then encashable days and the country rate basis are computed (e.g., basic salary/30 × days in UAE).
- [ ] Given separation, when leave encashment runs, then it hands the amount to final settlement (EPIC-28).
- [ ] Given in-service encashment, when approved, then it is queued to payroll and balance reduced.
- [ ] Given any encashment, when posted, then it is audit-logged with calculation breakdown.

## Implementation Tasks From Backlog

- [ ] Backend: encashment calculation service + handover events
- [ ] Backend: in-service vs separation routing
- [ ] Frontend: encashment request/approval + breakdown screen
- [ ] Rules/Config: per-country encashable days and rate basis
- [ ] Alerts/Workflow: approval routing
- [ ] Tests: unit tests for rate basis and routing

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
