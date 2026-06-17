# Gap Analysis: EPIC-22-S05 — Air ticket entitlement & accrual

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 5
**User story:** HR Admin, **I want** to manage air-ticket entitlements (annual/biennial, class, family), **so that** tickets/allowances are issued correctly and accrued for cost and EOSB-adjacent settlement.

**Description**
Track ticket eligibility (route, class, single/family, frequency), accrual of ticket value, issuance vs encashment, and balance carry. Feeds payroll (cash option) and final settlement.

**Covers:** 22.7
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

- [ ] Given an employee with annual ticket eligibility, when 12 months of service complete, then a ticket entitlement becomes available and is logged.
- [ ] Given a family ticket entitlement, when claimed, then number of tickets is validated against registered eligible dependants.
- [ ] Given an encashment option, when chosen, then ticket value posts to payroll as a benefit earning with country tax treatment.
- [ ] Given separation, then unused accrued ticket value is computed and passed to final settlement.
- [ ] Given any issuance/encashment, then it decrements the entitlement balance and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `air_ticket_entitlement`, `air_ticket_transaction` (issue/encash) schema with accrual
- [ ] Backend: accrual + balance service; payroll/settlement feed
- [ ] Frontend: employee ticket request (self-service) + admin issuance
- [ ] Rules/Config: frequency/class/route rules per grade and country
- [ ] Tests: integration (accrual + settlement feed)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
