# Gap Analysis: EPIC-19-S03 — Work schedules

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Create reusable work-schedule templates (fixed, flexible, compressed) with planned start/end, break, weekly off pattern and tolerance, and assign them to employees, positions or org units with effective dating.

**Covers:** 19.6
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/app/api/v1/attendance/schedules/[id]/route.ts
- apps/web/src/app/api/v1/attendance/schedules/route.ts
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a schedule template, when created, then start/end, breaks, weekly-off pattern and grace tolerance are defined.
- [ ] Given an employee, when assigned a schedule, then it is effective-dated and overrides the org default.
- [ ] Given a flexible schedule, when evaluated, then core hours and total-hours rules apply instead of fixed start.
- [ ] Given a country rest day (e.g., Friday), when scheduled, then weekly-off aligns to the configured rest day.

## Implementation Tasks From Backlog

- [ ] Backend: `work_schedule` + `schedule_assignment` schemas (template, start, end, break, weekly_off, effective_from)
- [ ] Backend: schedule resolution service (employee → effective schedule per date)
- [ ] Frontend: schedule template builder + assignment screen
- [ ] Rules/Config: per-country rest-day and default schedule
- [ ] Tests: unit tests for effective-dated schedule resolution

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
