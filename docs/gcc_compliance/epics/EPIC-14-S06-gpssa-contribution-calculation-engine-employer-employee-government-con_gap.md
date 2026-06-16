# Gap Analysis: EPIC-14-S06 — GPSSA Contribution Calculation Engine (Employer/Employee/Government, Configurable Rates)

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 13
**User story:** Payroll Officer, **I want** GPSSA employer, employee and government contributions calculated using configurable nationality-specific rates, **so that** the correct shares are deducted and remitted each month.

**Description**
The engine takes the account salary and applies employer%, employee% and government-share% that are fully configurable per country and nationality in the rule engine, all effective-dated so historical periods recompute with the rate in force at the time. The employee portion flows back to payroll as a deduction; employer and government shares are tracked for remittance and GL.

**Covers:** 14.4 (calculation aspect), 14.8 (consumes)
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/gosi/contribution-simulation/page.tsx
- apps/web/src/app/api/v1/benefits/hsa-fsa/contribution/route.ts
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/app/dashboard/government/pension-scheme/page.tsx
- apps/web/src/app/dashboard/government/pensions/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/components/compliance/gosi/GosiContributionCalculator.tsx
- apps/web/src/app/(modules)/workflow-engine/version-control/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an account salary and active rate set, when calculation runs, then employer, employee and government amounts are computed and summed per employee.
- [ ] Given different nationalities (UAE national vs GCC national), when calculated, then the applicable rate set is used per configuration.
- [ ] Given effective-dated rates, when a historical period is recomputed, then the rate in force for that period is applied.
- [ ] Given calculation completes, then the employee contribution is posted back to payroll as a statutory deduction for the period.
- [ ] Given a new country/nationality rate added in config, then the engine uses it with no code change.
- [ ] Given any calculation, then inputs and outputs are persisted for audit and reconciliation.

## Implementation Tasks From Backlog

- [ ] Backend: `gpssa_rate_config` (countryCode, nationalityClass, employerRate, employeeRate, governmentRate, effectiveFrom/To)
- [ ] Backend: calculation service producing `gpssa_contribution_line` per employee/period/share
- [ ] Backend: employee-deduction write-back to payroll
- [ ] Frontend: rate config grid with effective-dating and nationality tabs
- [ ] Rules/Config: seed UAE employer/employee/government shares for UAE & GCC nationals
- [ ] Tests: unit tests for three-share math, effective-date selection, payroll write-back

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
