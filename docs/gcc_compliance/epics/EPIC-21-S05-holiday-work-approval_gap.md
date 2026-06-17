# Gap Analysis: EPIC-21-S05 — Holiday work approval

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**User story:** Line Manager, **I want** a holiday-work approval workflow, **so that** working on a public holiday/rest day is pre-authorized and evidenced.

**Description**
Provide a request/approval workflow to authorize specified employees to work on a public holiday or rest day (reason, headcount, shift), feeding the Holiday Work Approval Register and enabling correct holiday pay/comp-off downstream; unauthorized holiday work is flagged.

**Covers:** 21.9, 21.25 (feeds register)
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/app/api/attendance/approval-workflow/route.ts
- apps/web/src/app/dashboard/attendance/approval-workflow/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given an upcoming holiday, when a manager requests holiday work, then employees, shift and reason are captured and routed for approval.
- [ ] Given approval, when granted, then approved employees are tagged for holiday-work pay/comp-off treatment.
- [ ] Given attendance on a holiday without approval, when detected, then it is flagged as unauthorized for review.
- [ ] Given any approval, when granted, then it posts to the Holiday Work Approval Register and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `holiday_work_request` schema (holiday_id, employee_ids, shift, reason, status)
- [ ] Backend: approval service + unauthorized-holiday-work detection
- [ ] Frontend: holiday-work request + approval screens
- [ ] Rules/Config: approver hierarchy per entity
- [ ] Alerts/Workflow: approval routing + maker-checker
- [ ] Tests: e2e for request→approve→tag; unauthorized detection

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
