# Gap Analysis: EPIC-34-S16 — HSE configuration

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `hse` · **Priority:** Should · **Estimate:** 3
**User story:** Compliance Officer, **I want** to configure HSE controls, heat-stress and incident parameters per country, **so that** health and safety compliance is driven by configuration.

**Description**
Configure HSE parameters: risk-assessment categories, heat-stress/midday-break rules (e.g., summer working-hour bans), PPE requirements, permit-to-work types, incident classification and reporting thresholds consumed by the HSE module.

**Covers:** 34.18
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

- [ ] Given a country, when configured, then heat-stress/midday-break windows and PPE/permit requirements resolve from the rule engine.
- [ ] Given incident classification, when configured, then severity tiers and reporting thresholds are defined.
- [ ] Given the midday-break rule, when active in season, then it drives attendance/scheduling flags.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `hse_config`, `incident_classification` schemas
- [ ] Backend: heat-stress/midday-break rule resolution
- [ ] Frontend: HSE configuration screen
- [ ] Rules/Config: per-country heat-stress/PPE/permit rules
- [ ] Tests: unit tests for seasonal midday-break resolution

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
