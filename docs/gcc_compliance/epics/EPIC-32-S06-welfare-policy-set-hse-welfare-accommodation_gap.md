# Gap Analysis: EPIC-32-S06 — Welfare policy set (HSE & Welfare, Accommodation)

> Source epic: [EPIC-32-chapter-32-hr-policies.md](./EPIC-32-chapter-32-hr-policies.md)
> Parent epic: EPIC-32: Chapter 32 – HR Policies
> Module: Policies
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `policies` · **Priority:** Should · **Estimate:** 3

**Description**
Configures the HSE & Welfare and Accommodation policies, including heat-stress, PPE, camp-rules and occupancy clauses, and targets them at the relevant worker populations (e.g. site/labour-camp employees) rather than all staff.

**Covers:** 32.17, 32.18
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

- [ ] Given the HSE policy, then duty-of-care, heat-stress and PPE clauses reference the HSE config (EPIC-24).
- [ ] Given the Accommodation policy, then occupancy, hygiene and camp-rules reference the accommodation model (EPIC-23).
- [ ] Given population targeting, then these policies are pushed only to in-scope worker categories/locations.
- [ ] Given multilingual workers, then acknowledgement supports the worker's preferred language version.

## Implementation Tasks From Backlog

- [ ] Backend: population-targeting rule (by job category/location) for policy distribution.
- [ ] Backend: HSE/Accommodation policy templates with module links.
- [ ] Frontend: targeting selector in publish flow.
- [ ] Rules/Config: language-version mapping for worker policies.
- [ ] Tests: integration (targeted distribution scope).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
