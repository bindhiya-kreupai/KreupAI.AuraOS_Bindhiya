# Gap Analysis: EPIC-19-S01 — Working-hours context, objectives & attendance governance framework

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a configurable attendance governance framework anchored to GCC working-hours context, **so that** attendance operates within statutory limits and defined controls.

**Description**
Establish the governance baseline: standard/maximum working hours per country (e.g., UAE 8h/day or 48h/week, reduced to 6h/day in Ramadan for fasting workers; Friday rest day), control roles, escalation points and the stated objectives of attendance compliance. This is the rule foundation every other story consumes.

**Covers:** 19.1, 19.2, 19.3, 19.4
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

- [ ] Given each GCC country, when configured, then standard daily/weekly hours, weekly rest day and Ramadan reductions are stored and versioned.
- [ ] Given the governance model, when set, then owner roles (HR Admin/Manager, Line Manager, Compliance Officer) and control points are mandatory.
- [ ] Given a legal entity, when working hours are resolved, then the rule engine returns the correct country/entity limits.
- [ ] Given any framework or hour-limit change, when saved, then it is versioned and audit-logged with maker-checker.

## Implementation Tasks From Backlog

- [ ] Backend: `attendance_governance` and `working_hours_rule` schemas (country, std_daily_hours, weekly_hours, rest_day, ramadan_daily_hours)
- [ ] Backend: governance control-point + rule-resolution service
- [ ] Frontend: attendance governance & working-hours configuration screen
- [ ] Rules/Config: per-country statutory hour limits and rest-day defaults
- [ ] Tests: unit tests for hour-limit resolution per country/entity

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
