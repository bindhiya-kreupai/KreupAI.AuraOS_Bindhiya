# Gap Analysis: EPIC-21-S02 — Annual holiday calendar governance & country overview

> Source epic: [EPIC-21-chapter-21-public-holidays-and-religious-h.md](./EPIC-21-chapter-21-public-holidays-and-religious-h.md)
> Parent epic: EPIC-21: Chapter 21 – Public Holidays and Religious Holidays Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 8

**Description**
Build the annual holiday calendar with per-country/entity/site scoping, the country-wise public-holiday overview (national days, Islamic New Year, Prophet's Birthday, Eid Al-Fitr, Eid Al-Adha, Arafat Day, Commemoration/Martyrs' days etc.), draft→review→approve→publish governance, and effective-dated versions.

**Covers:** 21.5, 21.6
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

## Gap To Close

- confirm/add tenant-scoped schema or config; add/wire service logic; externalize country-specific rules into versioned config.

## Acceptance Criteria To Verify

- [ ] Given a year and country, when a calendar is built, then the standard public holidays for that country are seeded and editable.
- [ ] Given an entity/site, when a calendar is scoped, then it can override the country default (e.g., emirate-specific).
- [ ] Given a calendar, when published, then it follows draft→review→approve→publish with maker-checker.
- [ ] Given a published calendar, when changed, then a new version is created and prior version retained, audit-logged.

## Implementation Tasks From Backlog

- [ ] Backend: `holiday_calendar`, `holiday` schemas (country, entity_id, site_id, date, type, status, version)
- [ ] Backend: country-overview seeding + publish workflow
- [ ] Frontend: calendar builder + per-country/entity/site editor
- [ ] Rules/Config: per-country standard holiday set
- [ ] Alerts/Workflow: approve/publish maker-checker workflow
- [ ] Tests: integration tests for seeding, scoping override, publish/versioning

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
