# Gap Analysis: EPIC-32-S16 — Policy engine adoption guide & key takeaways

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Could · **Estimate:** 1

**Description**
Captures the chapter's key takeaways as an in-product onboarding/help guide and a best-practice setup checklist (governance roles, mandatory policy set, acknowledgement SLAs, review cadence, addendum coverage) shown to admins configuring the policy module.

**Covers:** 32.32
**Acceptance criteria count:** 3 · **Task count:** 4

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a new admin, when they open the policy module, then a best-practice setup checklist and key-takeaways guide are available.
- [ ] Given the checklist, then it covers governance roles, mandatory policies, acknowledgement SLA, review cadence and country addendums.
- [ ] Given completion, then checklist progress is tracked per entity.

## Implementation Tasks From Backlog

- [ ] Backend: setup-checklist progress tracking.
- [ ] Frontend: in-product help/guide + setup checklist.
- [ ] Rules/Config: checklist items per chapter best practices.
- [ ] Tests: unit (checklist progress).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
