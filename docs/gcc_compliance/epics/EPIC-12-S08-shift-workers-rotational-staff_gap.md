# Gap Analysis: EPIC-12-S08 — Shift workers & rotational staff

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5

**Description**
Support shift patterns and rotations in OT detection/calculation: define shift schedules, night-shift windows, rotation cycles and rest requirements, so OT beyond rostered shifts (including cross-midnight) is detected and classified correctly.

**Covers:** 12.12
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts
- apps/web/src/**tests**/api/attendance-timesheets-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a rostered shift, when actual hours exceed it, then OT is measured against the roster, not a fixed day window.
- [ ] Given a cross-midnight or night shift, when worked, then hours are attributed to the correct day/type and night-OT rules apply.
- [ ] Given a rotation cycle, when evaluated, then minimum rest between shifts is checked and breaches flagged.
- [ ] Given shift config, when changed, then it is effective-dated and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: shift/roster-aware OT detection (cross-midnight handling)
- [ ] Backend: minimum-rest-between-shifts check
- [ ] Frontend: shift/rotation configuration screen
- [ ] Rules/Config: night-window and rest-period rules per country
- [ ] Tests: integration tests for cross-midnight OT attribution

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
