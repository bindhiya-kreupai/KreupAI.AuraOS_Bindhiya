# Gap Analysis: EPIC-12-S01 — Working-hours, purpose & OT governance framework

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a configurable working-hours and overtime governance framework per country, **so that** OT operates within statutory hour limits and defined controls.

**Description**
Establish standard/maximum working hours per country (daily/weekly), define the OT governance model (policy, roles, control points, statutory caps) and capture the handbook's purpose/working-hours context, forming the rule baseline all OT stories consume.

**Covers:** 12.1, 12.2, 12.3, 12.4
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

- [ ] Given each GCC country, when configured, then standard and maximum daily/weekly working hours and OT caps are defined (e.g., max 2 OT hours/day where applicable).
- [ ] Given OT governance, when set, then policy, approval roles and control points are mandatory before OT is payable.
- [ ] Given a country, when working hours are evaluated, then the rule engine resolves the correct limits per legal entity.
- [ ] Given any config change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `working_hours_rule` and `ot_policy` schemas (country, std_hours, max_hours, daily_ot_cap)
- [ ] Backend: governance control-point service
- [ ] Frontend: working-hours & OT policy configuration screen
- [ ] Rules/Config: per-country statutory hour limits and OT caps
- [ ] Tests: unit tests for hour-limit resolution per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
