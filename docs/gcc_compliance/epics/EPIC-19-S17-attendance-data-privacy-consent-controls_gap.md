# Gap Analysis: EPIC-19-S17 — Attendance data privacy & consent controls

> Source epic: [EPIC-19-chapter-19-attendance-compliance.md](./EPIC-19-chapter-19-attendance-compliance.md)
> Parent epic: EPIC-19: Chapter 19 – Attendance Compliance
> Module: Time & Attendance
> Generated: 2026-06-16

## Assessment Method

This story-level gap file compares the GCC compliance story against the current AuraOS implementation path inventory under `apps/`, `packages/@aura/`, and `services/`. Evidence is path-based triage and must be verified through code review and tests before the story is marked complete.

## Story Requirement

**Labels / priority / estimate:** `user-story`, `time-attendance` · **Priority:** Must · **Estimate:** 5
**User story:** Compliance Officer, **I want** privacy controls over biometric and location data, **so that** attendance complies with GCC data-protection laws.

**Description**
Implement consent capture for biometric/location processing, purpose limitation, retention/erasure schedules, RBAC-scoped access to sensitive attendance data, and encryption of biometric templates and geo-coordinates per UAE PDPL/KSA PDPL and similar.

**Covers:** 19.20
**Acceptance criteria count:** 4 · **Task count:** 5

## Current Status

**Status:** Partial

**Existing implementation evidence**

- apps/web/src/app/(modules)/attendance/shift-management/roster/page.tsx
- apps/web/src/components/attendance/ShiftRoster.tsx
- packages/@aura/database/src/seeds/25-attendance-time.seed.ts
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

- confirm/add tenant-scoped schema or config; add/wire service logic.

## Acceptance Criteria To Verify

- [ ] Given biometric/location capture, when enrolled, then explicit consent is recorded with purpose and version.
- [ ] Given sensitive attendance data, when accessed, then RBAC restricts to authorized roles and access is logged.
- [ ] Given the retention schedule, when reached, then biometric templates/location data are purged or anonymized.
- [ ] Given a data-subject erasure request, when valid, then the relevant attendance personal data is handled per policy.

## Implementation Tasks From Backlog

- [ ] Backend: `attendance_consent` schema + retention/erasure jobs
- [ ] Backend: field-level encryption for biometric/geo data; access-log service
- [ ] Frontend: consent screen + privacy admin console
- [ ] Rules/Config: per-country retention periods and lawful-basis settings
- [ ] Tests: unit/integration tests for consent, RBAC access, retention purge

## Next Verification

- Review the evidence files against the acceptance criteria.
- Confirm tenant isolation, RBAC, validation, audit trail, and country-rule behavior where applicable.
- Add or run targeted unit, integration, and E2E tests before marking this story complete.
