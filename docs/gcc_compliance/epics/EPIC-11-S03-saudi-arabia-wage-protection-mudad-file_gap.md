# Gap Analysis: EPIC-11-S03 — Saudi Arabia Wage Protection / Mudad file

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** to generate Saudi wage-protection data for Mudad, **so that** salaries comply with the Saudi Wage Protection Program and link to Qiwa/GOSI.

**Description**
Produce the Saudi Mudad payroll/wage file from locked payroll (national/Iqama IDs, IBAN, basic + allowances + deductions, GOSI-consistent wages) in the required Mudad format/API, validating against registered GOSI wages and the program's commitment/compliance rules.

**Covers:** 11.5
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/wps/file-history/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/mobile/src/screens/payroll/PayslipDetailsScreen.tsx
- apps/mobile/src/screens/payroll/PayslipDownloadScreen.tsx
- apps/web/src/**tests**/e2e/payroll/payslip-generation.e2e.test.ts
- apps/web/src/**tests**/e2e/payroll/salary-calculation.e2e.test.ts
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/saudization/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a locked Saudi payroll, when the Mudad file/payload is generated, then it includes Iqama/national IDs, IBANs and salary breakdown in the required format.
- [ ] Given wages, when validated, then they are checked for consistency with registered GOSI/Qiwa contract wages and discrepancies are flagged.
- [ ] Given the Mudad statutory timing, when due, then the submission window is tracked and a salary-delay flag raises on breach.
- [ ] Given generation, when complete, then it is audit-logged with totals and validation status.

## Implementation Tasks From Backlog

- [ ] Backend: Mudad file/API payload generator from locked payroll
- [ ] Backend: GOSI/Qiwa wage-consistency validation
- [ ] Frontend: Saudi Mudad generation + discrepancy view
- [ ] Rules/Config: Mudad format rules and statutory window
- [ ] Alerts/Workflow: wage-discrepancy and salary-delay alerts
- [ ] Tests: integration tests for Mudad payload and GOSI-consistency check

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
