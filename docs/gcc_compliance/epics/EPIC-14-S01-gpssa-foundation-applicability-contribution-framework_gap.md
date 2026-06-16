# Gap Analysis: EPIC-14-S01 — GPSSA Foundation, Applicability & Contribution Framework

> Source epic: [EPIC-14-chapter-14-gpssa-compliance.md](./EPIC-14-chapter-14-gpssa-compliance.md)
> Parent epic: EPIC-14: Chapter 14 – GPSSA Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** GPSSA purpose, applicability and the contribution framework modelled as configurable reference data, **so that** AuraOS applies GPSSA only to eligible national employees with the correct contribution structure.

**Description**
Establishes the GPSSA domain in AuraOS: who is in scope (UAE nationals, and GCC nationals working in the UAE under the unified GCC insurance protection extension), the purpose/coverage notes, and the contribution framework defining the employer, employee and government shares. Applicability is nationality-driven and is the anchor the calculation engine reads.

**Covers:** 14.1, 14.2, 14.3, 14.4
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

- [ ] Given a UAE legal entity, when GPSSA settings are opened, then scope can be enabled and applicability rules (UAE national / GCC national / expatriate-excluded) configured.
- [ ] Given an expatriate, when evaluated, then GPSSA does not apply and the employee is excluded from GPSSA processing.
- [ ] Given a GCC national working in the UAE, when configured, then the GCC unified-extension rule routes them to their home-country share structure where applicable.
- [ ] Given the contribution framework, when set up, then employer, employee and government shares are modelled as distinct, configurable components.
- [ ] Given any applicability/framework change, then it is versioned with effective date and audited.

## Implementation Tasks From Backlog

- [ ] Backend: `gpssa_establishment` + `gpssa_applicability_rule` entities (nationalityClass, included, effectiveFrom)
- [ ] Backend: `gpssa_contribution_framework` config (shares: employer/employee/government)
- [ ] Backend: rule-engine loader resolving applicability + framework by date
- [ ] Frontend: GPSSA settings screen (scope, applicability matrix, framework)
- [ ] Rules/Config: UAE-national + GCC-national applicability seed
- [ ] Tests: unit tests for applicability resolution incl. GCC unified-extension

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
