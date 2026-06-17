# Gap Analysis: EPIC-27-S21 — Key Takeaways & Separation Knowledge Reference

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-27-chapter-27-termination-and-separation-comp.md](./EPIC-27-chapter-27-termination-and-separation-comp.md)
> Parent epic: EPIC-27: Chapter 27 – Termination and Separation Compliance
> Module: Separation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `separation` · **Priority:** Could · **Estimate:** 1

**Description**
Surfaces concise key takeaways and contextual guidance (settlement timelines, notice/EOSB rules, visa-cancellation deadlines, country nuances, do/don't lists) within the separation module as version-controlled help content linked to relevant screens.

**Covers:** 27.37
**Acceptance criteria count:** 5 · **Task count:** 4

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a module screen, when help is opened, then relevant takeaways/guidance show.
- [ ] Given content updates, when published, then versioning is maintained.
- [ ] Given a country context, when set, then country-specific notes surface.
- [ ] Given help content, when displayed, then it links to the related policy/section.
- [ ] Given content changes, when saved, then they are audited.

## Implementation Tasks From Backlog

- [ ] Backend: knowledge-content entity (versioned) + screen mapping.
- [ ] Frontend: contextual help panel.
- [ ] Rules/Config: country-specific note configuration.
- [ ] Tests: unit (versioning), integration (screen mapping).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
