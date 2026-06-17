# Gap Analysis: EPIC-34-S25 — Data integration configuration

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 5
**User story:** System Administrator, **I want** to configure integrations with authorities, banks and finance systems, **so that** compliance data flows reliably in and out of AuraOS.

**Description**
Configure integration adapters: authority portals/APIs (MOHRE/ICP/Qiwa/Mudad/GOSI/GPSSA/SIO/LMRA), bank/WPS agents, GL/finance, insurance and identity providers — with endpoints, credentials (secured), field mappings, schedules, retry and reconciliation hooks.

**Covers:** 34.27
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- packages/@aura/database/src/seeds/integration-configs.seed.ts
- apps/web/src/lib/database/pool-config.ts
- packages/@aura/database/src/connection-pool.config.ts
- packages/@aura/database/src/partitioning/partition-config.ts
- packages/@aura/database/tsconfig.json
- apps/web/src/**tests**/chaos/chaos.config.json

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- add/wire service logic; add protected API route with validation/RBAC.

## Acceptance Criteria To Verify

- [ ] Given an integration, when configured, then endpoint, secured credentials, mapping and schedule are defined per entity.
- [ ] Given a field mapping, when set, then source-to-target transforms are validated before activation.
- [ ] Given a transfer, when it fails, then retry/error-handling and reconciliation hooks fire and log the outcome.
- [ ] Given any integration-config change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `integration_adapter`, `field_mapping`, `integration_schedule` schemas
- [ ] Backend: secure-credential store + retry/error-handling
- [ ] Frontend: integration configuration screen
- [ ] Rules/Config: authority/bank/GL adapter contracts
- [ ] Tests: integration tests for mapping validation and retry handling

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
