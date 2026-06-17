# Gap Analysis: EPIC-31-S05 — Payroll, WPS/Mudad & Social Insurance compliance dashboards

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** payroll, WPS/Mudad, and social-insurance compliance dashboards, **so that** I can prove wages are paid correctly, on time, through the protected channels, and that statutory contributions reconcile.

**Description**
Three linked financial-compliance dashboards consuming payroll, WPS/Mudad, and GOSI/GPSSA/SIO feeds: on-time pay %, salary-delay alerts, WPS file submission status and rejections, contribution vs payroll reconciliation variances, and missing registrations.

**Covers:** 31.8, 31.9, 31.10
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/executive-dashboards/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/gosi/mudad-bridge/page.tsx
- apps/web/src/app/(modules)/payroll-compliance/wps/sif-generation/page.tsx
- apps/web/src/components/payroll/SalaryRevision.tsx
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/(modules)/payroll/analytics/page.tsx
- apps/web/src/app/api/benefits/analytics/route.ts
- apps/web/src/app/api/succession-planning/analytics/route.ts

**Planning / prior analysis evidence**

- docs/implementation/API_VERSIONING_IMPLEMENTATION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; externalize country-specific rules into versioned config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given a payroll period, when the payroll dashboard loads, then it shows on-time-pay %, locked/unlocked status, and any salary delay > 15 days flagged Red.
- [ ] Given WPS/Mudad files, when the dashboard renders, then submission status, statutory-window adherence, and rejection/exception counts are shown per entity/country.
- [ ] Given GOSI/GPSSA/SIO data, when reconciled to payroll, then contribution variance and unregistered-employee counts are displayed with drill-down.
- [ ] Given any breach (delayed wage, rejected WPS file, contribution mismatch), when detected, then a corrective-action item can be raised directly from the dashboard.

## Implementation Tasks From Backlog

- [ ] Backend: payroll/WPS/social-insurance KPI feeds and reconciliation aggregation services.
- [ ] Frontend: three dashboard views (payroll, WPS/Mudad, social insurance) with shared drill-down.
- [ ] Rules/Config: salary-delay threshold (15 days), WPS statutory window, contribution-variance tolerance per country.
- [ ] Alerts/Workflow: raise finding on WPS rejection / salary delay / contribution mismatch.
- [ ] Tests: integration tests for reconciliation variance and salary-delay flagging.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
