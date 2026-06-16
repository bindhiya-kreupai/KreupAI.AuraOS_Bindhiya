# Gap Analysis: EPIC-22-S13 — Accommodation & labour camp benefit linkage

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 3
**User story:** HR Admin, **I want** accommodation/labour-camp benefits represented as a benefit entitlement linked to the Accommodation module, **so that** eligibility, cost and payroll treatment are consistent for camp-housed workers.

**Description**
Model accommodation as a benefit (provided bed/room or accommodation allowance) that ties to EPIC-23 master data for assignment, with cost allocation and payroll suppression for provided cases.

**Covers:** 22.17
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts
- apps/web/src/**tests**/e2e/benefits/benefits-enrollment.e2e.test.ts
- apps/web/src/app/(modules)/benefits/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given accommodation eligibility, when assigned as "provided", then it links to an EPIC-23 bed/room and suppresses any accommodation allowance.
- [ ] Given an accommodation allowance variant, then it posts to payroll with country wage-file treatment.
- [ ] Given a worker moved out of camp, then the benefit ends and payroll prorates from the effective date.
- [ ] Given any assignment/change, then it is audit-logged and reflected on the benefits dashboard.

## Implementation Tasks From Backlog

- [ ] Backend: `accommodation_benefit` link entity to EPIC-23 unit/bed
- [ ] Backend: cost allocation + payroll feed
- [ ] Frontend: accommodation benefit assignment view
- [ ] Rules/Config: provided vs allowance eligibility per worker category
- [ ] Tests: integration (EPIC-23 link + payroll suppression)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
