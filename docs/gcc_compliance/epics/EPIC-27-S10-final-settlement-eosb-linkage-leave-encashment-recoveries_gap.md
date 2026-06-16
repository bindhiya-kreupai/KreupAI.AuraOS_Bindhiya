# Gap Analysis: EPIC-27-S10 — Final Settlement, EOSB Linkage, Leave Encashment & Recoveries

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Must · **Estimate:** 13
**User story:** Payroll Officer, **I want** an integrated final-settlement engine combining EOSB, leave encashment, dues and recoveries, **so that** the employee is paid the correct net amount lawfully and on time.

**Description**
Builds the final-settlement engine consolidating: pending salary/proration, EOSB from EPIC-28, leave-balance encashment from EPIC-20, notice/in-lieu, and deductions/recoveries (loans, advances, asset/training recovery, notice shortfall), with maker-checker approval, statutory deduction-limit checks, WPS-consistent payout instruction and a settlement statement.

**Covers:** 27.16, 27.17, 27.18, 27.19
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/leave/balances/encashment/page.tsx
- apps/web/src/app/(modules)/leave/leave-encashment/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/eosb/settlement-simulation/page.tsx
- apps/web/src/app/api/leave/encashment/route.ts
- apps/web/src/app/api/v1/leave-encashments/[id]/approve/route.ts
- apps/web/src/app/api/v1/leave-encashments/route.ts
- apps/web/src/app/dashboard/leave/leave-encashment/page.tsx
- apps/web/src/app/(modules)/leave/calendar/holidays/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a separation, when final settlement is computed, then EOSB (EPIC-28), leave encashment (EPIC-20), pending dues and recoveries are aggregated to a net amount.
- [ ] Given leave encashment, when calculated, then it uses the correct salary basis and accrued balance per country.
- [ ] Given deductions/recoveries, when applied, then they respect statutory deduction limits and require justification.
- [ ] Given maker-checker, when applied, then preparer ≠ approver and the settlement is locked on approval.
- [ ] Given an approved settlement, when released, then a WPS-consistent payout instruction and settlement statement are produced; release within the statutory window (e.g. flag if beyond 14 days of last day in UAE) is enforced.
- [ ] Given any settlement action, when performed, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: `final_settlement` (components[], gross, deductions, net, status) + EOSB/leave/recovery aggregation services.
- [ ] Backend: maker-checker + statutory-limit validation + WPS payout instruction.
- [ ] Frontend: final-settlement worksheet + approval + statement preview.
- [ ] Rules/Config: per-country salary basis, encashment, deduction limits and release windows.
- [ ] Alerts/Workflow: maker-checker routing + release-deadline alerts.
- [ ] Tests: integration (aggregation + payout), unit (limit checks, maker-checker).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
