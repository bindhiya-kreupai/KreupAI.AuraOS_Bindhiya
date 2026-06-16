# Gap Analysis: EPIC-38-S02 — Governance, workforce & payroll KPI sets

> Source epic: [EPIC-38-compliance-kpi-scorecard-library.md](./EPIC-38-compliance-kpi-scorecard-library.md)
> Parent epic: EPIC-38: Compliance KPI & Scorecard Library
> Module: analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5

**Description**
Implement the HR governance KPIs (e.g., policy acknowledgement %, control-completion rate), workforce/headcount KPIs (headcount accuracy, position-control adherence, attrition) and payroll KPIs (on-time payroll %, payroll error rate, off-cycle %, maker-checker adherence) from the catalogue against live data.

**Covers:** A7.3, A7.4, A7.5
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/workforce-planning/page.tsx
- apps/web/src/app/dashboard/workforce-planning/workforce-analytics/page.tsx
- apps/web/src/components/analytics/WorkforcePlanning.tsx
- apps/web/src/lib/services/ai/workforce-analytics.service.ts
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/(modules)/payroll/analytics/page.tsx
- apps/web/src/app/api/offboarding/analytics/metrics/route.ts
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts

**Planning / prior analysis evidence**

- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the catalogue, when computed, then governance, workforce and payroll KPIs return values per entity/country and period.
- [ ] Given a KPI, when computed, then it uses the defined formula and data source exactly.
- [ ] Given RBAC, when a user views, then only in-scope entities' KPI values are shown.
- [ ] Given a computation, when run, then inputs and results are audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: computation services for governance/workforce/payroll KPIs
- [ ] Backend: KPI value store keyed by entity/country/period
- [ ] Frontend: domain KPI views
- [ ] Rules/Config: KPI formulas for these domains
- [ ] Tests: integration tests for formula correctness and RBAC scoping

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
