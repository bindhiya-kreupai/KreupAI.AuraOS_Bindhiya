# Gap Analysis: EPIC-20-S12 — Unpaid leave

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5

**Description**
Implement unpaid leave with approval, LOP computation to payroll, impact on accrual and on service period for gratuity (handover flag to EOSB), and limits/escalation for extended unpaid leave.

**Covers:** 20.13
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts
- apps/web/src/**tests**/api/attendance-timesheets-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given unpaid leave, when approved, then LOP is computed and queued to payroll for those days.
- [ ] Given unpaid leave, when posted, then accrual reduction and service-period impact flags are recorded.
- [ ] Given unpaid leave beyond a threshold, when reached, then HR escalation/approval is required.
- [ ] Given any unpaid leave, when applied, then it is audit-logged with LOP and impact details.

## Implementation Tasks From Backlog

- [ ] Backend: unpaid-leave service + LOP and service-impact flags
- [ ] Backend: EOSB service-period impact handover
- [ ] Frontend: unpaid-leave request/approval screen
- [ ] Rules/Config: per-country LOP basis and service-impact rule, thresholds
- [ ] Alerts/Workflow: extended-unpaid escalation
- [ ] Tests: unit tests for LOP and service-impact

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
