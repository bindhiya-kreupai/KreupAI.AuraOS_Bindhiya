# Gap Analysis: EPIC-20-S09 — Leave carry-forward

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5

**Description**
Implement year-end/anniversary carry-forward with country caps (max carry days, expiry of carried balance, lapse vs encash treatment), producing adjustment entries and notices.

**Covers:** 20.16
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

- [ ] Given year-end, when carry-forward runs, then unused balance carries up to the country/policy cap.
- [ ] Given balance above the cap, when processed, then excess is lapsed or routed to encashment per policy.
- [ ] Given carried balance with expiry, when expiry passes, then it lapses and is audit-logged.
- [ ] Given carry-forward, when run, then employees are notified and ledger adjustments are recorded.

## Implementation Tasks From Backlog

- [ ] Backend: carry-forward job + ledger adjustment entries
- [ ] Backend: cap/expiry/lapse-vs-encash logic
- [ ] Frontend: carry-forward summary + notice
- [ ] Rules/Config: per-country carry cap, expiry, lapse/encash rule
- [ ] Alerts/Workflow: employee notification of carry/lapse
- [ ] Tests: unit tests for cap, expiry, lapse vs encash

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
