# Gap Analysis: EPIC-23-S05 — Health, hygiene & sanitation standards

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** to track health/hygiene/sanitation standards per accommodation, **so that** ablution ratios, cleaning, pest control and waste management meet regulatory minimums and are evidenced.

**Description**
Configure hygiene standards (toilet/shower ratio per workers, cleaning frequency, pest-control schedule, waste management, potable water) as checklist items with evidence and periodic verification.

**Covers:** 23.11
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

- [ ] Given a site, when hygiene standards are evaluated, then sanitary-fixture ratios (e.g. 1 toilet/shower per N workers) are computed against occupancy and flagged if breached.
- [ ] Given pest-control/cleaning schedules, when a service is due/overdue, then an alert is raised.
- [ ] Given a potable-water test, when recorded, then result and certificate are stored with validity/expiry.
- [ ] Given a hygiene non-conformance, then a corrective action is auto-created.
- [ ] Given any standard update/verification, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `hygiene_standard`, `hygiene_check`, `service_schedule` schema
- [ ] Backend: ratio-computation + schedule-due service
- [ ] Frontend: hygiene checklist + service schedule screen
- [ ] Rules/Config: fixture ratios, cleaning/pest frequencies per country
- [ ] Alerts/Workflow: overdue-service alerts; non-conformance → corrective action
- [ ] Tests: unit (ratio breach) + integration (corrective action)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
