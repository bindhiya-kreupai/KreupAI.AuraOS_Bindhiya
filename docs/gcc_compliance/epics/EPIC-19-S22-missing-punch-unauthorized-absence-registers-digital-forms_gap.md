# Gap Analysis: EPIC-19-S22 — Missing Punch & Unauthorized Absence registers (digital forms)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 3

**Description**
Build the two sample registers as configurable digital registers auto-populated from missing-punch and absence detection, with status workflow (open/corrected/closed), filters and export, serving as the handbook's sample registers.

**Covers:** 19.28, 19.29
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts
- apps/web/src/**tests**/api/attendance-timesheets-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given missing-punch detection, when raised, then an entry auto-appears in the Missing Punch Register with employee, date, shift and status.
- [ ] Given unauthorized absence, when confirmed, then it auto-appears in the Unauthorized Absence Register with consecutive-day count.
- [ ] Given an entry, when resolved via regularization/leave, then its status updates and links to the resolving record.
- [ ] Given either register, when exported, then a CSV/PDF is produced and the action audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: register views over `punch_correction_request`/`absence_record` + status fields
- [ ] Backend: export service (CSV/PDF)
- [ ] Frontend: Missing Punch Register + Unauthorized Absence Register screens with filters
- [ ] Rules/Config: configurable columns/statuses
- [ ] Tests: integration tests for auto-population and status transitions

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
