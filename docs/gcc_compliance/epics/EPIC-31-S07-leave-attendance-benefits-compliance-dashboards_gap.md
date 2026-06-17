# Gap Analysis: EPIC-31-S07 — Leave/attendance & benefits compliance dashboards

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Should · **Estimate:** 5

**Description**
Leave/attendance view (statutory leave compliance, negative balances, unauthorized absence, regularization backlog, missing punches) and benefits view (medical insurance coverage %, expiring policies, missing mandatory enrolments).

**Covers:** 31.13, 31.14
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/app/dashboard/analytics/executive-dashboards/page.tsx
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/e2e/attendance/shift-management.e2e.test.ts
- apps/web/src/**tests**/services/attendance-roster-dashboard.service.test.ts
- apps/web/src/**tests**/services/attendance-shift-swap-dashboard.service.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify query-backed dashboard/reporting.

## Acceptance Criteria To Verify

- [ ] Given attendance/leave data, when the dashboard loads, then it shows unauthorized-absence, missing-punch backlog, and statutory-leave compliance with RAG.
- [ ] Given negative or non-compliant leave balances, when detected, then they are listed with employee drill-down.
- [ ] Given benefits data, when rendered, then medical-insurance coverage %, uninsured mandatory employees, and policies expiring within the alert window are shown.
- [ ] Given an uninsured employee where coverage is statutory, when detected, then it is flagged Red and a finding can be raised.

## Implementation Tasks From Backlog

- [ ] Backend: leave/attendance and benefits KPI feeds.
- [ ] Frontend: leave/attendance dashboard and benefits dashboard with drill-down.
- [ ] Rules/Config: statutory-leave rules, mandatory-insurance rules, policy-expiry alert window per country.
- [ ] Alerts/Workflow: raise finding on mandatory coverage gap / unauthorized absence threshold.
- [ ] Tests: integration tests for coverage % and absence flagging.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
