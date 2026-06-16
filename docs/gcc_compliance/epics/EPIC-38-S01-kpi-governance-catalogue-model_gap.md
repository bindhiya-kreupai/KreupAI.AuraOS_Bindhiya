# Gap Analysis: EPIC-38-S01 — KPI governance & catalogue model

> Source epic: [EPIC-38-compliance-kpi-scorecard-library.md](./EPIC-38-compliance-kpi-scorecard-library.md)
> Parent epic: EPIC-38: Compliance KPI & Scorecard Library
> Module: analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a governed KPI catalogue model, **so that** every compliance KPI has one authoritative definition, formula and owner.

**Description**
Establish the KPI catalogue: each KPI defined with name, business definition, formula, data source/lineage, unit, frequency, direction (higher/lower better), owner and domain, under a governance framework (definition approval, change control, review cadence). This is the single source of truth all KPI computation and scorecards consume.

**Covers:** A7.1, A7.2
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/offboarding/analytics/metrics/route.ts
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx
- apps/web/src/app/dashboard/analytics/drill-down-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given a KPI, when defined, then it carries formula, data source/lineage, unit, frequency, direction, owner and domain.
- [ ] Given governance, when configured, then a KPI definition requires approval and review cadence before it goes live.
- [ ] Given a definition change, when published, then it is versioned and prior definitions remain for historical values.
- [ ] Given any catalogue change, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `kpi_definition`, `kpi_governance` schemas with lineage and versioning
- [ ] Backend: definition approval/change-control service
- [ ] Frontend: KPI catalogue browser + definition editor
- [ ] Rules/Config: domain taxonomy and KPI ownership
- [ ] Tests: unit tests for definition versioning and approval gating

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
