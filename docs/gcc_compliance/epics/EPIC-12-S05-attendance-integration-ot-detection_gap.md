# Gap Analysis: EPIC-12-S05 — Attendance integration & OT detection

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8

**Description**
Ingest attendance/punch data (EPIC-19), compute hours worked beyond schedule, classify into OT types, and reconcile detected OT against approved requests — paying only approved-and-worked hours, flagging worked-but-unapproved and approved-but-not-worked discrepancies.

**Covers:** 12.8
**Acceptance criteria count:** 5 · **Task count:** 5

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

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given attendance data, when processed, then hours beyond the scheduled shift are computed and classified into OT types by day/time context.
- [ ] Given approved OT requests, when matched, then payable OT = min(approved, actually worked) unless an exception is approved.
- [ ] Given worked-but-unapproved OT, when found, then it is flagged for exception approval and not auto-paid.
- [ ] Given approved-but-not-worked OT, when found, then it is dropped and logged.
- [ ] Given any detection, when computed, then it is audit-logged with source punches.

## Implementation Tasks From Backlog

- [ ] Backend: OT-detection service over attendance + request-matching engine
- [ ] Backend: discrepancy classification (unapproved/not-worked)
- [ ] Frontend: OT reconciliation view (detected vs approved vs payable)
- [ ] Rules/Config: schedule/shift definitions and tolerance
- [ ] Tests: integration tests for min(approved,worked) and discrepancy flagging

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
