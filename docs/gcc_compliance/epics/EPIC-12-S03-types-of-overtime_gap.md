# Gap Analysis: EPIC-12-S03 — Types of overtime

> Source epic: [EPIC-12-chapter-12-overtime-compliance.md](./EPIC-12-chapter-12-overtime-compliance.md)
> Parent epic: EPIC-12: Chapter 12 – Overtime Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 3
**User story:** Payroll Officer, **I want** distinct overtime types defined, **so that** each is approved, calculated and paid at the correct rate.

**Description**
Model OT types (normal weekday OT, night OT, rest-day/weekend OT, public-holiday OT, Ramadan OT) each with its own premium-rate basis and approval/calculation behaviour, used across request, calculation and payroll.

**Covers:** 12.6
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

- [ ] Given OT types, when configured, then each carries its rate basis and the conditions under which it applies.
- [ ] Given an OT event, when classified, then it is assigned exactly one type based on day/time/holiday context.
- [ ] Given a country, when types are applied, then country-specific type availability and rates are resolved.
- [ ] Given type config, when changed, then it is audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `ot_type` schema with rate basis and applicability conditions
- [ ] Backend: OT-type classification service (day/time/holiday context)
- [ ] Frontend: OT type configuration screen
- [ ] Rules/Config: per-country OT type/rate availability
- [ ] Tests: unit tests for correct type classification

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
