# Gap Analysis: EPIC-21-S09 — Holiday & attendance integration

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Publish the published holiday calendar to attendance (EPIC-19) so holiday/rest dates are excluded from absence evaluation and punches on holidays are tagged for holiday-work treatment, with re-evaluation when dates are confirmed/changed.

**Covers:** 21.13
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

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a published holiday, when consumed by attendance, then no absence is raised for non-attendance on that date.
- [ ] Given a punch on a holiday, when detected, then it is tagged holiday-work and linked to approval/pay treatment.
- [ ] Given a holiday date change/confirmation, when published, then attendance re-evaluates affected dates.
- [ ] Given integration actions, when applied, then they are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: publish `holiday.calendar.published`/`holiday.date.changed`; attendance consumers
- [ ] Backend: re-evaluation trigger on date change
- [ ] Frontend: calendar overlay on attendance views
- [ ] Rules/Config: holiday-work eligibility per site
- [ ] Tests: integration tests for suppression, tagging, re-evaluation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
