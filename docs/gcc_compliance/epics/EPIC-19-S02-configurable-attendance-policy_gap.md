# Gap Analysis: EPIC-19-S02 — Configurable attendance policy

> **⚠️ STALE — superseded 2026-06-17.** This story is SHIPPED. Full stack present (Prisma + service + API + dashboard + menu + Vitest). See [`docs/gcc_compliance/REMAINING-GAPS-2026-06-17.md`](../REMAINING-GAPS-2026-06-17.md) for the canonical remaining-gap list. This file is preserved as a 2026-06-16 audit snapshot only.

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5

**Description**
Build a versioned attendance policy object defining grace periods, late/early thresholds, deduction logic, missing-punch handling, absence treatment and regularization limits, mapped per country/entity/grade, with employee acknowledgement capture.

**Covers:** 19.5
**Acceptance criteria count:** 4 · **Task count:** 6

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- apps/web/src/**tests**/api/attendance-overtime-route.test.ts
- apps/web/src/**tests**/api/attendance-roster-route.test.ts
- apps/web/src/**tests**/api/attendance-shift-swap-route.test.ts
- apps/web/src/**tests**/api/attendance-time-capture-route.test.ts
- apps/web/src/**tests**/api/attendance-timesheets-route.test.ts
- apps/web/src/**tests**/e2e/attendance/overtime.e2e.test.ts

**Planning / prior analysis evidence**

- docs/implementation/ATTENDANCE-COMPLETION-PLANNING.md
- docs/implementation/ATTENDANCE-PERSISTENCE-SCHEMA-DESIGN.md
- docs/implementation/GUIDE-ATTENDANCE-COMPLETION.md

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given a policy, when configured, then grace minutes, late/early thresholds, monthly regularization caps and deduction rules are set per country/grade.
- [ ] Given a published policy, when an employee logs in, then acknowledgement is requested and recorded with timestamp.
- [ ] Given a policy change, when saved, then a new version is created and the old version retained.
- [ ] Given RBAC, when a non-authorized user attempts edit, then access is denied and logged.

## Implementation Tasks From Backlog

- [ ] Backend: `attendance_policy` schema (version, country, grace_minutes, late_threshold, regularization_cap, deduction_rule)
- [ ] Backend: policy versioning + acknowledgement service
- [ ] Frontend: policy authoring screen + employee acknowledgement prompt
- [ ] Rules/Config: per-country/grade policy defaults
- [ ] Alerts/Workflow: acknowledgement reminder notification
- [ ] Tests: unit + e2e for policy versioning and acknowledgement

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
