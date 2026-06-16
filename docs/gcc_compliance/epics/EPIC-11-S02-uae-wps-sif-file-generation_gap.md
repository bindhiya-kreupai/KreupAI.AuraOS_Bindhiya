# Gap Analysis: EPIC-11-S02 — UAE WPS (SIF) file generation

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** to generate the UAE WPS Salary Information File (SIF), **so that** wages are reported to MOHRE through the agent bank within the statutory window.

**Description**
Generate the UAE SIF in the prescribed layout (Employer Detail Record + Employee Detail Records: MOL/establishment ID, labour card/employee ID, IBAN, fixed/variable pay, days, pay period) from locked payroll, with structural and content validation before release.

**Covers:** 11.4
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/app/(modules)/payroll/bank-file-generation/page.tsx
- apps/web/src/app/(modules)/payroll/disbursement/sif-generation/page.tsx
- apps/web/src/app/(modules)/payroll/payslip-generation/page.tsx
- apps/web/src/app/api/payroll/payslip-generation/route.ts
- apps/web/src/app/dashboard/payroll/bank-file-generation/page.tsx
- apps/web/src/app/dashboard/payroll/payslip-generation/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a locked UAE payroll period, when SIF is generated, then it produces the EDR/SCR records with correct MOL ID, labour card numbers, IBANs and pay amounts.
- [ ] Given the file, when validated, then format, mandatory fields, record counts and total-amount control are checked and errors block release.
- [ ] Given the statutory window, when the period closes, then the SIF must be submitted within the UAE WPS window and a salary-delay flag raises if exceeded.
- [ ] Given generation/release, when actioned, then it is audit-logged with file hash and totals.

## Implementation Tasks From Backlog

- [ ] Backend: UAE SIF generator (EDR + SCR layout) from locked payroll
- [ ] Backend: SIF structural/content validator with control totals
- [ ] Frontend: UAE WPS file generation + validation results screen
- [ ] Rules/Config: UAE SIF field rules and statutory window
- [ ] Alerts/Workflow: salary-delay flag on window breach
- [ ] Tests: integration tests for SIF layout and control-total validation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
