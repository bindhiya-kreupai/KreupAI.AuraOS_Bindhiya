# Gap Analysis: EPIC-31-S03 — Executive HR Compliance Dashboard

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 8

**Description**
The C-suite landing view: overall score, RAG by domain and country, top open risks, overdue corrective actions, and statutory deadlines at risk, with trend lines. Read-mostly, fast-loading, and drillable into domain dashboards.

**Covers:** 31.6
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

- [ ] Given an executive logs in, when the dashboard loads, then it shows overall compliance score, domain RAG tiles, country tiles, trend, and top-5 open risks.
- [ ] Given a domain tile, when clicked, then it drills to that domain's dashboard pre-filtered to the same entity/country.
- [ ] Given a statutory deadline within its alert window, when the dashboard renders, then it surfaces it in a "deadlines at risk" widget.
- [ ] Given an executive without entity X access, when the dashboard loads, then entity X data is excluded per RBAC and the exclusion is consistent across tiles.

## Implementation Tasks From Backlog

- [ ] Backend: executive aggregation API consolidating scorecard, risk, corrective-action, and deadline feeds.
- [ ] Backend: trend snapshot job persisting period-over-period scores.
- [ ] Frontend: executive dashboard (score header, RAG tiles, trend, top-risks, deadlines widget) with drill-through.
- [ ] Alerts/Workflow: surface deadline-at-risk and newly-Red domains.
- [ ] Tests: integration test for aggregation; e2e for drill-through and RBAC filtering.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
