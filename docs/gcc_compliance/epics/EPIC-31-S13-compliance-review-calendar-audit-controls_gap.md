# Gap Analysis: EPIC-31-S13 — Compliance review calendar & audit controls

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
A calendar of recurring compliance reviews/certifications per domain and country that auto-creates review tasks, links to required dashboards, and records outcomes. Plus a control-register that maps each compliance control to its owner, frequency, test method, and last-tested status for internal audit.

**Covers:** 31.23, 31.24
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

- docs/implementation/AUDIT-COVERAGE-MAP.md
- docs/implementation/AUDIT-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-AUDIT-COMPLIANCE-COMPLETION.md
- docs/implementation/TEST-STRATEGY-AUDIT-LIFECYCLE.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a recurring review schedule, when a review date arrives, then a review task is auto-created and assigned with links to the relevant dashboards.
- [ ] Given a completed review, when recorded, then outcome, findings, and certification status are captured and feed corrective action.
- [ ] Given the audit-controls register, when an auditor opens it, then each control shows owner, frequency, test method, last-tested date, and pass/fail.
- [ ] Given a control overdue for testing, when the calendar runs, then it is flagged and escalated.

## Implementation Tasks From Backlog

- [ ] Backend: `ComplianceReviewSchedule`, `ReviewInstance`, and `ComplianceControl` register schema.
- [ ] Backend: scheduler job creating review tasks and overdue-control flags.
- [ ] Frontend: review calendar view and audit-controls register screen.
- [ ] Alerts/Workflow: review-due and control-overdue notifications.
- [ ] Tests: unit tests for schedule generation; integration for review→finding linkage.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
