# Gap Analysis: EPIC-10-S09 — Payroll locking & period close

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** to lock and close an approved payroll period, **so that** results are frozen, immutable and ready for payslips, bank file and GL.

**Description**
Provide period locking that freezes all inputs and results after approval, prevents any further change without a controlled re-open, and transitions the period to "closed", triggering downstream payslip/bank/GL generation.

**Covers:** 10.9
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given an approved run, when lock is attempted, then it is blocked if any mandatory input or approval is missing.
- [ ] Given a locked period, when any user attempts to edit results/inputs, then the change is rejected and only a controlled re-open (elevated approval) can unlock it.
- [ ] Given a re-open, when granted, then it is audit-logged with reason and the period must be re-approved before re-lock.
- [ ] Given period close, when completed, then payslip, bank-file and GL-journal generation events are emitted.

## Implementation Tasks From Backlog

- [ ] Backend: lock/close state on `payroll_period` + re-open workflow
- [ ] Backend: immutability guard on locked results
- [ ] Frontend: period-close screen with pre-close checklist
- [ ] Alerts/Workflow: emit close events to payslip/bank/GL services
- [ ] Tests: e2e tests for lock-block-on-missing-input and re-open re-approval

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
