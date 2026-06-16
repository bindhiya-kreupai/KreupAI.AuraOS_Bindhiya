# Gap Analysis: EPIC-19-S04 — Shift management

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8

**Description**
Support shift definitions (day/night/split), rotation patterns, roster planning, shift swaps and night-shift differential flags, with cross-midnight handling so punches map to the correct shift window.

**Covers:** 19.7
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given a shift, when defined, then window, cross-midnight flag, break and night-shift flag are stored.
- [ ] Given a rotation pattern, when generated, then a roster is produced per employee/team for the period.
- [ ] Given a night shift crossing midnight, when a punch posts at 02:00, then it maps to the prior day's shift correctly.
- [ ] Given a shift swap, when approved, then both employees' rosters update and the change is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `shift`, `roster`, `shift_swap` schemas (window, cross_midnight, rotation_pattern)
- [ ] Backend: roster generation + cross-midnight punch-mapping service
- [ ] Frontend: roster planner + shift-swap request screen
- [ ] Rules/Config: night-shift differential flag per country
- [ ] Alerts/Workflow: shift-swap approval workflow
- [ ] Tests: integration tests for rotation and cross-midnight mapping

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
