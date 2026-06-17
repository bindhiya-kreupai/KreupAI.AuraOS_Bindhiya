# Gap Analysis: EPIC-21-S01 — Holiday objectives, types & governance framework

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a configurable holiday governance framework and holiday-type taxonomy per country, **so that** holidays are managed under defined controls and the correct legal basis.

**Description**
Establish the governance baseline: holiday-type taxonomy (national/public, religious/Islamic, gazetted vs declared, paid vs optional, half-day), ownership/approval roles, control points and the stated objectives. This is the rule foundation all holiday stories consume.

**Covers:** 21.1, 21.2, 21.3, 21.4
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

- [ ] Given each GCC country, when configured, then holiday types and their pay/treatment defaults are stored and versioned.
- [ ] Given the governance model, when set, then calendar-owner roles and approval/control points are mandatory.
- [ ] Given a legal entity, when holiday rules resolve, then the rule engine returns the correct country/entity configuration.
- [ ] Given any framework/type change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `holiday_governance` + `holiday_type` schemas (country, type, pay_treatment, gazetted_flag)
- [ ] Backend: governance control-point + rule-resolution service
- [ ] Frontend: holiday governance & type configuration screen
- [ ] Rules/Config: per-country holiday-type defaults
- [ ] Tests: unit tests for type/treatment resolution per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
