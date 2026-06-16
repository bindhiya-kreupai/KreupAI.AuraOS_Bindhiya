# Gap Analysis: EPIC-21-S08 — Holiday & leave overlap

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Detect public holidays/weekly-offs falling within an approved leave span and apply the country rule (exclude holidays from leave-day count or include), recompute leave balance, and feed the Leave-Holiday Conflict Register for review where rules conflict.

**Covers:** 21.12, 21.26 (feeds register)
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

- [ ] Given a public holiday inside an annual-leave span, when calculated, then it is excluded/included per country rule and balance recomputed.
- [ ] Given a holiday declared after leave approval, when added, then the affected leave is recalculated and the employee notified.
- [ ] Given an overlap conflict, when detected, then it posts to the Leave-Holiday Conflict Register for HR review.
- [ ] Given any recalculation, when applied, then it is audit-logged and balances stay consistent.

## Implementation Tasks From Backlog

- [ ] Backend: overlap-detection service + leave recalculation handover to EPIC-20
- [ ] Backend: conflict-register population
- [ ] Frontend: overlap view + conflict register screen
- [ ] Rules/Config: per-country holiday-in-leave inclusion rule
- [ ] Alerts/Workflow: notify employee on recalculation
- [ ] Tests: integration tests for exclude/include and post-approval holiday addition

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
