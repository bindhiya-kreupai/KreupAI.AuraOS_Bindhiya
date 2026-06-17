# Gap Analysis: EPIC-19-S06 — Late arrival and early departure handling

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Compare actual IN/OUT against the effective schedule and policy grace, classify late/early events, accumulate occurrences, and compute any deduction or warning per country policy.

**Covers:** 19.9
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/shift-templates/page.tsx
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

- [ ] Given a punch later than start + grace, when evaluated, then a late event is recorded with minutes late.
- [ ] Given an OUT before end − grace, when evaluated, then an early-departure event is recorded.
- [ ] Given accumulated occurrences beyond threshold, when reached, then a warning/deduction action is triggered per policy.
- [ ] Given a deduction rule, when applied, then the LOP amount is computed and queued for payroll, audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `attendance_exception` schema (type, minutes, occurrence_count)
- [ ] Backend: late/early evaluation + occurrence-accumulation service
- [ ] Frontend: employee/manager view of late/early events
- [ ] Rules/Config: grace, thresholds and deduction logic per country/grade
- [ ] Alerts/Workflow: threshold-breach notification to manager
- [ ] Tests: unit tests for boundary cases (exactly at grace, cumulative thresholds)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
