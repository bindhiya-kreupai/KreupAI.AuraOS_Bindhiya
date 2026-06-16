# Gap Analysis: EPIC-14-S05 — Contribution Account Salary Derivation

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** the GPSSA contribution account salary derived automatically from the salary structure with floor/ceiling caps, **so that** contributions use the legally correct salary base.

**Description**
Defines the GPSSA contribution account salary as a configurable composition of salary components (e.g. basic + housing + specified allowances) with statutory minimum and maximum ceilings. The rule engine maps eligible components, applies caps and rounding, and produces the account-salary snapshot that feeds the calculation engine.

**Covers:** 14.8
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/gosi/contribution-simulation/page.tsx
- apps/web/src/app/api/v1/benefits/hsa-fsa/contribution/route.ts
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/components/compliance/gosi/GosiContributionCalculator.tsx
- apps/web/src/app/api/v1/compliance/gosi/submissions/route.ts
- apps/web/src/components/benefits/PensionEOSBDashboard.tsx
- apps/web/src/components/payroll/SalaryRevision.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests.

## Acceptance Criteria To Verify

- [ ] Given a salary structure, when GPSSA account-salary rules are configured, then included components are selectable per country/nationality and the engine computes the account salary.
- [ ] Given the statutory floor and ceiling, when the computed salary is outside, then it is floored/capped and the adjustment shown.
- [ ] Given a component-eligibility change, then it is effective-dated and recalculates prospectively.
- [ ] Given any account-salary derivation, then the breakdown (components + caps) is stored and viewable for audit.
- [ ] Given a GCC national under the unified extension, then their home-country account-salary rule can differ per configuration.

## Implementation Tasks From Backlog

- [ ] Backend: `gpssa_account_salary_rule` config (countryCode, nationalityClass, includedComponentCodes[], minSalary, maxSalary, rounding, effectiveFrom)
- [ ] Backend: account-salary service + `gpssa_account_salary` per-period snapshot with derivation JSON
- [ ] Frontend: account-salary rule config + per-employee breakdown viewer
- [ ] Rules/Config: UAE floor/ceiling + component sets (UAE national vs GCC national)
- [ ] Tests: unit tests for capping, inclusion, rounding

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
