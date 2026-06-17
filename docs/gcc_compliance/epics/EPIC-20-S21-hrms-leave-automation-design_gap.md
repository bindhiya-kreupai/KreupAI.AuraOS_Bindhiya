# Gap Analysis: EPIC-20-S21 — HRMS leave automation design

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 5
**User story:** System Administrator, **I want** the leave automation/event design implemented, **so that** accrual, carry-forward, integrations and approvals run with minimal manual effort.

**Description**
Implement scheduled accrual/carry-forward/expiry jobs, event-driven integrations to attendance/payroll, automated approval routing and reminders, with retry/observability over the event bus.

**Covers:** 20.28
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
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given scheduled jobs, when they run, then accrual, carry-forward and expiry process for all employees with ledger entries.
- [ ] Given leave events, when published, then attendance/payroll consumers process idempotently.
- [ ] Given a failed job/consumer, when it errors, then retry and DLQ handling apply with alerting.
- [ ] Given automation config, when changed, then schedules/rules update without code deploy where possible.

## Implementation Tasks From Backlog

- [ ] Backend: scheduler + event topology (`leave.*` topics), DLQ + retry
- [ ] Backend: idempotent consumers for attendance/payroll handovers
- [ ] Frontend: automation/job-monitoring admin screen
- [ ] Rules/Config: configurable schedules
- [ ] Tests: integration tests for job orchestration and DLQ

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
