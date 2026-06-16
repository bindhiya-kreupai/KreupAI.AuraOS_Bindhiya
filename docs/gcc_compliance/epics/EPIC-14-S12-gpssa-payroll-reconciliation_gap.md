# Gap Analysis: EPIC-14-S12 — GPSSA ↔ Payroll Reconciliation

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** an automated reconciliation between the GPSSA declaration and the payroll run, **so that** every deduction and employer/government cost ties out before submission.

**Description**
Each cycle, AuraOS reconciles GPSSA contributions against payroll: employee GPSSA deduction in payroll vs engine, employer/government cost vs GL accrual, GPSSA headcount vs active national headcount, and per-employee account salary vs payroll salary. Discrepancies are categorised and pushed to the variance register with materiality thresholds.

**Covers:** 14.14
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/payroll/SalaryRevision.tsx
- apps/web/src/app/(modules)/payroll/payroll-reconciliation/page.tsx
- apps/web/src/app/api/payroll/reconciliation/route.ts
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/app/dashboard/payroll/payroll-reconciliation/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a closed GPSSA run and payroll run, when reconciliation executes, then it compares employee deduction, employer/government cost, headcount, and per-employee account salary.
- [ ] Given a variance above threshold, when found, then it is classified (missing member, salary mismatch, rate mismatch, exited-still-listed) and written to the variance register.
- [ ] Given a clean reconciliation, then a "reconciled" status is set and required for monthly pack sign-off.
- [ ] Given an unreconciled variance, when the pack is generated, then it is blocked or requires explicit override with reason.
- [ ] Given any reconciliation/override, then it is audited.

## Implementation Tasks From Backlog

- [ ] Backend: reconciliation service comparing GPSSA lines vs payroll vs GL accrual
- [ ] Backend: `gpssa_variance` entity with category and threshold-breach flag
- [ ] Backend: materiality-threshold config
- [ ] Frontend: reconciliation results screen with employee drill-down
- [ ] Alerts/Workflow: block/override gate on unreconciled variances
- [ ] Tests: integration test across matched/mismatched scenarios

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
