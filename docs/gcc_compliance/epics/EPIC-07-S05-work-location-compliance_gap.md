# Gap Analysis: EPIC-07-S05 — Work location compliance

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** work-location/establishment validated against the permit's sponsoring entity and jurisdiction, **so that** employees work only where their authorization permits (e.

**Description**
Validate the employee's assigned work location/site and legal entity against the sponsoring establishment on the work permit (including freezone/mainland and emirate/region distinctions). Flag out-of-jurisdiction assignments and inter-location movements requiring permit changes.

**Covers:** 7.7
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/mobility/visa-immigration/page.tsx
- apps/web/src/app/api/v1/visa-permits/[id]/renewals/route.ts
- apps/web/src/app/api/v1/visa-permits/[id]/route.ts
- apps/web/src/app/api/v1/visa-permits/expiring/route.ts
- apps/web/src/app/api/v1/visa-permits/renewals/[renewalId]/transition/route.ts
- apps/web/src/app/api/v1/visa-permits/route.ts
- apps/web/src/app/dashboard/(modules)/visa-permits/page.tsx
- apps/web/src/lib/services/visa-permit.service.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests.

## Acceptance Criteria To Verify

- [ ] Given an assigned work location, when validated, then it is checked against the sponsoring entity/establishment on the permit.
- [ ] Given a freezone-sponsored employee assigned to mainland (or cross-emirate) work, when detected, then a compliance flag is raised.
- [ ] Given a work-location change, then a permit-impact assessment task is generated where required.
- [ ] Given audit, then location-validation outcomes are logged.
- [ ] Given RBAC, then only authorised roles can override a location flag with justification.

## Implementation Tasks From Backlog

- [ ] Backend: `work_location` + sponsoring-establishment link; location-validation service.
- [ ] Backend: jurisdiction/freezone rule checks.
- [ ] Frontend: work-location assignment + flag panel.
- [ ] Rules/Config: jurisdiction & establishment rules per country.
- [ ] Alerts/Workflow: out-of-jurisdiction flags + assessment task.
- [ ] Tests: jurisdiction validation tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
