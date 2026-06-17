# Gap Analysis: EPIC-22-S03 — Medical insurance administration & tracker

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 8
**User story:** HR Admin, **I want** to administer mandatory medical insurance for employees and dependants, **so that** every required member is covered, renewals never lapse, and we evidence compliance to authorities.

**Description**
Manage medical policies, member enrolment (including dependants), plan tiers, card issuance and renewal/expiry tracking aligned to GCC mandatory health-cover rules (e.g. Dubai DHA / Abu Dhabi DOH, Qatar). Includes the Sample Medical Insurance Tracker register.

**Covers:** 22.5, 22.30
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/components/benefits/COBRAAdministration.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/web/src/app/dashboard/benefits/wellness-tracker/page.tsx
- apps/web/src/components/benefits/WellnessTracker.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add tests.

## Acceptance Criteria To Verify

- [ ] Given a new joiner in a mandatory-cover emirate/country, when onboarded, then a medical enrolment task is created and joiner cannot be marked benefit-complete until cover is active.
- [ ] Given a policy expiry, when it is 60/30/7 days out, then alerts fire to the Benefits Owner and PRO.
- [ ] Given a dependant added, when enrolled, then plan tier and premium are derived and dependant relationship/documents are stored.
- [ ] Given the Medical Insurance Tracker, then it exports member, plan, card number, validity, premium and renewal status, with sensitive fields RBAC-masked.
- [ ] Given any enrolment/termination, then it is audit-logged and reflected in payroll deduction (employee share) where applicable.

## Implementation Tasks From Backlog

- [ ] Backend: `medical_policy`, `medical_member` (employee/dependant, plan_tier, card_no, valid_from/to, premium) schema
- [ ] Backend: renewal/expiry alert job + onboarding enrolment trigger
- [ ] Frontend: medical enrolment screen + Medical Insurance Tracker register/export
- [ ] Rules/Config: mandatory-cover rules per emirate/country; employee premium share
- [ ] Alerts/Workflow: 60/30/7-day renewal alerts; lapse escalation
- [ ] Tests: e2e (joiner enrolment block) + unit (expiry alerts)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
