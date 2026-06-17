# Gap Analysis: EPIC-22-S04 — Life insurance & personal accident coverage

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**User story:** HR Admin, **I want** to manage group life and personal accident (GPA) coverage, **so that** sum-assured, beneficiaries and claims are tracked and the policy stays current.

**Description**
Administer group life/GPA policies with sum-assured derived from salary multiples, beneficiary records, and claim event tracking, with renewal alerts and census export to the insurer.

**Covers:** 22.6
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/api/v1/benefits/life-event/route.ts
- apps/web/src/components/benefits/steps/CoverageLevel.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given a covered employee, when their salary changes, then sum-assured (e.g. 24× basic) recalculates and flags census update.
- [ ] Given a beneficiary, when recorded, then relationship and allocation % must total 100% before save.
- [ ] Given a policy renewal, when 60/30 days out, then alert the Benefits Owner and request updated census.
- [ ] Given a claim event (death/disability in service), then a claim record links to the employee and to separation/EOSB where relevant.
- [ ] Given census export, then it includes member, DOB, sum-assured and excludes data the insurer is not entitled to per privacy rules.

## Implementation Tasks From Backlog

- [ ] Backend: `life_gpa_policy`, `life_member`, `life_beneficiary`, `life_claim` schema
- [ ] Backend: sum-assured calc + census generation service
- [ ] Frontend: coverage & beneficiary management; claim register
- [ ] Rules/Config: salary-multiple and category rules per entity
- [ ] Tests: unit (sum-assured/beneficiary validation)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
