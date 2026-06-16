# Gap Analysis: EPIC-38-S03 — Statutory-compliance KPI sets (WPS, social insurance, nationalization, immigration)

> Source epic: [EPIC-38-compliance-kpi-scorecard-library.md](./EPIC-38-compliance-kpi-scorecard-library.md)
> Parent epic: EPIC-38: Compliance KPI & Scorecard Library
> Module: analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** WPS, social-insurance, nationalization and immigration KPI sets, **so that** the highest-penalty compliance areas are measured against statutory limits.

**Description**
Implement the wage-protection KPIs (on-time WPS submission %, salary-delay incidents), social-insurance KPIs (GOSI/GPSSA/SIO filing timeliness, contribution-match %), nationalization KPIs (Emiratisation/Nitaqat/Bahrainization/Omanisation rate vs target, band status) and immigration KPIs (valid-document %, expiry-breach count, renewal-on-time %) from the catalogue, with thresholds tied to statutory limits.

**Covers:** A7.6, A7.7, A7.8, A7.9
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/benefits/analytics/route.ts
- apps/web/src/app/api/offboarding/analytics/metrics/route.ts
- apps/web/src/app/api/succession-planning/analytics/route.ts
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/api/v1/benefits/analytics/cost/route.ts
- apps/web/src/app/api/v1/benefits/analytics/total-statement/[employeeId]/route.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the catalogue, when computed, then WPS/social-insurance/nationalization/immigration KPIs return values per entity/country.
- [ ] Given nationalization KPIs, when computed, then rate-vs-target and band status derive from the country rule pack.
- [ ] Given statutory-linked KPIs, when a value breaches a statutory limit, then it is flagged.
- [ ] Given a computation, when run, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: computation services for WPS/SI/nationalization/immigration KPIs
- [ ] Backend: statutory-limit linkage from rule engine
- [ ] Frontend: statutory-compliance KPI views
- [ ] Rules/Config: KPI formulas and statutory thresholds
- [ ] Tests: integration tests for statutory-breach flagging per country

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
