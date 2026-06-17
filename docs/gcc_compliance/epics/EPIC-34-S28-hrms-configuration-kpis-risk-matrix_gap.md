# Gap Analysis: EPIC-34-S28 — HRMS configuration KPIs & risk matrix

> **✅ SHIPPED 2026-06-17** — EPIC-34 batch closure. Generic HrmsConfigObject registry (scope: GLOBAL → COUNTRY → LEGAL_ENTITY → DOMAIN) + 22 per-domain workspaces + implementation checklist + connectors + migrations + monthly/go-live certificate. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for what remains in other themes.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3

**Description**
Build configuration KPIs (config completeness %, rule-pack coverage, validation-error rate, migration reconciliation %, overdue config items) and a configuration risk matrix (e.g., wrong/missing rule, stale rule version, unscoped access, failed integration) scored by likelihood × impact with remediation tracking.

**Covers:** 34.30, 34.31
**Acceptance criteria count:** 4 · **Task count:** 4

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

- add/wire service logic; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the dashboard, when loaded, then config completeness, rule coverage, error rate and migration reconciliation show per entity.
- [ ] Given a configuration risk, when registered, then it carries likelihood, impact, score, owner and linked control.
- [ ] Given a finding, when raised, then it is tracked to remediation with due date and status.
- [ ] Given KPI/risk items, when configured, then thresholds are tenant-editable.

## Implementation Tasks From Backlog

- [ ] Backend: config-KPI aggregation + `config_risk_register`
- [ ] Frontend: configuration KPI dashboard + risk heatmap
- [ ] Rules/Config: KPI definitions/thresholds and risk-scoring
- [ ] Tests: integration tests for KPI computation and risk scoring

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
