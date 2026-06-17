# Gap Analysis: EPIC-15-S01 — SIO Foundation, Applicability & Contribution Framework

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-15-chapter-15-bahrain-sio-compliance.md](./EPIC-15-chapter-15-bahrain-sio-compliance.md)
> Parent epic: EPIC-15: Chapter 15 – Bahrain SIO Compliance
> Module: Social Insurance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `social-insurance` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** SIO purpose, applicability and the contribution framework modelled as configurable reference data, **so that** AuraOS applies the correct SIO rules to Bahraini and expatriate populations.

**Description**
Establishes the SIO domain in AuraOS: who is in scope (Bahraini nationals under the social-insurance branches; expatriates under the SIO-administered end-of-service gratuity scheme), the purpose/coverage notes, and the contribution framework distinguishing Bahraini insurance branches (e.g. old-age/disability/death, unemployment) from expatriate gratuity funding. Applicability is nationality-driven and anchors the calculation engine.

**Covers:** 15.1, 15.2, 15.3, 15.4
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

- [ ] Given a Bahrain legal entity, when SIO settings are opened, then scope can be enabled and applicability rules (Bahraini vs expatriate) configured.
- [ ] Given a Bahraini national, when configured, then the social-insurance branches apply; given an expatriate, then the expatriate gratuity-funding scheme applies per configuration.
- [ ] Given the contribution framework, when set up, then employer and employee shares per branch and the expatriate gratuity rate are modelled as distinct configurable components.
- [ ] Given contextual help, then purpose/scope guidance (15.1–15.3) is available inline from a configurable content table.
- [ ] Given any applicability/framework change, then it is versioned with effective date and audited.

## Implementation Tasks From Backlog

- [ ] Backend: `sio_establishment` + `sio_applicability_rule` entities (nationalityClass, branchSet, effectiveFrom)
- [ ] Backend: `sio_contribution_framework` config (branches + expat gratuity component)
- [ ] Backend: rule-engine loader resolving applicability + framework by date
- [ ] Frontend: SIO settings screen (scope, applicability matrix, framework)
- [ ] Rules/Config: Bahraini branch set + expatriate gratuity scheme seed
- [ ] Tests: unit tests for applicability resolution by nationality

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
