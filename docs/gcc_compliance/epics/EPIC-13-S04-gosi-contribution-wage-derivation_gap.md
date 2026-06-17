# Gap Analysis: EPIC-13-S04 — GOSI Contribution Wage Derivation

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-13-chapter-13-gosi-compliance.md](./EPIC-13-chapter-13-gosi-compliance.md)
> Parent epic: EPIC-13: Chapter 13 – GOSI Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** the GOSI contribution wage derived automatically from the salary structure with min/max caps, **so that** contributions are based on the legally correct wage base, not the gross or net pay.

**Description**
Defines the GOSI contribution wage as a configurable composition of salary components (typically basic + housing for Saudis, with rules for the wage cap and floor). The rule engine maps which payroll earnings count toward the GOSI wage, applies statutory minimum and maximum ceilings, and rounds per GOSI conventions. This derived wage is the single input to the calculation engine.

**Covers:** 13.7
**Acceptance criteria count:** 5 · **Task count:** 6

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
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a salary structure, when GOSI wage rules are configured, then the included components (e.g. basic, housing) are selectable per country/nationality and the engine computes the contribution wage.
- [ ] Given the statutory minimum and maximum GOSI wage caps, when the computed wage falls outside, then it is floored/capped accordingly and the capping is shown.
- [ ] Given a Saudi vs an expatriate, when their wage is derived, then the applicable component set and caps can differ per the configured rule.
- [ ] Given a change to which components are GOSI-eligible, then it is effective-dated and recalculates wages prospectively.
- [ ] Given any derived contribution wage, then the derivation breakdown (components + caps applied) is stored and viewable for audit.

## Implementation Tasks From Backlog

- [ ] Backend: `gosi_wage_rule` config (countryCode, nationalityClass, includedComponentCodes[], minWage, maxWage, rounding, effectiveFrom)
- [ ] Backend: contribution-wage calculation service reading payroll components + caps
- [ ] Backend: store `gosi_contribution_wage` snapshot per employee per period with derivation JSON
- [ ] Frontend: wage-rule config screen + per-employee wage breakdown viewer
- [ ] Rules/Config: KSA min/max GOSI ceiling and Saudi/expat component sets
- [ ] Tests: unit tests for capping, component inclusion, rounding

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
