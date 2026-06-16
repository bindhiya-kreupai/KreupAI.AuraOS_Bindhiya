# Gap Analysis: EPIC-31-S06 — Nationalization & immigration/work-permit dashboards

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 8
**User story:** PRO / Immigration Officer, **I want** nationalization and immigration dashboards, **so that** I can track Emiratisation/Nitaqat/Bahrainization/Omanisation targets and visa/permit expiries before they breach.

**Description**
Two dashboards: nationalization (actual vs target ratio, band/colour, gap to target, fake-nationalization risk flags) and immigration (visa, work permit, Iqama/CPR/QID expiry pipeline with 60/30/7-day alerting, renewal status, grace-period tracking).

**Covers:** 31.11, 31.12
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/executive-dashboards/page.tsx
- apps/web/src/app/(modules)/analytics/reports/page.tsx
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

- [ ] Given an entity's nationalization data, when the dashboard loads, then it shows current ratio, target, band (e.g. Nitaqat colour), and gap with RAG status.
- [ ] Given a localisation shortfall, when detected, then projected penalty/risk is displayed and a finding can be raised.
- [ ] Given immigration documents, when the dashboard renders, then expiries are bucketed and alerts fire at 60/30/7 days before expiry.
- [ ] Given an expired or in-grace-period permit, when listed, then it is flagged Red with PRO action status and days remaining.

## Implementation Tasks From Backlog

- [ ] Backend: nationalization KPI feed (ratio, target, band, gap) and immigration expiry pipeline feed.
- [ ] Frontend: nationalization dashboard (gauge + gap) and immigration dashboard (expiry buckets, renewal tracker).
- [ ] Rules/Config: localisation targets/bands per country; visa/permit/Iqama/CPR/QID alert thresholds 60/30/7.
- [ ] Alerts/Workflow: expiry alerts and shortfall findings.
- [ ] Tests: unit tests for expiry bucketing and ratio/band computation.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
