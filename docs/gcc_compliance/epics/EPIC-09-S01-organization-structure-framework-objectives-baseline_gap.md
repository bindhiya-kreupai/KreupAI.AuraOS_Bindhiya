# Gap Analysis: EPIC-09-S01 — Organization structure framework & objectives baseline

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `core-hr` · **Priority:** Must · **Estimate:** 5

**Description**
Establish the foundational org framework that defines node types (legal entity, business unit, department, cost center, position), allowed parent-child rules, and effective-dated versioning. This is the backbone the rest of the epic and downstream modules build on, encoding the objectives and structure principles from the handbook.

**Covers:** 9.1, 9.2, 9.3
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/core-hr/organization-structure/page.tsx
- apps/web/src/app/dashboard/core-hr/organization-structure/page.tsx
- apps/web/src/lib/services/organization/**tests**/department.service.test.ts
- apps/web/src/lib/services/organization/department.service.ts
- apps/web/src/app/api/core-hr/organization/route.ts
- apps/web/src/lib/services/organization/**tests**/position.service.test.ts
- apps/web/src/lib/services/organization/position.service.ts
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given a defined node-type ruleset, when an admin builds the hierarchy, then only valid parent-child relationships (e.g., department under business unit under legal entity) are permitted.
- [ ] Given any structure change, when it is saved, then a new effective-dated version is created and the prior version is retained read-only.
- [ ] Given multiple GCC countries, when entities are added, then each node is tagged with its country and legal entity for downstream rule-engine resolution.
- [ ] Given an RBAC-restricted user, when they attempt structural edits, then only `HR Admin`/`System Administrator` roles may modify the framework, and all edits are written to the audit trail.
- [ ] Given a request for the org tree, when rendered, then the API returns the hierarchy as of any chosen effective date.

## Implementation Tasks From Backlog

- [ ] Backend: `org_node` schema (`node_id`, `node_type`, `parent_id`, `legal_entity_id`, `country_code`, `effective_from`, `effective_to`, `status`, `version`)
- [ ] Backend: hierarchy validation service enforcing node-type parent-child rules
- [ ] Backend: effective-dated versioning + as-of query API
- [ ] Frontend: org structure tree builder/editor with version timeline
- [ ] Rules/Config: configurable node-type ruleset per tenant
- [ ] Tests: unit tests for invalid hierarchy rejection and as-of retrieval

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
