# Gap Analysis: EPIC-19-S07 — Missing punch management

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Detect single-sided or missing punches against the schedule, notify the employee/manager, and provide a missing-punch correction request feeding the regularization workflow and the Missing Punch Register.

**Covers:** 19.10, 19.28 (feeds register)
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

- [ ] Given an expected punch absent by a cut-off, when detected, then a missing-punch exception is raised and the employee notified.
- [ ] Given a single IN with no OUT, when end-of-day runs, then the record is flagged incomplete (not auto-closed as full day).
- [ ] Given a correction request, when submitted with reason, then it routes to manager approval and updates the record on approval.
- [ ] Given any correction, when applied, then before/after values and approver are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: missing-punch detection job + `punch_correction_request` schema
- [ ] Backend: correction-apply service with audit snapshot
- [ ] Frontend: missing-punch alert + correction request screen
- [ ] Rules/Config: detection cut-off time per shift/country
- [ ] Alerts/Workflow: employee + manager notification, approval workflow
- [ ] Tests: integration tests for detection and correction apply

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
