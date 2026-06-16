# Gap Analysis: EPIC-34-S15 — Accommodation configuration

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `welfare` · **Priority:** Should · **Estimate:** 3

**Description**
Configure accommodation master setup: property/room/bed structure, occupancy limits, welfare/sanitation/fire-safety standards, eligibility, inspection cadence and cost-allocation rules consumed by the accommodation module.

**Covers:** 34.17
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/api/mfa-config/route.ts
- apps/web/src/app/api/sso-config/route.ts
- apps/web/src/app/api/v1/admin/ai-config/route.ts

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given an entity, when configured, then accommodation types, occupancy limits and welfare standards resolve per country.
- [ ] Given occupancy, when configured, then max-per-room limits and breach flags are enforced.
- [ ] Given inspection cadence, when set, then scheduling parameters feed the accommodation calendar.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `accommodation_config`, `occupancy_rule` schemas
- [ ] Backend: occupancy-limit enforcement
- [ ] Frontend: accommodation configuration screen
- [ ] Rules/Config: per-country welfare/occupancy standards
- [ ] Tests: unit tests for occupancy-limit flags

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
