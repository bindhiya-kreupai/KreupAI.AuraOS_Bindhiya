# Gap Analysis: EPIC-23-S17 — Accommodation KPIs, dashboard & automation design

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-23-chapter-23-accommodation-and-labour-camp-c.md](./EPIC-23-chapter-23-accommodation-and-labour-camp-c.md)
> Parent epic: EPIC-23: Chapter 23 – Accommodation and Labour Camp Compliance
> Module: Welfare
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 5
**User story:** Executive / Leadership, **I want** an accommodation KPI dashboard with automation, **so that** I can monitor occupancy, compliance, inspection scores and cost in real time.

**Description**
Deliver accommodation KPIs (occupancy %, compliance %, inspection score, open corrective actions, expiring certificates, cost per occupant) on a dashboard, plus the automation design (event-driven allocation, inspection scheduling, expiry alerts) underpinning the module.

**Covers:** 23.27, 23.29, 23.30
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the dashboard, when opened, then it shows occupancy %, compliance %, average inspection score, open corrective actions and expiring certificates by site/country.
- [ ] Given a KPI breach (e.g. occupancy > legal limit, inspection score below threshold), then it is highlighted red and drillable to the site.
- [ ] Given automation design, then event-driven triggers (assignment, inspection due, certificate expiry) auto-create tasks per the documented flow.
- [ ] Given RBAC, then dashboard scope respects site/country and sensitive data is role-restricted.

## Implementation Tasks From Backlog

- [ ] Backend: KPI aggregation views; automation event handlers
- [ ] Frontend: accommodation dashboard with drill-downs
- [ ] Rules/Config: KPI thresholds + dashboard RBAC scope
- [ ] Alerts/Workflow: automation triggers wiring
- [ ] Tests: integration (KPI accuracy) + e2e (drill-down RBAC)

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
