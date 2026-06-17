# Gap Analysis: EPIC-21-S03 — Eid holiday management (Hijri, provisional vs confirmed)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8

**Description**
Model Hijri-driven Eid Al-Fitr and Eid Al-Adha (multi-day, often moon-sighting dependent) with provisional (estimated) and confirmed (gazetted) date states, automatic propagation of the confirmed dates to attendance/leave/payroll, and handling of bridging days where applicable.

**Covers:** 21.7
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

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an Eid event, when created, then provisional Hijri-based dates are set and clearly marked provisional.
- [ ] Given a government announcement, when entered, then the confirmed dates replace provisional and propagate to consumers.
- [ ] Given multi-day Eid, when configured, then each day's pay treatment and any half-day eve is applied per country.
- [ ] Given confirmation/change, when applied, then it triggers the change-management flow and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: Eid-event model with provisional/confirmed states + Hijri date support
- [ ] Backend: propagation service on confirmation; bridging-day logic
- [ ] Frontend: Eid management screen (provisional vs confirmed)
- [ ] Rules/Config: per-country Eid day counts and eve half-day rules
- [ ] Alerts/Workflow: confirmation triggers change-management
- [ ] Tests: integration tests for provisional→confirmed propagation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
