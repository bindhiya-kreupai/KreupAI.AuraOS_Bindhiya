# Gap Analysis: EPIC-22-S06 — Housing benefit (allowance vs provided)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 5
**User story:** HR Admin, **I want** to administer housing benefits as either allowance or company-provided accommodation, **so that** entitlement, cost and payroll treatment are correct and linked to accommodation records.

**Description**
Support housing-allowance tiers and company-provided housing, with mutual exclusivity, cost allocation and a link to the Accommodation module (EPIC-23) for provided cases.

**Covers:** 22.8
**Acceptance criteria count:** 5 · **Task count:** 6

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

- [ ] Given a grade band, when housing eligibility is evaluated, then an allowance tier or "company-provided" type is assigned (not both).
- [ ] Given company-provided housing, then the housing allowance is suppressed in payroll and the accommodation unit is linked.
- [ ] Given a housing allowance, then it posts to payroll as a recurring earning with WPS/wage-file impact flagged.
- [ ] Given a change between allowance and provided, then payroll proration applies from the effective date.
- [ ] Given any change, then it is audit-logged with approver.

## Implementation Tasks From Backlog

- [ ] Backend: `housing_benefit` (type, tier, amount, accommodation_link_id) schema
- [ ] Backend: mutual-exclusivity + payroll feed service
- [ ] Frontend: housing benefit assignment screen
- [ ] Rules/Config: allowance tiers per grade/country; provided-housing suppression
- [ ] Alerts/Workflow: change approval
- [ ] Tests: unit (exclusivity) + integration (EPIC-23 link, payroll)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
