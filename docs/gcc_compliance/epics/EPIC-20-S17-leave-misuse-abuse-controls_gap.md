# Gap Analysis: EPIC-20-S17 — Leave misuse & abuse controls

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** detection of leave misuse patterns, **so that** abuse (e.

**Description**
Implement pattern detection (frequent short sick leaves, leave around weekends/holidays, certificate anomalies, negative-balance forcing) raising a misuse flag/register with risk scoring for HR review.

**Covers:** 20.23
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given recurring sick leave adjacent to weekends/holidays, when detected, then a misuse pattern is flagged.
- [ ] Given certificate anomalies (duplicate/expired source), when detected, then the leave is flagged for verification.
- [ ] Given a flag, when raised, then it enters a misuse register with risk score and routes to HR.
- [ ] Given any flag/resolution, when actioned, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: misuse-pattern rules + `leave_misuse_flag` schema
- [ ] Backend: certificate-anomaly checks
- [ ] Frontend: misuse register/review screen
- [ ] Rules/Config: pattern thresholds per country
- [ ] Alerts/Workflow: HR review notification
- [ ] Tests: unit tests for each misuse pattern

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
