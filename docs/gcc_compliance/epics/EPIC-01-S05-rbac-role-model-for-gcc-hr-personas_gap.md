# Gap Analysis: EPIC-01-S05 — RBAC role model for GCC HR personas

> Source epic: [EPIC-01-gcc-employment-landscape.md](./EPIC-01-gcc-employment-landscape.md)
> Parent epic: EPIC-01: Chapter 1: GCC Employment Landscape
> Module: Foundation
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**User story:** System Administrator, **I want** predefined RBAC roles for every HR persona scoped by country and entity, **so that** access to sensitive workforce and compliance data follows least-privilege from day one.

**Description**
Defines roles for HR Admin, HR Manager, Payroll Officer, PRO/Immigration Officer, Compliance Officer, Line Manager, Employee, Internal Auditor, Executive/Leadership and System Administrator, with permissions scopeable to specific countries and entities.

**Covers:** 1.3
**Acceptance criteria count:** 6 · **Task count:** 5

## Current Status

**Status:** Missing

**Existing implementation evidence**

- None found in `apps/`, `packages/@aura/`, or `services`.

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add protected API route with validation/RBAC; add/wire UI workflow; add tests; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given the persona catalogue, when roles are seeded, then all ten personas exist with sensible default permission sets.
- [ ] Given a user, when assigned a role, then it can be constrained to one or more countries/entities.
- [ ] Given a Line Manager role, when accessing employees, then visibility is limited to their reporting line.
- [ ] Given an Employee (self-service) role, then access is limited to their own records.
- [ ] Given any role/permission change, then it is recorded in the audit trail.
- [ ] Given a Compliance Officer or Internal Auditor, then read access spans assigned countries without write rights to transactional data.

## Implementation Tasks From Backlog

- [ ] Backend: `Role`, `Permission`, `UserRoleAssignment` (with country/entity scope) schema + migration.
- [ ] Backend: authorization guard enforcing country/entity scoping on every protected resource.
- [ ] Frontend: role-assignment admin screen with scope selectors.
- [ ] Rules/Config: seed default permission matrices per persona.
- [ ] Tests: unit/e2e tests covering scope enforcement and self-service isolation.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
