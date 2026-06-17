# Gap Analysis: EPIC-34-S08 — WPS & Mudad file configuration

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `wps` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** to configure WPS/Mudad file formats, windows and bank-agent details per entity, **so that** wage files generate correctly and on time.

**Description**
Configure each entity's WPS/Mudad parameters: file format/layout (UAE SIF, Saudi Mudad, Qatar WPS, Bahrain/Oman/Kuwait controls), employer/establishment IDs, bank-agent/routing, statutory submission window, and validation/control thresholds (e.g., salary-delay flag > statutory window) consumed by the WPS module.

**Covers:** 34.10
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/admin/TenantConfiguration.tsx
- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/(modules)/payroll-compliance/wps/file-history/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/web/src/components/compliance/wps/WpsConfigPanel.tsx
- apps/web/src/components/compliance/wps/WpsFileGenerator.tsx
- apps/web/src/**tests**/chaos/chaos.config.json
- apps/web/src/**tests**/performance/k6.config.js

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- add/wire service logic; add protected API route with validation/RBAC; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given an entity, when WPS is configured, then its country file layout, employer IDs and bank-agent details are captured.
- [ ] Given statutory timing, when configured, then the submission window and salary-delay threshold (e.g., > 15 days UAE) are set from the rule engine.
- [ ] Given a configuration, when activated, then it is validated against the country's mandatory WPS field set.
- [ ] Given any WPS-config change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `wps_config` schema (layout, employer_id, bank_agent, window_days, delay_threshold)
- [ ] Backend: WPS-config validation against country mandatory fields
- [ ] Frontend: WPS/Mudad configuration screen
- [ ] Rules/Config: per-country WPS layout and window rules
- [ ] Tests: unit tests for WPS-config validation

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
