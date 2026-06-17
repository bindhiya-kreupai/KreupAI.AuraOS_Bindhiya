# Gap Analysis: EPIC-23-S01 — Accommodation governance, policy & landscape framework

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 5
**User story:** HR Manager, **I want** an accommodation governance framework, policy library and authority register, **so that** accommodation standards are anchored to approved policy and the relevant GCC authorities per country.

**Description**
Establish governance for accommodation compliance: objectives, the GCC landscape, the authorities involved (e.g. MOHRE/UAE, MHRSD & municipalities/KSA, welfare bodies), and a versioned accommodation policy that defines standards, roles and country scope. Frames all later stories.

**Covers:** 23.1, 23.2, 23.3, 23.4, 23.5
**Acceptance criteria count:** 5 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a HR Manager, when an accommodation policy is published, then it captures version, country scope, standards referenced and effective dates with prior versions retained read-only.
- [ ] Given the authorities register, then each accommodation standard links to the issuing authority/regulation per country.
- [ ] Given RBAC, when a user lacks the Accommodation Owner role, then policy/standard edits are blocked.
- [ ] Given a published policy, then it is visible to inspectors and camp bosses in the module.
- [ ] Given any policy/standard change, then it is audit-logged with author and timestamp.

## Implementation Tasks From Backlog

- [ ] Backend: `accommodation_policy`, `accommodation_authority`, `accommodation_standard` schema with versioning
- [ ] Backend: policy publish/version service
- [ ] Frontend: policy & authority register admin
- [ ] Rules/Config: country scope + authority-to-standard mapping
- [ ] Tests: unit (versioning/RBAC)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
