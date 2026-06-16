# Gap Analysis: EPIC-38-S08 — KPI automation, monthly KPI certificate & key takeaways

> Source epic: [EPIC-38-compliance-kpi-scorecard-library.md](./EPIC-38-compliance-kpi-scorecard-library.md)
> Parent epic: EPIC-38: Compliance KPI & Scorecard Library
> Module: analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `platform` · **Priority:** Should · **Estimate:** 3
**User story:** System Administrator, **I want** KPI automation and a monthly KPI certificate, **so that** KPIs refresh on schedule and compliance performance is attestable.

**Description**
Implement KPI automation (scheduled computation/refresh of all KPIs, data-quality gating, scorecard recompute, alerts on RAG status change) and the monthly compliance KPI certificate attesting that KPIs were computed, data-quality passed and red KPIs were actioned, with the chapter key-takeaways as reference.

**Covers:** A7.24, A7.25, A7.26
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

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given the schedule, when due, then all KPIs auto-compute, pass data-quality and refresh the scorecard without manual action.
- [ ] Given a KPI moving to red, when detected, then an alert fires to the KPI owner/management.
- [ ] Given the monthly certificate, when generated, then it attests computation, data-quality pass and red-KPI action, blocked while critical data-quality failures remain.
- [ ] Given the certificate, when exported, then it produces a PDF and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: KPI automation orchestrator on the event bus + certificate generator with gating
- [ ] Backend: RAG-change alerting
- [ ] Frontend: KPI automation console + certificate view with e-sign/export and key-takeaways reference
- [ ] Rules/Config: refresh schedule and certificate attestation fields
- [ ] Tests: e2e test of scheduled compute → data-quality → scorecard refresh and certificate gating

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
