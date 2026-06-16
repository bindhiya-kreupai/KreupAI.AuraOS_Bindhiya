# Gap Analysis: EPIC-12-S02 — Overtime eligibility

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Define eligibility by grade, role, employment type, exemption status (e.g., senior/managerial exemptions per labour law) and country, so OT requests and attendance-derived OT are only valid for eligible employees.

**Covers:** 12.5
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts
- apps/web/src/**tests**/services/attendance-overtime-dashboard.service.test.ts
- apps/web/src/app/(modules)/attendance/overtime-calculation/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/holiday-multipliers/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/multi-jurisdiction/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/ot-rules/page.tsx
- apps/web/src/app/(modules)/attendance/overtime-management/page.tsx

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config.

## Acceptance Criteria To Verify

- [ ] Given eligibility rules, when an OT request or detection occurs for an ineligible employee, then it is blocked/flagged with the reason.
- [ ] Given country exemptions, when applied, then exempt categories (e.g., certain senior roles) are excluded from OT pay per the rule engine.
- [ ] Given an employee, when their grade/role changes, then eligibility re-evaluates effective-dated.
- [ ] Given eligibility config, when changed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `ot_eligibility_rule` schema (grade/role/type/country/exempt flag)
- [ ] Backend: eligibility resolver used by request and detection flows
- [ ] Frontend: eligibility configuration screen
- [ ] Rules/Config: per-country exemption categories
- [ ] Tests: unit tests for ineligible-employee blocking

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
