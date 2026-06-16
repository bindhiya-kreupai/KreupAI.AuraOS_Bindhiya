# Gap Analysis: EPIC-34-S01 — Configuration objectives & compliance architecture baseline

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 3
**User story:** System Administrator, **I want** a documented configuration architecture and objectives model in AuraOS, **so that** every compliance module configures against a single, consistent layered design.

**Description**
Establish the HRMS compliance configuration foundation: the layered architecture (country rule engine → legal entity → domain config → workflow/alerts/audit/RBAC), configuration objects registry, environment model (config vs runtime), and the principle that all statutory behaviour is data-driven and effective-dated. This frames every later configuration story.

**Covers:** 34.1, 34.2, 34.3
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

- [ ] Given the platform, when reviewed, then the configuration architecture layers and their resolution order are documented and represented as a config-object registry.
- [ ] Given any compliance behaviour, when implemented, then it must resolve from configuration (rule engine/legal entity/domain config), never hard-coded country logic.
- [ ] Given a configuration object, when created, then it carries owner, scope (global/country/entity), effective date and version.
- [ ] Given the architecture, when changed, then the change is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `config_object_registry` and `config_scope` schemas (scope, owner, effective_from, version)
- [ ] Backend: configuration-resolution order service (global → country → entity → domain)
- [ ] Frontend: configuration architecture / object-registry overview screen
- [ ] Rules/Config: enumerate configuration domains and ownership
- [ ] Tests: unit tests for scope resolution precedence

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
