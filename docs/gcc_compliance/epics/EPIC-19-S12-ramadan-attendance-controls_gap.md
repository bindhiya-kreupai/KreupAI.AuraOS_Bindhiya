# Gap Analysis: EPIC-19-S12 — Ramadan attendance controls

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** automatic Ramadan working-hour reductions, **so that** schedules and absence/late evaluation comply with reduced hours during Ramadan.

**Description**
Apply country-specific Ramadan reductions (e.g., 2-hour daily reduction in UAE; reduced hours for fasting workers) over the Hijri Ramadan window, auto-adjusting effective schedules and late/early/short-hours evaluation, with eligibility (fasting/Muslim or all-staff per country law).

**Covers:** 19.15
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/ramadan-auto-switch/page.tsx
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

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given the configured Ramadan window, when active, then effective daily hours reduce per country rule automatically.
- [ ] Given reduced hours, when attendance is evaluated, then late/early/short-hours thresholds use the Ramadan schedule.
- [ ] Given country eligibility rules, when applied, then the reduction targets the correct population.
- [ ] Given the Ramadan window end, when passed, then schedules revert automatically, audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `ramadan_rule` schema (country, window_start, window_end, hours_reduction, eligibility)
- [ ] Backend: schedule-override service for Ramadan period
- [ ] Frontend: Ramadan window/eligibility config screen
- [ ] Rules/Config: per-country Ramadan reduction and eligibility
- [ ] Tests: unit tests for window activation, evaluation and revert

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
