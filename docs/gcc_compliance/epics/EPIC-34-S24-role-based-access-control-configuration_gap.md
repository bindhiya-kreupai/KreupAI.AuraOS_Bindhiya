# Gap Analysis: EPIC-34-S24 — Role-based access control configuration

> **✅ SHIPPED 2026-06-17** — EPIC-34 batch closure. Generic HrmsConfigObject registry (scope: GLOBAL → COUNTRY → LEGAL_ENTITY → DOMAIN) + 22 per-domain workspaces + implementation checklist + connectors + migrations + monthly/go-live certificate. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for what remains in other themes.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**User story:** System Administrator, **I want** to configure RBAC with roles, permissions and data scoping, **so that** users see and act only within their authorized entities and data.

**Description**
Configure RBAC: role catalogue, granular permissions, entity/country/department data scoping, segregation-of-duties rules, sensitive-data masking, and access-review cadence — applied across all modules and dashboards.

**Covers:** 34.26
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

- [ ] Given a role, when configured, then its permissions and data scope (entity/country/department) are defined.
- [ ] Given SoD rules, when set, then conflicting permissions (e.g., preparer + approver) are blocked from one role.
- [ ] Given a scoped user, when accessing data, then only in-scope records are visible and sensitive fields are masked per role.
- [ ] Given any RBAC change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `role`, `permission`, `data_scope`, `sod_rule` schemas + enforcement middleware
- [ ] Backend: data-scoping and field-masking service
- [ ] Frontend: RBAC configuration screen + access-review report
- [ ] Rules/Config: SoD conflict matrix
- [ ] Tests: integration tests for data scoping, masking and SoD blocking

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
