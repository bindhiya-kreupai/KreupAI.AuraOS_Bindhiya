# Gap Analysis: EPIC-10-S06 — Proration & new joiner/leaver payroll

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** automatic proration for mid-period joiners, leavers and salary changes, **so that** part-period pay is accurate per country day-count rules.

**Description**
Compute prorated earnings/deductions for joiners, leavers, mid-period transfers, unpaid leave and salary revisions, using configurable day-count basis (calendar days, 30-day, actual working days) per country, and split components by proratable flag.

**Covers:** 10.6
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx
- apps/web/src/app/(modules)/payroll/payslips/page.tsx
- apps/web/src/app/api/payroll/payslip-generation/route.ts
- apps/web/src/app/api/payroll/payslips/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a joiner mid-period, when calculated, then proratable components are prorated from the join date using the configured day-count basis.
- [ ] Given a leaver, when their last period runs, then earnings are prorated to last working day and outstanding recoveries and leave encashment are flagged.
- [ ] Given a mid-period salary change, when applied, then the period splits at the effective date and each portion uses the correct rate.
- [ ] Given a country, when proration runs, then the correct day-count convention (e.g., 30-day vs calendar) is applied via the rule engine.
- [ ] Given a non-proratable component, when present, then it is paid in full regardless of part-period.

## Implementation Tasks From Backlog

- [ ] Backend: proration engine with configurable day-count basis + period-split logic
- [ ] Backend: joiner/leaver detection from employee lifecycle events
- [ ] Frontend: proration preview per affected employee
- [ ] Rules/Config: per-country day-count convention
- [ ] Tests: unit tests for joiner/leaver/mid-change proration across day-count bases

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
