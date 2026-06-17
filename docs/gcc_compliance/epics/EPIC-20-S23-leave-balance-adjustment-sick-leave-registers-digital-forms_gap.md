# Gap Analysis: EPIC-20-S23 — Leave Balance Adjustment & Sick Leave registers (digital forms)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 3

**Description**
Build the two sample registers: a Leave Balance Adjustment Register (manual credits/debits with reason, approver, maker-checker) and a Sick Leave Register (auto-populated from sick leave with pay-band and certificate status), both configurable, filterable and exportable.

**Covers:** 20.32, 20.33
**Acceptance criteria count:** 4 · **Task count:** 5

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

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a balance adjustment, when made, then it requires reason + approver and appears in the adjustment register with before/after balance.
- [ ] Given a sick leave, when approved, then it auto-appears in the Sick Leave Register with pay band and certificate status.
- [ ] Given either register, when filtered/exported, then a CSV/PDF is produced and the action audit-logged.
- [ ] Given an adjustment, when applied, then maker-checker (preparer ≠ approver) is enforced.

## Implementation Tasks From Backlog

- [ ] Backend: `leave_balance_adjustment` schema + sick-register view
- [ ] Backend: export service (CSV/PDF) + maker-checker on adjustments
- [ ] Frontend: adjustment register + sick-leave register screens with filters
- [ ] Rules/Config: configurable columns/reason codes
- [ ] Tests: integration tests for adjustment maker-checker and register population

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
