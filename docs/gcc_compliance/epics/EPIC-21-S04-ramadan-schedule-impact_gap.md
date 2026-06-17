# Gap Analysis: EPIC-21-S04 — Ramadan schedule impact

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** Ramadan's schedule impact reflected in the holiday/calendar module, **so that** the Ramadan window drives reduced hours and related events consistently.

**Description**
Define the Hijri Ramadan window (provisional/confirmed) at the calendar level so that the reduced-hours rule (consumed by attendance EPIC-19) and Ramadan-related events (e.g., Eid eve) activate over the correct period, with country-specific eligibility.

**Covers:** 21.8
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/ramadan-auto-switch/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/components/time-attendance/VisualScheduleBuilder.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given the Hijri year, when configured, then the Ramadan window is set with provisional then confirmed start/end.
- [ ] Given the confirmed window, when published, then attendance consumes it for reduced-hours and evaluation.
- [ ] Given country eligibility, when applied, then the reduced-hours scope targets the correct population per law.
- [ ] Given window confirmation/change, when applied, then it propagates and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `ramadan_window` schema (country, provisional, confirmed, eligibility) + publish event
- [ ] Backend: propagation to attendance (`ramadan.window.confirmed`)
- [ ] Frontend: Ramadan window config screen
- [ ] Rules/Config: per-country Ramadan eligibility
- [ ] Tests: integration tests for window confirm + propagation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
