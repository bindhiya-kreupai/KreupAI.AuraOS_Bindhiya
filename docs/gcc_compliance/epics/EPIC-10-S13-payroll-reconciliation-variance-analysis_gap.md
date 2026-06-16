# Gap Analysis: EPIC-10-S13 — Payroll reconciliation & variance analysis

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** automated reconciliation and variance analysis before approval, **so that** anomalies are caught before payment.

**Description**
Provide period-over-period variance (headcount, gross, net, deductions) at employee and aggregate level, threshold-based exception flagging, control-total reconciliation (inputs vs results vs bank file vs GL), and a documented sign-off of variance explanations.

**Covers:** 10.13
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll/payroll-reconciliation/page.tsx
- apps/web/src/app/api/payroll/reconciliation/route.ts
- apps/web/src/app/dashboard/payroll/payroll-reconciliation/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a run, when variance analysis runs, then employees/components with variance beyond configurable thresholds (e.g., > 10% or new/dropped pay items) are flagged.
- [ ] Given each flagged variance, when reviewed, then an explanation must be recorded before approval can proceed.
- [ ] Given control totals, when reconciled, then run net = sum of payslips = bank-file total = GL net, with any break flagged.
- [ ] Given the reconciliation, when completed, then a reconciliation pack is stored and audit-logged for the period.

## Implementation Tasks From Backlog

- [ ] Backend: variance engine (period-over-period + threshold) + control-total reconciliation service
- [ ] Backend: variance-explanation capture gating approval
- [ ] Frontend: variance & reconciliation dashboard with sign-off
- [ ] Rules/Config: variance thresholds per component/entity
- [ ] Tests: integration tests for threshold flagging and control-total breaks

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
