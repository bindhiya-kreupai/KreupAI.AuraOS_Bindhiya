# Gap Analysis: EPIC-10-S08 — Maker-checker payroll approval

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 5

**Description**
Route the calculated run for approval where the preparer cannot approve their own run; the approver reviews totals, variances and exceptions, and can approve, reject (with comments) or send back, gated by DoA thresholds for total payroll value.

**Covers:** 10.8
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

- confirm/add tenant-scoped schema or config; add/wire service logic; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given a completed run, when submitted for approval, then the preparer (maker) cannot be the approver (checker).
- [ ] Given the approver view, when opened, then variance vs prior period, exception list and total-by-entity are shown for sign-off.
- [ ] Given a run total exceeding a DoA threshold, when submitted, then it routes to the higher authority per EPIC-09 DoA.
- [ ] Given a rejection, when returned, then the run is unlocked for correction and the rejection reason is audit-logged.
- [ ] Given approval, when granted, then the run is marked approved and becomes eligible for lock/payment.

## Implementation Tasks From Backlog

- [ ] Backend: approval-state machine on `payroll_run` with maker≠checker rule
- [ ] Backend: DoA-threshold routing integration (EPIC-09)
- [ ] Frontend: approval screen with variance and exception summary
- [ ] Alerts/Workflow: approval notifications + escalation on delay
- [ ] Tests: integration tests for maker≠checker and DoA routing

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
