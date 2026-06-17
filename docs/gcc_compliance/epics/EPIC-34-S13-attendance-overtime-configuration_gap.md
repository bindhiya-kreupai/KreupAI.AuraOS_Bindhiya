# Gap Analysis: EPIC-34-S13 — Attendance & overtime configuration

> **🟠 TRUE GAP — confirmed 2026-06-17.** This story remains incomplete. See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the consolidated punch list, theme grouping, and pattern-reuse guidance. This file is the original 2026-06-16 audit snapshot.

> Source epic: [EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md](./EPIC-34-chapter-34-hrms-configuration-for-gcc-comp.md)
> Parent epic: EPIC-34: Chapter 34 – HRMS Configuration for GCC Compliance
> Module: platform
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Configure shifts/work schedules, working-hour caps, Ramadan reduced hours, late/missing-punch rules, regularization, and overtime types/multipliers (normal/rest-day/public-holiday rates per country) plus daily/weekly OT caps — consumed by attendance and overtime modules.

**Covers:** 34.15
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Likely Partial/Implemented

**Existing implementation evidence**

- packages/@aura/database/prisma/migrations/20260601100000_add_attendance_configuration_models/migration.sql
- apps/web/src/app/(modules)/attendance/overtime-management/ot-rules/page.tsx
- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/app/api/attendance/punch-rules/route.ts
- apps/web/src/app/dashboard/attendance/punch-rules/page.tsx
- apps/web/src/components/admin/TenantConfiguration.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-comp-off-management-route.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a country, when configured, then working-hour caps, Ramadan hours and overtime multipliers resolve from the rule engine.
- [ ] Given overtime rules, when set, then rest-day and public-holiday rates are differentiated per country statute.
- [ ] Given caps, when configured, then daily/weekly OT limits and breach flags are enforced.
- [ ] Given any change, when saved, then it is versioned and audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `work_schedule`, `attendance_rule`, `overtime_rule` schemas
- [ ] Backend: overtime-multiplier resolution per type/country
- [ ] Frontend: attendance & overtime configuration screen
- [ ] Rules/Config: per-country hours/Ramadan/OT multiplier rules
- [ ] Tests: unit tests for OT-rate and cap resolution

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
