# Gap Analysis: EPIC-22-S10 — Relocation & mobilization benefits

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 3
**User story:** HR Admin, **I want** to administer relocation/mobilization benefits for new hires and transfers, **so that** one-off allowances, shipping, temporary accommodation and clawback are tracked.

**Description**
Manage relocation packages (mobilization allowance, shipping, temporary housing, settling-in) with eligibility on hire/transfer, payment, and clawback if the employee leaves within the qualifying period.

**Covers:** 22.14
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

- [ ] Given a new hire/transfer with relocation eligibility, when initiated, then package components and caps are assigned per grade/origin.
- [ ] Given relocation payment, then it posts as a one-off benefit with correct tax/WPS treatment.
- [ ] Given a clawback period (e.g. leaving within 12 months), then a pro-rated recovery obligation is created for final settlement.
- [ ] Given any package change, then it is audit-logged with approver.

## Implementation Tasks From Backlog

- [ ] Backend: `relocation_package`, `relocation_component`, `relocation_clawback` schema
- [ ] Backend: payment + clawback service; settlement feed
- [ ] Frontend: relocation package builder
- [ ] Rules/Config: component caps + clawback periods per grade
- [ ] Tests: unit (clawback proration)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
