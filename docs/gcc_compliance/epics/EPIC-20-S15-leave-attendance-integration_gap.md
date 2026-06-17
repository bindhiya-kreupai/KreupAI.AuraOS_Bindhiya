# Gap Analysis: EPIC-20-S15 — Leave ↔ attendance integration

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5

**Description**
Publish approved-leave events to attendance (EPIC-19) to suppress absence/late flags, support half-day leave against partial attendance, and accept absence→leave conversion requests (e.g., backdated sick leave).

**Covers:** 20.20
**Acceptance criteria count:** 4 · **Task count:** 5

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
- docs/implementation/LEAVE-ENGINE-PLANNING.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given approved leave, when published, then attendance suppresses absence/late for those dates.
- [ ] Given a half-day leave, when applied, then only the working half-day is attendance-evaluated.
- [ ] Given an unauthorized absence, when covered by approved leave, then it reclassifies and any LOP reverses.
- [ ] Given any integration action, when applied, then balances stay consistent and it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: publish `leave.approved`/`leave.cancelled`; reconciliation handlers
- [ ] Backend: absence→leave conversion with LOP reversal
- [ ] Frontend: combined leave+attendance day view
- [ ] Rules/Config: half-day and conversion rules per country
- [ ] Tests: integration tests for suppression, half-day, conversion

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
