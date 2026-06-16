# Gap Analysis: EPIC-09-S15 — HRMS configuration model for org & position

> Source epic: [EPIC-09-chapter-9-organization-position-management.md](./EPIC-09-chapter-9-organization-position-management.md)
> Parent epic: EPIC-09: Chapter 9 – Organization & Position Management
> Module: Core HR
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**User story:** System Administrator, **I want** the org & position model exposed as tenant-level configuration, **so that** node types, validations, position-control mode and DoA are set up without code changes.

**Description**
Deliver the configuration layer described in the handbook's HRMS configuration model: configurable node types, mandatory-field rules, position-control mode, grade/band currencies, occupation-code lists and DoA thresholds, all versioned per tenant.

**Covers:** 9.17
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/api/core-hr-employee-by-id.test.ts
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/**tests**/performance/tests/employee-load.test.js
- apps/web/src/**tests**/services/core-hr-employee.service.test.ts
- apps/web/src/app/(modules)/core-hr/employee-database/page.tsx
- apps/web/src/app/(modules)/core-hr/employee-id-cards/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- manual verification against acceptance criteria.

## Acceptance Criteria To Verify

- [ ] Given a tenant, when configured, then node types, mandatory fields, and position-control mode are editable via admin UI without deployment.
- [ ] Given a config change, when published, then it is versioned and applied effective-dated with audit capture.
- [ ] Given multiple countries, when configured, then per-country rule sets (identifiers, occupation codes, bands) bind to the correct legal entity.
- [ ] Given an invalid configuration, when validated, then publication is blocked with a clear error.

## Implementation Tasks From Backlog

- [ ] Backend: `org_config` versioned configuration store + publish/validate service
- [ ] Frontend: configuration admin console for org & position
- [ ] Rules/Config: bind country rule sets to legal entities
- [ ] Tests: unit tests for config validation and versioned publish

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
