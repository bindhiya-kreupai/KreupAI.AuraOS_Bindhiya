# Gap Analysis: EPIC-12-S07 — Ramadan working hours

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Apply Ramadan reduced standard hours (e.g., 2-hour daily reduction per applicable country rules) for the configured Ramadan period, recompute the OT threshold/baseline, and handle whether the reduction applies to all staff or fasting Muslims per country, integrating with the holiday/Ramadan calendar.

**Covers:** 12.11
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/ramadan-hours/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/ramadan-auto-switch/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/app/(modules)/attendance/time-tracking/project-hours/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given the configured Ramadan period, when active, then the standard daily hours are reduced per the country rule and OT is measured against the reduced baseline.
- [ ] Given a country, when Ramadan rules apply, then applicability scope (all staff vs Muslim/fasting staff) is resolved per configuration.
- [ ] Given the Ramadan period boundaries, when set, then they bind to the holiday calendar (EPIC-21) and the rule engine.
- [ ] Given Ramadan OT, when calculated, then the reduced-baseline computation is reflected in the calculation trace.

## Implementation Tasks From Backlog

- [ ] Backend: Ramadan-period reduced-hours service feeding OT baseline
- [ ] Backend: applicability-scope resolution per country
- [ ] Frontend: Ramadan rules configuration + period binding
- [ ] Rules/Config: per-country Ramadan hour reduction and scope
- [ ] Tests: unit tests for reduced-baseline OT during Ramadan

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
