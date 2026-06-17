# Gap Analysis: EPIC-22-S02 — Benefit eligibility rule engine

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 8
**User story:** HR Admin, **I want** configurable eligibility rules per benefit, **so that** entitlements are auto-derived from grade, nationality, contract type, location and service period without manual judgement.

**Description**
A central eligibility engine evaluates each employee against benefit rules (e.g. grade band → housing allowance tier, service ≥ 1 yr → annual air ticket, family vs single status). Drives enrolment, payroll values and self-service entitlement display.

**Covers:** 22.2, 22.3
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/benefits/insurance-coverage/page.tsx
- apps/web/src/app/dashboard/benefits/plan-eligibility/page.tsx
- apps/web/src/components/benefits/LifeInsuranceDashboard.tsx
- apps/mobile/src/screens/benefits/BenefitsHomeScreen.tsx
- apps/mobile/src/screens/benefits/ClaimDetailsScreen.tsx
- apps/mobile/src/screens/benefits/SubmitClaimScreen.tsx
- apps/mobile/src/services/benefits.service.ts
- apps/web/src/**tests**/e2e/benefits/benefits-enrollment.e2e.test.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an eligibility rule, when defined, then it supports conditions on grade/band, nationality, contract type, work location, marital/family status and service period.
- [ ] Given an employee record change (e.g. grade promotion), when saved, then eligibility re-evaluates and proposes entitlement changes with effective dating.
- [ ] Given a conflict between two rules, then the engine applies the most specific/highest-priority rule and logs the resolution.
- [ ] Given an ineligible-to-eligible transition, then an enrolment task is auto-created for the relevant benefit.
- [ ] Given any eligibility change, then it is captured in the audit trail with the triggering event.

## Implementation Tasks From Backlog

- [ ] Backend: `benefit_eligibility_rule` and `employee_benefit_entitlement` entities with effective-dated rows
- [ ] Backend: rule evaluation service triggered by employee/grade/contract events on the event bus
- [ ] Frontend: rule builder UI + entitlement preview per employee
- [ ] Rules/Config: priority/precedence and family-status conditions per country
- [ ] Tests: integration (event-driven re-evaluation) + unit (precedence)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
