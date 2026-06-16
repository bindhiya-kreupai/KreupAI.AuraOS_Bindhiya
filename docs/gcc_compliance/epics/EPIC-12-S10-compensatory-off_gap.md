# Gap Analysis: EPIC-12-S10 — Compensatory off

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 5

**Description**
Manage comp-off as an alternative to OT pay: accrue comp-off for eligible OT/rest-day/holiday work, track balances with expiry, allow employees to request comp-off leave, and reconcile so the same hours are never both paid and comped.

**Covers:** 12.14
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-comp-off-management-route.test.ts
- apps/web/src/**tests**/api/attendance-comp-off-route.test.ts
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

- [ ] Given eligible OT/holiday work, when policy elects comp-off, then a comp-off balance accrues with an expiry date.
- [ ] Given a comp-off balance, when an employee requests time off, then it is approved and deducted from balance.
- [ ] Given the same hours, when processed, then they cannot be both OT-paid and comp-off accrued (mutual exclusivity enforced).
- [ ] Given expiry, when reached, then unused comp-off is handled per policy (lapse/encash) and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `comp_off_balance` schema with accrual/expiry + mutual-exclusivity guard
- [ ] Backend: comp-off request/deduction service (integrate with leave EPIC-20)
- [ ] Frontend: comp-off balance + request screen (ESS)
- [ ] Rules/Config: per-country/policy comp-off accrual and expiry rules
- [ ] Tests: integration tests for paid-vs-comped mutual exclusivity

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
