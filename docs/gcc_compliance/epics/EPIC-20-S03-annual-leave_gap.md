# Gap Analysis: EPIC-20-S03 — Annual leave

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 8

**Description**
Implement annual leave with country entitlement (e.g., 30 calendar days/year after one year in UAE; pro-rata in first year), accrual link, holiday/weekend treatment within the leave span, minimum/maximum block rules and manager approval.

**Covers:** 20.5
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

- [ ] Given a country, when annual leave resolves, then the correct annual entitlement and accrual basis apply (e.g., UAE 30 days/yr, pro-rata for partial year).
- [ ] Given a leave span overlapping a public holiday/weekly off, when calculated, then those days are treated per country rule (excluded or included).
- [ ] Given insufficient balance, when requested, then the system blocks or routes to unpaid/advance per policy.
- [ ] Given approval, when granted, then the balance is deducted and the request is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: annual-leave request/balance service over `leave_type`
- [ ] Backend: holiday/weekend-in-span calculation per country
- [ ] Frontend: annual-leave request + balance screen
- [ ] Rules/Config: per-country annual entitlement, pro-rata and holiday-in-span rule
- [ ] Alerts/Workflow: manager approval routing
- [ ] Tests: unit tests for entitlement, pro-rata and holiday-in-span

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
