# Gap Analysis: EPIC-19-S14 — Remote work attendance

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5

**Description**
Support remote/hybrid attendance via web/mobile punch with optional activity confirmation, location category (home/field) instead of strict geofence, tied to an approved remote-work arrangement, while preserving working-hours and privacy controls.

**Covers:** 19.17
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
- apps/web/src/**tests**/api/attendance-work-from-home-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given an approved remote arrangement, when an employee punches remotely, then it is accepted and tagged remote.
- [ ] Given remote punch outside an arrangement, when submitted, then it is flagged for manager review.
- [ ] Given remote work, when evaluated, then working-hours and short-hours rules still apply.
- [ ] Given location capture, when remote, then only category/coarse location is stored per privacy policy.

## Implementation Tasks From Backlog

- [ ] Backend: `remote_work_arrangement` schema; remote-punch acceptance logic
- [ ] Backend: link punch to arrangement + tagging
- [ ] Frontend: remote punch + arrangement request screens
- [ ] Rules/Config: remote eligibility and location-granularity per policy
- [ ] Tests: integration tests for in/out-of-arrangement remote punches

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
