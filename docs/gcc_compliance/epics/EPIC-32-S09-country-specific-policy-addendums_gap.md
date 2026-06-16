# Gap Analysis: EPIC-32-S09 — Country-specific policy addendums

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Must · **Estimate:** 5

**Description**
Adds an addendum layer: a base policy plus country-specific overriding clauses resolved at render time through the country rule engine (EPIC-34), so an employee always sees base + applicable addendum as one effective document, version-controlled together.

**Covers:** 32.21
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a base policy with addendums, when an employee in KSA views it, then base + KSA addendum render as one effective document; a UAE employee sees the UAE addendum.
- [ ] Given an addendum change, then the effective document for affected employees increments its effective version and triggers re-acknowledgement.
- [ ] Given the rule engine, then addendum applicability is resolved by employee legal entity/country, not manual assignment.
- [ ] Given conflicting clauses, then the addendum overrides the base and the override is visible/auditable.

## Implementation Tasks From Backlog

- [ ] Backend: `policy_addendum` (basePolicyId, country, legalEntityId, overrideSections) entity + migration.
- [ ] Backend: render-time merge service resolving base + addendum via rule engine.
- [ ] Frontend: addendum editor and effective-document preview by country.
- [ ] Rules/Config: country applicability rules (UAE/KSA/BHR/QAT/OMN/KWT).
- [ ] Tests: integration (per-country render, override precedence, re-ack on addendum change).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
