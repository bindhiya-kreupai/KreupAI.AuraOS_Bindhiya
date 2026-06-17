# Gap Analysis: EPIC-34-S10 — Nationalization configuration

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `nationalization` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** to configure nationalization targets, counting rules and bands per entity, **so that** Emiratisation/Nitaqat/Bahrainization/Omanisation compliance is computed correctly.

**Description**
Configure nationalization parameters: applicable scheme by country and entity size/sector, counting rules (who counts, weighting, genuine-employment criteria), target percentages/points, Nitaqat band thresholds, and checkpoint cadence — consumed by the nationalization modules.

**Covers:** 34.12
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

- manual verification against acceptance criteria.

## Acceptance Criteria To Verify

- [ ] Given an entity, when configured, then the applicable scheme (Emiratisation/Nitaqat/Bahrainization/Omanisation) and its targets/bands resolve from the rule engine by size/sector.
- [ ] Given counting rules, when set, then eligibility/weighting and genuine-employment criteria are defined.
- [ ] Given thresholds, when configured, then green/compliant vs at-risk bands are derived automatically.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `nationalization_config`, `target_band` schemas
- [ ] Backend: scheme/target resolution by size and sector
- [ ] Frontend: nationalization configuration screen
- [ ] Rules/Config: per-country target/band/counting rules
- [ ] Tests: unit tests for band derivation and counting eligibility

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
