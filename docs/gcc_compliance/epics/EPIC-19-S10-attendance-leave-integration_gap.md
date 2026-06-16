# Gap Analysis: EPIC-19-S10 — Attendance ↔ leave integration

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Consume approved leave from EPIC-20 to suppress absence/late flags on leave days, optionally convert unauthorized absence to sick/unpaid leave on approval, and reflect half-day leave against partial attendance.

**Covers:** 19.13
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/time-attendance/BiometricIntegration.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/app/(modules)/attendance/biometric-integration/page.tsx
- apps/web/src/app/dashboard/attendance/biometric-integration/page.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given an approved full-day leave, when day-close runs, then no absence/late exception is raised for that date.
- [ ] Given a half-day leave, when evaluated, then only the working half-day is checked for late/early.
- [ ] Given an unauthorized absence later covered by approved sick leave, when applied, then the absence reclassifies and LOP reverses.
- [ ] Given any reclassification, when applied, then it is audit-logged and the leave/attendance balances stay consistent.

## Implementation Tasks From Backlog

- [ ] Backend: subscribe to `leave.approved` events; reconciliation service
- [ ] Backend: absence→leave conversion logic with reversal of LOP
- [ ] Frontend: combined attendance+leave day view
- [ ] Rules/Config: half-day handling and conversion rules per country
- [ ] Tests: integration tests for suppression, half-day, and reclassification

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
