# Gap Analysis: EPIC-22-S08 — Education assistance

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**User story:** Employee (Self-Service), **I want** to claim education assistance for myself or children, **so that** approved tuition support is paid within policy caps and tracked per academic year.

**Description**
Manage education-assistance eligibility (employee professional study and/or children's school fees), annual caps, claim submission with documents, approval and payment, with bond/clawback for sponsored study where applicable.

**Covers:** 22.12
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

- [ ] Given an eligible employee, when they submit an education claim, then it validates against the annual cap, children limit and document requirements.
- [ ] Given a claim above the cap, then the excess is blocked unless an exception is approved.
- [ ] Given an approved claim, then payment posts to payroll/AP with tax treatment per country and decrements the annual balance.
- [ ] Given sponsored professional study with a service bond, then a clawback obligation is recorded for recovery on early exit.
- [ ] Given any claim/approval, then it is audit-logged with approver chain.

## Implementation Tasks From Backlog

- [ ] Backend: `education_benefit`, `education_claim`, `education_bond` schema with caps
- [ ] Backend: cap-validation + clawback service
- [ ] Frontend: employee claim form + manager/HR approval
- [ ] Rules/Config: caps, children limits, bond terms per entity
- [ ] Alerts/Workflow: claim approval workflow
- [ ] Tests: unit (cap/clawback) + e2e (claim flow)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
