# Gap Analysis: EPIC-23-S04 — Room/bed allocation & occupancy controls

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 8
**User story:** HR Admin, **I want** to allocate beds/rooms and enforce occupancy density limits, **so that** no room exceeds the legal maximum occupants and segregation rules are respected.

**Description**
Manage bed/room allocation, check-in/check-out, transfers and vacancy, with hard occupancy controls (max persons per room, minimum floor area per worker, gender and nationality/company segregation where required). Produces the Sample Room and Bed Register.

**Covers:** 23.9, 23.10, 23.33
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests.

## Acceptance Criteria To Verify

- [ ] Given a bed allocation, when attempted, then the system blocks it if it would exceed the room's legal max occupancy or breach minimum area-per-worker.
- [ ] Given segregation rules, when allocating, then mixing genders in a room or non-compatible categories is blocked.
- [ ] Given an occupancy threshold (e.g. > 90% camp occupancy), then a capacity alert is raised.
- [ ] Given the Room and Bed Register, then it exports site/room/bed, occupant, check-in date and occupancy status.
- [ ] Given any allocation/transfer/check-out, then bed status updates and the change is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: allocation service with occupancy/segregation guardrails; `bed_allocation` history
- [ ] Backend: occupancy rollup + threshold alert job
- [ ] Frontend: allocation board (vacant/occupied) + Room and Bed Register export
- [ ] Rules/Config: max occupancy, min area/worker, segregation per country
- [ ] Alerts/Workflow: over-occupancy/capacity alerts
- [ ] Tests: unit (occupancy/segregation blocks) + e2e (allocation flow)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
