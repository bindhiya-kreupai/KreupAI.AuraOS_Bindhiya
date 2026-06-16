# Gap Analysis: EPIC-10-S12 — Off-cycle & supplementary payroll

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Should · **Estimate:** 5
**User story:** Payroll Officer, **I want** to run off-cycle and supplementary payrolls, **so that** corrections, late inputs and ad-hoc payments are processed outside the main run.

**Description**
Support off-cycle runs (corrections, missed payments, leaver settlements) and supplementary runs (bonuses, arrears) that reuse the engine, approval, lock and payment flow, with linkage back to the affected main period and YTD/statutory accumulation.

**Covers:** 10.12
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll/off-cycle-payments/page.tsx
- apps/web/src/app/api/payroll/off-cycle/route.ts
- apps/web/src/app/api/v1/payroll/off-cycle/route.ts
- apps/web/src/app/dashboard/payroll/off-cycle-payments/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given an off-cycle need, when a run is created, then it links to the relevant employee(s) and main period and reuses the standard calc/approval/lock flow.
- [ ] Given a supplementary payment (e.g., arrears/bonus), when processed, then it accumulates to YTD and feeds statutory/GL correctly.
- [ ] Given an off-cycle run, when approved and locked, then it produces its own payslip, bank file and GL entry, clearly marked off-cycle.
- [ ] Given any off-cycle action, when performed, then it is fully audit-logged with reason.

## Implementation Tasks From Backlog

- [ ] Backend: off-cycle/supplementary run type on `payroll_run` with main-period linkage
- [ ] Backend: YTD/statutory accumulation across run types
- [ ] Frontend: off-cycle run creation + reason capture
- [ ] Alerts/Workflow: reuse maker-checker and release flow
- [ ] Tests: integration tests for YTD accumulation across off-cycle runs

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
