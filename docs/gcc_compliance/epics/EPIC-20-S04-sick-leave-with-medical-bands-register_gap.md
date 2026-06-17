# Gap Analysis: EPIC-20-S04 — Sick leave (with medical bands & register)

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 8

**Description**
Implement sick leave with country pay-band logic (e.g., UAE: first 15 days full pay, next 30 half pay, then unpaid within a year), medical-certificate requirement and validation, sensitive-data handling, and feed the Sample Sick Leave Register.

**Covers:** 20.6, 20.33 (feeds register)
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

- confirm/add tenant-scoped schema or config; add/wire service logic; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given a country, when sick leave is taken, then pay bands apply by cumulative days in the entitlement window (full/half/unpaid).
- [ ] Given a sick request beyond the no-certificate threshold, when submitted, then a medical certificate is mandatory.
- [ ] Given a medical certificate, when uploaded, then it is stored as sensitive data with restricted access.
- [ ] Given sick leave, when approved, then it posts to the Sick Leave Register and feeds payroll pay-tier, audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: sick-leave service with cumulative-band evaluation + `sick_leave_record`
- [ ] Backend: medical-certificate sensitive-document handling
- [ ] Frontend: sick-leave request + certificate upload screen
- [ ] Rules/Config: per-country sick pay bands and certificate thresholds
- [ ] Alerts/Workflow: HR review for long/abusive sick patterns
- [ ] Tests: unit tests for pay-band transitions; integration for register feed

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
