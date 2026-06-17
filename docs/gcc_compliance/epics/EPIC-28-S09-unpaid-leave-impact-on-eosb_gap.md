# Gap Analysis: EPIC-28-S09 — Unpaid Leave Impact on EOSB

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-28-chapter-28-end-of-service-benefits-complia.md](./EPIC-28-chapter-28-end-of-service-benefits-complia.md)
> Parent epic: EPIC-28: Chapter 28 – End-of-Service Benefits Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `eosb` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** unpaid-leave periods to reduce qualifying service for EOSB per the configured country rule, **so that** the entitlement does not over-accrue for time not worked/paid.

**Description**
Pulls unpaid-leave history from the leave module and, per country rule, deducts the configured portion of unpaid-leave days from qualifying service (some jurisdictions exclude unpaid leave from service; others have thresholds). The adjustment is applied before accrual and shown explicitly so the leaver can see how unpaid leave changed their service and entitlement.

**Covers:** 28.16
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/leave/calendar/holidays/page.tsx
- apps/web/src/app/(modules)/leave/holiday-management/page.tsx
- apps/web/src/app/api/leave/holidays/route.ts
- apps/web/src/app/dashboard/leave/holiday-management/page.tsx
- apps/mobile/src/screens/leave/ApplyLeaveScreen.tsx
- apps/mobile/src/screens/leave/LeaveApprovalsScreen.tsx
- apps/mobile/src/screens/leave/LeaveDetailsScreen.tsx
- apps/mobile/src/screens/leave/LeaveHistoryScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given unpaid-leave records, when EOSB runs, then the configured per-country treatment (exclude all / exclude above threshold / include) is applied to qualifying service.
- [ ] Given the deduction, when applied, then the reduced qualifying service flows to the accrual engine and the day reduction is shown.
- [ ] Given a country that does not exclude unpaid leave, then no reduction is applied per configuration.
- [ ] Given the adjustment, then unpaid-leave days, rule applied and resulting service delta appear on the calculation sheet.
- [ ] Given any unpaid-leave adjustment, then it is audited and re-computable.

## Implementation Tasks From Backlog

- [ ] Backend: consumer of leave history; unpaid-leave aggregation per employee
- [ ] Backend: unpaid-leave service-adjustment rule applied in service-period derivation
- [ ] Frontend: unpaid-leave impact line on calculation sheet
- [ ] Rules/Config: per-country unpaid-leave treatment (exclude/threshold/include)
- [ ] Tests: unit tests across treatments and thresholds

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
