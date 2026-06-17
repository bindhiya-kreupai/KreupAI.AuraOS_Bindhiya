# Gap Analysis: EPIC-31-S11 — Corrective action tracking & sample corrective-action register

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md](./EPIC-31-chapter-31-hr-compliance-dashboard-and-con.md)
> Parent epic: EPIC-31: Chapter 31 – HR Compliance Dashboard and Controls
> Module: Analytics
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `analytics` · **Priority:** Must · **Estimate:** 8
**User story:** Compliance Officer, **I want** closed-loop corrective-action tracking with a register, **so that** every compliance finding is owned, SLA-tracked, and closed with evidence.

**Description**
A CAPA module: findings (raised from any dashboard or review) become corrective actions with owner, due date, severity, root cause, status, and evidence. SLA-driven escalation on overdue items, and a configurable digital "Corrective Action Register" with export matching the handbook sample.

**Covers:** 31.21, 31.29
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

- confirm/add tenant-scoped schema or config; add/wire service logic; add tests; verify query-backed dashboard/reporting; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a finding, when a corrective action is created, then it captures owner, severity, due date, root cause, and links to the source finding/risk.
- [ ] Given an action past its due date, when the SLA job runs, then it escalates to the owner's manager and is flagged overdue on dashboards.
- [ ] Given an action moved to Closed, when saved, then closure requires evidence and a verifier, and the change is audit-logged.
- [ ] Given the register, when exported, then it matches the sample layout (ID, finding, owner, due, status, closure date) and respects RBAC.

## Implementation Tasks From Backlog

- [ ] Backend: `CorrectiveAction` schema (sourceFindingId, owner, severity, dueDate, rootCause, status, evidenceRefs, verifier).
- [ ] Backend: SLA/escalation job and closure-validation service.
- [ ] Frontend: corrective-action board/list, action detail with evidence upload, and register export.
- [ ] Alerts/Workflow: overdue escalation and assignment notifications.
- [ ] Rules/Config: SLA windows by severity.
- [ ] Tests: unit tests for SLA/escalation; e2e for create→close-with-evidence flow.

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
