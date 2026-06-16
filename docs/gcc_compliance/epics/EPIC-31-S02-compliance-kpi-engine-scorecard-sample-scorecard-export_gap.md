# Gap Analysis: EPIC-31-S02 — Compliance KPI engine, scorecard & sample scorecard export

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 13
**User story:** Compliance Officer, **I want** a configurable KPI/scorecard engine that scores compliance per domain, country, and legal entity, **so that** I get a single weighted compliance posture and a printable scorecard.

**Description**
Core scoring engine: a KPI catalogue with definitions, weights, thresholds and RAG bands; a scorecard that rolls KPIs up by domain → country → entity into an overall compliance score. Includes a configurable digital "HR Compliance Scorecard" form with PDF/Excel export matching the handbook sample.

**Covers:** 31.5, 31.28
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/(modules)/workflow-engine/workflow-analytics/page.tsx
- apps/web/src/app/api/offboarding/analytics/metrics/route.ts
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx
- apps/web/src/app/dashboard/analytics/custom-reports/page.tsx

**Planning / prior analysis evidence**

- None found.

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given the KPI catalogue, when KPI values refresh, then each KPI is rated Red/Amber/Green against its configured thresholds and timestamped.
- [ ] Given domain and entity weights, when the scorecard computes, then it produces a weighted 0–100 score with RAG status per domain, country, and overall.
- [ ] Given a UAE entity with WPS salary delay > 15 days, when the payroll KPI evaluates, then it is forced Red and drags the entity score per the configured override rule.
- [ ] Given a generated scorecard, when exported, then PDF/Excel matches the sample layout including as-of date, owner, and signature block, and the export is audit-logged.
- [ ] Given a KPI value, when a user drills in, then they see the contributing source records.

## Implementation Tasks From Backlog

- [ ] Backend: `ComplianceKpi`, `KpiResult`, `Scorecard`, `ScorecardLine` schema (weight, threshold, ragBand, score, period).
- [ ] Backend: scoring/rollup service (KPI → domain → country → entity) with override rules.
- [ ] Backend: scorecard export service (PDF/Excel) from a configurable template.
- [ ] Frontend: scorecard screen with RAG gauges, weighting view, drill-down, and "Sample HR Compliance Scorecard" export button.
- [ ] Rules/Config: KPI weights, thresholds, and country override rules (e.g. WPS delay → forced Red).
- [ ] Tests: unit tests for weighted rollup and overrides; snapshot test for export.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
