# Gap Analysis: EPIC-17-S02 — Nitaqat program model & band configuration

> Source epic: [EPIC-17-chapter-17-nitaqat-saudization-compliance.md](./EPIC-17-chapter-17-nitaqat-saudization-compliance.md)
> Parent epic: EPIC-17: Chapter 17 – Nitaqat / Saudization Compliance
> Module: Nationalization
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** System Administrator, **I want** the Nitaqat program model and band thresholds configured per activity and size category, **so that** band classification reflects current MHRSD rules.

**Description**
Models the Nitaqat program: activity (economic sector) and size category (entity-size tier), with configurable Saudization-ratio thresholds defining each band — Platinum, High/Medium/Low Green, Yellow, Red. All thresholds are effective-dated in the rule engine so updates apply without code changes.

**Covers:** 17.4
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/api/v1/compliance/emiratisation/route.ts
- services/payroll-service/src/services/emiratisation-service.ts
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js
- apps/web/src/app/(modules)/leave/policies/policy-config/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/nitaqat/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an activity + size category, when configured, then band thresholds (Red/Yellow/Green tiers/Platinum) are stored as effective-dated ranges.
- [ ] Given an entity's activity/size, when classified, then the correct threshold set is selected.
- [ ] Given overlapping or gapped thresholds, when validated, then a config error is raised before save.
- [ ] Given a threshold change, then it versions, is audited and applies from its effective date.

## Implementation Tasks From Backlog

- [ ] Backend: `nitaqat_band_config` entity (`activity`, `sizeCategory`, `band`, `minRatio`, `maxRatio`, `effectiveFrom`, `version`).
- [ ] Backend: config validation service (no gaps/overlaps).
- [ ] Frontend: band configuration admin screen.
- [ ] Rules/Config: per-activity/size band threshold sets.
- [ ] Tests: validation tests for threshold continuity.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
