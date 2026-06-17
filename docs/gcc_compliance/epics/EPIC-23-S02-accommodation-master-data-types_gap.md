# Gap Analysis: EPIC-23-S02 — Accommodation master data & types

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 8
**User story:** HR Admin, **I want** to maintain accommodation master data across sites, buildings, rooms and beds with type classification, **so that** every accommodation asset and its capacity is registered and reportable.

**Description**
Model the accommodation hierarchy (location/camp → building/block → room → bed) with type (labour camp, staff accommodation, villa, family unit, female accommodation), capacity, area, amenities, ownership (owned/leased) and status. This is the spine for allocation, occupancy and inspections.

**Covers:** 23.6, 23.8
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

- [ ] Given an accommodation site, when created, then it records type, location, authority permit/license number, capacity, ownership and status.
- [ ] Given a room, when created, then it records floor area, designed bed capacity and amenity attributes (AC, ablutions ratio).
- [ ] Given a bed, then it has a unique identifier and status (vacant/occupied/blocked/maintenance).
- [ ] Given a permit/license expiry, when 60/30 days out, then an alert fires to the Accommodation Owner.
- [ ] Given any master-data change, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `accommodation_site`, `building`, `room`, `bed` schema (type, capacity, area, amenities, license_no, status)
- [ ] Backend: hierarchy + capacity rollup service; license-expiry alert job
- [ ] Frontend: master-data management with hierarchy tree
- [ ] Rules/Config: accommodation type catalogue per country
- [ ] Alerts/Workflow: license/permit expiry alerts
- [ ] Tests: unit (capacity rollup) + integration (hierarchy)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
