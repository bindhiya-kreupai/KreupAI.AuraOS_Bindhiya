# Gap Analysis: EPIC-07-S10 — Immigration document register (configurable register + export)

> Source epic: [EPIC-07-chapter-7-immigration-work-authorization-c.md](./EPIC-07-chapter-7-immigration-work-authorization-c.md)
> Parent epic: EPIC-07: Chapter 7 – Immigration & Work Authorization Compliance
> Module: Immigration
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `immigration` · **Priority:** Must · **Estimate:** 5

**Description**
A consolidated register listing every immigration document (employee + dependent) with type, authority, reference, issue/expiry, status, sponsoring entity and assigned PRO. Filterable by country, entity, status (active/expiring/expired), document type; exportable to Excel/PDF and used as an audit source-of-truth.

**Covers:** 7.12
**Acceptance criteria count:** 5 · **Task count:** 4

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

- docs/implementation/GUIDE-DOCUMENT-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the register, when opened, then all immigration documents render with key fields and current status.
- [ ] Given filters (country/entity/status/type/expiry window), when applied, then the register updates accordingly.
- [ ] Given an export request, then an Excel/PDF register is generated reflecting filters and timestamped.
- [ ] Given RBAC, then only authorised roles can view/export the register.
- [ ] Given a register view/export, then the access is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: register query/materialized view aggregating documents + register export service.
- [ ] Frontend: register grid with filters + export.
- [ ] Rules/Config: column/visibility config by role.
- [ ] Tests: filter + export correctness tests.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
