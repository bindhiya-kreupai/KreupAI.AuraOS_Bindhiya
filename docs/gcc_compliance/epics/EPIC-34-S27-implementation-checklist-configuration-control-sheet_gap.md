# Gap Analysis: EPIC-34-S27 — Implementation checklist & configuration control sheet

> **✅ SHIPPED 2026-06-17** — EPIC-34 batch closure. Generic HrmsConfigObject registry (scope: GLOBAL → COUNTRY → LEGAL_ENTITY → DOMAIN) + 22 per-domain workspaces + implementation checklist + connectors + migrations + monthly/go-live certificate. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for what remains in other themes.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a configurable implementation checklist and configuration control sheet, **so that** every entity's setup is complete and verified before go-live.

**Description**
Build the implementation checklist (all config domains, owner, status, evidence) and the **configuration control sheet** — a per-entity register of every configured parameter with reviewer sign-off — used to verify completeness and serve as the go-live evidence and the sample control sheet from the handbook.

**Covers:** 34.29, 34.32
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

- [ ] Given an implementation, when tracked, then the checklist shows every config domain with owner, status and evidence link.
- [ ] Given the configuration control sheet, when generated, then it lists each configured parameter, its value, source rule and reviewer sign-off.
- [ ] Given incomplete items, when present, then the implementation cannot be marked ready for go-live certification.
- [ ] Given any checklist/control-sheet update, when made, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `implementation_checklist`, `config_control_sheet` schemas
- [ ] Backend: completeness-gate service feeding go-live
- [ ] Frontend: implementation checklist board + control-sheet generator/export
- [ ] Rules/Config: configurable checklist template per country
- [ ] Tests: integration tests for completeness gating

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
