# Gap Analysis: EPIC-23-S03 — Accommodation eligibility & assignment

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 5
**User story:** HR Admin, **I want** configurable accommodation eligibility rules, **so that** workers are assigned the correct accommodation type and entitlement based on category, grade and status.

**Description**
Define eligibility for accommodation (provided bed in camp vs staff housing vs family/female unit) by worker category, grade, gender, marital/family status and contract, linking to the EPIC-22 housing/accommodation benefit.

**Covers:** 23.7
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

- [ ] Given a worker, when eligibility is evaluated, then it derives accommodation type/entitlement from category, grade, gender and family status.
- [ ] Given an eligibility result, then assignment is restricted to compatible accommodation types (e.g. female worker → female accommodation only).
- [ ] Given a benefit linkage, then the accommodation assignment ties to the EPIC-22 accommodation benefit and suppresses any housing allowance.
- [ ] Given a category change, then eligibility re-evaluates and proposes reassignment.
- [ ] Given any eligibility/assignment change, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `accommodation_eligibility_rule`, `accommodation_assignment` schema
- [ ] Backend: eligibility evaluation service + EPIC-22 link
- [ ] Frontend: eligibility builder + assignment screen
- [ ] Rules/Config: type/gender/family eligibility per country
- [ ] Tests: integration (eligibility + benefit link)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
