# Gap Analysis: EPIC-10-S20 — Payroll register & compliance certificate

> Source epic: [EPIC-10-chapter-10-payroll-management-processing.md](./EPIC-10-chapter-10-payroll-management-processing.md)
> Parent epic: EPIC-10: Chapter 10 – Payroll Management & Processing
> Module: Payroll
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Should · **Estimate:** 3
**User story:** Payroll Officer, **I want** a payroll register and monthly compliance certificate, **so that** I have the statutory record and management sign-off for each period.

**Description**
Generate the sample payroll register (per-employee earnings/deductions/net with totals by entity/cost center) and a monthly payroll compliance certificate confirming completeness, approval, reconciliation and on-time payment, both exportable and stored as period evidence.

**Covers:** 10.20
**Acceptance criteria count:** 4 · **Task count:** 4

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

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a closed period, when the register is generated, then it lists every employee's earnings, deductions and net with totals by cost center and legal entity.
- [ ] Given the certificate, when produced, then it attests completeness, maker-checker approval, reconciliation status and pay-on-time, signed off by the authorized role.
- [ ] Given export, when requested, then register and certificate export to PDF/Excel and are stored against the period.
- [ ] Given generation, when completed, then it is audit-logged as period evidence.

## Implementation Tasks From Backlog

- [ ] Backend: payroll-register builder + certificate generator from locked results
- [ ] Frontend: register & certificate view with PDF/Excel export and e-sign
- [ ] Rules/Config: configurable certificate attestation fields
- [ ] Tests: integration tests for register totals reconciling to run net

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
