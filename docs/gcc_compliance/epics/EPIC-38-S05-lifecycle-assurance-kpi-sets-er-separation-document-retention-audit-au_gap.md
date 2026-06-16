# Gap Analysis: EPIC-38-S05 — Lifecycle & assurance KPI sets (ER, separation, document retention, audit, automation)

> Source epic: [EPIC-38-compliance-kpi-scorecard-library.md](./EPIC-38-compliance-kpi-scorecard-library.md)
> Parent epic: EPIC-38: Compliance KPI & Scorecard Library
> Module: analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 3

**Description**
Implement employee-relations KPIs (grievance SLA, resolution rate), separation KPIs (final-settlement timeliness, exit-clearance completion), document-retention KPIs (file completeness, expiry-breach), audit KPIs (finding-closure rate, corrective-action overdue %) and HRMS/automation KPIs (automation coverage, straight-through rate) from the catalogue.

**Covers:** A7.15, A7.16, A7.17, A7.18, A7.19
**Acceptance criteria count:** 4 · **Task count:** 4

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/retention/page.tsx
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/offboarding/analytics/metrics/route.ts
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/admin/compliance/audit/data-retention/page.tsx
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the catalogue, when computed, then ER/separation/document/audit/automation KPIs return values per entity/country.
- [ ] Given audit KPIs, when computed, then they draw from the EPIC-37 finding/corrective-action data.
- [ ] Given RBAC, when a user views, then only in-scope data is shown.
- [ ] Given a computation, when run, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: computation services for ER/separation/document/audit/automation KPIs
- [ ] Frontend: lifecycle & assurance KPI views
- [ ] Rules/Config: KPI formulas for these domains
- [ ] Tests: integration tests for audit-data sourcing

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
