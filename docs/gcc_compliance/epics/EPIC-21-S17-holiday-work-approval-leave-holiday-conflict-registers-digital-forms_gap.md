# Gap Analysis: EPIC-21-S17 — Holiday Work Approval & Leave-Holiday Conflict registers (digital forms)

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Should · **Estimate:** 3

**Description**
Build the two sample registers: a Holiday Work Approval Register (auto-populated from approved holiday-work requests with employee, holiday, shift, treatment) and a Leave-Holiday Conflict Register (auto-populated from overlap detection with resolution status), both configurable, filterable and exportable.

**Covers:** 21.25, 21.26
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/app/api/attendance/approval-workflow/route.ts
- apps/web/src/app/dashboard/attendance/approval-workflow/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; verify workflow approvals and audit events; verify evidence capture, retention, and immutable audit.

## Acceptance Criteria To Verify

- [ ] Given an approved holiday-work request, when granted, then it auto-appears in the Holiday Work Approval Register with treatment (premium/lieu).
- [ ] Given a leave-holiday overlap, when detected, then it auto-appears in the Conflict Register with resolution status.
- [ ] Given a conflict, when resolved (recalculated/overridden), then its status updates and links to the resolving action.
- [ ] Given either register, when filtered/exported, then a CSV/PDF is produced and the action audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: register views over `holiday_work_request` + overlap records; status fields
- [ ] Backend: export service (CSV/PDF)
- [ ] Frontend: Holiday Work Approval + Leave-Holiday Conflict register screens with filters
- [ ] Rules/Config: configurable columns/statuses
- [ ] Tests: integration tests for auto-population and status transitions

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
