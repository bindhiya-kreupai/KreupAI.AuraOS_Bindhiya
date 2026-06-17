# Gap Analysis: EPIC-19-S11 — Attendance ↔ payroll integration (LOP & presence inputs)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8
**User story:** Payroll Officer, **I want** attendance to deliver locked LOP and presence inputs, **so that** payroll reflects actual attendance with no manual rekeying.

**Description**
Aggregate per-period present days, unauthorized absence, late/early deductions and LOP into a payroll input set with maker-checker lock; block payroll lock if attendance for any active employee is unprocessed, and publish a signed input feed to payroll.

**Covers:** 19.14
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/components/time-attendance/BiometricIntegration.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/app/(modules)/attendance/biometric-integration/page.tsx
- apps/web/src/app/dashboard/attendance/biometric-integration/page.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-ENGINE-COMPLETION.md
- docs/implementation/GUIDE-PAYROLL-SERVICE.md
- docs/implementation/PAYROLL-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given period close, when attendance is finalized, then present days, LOP days and deduction amounts are aggregated per employee.
- [ ] Given any active employee with unprocessed attendance, when payroll attempts lock, then the lock is blocked with a reason.
- [ ] Given maker-checker, when the input set is approved (preparer ≠ approver), then it is locked and published to payroll.
- [ ] Given a post-lock correction, when made, then it routes to an off-cycle/adjustment path, not silent overwrite, and is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `attendance_payroll_input` aggregation + lock schema
- [ ] Backend: pre-lock completeness check + event publish `attendance.payroll.locked`
- [ ] Frontend: payroll-input review + maker-checker approval screen
- [ ] Rules/Config: LOP day-value basis per country (calendar vs working days)
- [ ] Alerts/Workflow: lock-block alerts; off-cycle correction routing
- [ ] Tests: integration tests for aggregation, lock-block, maker-checker

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
