# Gap Analysis: EPIC-12-S06 — Overtime calculation principles & country-specific controls

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** country-correct OT calculation, **so that** OT pay matches each GCC country's statutory rates and caps.

**Description**
Implement the OT calculation engine using configurable hourly-rate basis and country-specific premium multipliers and caps (e.g., UAE ~1.25× normal / 1.5× night, rest-day and holiday premiums; Saudi 1.5×; similar rules for Bahrain/Qatar/Oman/Kuwait), with hourly-rate derivation from the correct salary basis per country.

**Covers:** 12.9, 12.10
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/overtime-calculation/page.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts
- apps/web/src/**tests**/services/attendance-overtime-dashboard.service.test.ts
- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/ot-rules/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given OT hours and type, when calculated, then the correct country premium multiplier and hourly-rate basis are applied via the rule engine.
- [ ] Given a country cap (e.g., max OT hours/day), when exceeded, then excess hours are flagged and handled per policy.
- [ ] Given different OT types, when present in a period, then each is calculated at its own rate and summed.
- [ ] Given a country, when the hourly rate is derived, then it uses that country's prescribed salary base (e.g., basic vs gross).
- [ ] Given a calculation, when produced, then a trace of rate, multiplier and hours is captured.

## Implementation Tasks From Backlog

- [ ] Backend: OT calculation engine with hourly-rate derivation + premium application
- [ ] Backend: per-country rate/multiplier/cap rule pack
- [ ] Frontend: OT calculation preview with rate trace
- [ ] Rules/Config: UAE/Saudi/Bahrain/Qatar/Oman/Kuwait OT rates, bases and caps
- [ ] Tests: unit tests for each country's multiplier and cap handling

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
