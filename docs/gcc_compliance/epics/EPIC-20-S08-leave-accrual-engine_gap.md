# Gap Analysis: EPIC-20-S08 — Leave accrual engine

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** an automated leave accrual engine, **so that** balances build correctly over time per country rules.

**Description**
Implement accrual (monthly/daily proration, post-probation start, accrual caps, mid-service joiners/leavers, unpaid-leave impact on accrual) for annual and other accruing leave types, producing auditable balance ledgers.

**Covers:** 20.15
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/app/(modules)/leave/accrual-engine/page.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md
- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given an accrual rule, when the period runs, then balance accrues per country basis (e.g., 2.5 days/month for 30-day annual).
- [ ] Given probation/eligibility, when not yet met, then accrual starts only after the configured point.
- [ ] Given unpaid leave in a period, when accrual runs, then accrual is reduced per country rule.
- [ ] Given each accrual, when posted, then a ledger entry is created and auditable; caps are enforced.

## Implementation Tasks From Backlog

- [ ] Backend: accrual scheduler + `leave_balance_ledger` schema (accrual, used, adjustment, balance)
- [ ] Backend: proration + cap + unpaid-impact logic
- [ ] Frontend: balance ledger view
- [ ] Rules/Config: per-country accrual rate, start point, caps
- [ ] Tests: unit tests for proration, caps, unpaid impact

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
