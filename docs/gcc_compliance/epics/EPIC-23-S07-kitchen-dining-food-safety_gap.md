# Gap Analysis: EPIC-23-S07 — Kitchen, dining & food safety

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** to track kitchen/dining and food-safety standards, **so that** catering hygiene, food-handler health cards and municipality approvals are evidenced.

**Description**
Manage food-safety standards for camp kitchens/messes/dining: food-handler health cards, kitchen hygiene inspections, temperature logs, pest control, and municipality/catering licenses, with expiry alerts.

**Covers:** 23.14
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

- [ ] Given a food handler, when assigned, then a valid health/occupational card is required and expiry tracked with 30-day alerts.
- [ ] Given a kitchen, when inspected, then hygiene score and findings are recorded; failing scores create corrective actions.
- [ ] Given a catering license/municipality approval, when expiring, then a 60/30-day alert fires.
- [ ] Given temperature/storage logs, then non-compliant readings are flagged.
- [ ] Given any food-safety record, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `food_handler`, `kitchen_inspection`, `catering_license` schema
- [ ] Backend: health-card/license expiry service
- [ ] Frontend: food-safety register + inspection form
- [ ] Rules/Config: card/license validity + hygiene scoring per country
- [ ] Alerts/Workflow: expiry alerts; failing inspection → corrective action
- [ ] Tests: unit (expiry) + integration (corrective action)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
