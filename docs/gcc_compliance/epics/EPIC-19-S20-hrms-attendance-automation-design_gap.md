# Gap Analysis: EPIC-19-S20 — HRMS attendance automation design

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**User story:** System Administrator, **I want** the attendance automation/event design implemented, **so that** punch→evaluation→exception→payroll flows run with minimal manual effort.

**Description**
Implement the end-to-end automation: scheduled day-close jobs, event-driven evaluation on each punch, auto-generation of exceptions/alerts, and orchestrated handovers to leave/OT/payroll via the event bus with retry/observability.

**Covers:** 19.24
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

- [ ] Given the day-close schedule, when it runs, then all employees' attendance is evaluated and exceptions generated.
- [ ] Given a punch event, when published, then downstream evaluation/fraud/geofence consumers process idempotently.
- [ ] Given a failed job/consumer, when it errors, then retry and dead-letter handling apply with alerting.
- [ ] Given automation config, when changed, then schedules/rules update without code deploy where possible.

## Implementation Tasks From Backlog

- [ ] Backend: scheduler + event-bus topology (`attendance.*` topics), DLQ + retry
- [ ] Backend: idempotent consumers for evaluation/fraud/geofence
- [ ] Frontend: automation/job-monitoring admin screen
- [ ] Rules/Config: configurable day-close time, batch sizing
- [ ] Tests: integration tests for job orchestration and DLQ handling

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
