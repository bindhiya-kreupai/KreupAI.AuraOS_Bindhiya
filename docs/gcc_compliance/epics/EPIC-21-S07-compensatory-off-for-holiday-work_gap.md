# Gap Analysis: EPIC-21-S07 — Compensatory off for holiday work

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 3

**Description**
Generate comp-off credits from approved holiday work (where day-in-lieu treatment applies) and hand them to the leave module's comp-off balance (EPIC-20), with validity and conversion rules.

**Covers:** 21.11
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/components/time-attendance/LaborCostForecasting.tsx
- apps/web/src/**tests**/api/attendance-comp-off-management-route.test.ts
- apps/web/src/**tests**/api/attendance-comp-off-route.test.ts
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given approved holiday work with day-in-lieu treatment, when processed, then a comp-off credit is created with validity.
- [ ] Given the credit, when published, then it appears in the employee's comp-off balance (EPIC-20).
- [ ] Given an expiring credit, when validity passes, then it lapses or converts to pay per country rule.
- [ ] Given credit creation, when done, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: comp-off credit generation + publish `holiday.compoff.credited`
- [ ] Backend: validity/conversion config
- [ ] Frontend: holiday comp-off summary view
- [ ] Rules/Config: per-country comp-off validity and conversion
- [ ] Tests: integration tests for credit generation and handover

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
