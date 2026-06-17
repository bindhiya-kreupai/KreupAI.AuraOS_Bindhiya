# Gap Analysis: EPIC-23-S14 — Female & family accommodation controls with privacy/dignity

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** dedicated controls for female and family accommodation plus privacy/dignity safeguards, **so that** segregation, security and worker dignity are enforced and sensitive data is protected.

**Description**
Enforce female-accommodation controls (segregation, dedicated security/wardens, restricted access) and family-accommodation controls (unit eligibility, dependant verification), and apply privacy/dignity safeguards across all accommodation data (no public exposure of occupant lists, RBAC, masked sensitive fields).

**Covers:** 23.23, 23.24, 23.25
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

- [ ] Given female accommodation, when allocating, then only female occupants are permitted and access/security controls (warden, restricted entry) are recorded.
- [ ] Given family accommodation, when allocating, then family eligibility and dependant documents are verified before assignment.
- [ ] Given accommodation occupant data, then it is RBAC-restricted, occupant lists are not publicly exposed, and sensitive fields are masked.
- [ ] Given a privacy/dignity policy, then complaints relating to dignity are routed to a confidential channel.
- [ ] Given any female/family allocation or data access, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `female_accommodation_control`, `family_unit_eligibility`, privacy/masking middleware
- [ ] Backend: segregation enforcement + dignity-complaint routing
- [ ] Frontend: female/family allocation screens with restricted access
- [ ] Rules/Config: segregation, security and family-eligibility rules per country
- [ ] Tests: unit (segregation/masking) + e2e (restricted access)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
