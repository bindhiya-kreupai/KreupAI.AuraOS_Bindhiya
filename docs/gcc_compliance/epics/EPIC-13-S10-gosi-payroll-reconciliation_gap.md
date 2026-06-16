# Gap Analysis: EPIC-13-S10 — GOSI ↔ Payroll Reconciliation

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** an automated reconciliation between the GOSI declaration and the payroll run, **so that** every employee deduction and employer cost ties out and discrepancies are caught before submission.

**Description**
Each cycle, AuraOS reconciles the GOSI calculated contributions against payroll: employee GOSI deduction in payroll vs GOSI engine, employer GOSI cost vs GL accrual, headcount on GOSI file vs active payroll headcount, and per-employee wage base vs payroll wage. Discrepancies are categorised and pushed to the variance register with configurable materiality thresholds.

**Covers:** 13.13
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

- [ ] Given a closed GOSI run and the payroll run, when reconciliation executes, then it compares employee deduction, employer cost, headcount, and per-employee wage base.
- [ ] Given a variance above the configured threshold (absolute or %), when found, then it is classified (missing member, wage mismatch, rate mismatch, exited-still-listed) and written to the variance register.
- [ ] Given a clean reconciliation, when complete, then a "reconciled" status is set and required for monthly pack sign-off.
- [ ] Given an unreconciled variance, when the monthly pack is generated, then it is blocked or requires explicit override with reason.
- [ ] Given any reconciliation, then results and overrides are written to the audit trail.

## Implementation Tasks From Backlog

- [ ] Backend: reconciliation service comparing GOSI lines vs payroll lines vs GL accrual
- [ ] Backend: `gosi_variance` entity with category, amount, threshold breach flag
- [ ] Backend: materiality-threshold config (per country)
- [ ] Frontend: reconciliation results screen with drill-down to employee
- [ ] Alerts/Workflow: block/override gate on unreconciled variances
- [ ] Tests: integration test across matched/mismatched scenarios

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
