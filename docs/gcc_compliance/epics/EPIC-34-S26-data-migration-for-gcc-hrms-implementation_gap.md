# Gap Analysis: EPIC-34-S26 — Data migration for GCC HRMS implementation

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** data-migration tooling with validation and reconciliation, **so that** legacy HR data loads cleanly and compliantly at go-live.

**Description**
Provide migration templates and a load engine for master data, contracts, balances (leave, EOSB accrual), documents and history, with pre-load validation against the data dictionary and country rules, dedup, error/rejection reporting, and post-load reconciliation against source totals.

**Covers:** 34.28
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/lib/database/pool-config.ts
- packages/@aura/database/src/connection-pool.config.ts
- packages/@aura/database/src/partitioning/partition-config.ts
- packages/@aura/database/src/seeds/integration-configs.seed.ts
- packages/@aura/database/tsconfig.json

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a migration template, when populated and loaded, then records are validated against the data dictionary and country rules before commit.
- [ ] Given invalid records, when detected, then they are rejected with a per-row error report and do not block valid records.
- [ ] Given a completed load, when reconciled, then headcount, balances and totals match source and discrepancies are reported.
- [ ] Given any migration run, when executed, then it is logged with counts, rejects and reconciliation status.

## Implementation Tasks From Backlog

- [ ] Backend: migration template engine + staged load with validation
- [ ] Backend: dedup, rejection report and reconciliation service
- [ ] Frontend: migration console (upload, validate, load, reconcile)
- [ ] Rules/Config: validation rules bound to data dictionary/country rules
- [ ] Tests: integration tests for rejection isolation and reconciliation totals

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
