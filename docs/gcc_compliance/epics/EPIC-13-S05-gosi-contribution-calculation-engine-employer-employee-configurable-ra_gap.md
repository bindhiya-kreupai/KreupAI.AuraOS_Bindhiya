# Gap Analysis: EPIC-13-S05 — GOSI Contribution Calculation Engine (Employer/Employee, Configurable Rates)

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 13
**User story:** Payroll Officer, **I want** GOSI employer and employee contributions calculated per branch using configurable nationality-specific rates, **so that** the correct amounts are deducted and remitted every month.

**Description**
The calculation engine takes the GOSI contribution wage and applies branch-specific employer and employee percentage rates that are fully configurable per country and nationality in the rule engine (e.g. for Saudis the Annuities split plus Occupational Hazards employer-only; for expatriates Occupational Hazards employer-only). All rates are effective-dated so historical periods recompute with the rate that applied at the time. The employee portion flows back as a payroll deduction.

**Covers:** 13.8
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

- [ ] Given a contribution wage and the active rate set, when calculation runs, then employer and employee amounts are computed per branch and summed per employee.
- [ ] Given a Saudi national, when calculated, then Annuities employer% + employee% and Occupational Hazards employer% are applied per configuration; given an expatriate, then only Occupational Hazards (employer-only) applies.
- [ ] Given rates are effective-dated, when a historical period is recomputed, then the rate in force for that period is used (not the current rate).
- [ ] Given calculation completes, then the employee contribution is posted back to payroll as a statutory deduction tied to the period.
- [ ] Given a configuration with a new country/nationality rate, when added, then no code change is required and the engine picks it up.
- [ ] Given any calculation, then inputs (wage, rates, branch) and outputs are persisted for audit and reconciliation.

## Implementation Tasks From Backlog

- [ ] Backend: `gosi_rate_config` (countryCode, nationalityClass, branchCode, employerRate, employeeRate, effectiveFrom/To)
- [ ] Backend: calculation service producing `gosi_contribution_line` per employee/period/branch
- [ ] Backend: write-back of employee deduction to payroll period
- [ ] Frontend: rate configuration admin grid with effective-dating and Saudi/expat tabs
- [ ] Rules/Config: seed KSA Annuities + Occupational Hazards rate sets for Saudi and expat
- [ ] Tests: unit tests for per-branch/per-nationality math, effective-date selection, payroll write-back

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
