# Gap Analysis: EPIC-19-S13 — Public holiday and rest-day attendance

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Consume the holiday calendar (EPIC-21) and configured rest days so those dates are excluded from absence, while detecting punches on holidays/rest days and tagging them for holiday-work premium or comp-off handover.

**Covers:** 19.16
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

- [ ] Given a public holiday or rest day, when day-close runs, then no absence is raised for non-attendance.
- [ ] Given a punch on a holiday/rest day, when recorded, then it is tagged as holiday/rest-day work and handed to OT/comp-off.
- [ ] Given a country-specific rest day, when evaluated, then the correct weekly-off applies.
- [ ] Given holiday-work detection, when tagged, then it appears in the holiday-work feed and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: subscribe to `holiday.calendar` data; rest-day/holiday evaluation service
- [ ] Backend: holiday-work tagging + handover to EPIC-12/EPIC-21
- [ ] Frontend: calendar overlay on attendance views
- [ ] Rules/Config: per-country rest day; holiday-work eligibility
- [ ] Tests: integration tests for suppression and holiday-work tagging

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
