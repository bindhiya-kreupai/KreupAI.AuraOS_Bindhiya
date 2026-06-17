# Gap Analysis: EPIC-15-S05 — SIO Contribution Salary Derivation

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-15-chapter-15-bahrain-sio-compliance.md](./EPIC-15-chapter-15-bahrain-sio-compliance.md)
> Parent epic: EPIC-15: Chapter 15 – Bahrain SIO Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** the SIO contribution salary derived automatically from the salary structure with floor/ceiling caps, **so that** contributions use the legally correct salary base.

**Description**
Defines the SIO contribution salary as a configurable composition of salary components (e.g. basic + social allowance + specified allowances) with statutory minimum and maximum ceilings. The rule engine maps eligible components, applies caps and rounding, and produces the contribution-salary snapshot that feeds the calculation engine for both Bahraini insurance and expatriate gratuity computations.

**Covers:** 15.8
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

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a salary structure, when SIO salary rules are configured, then included components are selectable per country/nationality and the engine computes the contribution salary.
- [ ] Given the statutory floor and ceiling, when the computed salary is outside, then it is floored/capped and the adjustment shown.
- [ ] Given Bahraini vs expatriate, when their salary is derived, then the applicable component set and caps can differ per the configured rule.
- [ ] Given a component-eligibility change, then it is effective-dated and recalculates prospectively.
- [ ] Given any derivation, then the breakdown (components + caps) is stored and viewable for audit.

## Implementation Tasks From Backlog

- [ ] Backend: `sio_salary_rule` config (countryCode, nationalityClass, includedComponentCodes[], minSalary, maxSalary, rounding, effectiveFrom)
- [ ] Backend: contribution-salary service + `sio_contribution_salary` per-period snapshot with derivation JSON
- [ ] Frontend: salary-rule config + per-employee breakdown viewer
- [ ] Rules/Config: Bahrain floor/ceiling + component sets (Bahraini vs expat)
- [ ] Tests: unit tests for capping, inclusion, rounding

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
