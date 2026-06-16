# Gap Analysis: EPIC-15-S06 — SIO Contribution Calculation Engine (Employer/Employee, Configurable Rates)

> Source epic: [EPIC-15-chapter-15-bahrain-sio-compliance.md](./EPIC-15-chapter-15-bahrain-sio-compliance.md)
> Parent epic: EPIC-15: Chapter 15 – Bahrain SIO Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 13
**User story:** Payroll Officer, **I want** SIO employer and employee contributions calculated per branch using configurable nationality-specific rates, **so that** the correct amounts are deducted and remitted each month for both Bahrainis and expatriates.

**Description**
The engine takes the contribution salary and applies branch-specific employer and employee percentage rates that are fully configurable per country and nationality in the rule engine — Bahraini insurance branches (old-age/disability/death, unemployment) with employer/employee splits, and the expatriate gratuity-funding rate (employer-funded). All rates are effective-dated so historical periods recompute with the rate in force at the time. The employee portion flows back to payroll as a deduction.

**Covers:** 15.4 (calculation aspect)
**Acceptance criteria count:** 6 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/payroll-compliance/gosi/contribution-simulation/page.tsx
- apps/web/src/app/api/v1/benefits/hsa-fsa/contribution/route.ts
- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/components/compliance/gosi/GosiContributionCalculator.tsx
- apps/web/src/app/(modules)/workflow-engine/version-control/page.tsx
- apps/web/src/app/api/v1/benefits/analytics/total-statement/[employeeId]/route.ts
- apps/web/src/app/api/v1/benefits/compliance/1095b/[employeeId]/route.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a contribution salary and active rate set, when calculation runs, then employer and employee amounts are computed per branch and summed per employee.
- [ ] Given a Bahraini national, when calculated, then the insurance-branch employer% + employee% are applied per configuration; given an expatriate, then the gratuity-funding employer rate applies.
- [ ] Given effective-dated rates, when a historical period is recomputed, then the rate in force for that period is used.
- [ ] Given calculation completes, then the employee contribution is posted back to payroll as a statutory deduction for the period.
- [ ] Given a new country/nationality rate added in config, then the engine uses it with no code change.
- [ ] Given any calculation, then inputs and outputs are persisted for audit and reconciliation.

## Implementation Tasks From Backlog

- [ ] Backend: `sio_rate_config` (countryCode, nationalityClass, branchCode, employerRate, employeeRate, effectiveFrom/To)
- [ ] Backend: calculation service producing `sio_contribution_line` per employee/period/branch
- [ ] Backend: employee-deduction write-back to payroll
- [ ] Frontend: rate config grid with effective-dating and Bahraini/expat tabs
- [ ] Rules/Config: seed Bahrain insurance branches + expat gratuity rate
- [ ] Tests: unit tests for per-branch/per-nationality math, effective-date selection, payroll write-back

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
