# Gap Analysis: EPIC-33-S06 — Payroll forms group (salary advance, loan, overtime, payroll change)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-33-chapter-33-hr-forms-and-templates.md](./EPIC-33-chapter-33-hr-forms-and-templates.md)
> Parent epic: EPIC-33: Chapter 33 – HR Forms and Templates
> Module: Forms
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `forms` · **Priority:** Must · **Estimate:** 8

**Description**
Delivers the payroll form group feeding the payroll module (EPIC-10/12): Salary Advance, Employee Loan Request (with eligibility and repayment schedule), Overtime Approval (pre-approval feeding OT calc), and Payroll Change Form (maker-checker on pay components). All enforce thresholds and cut-off rules.

**Covers:** 33.13, 33.14, 33.15, 33.16, 33.17
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll/loan-recovery/page.tsx
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx
- apps/web/src/app/(modules)/payroll/payslips/page.tsx
- apps/web/src/app/api/payroll/loan-recovery/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given the Salary Advance/Loan forms, then eligibility (tenure, max % of salary) is validated and a repayment schedule is generated.
- [ ] Given the Overtime Approval form, then pre-approval is required before OT hours feed payroll, with country OT caps enforced.
- [ ] Given the Payroll Change form, then changes to pay components route maker-checker (preparer ≠ approver) and are blocked after payroll cut-off/lock.
- [ ] Given approval, then approved values write back to payroll inputs and appear in the audit trail.
- [ ] Given country rules, then statutory deduction/OT limits per GCC country are applied at capture.

## Implementation Tasks From Backlog

- [ ] Backend: form definitions + payroll-input write-back; loan repayment-schedule generator.
- [ ] Backend: eligibility and cut-off/lock validation hooks.
- [ ] Frontend: salary advance, loan, overtime, payroll change forms.
- [ ] Rules/Config: max-advance %, OT caps, cut-off dates per country.
- [ ] Alerts/Workflow: maker-checker routing; cut-off block notification.
- [ ] Tests: integration (eligibility, cut-off block, write-back).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
