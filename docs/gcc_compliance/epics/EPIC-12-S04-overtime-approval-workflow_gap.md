# Gap Analysis: EPIC-12-S04 — Overtime approval workflow

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**User story:** Line Manager, **I want** to request and approve overtime before it is worked, **so that** only authorized OT is performed and paid.

**Description**
Provide pre-authorization OT requests (employee/manager-initiated) with estimated hours, type, reason and cost estimate, routed through approval per delegation of authority (EPIC-09), with pre-approval the default control and post-facto approval as a tracked exception.

**Covers:** 12.7
**Acceptance criteria count:** 5 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts
- apps/web/src/**tests**/services/attendance-overtime-dashboard.service.test.ts
- apps/web/src/app/(modules)/attendance/overtime-calculation/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/ot-rules/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; verify workflow approvals and audit events.

## Acceptance Criteria To Verify

- [ ] Given an OT request, when submitted, then it captures employee, date, estimated hours, type and reason and routes to the authorized approver per DoA.
- [ ] Given approval thresholds, when hours/cost exceed a limit, then it escalates to a higher approver.
- [ ] Given OT worked without prior approval, when detected from attendance, then it is flagged as post-facto and requires exception approval before payment.
- [ ] Given an approval/rejection, when actioned, then it is captured with comments and audit-logged.
- [ ] Given a budget breach (EPIC-12-S11), when requesting, then the approver is warned/blocked per config.

## Implementation Tasks From Backlog

- [ ] Backend: `ot_request` schema with state machine + DoA routing
- [ ] Backend: post-facto OT exception handling
- [ ] Frontend: OT request + manager approval screens (and ESS)
- [ ] Alerts/Workflow: approval routing, escalation and notifications
- [ ] Rules/Config: approval thresholds per grade/cost
- [ ] Tests: integration tests for DoA routing and post-facto exception path

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
