# Gap Analysis: EPIC-31-S09 — Employee relations, termination/final-settlement & document compliance dashboards

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5
**User story:** Compliance Officer, **I want** employee-relations, termination/final-settlement, and document-compliance dashboards, **so that** I can track grievance SLAs, timely & correct settlements, and employee-file completeness.

**Description**
Three dashboards: employee relations (open grievances, SLA breaches, harassment/retaliation case aging), termination/final settlement (settlement on-time %, EOSB accuracy, pending clearances, immigration-closure status), and document compliance (mandatory-document completeness score, expiring/missing documents, retention overdue).

**Covers:** 31.17, 31.18, 31.19
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/dashboard/analytics/executive-dashboards/page.tsx
- apps/web/src/app/dashboard/analytics/retention/page.tsx
- apps/web/src/app/(modules)/analytics/reports/page.tsx
- apps/web/src/app/api/v1/analytics/reports/custom/route.ts
- apps/web/src/app/api/v1/analytics/reports/schedule/route.ts
- apps/web/src/app/api/v1/benefits/analytics/total-statement/[employeeId]/route.ts
- apps/web/src/app/dashboard/analytics/compliance-reports/page.tsx
- apps/web/src/app/dashboard/analytics/cross-module-reports/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/EMPLOYEE-MANAGEMENT-IMPROVEMENTS.md
- docs/implementation/EMPLOYEE-VALIDATION-IMPLEMENTATION.md
- docs/implementation/GUIDE-DOCUMENT-SERVICE.md
- docs/implementation/GUIDE-EMPLOYEE-LIFECYCLE-HISTORY.md
- docs/implementation/GUIDE-EMPLOYEE-SERVICE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given grievance data, when the ER dashboard loads, then open cases, SLA breaches, and aging buckets are shown with confidentiality-aware masking.
- [ ] Given separations, when the termination dashboard renders, then final-settlement on-time %, EOSB variance, and pending exit clearances are displayed.
- [ ] Given employee files, when the document dashboard loads, then completeness score, missing mandatory documents, and overdue-retention items appear with drill-down.
- [ ] Given a settlement breaching statutory payment timelines, when detected, then it is flagged Red and a finding can be raised.

## Implementation Tasks From Backlog

- [ ] Backend: ER, termination/final-settlement, and document KPI feeds (with confidentiality masking on ER).
- [ ] Frontend: three dashboard views with drill-down and masked ER detail.
- [ ] Rules/Config: grievance SLA timelines, settlement statutory window, mandatory-document matrix per country.
- [ ] Alerts/Workflow: raise finding on SLA breach / late settlement / missing mandatory document.
- [ ] Tests: integration tests for completeness score and settlement-timeliness flagging.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
