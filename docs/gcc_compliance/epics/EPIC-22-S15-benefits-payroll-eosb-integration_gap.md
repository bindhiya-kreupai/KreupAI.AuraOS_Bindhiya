# Gap Analysis: EPIC-22-S15 — Benefits ↔ payroll & EOSB integration

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** all benefit values to flow correctly into payroll and final settlement, **so that** earnings, in-kind values, deductions and EOSB-relevant inputs are accurate and proration is automatic.

**Description**
Central integration layer mapping each benefit to payroll element (cash earning, in-kind, deduction, recovery) with country tax/WPS treatment, proration for joiners/leavers, and a feed of benefit-related accruals (tickets, relocation clawback, loan balances) to EOSB/final settlement.

**Covers:** 22.18, 22.19
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/payroll-compliance/eosb/end-of-service-benefits-calculator/page.tsx
- apps/web/src/app/dashboard/admin/payroll/bank-integration/page.tsx
- apps/web/src/app/dashboard/admin/payroll/settings/bank-integration/page.tsx
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/lib/services/**tests**/benefits-claim.integration.test.ts
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given each benefit, when mapped, then it specifies payroll element, cash/in-kind, taxable/WPS treatment and recoverability.
- [ ] Given a mid-month benefit start/stop, then payroll prorates the value by calendar/working days per policy.
- [ ] Given a payroll lock attempt, when a mandatory benefit input (e.g. medical premium) is missing, then the lock is blocked with a clear reason.
- [ ] Given separation, then outstanding loans, ticket accrual and relocation clawback are passed to final settlement (EPIC-28) for net computation.
- [ ] Given any mapping/posting, then it is audit-logged and reconcilable to the benefits register.

## Implementation Tasks From Backlog

- [ ] Backend: `benefit_payroll_mapping` + integration service; settlement feed events
- [ ] Backend: proration engine + payroll-lock validation hook
- [ ] Frontend: benefit→payroll mapping admin + reconciliation view
- [ ] Rules/Config: tax/WPS treatment per country and benefit
- [ ] Tests: integration (payroll + settlement) + unit (proration)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
