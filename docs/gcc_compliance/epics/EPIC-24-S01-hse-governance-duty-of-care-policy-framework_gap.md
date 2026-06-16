# Gap Analysis: EPIC-24-S01 — HSE governance, duty of care & policy framework

> Source epic: [EPIC-24-chapter-24-health-safety-and-welfare-compl.md](./EPIC-24-chapter-24-health-safety-and-welfare-compl.md)
> Parent epic: EPIC-24: Chapter 24 – Health, Safety and Welfare Compliance
> Module: HSE
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Must · **Estimate:** 5
**User story:** HSE Manager, **I want** an HSE governance framework anchored to employer duty of care and a versioned HSE policy, **so that** safety obligations, landscape and country scope are codified and approved.

**Description**
Establish HSE governance: objectives, the GCC HSE landscape, employer duty-of-care obligations, and a versioned HSE policy with country scope. Frames the module and the legal basis for all controls.

**Covers:** 24.1, 24.2, 24.3, 24.4, 24.5
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Minimal Evidence

**Existing implementation evidence**

- apps/web/src/services/authService.ts
- apps/web/src/services/searchService.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given the HSE policy, when published, then it captures version, country scope, duty-of-care commitments and effective dates with prior versions read-only.
- [ ] Given the landscape register, then each obligation links to the relevant authority/regulation per country (e.g. midday-break decree, civil defence, MoL/MOHRE OSH).
- [ ] Given RBAC, when a user lacks the HSE Owner role, then policy edits are blocked.
- [ ] Given any policy change, then it is audit-logged with author and timestamp.

## Implementation Tasks From Backlog

- [ ] Backend: `hse_policy`, `hse_obligation`, `hse_authority` schema with versioning
- [ ] Backend: policy publish/version service
- [ ] Frontend: HSE policy & obligation register admin
- [ ] Rules/Config: duty-of-care obligations + authority mapping per country
- [ ] Tests: unit (versioning/RBAC)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
