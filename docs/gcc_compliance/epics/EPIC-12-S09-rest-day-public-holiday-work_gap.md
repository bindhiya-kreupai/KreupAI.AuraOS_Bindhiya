# Gap Analysis: EPIC-12-S09 — Rest-day & public-holiday work

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** rest-day and public-holiday work computed at premium rates, **so that** weekend/holiday work is compensated per labour law.

**Description**
Detect work on weekly rest days and public holidays (via holiday calendar EPIC-21), apply the statutory premium and/or compensatory-off entitlement per country, and route holiday-work approval, distinguishing rest-day vs gazetted-holiday treatment.

**Covers:** 12.13
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given work on a rest day or public holiday, when detected, then the country's premium rate and/or comp-off entitlement is applied.
- [ ] Given holiday work, when performed, then prior approval is required and post-facto cases are flagged as exceptions.
- [ ] Given a country, when computing, then rest-day vs public-holiday rules are distinguished and resolved via the rule engine.
- [ ] Given the calculation, when produced, then premium and/or comp-off accrual is recorded with a trace.

## Implementation Tasks From Backlog

- [ ] Backend: rest-day/holiday-work detection against holiday calendar + premium/comp-off application
- [ ] Backend: holiday-work approval gate
- [ ] Frontend: holiday-work approval + result view
- [ ] Rules/Config: per-country rest-day and holiday premium/comp-off rules
- [ ] Alerts/Workflow: holiday-work approval routing
- [ ] Tests: integration tests for premium vs comp-off per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
