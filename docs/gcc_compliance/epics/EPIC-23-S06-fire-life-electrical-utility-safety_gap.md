# Gap Analysis: EPIC-23-S06 — Fire, life & electrical/utility safety

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** to track fire/life safety and electrical/utility safety per accommodation, **so that** extinguishers, alarms, exits, certificates and electrical inspections are current and evidenced.

**Description**
Manage fire and life safety (extinguishers, alarms, smoke detectors, emergency exits, evacuation drills, civil-defence certificate) and electrical/utility safety (DEWA/SEWA-equivalent connection, earth/RCD testing, generator/AC safety) with certificate expiry and drill tracking, aligned with EPIC-24 fire safety.

**Covers:** 23.12, 23.13
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

- [ ] Given fire-safety assets, when registered, then extinguisher service dates, alarm tests and civil-defence certificate validity are tracked with 60/30-day expiry alerts.
- [ ] Given evacuation drills, when scheduled, then completion is recorded and overdue drills are flagged.
- [ ] Given electrical safety, when an inspection (earth/RCD/wiring) is recorded, then result and next-due date are stored and overdue inspections flagged.
- [ ] Given an expired fire/electrical certificate, then the site is flagged high-risk on the dashboard and a corrective action is created.
- [ ] Given any safety record, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `fire_safety_asset`, `evacuation_drill`, `electrical_inspection`, `safety_certificate` schema
- [ ] Backend: certificate-expiry + drill-due alert jobs
- [ ] Frontend: fire & electrical safety registers
- [ ] Rules/Config: service intervals, drill frequency, certificate types per country
- [ ] Alerts/Workflow: 60/30-day expiry + overdue-drill alerts; non-conformance → corrective action
- [ ] Tests: unit (expiry/overdue) + integration (EPIC-24 alignment)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
