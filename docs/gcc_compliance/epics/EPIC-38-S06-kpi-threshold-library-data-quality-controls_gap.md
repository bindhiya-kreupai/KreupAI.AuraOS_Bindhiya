# Gap Analysis: EPIC-38-S06 — KPI threshold library & data-quality controls

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-38-compliance-kpi-scorecard-library.md](./EPIC-38-compliance-kpi-scorecard-library.md)
> Parent epic: EPIC-38: Compliance KPI & Scorecard Library
> Module: analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a KPI threshold library and data-quality controls, **so that** KPI values are banded consistently and trusted before publication.

**Description**
Build the KPI threshold library (red/amber/green bands per KPI, tied to statutory limits where relevant, tenant-configurable and country-aware) and the KPI data-quality checklist (completeness, timeliness, accuracy, source-reconciliation) that must pass before a KPI value is published to scorecards.

**Covers:** A7.21, A7.23
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

- [ ] Given a KPI, when thresholds are configured, then red/amber/green bands apply and statutory-linked bands derive from the rule engine.
- [ ] Given thresholds, when configured, then they are tenant-editable and country-aware.
- [ ] Given a KPI value, when data-quality controls run, then completeness/timeliness/accuracy/source-reconciliation are checked and failures block publication with a flag.
- [ ] Given any threshold/data-quality change, when saved, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `kpi_threshold`, `kpi_data_quality_check` schemas + banding and validation services
- [ ] Backend: publication gate on data-quality pass
- [ ] Frontend: threshold library editor + data-quality results view
- [ ] Rules/Config: statutory-linked threshold bands per country
- [ ] Tests: integration tests for banding and data-quality gating

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
