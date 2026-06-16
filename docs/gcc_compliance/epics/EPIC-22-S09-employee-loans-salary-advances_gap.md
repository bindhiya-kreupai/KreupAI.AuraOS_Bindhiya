# Gap Analysis: EPIC-22-S09 — Employee loans & salary advances

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** to manage employee loans and salary advances with installment recovery, **so that** balances are accurate, deductions stay within legal limits, and outstanding amounts settle on exit.

**Description**
Handle loan/advance requests, eligibility (e.g. max multiples of salary, max deduction % of wage per country), approval, schedule generation, payroll deduction, early settlement and exit recovery — with statutory deduction-cap guardrails.

**Covers:** 22.13
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/benefits/analytics/total-statement/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095b/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095c/[employeeId]/route.ts
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given a loan request, when eligibility is checked, then it enforces max amount and the statutory monthly deduction cap (e.g. deduction not exceeding the legal % of wage).
- [ ] Given approval, when granted, then an amortization schedule generates and each installment posts as a payroll deduction.
- [ ] Given concurrent loans/advances, then total monthly recovery is capped to the legal limit and excess is rescheduled.
- [ ] Given separation, then the outstanding balance is pushed to final settlement for recovery before payout.
- [ ] Given any request/approval/adjustment, then maker-checker applies (preparer ≠ approver) and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `employee_loan`, `loan_schedule`, `salary_advance` schema with balances
- [ ] Backend: amortization + deduction-cap service; settlement recovery feed
- [ ] Frontend: loan/advance request (self-service) + approval + balance view
- [ ] Rules/Config: max amount, deduction-cap % per country
- [ ] Alerts/Workflow: maker-checker approval
- [ ] Tests: unit (cap/amortization) + integration (settlement recovery)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
