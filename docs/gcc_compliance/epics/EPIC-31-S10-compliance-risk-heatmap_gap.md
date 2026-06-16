# Gap Analysis: EPIC-31-S10 — Compliance risk heatmap

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 5

**Description**
A configurable heatmap scoring risk = likelihood × impact per domain and country/entity, colour-graded, with each cell drilling into the findings and KPIs driving its score. Backed by a risk register so heatmap cells trace to recorded risks.

**Covers:** 31.20
**Acceptance criteria count:** 4 · **Task count:** 4

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

- [ ] Given KPI and findings data, when the heatmap computes, then each domain × country cell shows a graded risk score (likelihood × impact).
- [ ] Given a heatmap cell, when clicked, then it lists the contributing risks, findings, and KPIs.
- [ ] Given a risk's likelihood or impact changes, when recalculated, then the cell colour and overall heatmap update.
- [ ] Given a high-residual-risk cell, when it has no open corrective action, then it is flagged for attention.

## Implementation Tasks From Backlog

- [ ] Backend: `ComplianceRisk` register (domain, country, likelihood, impact, residualRisk, linkedFindings) and heatmap aggregation service.
- [ ] Frontend: interactive heatmap grid with drill-into-cell panel.
- [ ] Rules/Config: likelihood/impact scales and risk-band thresholds.
- [ ] Tests: unit tests for risk scoring; e2e for cell drill-down.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
