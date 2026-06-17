# Gap Analysis: EPIC-03-S07 — Succession planning & talent-pool readiness

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-03-chapter-3-workforce-planning-manpower-comp.md](./EPIC-03-chapter-3-workforce-planning-manpower-comp.md)
> Parent epic: EPIC-03: Chapter 3 – Workforce Planning & Manpower Compliance
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Should · **Estimate:** 5
**User story:** HR Manager, **I want** succession plans for critical positions, **so that** key-role continuity risk is managed and ready successors are tracked.

**Description**
Lets HR designate critical/key positions, nominate successors with readiness levels (ready now / 1–2 yrs / 3+ yrs), and track development actions and bench strength. Links to position management so vacated critical roles surface pre-identified successors and feed workforce-risk scoring.

**Covers:** 3.9
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/succession-planning/talent-pools/page.tsx
- apps/web/src/app/dashboard/workforce-planning/succession-readiness/page.tsx
- apps/web/src/app/dashboard/succession-planning/critical-positions/page.tsx
- apps/web/src/app/(modules)/succession-planning/page.tsx
- apps/web/src/app/api/succession-planning/analytics/route.ts
- apps/web/src/app/api/succession-planning/candidates/route.ts
- apps/web/src/app/api/succession-planning/plans/route.ts
- apps/web/src/app/api/succession-planning/settings/route.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a position flagged critical, when a succession plan is created, then ≥1 successor with readiness level can be recorded.
- [ ] Given a successor, when nominated, then readiness, development actions and review date are captured.
- [ ] Given a critical position with no ready-now successor, when reviewed, then it is flagged as a continuity risk.
- [ ] Given bench strength, when viewed per unit, then % of critical roles with a ready successor is shown.
- [ ] Given any succession change, when saved, then it is audit-logged and RBAC-restricted to HR.

## Implementation Tasks From Backlog

- [ ] Backend: `succession_plan` + `successor_nomination` entities + migration.
- [ ] Backend: bench-strength and continuity-risk calc service.
- [ ] Frontend: succession board (critical roles, successors, readiness heat).
- [ ] Rules/Config: criticality criteria and readiness scale per entity.
- [ ] Alerts/Workflow: alert on critical role with no ready successor.
- [ ] Tests: unit (bench calc) + integration (risk flagging).

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
