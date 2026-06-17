# Gap Analysis: EPIC-21-S06 — Holiday pay & overtime treatment

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** country-correct holiday pay and overtime treatment computed, **so that** holiday work is paid at the right premium and day-in-lieu rules apply.

**Description**
Implement per-country holiday-work treatment (e.g., UAE: pay for the day plus 50% of wage premium, or a substitute day off; rest-day/holiday premium rates), splitting normal vs premium hours, integrating with the OT engine (EPIC-12) and producing payroll inputs.

**Covers:** 21.10
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts
- apps/web/src/**tests**/services/attendance-overtime-dashboard.service.test.ts
- apps/web/src/app/(modules)/attendance/overtime-calculation/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/ot-rules/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given approved holiday work, when computed, then the country premium applies (e.g., 150% pay, or normal pay + day-in-lieu per UAE rule).
- [ ] Given hours beyond shift on a holiday, when computed, then holiday-OT rates layer correctly via the OT engine.
- [ ] Given a day-in-lieu rule, when chosen over premium, then a comp-off credit is generated instead of/with the premium per country.
- [ ] Given holiday pay, when produced, then it feeds payroll with a breakdown and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: holiday-pay treatment service (premium vs day-in-lieu) + OT-engine handover
- [ ] Backend: normal/premium hour split
- [ ] Frontend: holiday-pay breakdown view
- [ ] Rules/Config: per-country holiday premium rate and day-in-lieu rule
- [ ] Tests: unit tests for premium, OT layering, day-in-lieu per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
