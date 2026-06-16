# Gap Analysis: EPIC-22-S07 — Transport, mobile/communication & meal benefits

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Should · **Estimate:** 5
**User story:** HR Admin, **I want** to administer transport, mobile/communication and meal/cafeteria benefits, **so that** allowances, provided services and in-kind values are tracked, costed and posted to payroll.

**Description**
Cover transport (allowance/company bus/fuel), mobile/comms (allowance/plan/SIM), and meals/cafeteria (allowance/provided), each as allowance or in-kind with cost capture and eligibility.

**Covers:** 22.9, 22.10, 22.11
**Acceptance criteria count:** 5 · **Task count:** 5

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

- [ ] Given transport eligibility, when assigned, then the type (allowance / company bus / fuel card) and value are recorded and routed to payroll if cash.
- [ ] Given a mobile benefit, when a corporate SIM/plan is issued, then asset/plan and monthly cost are tracked and recoverable on exit.
- [ ] Given a meal benefit, when provided in-kind (camp/cafeteria), then per-head cost allocates to the employee/cost centre without a payroll cash line.
- [ ] Given allowance variants, then they post to payroll with correct taxable/WPS treatment per country.
- [ ] Given any assignment/change, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `transport_benefit`, `comm_benefit`, `meal_benefit` schemas with type + value
- [ ] Backend: in-kind cost allocation + payroll feed service
- [ ] Frontend: assignment screens for the three benefit families
- [ ] Rules/Config: eligibility + allowance/in-kind rules per grade/location
- [ ] Tests: integration (payroll + cost allocation)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
