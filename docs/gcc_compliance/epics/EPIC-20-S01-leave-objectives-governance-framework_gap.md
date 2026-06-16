# Gap Analysis: EPIC-20-S01 — Leave objectives & governance framework

> Source epic: [EPIC-20-chapter-20-leave-management-compliance.md](./EPIC-20-chapter-20-leave-management-compliance.md)
> Parent epic: EPIC-20: Chapter 20 – Leave Management Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `leave` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** a configurable leave governance framework per country, **so that** leave operates within statutory rules and defined controls.

**Description**
Establish the governance baseline: leave-policy ownership, approval roles, statutory minimums per country, control points and the stated objectives of leave compliance. This is the rule foundation all leave-type stories consume.

**Covers:** 20.1, 20.2, 20.3
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

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given each GCC country, when configured, then statutory leave minimums and control roles are stored and versioned.
- [ ] Given the governance model, when set, then approval roles and maker-checker control points are mandatory.
- [ ] Given a legal entity, when leave rules resolve, then the rule engine returns the correct country/entity configuration.
- [ ] Given any framework change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `leave_governance` + `leave_rule_set` schemas (country, owner_role, statutory_min)
- [ ] Backend: governance control-point + rule-resolution service
- [ ] Frontend: leave governance configuration screen
- [ ] Rules/Config: per-country statutory minimums and approver roles
- [ ] Tests: unit tests for rule resolution per country/entity

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
