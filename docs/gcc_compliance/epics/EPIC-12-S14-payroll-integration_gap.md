# Gap Analysis: EPIC-12-S14 — Payroll integration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `payroll` · **Priority:** Must · **Estimate:** 5
**User story:** Payroll Officer, **I want** approved, calculated OT delivered to payroll as a clean input, **so that** OT is paid accurately within the payroll period.

**Description**
Hand off finalized OT (approved, reconciled, non-fraud-flagged) to the payroll input collection (EPIC-10) per period, by employee, OT type and amount, respecting the payroll cut-off, with locked OT figures that cannot change after payroll lock.

**Covers:** 12.18
**Acceptance criteria count:** 4 · **Task count:** 5

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

- [ ] Given a payroll period, when OT is finalized before cut-off, then approved OT hours/amounts feed payroll inputs by employee and type.
- [ ] Given fraud-flagged or unreconciled OT, when present, then it is excluded from the payroll feed until resolved.
- [ ] Given the payroll cut-off, when passed, then OT for that period is frozen and late OT routes to the next period/off-cycle.
- [ ] Given the handoff, when completed, then OT figures are locked and audit-logged against the payroll run.

## Implementation Tasks From Backlog

- [ ] Backend: OT-to-payroll feed service keyed to payroll period/cut-off
- [ ] Backend: exclusion of unresolved/flagged OT + freeze on lock
- [ ] Frontend: OT-to-payroll handoff summary
- [ ] Alerts/Workflow: late-OT routing to next period
- [ ] Tests: integration tests for cut-off freeze and flagged-OT exclusion

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
