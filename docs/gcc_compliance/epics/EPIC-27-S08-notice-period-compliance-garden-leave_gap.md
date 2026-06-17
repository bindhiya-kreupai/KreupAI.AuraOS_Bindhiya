# Gap Analysis: EPIC-27-S08 — Notice Period Compliance & Garden Leave

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** notice-period and garden-leave handling enforced per country, **so that** notice pay, in-lieu amounts and garden-leave status are correct.

**Description**
Computes notice periods per country/contract/seniority, supports notice served, pay-in-lieu, and shortfall recovery, and manages garden leave (employee off-site but employed/paid, restricted access, accruals continuing) including its interaction with leave, payroll, EOSB service period and IT access.

**Covers:** 27.13, 27.14
**Acceptance criteria count:** 5 · **Task count:** 6

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

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given a separation, when notice is computed, then country/contract/seniority rules determine the period and last working day.
- [ ] Given pay-in-lieu of notice, when selected, then the amount is computed and instructed to payroll (WPS-consistent).
- [ ] Given garden leave, when applied, then the employee remains paid with service accruing, access restrictions are enforced, and the period is flagged distinct from notice-served.
- [ ] Given notice shortfall by the employee, when present, then recovery is computed for final settlement.
- [ ] Given any notice/garden-leave action, when processed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `notice_period`, `garden_leave` entities + computation service.
- [ ] Backend: pay-in-lieu/shortfall feed to settlement + access-restriction trigger.
- [ ] Frontend: notice/garden-leave management screen.
- [ ] Rules/Config: per-country notice periods, in-lieu and garden-leave rules.
- [ ] Alerts/Workflow: notice-period milestone alerts; access-restriction request.
- [ ] Tests: integration (notice computation + in-lieu), unit (garden-leave accrual).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
