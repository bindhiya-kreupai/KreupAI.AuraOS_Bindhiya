# Gap Analysis: EPIC-31-S14 — Compliance automation design & dashboard access control

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 8
**User story:** System Administrator, **I want** the compliance-automation data pipeline and RBAC-based dashboard access control, **so that** dashboards refresh reliably from source domains and only authorised users see permitted data.

**Description**
Defines the automation architecture (event-driven ingestion from domain epics via the event bus, scheduled refresh jobs, KPI computation pipeline) and the access-control model (role + country + legal-entity scoping for every dashboard, KPI, and export), with full audit logging of access.

**Covers:** 31.25, 31.26
**Acceptance criteria count:** 4 · **Task count:** 6

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

- [ ] Given a domain event (e.g. WPS rejection, visa expiry), when published to the event bus, then the relevant KPI is refreshed within the configured SLA and timestamped.
- [ ] Given a scheduled refresh, when it runs or fails, then success/failure and freshness are visible and alerting fires on stale data.
- [ ] Given a user role, when they open a dashboard, then RBAC scopes visible entities/countries/KPIs and hides unauthorised exports.
- [ ] Given any dashboard view or export, when performed, then it is captured in the audit trail with user, scope, and timestamp.

## Implementation Tasks From Backlog

- [ ] Backend: event-bus consumers and scheduled refresh jobs feeding the KPI store; freshness tracking.
- [ ] Backend: RBAC policy enforcement (role × country × entity) across dashboard/KPI/export APIs.
- [ ] Frontend: data-freshness/health indicator and access-scoped rendering.
- [ ] Alerts/Workflow: stale-data and refresh-failure alerts.
- [ ] Rules/Config: access-policy matrix and refresh SLAs.
- [ ] Tests: integration tests for event-driven refresh; security tests for RBAC scoping and audit logging.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
