# Gap Analysis: EPIC-20-S14 — Leave ↔ payroll integration

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** leave to deliver locked leave-salary/LOP/encashment inputs, **so that** payroll reflects leave accurately without manual entry.

**Description**
Aggregate leave-salary, LOP (unpaid/partial), encashment and advance leave-salary into the payroll input feed with maker-checker lock, blocking payroll lock if leave for the period is unprocessed.

**Covers:** 20.19
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/time-attendance/BiometricIntegration.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/app/(modules)/attendance/biometric-integration/page.tsx
- apps/web/src/app/dashboard/attendance/biometric-integration/page.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-LEAVE-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/LEAVE-ENGINE-PLANNING.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given period close, when leave is finalized, then leave salary, LOP and encashment are aggregated per employee.
- [ ] Given unprocessed leave for an active employee, when payroll attempts lock, then it is blocked with a reason.
- [ ] Given maker-checker, when approved (preparer ≠ approver), then the leave input set is locked and published.
- [ ] Given a post-lock change, when made, then it routes to off-cycle/adjustment and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `leave_payroll_input` aggregation + lock; event `leave.payroll.locked`
- [ ] Backend: pre-lock completeness check
- [ ] Frontend: leave-input review + maker-checker screen
- [ ] Rules/Config: LOP/leave-salary day-value basis per country
- [ ] Alerts/Workflow: lock-block alerts
- [ ] Tests: integration tests for aggregation, lock-block, maker-checker

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
