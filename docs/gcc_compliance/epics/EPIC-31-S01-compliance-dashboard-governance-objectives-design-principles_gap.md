# Gap Analysis: EPIC-31-S01 — Compliance dashboard governance, objectives & design principles

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a governed framework that defines what each compliance dashboard is for, who owns it, and how it must be designed, **so that** every dashboard is consistent, trustworthy, and audit-defensible rather than ad-hoc.

**Description**
Establishes the foundation: a documented governance model (data owners, refresh cadence, RAG definitions, single-source-of-truth rules) and design standards (consistent RAG colours, drill-down, country/entity filters, no vanity metrics) that all later dashboards inherit. Captured as configurable platform records, not just narrative.

**Covers:** 31.1, 31.2, 31.3, 31.4
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx
- apps/web/src/app/dashboard/analytics/drill-down-reports/page.tsx
- apps/web/src/app/dashboard/analytics/report-builder/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given a new dashboard is created, when it is published, then it must reference a registered data owner, refresh cadence, and RAG band definition or publication is blocked.
- [ ] Given the design-principles config, when any dashboard renders, then it applies the standard RAG palette, country/legal-entity filter, and "as-of / last-refreshed" timestamp.
- [ ] Given the governance framework, when a KPI lacks a defined threshold and owner, then it is flagged as "ungoverned" and excluded from certified packs.
- [ ] Given a non-admin user, when they attempt to edit governance config, then RBAC denies it and the attempt is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `ComplianceDashboardGovernance` and `DashboardDesignStandard` entities (owner, cadence, ragBands, sourceOfTruth, dataClassification).
- [ ] Backend: governance validation service blocking publication of ungoverned dashboards/KPIs.
- [ ] Frontend: governance admin screen (owners, cadence, RAG band editor) and shared dashboard chrome component (filters, timestamp, RAG legend).
- [ ] Rules/Config: per-country/entity RAG band thresholds and refresh cadence defaults.
- [ ] Tests: unit tests for validation; e2e for blocked publication of ungoverned dashboard.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
