# Gap Analysis: EPIC-20-S13 — Compensatory off (comp-off)

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Should · **Estimate:** 5

**Description**
Implement comp-off accrual from approved holiday/rest-day work (from EPIC-19/EPIC-21), with validity/expiry, conversion-to-pay option, and request/approval workflow.

**Covers:** 20.14
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/attendance-comp-off-management-route.test.ts
- apps/web/src/**tests**/api/attendance-comp-off-route.test.ts
- apps/web/src/**tests**/services/attendance-comp-off-dashboard.service.test.ts
- apps/web/src/**tests**/services/attendance-comp-off-management-dashboard.service.test.ts
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/app/api/attendance/comp-off-management/route.ts
- apps/web/src/app/api/attendance/comp-off/route.ts
- apps/web/src/app/dashboard/attendance/comp-off-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given approved holiday/rest-day work, when received, then a comp-off credit is created with validity.
- [ ] Given a comp-off request, when within validity, then it is approvable and deducts the credit.
- [ ] Given an expiring comp-off, when validity passes, then it lapses or converts to pay per policy.
- [ ] Given comp-off activity, when posted, then it is audit-logged and reflected in balance.

## Implementation Tasks From Backlog

- [ ] Backend: `comp_off_credit` schema + accrual from holiday-work events
- [ ] Backend: validity/expiry + convert-to-pay logic
- [ ] Frontend: comp-off request + balance screen
- [ ] Rules/Config: per-country comp-off validity and conversion rule
- [ ] Alerts/Workflow: expiry reminder + approval routing
- [ ] Tests: integration tests for accrual, validity, conversion

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
