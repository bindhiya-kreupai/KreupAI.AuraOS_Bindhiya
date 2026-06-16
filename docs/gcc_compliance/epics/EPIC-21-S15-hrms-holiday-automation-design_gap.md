# Gap Analysis: EPIC-21-S15 — HRMS holiday automation design

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5
**User story:** System Administrator, **I want** the holiday automation/event design implemented, **so that** calendar publish, propagation and integrations run with minimal manual effort.

**Description**
Implement event-driven publish/propagation of holiday and Ramadan/Eid events, scheduled reminders for upcoming holidays and pending Eid confirmations, and orchestrated handovers to attendance/leave/OT/payroll over the event bus with retry/observability.

**Covers:** 21.21
**Acceptance criteria count:** 4 · **Task count:** 5

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

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a calendar publish/change, when emitted, then attendance/leave/OT/payroll consumers process idempotently.
- [ ] Given pending Eid/Ramadan confirmation, when the reminder schedule runs, then HR is prompted ahead of the date.
- [ ] Given a failed consumer, when it errors, then retry and DLQ handling apply with alerting.
- [ ] Given automation config, when changed, then schedules/rules update without code deploy where possible.

## Implementation Tasks From Backlog

- [ ] Backend: event topology (`holiday.*`, `ramadan.*` topics), DLQ + retry; reminder scheduler
- [ ] Backend: idempotent consumers/handovers
- [ ] Frontend: automation/job-monitoring admin screen
- [ ] Rules/Config: configurable reminder lead times
- [ ] Tests: integration tests for propagation and DLQ handling

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
