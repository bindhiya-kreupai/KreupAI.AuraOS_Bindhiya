# Gap Analysis: EPIC-11-S06 — Salary Information File / wage file controls

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** common pre-submission wage-file controls, **so that** every WPS file is complete, valid and matched to payroll before it leaves AuraOS.

**Description**
Provide a shared validation/control layer for all wage files: missing-IBAN/ID checks, amount-vs-payroll matching, duplicate-record detection, employee-coverage completeness (all paid employees present, no extras), control-total reconciliation, and a release gate (releaser ≠ preparer).

**Covers:** 11.10
**Acceptance criteria count:** 4 · **Task count:** 5

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
- apps/web/src/app/(modules)/payroll-compliance/mudad/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given any generated wage file, when controls run, then missing IBAN/ID, duplicate records, and amount mismatches vs payroll are detected and block release.
- [ ] Given coverage, when validated, then every WPS-eligible paid employee appears exactly once and non-eligible records are excluded.
- [ ] Given control totals, when checked, then file total = payroll net/wage total for the period, else flagged.
- [ ] Given release, when actioned, then it requires a separate authorized releaser and is audit-logged with file hash.

## Implementation Tasks From Backlog

- [ ] Backend: shared wage-file control engine (coverage, duplicates, totals) + release gate
- [ ] Backend: file-hash + control-total capture
- [ ] Frontend: pre-submission control summary + release screen
- [ ] Rules/Config: per-country eligibility/coverage rules
- [ ] Tests: integration tests for coverage and control-total enforcement

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
