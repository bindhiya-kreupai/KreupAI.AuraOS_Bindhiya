# Gap Analysis: EPIC-34-S05 — Position & organization configuration

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5

**Description**
Configure legal-entity org hierarchy, business units/departments, cost centres, position catalogue with position control, grades/salary bands, and the occupation/job-classification code mappings (MOHRE occupation codes, Qiwa professions) that feed nationalization counting and immigration eligibility.

**Covers:** 34.7
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/lib/services/organization/**tests**/department.service.test.ts
- apps/web/src/lib/services/organization/department.service.ts
- apps/web/src/lib/services/organization/**tests**/position.service.test.ts
- apps/web/src/lib/services/organization/position.service.ts
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/(modules)/core-hr/organization-structure/page.tsx
- apps/web/src/app/api/core-hr/organization/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- manual verification against acceptance criteria.

## Acceptance Criteria To Verify

- [ ] Given an entity, when configured, then its org hierarchy, departments, cost centres, positions and grades are defined with position-control rules.
- [ ] Given a position, when created, then it maps to an authority occupation/profession code used by nationalization and immigration.
- [ ] Given position control, when enabled, then headcount cannot exceed approved positions without override.
- [ ] Given any structure change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `org_unit`, `position`, `grade`, `occupation_mapping` schemas
- [ ] Backend: position-control enforcement service
- [ ] Frontend: organization & position configuration screens
- [ ] Rules/Config: occupation/profession code lists per country
- [ ] Tests: integration tests for position-control gating

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
