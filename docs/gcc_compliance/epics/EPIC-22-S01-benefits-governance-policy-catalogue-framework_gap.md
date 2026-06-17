# Gap Analysis: EPIC-22-S01 — Benefits governance, policy & catalogue framework

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-22-chapter-22-employee-benefits-compliance.md](./EPIC-22-chapter-22-employee-benefits-compliance.md)
> Parent epic: EPIC-22: Chapter 22 – Employee Benefits Compliance
> Module: Benefits
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `benefits` · **Priority:** Must · **Estimate:** 8
**User story:** HR Manager, **I want** a configurable benefits governance framework and policy library, **so that** every benefit offered is backed by an approved, versioned policy with clear ownership and country scope.

**Description**
Establish the foundational benefits governance model in AuraOS: a benefit catalogue, a policy register linked to each benefit, governance roles (owner, approver, reviewer), and country/entity applicability. This frames all later benefit-specific stories and the objectives of benefits compliance.

**Covers:** 22.1, 22.2, 22.3, 22.4
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

- [ ] Given a HR Manager, when they create a benefit catalogue item, then they must link an approved benefit policy version, country scope (UAE/KSA/Bahrain/Qatar/Oman/Kuwait), legal entity and effective dates.
- [ ] Given a benefit policy, when it is published, then prior versions are retained read-only and the change is audit-logged with author and timestamp.
- [ ] Given country scope, when a benefit is statutorily mandatory (e.g. UAE/Qatar medical), then the catalogue flags it as "Mandatory" and blocks deactivation without override approval.
- [ ] Given governance roles, when a user lacks the Benefits Owner role, then create/edit of catalogue and policy is blocked by RBAC.
- [ ] Given a published catalogue, then employees see only benefits applicable to their entity/country in self-service.

## Implementation Tasks From Backlog

- [ ] Backend: `benefit_catalogue` (id, code, name, category, in_kind/cash, mandatory_flag, country_scope[], legal_entity_id, status) and `benefit_policy` (id, benefit_id, version, body, effective_from, status) schema/migration
- [ ] Backend: governance service for policy versioning + publish workflow
- [ ] Frontend: Benefits Admin — catalogue & policy management screens
- [ ] Rules/Config: country/entity applicability and mandatory-benefit flags
- [ ] Alerts/Workflow: policy approval workflow (owner → approver)
- [ ] Tests: unit (versioning/RBAC) + e2e (publish + self-service visibility)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
