# Gap Analysis: EPIC-11-S04 — Qatar WPS file generation

> Source epic: [EPIC-11-chapter-11-wage-protection-system-complian.md](./EPIC-11-chapter-11-wage-protection-system-complian.md)
> Parent epic: EPIC-11: Chapter 11 – Wage Protection System Compliance
> Module: Payroll / WPS
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** to generate the Qatar WPS file, **so that** wages are reported to the MOL/Qatar WPS within the statutory window.

**Description**
Generate the Qatar WPS file (employer record + employee records: QID, IBAN, basic/allowances/net, working days, pay period) from locked payroll, with validation and statutory-timing tracking per Qatar requirements.

**Covers:** 11.6
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

- [ ] Given a locked Qatar payroll, when generated, then the WPS file includes QID, IBAN and pay breakdown per the Qatar layout.
- [ ] Given the file, when validated, then mandatory fields, record counts and control totals are verified before release.
- [ ] Given the Qatar statutory window, when the period closes, then timing is tracked and a salary-delay flag raises on breach.
- [ ] Given generation/release, when actioned, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: Qatar WPS file generator from locked payroll
- [ ] Backend: validator with control totals
- [ ] Frontend: Qatar WPS generation screen
- [ ] Rules/Config: Qatar WPS layout and statutory window
- [ ] Alerts/Workflow: salary-delay flag on breach
- [ ] Tests: integration tests for Qatar layout validation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
