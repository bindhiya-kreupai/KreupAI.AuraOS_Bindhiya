# Gap Analysis: EPIC-10-S07 — Payroll run & calculation engine

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 13
**User story:** Payroll Officer, **I want** a deterministic, re-runnable calculation engine, **so that** gross-to-net is computed consistently with full traceability.

**Description**
Build the core engine that, for each employee, evaluates earnings, proration, statutory and voluntary deductions and net pay in a defined order, producing per-employee payroll results with a calculation trace, supporting trial runs, recalculation and rollback before lock.

**Covers:** 10.7
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/api/v1/payroll/runs/[id]/payslips/route.ts
- apps/web/src/app/(modules)/payroll/tax-calculation/page.tsx
- apps/web/src/app/api/payroll/tax-calculation/route.ts
- apps/web/src/app/dashboard/payroll/tax-calculation/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payroll-run.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a period with complete inputs, when a trial run executes, then per-employee gross, deductions and net are computed with a step-by-step calculation trace.
- [ ] Given the same inputs, when re-run, then results are identical (deterministic) and the prior trial result is superseded, not overwritten silently.
- [ ] Given a calculation, when inspected, then each component shows its formula, base, proration factor and resulting amount.
- [ ] Given an error in inputs, when detected, then the affected employee is flagged with the reason and excluded from approval until resolved.
- [ ] Given a completed run, when results exist, then totals roll up by cost center, department and legal entity.

## Implementation Tasks From Backlog

- [ ] Backend: `payroll_run` and `payroll_result` schemas (`run_id`, `period_id`, `employee_id`, `gross`, `net`, `status`, `calc_trace`)
- [ ] Backend: ordered calculation engine (earnings → proration → deductions → net) with trace capture
- [ ] Backend: trial-run, recalculate and rollback services
- [ ] Frontend: run console with per-employee result and calculation-trace drill-down
- [ ] Rules/Config: calculation order and rounding rules per country
- [ ] Tests: unit + e2e tests for deterministic recompute and error-flagging

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
