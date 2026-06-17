# Gap Analysis: EPIC-05-S07 — Benefits compliance in the offer

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-05-chapter-5-offer-management-pre-employment-.md](./EPIC-05-chapter-5-offer-management-pre-employment-.md)
> Parent epic: EPIC-05: Chapter 5 – Offer Management & Pre-Employment Compliance
> Module: Recruitment
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**User story:** HR Manager, **I want** offer benefits validated for statutory and policy compliance, **so that** medical insurance, leave, air ticket and other entitlements meet country mandates and grade policy.

**Description**
Configures the benefits package attached to the offer (mandatory medical insurance, annual leave entitlement, air ticket, housing/transport where applicable) and validates against country statutory minimums (e.g., mandatory health insurance in UAE/KSA) and internal grade-based benefit policy. Feeds offer letter and contract, and seeds benefits enrolment in onboarding.

**Covers:** 5.8
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/**tests**/e2e/recruitment/candidate-management.e2e.test.ts
- apps/web/src/**tests**/e2e/recruitment/interview-management.e2e.test.ts
- apps/web/src/app/(modules)/recruitment/candidate-screening/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-feedback/page.tsx
- apps/web/src/app/(modules)/recruitment/interview-management/page.tsx
- apps/web/src/app/(modules)/recruitment/job-requisition/page.tsx
- apps/web/src/app/api/recruitment/interviews/feedback/route.ts
- apps/web/src/app/api/recruitment/interviews/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-RECRUITMENT-COMPLETION.md
- docs/implementation/RECRUITMENT-COMPLETION-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a country, when benefits are set, then statutory-mandatory benefits (e.g., medical insurance) are enforced.
- [ ] Given a grade, when benefits are set, then they validate against grade-based benefit policy.
- [ ] Given a missing mandatory benefit, when proposed, then the offer is blocked with reason.
- [ ] Given the benefits package, when finalised, then it carries to the offer letter and contract.
- [ ] Given any benefits change, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `offer_benefit` entity (type, value, statutory, gradePolicyRef) + migration.
- [ ] Backend: benefits-validation service (statutory + policy).
- [ ] Frontend: benefits configuration on the offer.
- [ ] Rules/Config: per-country statutory benefits and grade policy.
- [ ] Alerts/Workflow: block on missing mandatory benefit.
- [ ] Tests: unit (statutory/policy validation) + integration (carry to letter).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
